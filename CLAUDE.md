# Claude Memory - Expedientes Frontend (Cicero)

## Project Overview
- **Name**: Expedientes Frontend (internally branded as "Cicero")
- **Type**: React + TypeScript + Vite static web application
- **Purpose**: Legal case (expedientes) tracking and monitoring system frontend
- **Backend**: Integrates with separate backend repo for expedientes data
- **Hosting**: AWS S3 static website hosting

## Application Features
### Core Functionality
- **Authentication System**: Login/logout with JWT tokens
- **Dashboard**: Personalized greeting with expedientes summary statistics
- **Expedientes List**: Complete list with search, filtering, and grouping
- **Expediente Detail**: Full timeline view with movements and decretos
- **Add Expedientes**: Modal system for subscribing to new expedientes
- **Automatic Tracking**: Backend integration for movement/decreto notifications

### Key Features Implemented
- **Spanish Localization**: Complete UI translation to Spanish
- **Grouping System**: View expedientes by decretos-first or movements-first
- **Custom Tooltips**: React-based tooltips for truncated content  
- **Real-time Badges**: "NUEVOS DECRETOS" and "NUEVOS MOVIMIENTOS" indicators
- **Responsive Design**: Mobile-friendly interface
- **Single Source of Truth**: Uses `lastViewedMovementSK` for tracking

## Technology Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (modern, fast bundler)
- **Routing**: React Router v6
- **State Management**: React Context (AuthContext)
- **Styling**: CSS-in-JS inline styling approach
- **API Integration**: Custom service layer with typed responses
- **Hosting**: AWS S3 static website + CloudFront (future)
- **CI/CD**: GitHub Actions

## Design System - Cicero Theme
### Color Palette
- **Deep ink blue (#1E40AF)**: Headers, navigation, primary elements
- **Roman red (#B91C1C)**: Decreto highlights, movements, accents
- **Olive branch green (#65A30D)**: Success states, positive indicators  
- **Warm parchment (#F7F3E9)**: Background areas
- **Charcoal slate (#475569)**: Secondary text

### Visual Identity
- Classical Roman aesthetic inspired by the name "Cicero"
- Professional legal theme with sophisticated color choices
- Consistent decree and movement highlighting
- Clean, readable typography with proper contrast

## File Structure
```
src/
├── components/
│   ├── Layout.tsx                    # Main layout with header/nav
│   ├── AddExpedienteModal.tsx        # Modal for adding new expedientes
│   └── ExpedienteSubscription.tsx    # Subscription component
├── contexts/
│   └── AuthContext.tsx               # Authentication state management
├── pages/
│   ├── Login.tsx                     # Login page
│   ├── Dashboard.tsx                 # Dashboard with summary stats
│   ├── ExpedientesList.tsx           # Full expedientes list with grouping
│   └── ExpedienteDetail.tsx          # Individual expediente timeline
├── services/
│   └── api.ts                        # API service layer
├── types/
│   └── api.ts                        # TypeScript interfaces
├── App.tsx                           # Main app component with routing
└── main.tsx                          # Application entry point
```

## API Integration
### Backend Tracking System
- **Tracking Method**: Single source of truth using `lastViewedMovementSK`
- **Automatic Updates**: Tracks viewing on page load, no manual buttons
- **Real-time Status**: `hasNewMovements` and `hasNewDecretos` flags
- **Spanish Data**: Backend provides Spanish-localized content

### Key API Endpoints
- `GET /api/dashboard/summary` - Dashboard statistics
- `GET /api/expedientes` - List of tracked expedientes
- `GET /api/expedientes/:iue` - Individual expediente with movements
- `POST /api/expedientes/track` - Subscribe to new expediente
- `POST /api/expedientes/:iue/mark-viewed` - Update tracking

### Data Types
```typescript
interface ExpedienteTracking {
  expediente: Expediente;
  hasNewMovements: boolean;
  hasNewDecretos: boolean; 
  lastViewedMovementSK?: string;
  subscriptionDate: string;
}

interface Expediente {
  iue: string;
  caratula: string;
  origen: string;
  status: 'active' | 'archived';
  movementCount: number;
  decretoCount: number;
  lastMovementDate: string;
  lastDecretoDate?: string;
}
```

## AWS Infrastructure
### S3 Bucket
- **Name**: `expedientes-front`
- **Region**: `us-east-1` (required for CloudFront)
- **Configuration**: Static website hosting enabled
- **URL**: http://expedientes-front.s3-website-us-east-1.amazonaws.com
- **Status**: ✅ Active and deployed

### IAM User
- **Name**: `github-actions-expedientes` (shared with backend repo)
- **Policy**: `ExpedientesDeploymentPolicy`
- **Permissions**: S3, CloudFront, Lambda, API Gateway, CloudFormation, ECR, IAM, Logs
- **Status**: ✅ Configured

### CloudFront (Future)
- **Status**: Script created but not deployed
- **Reason**: Waiting for custom domain decision
- **When ready**: Run `./aws/create-cloudfront-distribution.sh`

## Deployment Process
1. **Trigger**: Push to `main` branch or manual trigger
2. **Pipeline**: Install deps → Lint → Build → Deploy to S3
3. **Caching**: Long cache for static assets, short cache for HTML (SPA routing)
4. **CloudFront**: Invalidation ready when distribution exists

## Development Workflow
### Local Development
```bash
npm run dev          # Start development server (localhost:5173)
npm run build        # Build for production
npm run lint         # Code quality check
npm run preview      # Preview production build
```

### Key Implementation Patterns
- **Custom Tooltips**: React state-based instead of native HTML titles
- **URL Parameters**: For view modes (?view=decretos-first)
- **Inline Styling**: CSS-in-JS approach throughout
- **Error Boundaries**: Proper error handling in API calls
- **TypeScript**: Strict typing for all API responses and props

## Important Notes
- **Domain**: Not decided yet, CloudFront creation postponed
- **Cost**: ~$1-5/month for S3 hosting (very cheap for small traffic)
- **SPA Routing**: Configured with `index.html` fallback for React Router
- **Cache Strategy**: Optimized for React builds with asset fingerprinting
- **Tree-Shaking**: API responses analyzed for unused properties removal
- **Branding**: "Cicero" name used internally, not prominently displayed in UI

## Future Considerations
- [ ] Decide on custom domain name
- [ ] Deploy CloudFront distribution for global CDN
- [ ] Set up custom domain with Route 53
- [ ] Performance optimization (code splitting, service workers)
- [ ] Testing framework implementation
- [ ] Accessibility improvements (a11y)

## Commands to Remember
- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run lint` - Code quality check
- `./aws/create-s3-bucket.sh` - Create S3 bucket (done)
- `./aws/create-cloudfront-distribution.sh` - Create CloudFront (future)