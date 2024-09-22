package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"

	"net/url"

	_ "github.com/mattn/go-sqlite3"
	"github.com/streadway/amqp"
)

var rabbitmqURL = "amqp://guest:guest@localhost:5672/"
var dbFileName = "monitoring.db"

type Website struct {
	URL      string `json:"url"`
	Interval string `json:"interval"`
}

type MonitoringResult struct {
	URL          string        `json:"url"`
	Status       string        `json:"status"`
	ResponseTime time.Duration `json:"response_time"`
}

var (
	db         *sql.DB
	monitorMap sync.Map
)

func main() {
	var err error
	db, err = setupDatabase()
	if err != nil {
		log.Fatalf("Failed to set up database: %v", err)
	}
	defer db.Close()

	// Start processing queue data in a separate goroutine
	go processQueueData()

	// Start monitoring websites from the database
	startMonitoringFromDB()

	// Keep the main goroutine running
	select {}
}

func setupDatabase() (*sql.DB, error) {
	db, err := sql.Open("sqlite3", dbFileName)
	if err != nil {
		return nil, fmt.Errorf("failed to open SQLite DB: %v", err)
	}

	createTableQuery := `CREATE TABLE IF NOT EXISTS monitored_sites (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		url TEXT UNIQUE,
		interval INTEGER
	);`
	_, err = db.Exec(createTableQuery)
	if err != nil {
		return nil, fmt.Errorf("failed to create table: %v", err)
	}

	return db, nil
}

func processQueueData() {
	for {
		conn, ch := connectToRabbitMQ()
		defer conn.Close()
		defer ch.Close()

		q, err := ch.QueueDeclare(
			"website_monitoring_requests",
			true,
			false,
			false,
			false,
			nil,
		)
		if err != nil {
			log.Printf("Failed to declare queue: %v", err)
			time.Sleep(5 * time.Second)
			continue
		}

		msgs, err := ch.Consume(
			q.Name,
			"",
			false,
			false,
			false,
			false,
			nil,
		)
		if err != nil {
			log.Printf("Failed to register a consumer: %v", err)
			time.Sleep(5 * time.Second)
			continue
		}

		log.Println("Waiting for messages in RabbitMQ queue...")

		for msg := range msgs {
			var website Website
			if err := json.Unmarshal(msg.Body, &website); err != nil {
				log.Printf("Failed to unmarshal message: %v", err)
				msg.Nack(false, false)
				continue
			}

			decodedURL, err := url.QueryUnescape(website.URL)
			if err != nil {
				log.Printf("Failed to decode URL: %v", err)
				msg.Nack(false, false)
				continue
			}
			website.URL = decodedURL

			if website.Interval == "delete" {
				deleteWebsite(website.URL)
			} else {
				interval, err := strconv.Atoi(website.Interval)
				if err != nil {
					log.Printf("Invalid interval format for site %s: %v", website.URL, err)
					msg.Nack(false, false)
					continue
				}
				updateOrInsertWebsite(website.URL, interval)
			}
			msg.Ack(false)
		}

		log.Println("RabbitMQ connection closed. Reconnecting...")
		time.Sleep(5 * time.Second)
	}
}

func updateOrInsertWebsite(url string, interval int) {
	_, err := db.Exec("INSERT OR REPLACE INTO monitored_sites (url, interval) VALUES (?, ?)", url, interval)
	if err != nil {
		log.Printf("Failed to update/insert website %s: %v", url, err)
	} else {
		log.Printf("Updated/inserted website: %s with interval %d seconds", url, interval)
		startMonitoringWebsite(url, interval)
	}
}

func startMonitoringFromDB() {
	rows, err := db.Query("SELECT url, interval FROM monitored_sites")
	if err != nil {
		log.Fatalf("Failed to query monitored sites: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var url string
		var interval int
		if err := rows.Scan(&url, &interval); err != nil {
			log.Printf("Error scanning row: %v", err)
			continue
		}
		startMonitoringWebsite(url, interval)
	}
}

func startMonitoringWebsite(url string, interval int) {
	if _, exists := monitorMap.LoadOrStore(url, true); !exists {
		go monitorWebsite(context.Background(), url, interval)
	}
}

func monitorWebsite(ctx context.Context, url string, interval int) {
	for {
		select {
		case <-ctx.Done():
			return
		default:
			startTime := time.Now()
			resp, err := http.Get(url)
			responseTime := time.Since(startTime)

			var status string
			if err != nil {
				status = "Error: " + err.Error()
			} else {
				status = resp.Status
				resp.Body.Close()
			}

			log.Printf("Monitored %s. Status: %s, Response time: %v", url, status, responseTime)

			result := MonitoringResult{
				URL:          url,
				Status:       status,
				ResponseTime: responseTime,
			}

			publishResultToRabbitMQ(result)

			time.Sleep(time.Duration(interval) * time.Second)
		}
	}
}

func publishResultToRabbitMQ(result MonitoringResult) {
	conn, ch := connectToRabbitMQ()
	defer conn.Close()
	defer ch.Close()

	body, err := json.Marshal(result)
	if err != nil {
		log.Printf("Failed to marshal result: %v", err)
		return
	}

	err = ch.Publish(
		"",
		"website_monitoring_results",
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		},
	)
	if err != nil {
		log.Printf("Failed to publish result: %v", err)
	}
}

func connectToRabbitMQ() (*amqp.Connection, *amqp.Channel) {
	conn, err := amqp.Dial(rabbitmqURL)
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Failed to open a channel: %v", err)
	}

	return conn, ch
}

func deleteWebsite(urlLink string) {
	decodedURL, err := url.QueryUnescape(urlLink)
	if err != nil {
		log.Printf("Failed to decode URL: %v", err)
		return
	}

	result, err := db.Exec("DELETE FROM monitored_sites WHERE url = ?", decodedURL)
	if err != nil {
		log.Printf("Failed to delete website %s: %v", decodedURL, err)
	} else {
		rowsAffected, _ := result.RowsAffected()
		if rowsAffected > 0 {
			log.Printf("Deleted website: %s", decodedURL)
			stopMonitoringWebsite(decodedURL)
		} else {
			log.Printf("Website %s not found in database", decodedURL)
		}
	}
}

func stopMonitoringWebsite(url string) {
	if cancelFunc, ok := monitorMap.Load(url); ok {
		if cf, ok := cancelFunc.(context.CancelFunc); ok {
			cf()
			monitorMap.Delete(url)
		}
	}
}
