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
├── nodejs-postgres/     # Node.js (Express + React) + PostgreSQL + Redis (fullstack, JWT auth)
├── python-flask/        # Flask + React + PostgreSQL (fullstack, JWT auth, learning-friendly)
└── python-fastapi/      # FastAPI + React + PostgreSQL + Redis (fullstack, JWT auth, 2025 recommended)
```

**All three examples include:**
- Real PostgreSQL database integration (not mocks)
- Complete CRUD operations with database models
- JWT authentication with React UI (login/signup/logout)
- Initialization scripts with test data
- Comprehensive README with testing procedures
- Dev Container configurations

## Development Commands

### Working with Dev Containers

All example projects use Dev Containers. Common workflow:

```bash
# 1. Open example directory in VSCode
# 2. F1 → "Dev Containers: Reopen in Container"
# 3. Wait for initial build (5-10 minutes first time)
```

### Node.js (Express + React) Example

**Location:** `examples/nodejs-postgres/`

**Services:** app (port 3000, 5173), PostgreSQL (port 5433), Redis (port 6379)

**Complete fullstack setup with:**
- **Frontend**: React 19 + Vite 6 + Tailwind CSS + JWT authentication UI
- **Backend**: Express + TypeScript + PostgreSQL + Redis
- **Authentication**: JWT with login/signup UI fully integrated
- **Production-ready**: Complete CRUD operations with real database

```bash
# Development (auto-starts via devcontainer)
npm run dev              # Start backend + frontend
npm run server:dev       # Backend only (Express + TypeScript)
npm run client:dev       # Frontend only (React + Vite)

# Database setup (node init-db.js)
npm run db:setup         # Initialize database with Node.js script

# Production build test
docker build --target production -t myapp:latest .
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Code Quality & Type Checking
npm run type-check       # TypeScript type checking (no emit)
npm run lint             # Run ESLint on all files
npm run lint:fix         # Auto-fix ESLint issues
```

**Key Configuration:**
- devcontainer.json: Uses docker-compose.yml in `.devcontainer/`
- Multi-stage Dockerfile with `development` and `production` targets
- Database initialization: `init-db.js` (Node.js script using `pg` package, **manual execution required**)
- PostCreateCommand: Commented out to avoid conflicts with auto-start command
- Auto-start: docker-compose.yml `command: sh -c "npm install && npm run dev"`
- remoteUser: `root` (python-fastapiと統一)
- Volume mount: Source code bind mount + **node_modules volume** (prevents platform mismatch for native modules like bcrypt)
- **First-time setup**: Run `npm run db:setup` manually after container starts

**Database Integration:**
- Real PostgreSQL database with `pg` package
- Database models: User, Item tables (defined in `src/index.ts`)
- Initialization script: `init-db.js` (Node.js script, not psql command)
- Default credentials: username=testuser, password=password123

**JWT Authentication Implementation:**
- jsonwebtoken (v9.0.2) for JWT token generation and verification
- bcrypt (v5.1.1) for password hashing
- Token expiration: 60 minutes (configurable via environment variable)
- Authentication middleware: `authenticateToken()` for protected routes
- Password requirements: Minimum 8 characters

**JWT Authentication Endpoints:**
```bash
# Register new user
curl -X POST "http://localhost:3000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","email":"new@example.com","password":"password123"}'

# Login (get token)
curl -X POST "http://localhost:3000/auth/token" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Get current user (requires Bearer token)
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/auth/me
```

**API Endpoints:**
```bash
# Health check (public)
curl http://localhost:3000/health

# Database connection test (public)
curl http://localhost:3000/db

# Redis connection test (public)
curl http://localhost:3000/redis

# Users API (protected - requires authentication)
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/users

# Items API (protected - requires authentication)
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/items

curl -X POST http://localhost:3000/api/items \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Item 1","description":"Description","price":99.99}'

# Frontend (React + Vite with JWT authentication UI)
# Open browser: http://localhost:5173
# Default login: username=testuser, password=password123
```

### Python Flask + React Example (Learning-Friendly)

**Location:** `examples/python-flask/`

**Services:** app (port 5001, 5173), PostgreSQL (port 5433)

**Complete fullstack setup with:**
- **Frontend**: React 19 + Vite 6 + Tailwind CSS + JWT authentication UI
- **Backend**: Flask + PostgreSQL
- **Authentication**: JWT with login/signup UI fully integrated
- **Learning-optimized**: Simple, easy-to-understand code patterns

```bash
# Database initialization (required on first run)
python init_db.py

