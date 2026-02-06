# Library Management System Website

This project presents a library management system that was created to automate and simplify library operations using React and Node.js

A modern, full-stack web application for managing library operations built with **React**, **Node.js**, and **MySQL**. Features include user authentication, book catalogue management, borrowing/return systems, fine tracking, announcements, and an AI-assisted metadata suggestion system.

Date: January 7, 2026

---

## ✨ Features

### 👥 User Management & Authentication
- Secure registration/login with JWT authentication
- Role-based access control (Admin, Member, Guest)
- Password hashing with bcrypt
- Account activation and password recovery
- Profile management

### 📚 Book & Catalogue Management
- Full CRUD operations for books
- Book instance tracking (multiple physical copies)
- Advanced search and filtering by title, author, category
- Soft-delete functionality
- Cover image support

### 🤖 AI-Powered Metadata Suggestions
- Local Ollama integration for intelligent book metadata generation
- Automatic suggestions for descriptions, publishers, ISBN, genres
- Fallback to manual entry if AI unavailable

### 🔄 Borrowing & Returns
- Digital borrowing with automatic due date calculation
- Return processing with availability updates
- Borrowing history tracking
- Reservation system for unavailable books

### 💰 Fine & Fee Management
- Automatic fine calculation for overdue books
- Configurable daily rates
- Payment status tracking
- Admin ability to waive or adjust fines

### 📢 Announcements & Communication
- Admin can create and publish announcements
- Categorized announcements (General, Important, Event)
- Built-in messaging system for member inquiries
- Contact forms for public website

### 🎯 Member Portal
- Personalized dashboard with active loans
- Account information and membership status
- Borrowing history
- Fine balance and payment status

### 🌐 Public Library Website
- Library information and history
- Operating hours and contact details
- Announcements display
- Gallery section
- Member login/registration gateway

### 👨‍💼 Administrative Dashboard
- System statistics and reports
- Member management tools
- Book inventory management
- Borrowing record review
- Fine and payment tracking

---

## 🛠️ Technology Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **CSS3** - Styling with responsive design
- **React Router** - Navigation
- **Fetch API** - HTTP requests

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **MySQL2** - Database driver

### Database
- **MySQL** - Relational database
- **Connection pooling** - Efficient DB connections

### AI Integration
- **Ollama** - Local LLM for metadata suggestions
- **Llama model** - AI text generation

---

## 🗄️ Database Schema

### Key Tables
- `users` - Authentication and admin accounts
- `members` / `memberships` - Library patron information
- `books` - Book metadata with soft-delete
- `book_instances` - Physical copy tracking
- `authors` / `book_authors` - Author information (many-to-many)
- `categories` - Book classification
- `publishers` - Publisher information
- `borrow_records` - Loan transactions
- `fines` - Overdue charges
- `announcements` - Library announcements
- `messages` - Contact form submissions

### Relationships
- One book → Many book instances
- One member → Many borrow records
- Books ↔ Authors (many-to-many)
- Books → Categories (many-to-one)
- Books → Publishers (many-to-one)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MySQL (v8+)
- Ollama (for AI features - optional)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd library-management-system

## Getting Started

Run frontend and backend together from the project root.

1) Install root dev dependencies (adds `concurrently`):

```bash
cd my-app
npm install
```

2) Install both subproject dependencies:

```bash
npm run install:all
```

3) Start both services in development (opens two servers):

```bash
npm run dev
```

## Alternatives

- Run backend only:

```bash
cd backend
npm install
npm run dev
```

- Run frontend only:

```bash
cd frontend
npm install
npm run dev
```



- Vite dev server proxies `/api` requests to the backend. Ensure `backend/.env` has your DB settings and backend is running on port 8081.
- If you prefer not to use `concurrently`, open two terminals and run frontend/backend separately.
