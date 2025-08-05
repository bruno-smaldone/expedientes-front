#!/bin/bash

# Deployment Script for Static Website to S3 + CloudFront
# This script builds the app and deploys it to S3 with CloudFront cache invalidation

set -e

# Variables
BUCKET_NAME="expedientes-front"
BUILD_DIR="dist"
DISTRIBUTION_ID_FILE="aws/cloudfront-distribution-id.txt"

echo "🚀 Starting deployment to S3 + CloudFront..."
echo ""

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build directory '$BUILD_DIR' not found!"
    echo "   Run 'npm run build' first to create the build."
    exit 1
fi

# Check if CloudFront distribution ID file exists
if [ ! -f "$DISTRIBUTION_ID_FILE" ]; then
    echo "⚠️  CloudFront distribution ID not found."
    echo "   Skipping cache invalidation."
    DISTRIBUTION_ID=""
else
    DISTRIBUTION_ID=$(cat "$DISTRIBUTION_ID_FILE")
    echo "📋 CloudFront Distribution ID: $DISTRIBUTION_ID"
fi

# Sync files to S3
echo "📦 Uploading files to S3 bucket: $BUCKET_NAME"
aws s3 sync "$BUILD_DIR/" "s3://$BUCKET_NAME/" \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "*.html" \
    --exclude "service-worker.js" \
    --exclude "manifest.json"

# Upload HTML files with shorter cache (for SPA routing)
echo "📄 Uploading HTML files with short cache..."
aws s3 sync "$BUILD_DIR/" "s3://$BUCKET_NAME/" \
    --delete \
    --cache-control "public, max-age=0, must-revalidate" \
    --include "*.html" \
    --include "service-worker.js" \
    --include "manifest.json"

# Invalidate CloudFront cache if distribution exists
if [ -n "$DISTRIBUTION_ID" ]; then
    echo "🔄 Creating CloudFront invalidation..."
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$DISTRIBUTION_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    
    echo "✅ CloudFront invalidation created: $INVALIDATION_ID"
    echo "⏳ Invalidation typically takes 2-5 minutes to complete"
    
    echo ""
    echo "To check invalidation status:"
    echo "  aws cloudfront get-invalidation --distribution-id $DISTRIBUTION_ID --id $INVALIDATION_ID"
else
    echo "⚠️  Skipped CloudFront invalidation (no distribution ID found)"
fi

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "Your app is now available at:"
echo "  • S3 Website: http://$BUCKET_NAME.s3-website-us-east-1.amazonaws.com"
if [ -n "$DISTRIBUTION_ID" ]; then
    CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution --id "$DISTRIBUTION_ID" --query 'Distribution.DomainName' --output text)
    echo "  • CloudFront: https://$CLOUDFRONT_DOMAIN"
fi
echo ""
echo "🔍 AWS Console Links:"
echo "  • S3: https://s3.console.aws.amazon.com/s3/buckets/$BUCKET_NAME"
if [ -n "$DISTRIBUTION_ID" ]; then
    echo "  • CloudFront: https://console.aws.amazon.com/cloudfront/v3/home#/distributions/$DISTRIBUTION_ID"
fi
echo ""
echo "=========================================="