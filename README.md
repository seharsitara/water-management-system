# 💧 Water Management System

A full-stack water usage monitoring and management application built with **Next.js** (frontend) and **NestJS** (backend), powered by **Supabase** for database and authentication.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [API Endpoints](#-api-endpoints)
- [Entity Types & Limits](#-entity-types--limits)
- [Alert System](#-alert-system)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Dashboard
- **Real-time water usage monitoring** with auto-refresh every 30 seconds
- **Entity-based tracking** for Homes, Societies, and Industries
- **Weekly usage trends** with interactive charts
- **Peak usage day tracking** with average comparison
- **Monthly summary cards** with progress tracking
- **Category-wise usage breakdown** with progress bars

### Alerts & Notifications
- **Smart alert system** based on usage thresholds
- **Critical alerts** when usage exceeds 100% of limits
- **Warning alerts** when usage is between 80-100%
- **Filterable alert list** with visual progress indicators

### History & Reports
- **Comprehensive usage history** with filtering and pagination
- **Detailed reports** with YoY (Year-over-Year) comparison
- **Monthly trend visualization** using Recharts
- **Export-ready data** with percentage calculations

### Manual Entry
- **Add water usage entries** with entity type selection
- **Category-based logging** (Drinking, Cooking, Bathing, etc.)
- **Validation against entity limits**

### Authentication
- **JWT-based authentication** with secure token handling
- **User registration and login**
- **Google OAuth integration** (optional)
- **Cookie and localStorage token persistence**

## 🛠 Tech Stack

### Frontend (`/web`)
| Technology | Purpose |
|------------|---------|
| Next.js 16 | React framework with App Router |
| React 19 | UI library |
| TypeScript | Type safety |
| Tailwind CSS 4 | Styling |
| Recharts | Data visualization |
| Lucide React | Icons |
| Day.js | Date formatting |

### Backend (`/api`)
| Technology | Purpose |
|------------|---------|
| NestJS 11 | Node.js framework |
| TypeScript | Type safety |
| Passport.js | Authentication |
| JWT | Token-based auth |
| Supabase | Database & Auth |
| bcrypt | Password hashing |
| class-validator | DTO validation |

## 📁 Project Structure

```
water-management-system/
├── api/                          # NestJS Backend
│   ├── src/
│   │   ├── auth/                 # Authentication module
│   │   │   ├── dto/              # Login/Signup DTOs
│   │   │   ├── strategies/       # Passport strategies
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   └── auth.service.ts
│   │   ├── usage/                # Water usage module
│   │   │   ├── dto/              # Usage DTOs
│   │   │   ├── usage.controller.ts
│   │   │   ├── usage.module.ts
│   │   │   └── usage.service.ts
│   │   ├── app.module.ts         # Root module
│   │   ├── main.ts               # Application entry
│   │   └── supabase.provider.ts  # Supabase configuration
│   ├── test/                     # E2E tests
│   └── package.json
│
├── web/                          # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/           # Auth pages (route group)
│   │   │   │   ├── login/
│   │   │   │   └── sign-up/
│   │   │   ├── api/auth/         # API routes (proxy to backend)
│   │   │   │   ├── login/
│   │   │   │   ├── logout/
│   │   │   │   ├── me/
│   │   │   │   └── signup/
│   │   │   ├── dashboard/
│   │   │   │   ├── alerts/       # Alerts page
│   │   │   │   ├── history/      # History page
│   │   │   │   ├── reports/      # Reports page
│   │   │   │   └── page.tsx      # Main dashboard
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx          # Landing page
│   │   ├── components/
│   │   │   ├── auth/             # Login, SignUp components
│   │   │   ├── dashboard/        # Dashboard components
│   │   │   └── ui/               # Reusable UI components
│   │   ├── contexts/             # React contexts
│   │   ├── hooks/                # Custom hooks
│   │   ├── services/             # API services
│   │   └── types/                # TypeScript types
│   ├── lib/                      # Utility functions
│   └── package.json
│
└── README.md                     # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** or **pnpm**
- **Supabase** account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/water-management-system.git
   cd water-management-system
   ```

2. **Install API dependencies**
   ```bash
   cd api
   npm install
   ```

3. **Install Web dependencies**
   ```bash
   cd ../web
   pnpm install
   # or npm install
   ```

### Environment Variables

#### API (`/api/.env`)

```env
# Supabase configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Server configuration
PORT=8000

# JWT configuration
JWT_SECRET=your-super-secret-jwt-key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8000/auth/google/callback
```

#### Web (`/web/.env.local`)

```env
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

### Running the Application

#### Start the Backend (Port 8000)

```bash
cd api
npm run start:dev
```

#### Start the Frontend (Port 3000)

```bash
cd web
pnpm dev
# or npm run dev
```

#### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/signup` | Register a new user |
| `POST` | `/auth/login` | Login and get JWT token |
| `GET` | `/auth/me` | Get current user info |
| `GET` | `/auth/google` | Google OAuth login |

### Water Usage

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/usage/dashboard` | Get dashboard data |
| `GET` | `/usage/history` | Get usage history |
| `GET` | `/usage/reports` | Get detailed reports |
| `GET` | `/usage/alerts` | Get usage alerts |
| `POST` | `/usage` | Add new usage entry |

### Query Parameters

**Dashboard**: `?entityType=home|society|industry`

**History**: `?page=1&limit=10&startDate=2024-01-01&endDate=2024-12-31`

## 🏠 Entity Types & Limits

The system supports three entity types with specific usage limits:

| Entity Type | Daily Limit | Monthly Limit |
|-------------|-------------|---------------|
| 🏠 **Home** | 500 L | 15,000 L |
| 🏘️ **Society** | 5,000 L | 150,000 L |
| 🏭 **Industry** | 20,000 L | 600,000 L |

## ⚠️ Alert System

Alerts are triggered based on usage percentage relative to limits:

| Status | Threshold | Color |
|--------|-----------|-------|
| ✅ **Normal** | < 80% | Blue |
| ⚡ **Warning** | 80% - 100% | Amber |
| 🚨 **Critical** | > 100% | Red |

## 📸 Screenshots

*Screenshots of the application UI will be added here.*

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with 💙 for sustainable water management
</p>
