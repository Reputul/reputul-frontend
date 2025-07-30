# Reputul Frontend

This is the frontend application for **Reputul**, a comprehensive business reputation management platform. The application is built with React and allows business owners to manage their online reputation, collect customer reviews, and engage with customers through various channels.

## Features

- **Business Management**: Create and manage multiple business profiles
- **Review Collection**: Collect and monitor customer reviews from multiple platforms
- **Customer Feedback**: Dedicated feedback forms for customer input
- **Email Templates**: Customizable email templates for customer communication
- **Review Requests**: Send targeted review requests to customers
- **Platform Integration**: Configure Google, Facebook, and Yelp review platforms
- **Analytics Dashboard**: View business performance metrics and analytics
- **Customer Management**: Maintain customer database and communication history

## Tech Stack

- **React** 19.1.0 - Frontend framework
- **React Router DOM** 7.7.0 - Client-side routing
- **Tailwind CSS** 3.4.17 - Styling and design system
- **Axios** - HTTP client for API communication
- **React Toastify** 11.0.5 - Toast notifications

## Getting Started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## Project Structure

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
│   ├── BusinessPublicPage.jsx       # Public business profile
│   ├── CustomerFeedbackPage.jsx     # Customer feedback form
│   ├── CustomerManagementPage.jsx   # Customer CRUD operations
│   ├── DashboardPage.jsx            # Main dashboard
│   ├── EmailTemplatesPage.jsx       # Email template management
│   ├── ErrorPage.jsx                # Error pages (404, 500, etc.)
│   ├── LoginPage.jsx                # Login form
│   ├── ProfilePage.jsx              # User profile
│   ├── RegisterPage.jsx             # Registration form
│   ├── ReviewPage.jsx               # Review management
│   ├── ReviewPlatformSetupPage.jsx  # Platform configuration
│   └── ReviewRequestPage.jsx        # Review request management
├── api/                 # API client code (currently empty)
├── services/            # Business logic services (currently empty)
└── utils/               # Utility functions (currently empty)
```

## Routes

### Public Routes
- `/login` - User login
- `/register` - User registration
- `/business/:id` - Public business profile page
- `/feedback/:customerId` - Customer feedback form

### Protected Routes (Require Authentication)
- `/dashboard` - Main business dashboard
- `/customers` - Customer management
- `/email-templates` - Email template management
- `/review-requests` - Review request management
- `/review-platform-setup` - Review platform configuration
- `/profile` - User profile management

### Error Pages
- `/forbidden` - 403 Forbidden
- `/server-error` - 500 Server Error
- `/maintenance` - Maintenance mode

## Environment Configuration

### Optional Environment Variables
- `REACT_APP_MAINTENANCE_MODE` - Set to "true" to enable maintenance mode
- `REACT_APP_API_BASE` - Backend API base URL (defaults to "http://localhost:8080")

### Backend Dependencies
- Backend API server must be running on `http://localhost:8080`
- JWT authentication is required for protected routes
- CORS must be configured to allow requests from `http://localhost:3000`

## Development Guidelines

### Authentication
- JWT tokens are stored in localStorage
- All API requests to protected endpoints include `Authorization: Bearer {token}` header
- Protected routes are wrapped with `PrivateRoute` component
- User authentication state is managed through `AuthContext`

### API Communication
- Base API URL: `http://localhost:8080/api`
- All API calls use Axios with consistent error handling
- Loading states and user feedback are implemented throughout the application

### Styling
- Tailwind CSS is used for all styling
- Consistent design system with gradient backgrounds and modern UI components
- Responsive design principles applied throughout
- Custom color scheme focused on blue primary colors

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software for Reputul platform.
