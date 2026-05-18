package email

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/resend/resend-go/v2"
)

type EmailService struct {
	client           *resend.Client
	from             string
	renderServiceURL string
	httpClient       *http.Client
}

func New(apiKey string) *EmailService {
	renderURL := os.Getenv("EMAIL_RENDER_URL")
	if renderURL == "" {
		renderURL = "http://localhost:3001"
	}

	return &EmailService{
		client:           resend.NewClient(apiKey),
		from:             "onboarding@resend.dev",
		renderServiceURL: renderURL,
		httpClient:       &http.Client{Timeout: 5 * time.Second},
	}
}

func (e *EmailService) renderTemplate(template string, props map[string]any) (string, error) {
	body, _ := json.Marshal(map[string]any{
		"template": template,
		"props":    props,
	})
	resp, err := e.httpClient.Post(
		e.renderServiceURL+"/render",
		"application/json",
		bytes.NewReader(body),
	)
	if err != nil {
		return "", fmt.Errorf("render service unreachable: %w", err)
	}
	defer resp.Body.Close()

	raw, _ := io.ReadAll(resp.Body)
	var result struct {
		HTML  string `json:"html"`
		Error string `json:"error"`
	}
	if err := json.Unmarshal(raw, &result); err != nil {
		return "", fmt.Errorf("bad response: %w", err)
	}
	if result.Error != "" {
		return "", fmt.Errorf("render error: %s", result.Error)
	}
	return result.HTML, nil
}

func (e *EmailService) SendWelcome(toEmail, username string) {
	appURL := os.Getenv("FRONTEND_URL")
	if appURL == "" {
		appURL = "http://localhost:3000"
	}
	html, err := e.renderTemplate("welcome", map[string]any{
		"username": username,
		"appUrl":   appURL,
	})
	if err != nil {
		log.Printf("render welcome failed: %v", err)
		return
	}
	_, err = e.client.Emails.Send(&resend.SendEmailRequest{
		From:    e.from,
		To:      []string{toEmail},
		Subject: "Welcome to Epsilon!",
		Html:    html,
	})
	if err != nil {
		log.Printf("send welcome failed to %s: %v", toEmail, err)
	}
}

func (e *EmailService) SendPasswordReset(toEmail, token, frontendURL string) {
	resetURL := fmt.Sprintf("%s/reset-password?token=%s", frontendURL, token)
	html, err := e.renderTemplate("reset-password", map[string]any{
		"resetUrl": resetURL,
		"username": "", // optional, pass if available
	})
	if err != nil {
		log.Printf("render reset-password failed: %v", err)
		return
	}
	_, err = e.client.Emails.Send(&resend.SendEmailRequest{
		From:    e.from,
		To:      []string{toEmail},
		Subject: "Reset your Epsilon password",
		Html:    html,
	})
	if err != nil {
		log.Printf("send reset-password failed to %s: %v", toEmail, err)
	}
}
