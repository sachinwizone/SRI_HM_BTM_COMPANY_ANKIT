# Replit.md

## Overview

This is a full-stack business management system built with React (frontend) and Express.js (backend). The application provides comprehensive tools for managing clients, orders, payments, tasks, and sales operations. It features a modern dashboard interface with real-time data visualization and workflow management capabilities for business operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Library**: Shadcn/UI components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: React Query (@tanstack/react-query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration for development

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful API with structured route handlers
- **Middleware**: Custom logging and error handling middleware
- **Development**: Hot reloading with Vite integration in development mode

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema**: Comprehensive business entities with proper relationships
- **Migrations**: Drizzle Kit for schema management and migrations

### Data Models
The system manages several core entities:
- Users with role-based access (Admin, Sales Manager, Sales Executive, Operations)
- Clients with category classification (ALFA, BETA, GAMMA, DELTA)
- Orders with complete workflow status tracking
- Payment management with status tracking and due date monitoring
- Task management supporting both one-time and recurring tasks
- E-way bills for shipment compliance
- Credit agreements with terms and limits
- Purchase orders linked to client orders
- Sales rate tracking for performance metrics
- Client tracking for shipment status updates

### Authentication & Authorization
- Role-based user management system
- User roles: ADMIN, SALES_MANAGER, SALES_EXECUTIVE, OPERATIONS
- Session-based authentication (connect-pg-simple for session storage)

### UI/UX Architecture
- Responsive design with mobile-first approach
- Dark/light theme support through CSS variables
- Consistent component library with standardized variants
- Dashboard-centric interface with navigation sidebar
- Modal-based forms for data entry and editing

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Connection Pooling**: @neondatabase/serverless with WebSocket support

### UI & Component Libraries
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: For managing component variants
- **Embla Carousel**: For carousel/slider components

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking and enhanced developer experience
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with Tailwindcss and Autoprefixer

### Form & Validation
- **React Hook Form**: Performant forms with minimal re-renders
- **Zod**: Schema validation library integrated with Drizzle
- **@hookform/resolvers**: Zod resolver for React Hook Form integration

### Date & Time Handling
- **date-fns**: Modern JavaScript date utility library for date manipulation and formatting

### Development Environment
- **Replit Integration**: Custom plugins for Replit development environment
- **Runtime Error Overlay**: Development error handling and display
- **Cartographer**: Replit-specific development tooling