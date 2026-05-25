package service

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

const maxUploadBytes int64 = 5 << 20 // 5 MiB per image

type UploadService struct {
	client    *s3.Client
	bucket    string
	region    string
	presigner *s3.PresignClient
}

func NewUploadService(bucket, region string) (*UploadService, error) {
	if bucket == "" || region == "" {
		return nil, fmt.Errorf("S3_BUCKET and AWS_REGION are required")
	}

	cfg, err := config.LoadDefaultConfig(context.Background(),
		config.WithRegion(region),
	)
	if err != nil {
		return nil, err
	}

	client := s3.NewFromConfig(cfg)

	return &UploadService{
		client:    client,
		bucket:    bucket,
		region:    region,
		presigner: s3.NewPresignClient(client),
	}, nil
}

type PresignResult struct {
	UploadURL string `json:"uploadUrl"`
	FileURL   string `json:"fileUrl"`
	Key       string `json:"key"`
}

func (s *UploadService) GeneratePresignedURL(ctx context.Context, key, contentType string, contentLength int64) (*PresignResult, error) {
	if strings.Contains(key, "..") {
		return nil, fmt.Errorf("invalid key")
	}
	if contentLength <= 0 || contentLength > maxUploadBytes {
		return nil, fmt.Errorf("invalid content length")
	}

	req, err := s.presigner.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(s.bucket),
		Key:           aws.String(key),
		ContentType:   aws.String(contentType),
		ContentLength: aws.Int64(contentLength),
	}, s3.WithPresignExpires(15*time.Minute))
	if err != nil {
		return nil, fmt.Errorf("failed to presign: %w", err)
	}

	fileURL := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", s.bucket, s.region, key)

	return &PresignResult{
		UploadURL: req.URL,
		FileURL:   fileURL,
		Key:       key,
	}, nil
}

// AllowedObjectURL returns true if url is an HTTPS object URL for this bucket.
func (s *UploadService) AllowedObjectURL(url string) bool {
	if url == "" {
		return true
	}
	prefix := fmt.Sprintf("https://%s.s3.", s.bucket)
	return strings.HasPrefix(url, prefix) || strings.HasPrefix(url, fmt.Sprintf("https://%s.s3.amazonaws.com/", s.bucket))
}
