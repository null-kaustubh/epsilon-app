package email

import (
	"fmt"
	"log"

	"github.com/resend/resend-go/v2"
)

type EmailService struct {
	client *resend.Client
	from   string
}

func New(apiKey string) *EmailService {
	return &EmailService{
		client: resend.NewClient(apiKey),
		from:   "onboarding@resend.dev",
	}
}

func (e *EmailService) SendWelcome(toEmail, username string) {
	_, err := e.client.Emails.Send(&resend.SendEmailRequest{
		From:    e.from,
		To:      []string{toEmail},
		Subject: "Welcome to Epsilon!",
		Html:    fmt.Sprintf("<h2>Hey %s, welcome to Epsilon!</h2><p>Your account is ready.</p>", username),
	})
	if err != nil {
		log.Printf("failed to send welcome email to %s: %v", toEmail, err)
	}

}

func (e *EmailService) SendPasswordReset(toEmail, token, appURL string) {
	link := fmt.Sprintf("%s/reset-password?token=%s", appURL, token)
	_, err := e.client.Emails.Send(&resend.SendEmailRequest{
		From:    e.from,
		To:      []string{toEmail},
		Subject: "Reset your Epsilon password",
		Html:    fmt.Sprintf("<h2>Reset your password</h2><p><a href='%s'>Click here to reset</a></p><p>Link expires in 1 hour. If you didn't request this, ignore this email.</p>", link),
	})
	if err != nil {
		log.Printf("failed to send reset password email to %s: %v", toEmail, err)
	}
}
