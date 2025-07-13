# Claude Code Hooks Dashboard 🚀

A modern React TypeScript dashboard for monitoring and managing Claude Code Hooks notifications in real-time. Built with React 19, Material UI, and TanStack Query for optimal performance and user experience.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-blue)](https://reactjs.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-5.15-blue)](https://mui.com/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## ✨ Features

- **Real-time Notifications** 📡 - Live updates via Server-Sent Events (SSE)
- **Audio Notifications** 🔊 - System-integrated sound alerts
- **Theme Switching** 🌙 - Light/dark mode with Material UI theming
- **Connection Monitoring** 📊 - Real-time connection status tracking
- **Notification Management** 📋 - Advanced table interface with filtering
- **Help System** ❓ - Contextual tooltips and guidance
- **Responsive Design** 📱 - Mobile-first approach with Material UI
- **Type Safety** 🛡️ - Full TypeScript coverage with strict mode
- **Modern Architecture** ⚡ - Component-level data fetching with React Query

## 🛠️ Tech Stack

### Core Technologies
- **React 19.1** - Latest React with concurrent features
- **TypeScript 5.7** - Strict type checking and latest features
- **Material UI 5.15** - Complete design system and components
- **TanStack React Query 5.17** - Server state management and caching
- **React Router DOM 6.21** - Client-side routing
- **Axios** - HTTP client with interceptors

### Development Tools
- **Vite** - Lightning fast build tool and dev server
- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing utilities
- **MSW** - API mocking for tests
- **ESLint** - Code linting with TypeScript rules
- **Prettier** - Code formatting
- **Husky** - Git hooks for quality gates

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Cordona/claude-code-hooks-dashboard.git
   cd claude-code-hooks-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Choose your development environment**

   **Option A: Local React + Docker Backend (Recommended)**
   ```bash
   npm run dev
   ```
   
   **Option B: Full Docker Environment**
   ```bash
   npm run dev:docker
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Development

### Available Scripts

#### Development
```bash
# Local development (React IDE + Backend Docker)
npm run dev

# Docker development (both services containerized)
npm run dev:docker

# Type checking
npm run type-check
```

#### Build & Preview
```bash
# Local build
npm run build

# Docker build  
npm run build:docker

# Preview production build
npm run preview
```

#### Code Quality
```bash
# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check
```

#### Testing
```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- ComponentName.test.tsx
```

### Environment Configuration

The project uses environment-specific configuration files:

- **`.environment/.env.local`** - Local development (React IDE + Backend Docker)
- **`.environment/.env.docker`** - Docker development

Key environment variables:
- `VITE_BACKEND_BASE_URL` - Backend API URL (default: `http://localhost:8085`)
- `VITE_EVENTS_STREAM_PATH` - SSE endpoint for real-time events
- `VITE_ENABLE_DEVTOOLS` - Toggle React Query DevTools

## 🏗️ Architecture

### Project Structure
```
src/
├── api/              # React Query hooks and API client
│   ├── client.ts     # Axios client configuration
│   ├── queries/      # useQuery hooks
│   └── mutations/    # useMutation hooks
├── components/       # React components
│   ├── ui/           # Reusable UI components (MUI-based)
│   └── features/     # Feature-specific components
├── hooks/            # Custom React hooks
├── contexts/         # React contexts (Theme, Help)
├── types/            # TypeScript type definitions
├── theme/            # Material UI theme configuration
├── utils/            # Utility functions
├── pages/            # Page components
├── config/           # Configuration files
├── assets/           # Static assets
├── lib/              # Third-party integrations
└── tests/            # Test files
```

### Key Patterns

- **Component-Level Data Fetching** - Components fetch their own data using React Query
- **Material UI Integration** - All components built on MUI foundation
- **Path Aliases** - Clean imports with `@/*` mapping to `./src/*`
- **Strict TypeScript** - Full type coverage with enhanced checking
- **Real-time Updates** - SSE connections for live data synchronization

### Data Flow
1. Components use React Query hooks from `src/api/`
2. API client handles HTTP requests with Axios interceptors
3. Server state managed by React Query cache
4. UI state managed with React Context
5. Real-time updates via `useSSEConnection` hook

## 🧪 Testing

The project uses a comprehensive testing setup:

- **Vitest** - Fast unit test runner
- **React Testing Library** - Component testing utilities
- **MSW** - API mocking for isolated tests
- **@testing-library/jest-dom** - Extended Jest matchers

Test files are located in `src/tests/` with a structure mirroring the source code.

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# UI mode
npm run test:ui
```

## 📚 Documentation

- [Development Guidelines](.claude/REACT_AND_TYPESCRIPT_DEV_GUIDELINES.md) - Architectural patterns and best practices
- [Project Instructions](CLAUDE.md) - Claude Code integration guidelines

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed
4. **Run quality checks**
   ```bash
   npm run lint
   npm run type-check
   npm test
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines

- Follow Single Responsibility Principle (SRP)
- Use TypeScript strict mode
- Write tests for new features
- Follow Material UI design patterns
- Use React Query for server state
- Implement proper error boundaries
- Add loading states for async operations

### Code Style

- ESLint configuration enforces consistent style
- Prettier handles code formatting
- Pre-commit hooks ensure quality
- TypeScript strict mode prevents common errors

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React Team](https://reactjs.org/) for the amazing framework
- [Material-UI Team](https://mui.com/) for the comprehensive design system
- [TanStack](https://tanstack.com/) for excellent state management tools
- [Vite Team](https://vitejs.dev/) for the blazing fast build tool

## 📞 Support

If you have any questions or need help:

- Open an [issue](https://github.com/Cordona/claude-code-hooks-dashboard/issues)
- Check the [documentation](CLAUDE.md)
- Review the [development guidelines](.claude/REACT_AND_TYPESCRIPT_DEV_GUIDELINES.md)

---

**Built with ❤️ for the Claude Code community**