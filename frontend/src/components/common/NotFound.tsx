import React from 'react';
import { Link } from 'react-router-dom';

/**
 * 404 Not Found page component
 * Displays when users navigate to non-existent routes
 */
const NotFound: React.FC = () => {
  return (
    <div className="not-found-container text-center">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn btn-primary mt-3">
        Return to Home
      </Link>
    </div>
  );
};

export default NotFound;
