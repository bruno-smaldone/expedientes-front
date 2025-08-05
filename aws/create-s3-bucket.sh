#!/bin/bash

# S3 Bucket Creation Script for Static Website Hosting
# This script creates an S3 bucket configured for static website hosting

set -e

# Variables
BUCKET_NAME="expedientes-front"
REGION="us-east-1"  # Required for CloudFront
INDEX_DOCUMENT="index.html"
ERROR_DOCUMENT="index.html"  # SPA routing fallback

echo "Creating S3 bucket for static website hosting..."
echo "Bucket name: $BUCKET_NAME"
echo "Region: $REGION"
echo ""

# Check if bucket already exists
if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
    echo "✅ Bucket $BUCKET_NAME already exists"
else
    # Create the S3 bucket
    echo "📦 Creating S3 bucket: $BUCKET_NAME"
    if [ "$REGION" = "us-east-1" ]; then
        # us-east-1 doesn't need LocationConstraint
        aws s3api create-bucket --bucket "$BUCKET_NAME"
    else
        aws s3api create-bucket \
            --bucket "$BUCKET_NAME" \
            --region "$REGION" \
            --create-bucket-configuration LocationConstraint="$REGION"
    fi
    echo "✅ Bucket created successfully"
fi

# Block public access settings first (allow public read through bucket policy)
echo "🛡️  Configuring public access block settings..."
aws s3api put-public-access-block \
    --bucket "$BUCKET_NAME" \
    --public-access-block-configuration \
        BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=false,RestrictPublicBuckets=false

# Configure bucket for static website hosting
echo "🌐 Configuring static website hosting..."
aws s3api put-bucket-website \
    --bucket "$BUCKET_NAME" \
    --website-configuration "{
        \"IndexDocument\": {
            \"Suffix\": \"$INDEX_DOCUMENT\"
        },
        \"ErrorDocument\": {
            \"Key\": \"$ERROR_DOCUMENT\"
        }
    }"

# Set bucket policy for public read access
echo "🔓 Setting bucket policy for public read access..."
cat > /tmp/bucket-policy.json << 'EOF'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::expedientes-front/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy \
    --bucket "$BUCKET_NAME" \
    --policy file:///tmp/bucket-policy.json

# Configure CORS for API requests (if needed)
echo "🔄 Configuring CORS..."
cat > /tmp/cors-policy.json << 'EOF'
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "HEAD"],
            "AllowedOrigins": ["*"],
            "MaxAgeSeconds": 3000
        }
    ]
}
EOF

aws s3api put-bucket-cors \
    --bucket "$BUCKET_NAME" \
    --cors-configuration file:///tmp/cors-policy.json

# Add tags
echo "🏷️  Adding tags..."
aws s3api put-bucket-tagging \
    --bucket "$BUCKET_NAME" \
    --tagging 'TagSet=[{Key=Project,Value=Expedientes},{Key=Environment,Value=Production},{Key=Type,Value=StaticWebsite}]'

# Clean up temp files
rm -f /tmp/bucket-policy.json /tmp/cors-policy.json

echo ""
echo "=========================================="
echo "✅ S3 Bucket Setup Complete!"
echo "=========================================="
echo ""
echo "Bucket Details:"
echo "  • Name: $BUCKET_NAME"
echo "  • Region: $REGION"
echo "  • Website URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo "  • S3 Console: https://s3.console.aws.amazon.com/s3/buckets/$BUCKET_NAME"
echo ""
echo "Next steps:"
echo "  1. Run 'npm run build' to create production files"
echo "  2. Upload dist/ contents to S3"
echo "  3. Create CloudFront distribution for HTTPS and better performance"
echo ""
echo "=========================================="