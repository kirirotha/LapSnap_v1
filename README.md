# Race Timing System

A comprehensive RFID-based race timing system built with Node.js, React, and TypeScript.

## Architecture

This monorepo contains:

- **services/rfid-reader**: RFID reader service for capturing tag reads (Git Submodule)
- **services/core-api**: Core API server for race management and data processing (Git Submodule)
- **frontend**: React TypeScript web interface for race management and live results
- **shared**: Shared TypeScript types and utilities across all services

## Project Status

✅ **Frontend**: Complete React TypeScript application with Material-UI  
✅ **Shared Types**: TypeScript definitions for all data structures  
✅ **Backend Services**: Integrated as Git submodules from existing repositories  
✅ **Development Environment**: Docker Compose setup for local development  
✅ **Workspace Management**: NPM workspace configuration for all packages  

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
npm install

# Install submodule dependencies
npm run install:submodules
```

### 3. Build Shared Types

```bash
cd shared
npm run build
```

### 4. Start Development

#### Option A: Full Stack (requires backend setup)
```bash
# Start database and Redis
docker-compose up -d database redis

# Start all services
npm run dev
```

#### Option B: Frontend Only (with mock data)
```bash
cd frontend
npm start
```

Access the application at:
- Frontend: http://localhost:3002
- Core API: http://localhost:3000 (when running)
- RFID Reader service: http://localhost:3001 (when running)

## Frontend Features

### Dashboard
- System status monitoring with real-time indicators
- Statistics overview (races, participants, tag reads)
- Modern Material-UI design with responsive layout

### Race Management
- Create and configure races (time-based, lap-based, unlimited)
- Real-time race control (start, stop, pause, resume)
- Edit race settings and view race status

### Live Results
- Real-time participant standings and lap times
- Best lap highlighting and position tracking
- Export functionality (CSV, PDF, JSON)
- WebSocket integration for instant updates

### Technical Stack
- **Frontend**: React 19 + TypeScript + Material-UI v7
- **Backend Services**: Node.js with existing RFID integration
- **Real-time**: Socket.IO for live updates
- **Database**: PostgreSQL with Redis caching
- **Types**: Shared TypeScript definitions

## Development

### Frontend Development

```bash
cd frontend
npm start
```

The frontend runs with mock data and provides a complete UI for:
- Race creation and management
- Live results display
- System monitoring dashboard

### Working with Submodules

```bash
# Update submodules to latest
git submodule update --remote

# Make changes in a submodule
cd services/core-api
git add .
git commit -m "Your changes"
git push origin main

# Update main repo to track the new commit
cd ../..
git add services/core-api
git commit -m "Update core-api submodule"
```

### Adding Backend Integration

When your backend services are running, update the API endpoints in:
- `frontend/src/services/api.ts` - Base API configuration
- `frontend/src/services/raceApi.ts` - Race-specific API calls
- `frontend/src/services/socketService.ts` - WebSocket connection

## Repository Structure

```
race-timing-system/
├── services/
│   ├── core-api/           # Git submodule: timer_v1_APIserver
│   └── rfid-reader/        # Git submodule: timer_live_v1
├── frontend/               # React TypeScript application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Dashboard, Races, Results
│   │   ├── services/       # API and WebSocket services
│   │   └── App.tsx         # Main application
│   ├── package.json
│   └── .env               # Environment configuration
├── shared/                 # Shared TypeScript types
│   ├── src/types/         # Interface definitions
│   └── constants.ts       # Shared constants
├── package.json           # Workspace configuration
├── docker-compose.yml     # Development environment
└── README.md              # This file
```

## Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL=postgres://race_user:race_password@localhost:5432/race_timing
REDIS_URL=redis://localhost:6379

# RFID Reader
READER_IP=192.168.1.100
READER_PORT=5084

# API Endpoints
API_PORT=3000
RFID_READER_API_PORT=3001
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Build and test: `npm run build && npm test`
5. Commit your changes: `git commit -m "Add new feature"`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for the racing community**