# Backend development (auto-starts via devcontainer)
python app.py
# or
flask run --host=0.0.0.0 --port=5000 --debug

# Frontend development (separate terminal)
npm run dev

# React UI with JWT authentication
# Frontend: http://localhost:5173

# Default test credentials
# username: testuser
# password: password123

# Production build test
docker build --target production -t flask-app:latest .

# Code Quality & Type Checking (Frontend)
npm run type-check       # TypeScript type checking (no emit)
npm run lint             # Run ESLint on React frontend
npm run lint:fix         # Auto-fix ESLint issues
```

**Key Configuration:**
- **Frontend**: React 19 + Vite 6 + TypeScript + Tailwind CSS
- **JWT Authentication UI**: Login/signup forms, auth guards, token management
- PostgreSQL integration (Flask-SQLAlchemy)
- User and Item models with relationships
- RESTful API endpoints (GET, POST, PUT, DELETE)
- Password hashing with Flask-Bcrypt
- CORS preconfigured for React Vite (port 5173)
- JWT authentication fully integrated (backend + frontend)
- Pagination support
- Python 3.11-slim base image
- Black formatter, Pylint enabled
- Node.js 20.x installed in dev container for npm/React support

**Database Integration:**
- Real PostgreSQL database with Flask-SQLAlchemy
- Database models: User, Item tables (defined in `app.py`)
- Initialization script: `init_db.py` (creates tables and test user)
- Default credentials: username=testuser, password=password123

**JWT Authentication Endpoints:**
```bash
# Register new user
curl -X POST "http://localhost:5001/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","email":"new@example.com","password":"pass123"}'

# Login (get token)
curl -X POST "http://localhost:5001/auth/token" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Get current user (requires Bearer token)
curl -H "Authorization: Bearer <token>" \
  http://localhost:5001/auth/me
```

**API Endpoints:**
```bash
# Health check
curl http://localhost:5001/health

# Database connection test
curl http://localhost:5001/api/db-test

# Users API
curl http://localhost:5001/api/users
curl -X POST http://localhost:5001/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","email":"user1@example.com","password":"pass123"}'

# Items API
curl http://localhost:5001/api/items
curl -X POST http://localhost:5001/api/items \
  -H "Content-Type: application/json" \
  -d '{"title":"Item 1","description":"Description","price":99.99,"owner_id":1}'
```

### Python FastAPI + React Example (Recommended 2025)

**Location:** `examples/python-fastapi/`

**Services:** api (port 8000, 5173), PostgreSQL (port 5433), Redis (port 6379)

**Complete fullstack setup with:**
- **Frontend**: React 19 + Vite 6 + Tailwind CSS + JWT authentication UI
- **Backend**: FastAPI + PostgreSQL + Redis
- **Authentication**: JWT with login/signup UI fully integrated

```bash
# Database initialization (required on first run)
python init_db.py

# Backend development (auto-starts via devcontainer)
fastapi dev main.py --host 0.0.0.0 --port 8000

# Frontend development (separate terminal)
npm run dev

# API Documentation
# Swagger UI: http://localhost:8000/docs
# ReDoc: http://localhost:8000/redoc

# React UI with JWT authentication
# Frontend: http://localhost:5173

# Default test credentials
# username: testuser
# password: password123

# Production build test
docker build --target production -t fastapi-app:latest .

