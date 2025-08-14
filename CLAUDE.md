# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the frontend for **Reputul**, a business reputation management platform. It's a React SPA that allows business owners to:
- Manage multiple businesses
- Collect and monitor customer reviews
- Send review requests to customers via email templates
- Set up and configure review platforms (Google, Facebook, Yelp)
- Collect customer feedback through dedicated feedback forms
- View analytics and business performance metrics
- Manage customer data and communication
- Use customizable email templates for customer outreach

## Development Commands

### Core Commands
- `npm start` - Start development server (opens http://localhost:3000)
- `npm run build` - Build for production
- `npm test` - Run tests in watch mode
- `npm run eject` - Eject from Create React App (one-way operation)

### Testing
- Tests use React Testing Library and Jest
- Test files follow `*.test.js` pattern
- Setup file: `src/setupTests.js`

## Architecture Overview

### Tech Stack
- **Framework**: React 19.1.0 with Create React App
- **Routing**: React Router DOM 7.7.0
- **Styling**: Tailwind CSS 3.4.17 with custom gradients and utilities
- **HTTP Client**: Axios for API communication
- **Notifications**: React Toastify 11.0.5
- **Backend API**: http://localhost:8080 (Spring Boot backend)

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ErrorBoundary.jsx    # Global error boundary
│   ├── Navbar.jsx           # Main navigation
│   ├── PrivateRoute.jsx     # Route protection
│   └── Toast.jsx            # Toast notifications
├── context/             # React Context providers
│   ├── AuthContext.jsx      # Authentication state
│   └── ToastContext.jsx     # Toast notification state
├── pages/               # Route components
│   ├── BusinessPublicPage.jsx   # Public business profile (/business/:id)
│   ├── CustomerFeedbackPage.jsx # Customer feedback form (/feedback/:customerId)
│   ├── CustomerManagementPage.jsx  # Customer CRUD (/customers)
│   ├── DashboardPage.jsx        # Main dashboard (/dashboard)
│   ├── EmailTemplatesPage.jsx   # Email template management (/email-templates)
│   ├── ErrorPage.jsx            # Error pages (404, 500, 403, maintenance)
│   ├── LandingPage.jsx          # Landing page with waitlist signup (/)
│   ├── LoginPage.jsx            # Login form (/login)
│   ├── OptInPolicy.jsx          # Opt-in policy page (/opt-in-policy)
│   ├── ProfilePage.jsx          # User profile (/profile)
│   ├── RegisterPage.jsx         # Registration form (/register)
│   ├── ReviewPage.jsx           # Review management
│   ├── ReviewPlatformSetupPage.jsx # Review platform configuration (/review-platform-setup)
│   └── ReviewRequestPage.jsx    # Review request management (/review-requests)
├── api/                 # API client services
│   └── WaitlistService.js       # Waitlist API integration
├── config/              # Configuration files
│   └── api.js                   # Centralized API endpoints configuration
├── services/            # Business logic services (currently empty)
└── utils/               # Utility functions
    ├── auth.js                  # JWT security utilities
    ├── logger.js                # Logging utilities
    ├── sanitizer.js             # Input sanitization
    └── validation.js            # Form validation utilities
```

### Key Architectural Patterns

#### Authentication Flow
- JWT token stored in localStorage
- AuthContext provides: `{ token, user, loading, login(), register(), logout(), updateUser(), isAuthenticated() }`
- PrivateRoute component protects authenticated routes
- Token validated on app startup via `/api/users/profile` endpoint

#### State Management
- React Context for global state (Auth, Toast)
- Local component state with useState/useEffect
- No external state management library (Redux, Zustand)

#### API Integration
- All API calls use axios with Authorization header: `Bearer ${token}`
- Base URL: `http://localhost:8080/api`
- Centralized API configuration in `src/config/api.js`
- Key endpoints:
  - Auth: `/auth/login`, `/auth/register`
  - Users: `/users/profile`
  - Businesses: `/businesses`, `/dashboard`
  - Reviews: `/reviews/business/{id}`, `/reviews/request`, `/reviews/manual/{id}`
  - Customers: `/customers`, `/customers/{id}/feedback-info`
  - Email Templates: `/email-templates`
  - Waitlist: `/waitlist/add`, `/waitlist/count`

#### Routing Structure
- `/` → landing page with waitlist signup
- `/login`, `/register` → public authentication routes
- `/business/:id` → public business profile
- `/feedback/:customerId` → customer feedback form (public)
- `/opt-in-policy` → opt-in policy page (public)
- `/dashboard` → main business management (protected)
- `/customers` → customer management (protected)
- `/email-templates` → email template management (protected)
- `/review-requests` → review request management (protected)
- `/review-platform-setup` → review platform configuration (protected)
- `/profile` → user profile (protected)
- Error pages: `/forbidden`, `/server-error`, `/maintenance`

### Styling Conventions

#### Tailwind CSS Usage
- Modern gradient backgrounds: `from-slate-900 via-blue-900 to-indigo-900`
- Card-based layouts with `rounded-xl shadow-sm border border-gray-100`
- Hover effects and transitions: `hover:shadow-md transition-all duration-200`
- Color system: Blue (primary), Green (success), Yellow (ratings), Purple (secondary)

#### Component Patterns
- Consistent spacing: `p-6` for cards, `space-y-4` for form fields
- Button styles: `bg-gradient-to-r from-primary-500 to-primary-600` with hover states
- Form inputs: `border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500`

### Key Features

#### Landing Page (LandingPage.jsx)
- Public-facing landing page with waitlist signup
- Real-time waitlist count display
- Email validation and submission handling
- Integration with waitlist API service
- Responsive design with modern UI components

#### Dashboard (DashboardPage.jsx)
- Business cards with metrics (rating, review count, badge)
- Inline review form for manual review addition
- Modals for business CRUD operations
- Quick actions sidebar
- Recent activity feed
- Performance analytics modal

#### Business Management
- Create/Read/Update/Delete businesses
- Copy public business links
- Review request sending
- Manual review addition

#### Customer Feedback (CustomerFeedbackPage.jsx)
- Public feedback form accessible via `/feedback/:customerId`
- Allows customers to submit private feedback or reviews
- Auto-detects feedback type based on link parameters
- Displays associated business information
- Form validation and submission handling

#### Review Platform Setup (ReviewPlatformSetupPage.jsx)
- Configure review platforms for businesses (Google, Facebook, Yelp)
- Validate platform URLs and generate review links
- Real-time URL validation with feedback
- Platform-specific configuration management
- Success notifications and error handling

#### Review Request Management (ReviewRequestPage.jsx)
- Send review requests to customers using email templates
- Bulk customer selection for mass review requests
- View request history and statistics
- Filter requests by status (pending, sent, responded)
- Integration with email template system

#### Maintenance Mode
- Controlled via `REACT_APP_MAINTENANCE_MODE` env var or localStorage
- Shows maintenance page when enabled
- Loading screen during status check

## Development Guidelines

### API Communication
- Always check for authentication before API calls
- Use consistent error handling with try/catch
- Display user-friendly messages via toast notifications
- Handle maintenance mode and error states gracefully

### State Updates
- Use functional setState updates: `setState(prev => ({ ...prev, newValue }))`
- Implement loading states for async operations
- Clear form data after successful submissions

### Component Conventions
- Use React.memo() for performance optimization where appropriate
- Implement useCallback() for event handlers to prevent unnecessary re-renders
- Follow the existing naming pattern: PascalCase for components, camelCase for functions

### Error Handling
- Global ErrorBoundary catches React errors
- Network errors handled per component with user feedback
- Maintenance mode detection on app startup
- Fallback UI states for empty data

## Environment Configuration

### Optional Environment Variables
- `REACT_APP_MAINTENANCE_MODE=true/false` - Controls maintenance mode
- `REACT_APP_API_BASE` - Backend API base URL (defaults to "http://localhost:8080")
- `REACT_APP_API_URL` - Alternative API URL configuration for waitlist service

### Backend Dependencies
- Backend API must be running on http://localhost:8080
- JWT authentication required
- CORS configured for localhost:3000
- Waitlist endpoints must be available for landing page functionality

## Testing Strategy
- Component tests with React Testing Library
- Integration tests for user flows
- Mock API responses for reliable testing
- Test authentication flows and protected routes