# Changelog - Expedientes Frontend

All notable changes to this project will be documented in this file.

## [0.1.0] - 2025-08-05

### Added
- **Initial React Application Setup**
  - Created React + TypeScript + Vite application
  - Configured development environment
  - Added Hello World component with clean styling
  - Updated package.json name to `expedientes-frontend`

- **AWS Infrastructure**
  - Created S3 bucket `expedientes-front` for static website hosting
  - Configured bucket for SPA routing (404 → index.html)
  - Set up public read access and CORS policies
  - Added proper bucket tags for organization

- **IAM Permissions**
  - Updated `iam-deployment-policy.json` with S3 static hosting permissions
  - Added CloudFront permissions for future use
  - Added frontend-specific S3 bucket access (`expedientes-front*`)
  - Applied updated policy to existing `github-actions-expedientes` user

- **Deployment Automation**
  - Created GitHub Actions pipeline (`.github/workflows/deploy.yml`)
  - Configured automatic deployment on push to main branch
  - Added manual deployment trigger option
  - Implemented smart caching strategy (long cache for assets, short for HTML)
  - Added CloudFront invalidation support (ready for when distribution exists)

- **AWS Scripts**
  - `create-s3-bucket.sh` - Creates and configures S3 bucket
  - `create-cloudfront-distribution.sh` - Creates CloudFront distribution (future use)
  - `deploy-to-s3.sh` - Manual deployment script (replaced by GitHub Actions)
  - Updated `create-managed-policy.sh` to handle policy updates

### Configuration
- **Build Tool**: Vite for fast development and optimized builds
- **Hosting**: S3 static website hosting in us-east-1
- **CI/CD**: GitHub Actions with AWS credentials
- **Cache Strategy**: 1 year for static assets, 0 seconds for HTML files

### Deployment
- **Live URL**: http://expedientes-front.s3-website-us-east-1.amazonaws.com
- **Status**: ✅ Successfully deployed and tested
- **Cost**: ~$1-5/month for current usage

### Notes
- CloudFront distribution creation postponed until custom domain is decided
- Application currently shows "Hello World! 🚀" with project branding
- All AWS infrastructure ready for production scaling