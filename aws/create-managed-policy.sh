#!/bin/bash
set -e

USER_NAME="github-actions-expedientes"
POLICY_NAME="ExpedientesDeploymentPolicy"
POLICY_FILE="aws/iam-deployment-policy.json"

echo "🔧 Managing IAM policy for deployment user"
echo "User: $USER_NAME"
echo "Policy: $POLICY_NAME"
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI is not configured. Please run 'aws configure' first."
    exit 1
fi

# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Account ID: $ACCOUNT_ID"
POLICY_ARN="arn:aws:iam::$ACCOUNT_ID:policy/$POLICY_NAME"

# Check if policy exists and delete it to recreate with latest version
echo "🔍 Checking for existing policy..."
if aws iam get-policy --policy-arn "$POLICY_ARN" > /dev/null 2>&1; then
    echo "🗑️  Detaching and deleting existing policy..."
    
    # Detach from user first
    aws iam detach-user-policy --user-name "$USER_NAME" --policy-arn "$POLICY_ARN" 2>/dev/null || echo "Policy not attached to user"
    
    # Delete the policy
    aws iam delete-policy --policy-arn "$POLICY_ARN"
    echo "✅ Existing policy deleted"
else
    echo "ℹ️  No existing policy found"
fi

# Create new policy
echo "📝 Creating policy..."
aws iam create-policy \
  --policy-name "$POLICY_NAME" \
  --policy-document "file://$POLICY_FILE" \
  --description "Deployment policy for Expedientes backend with DynamoDB and CloudFormation permissions"

echo "Policy ARN: $POLICY_ARN"

# Attach policy to user
echo "🔗 Attaching policy to user..."
aws iam attach-user-policy \
  --user-name "$USER_NAME" \
  --policy-arn "$POLICY_ARN"

echo ""
echo "✅ IAM policy created and attached successfully!"
echo ""
echo "Policy ARN: $POLICY_ARN"
echo "You can now retry your deployment."