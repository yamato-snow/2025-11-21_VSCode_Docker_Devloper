# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an educational repository demonstrating VSCode + Docker development workflows. It contains:
- Comprehensive Japanese guide (README.md) on Dev Containers and Docker extension usage
- Three production-ready example projects showcasing different tech stacks
- Complete devcontainer configurations for each stack

**Repository Structure:**
```
examples/
├── nodejs-postgres/     # Next.js + PostgreSQL + Redis (fullstack)
├── python-flask/        # Flask + PostgreSQL (backend API)
└── python-fastapi/      # FastAPI + PostgreSQL + Redis (backend API, 2025 recommended)
```

## Development Commands

### Working with Dev Containers

All example projects use Dev Containers. Common workflow:

```bash
# 1. Open example directory in VSCode
# 2. F1 → "Dev Containers: Reopen in Container"
# 3. Wait for initial build (5-10 minutes first time)
```

### Node.js (Next.js) Example

**Location:** `examples/nodejs-postgres/`

**Services:** app (port 3000), PostgreSQL (port 5433), Redis (port 6379)

```bash
# Development
npm run dev              # Start development server
npm run db:setup         # Initial database setup
npm run db:migrate       # Run migrations

# Production build test
docker build --target production -t myapp:latest .
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

**Key Configuration:**
- devcontainer.json: Uses docker-compose.yml in `.devcontainer/`
- Multi-stage Dockerfile with `development` and `production` targets
- PostCreateCommand: `npm install && npm run db:setup`
- PostStartCommand: `npm run db:migrate`

### Python Flask Example

**Location:** `examples/python-flask/`

**Services:** api (port 5000), PostgreSQL (port 5433)

```bash
# Development (auto-starts via devcontainer)
flask run --host=0.0.0.0

# Production build test
docker build --target production -t flask-app:latest .
```

**Key Configuration:**
- Simpler setup for learning/prototyping
- Python 3.11-slim base image
- Black formatter, Pylint enabled

### Python FastAPI Example (Recommended 2025)

**Location:** `examples/python-fastapi/`

**Services:** api (port 8000), PostgreSQL (port 5433), Redis (port 6379)

```bash
# Development (auto-starts via devcontainer)
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# API Documentation
# Swagger UI: http://localhost:8000/docs
# ReDoc: http://localhost:8000/redoc

# Default test credentials
# username: testuser
# password: password123

# Production build test
docker build --target production -t fastapi-app:latest .
```

**Key Configuration:**
- Uses Ruff (2025 recommended linter) instead of Pylint
- CORS preconfigured for Next.js integration (ports 3000, 3001)
- JWT authentication sample implementation
- Pydantic V2 for request/response validation

## Architecture Patterns

### Multi-Stage Dockerfile Pattern

All examples use multi-stage builds to separate development and production:

```dockerfile
# Stage: base - shared dependencies
FROM <language>:<version> AS base

# Stage: development - dev tools, hot reload
FROM base AS development
# Includes: git, vim, debuggers, extra tooling
# Volume mounts: source code for hot reload
# User: typically root or language default user

# Stage: production - minimal, secure
FROM base AS production
# Minimal dependencies only
# No dev tools
# Non-root user
# Healthcheck included
```

**Key Difference:** Dev Container always targets the `development` stage. Production deployments target the `production` stage.

### Docker Compose Orchestration

Each example has two compose files:

1. **`.devcontainer/docker-compose.yml`**: Development-optimized
   - Volume mounts for hot reload
   - Debugging ports exposed
   - Development environment variables
   - Automatic dependency installation via postCreateCommand

2. **`docker-compose.prod.yml`**: Production overrides
   - Resource limits (CPU, memory)
   - No volume mounts for source code
   - Production environment variables
   - Includes reverse proxy (Nginx) if needed

### CORS Configuration for Frontend-Backend Integration

The FastAPI example demonstrates proper CORS setup for Next.js integration:

```python
# main.py
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Workflow for fullstack development:**
1. Start FastAPI backend in one VSCode window (port 8000)
2. Start Next.js frontend in another VSCode window (port 3000)
3. Frontend calls backend via `http://localhost:8000/api/*`

## Dev Container Configuration Patterns

### Common devcontainer.json Structure

```json
{
  "name": "Project Name",
  "dockerComposeFile": "docker-compose.yml",
  "service": "app",
  "workspaceFolder": "/workspace",

  "forwardPorts": [3000, 5433],
  "portsAttributes": {
    "3000": {"label": "App", "onAutoForward": "notify"}
  },

  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {}
  },

  "customizations": {
    "vscode": {
      "extensions": ["..."],
      "settings": {"..."}
    }
  },

  "postCreateCommand": "npm install",
  "postStartCommand": "npm run db:migrate",
  "remoteUser": "node",
  "shutdownAction": "stopCompose"
}
```

