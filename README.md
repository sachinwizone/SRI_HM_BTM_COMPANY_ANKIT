# Shri HM Company - Credit Flow Management System

**Developer:** Ankit Misra

A comprehensive business management system built for **M/S SRI HM BITUMEN CO** - a full-stack ERP solution for managing sales operations, client relationships, invoicing, and financial tracking.

---

## 📋 Features

### Core Modules:
- **User Management** - Role-based access control (Admin, Manager, Accountant, Employee)
- **Client Management** - Complete client database with GST verification
- **Lead Management** - Sales pipeline with lead tracking and conversion
- **Sales Operations** - Quotations, Sales Orders, Invoices
- **Purchase Operations** - Purchase Orders, Purchase Invoices
- **Invoice Management** - Payment tracking with auto status updates
- **Reports & Analytics** - Business intelligence dashboards
- **Tour Advance (TA)** - Employee tour expense management

### Key Features:
- 📊 Real-time dashboard with business metrics
- 📄 PDF generation for Sales Orders & Invoices
- 💰 Payment tracking with remaining balance calculation
- 🔍 Advanced filtering (Party-wise, Invoice-wise)
- 📧 Email integration via SendGrid
- 🔐 Secure authentication with session management

---

## 🛠️ Tech Stack

### Frontend:
- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **TanStack Query** - Data Fetching & Caching
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component Library
- **Wouter** - Routing
- **Recharts** - Charts & Visualization
- **jsPDF** - PDF Generation

### Backend:
- **Node.js** - Runtime
- **Express.js** - Web Framework
- **TypeScript** - Type Safety
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database (Neon Serverless)
- **Zod** - Schema Validation

### DevOps:
- **Vite** - Build Tool
- **ESBuild** - Bundler
- **DrizzleKit** - Database Migrations

---

## 📦 Dependencies

### Production Dependencies:
| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.3.1 | UI Framework |
| express | ^4.21.2 | Backend Server |
| drizzle-orm | ^0.39.1 | Database ORM |
| @neondatabase/serverless | ^0.10.4 | PostgreSQL Driver |
| @tanstack/react-query | ^5.60.5 | Data Management |
| zod | ^3.24.2 | Validation |
| bcrypt | ^6.0.0 | Password Hashing |
| jspdf | ^3.0.2 | PDF Generation |
| xlsx | ^0.18.5 | Excel Export |
| @sendgrid/mail | ^8.1.5 | Email Service |
| lucide-react | ^0.453.0 | Icons |
| tailwind-merge | ^2.6.0 | CSS Utilities |
| recharts | ^2.15.4 | Charts |

### Dev Dependencies:
| Package | Version | Purpose |
|---------|---------|---------|
| typescript | 5.6.3 | Type System |
| vite | ^5.4.19 | Build Tool |
| drizzle-kit | ^0.30.4 | DB Migrations |
| tailwindcss | ^3.4.17 | CSS Framework |
| tsx | ^4.20.6 | TypeScript Execution |

---

## 🚀 Getting Started

### Prerequisites:
- Node.js v18+ 
- PostgreSQL Database (or Neon Serverless)
- npm or yarn

### Installation:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/Shri-_HM_company_ankit_misra.git
   cd Shri-_HM_company_ankit_misra
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   SESSION_SECRET=your_session_secret
   SENDGRID_API_KEY=your_sendgrid_api_key (optional)
   ```

4. **Push database schema:**
   ```bash
   npm run db:push
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Access the application:**
   Open `http://localhost:3002` in your browser

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3002) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate migrations |
| `npm run check` | TypeScript type checking |

---

## 📁 Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
│   └── index.html
├── server/                 # Backend Express application
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database operations
│   ├── auth.ts             # Authentication
│   └── index.ts            # Server entry point
├── shared/                 # Shared code
│   └── schema.ts           # Database schema (Drizzle)
├── migrations/             # Database migrations
├── uploads/                # File uploads (development)
└── package.json
```

---

## 🔐 Default Login

After initial setup:
- **Username:** admin
- **Password:** admin123

⚠️ **Change the default password immediately after first login!**

---

## 📞 Support

For any issues or queries, contact the developer.

---

## 📄 License

This project is licensed under the MIT License.

---

**© 2024 Shri HM Bitumen Company - Developed by Ankit Misra**
