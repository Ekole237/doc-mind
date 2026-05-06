# DocMind

A modern document management and AI-powered chat application built with a monorepo architecture using Vite, NestJS, and shadcn/ui.

## 🚀 Features

- **Document Management**: Upload, organize, and manage documents
- **AI-Powered Chat**: Interact with your documents using AI
- **Admin Dashboard**: Comprehensive admin interface for managing users and content
- **Authentication**: Secure JWT-based authentication with magic links
- **Modern UI**: Beautiful interface built with shadcn/ui components

## 📋 Prerequisites

- Node.js (>=20)
- npm (>=11.6.2) or pnpm
- PostgreSQL database
- Docker (for running services)

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone  https://github.com/Ekole237/doc-mind
cd doc-mind
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the environment example file and configure your environment variables:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

- **Database**: Set up your PostgreSQL connection string
- **Authentication**: Generate secure JWT and cookie secrets
- **CORS**: Configure allowed origins for your frontend
- **Server**: Set the port and environment mode

For the frontend, create `apps/web/.env.local`:

```bash
cp .env.example apps/web/.env.local
# Edit apps/web/.env.local with your API URL
```

### 4. Database Setup

Ensure your PostgreSQL database is running and accessible with the connection string provided in `DATABASE_URL`.

### 5. Start Development Services

Start the required services (like PostgreSQL) using Docker:

```bash
npm run services
```

### 6. Run the Application

Start both the backend API and frontend in development mode:

```bash
# Start both backend and frontend
npm run dev

# Or start them separately:
npm run dev:back  # Backend API (port 3001)
npm run dev:front # Frontend (port 3000/5173)
```

## 📁 Project Structure

```
doc-mind/
├── apps/
│   └── web/                 # Frontend React application
├── services/              # Qdrant vector database
│   └── api/              # Backend NestJS API
│      └── .env.example   # Environment variables template
├── packages/
│   └── ui/                  # Shared UI components
├── infra/
│   └── docker/              # Docker configurations
└── .env.example             # Environment variables template
```

## 🎨 UI Components

This project uses shadcn/ui for consistent and beautiful UI components.

### Adding Components

To add new components to your app, run:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the UI components in the `packages/ui/src/components` directory.

### Using Components

Import components from the shared UI package:

```tsx
import { Button } from "@workspace/ui/components/button";
```

## 🛠️ Available Scripts

- `npm run dev` - Start both backend and frontend in development
- `npm run dev:back` - Start only the backend API
- `npm run dev:front` - Start only the frontend
- `npm run build` - Build all packages and applications
- `npm run services` - Start Docker services
- `npm run services:down` - Stop Docker services
- `npm run lint` - Lint all packages
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Type check all TypeScript files

## 🔧 Environment Variables

### Backend (.env)

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token signing
- `COOKIE_SECRET` - Secret for cookie security
- `CORS_ORIGINS` - Comma-separated list of allowed origins
- `PORT` - API server port (default: 3001)
- `NODE_ENV` - Environment mode (development/production)

### Frontend (apps/web/.env.local)

- `VITE_API_URL` - Backend API URL

## 📝 Development Notes

- This is a monorepo using npm workspaces
- The backend uses NestJS with Prisma ORM
- The frontend uses Vite with React and TypeScript
- UI components are shared across the monorepo
- Turbo is used for efficient builds and caching
