# Overview

Pocket Bounty is a full-stack social bounty platform where users can post and complete tasks for monetary rewards. It features a mobile-first React frontend with Express.js backend, real-time messaging via WebSockets, and comprehensive user management with points/rewards system. The application uses Replit Auth for authentication and includes gamification elements like a Flappy Bird mini-game.

# User Preferences

Preferred communication style: Simple, everyday language.

# Critical Data Protection

**IMPORTANT**: User game data (points, balance, lifetime earnings) must NEVER be lost during authentication.
- The `upsertUser` function only updates profile fields (name, email, etc.)
- Game data fields are preserved during login/logout
- Backup table `user_data_backups` stores periodic snapshots of critical user data

# System Architecture

## Frontend Architecture

The client uses React with TypeScript and follows a component-based architecture:
- **UI Framework**: Built with shadcn/ui components and Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom CSS variables for theme management (dark/light mode)
- **State Management**: TanStack React Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Mobile-First Design**: PWA-ready with responsive design and mobile navigation patterns

## Backend Architecture

The server follows Express.js patterns with modular route organization:
- **API Routes**: RESTful endpoints organized in `/server/routes.ts`
- **Real-time Communication**: WebSocket server integrated with HTTP server for live messaging
- **Storage Layer**: Abstracted storage interface in `/server/storage.ts` for data operations
- **Error Handling**: Centralized error middleware with proper HTTP status codes

## Authentication & Authorization

Uses Replit's OpenID Connect (OIDC) authentication system:
- **Session Management**: PostgreSQL-based session storage with connect-pg-simple
- **User Management**: Automatic user creation/updates on login
- **Route Protection**: Middleware-based authentication checks on protected endpoints
- **Token Handling**: OAuth2 tokens managed server-side with refresh capabilities

## Database Design

PostgreSQL database with Drizzle ORM:
- **Schema Definition**: Centralized in `/shared/schema.ts` with TypeScript types
- **Migration Management**: Drizzle Kit for schema migrations
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Data Modeling**: Relational design with proper foreign key constraints

Key entities include:
- Users (profiles, points, balance tracking)
- Bounties (tasks with rewards and status management)
- Messages/Threads (real-time communication)
- Transactions (payment/reward history)
- Reviews (user rating system)
- Friendships (social connections)

## Real-time Features

WebSocket implementation for live updates:
- **Message Delivery**: Instant messaging between users
- **Activity Notifications**: Real-time updates for bounty applications, completions
- **Connection Management**: Automatic reconnection and error handling

## Gamification System

Points-based reward system with mini-games:
- **Points Economy**: Users earn points for completing tasks, lose points for posting bounties
- **Level Progression**: User levels based on activity and performance
- **Mini-Games**: Flappy Bird game integration for additional point earning
- **Achievement Tracking**: Reviews, ratings, and lifetime earnings tracking

## PWA Features

Progressive Web App capabilities:
- **Manifest**: Complete PWA manifest with icons and shortcuts
- **Service Worker**: Basic caching strategy for offline functionality
- **Mobile Optimization**: Responsive design with safe area handling for mobile devices

# External Dependencies

## Authentication Service
- **Replit OIDC**: Primary authentication provider using OpenID Connect
- **Session Storage**: PostgreSQL-based session management

## Database Service
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: TypeScript-first ORM with schema management
- **Connection Pooling**: Built-in connection management for serverless environments

## UI Component Libraries
- **Radix UI**: Unstyled, accessible UI primitives
- **shadcn/ui**: Pre-styled component library built on Radix UI
- **Lucide Icons**: Icon library for consistent iconography

## Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across the entire application
- **Tailwind CSS**: Utility-first CSS framework with custom theme system
- **TanStack React Query**: Server state management and caching

## Runtime Dependencies
- **Express.js**: Node.js web framework for API server
- **WebSocket (ws)**: Real-time communication library
- **React Hook Form**: Form validation and management
- **Zod**: Schema validation for API endpoints and forms