# Changelog - Expedientes Frontend (Cicero)

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-01-06

### 🎨 Major Visual Redesign - "Cicero" Classical Theme
- **Complete Color Scheme Overhaul**
  - Implemented classical Roman-inspired "Cicero" color palette
  - Deep ink blue (#1E40AF) for headers and primary elements
  - Roman red (#B91C1C) for decreto highlights and accents
  - Olive branch green (#65A30D) for success states
  - Warm parchment (#F7F3E9) backgrounds
  - Charcoal slate (#475569) for secondary text

- **Visual Consistency Updates**
  - Replaced all purple decreto elements with Roman red
  - Updated success indicators to olive green
  - Applied consistent header styling across all pages
  - Enhanced professional legal theme throughout interface

### ✨ Core Application Features
- **Authentication System**
  - JWT-based login/logout functionality
  - Protected routes with authentication context
  - Automatic token refresh handling

- **Dashboard Page**
  - Personalized greeting with username ("¡Hola {username}!")
  - Summary statistics cards for expedientes tracking
  - Quick navigation links to filtered views
  - Recent unread decretos table with pagination
  - Custom tooltip system for truncated content

- **Expedientes List Page**
  - Complete list of tracked expedientes with search functionality
  - Advanced grouping system:
    - Normal view (sortable table)
    - Decretos-first grouping
    - Movements-first grouping
  - URL parameter handling for view persistence
  - Real-time badges: "NUEVOS DECRETOS" and "NUEVOS MOVIMIENTOS"
  - Responsive table with overflow handling

- **Expediente Detail Page**
  - Full timeline view of movements and decretos
  - Visual timeline with colored dots and cards
  - Decreto content display with proper formatting
  - Automatic tracking updates on page load
  - "NUEVO" badges for unviewed movements
  - Status indicators and metadata display

- **Add Expedientes Modal**
  - Bulk expediente subscription (multiple IUEs)
  - Real-time processing status indicators
  - Success/error feedback with detailed messages
  - Modal overlay with proper accessibility

### 🌍 Complete Spanish Localization
- **UI Translation**
  - All interface text translated to Spanish
  - Date formatting localized to es-UY
  - Status values translated (active → Activo, archived → Archivado)
  - Error messages and user feedback in Spanish

- **Content Handling**
  - Caratula text formatting (replace `<br>` tags with " - ")
  - Spanish movement type descriptions
  - Localized date displays throughout interface

### 🔧 Technical Implementation
- **Single Source of Truth Tracking**
  - Migrated from dual tracking to `lastViewedMovementSK` system
  - Automatic tracking on page load instead of manual buttons
  - Real-time status indicators (`hasNewMovements`, `hasNewDecretos`)

- **Custom Tooltip System**
  - React-based tooltips replacing native browser tooltips
  - Absolute positioning with proper z-index management
  - Hover state management with mouse events

- **API Integration**
  - Comprehensive service layer with typed responses
  - Error handling and loading states
  - Proper TypeScript interfaces for all data structures

- **Routing and Navigation**
  - React Router v6 implementation
  - URL parameter handling for application state
  - Proper navigation with breadcrumbs

### 📊 Tree-Shaking Analysis
- **API Optimization**
  - Analyzed all API responses vs frontend usage
  - Identified unused properties for backend removal:
    - `userId`, `email` from user objects
    - Full tracking object complexity
    - `organismoVigente`, `materia` from expedientes
    - Various unused metadata fields

### 🎯 User Experience Improvements
- **Search and Filtering**
  - Real-time search by IUE and carátula
  - Advanced grouping with section headers
  - Disabled sorting in grouped views (intentional UX decision)

- **Visual Feedback**
  - Loading states for all async operations
  - Success/error messaging with contextual colors
  - Badge system for new content indication
  - Hover effects and interactive elements

- **Responsive Design**
  - Mobile-friendly interface
  - Flexible grid layouts
  - Proper text overflow handling
  - Touch-friendly button sizing

### 🏗️ Architecture Decisions
- **Styling Approach**
  - CSS-in-JS inline styling throughout application
  - Consistent color variables and spacing
  - Hover effects and transitions

- **State Management**
  - React Context for authentication
  - Local state for component-specific data
  - URL parameters for shareable application state

- **Component Structure**
  - Clear separation of concerns
  - Reusable modal and form components
  - Proper TypeScript prop interfaces

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
- **Status**: ✅ Successfully deployed and active
- **Cost**: ~$1-5/month for current usage

### Notes
- CloudFront distribution creation postponed until custom domain is decided
- All AWS infrastructure ready for production scaling
- Foundation set for full application development