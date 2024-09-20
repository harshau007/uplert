package main

import (
	"encoding/json"
	"log"
	"time"

	"github.com/streadway/amqp"
)

const (
	rabbitmqURL            = "amqp://guest:guest@localhost:5672/"
	requestQueueName       = "website_monitoring_requests"
	resultQueueName        = "website_monitoring_results"
	publishIntervalSeconds = 30
	consumeIntervalSeconds = 5
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

func main() {
	// Start the publisher and consumer in separate goroutines
	go publishRequests()
	go consumeResults()

	// Keep the main goroutine running
	select {}
}

func publishRequests() {
	for {
		conn, ch := connectToRabbitMQ()
		defer conn.Close()
		defer ch.Close()

		websites := []WebsiteRequest{
			{URL: "https://www.google.com", Interval: "10"},
			{URL: "https://harshupadhyay1.vercel.app", Interval: "5"},
		}

		for _, website := range websites {
			body, err := json.Marshal(website)
			if err != nil {
				log.Printf("Failed to marshal website request: %v", err)
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
				log.Printf("Published request for %s", website.URL)
			}
		}

		time.Sleep(publishIntervalSeconds * time.Second)
	}
}

func consumeResults() {
	for {
		conn, ch := connectToRabbitMQ()
		defer conn.Close()
		defer ch.Close()

		q, err := ch.QueueDeclare(
			resultQueueName,
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
			true,
			false,
			false,
			false,
			nil,
		)
		if err != nil {
			log.Printf("Failed to register a consumer: %v", err)
			time.Sleep(consumeIntervalSeconds * time.Second)
			continue
		}

		for msg := range msgs {
			var result MonitoringResult
			if err := json.Unmarshal(msg.Body, &result); err != nil {
				log.Printf("Failed to unmarshal result: %v", err)
				continue
			}
			log.Printf("Received result: URL: %s, Status: %s, Response Time: %v",
				result.URL, result.Status, result.ResponseTime)
		}
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
