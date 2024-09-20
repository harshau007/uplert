package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

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

func main() {
	db, err := setupDatabase()
	if err != nil {
		log.Fatalf("Failed to set up database: %v", err)
	}
	defer db.Close()

	// Check for new data in RabbitMQ queue and process it
	processQueueData(db)

	// Start monitoring websites from the database
	startMonitoringFromDB(db)
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

func processQueueData(db *sql.DB) {
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
		log.Fatalf("Failed to declare queue: %v", err)
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
		log.Fatalf("Failed to register a consumer: %v", err)
	}

	log.Println("Checking for new data in RabbitMQ queue...")

	// Use a timeout to avoid blocking indefinitely if there are no messages
	timeout := time.After(5 * time.Second)
	for {
		select {
		case msg, ok := <-msgs:
			if !ok {
				return
			}
			var website Website
			if err := json.Unmarshal(msg.Body, &website); err != nil {
				log.Printf("Failed to unmarshal message: %v", err)
				msg.Nack(false, false)
				continue
			}

			interval, err := strconv.Atoi(website.Interval)
			if err != nil {
				log.Printf("Invalid interval format for site %s: %v", website.URL, err)
				msg.Nack(false, false)
				continue
			}

			updateOrInsertWebsite(db, website.URL, interval)
			msg.Ack(false)
		case <-timeout:
			log.Println("No new messages in queue. Proceeding with monitoring.")
			return
		}
	}
}

func updateOrInsertWebsite(db *sql.DB, url string, interval int) {
	_, err := db.Exec("INSERT OR REPLACE INTO monitored_sites (url, interval) VALUES (?, ?)", url, interval)
	if err != nil {
		log.Printf("Failed to update/insert website %s: %v", url, err)
	} else {
		log.Printf("Updated/inserted website: %s with interval %d seconds", url, interval)
	}
}

func startMonitoringFromDB(db *sql.DB) {
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
		go monitorWebsite(url, interval)
	}

	// Keep the main goroutine running
	select {}
}

func monitorWebsite(url string, interval int) {
	for {
		startTime := time.Now()
		resp, err := http.Get(url)
		responseTime := time.Since(startTime)

		var status string
		if err != nil {
			status = resp.Status
			resp.Body.Close()
			log.Printf("Successfully monitored %s. Status: %s, Response time: %v", url, status, responseTime)
		}

		status = resp.Status
		resp.Body.Close()
		log.Printf("Successfully monitored %s. Status: %s, Response time: %v", url, status, responseTime)

		result := MonitoringResult{
			URL:          url,
			Status:       status,
			ResponseTime: responseTime,
		}

		publishResultToRabbitMQ(result)

		time.Sleep(time.Duration(interval) * time.Second)
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
