# Dockerized AgriMarket Application

This application is containerized using Docker and Docker Compose. It includes a Node.js backend, React frontend, and MongoDB database.

## Prerequisites

- Docker
- Docker Compose

## Services

- **MongoDB**: Local MongoDB instance on port 27017
- **Backend**: Node.js Express API on port 5500
- **Frontend**: React app served by Nginx on port 80

## Running the Application

1. Ensure Docker and Docker Compose are installed.

2. From the root directory, run:
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:5500
   - MongoDB: localhost:27017 (from host)

## Environment Variables

The application uses the following environment variables (set in docker-compose.yml):

- `MONGO_URI`: mongodb://mongo:27017/AgriDB
- `JWT_SECRET`: [your secret]
- `AGMARKET_API_KEY`: [your key]

## Database

The MongoDB container initializes with database `AgriDB`. Data persists in a Docker volume `mongo_data`.

## Development

- Backend runs with nodemon for hot reloading.
- Frontend is built for production and served by Nginx.
- API calls from frontend are proxied to the backend service.