# Code Quality & Type Checking (Frontend)
npm run type-check       # TypeScript type checking (no emit)
npm run lint             # Run ESLint on React frontend
npm run lint:fix         # Auto-fix ESLint issues
```

**Key Configuration:**
- **Frontend**: React 19 + Vite 6 + TypeScript + Tailwind CSS
- **JWT Authentication UI**: Login/signup forms, auth guards, token management
- Uses Ruff (2025 recommended linter) instead of Pylint
- CORS preconfigured for React Vite (port 5173) + React.js (ports 3000, 3001)
- JWT authentication fully integrated (backend + frontend)
- Pydantic V2 for request/response validation
- Node.js 20.x installed in dev container for npm/React support

**Database Integration:**
- Real PostgreSQL database with SQLAlchemy 2.0 + asyncpg
- Database models: `models.py` (User, Item tables)
- CRUD operations: `crud.py` (async database operations)
- Database setup: `database.py` (connection pooling, session management)
- Initialization script: `init_db.py` (creates tables and test data)

**Database Initialization:**
```bash
# Run once after first container startup
python init_db.py
```

This creates:
- `users` table (id, email, username, hashed_password, is_active, timestamps)
- `items` table (id, title, description, price, owner_id, timestamps)
- Test user (username: testuser, password: password123)

**File Structure:**
```
examples/python-fastapi/
├── client/           # React frontend
│   ├── src/
│   │   ├── components/  # React components (Login, UserList, ItemList)
│   │   ├── App.tsx      # Main app with auth state
│   │   └── api.ts       # API client with JWT token management
│   ├── vite.config.ts   # Vite configuration
│   └── index.html       # HTML template
├── main.py           # FastAPI application with endpoints
├── database.py       # SQLAlchemy async engine and session
├── models.py         # Database table definitions (ORM)
├── crud.py           # Database CRUD operations
├── init_db.py        # Database initialization script
├── package.json      # npm dependencies (React, Vite, Tailwind)
├── requirements.txt  # Python production dependencies
└── .devcontainer/    # Dev Container configuration
```

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
   - **node_modules volume** (container-only, prevents platform mismatch for native modules)
   - Debugging ports exposed
   - Development environment variables
   - Automatic dependency installation via postCreateCommand

2. **`docker-compose.prod.yml`**: Production overrides
   - Resource limits (CPU, memory)
   - No volume mounts for source code
   - Production environment variables
   - Includes reverse proxy (Nginx) if needed

### CORS Configuration for Frontend-Backend Integration

The FastAPI example demonstrates proper CORS setup for React.js integration:

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
2. Start React.js frontend in another VSCode window (port 3000)
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

# Key variables (from within containers)
DATABASE_URL=postgresql://user:pass@db:5432/dbname
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

# 4. Test database initialization
# Node.js: npm run db:setup (or node init-db.js)
# FastAPI: python init_db.py
# Flask: python init_db.py

# 4.5. Run code quality checks
# All projects (Frontend):
npm run type-check       # TypeScript type checking
npm run lint             # ESLint code quality check

# 5. Test frontend (React projects)
# Node.js: Open http://localhost:5173
# FastAPI: npm run dev → http://localhost:5173

# 6. Test endpoints
# Node.js: curl http://localhost:3000/health
# Flask: curl http://localhost:5000/health
# FastAPI: curl http://localhost:8000/health

# 7. Test user creation
# Node.js:
curl -X POST "http://localhost:3000/api/users" \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"password123"}'

# FastAPI:
curl -X POST "http://localhost:8000/users" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser2","password":"password123"}'

# 8. Clean up
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

## Debugging in Dev Containers

All example projects are configured for debugging in VSCode Dev Containers. This section covers debugging for both backend and frontend code.

### Understanding Debugging Terminology

Before diving into debugging, let's clarify key terms:

**デバッガー (Debugger)**
- プログラムの実行を制御し、内部状態を検査できるツール
- 英語: A tool that allows you to control program execution and inspect internal state

**ブレークポイント (Breakpoint)**
- プログラムの実行を一時停止する位置
- コードの特定の行に設定し、その行に到達すると実行が停止する
- 英語: A marker that pauses program execution at a specific line

**ステップ実行 (Step Execution)**
- コードを1行ずつ実行して動作を追跡する機能
  - **Step Over (ステップオーバー)**: 関数呼び出しを1ステップとして実行
  - **Step Into (ステップイン)**: 関数の中に入って実行
  - **Step Out (ステップアウト)**: 現在の関数から抜ける
- 英語: Execute code line by line to trace behavior

**変数ウォッチ (Watch Variables)**
- 変数の値をリアルタイムで監視する機能
- デバッガーが停止している間、変数の現在の値を確認できる
- 英語: Monitor variable values in real-time during debugging

**コールスタック (Call Stack)**
- 関数の呼び出し履歴を表示
- 現在の関数がどこから呼ばれたかを追跡できる
- 英語: Shows the chain of function calls that led to the current point

**アタッチ (Attach)**
- すでに実行中のプロセスにデバッガーを接続すること
- Dev Containersでは、コンテナ内で動作しているプロセスにアタッチする
- 英語: Connect the debugger to an already running process

### Debug Configuration Files

All examples include `.vscode/launch.json` for debugging configuration:

**Node.js Example** (`examples/nodejs-postgres/.vscode/launch.json`):
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend (Node.js)",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "restart": true,
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug Frontend (Chrome)",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/client"
    }
  ]
}
```

