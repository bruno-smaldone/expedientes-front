#!/bin/bash

# CloudFront Distribution Creation Script
# This script creates a CloudFront distribution for the S3 static website

set -e

# Variables
BUCKET_NAME="expedientes-front"
REGION="us-east-1"
DISTRIBUTION_COMMENT="Expedientes Frontend CloudFront Distribution"

echo "Creating CloudFront distribution for S3 bucket..."
echo "Bucket: $BUCKET_NAME"
echo "Comment: $DISTRIBUTION_COMMENT"
echo ""

# Get the S3 website endpoint
S3_WEBSITE_ENDPOINT="$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

# Create CloudFront distribution configuration
echo "📋 Creating CloudFront distribution configuration..."
cat > /tmp/cloudfront-distribution.json << EOF
{
    "CallerReference": "expedientes-front-$(date +%s)",
    "Comment": "$DISTRIBUTION_COMMENT",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-Website-$BUCKET_NAME",
                "DomainName": "$S3_WEBSITE_ENDPOINT",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only",
                    "OriginSslProtocols": {
                        "Quantity": 1,
                        "Items": ["TLSv1.2"]
                    }
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-Website-$BUCKET_NAME",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000,
        "Compress": true
    },
    "CacheBehaviors": {
        "Quantity": 1,
        "Items": [
            {
                "PathPattern": "/static/*",
                "TargetOriginId": "S3-Website-$BUCKET_NAME",
                "ViewerProtocolPolicy": "redirect-to-https",
                "TrustedSigners": {
                    "Enabled": false,
                    "Quantity": 0
                },
                "ForwardedValues": {
                    "QueryString": false,
                    "Cookies": {
                        "Forward": "none"
                    }
                },
                "MinTTL": 0,
                "DefaultTTL": 31536000,
                "MaxTTL": 31536000,
                "Compress": true
            }
        ]
    },
    "CustomErrorResponses": {
        "Quantity": 1,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            }
        ]
    },
    "Enabled": true,
    "PriceClass": "PriceClass_100"
}
EOF

# Create the CloudFront distribution
echo "🌐 Creating CloudFront distribution..."
DISTRIBUTION_OUTPUT=$(aws cloudfront create-distribution \
    --distribution-config file:///tmp/cloudfront-distribution.json \
    --query 'Distribution.{Id:Id,DomainName:DomainName,Status:Status}' \
    --output json)

DISTRIBUTION_ID=$(echo "$DISTRIBUTION_OUTPUT" | jq -r '.Id')
DISTRIBUTION_DOMAIN=$(echo "$DISTRIBUTION_OUTPUT" | jq -r '.DomainName')
DISTRIBUTION_STATUS=$(echo "$DISTRIBUTION_OUTPUT" | jq -r '.Status')

# Add tags to the distribution
echo "🏷️  Adding tags to CloudFront distribution..."
aws cloudfront tag-resource \
    --resource "arn:aws:cloudfront::$(aws sts get-caller-identity --query Account --output text):distribution/$DISTRIBUTION_ID" \
    --tags 'Items=[{Key=Project,Value=Expedientes},{Key=Environment,Value=Production},{Key=Type,Value=CDN}]'

# Clean up temp file
rm -f /tmp/cloudfront-distribution.json

echo ""
echo "=========================================="
echo "✅ CloudFront Distribution Created!"
echo "=========================================="
echo ""
echo "Distribution Details:"
echo "  • ID: $DISTRIBUTION_ID"
echo "  • Domain: $DISTRIBUTION_DOMAIN"
echo "  • Status: $DISTRIBUTION_STATUS"
echo "  • HTTPS URL: https://$DISTRIBUTION_DOMAIN"
echo ""
echo "⏳ Note: Distribution deployment takes 15-20 minutes"
echo ""
echo "CloudFront Console: https://console.aws.amazon.com/cloudfront/v3/home#/distributions/$DISTRIBUTION_ID"
echo ""
echo "To check deployment status:"
echo "  aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.Status'"
echo ""
echo "For GitHub Actions, save these values as secrets:"
echo "  CLOUDFRONT_DISTRIBUTION_ID: $DISTRIBUTION_ID"
echo ""
echo "=========================================="

# Save distribution ID to a file for future reference
echo "$DISTRIBUTION_ID" > aws/cloudfront-distribution-id.txt
echo "📄 Distribution ID saved to aws/cloudfront-distribution-id.txt"