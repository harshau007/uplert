package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"time"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	_ "github.com/mattn/go-sqlite3"
	"github.com/streadway/amqp"
)

const (
	rabbitmqURL      = "amqp://guest:guest@localhost:5672/"
	requestQueueName = "website_monitoring_requests"
	resultQueueName  = "website_monitoring_results"
	dbPath           = "./website_monitoring.db"
)

type WebsiteRequest struct {
	URL      string `json:"url"`
	Interval string `json:"interval"`
}

type MonitoringResult struct {
	URL          string        `json:"url"`
	Status       string        `json:"status"`
	ResponseTime time.Duration `json:"response_time"`
}

var (
	db           *sql.DB
	rabbitMQConn *amqp.Connection
	rabbitMQChan *amqp.Channel
)

func main() {
	initDB()
	initRabbitMQ()
	defer db.Close()
	defer rabbitMQConn.Close()
	defer rabbitMQChan.Close()

	app := fiber.New()

	app.Get("/ws/get", websocket.New(handleWebsocketGet))
	app.Get("/ws", websocket.New(handleWebsocketResults))

	log.Fatal(app.Listen(":3001"))
}

func initDB() {
	var err error
	db, err = sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS website_requests (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		url TEXT NOT NULL,
		interval TEXT NOT NULL
	)`)
	if err != nil {
		log.Fatalf("Failed to create table: %v", err)
	}
}

func initRabbitMQ() {
	var err error
	rabbitMQConn, err = amqp.Dial(rabbitmqURL)
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}

	rabbitMQChan, err = rabbitMQConn.Channel()
	if err != nil {
		log.Fatalf("Failed to open a channel: %v", err)
	}

	_, err = rabbitMQChan.QueueDeclare(
		requestQueueName,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Failed to declare request queue: %v", err)
	}

	_, err = rabbitMQChan.QueueDeclare(
		resultQueueName,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Failed to declare result queue: %v", err)
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

func handleWebsocketGet(c *websocket.Conn) {
	var (
		msg []byte
		err error
	)
	for {
		conn, ch := connectToRabbitMQ()
		defer conn.Close()
		defer ch.Close()
		if _, msg, err = c.ReadMessage(); err != nil {
			log.Println("read:", err)
			break
		}

		var request WebsiteRequest
		if err := json.Unmarshal(msg, &request); err != nil {
			log.Printf("Failed to unmarshal request: %v", err)
			continue
		}

		// Store in SQLite
		_, err = db.Exec("INSERT INTO website_requests (url, interval) VALUES (?, ?)", request.URL, request.Interval)
		if err != nil {
			log.Printf("Failed to insert into database: %v", err)
		}

		// Send to RabbitMQ
		body, err := json.Marshal(request)
		if err != nil {
			log.Printf("Failed to marshal request: %v", err)
			continue
		}

		err = ch.Publish(
			"",
			requestQueueName,
			false,
			false,
			amqp.Publishing{
				ContentType: "application/json",
				Body:        body,
			},
		)
		if err != nil {
			log.Printf("Failed to publish request: %v", err)
		} else {
			log.Printf("Published request for %s", request.URL)
		}
	}
}

func handleWebsocketResults(c *websocket.Conn) {
	msgs, err := rabbitMQChan.Consume(
		resultQueueName,
		"",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Printf("Failed to register a consumer: %v", err)
		return
	}

	for msg := range msgs {
		var result MonitoringResult
		if err := json.Unmarshal(msg.Body, &result); err != nil {
			log.Printf("Failed to unmarshal result: %v", err)
			continue
		}

		if err := c.WriteJSON(result); err != nil {
			log.Printf("Failed to send result over WebSocket: %v", err)
			break
		}
	}
}
