# 🎫 Concert Ticket Booking System

A full-stack concert ticket booking platform built with **React**, **Flask**, **MySQL**, and **MongoDB**, using a **Polyglot Persistence** approach to leverage the strengths of both relational and document databases.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Database Design](#-database-design)
- [API Endpoints](#-api-endpoints)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)

---

## ✨ Features

### 👤 User Features

- **Authentication** — Register, Login with JWT-based authentication
- **Browse Concerts** — View all published concerts with zones, prices, and availability
- **Book Tickets** — Select zone, choose quantity (max 6), and pay with tokens
- **Token System** — Top-up tokens via multiple payment methods (Credit Card, PromptPay, TrueMoney)
- **Booking Management** — View bookings, cancel bookings with automatic token refund, pay pending bookings
- **Transaction History** — Full history of top-ups, ticket purchases, payments, cancellations, and refunds
- **User Profile** — View/edit profile information, change password, view account statistics
- **Expandable Descriptions** — Long concert descriptions are truncated with a "Read more" toggle

### 🛡️ Admin Features

- **Create Concerts** — Add new concerts as drafts with title, description, location, date, image, and ticket zones
- **Edit Drafts** — Full edit modal to modify all concert details and zones before publishing
- **Publish Concerts** — Publish drafts to make them visible and bookable by users
- **Delete Drafts** — Remove draft concerts that are no longer needed

### ⚙️ System Features

- **Race Condition Prevention** — Row-level locking (`SELECT ... FOR UPDATE`) on zone capacity during booking
- **Auto-Expiration** — Background scheduler automatically expires pending bookings after 15 minutes and returns seats
- **Event Completion** — Events past their date are automatically marked as completed
- **Transaction Cleanup** — Old transactions (6+ months) are soft-deleted automatically
- **Role-based Access Control** — Protected routes for authenticated users, admin-only routes for concert management

---

## 🛠️ Tech Stack

| Layer                | Technology                      | Purpose                                             |
| -------------------- | ------------------------------- | --------------------------------------------------- |
| **Frontend**         | React 19, Vite 7, TailwindCSS 4 | SPA with modern UI                                  |
| **Routing**          | React Router DOM 7              | Client-side routing                                 |
| **Backend**          | Flask 3.1, Python 3.11          | REST API server                                     |
| **Auth**             | Flask-JWT-Extended              | JWT token authentication                            |
| **ORM**              | Flask-SQLAlchemy, Alembic       | Database ORM & migrations                           |
| **Security**         | Flask-Bcrypt                    | Password hashing                                    |
| **Scheduler**        | APScheduler                     | Background job scheduling                           |
| **SQL Database**     | MySQL 8                         | Relational data (Users, Events, Bookings, Payments) |
| **NoSQL Database**   | MongoDB 7                       | Document data (Transaction Logs, User Statistics)   |
| **Containerization** | Docker, Docker Compose          | Multi-container deployment                          |

---

## 🏗️ Architecture

```
┌─────────────────┐       ┌─────────────────────────────────────────┐
│                 │       │            Backend (Flask)               │
│    Frontend     │       │                                         │
│  (React + Vite) │◄────► │  REST API + JWT Auth + Business Logic   │
│                 │       │  + Background Scheduler (APScheduler)   │
│  Port: 5173     │       │                                         │
│                 │       │  Port: 5000                              │
└─────────────────┘       └──────────┬──────────────┬───────────────┘
                                     │              │
                          ┌──────────▼──────┐  ┌────▼──────────────┐
                          │    MySQL 8      │  │    MongoDB 7      │
                          │                 │  │                   │
                          │  • Users        │  │  • transactions   │
                          │  • Events       │  │    (logs)         │
                          │  • Zones        │  │  • user_stats     │
                          │  • Bookings     │  │    (aggregated)   │
                          │  • Payments     │  │                   │
                          │                 │  │                   │
                          │  Port: 3306     │  │  Port: 27017      │
                          └─────────────────┘  └───────────────────┘
```

### Why Polyglot Persistence?

| Data Type                                | Database    | Reason                                                                                                                               |
| ---------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Users, Events, Zones, Bookings, Payments | **MySQL**   | Strong relationships, requires ACID transactions (e.g., atomic booking: lock seat → deduct tokens → create booking → create payment) |
| Transaction Logs                         | **MongoDB** | Append-only, flexible schema, no joins needed, high write throughput                                                                 |
| User Statistics                          | **MongoDB** | Aggregated counters, updated via `$inc`, no relational dependencies                                                                  |

---

## 📁 Project Structure

```
DatabaseProject/
├── docker-compose.yml          # Multi-container orchestration
├── Dockerfile                  # Backend container image
├── .dockerignore               # Docker build exclusions
│
├── backend/                    # Flask API Server
│   ├── main.py                 # Main application — all API routes
│   ├── models.py               # SQLAlchemy models (User, Event, Zone, Booking, Payment)
│   ├── extensions.py           # Flask extensions (db, bcrypt, jwt, migrate)
│   ├── config.py               # Configuration loader
│   ├── mongo.py                # MongoDB connection & collections
│   ├── transaction_service.py  # Transaction logging & user stats updates
│   ├── expiration_manager.py   # Background scheduler (booking/event expiration)
│   ├── requirements.txt        # Python dependencies
│   └── .env                    # Environment variables (local dev)
│
└── frontend/                   # React SPA
    ├── index.html              # Entry HTML
    ├── package.json            # Node.js dependencies
    ├── vite.config.js          # Vite configuration
    └── src/
        ├── main.jsx            # React entry point
        ├── App.jsx             # Router & layout (ProtectedRoute, AdminRoute)
        ├── context/
        │   └── AuthContext.jsx  # Authentication context provider
        ├── components/
        │   ├── Header.jsx      # Navigation bar with user info
        │   └── Footer.jsx      # Page footer
        └── pages/
            ├── LoginPage.jsx           # User login
            ├── RegisterPage.jsx        # User registration
            ├── HomePage.jsx            # Landing / dashboard
            ├── ConcertPage.jsx         # Browse published concerts
            ├── BookingPage.jsx         # Book tickets for a concert
            ├── TopUpTokens.jsx         # Top-up token balance
            ├── TransactionHistory.jsx  # View transaction logs
            ├── UserProfilePage.jsx     # Profile management & stats
            ├── AboutPage.jsx           # About page
            ├── AddConcertPage.jsx      # [Admin] Create new concert
            └── DraftConcertPage.jsx    # [Admin] Manage draft concerts
```

---

## 🗃️ Database Design

### MySQL — Relational Schema

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    users     │     │    events    │     │    zones     │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id (PK)      │     │ id (PK)      │     │ id (PK)      │
│ username     │     │ title        │     │ event_id (FK)│
│ email        │     │ description  │     │ name         │
│ password_hash│     │ location     │     │ capacity     │
│ role         │     │ event_datetime│    │ price        │
│ tokens       │     │ status       │     │ is_available │
│ created_at   │     │ image_url    │     └──────┬───────┘
│ updated_at   │     │ created_at   │            │
│ deleted_at   │     │ updated_at   │            │
└──────┬───────┘     └──────────────┘            │
       │                                         │
       │         ┌──────────────┐     ┌──────────▼───────┐
       │         │   payments   │     │    bookings      │
       │         ├──────────────┤     ├──────────────────┤
       │         │ id (PK)      │◄────│ payment_id (FK)  │
       │         │ total_price  │     │ id (PK)          │
       │         │ status       │     │ user_id (FK) ────┘
       │         │ paid_at      │     │ zone_id (FK)
       │         └──────────────┘     │ quantity
       │                              │ status
       └──────────────────────────────│ created_at
                                      └──────────────────┘
```

**Event Status Flow:** `draft` → `available` → `completed`

**Booking Status Flow:** `pending` → `paid` / `canceled` / `expired`

**Payment Status Flow:** `pending` → `success` / `failed` / `refunded`

### MongoDB — Document Collections

**`transactions`** — Immutable log of all user actions

```json
{
  "user_id": 1,
  "action": "ticket | payment | topup_token",
  "details": { "booking_id": 5, "total_price": 3000, "status": "paid" },
  "created_at": "2026-03-07T10:00:00Z",
  "is_deleted": false
}
```

**`user_stats`** — Aggregated per-user statistics

```json
{
  "user_id": 1,
  "total_topup_amount": 10000,
  "total_spend_amount": 6000,
  "total_bookings_count": 3,
  "total_canceled_count": 1,
  "total_refunded_amount": 2000
}
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint             | Description             |
| ------ | -------------------- | ----------------------- |
| POST   | `/api/auth/register` | Register a new user     |
| POST   | `/api/auth/login`    | Login and get JWT token |

### Concerts (Public)

| Method | Endpoint                  | Description                       |
| ------ | ------------------------- | --------------------------------- |
| GET    | `/api/concerts`           | Get all published concerts        |
| GET    | `/api/concerts/:id`       | Get single concert details        |
| GET    | `/api/concerts/:id/zones` | Get available zones for a concert |

### Bookings

| Method | Endpoint                        | Description           |
| ------ | ------------------------------- | --------------------- |
| GET    | `/api/user/bookings`            | Get user's bookings   |
| POST   | `/api/bookings`                 | Create a new booking  |
| PUT    | `/api/user/bookings/:id/cancel` | Cancel a booking      |
| PUT    | `/api/user/bookings/:id/paid`   | Pay a pending booking |

### User

| Method | Endpoint             | Description                        |
| ------ | -------------------- | ---------------------------------- |
| GET    | `/api/user/profile`  | Get user profile                   |
| PUT    | `/api/user/profile`  | Update username/email              |
| PUT    | `/api/user/password` | Change password                    |
| POST   | `/api/user/topup`    | Top-up tokens                      |
| GET    | `/api/user/stats`    | Get user statistics (from MongoDB) |

### Transactions

| Method | Endpoint            | Description                    |
| ------ | ------------------- | ------------------------------ |
| GET    | `/api/transactions` | Get user's transaction history |

### Admin — Concert Management

| Method | Endpoint                          | Description                              |
| ------ | --------------------------------- | ---------------------------------------- |
| POST   | `/api/admin/concerts`             | Create a new concert (draft)             |
| GET    | `/api/admin/concerts/drafts`      | Get all draft concerts                   |
| PUT    | `/api/admin/concerts/:id`         | Update a draft concert (including zones) |
| PUT    | `/api/admin/concerts/:id/publish` | Publish a draft concert                  |
| DELETE | `/api/admin/concerts/:id`         | Delete a draft concert                   |

---

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) (v18+) — for frontend development
- [Python](https://www.python.org/) (3.11+) — for backend development (optional, if not using Docker)

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd DatabaseProject

# Start all services (Backend + MySQL + MongoDB)
docker-compose up --build
```

This will start:

- **Backend** on `http://localhost:5000`
- **MySQL** on `localhost:3307`
- **MongoDB** on `localhost:27018`

Then start the frontend separately:

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Option 2: Local Development

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Set up environment variables (edit .env file)
# Make sure MySQL and MongoDB are running locally

# Run the server
flask run --debug
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable                  | Description               | Example                                                   |
| ------------------------- | ------------------------- | --------------------------------------------------------- |
| `SQLALCHEMY_DATABASE_URI` | MySQL connection string   | `mysql+pymysql://user:password@localhost:3306/concert_db` |
| `JWT_SECRET_KEY`          | Secret key for JWT tokens | `your-secret-key`                                         |
| `MONGO_URI`               | MongoDB connection string | `mongodb://localhost:27017`                               |

### Docker Compose (`docker-compose.yml`)

| Variable              | Description         | Default      |
| --------------------- | ------------------- | ------------ |
| `MYSQL_ROOT_PASSWORD` | MySQL root password | `root`       |
| `MYSQL_DATABASE`      | Database name       | `concert_db` |
| `MYSQL_USER`          | MySQL user          | `user`       |
| `MYSQL_PASSWORD`      | MySQL password      | `password`   |

---

## 📄 License

This project is developed for educational purposes as part of the Database Systems course (01204351).
