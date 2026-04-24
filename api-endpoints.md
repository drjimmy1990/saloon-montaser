# API Endpoints Documentation

This document lists all the available API endpoints in the Next.js application (`src/app/api/...`), their supported HTTP methods, and their primary purposes based on the codebase structure.

## Authentication & Users
- **`GET /api/auth/me`**: Get current authenticated user details.
- **`PUT /api/auth/password`**: Update the current user's password.
- **`GET /api/users`**: List all users.
- **`POST /api/users`**: Create a new user account.
- **`PUT /api/users/[id]`**: Update a specific user's details.
- **`DELETE /api/users/[id]`**: Delete a user.

## Clients (CRM)
- **`GET /api/clients`**: List all clients. Supports query parameters (e.g., `?ai_enabled=true`).
- **`POST /api/clients`**: Create a new client profile.
- **`GET /api/clients/[id]`**: Get a specific client's details.
- **`PUT /api/clients/[id]`**: Update a client's profile (e.g., toggling `ai_enabled`).
- **`DELETE /api/clients/[id]`**: Delete a client profile.
- **`POST /api/clients/[id]/read`**: Mark all messages for a specific client as read by the agent.

## Messages & Chat
- **`POST /api/messages`**: Send a new message (either by a human agent or system) to a client. Usually integrates with the WhatsApp/n8n webhook architecture.

## Bookings
- **`GET /api/bookings`**: List all bookings/appointments.
- **`POST /api/bookings`**: Create a new booking.
- **`GET /api/bookings/[id]`**: Get details of a specific booking.
- **`PUT /api/bookings/[id]`**: Update a booking (e.g., change date/time, status).
- **`DELETE /api/bookings/[id]`**: Delete or cancel a booking.

## Catalog (Products & Services)
- **`GET /api/products`**: List all products/services available.
- **`POST /api/products`**: Add a new product or service.
- **`GET /api/products/[id]`**: Get details of a specific product.
- **`PUT /api/products/[id]`**: Update product details.
- **`DELETE /api/products/[id]`**: Remove a product from the catalog.

## Channels (Integrations)
- **`GET /api/channels`**: List connected messaging channels (e.g., WhatsApp, Instagram).
- **`POST /api/channels`**: Connect or configure a new channel.
- **`GET /api/channels/[id]`**: Get details for a specific channel.
- **`PUT /api/channels/[id]`**: Update channel configuration, credentials, or prompts.
- **`DELETE /api/channels/[id]`**: Remove a channel integration.

## Dashboard & Settings
- **`GET /api/dashboard`**: Fetch aggregated metrics and statistics for the admin dashboard view.
- **`GET /api/settings`**: Fetch system-wide settings and configurations.
- **`POST /api/settings`**: Update system-wide settings.
- **`POST /api/seed`**: Database seeding endpoint (used for development/testing).

## Root Health Check
- **`GET /api`**: A standard root endpoint, often used for basic health checking.