**Python Examples** (`examples/python-fastapi/.vscode/launch.json`):
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug FastAPI",
      "type": "debugpy",
      "request": "launch",
      "module": "uvicorn",
      "args": ["main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
      "jinja": true,
      "justMyCode": false
    },
    {
      "name": "Debug Tests (pytest)",
      "type": "debugpy",
      "request": "launch",
      "module": "pytest",
      "args": ["-v", "--tb=short"],
      "console": "integratedTerminal",
      "justMyCode": false
    }
  ]
}
```

### Debugging Backend Code

#### Node.js/Express Debugging

**Prerequisites:**
- Backend must be started with `--inspect` flag (already configured in dev container)
- Port 9229 exposed for debugger connection

**Steps:**
1. **Set Breakpoints**
   - Open backend file (e.g., `src/index.ts`)
   - Click left margin next to line number (red dot appears)
   - Breakpoint will pause execution when that line is reached

2. **Start Debugging**
   - Press `F5` or Run → Start Debugging
   - Select "Debug Backend (Node.js)" configuration
   - Debugger attaches to running Node.js process

3. **Trigger Breakpoint**
   - Make API request (e.g., `curl http://localhost:3000/api/users`)
   - Execution pauses at breakpoint
   - VSCode Debug panel shows:
     - **Variables**: Current variable values
     - **Call Stack**: Function call hierarchy
     - **Watch**: Custom expressions to monitor

