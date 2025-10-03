# Race Timing System

A comprehensive RFID-based race timing system built with Node.js, React, and TypeScript.

## Architecture

This monorepo contains:

- **services/rfid-reader**: RFID reader service for capturing tag reads
- **services/core-api**: Core API server for race management and data processing
- **frontend**: React-based web interface for race management and live results
- **shared**: Shared TypeScript types and utilities across all services

## Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 15+
- Redis 7+
- Docker and Docker Compose (optional, for containerized development)
- RFID Reader (compatible with LLRP protocol)

## Quick Start

### 1. Clone and Setup

```bash
# Clone this repository
git clone <your-repo-url>
cd race-timing-system

# Initialize and update submodules
git submodule init
git submodule update

# Copy environment file
cp .env.example .env
# Edit .env with your configuration
```

### 2. Install Dependencies

```bash
# Install all dependencies for the workspace
npm run install:all
```

### 3. Database Setup

```bash
# Start PostgreSQL and Redis (using Docker)
docker-compose up -d database redis

# Run database migrations
cd services/core-api
npm run migrate
```

### 4. Development

```bash
# Start all services in development mode
npm run dev
```

This will start:
- Core API on http://localhost:3000
- RFID Reader service on http://localhost:3001
- Frontend on http://localhost:3002

### 5. Production Deployment

```bash
# Build all services
npm run build

# Start production services
npm start
```

## Services Overview

### RFID Reader Service (`services/rfid-reader`)

Handles RFID tag reads and communicates with the core API:

- LLRP protocol implementation for RFID readers
- Real-time tag processing
- Reader health monitoring
- Event emission to core API

### Core API Service (`services/core-api`)

Main backend service providing:

- Race management APIs
- Participant registration
- Real-time result processing
- WebSocket server for live updates
- Database management

### Frontend (`frontend`)

React-based web interface for:

- Race configuration and management
- Live race monitoring
- Participant registration
- Results display and export

### Shared (`shared`)

Common TypeScript types and utilities:

- Race, participant, and tag read interfaces
- Event type definitions
- API constants
- Utility functions

## Git Submodules

The RFID reader and core API services are managed as git submodules:

```bash
# Update submodules to latest
npm run update:submodules

# Pull changes from submodule repos
git submodule update --remote

# Push changes to submodule repos
cd services/core-api
git add .
git commit -m "Your changes"
git push origin main
```

## Configuration

### Environment Variables

Key environment variables (see `.env.example`):

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `READER_IP`: RFID reader IP address
- `READER_PORT`: RFID reader port (usually 5084)
- `JWT_SECRET`: Secret for JWT token signing

### RFID Reader Setup

1. Configure your RFID reader with a static IP
2. Update `READER_IP` and `READER_PORT` in your `.env` file
3. Ensure the reader supports LLRP protocol

## API Documentation

### Core API Endpoints

- `GET /api/races` - List all races
- `POST /api/races` - Create new race
- `GET /api/races/:id` - Get race details
- `POST /api/participants` - Register participant
- `GET /api/results/:raceId` - Get race results

### WebSocket Events

- `race:update` - Race status changes
- `participant:update` - Participant status changes
- `lap:completed` - New lap completion
- `tag:read` - Raw tag read events

## Development

### Adding New Features

1. Define shared types in `shared/src/types/`
2. Implement backend logic in `services/core-api/`
3. Add RFID processing in `services/rfid-reader/` if needed
4. Create frontend components in `frontend/src/`

### Testing

```bash
# Run all tests
npm test

# Test specific service
cd services/core-api && npm test
cd services/rfid-reader && npm test
cd frontend && npm test
```

### Database Migrations

```bash
cd services/core-api
npm run migrate:create migration-name
npm run migrate:up
npm run migrate:down
```

## Deployment

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# Scale services
docker-compose up -d --scale core-api=2
```

### Manual Deployment

1. Build shared types: `cd shared && npm run build`
2. Build and deploy core API
3. Build and deploy RFID reader service
4. Build and serve frontend
5. Configure reverse proxy (nginx/Apache)

## Troubleshooting

### Common Issues

1. **RFID Reader Connection**: Check IP, port, and network connectivity
2. **Database Connection**: Verify PostgreSQL is running and credentials are correct
3. **Submodule Issues**: Run `git submodule update --init --recursive`
4. **Port Conflicts**: Check if ports 3000-3002 are available

### Logs

- Core API logs: `cd services/core-api && npm run logs`
- RFID Reader logs: `cd services/rfid-reader && npm run logs`
- Frontend logs: Browser developer console

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

## License

MIT License - see LICENSE file for details.