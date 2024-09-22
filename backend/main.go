package main

import (
	"bufio"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/url"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
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
	URL      string `json:"url" validate:"required,url"`
	Interval string `json:"interval" validate:"required,oneof=5 10 15 30 60 delete"`
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

	app.Use(cors.New())

	app.Post("/get", handleSSEGet)
	app.Get("/sse", handleSSEResults)
	app.Delete("/get/:url", handleDeleteMonitor)

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
		url TEXT NOT NULL UNIQUE,
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

func handleSSEGet(c *fiber.Ctx) error {
	var request WebsiteRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse request body",
		})
	}

	// Validate request
	if err := validateWebsiteRequest(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Check if URL exists and update or insert accordingly
	var existingInterval string
	err := db.QueryRow("SELECT interval FROM website_requests WHERE url = ?", request.URL).Scan(&existingInterval)
	if err == sql.ErrNoRows {
		// URL doesn't exist, insert new record
		_, err = db.Exec("INSERT INTO website_requests (url, interval) VALUES (?, ?)", request.URL, request.Interval)
	} else if err == nil {
		// URL exists, update interval
		_, err = db.Exec("UPDATE website_requests SET interval = ? WHERE url = ?", request.Interval, request.URL)
	}

	if err != nil {
		log.Printf("Failed to upsert into database: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to process request",
		})
	}

	// Send to RabbitMQ
	body, err := json.Marshal(request)
	if err != nil {
		log.Printf("Failed to marshal request: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to process request",
		})
	}

	err = rabbitMQChan.Publish(
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
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to process request",
		})
	}

	log.Printf("Published request for %s", request.URL)
	return c.SendStatus(fiber.StatusOK)
}

func validateWebsiteRequest(request *WebsiteRequest) error {
	if request.URL == "" {
		return errors.New("URL is required")
	}
	if _, err := url.ParseRequestURI(request.URL); err != nil {
		return errors.New("Invalid URL format")
	}
	if request.Interval != "delete" {
		interval, err := strconv.Atoi(request.Interval)
		if err != nil || (interval != 5 && interval != 10 && interval != 15 && interval != 30 && interval != 60) {
			return errors.New("Invalid interval. Must be 5, 10, 15, 30, 60, or 'delete'")
		}
	}
	return nil
}

func handleSSEResults(c *fiber.Ctx) error {
	c.Set("Content-Type", "text/event-stream")
	c.Set("Cache-Control", "no-cache")
	c.Set("Connection", "keep-alive")
	c.Set("Transfer-Encoding", "chunked")

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
		return c.SendStatus(fiber.StatusInternalServerError)
	}

	c.Context().SetBodyStreamWriter(func(w *bufio.Writer) {
		for msg := range msgs {
			var result MonitoringResult
			if err := json.Unmarshal(msg.Body, &result); err != nil {
				log.Printf("Failed to unmarshal result: %v", err)
				continue
			}

			resultJSON, err := json.Marshal(result)
			if err != nil {
				log.Printf("Failed to marshal result: %v", err)
				continue
			}

			if _, err := fmt.Fprintf(w, "data: %s\n\n", resultJSON); err != nil {
				if err == io.ErrClosedPipe {
					log.Println("Client disconnected")
					return
				}
				log.Printf("Failed to write SSE data: %v", err)
				return
			}
			if err := w.Flush(); err != nil {
				if err == io.ErrClosedPipe {
					log.Println("Client disconnected")
					return
				}
				log.Printf("Failed to flush SSE data: %v", err)
				return
			}
		}
	})

	return nil
}

func handleDeleteMonitor(c *fiber.Ctx) error {
	encodedURL := c.Params("url")
	decodedURL, err := url.QueryUnescape(encodedURL)
	if err != nil {
		log.Printf("Failed to decode URL: %v", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid URL format",
		})
	}

	log.Printf("Received delete request for URL: %s", decodedURL)

	// Delete from database
	result, err := db.Exec("DELETE FROM website_requests WHERE url = ?", decodedURL)
	if err != nil {
		log.Printf("Failed to delete from database: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete monitor",
		})
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Printf("Failed to get rows affected: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete monitor",
		})
	}

	if rowsAffected == 0 {
		log.Printf("URL %s not found in database", decodedURL)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "URL not found",
		})
	}

	// Send delete message to RabbitMQ
	deleteMsg := WebsiteRequest{URL: decodedURL, Interval: "delete"}
	body, err := json.Marshal(deleteMsg)
	if err != nil {
		log.Printf("Failed to marshal delete message: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete monitor",
		})
	}

	err = rabbitMQChan.Publish(
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
		log.Printf("Failed to publish delete message: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete monitor",
		})
	}

	log.Printf("Successfully deleted and sent delete message for URL: %s", decodedURL)
	return c.SendStatus(fiber.StatusOK)
}
