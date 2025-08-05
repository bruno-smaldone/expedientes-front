#!/bin/bash

# AWS IAM Setup Script for GitHub Actions Deployment

echo "Setting up IAM user for GitHub Actions deployment..."

# Variables
USER_NAME="github-actions-expedientes"
POLICY_NAME="ExpedientesDeploymentPolicy"

# Create IAM user
echo "Creating IAM user: $USER_NAME"
aws iam create-user --user-name $USER_NAME

# Create and attach the deployment policy
echo "Creating deployment policy..."
POLICY_ARN=$(aws iam create-policy \
  --policy-name $POLICY_NAME \
  --policy-document file://iam-deployment-policy.json \
  --query 'Policy.Arn' \
  --output text)

echo "Policy created with ARN: $POLICY_ARN"

# Attach policy to user
echo "Attaching policy to user..."
aws iam attach-user-policy \
  --user-name $USER_NAME \
  --policy-arn $POLICY_ARN

# Create access keys for the user
echo "Creating access keys..."
ACCESS_KEY_OUTPUT=$(aws iam create-access-key --user-name $USER_NAME)

ACCESS_KEY_ID=$(echo $ACCESS_KEY_OUTPUT | jq -r '.AccessKey.AccessKeyId')
SECRET_ACCESS_KEY=$(echo $ACCESS_KEY_OUTPUT | jq -r '.AccessKey.SecretAccessKey')

echo ""
echo "=========================================="
echo "IAM User Setup Complete!"
echo "=========================================="
echo ""
echo "Add these secrets to your GitHub repository:"
echo ""
echo "AWS_ACCESS_KEY_ID: $ACCESS_KEY_ID"
echo "AWS_SECRET_ACCESS_KEY: $SECRET_ACCESS_KEY"
echo ""
echo "To add them:"
echo "1. Go to your GitHub repository"
echo "2. Settings → Secrets and variables → Actions"
echo "3. Click 'New repository secret'"
echo "4. Add both secrets"
echo ""
echo "IMPORTANT: Save these credentials securely!"
echo "=========================================="