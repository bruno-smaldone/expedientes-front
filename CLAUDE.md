# Claude Memory - Expedientes Frontend

## Project Overview
- **Name**: Expedientes Frontend
- **Type**: React + TypeScript + Vite static web application
- **Purpose**: Frontend for a backend application being built in a separate repo
- **Hosting**: AWS S3 static website hosting (cost-effective solution)

## Technology Stack
- **Framework**: React with TypeScript
- **Build Tool**: Vite (modern, faster than Create React App)
- **Hosting**: AWS S3 static website
- **CDN**: CloudFront (configured but not deployed yet, waiting for custom domain)
- **CI/CD**: GitHub Actions

## AWS Infrastructure
### S3 Bucket
- **Name**: `expedientes-front`
- **Region**: `us-east-1` (required for CloudFront)
- **Configuration**: Static website hosting enabled
- **URL**: http://expedientes-front.s3-website-us-east-1.amazonaws.com
- **Status**: ✅ Created and configured

### IAM User
- **Name**: `github-actions-expedientes` (shared with backend repo)
- **Policy**: `ExpedientesDeploymentPolicy`
- **Permissions**: S3, CloudFront, Lambda, API Gateway, CloudFormation, ECR, IAM, Logs
- **Status**: ✅ Updated with frontend permissions

### CloudFront (Future)
- **Status**: Script created but not deployed
- **Reason**: Waiting for custom domain decision
- **When ready**: Run `./aws/create-cloudfront-distribution.sh`

## File Structure
```
/
├── src/
│   ├── App.tsx          # Main component (Hello World)
│   ├── App.css          # Styling
│   └── main.tsx         # Entry point
├── aws/
│   ├── create-s3-bucket.sh              # ✅ Creates S3 bucket
│   ├── create-cloudfront-distribution.sh # Ready for future use
│   ├── deploy-to-s3.sh                  # Manual deployment (unused)
│   ├── create-managed-policy.sh         # Updates IAM policies
│   ├── iam-deployment-policy.json       # IAM permissions
│   └── setup-deployment-user.sh         # Creates IAM user (unused)
├── .github/workflows/deploy.yml         # ✅ Auto-deployment pipeline
└── package.json                        # Project config
```

## Deployment Process
1. **Trigger**: Push to `main` branch or manual trigger
2. **Pipeline**: Install deps → Lint → Build → Deploy to S3
3. **Caching**: Long cache for static assets, short cache for HTML (SPA routing)
4. **CloudFront**: Invalidation ready when distribution exists

## Important Notes
- **Domain**: Not decided yet, CloudFront creation postponed
- **Cost**: ~$1-5/month for S3 hosting (very cheap for small traffic)
- **SPA Routing**: Configured with `index.html` fallback for React Router
- **Cache Strategy**: Optimized for React builds with asset fingerprinting

## Next Steps (Future Sessions)
- [ ] Decide on domain name
- [ ] Create CloudFront distribution
- [ ] Set up custom domain with Route 53
- [ ] Add API integration with backend
- [ ] Implement actual application features

## Commands to Remember
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Code quality check
- `./aws/create-s3-bucket.sh` - Create S3 bucket (done)
- `./aws/create-cloudfront-distribution.sh` - Create CloudFront (future)