4. **Step Through Code**
   - **F10**: Step Over (execute current line, don't enter functions)
   - **F11**: Step Into (enter function calls)
   - **Shift+F11**: Step Out (exit current function)
   - **F5**: Continue (run until next breakpoint)

5. **Inspect Variables**
   - Hover over variables to see values
   - Use Debug Console to evaluate expressions
   - Add variables to Watch panel for continuous monitoring

**Example Debugging Session:**
```typescript
// src/index.ts
app.get('/api/users', async (req, res) => {
  // Set breakpoint here ← Click to add breakpoint
  const users = await pool.query('SELECT * FROM users');
  // Debugger pauses, inspect 'users' variable
  res.json(users.rows);
});
```

#### Python/FastAPI Debugging

**Prerequisites:**
- `debugpy` extension installed (included in devcontainer)
- FastAPI app configured for debugging

**Steps:**
1. **Set Breakpoints**
   - Open Python file (e.g., `main.py`)
   - Click left margin to add breakpoint

2. **Start Debugging**
   - Press `F5` → Select "Debug FastAPI"
   - Server starts in debug mode
   - Breakpoints become active

3. **Debug API Endpoints**
   ```python
   # main.py
   @app.get("/users")
   async def get_users(db: AsyncSession = Depends(get_db)):
       # Set breakpoint here ← Click to add
       users = await crud.get_users(db)
       # Inspect 'users' variable in Debug panel
       return users
   ```

4. **Debug Async Code**
   - FastAPI uses async/await
   - Debugger can step through async functions
   - Watch panel shows Promise states

**Python Flask Debugging (similar process):**
```python
# app.py
@app.route('/api/users')
def get_users():
    # Set breakpoint here
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])
```

#### Debugging Tests

**Node.js/Jest:**
```bash
# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# In VSCode:
# 1. Set breakpoint in test file
# 2. F5 → "Debug Jest Tests"
```

**Python/pytest:**
```bash
# Method 1: VSCode launch configuration
# 1. Set breakpoint in tests/test_*.py
# 2. F5 → "Debug Tests (pytest)"

# Method 2: Command line
pytest --pdb  # Drops into debugger on failure
```

**Example Test Debugging:**
```python
# tests/test_auth.py
async def test_login_success(client, test_user_data):
    # Set breakpoint here
    response = await client.post("/users", json=test_user_data)
    # Debugger pauses, inspect 'response' object
    assert response.status_code == 201
```

### Debugging Frontend Code

#### React/Vite Debugging

**Browser DevTools (Recommended for Frontend):**
1. Open browser: `http://localhost:5173`
2. Press `F12` to open DevTools
3. Go to **Sources** tab
4. Find your React component files (mapped via source maps)
5. Click line number to set breakpoint
6. Interact with UI to trigger breakpoint

**VSCode Chrome Debugger:**
1. Install "Debugger for Chrome" extension (if not included)
2. Set breakpoint in React component (e.g., `client/src/App.tsx`)
3. Press `F5` → Select "Debug Frontend (Chrome)"
4. VSCode opens Chrome with debugger attached
5. Breakpoints in VSCode work in browser

**Example React Debugging:**
```typescript
// client/src/components/UserList.tsx
const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Set breakpoint here
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        // Inspect 'data' in debugger
        setUsers(data);
      });
  }, []);

  return <div>{/* ... */}</div>;
};
```

**React DevTools Browser Extension:**
- Install React DevTools extension
- Inspect component hierarchy
- View component props and state
- Profile component rendering

### Remote Debugging in Dev Containers

**How it Works:**
Dev Containers run code inside Docker containers, but VSCode debugger runs on your host machine. Port forwarding makes this seamless.

**Port Configuration:**
```json
// .devcontainer/devcontainer.json
{
  "forwardPorts": [
    3000,   // Backend server
    5173,   // Frontend dev server
    9229    // Node.js debugger port
  ],
  "portsAttributes": {
    "9229": {
      "label": "Node.js Debug",
      "onAutoForward": "silent"  // Don't show notification
    }
  }
}
```

**Troubleshooting Remote Debugging:**

1. **Debugger Won't Attach**
   - Verify port is forwarded: Check PORTS tab in VSCode
   - Ensure process started with `--inspect` flag
   - Check firewall isn't blocking port

2. **Breakpoints Not Hit**
   - Verify source maps are enabled
   - Check file paths match between container and host
   - Ensure code is actually executing (not cached)

3. **Variables Show "undefined"**
   - May be optimized out in production builds
   - Use development builds for debugging
   - Check `justMyCode: false` in launch.json

### Common Debugging Patterns

#### Debugging Database Queries

**Node.js with pg:**
```typescript
// Enable query logging
const pool = new Pool({
  // ...
  log: (msg) => console.log('PG:', msg)  // Log all queries
});

// Debug specific query
app.get('/api/users', async (req, res) => {
  const query = 'SELECT * FROM users WHERE id = $1';
  const params = [req.params.id];

  console.log('Query:', query, 'Params:', params);  // ← Debug log
  const result = await pool.query(query, params);
  console.log('Result rows:', result.rows.length);   // ← Debug log

  res.json(result.rows);
});
```

**Python with SQLAlchemy:**
```python
# Enable SQL logging
engine = create_async_engine(
    DATABASE_URL,
    echo=True  # Prints all SQL queries to console
)

# Debug specific query
@app.get("/users/{user_id}")
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    # Set breakpoint here
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    # Inspect 'user' object in debugger
    return user
```

#### Debugging Authentication Issues

**JWT Token Inspection:**
```typescript
// Node.js
import jwt from 'jsonwebtoken';

app.post('/api/protected', authenticateToken, (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log('Token:', token);  // ← Check raw token

  const decoded = jwt.decode(token, { complete: true });
  console.log('Decoded:', decoded);  // ← Inspect payload

  // Set breakpoint to inspect req.user
  res.json({ user: req.user });
});
```

**Python:**
```python
from jose import jwt

@app.get("/protected")
async def protected_route(current_user: User = Depends(get_current_user)):
    # Set breakpoint here
    # Inspect 'current_user' to verify authentication
    return {"user": current_user}
```

#### Debugging Async Code

**Python async/await:**
```python
async def complex_operation():
    # Set breakpoint here
    result1 = await fetch_data()  # Step into with F11

    # Inspect result1 in debugger
    result2 = await process_data(result1)

    return result2
```

**JavaScript Promises:**
```typescript
async function fetchUsers() {
  try {
    // Set breakpoint here
    const response = await fetch('/api/users');
    const data = await response.json();  // Step through await

    // Inspect 'data' in debugger
    return data;
  } catch (error) {
    // Breakpoint here to catch errors
    console.error('Error:', error);
  }
}
```

### Performance Debugging

**Node.js Performance Profiling:**
```bash
# Start with profiling enabled
node --inspect --prof src/index.ts

# Generate profile report
node --prof-process isolate-*.log > profile.txt
```

**Python Memory Profiling:**
```bash
# Install memory_profiler
pip install memory-profiler

# Profile specific function
@profile
def memory_intensive_function():
    # Your code here
    pass

# Run with profiling
python -m memory_profiler main.py
```

**VSCode Performance Extensions:**
- **Flame Chart**: Visualize execution time
- **Python Profiler**: Built-in Python profiling
- **Chrome DevTools**: Frontend performance profiling

### Debugging Best Practices

1. **Use Descriptive Breakpoints**
   - Right-click breakpoint → Edit Breakpoint → Add condition
   - Example: `user.id === 123` (only breaks for specific user)

2. **Leverage Logpoints**
   - Right-click line → Add Logpoint
   - Logs message without stopping execution
   - Example: `User ID: {user.id}, Status: {user.status}`

3. **Debug Console for Quick Tests**
   - While paused at breakpoint, use Debug Console
   - Execute expressions: `user.email`, `users.length`
   - Modify variables: `user.role = 'admin'` (temporary change)

4. **Source Maps**
   - Ensure TypeScript/Babel generates source maps
   - Allows debugging original source, not transpiled code
   - Check `tsconfig.json`: `"sourceMap": true`

5. **Environment-Specific Debugging**
   - Development: Full debugging, verbose logging
   - Production: Minimal logging, error tracking only
   - Use environment variables: `DEBUG=true`

### Debugging Resources

**VSCode Debugging Documentation:**
- Node.js: https://code.visualstudio.com/docs/nodejs/nodejs-debugging
- Python: https://code.visualstudio.com/docs/python/debugging

**Browser DevTools:**
- Chrome: https://developer.chrome.com/docs/devtools/
- Firefox: https://firefox-source-docs.mozilla.org/devtools-user/

**Framework-Specific:**
- FastAPI: https://fastapi.tiangolo.com/tutorial/debugging/
- Express: https://expressjs.com/en/guide/debugging.html
- React: https://react.dev/learn/react-developer-tools

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

**Node.js Database Operations:**
```bash
# Initialize database (create tables + test data)
npm run db:setup
# or
node init-db.js

# Check tables in PostgreSQL
docker compose exec db psql -U postgres -d myapp -c "\dt"

# View users table
docker compose exec db psql -U postgres -d myapp -c "SELECT * FROM users;"

# View items table
docker compose exec db psql -U postgres -d myapp -c "SELECT * FROM items;"
```

**FastAPI Database Operations:**
```bash
# Initialize database (create tables + test data)
python init_db.py

# Check tables in PostgreSQL
docker compose exec db psql -U postgres -d fastapi_db -c "\dt"

# View users table
docker compose exec db psql -U postgres -d fastapi_db -c "SELECT * FROM users;"

# View items table
docker compose exec db psql -U postgres -d fastapi_db -c "SELECT * FROM items;"
```

**Database Initialization Pattern (Unified):**
- **Node.js**: `init-db.js` - Node.js script using `pg` package (no psql command, **manual execution required**)
- **Python FastAPI**: `init_db.py` - Python async script with SQLAlchemy (**manual execution required**)
- **Python Flask**: `init_db.py` - Python script with Flask-SQLAlchemy (**manual execution required**)
- **Common approach**: All use language-native database clients with DATABASE_URL environment variable (no manual password entry)
- **IMPORTANT**: Database initialization is **NOT** executed automatically on container startup to avoid conflicts with auto-start commands. Run manually after first container startup.

## Port Conventions

Standardized across examples:
- **3000**: Node.js/Express backend
- **5173**: React + Vite frontend (Node.js and FastAPI projects)
- **5001**: Flask backend (host), 5000 (container)
- **8000**: FastAPI backend
- **5433**: PostgreSQL (host), 5432 (container)
- **6379**: Redis
- **9229**: Node.js debugger

**Important Note:** When accessing services from within dev containers, use the container-internal ports (e.g., `db:5432` for PostgreSQL). When accessing from the host machine, use the mapped ports (e.g., `localhost:5433`).

## Troubleshooting Common Issues

### Dockerfile build errors (python-fastapi)

**Error:** `curl: not found` during Node.js installation in python-fastapi example

**Cause:** In Dockerfile, attempting to use `curl` before it's installed

**Solution:** Ensure correct RUN command order in Dockerfile:
```dockerfile
# ✅ Correct: Install curl first
RUN apt-get update && apt-get install -y \
    git vim curl postgresql-client gcc \
    && rm -rf /var/lib/apt/lists/*

# Then use curl to install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs
```

After fixing, rebuild: F1 → "Dev Containers: Rebuild Container"

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

### Database tables not found (relation "users" does not exist)

**Error:** `error: relation "users" does not exist` when accessing API endpoints

**Cause:** Database initialization script (`init-db.js` or `init_db.py`) was not executed

**Solution:**
```bash
# Node.js example - Manually run database setup inside Dev Container
npm run db:setup

# Python FastAPI example - Manually run inside Dev Container
python init_db.py

# Python Flask example - Manually run inside Dev Container
python init_db.py

# Or from host machine (if container is running but not accessible)
docker exec nodejs-postgres_devcontainer-app-1 npm run db:setup
docker exec python-fastapi_devcontainer-api-1 python init_db.py
docker exec python-flask_devcontainer-app-1 python init_db.py
```

**Important:** Database initialization is **intentionally manual** to avoid conflicts with auto-start commands. Always run the initialization script manually after first container startup.

### postCreateCommand failures (exit code 137 or dependency conflicts)

**Error:** `postCreateCommand failed with exit code 137` or `ERESOLVE unable to resolve dependency tree`

**Cause:**
- **Exit code 137**: OOM (Out of Memory) kill, or timing conflicts with docker-compose `command`
- **Dependency conflicts**: For nodejs-postgres, React 19 requires @testing-library/react ^16.0.0 (not ^14.x)

**Solution:**
```bash
# 1. For React 19 dependency conflicts (nodejs-postgres only)
# Ensure package.json has:
"@testing-library/react": "^16.0.0"
"@testing-library/jest-dom": "^6.6.0"

# 2. Clean up and rebuild
rm -rf node_modules package-lock.json
docker compose down -v
F1 → "Dev Containers: Rebuild Container"

# 3. If still failing, check Docker Desktop memory allocation
# Docker Desktop → Settings → Resources → Memory (set to 4GB+ minimum)
```

**Prevention:**
- All projects now use **manual database initialization** to avoid postCreateCommand conflicts
- postCreateCommand only installs dependencies (npm install / pip install)
- Database setup (`npm run db:setup` / `python init_db.py`) runs manually after container starts

### Native module errors (bcrypt, node-gyp)

**Error:** `Cannot find module '/workspace/node_modules/bcrypt/lib/binding/napi-v3/bcrypt_lib.node'`

**Cause:** Platform mismatch - native modules compiled for macOS (host) being used in Linux (container)

**Solution (Immediate):**
```bash
# Inside Dev Container
npm rebuild
```

**Solution (Permanent - Already Applied):**
All projects now use **named volume for node_modules** to prevent host/container conflicts:

```yaml
# docker-compose.yml
volumes:
  - ..:/workspace:cached
  - node_modules:/workspace/node_modules  # Container-only volume

volumes:
  node_modules:  # Named volume (not shared with host)
```

**Benefits:**
- Native modules (bcrypt, node-gyp, etc.) are compiled for Linux only
- No platform mismatch between macOS host and Linux container
- Faster npm operations (no cross-filesystem sync)

**Note:** This means node_modules is NOT visible on your host machine. To inspect packages, use the Dev Container terminal.

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