### Lifecycle Commands

- **postCreateCommand**: Runs once after container creation (install dependencies)
- **postStartCommand**: Runs every time container starts (migrations, health checks)
- **postAttachCommand**: Runs when VSCode connects to container (welcome messages)

### VSCode Extension Management

Extensions specified in `devcontainer.json` are automatically installed in the container. To add extensions:

1. Find extension ID: Right-click in VSCode extensions panel → "Copy Extension ID"
2. Add to `customizations.vscode.extensions` array
3. Rebuild container: F1 → "Dev Containers: Rebuild Container"

## Environment Variables

Each example uses `.env.example` files. Pattern:

```bash
# Copy and configure before first run
cp .env.example .env

# Key variables
DATABASE_URL=postgresql://user:pass@db:5433/dbname
REDIS_URL=redis://redis:6379
SECRET_KEY=change_in_production
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Note:** `.env` files are gitignored. Developers must create their own from `.env.example`.

## Python Framework Selection (2025 Guidance)

The repository provides both Flask and FastAPI examples. From the README analysis:

**Use FastAPI when:**
- Building production APIs (3-4x faster than Flask)
- Need automatic API documentation (Swagger/ReDoc)
- Want type safety with Pydantic
- Integrating with AI/ML services
- Team has modern Python experience (async/await, type hints)

**Use Flask when:**
- Learning web frameworks for first time
- Building simple internal tools
- Need maximum flexibility
- Working with legacy Flask ecosystem

**FastAPI advantages (2025):**
- 150% job market growth (2024-2025)
- Native async support (ASGI)
- Enterprise adoption by Uber, Microsoft, Netflix
- Automatic OpenAPI schema generation

## Testing Changes

Before committing changes to example projects:

```bash
# 1. Test Dev Container build
F1 → "Dev Containers: Rebuild Container"

# 2. Test production build
docker build --target production -t test:latest .

# 3. Verify services start
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
docker compose logs -f

# 4. Test endpoints
# Node.js: curl http://localhost:3000
# Flask: curl http://localhost:5000/health
# FastAPI: curl http://localhost:8000/health

# 5. Clean up
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

## Database Management

All examples use PostgreSQL. Common patterns:

**Connection from container:**
```bash
# Inside dev container
psql -h db -U postgres -d myapp

# Or via docker compose
docker compose exec db psql -U postgres
```

**VSCode SQLTools integration:**
All devcontainer.json files include SQLTools configuration for GUI database access within VSCode.

**Migration pattern:**
- Node.js: Custom migrations in `npm run db:migrate`
- Python: Typically uses Alembic (not included in basic examples)

## Port Conventions

Standardized across examples:
- **3000**: Node.js/Next.js frontend
- **5000**: Flask backend
- **8000**: FastAPI backend
- **5433**: PostgreSQL
- **6379**: Redis
- **9229**: Node.js debugger

## Troubleshooting Common Issues

### Container won't start
```bash
# Check Docker Desktop is running
docker ps

# Check logs
docker compose logs app

# Nuclear option: rebuild from scratch
docker compose down -v  # Removes volumes!
F1 → "Dev Containers: Rebuild Container"
```

### Port already in use
```bash
# macOS/Linux
lsof -i :3000

# Windows
netstat -ano | findstr :3000

# Change port in devcontainer.json forwardPorts
```

### Slow file synchronization (macOS/Windows)
```bash
# Add to docker-compose.yml volumes
- ..:/workspace:cached  # cached flag improves performance

# Or use volume-only dev containers
F1 → "Dev Containers: Clone Repository in Container Volume"
```

### Database connection refused
- Verify `depends_on` with `condition: service_healthy` in docker-compose.yml
- Check database container started: `docker compose ps db`
- Confirm correct service name in DATABASE_URL (use service name, not `localhost`)

## Modifying Examples for New Projects

1. **Copy example directory:**
   ```bash
   cp -r examples/python-fastapi/ ../my-new-project/
   ```

2. **Customize devcontainer.json:**
   - Change `name`
   - Update `forwardPorts`
   - Add/remove VSCode extensions
   - Modify lifecycle commands

3. **Update Dockerfile:**
   - Change base image version if needed
   - Add project-specific dependencies
   - Adjust health check endpoint

4. **Configure docker-compose.yml:**
   - Update service names
   - Modify environment variables
   - Add/remove services (e.g., add MongoDB, remove Redis)

5. **Test:** F1 → "Dev Containers: Reopen in Container"

## Documentation Cross-Reference

- **Main guide:** README.md (comprehensive VSCode + Docker tutorial in Japanese)
- **Examples overview:** examples/README.md (quick start for each example)
- **Individual examples:** Each has its own .devcontainer configuration files

When making changes, ensure consistency across:
1. README.md sections
2. examples/README.md
3. Individual devcontainer.json files
4. This CLAUDE.md file
