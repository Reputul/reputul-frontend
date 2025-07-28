// src/components/ErrorBoundary.js
import React from 'react';
import { ServerErrorPage } from '../pages/ErrorPage';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Error info:', errorInfo);
    
    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Render the custom error page
      return (
        <ServerErrorPage 
          title="Something went wrong"
          message="We're sorry, but something unexpected happened. Our team has been notified and is working to fix this issue."
        />
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;