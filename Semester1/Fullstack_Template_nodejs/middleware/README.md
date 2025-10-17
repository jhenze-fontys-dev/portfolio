# ⚙️ Middleware

Contains global middleware functions for Express. Middleware centralizes common behavior such as logging, error handling, and 404 routing.

### Files
- **errorResponse.js** – Standardized JSON error responses.
- **logger.js** – Simple console request logging middleware.
- **notFound.js** – Handles requests for undefined routes.

### Notes
Middleware runs in a controlled order defined in `server.js`.  
Each file here can be reused or replaced without changing controllers or routes.
