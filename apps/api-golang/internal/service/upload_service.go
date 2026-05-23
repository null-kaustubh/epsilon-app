package service

import (
	"context"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type UploadService struct {
	client    *s3.Client
	bucket    string
	region    string
	presigner *s3.PresignClient
}

func NewUploadService(bucket, region string) (*UploadService, error) {
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
}

func (s *UploadService) GeneratePresignedURL(ctx context.Context, key, contentType string) (*PresignResult, error) {
	req, err := s.presigner.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(key),
		ContentType: aws.String(contentType),
	}, s3.WithPresignExpires(15*time.Minute))
	if err != nil {
		return nil, fmt.Errorf("failed to presign: %w", err)
	}

	fileURL := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", s.bucket, s.region, key)

	return &PresignResult{
		UploadURL: req.URL,
		FileURL:   fileURL,
	}, nil
}
