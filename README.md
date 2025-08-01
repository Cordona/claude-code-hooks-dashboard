# Claude Code Hooks Dashboard 🚀

A modern React TypeScript dashboard for monitoring and managing Claude Code Hooks notifications in real-time. Built with React 19, Material UI, and TanStack Query for optimal performance and user experience.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-blue)](https://reactjs.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-5.15-blue)](https://mui.com/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## ✨ Features

### 🔐 Authentication & Security
- **OAuth2/OIDC Integration** - Secure authentication with Keycloak
- **JWT Token Management** - Automatic token refresh and session handling
- **Role-based Access Control** - Protected routes and API endpoints

### 🔑 API Key Management
- **API Key Generation** - Secure multi-step wizard for creating Claude Code API keys
- **Permission Configuration** - Granular permission settings (hooks:write, hooks:read, admin:all)
- **Expiration Management** - Calendar-based expiration date selection
- **Security-First UX** - "Show once only" pattern with copy functionality
- **Key Details Display** - Complete key information with inline formatting

### 📡 Real-time Notifications
- **Live Updates** - Server-Sent Events (SSE) for real-time notification streaming with SRP-compliant architecture
- **Robust Connection Management** - Separate hooks for connection (`useSSEConnect`) and disconnection (`useSSEDisconnect`) following Single Responsibility Principle
- **Automatic Reconnection** - Exponential backoff with configurable retry logic and error recovery
- **Logout Cleanup** - Backend notification on user logout for proper connection termination
- **Context Grouping** - Notifications organized by project context
- **Bulk Operations** - Delete individual notifications or entire contexts
- **Audio Notifications** 🔊 - System-integrated sound alerts with permission management
- **Notification Persistence** - Local storage with automatic cleanup

### 🎨 User Experience
- **Enhanced Menu System** 📱 - Accordion-style navigation with collapsible sections and real-time connection awareness
- **Theme Switching** 🌙 - Light/dark mode with Material UI theming
- **Connection Monitoring** 📊 - Real-time SSE connection status tracking with detailed diagnostics
- **Help System** ❓ - Contextual tooltips and interactive guidance
- **Responsive Design** 📱 - Mobile-first approach optimized for all devices
- **Loading States** - Comprehensive loading indicators and skeleton screens

### 🛠️ Developer Features
- **Type Safety** 🛡️ - Full TypeScript coverage with strict mode
- **Modern Architecture** ⚡ - Component-level data fetching with React Query
- **Error Boundaries** - Graceful error handling and recovery
- **Performance Optimization** - React 19 transitions and concurrent features
- **Code Quality** - ESLint, Prettier, and automated testing

## 🛠️ Tech Stack

### Core Technologies

- **React 19.1** - Latest React with concurrent features and startTransition
- **TypeScript 5.7** - Strict type checking and latest features
- **Material UI 5.15** - Complete design system and components
- **TanStack React Query 5.17** - Server state management and caching
- **React Router DOM 6.21** - Client-side routing with protected routes
- **Axios 1.11.0** - HTTP client with JWT interceptors (security patched)

### Authentication & Security

- **react-oidc-context 3.3** - OAuth2/OIDC authentication
- **oidc-client-ts 3.3** - OpenID Connect client library
- **Keycloak Integration** - Enterprise-grade identity management
- **JWT Bearer Tokens** - Automatic token injection and refresh

### UI/UX Libraries

- **@mui/x-date-pickers 8.9** - Calendar and date selection components
- **@mui/icons-material 5.15** - Comprehensive icon library
- **@emotion/react & @emotion/styled** - CSS-in-JS styling solution
- **date-fns 4.1** - Modern date utility library

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

#### Backend Configuration
- `VITE_BACKEND_BASE_URL` - Backend API URL (default: `http://localhost:8085`)
- `VITE_EVENTS_STREAM_PATH` - SSE endpoint for real-time events

#### Authentication (Keycloak OIDC)
- `VITE_KEYCLOAK_BASE_URL` - Keycloak server URL
- `VITE_KEYCLOAK_REALM` - Keycloak realm name
- `VITE_KEYCLOAK_CLIENT_ID` - Keycloak client identifier

#### Development
- `VITE_ENABLE_DEVTOOLS` - Toggle React Query DevTools in development

## 🏗️ Architecture

### Project Structure

```
src/
├── components/         # React components
│   ├── ui/            # Reusable UI components (MUI-based)
│   │   ├── Menu.tsx   # Main navigation with API key access
│   │   ├── ConfirmationDialog.tsx
│   │   └── DashboardBlurOverlay.tsx
│   └── features/      # Feature-specific components
│       ├── NotificationContextCard.tsx  # Context-grouped notifications
│       ├── NotificationContextGroups.tsx
│       └── apiKey/    # API Key Management components
│           ├── ApiKeyGenerationModal.tsx
│           └── steps/ # Multi-step wizard components
├── hooks/             # Custom React hooks (SRP-compliant architecture)  
│   ├── useNotificationData.ts    # Notification state management
│   ├── useSystemNotifications.ts # Browser notifications
│   ├── useSSEConnect.ts          # Server-Sent Events connection establishment
│   ├── useSSEDisconnect.ts       # Server-Sent Events disconnection management  
│   ├── useUserInitialization.ts  # User initialization patterns
│   └── apiKey/        # API Key management hooks
├── services/          # API service layer
│   └── apiKey/        # API Key service client
│       ├── client.ts  # Axios client with JWT auth
│       └── index.ts   # Service exports
├── contexts/          # React contexts (Theme, Help, Auth)
├── types/             # TypeScript type definitions
│   ├── apiKey.ts      # API Key related types
│   ├── connection.ts  # SSE connection type definitions
│   ├── menu.ts        # Enhanced menu type system
│   └── notifications.ts # Notification types
├── theme/             # Material UI theme configuration
├── utils/             # Utility functions
│   └── env.ts         # Type-safe environment configuration
├── config/            # Configuration files
├── assets/            # Static assets
└── tests/             # Test files with MSW mocking
```

### Key Patterns

- **Single Responsibility Principle (SRP)** - Hooks focused on single concerns (connection vs disconnection)
- **Multi-Step Wizards** - Complex flows broken into manageable steps (API key generation)  
- **Security-First Design** - "Show once only" patterns, JWT authentication, secure token handling
- **Real-time State Management** - Optimistic updates with startTransition for React 19 compliance
- **Context-Based Organization** - Notifications grouped by project context with bulk operations
- **Material UI Integration** - All components built on MUI foundation with consistent theming
- **Service Layer Architecture** - Dedicated API clients with JWT interceptors
- **Type-Safe Environment Handling** - Centralized configuration with TypeScript interfaces
- **Path Aliases** - Clean imports with `@/*` mapping to `./src/*`
- **Strict TypeScript** - Full type coverage with branded types and Result patterns

### Data Flow

#### Authentication Flow
1. **OIDC Authentication** - User authenticates with Keycloak
2. **JWT Token Storage** - Tokens stored in browser session storage
3. **Automatic Injection** - Axios interceptors add JWT to API requests
4. **Protected Routes** - Router guards ensure authenticated access

#### API Key Management Flow
1. **Multi-Step Wizard** - Configuration → Review → Generation → Display
2. **Backend Integration** - Real API calls to `/api/v1/claude-code/developer/api-key/generate`
3. **Security Patterns** - One-time display, immediate copy functionality
4. **State Management** - React state with startTransition for optimal performance

#### SSE Connection Architecture
1. **SRP-Compliant Design** - Separate hooks for connection establishment (`useSSEConnect`) and disconnection (`useSSEDisconnect`)
2. **Robust Error Handling** - Type-safe error management with discriminated unions and automatic retry logic
3. **Connection Lifecycle** - Proper connection state management with cleanup on logout and page unload
4. **Environment Configuration** - Type-safe environment variable handling with centralized utilities

#### Notification Flow
1. **SSE Connection** - Real-time updates via Server-Sent Events with SRP-compliant architecture
2. **Context Grouping** - Notifications organized by project context
3. **Optimistic Updates** - Immediate UI feedback with server synchronization
4. **Local Persistence** - Notifications stored in localStorage with cleanup
5. **Audio Integration** - System notifications with permission management

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

- [Development Guidelines](.claude/context/REACT_AND_TYPESCRIPT_DEV_GUIDELINES.md_DEV_GUIDELINES.md) - Architectural patterns and best practices
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
- Review the [development guidelines](.claude/context/REACT_AND_TYPESCRIPT_DEV_GUIDELINES.md_DEV_GUIDELINES.md)

---

**Built with ❤️ for the Claude Code community**
