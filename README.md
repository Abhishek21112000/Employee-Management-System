# Employee Management System (EMS)

A comprehensive, production-ready Full-Stack Employee Management System built with the MERN stack (MongoDB, Express, React, Node.js) and TypeScript.

## Features

- **Authentication**: JWT-based login, secure HTTP-Only cookies, and persistent sessions.
- **Role-Based Access Control (RBAC)**: Three distinct roles (Super Admin, HR Manager, Employee) with varying permissions.
- **Employee CRUD**: Create, read, update, and soft delete capabilities.
- **Profile Image Uploads**: Integrated Multer for handling file uploads locally.
- **Dashboard Statistics**: Real-time aggregation of total employees, active/inactive counts, and department distributions.
- **Organization Hierarchy**: Dynamic recursive tree to visualize company structure and direct reporting managers. Prevention of circular dependencies.
- **Advanced Data Table**: Includes server-side pagination, regex-based name/email search, and sorting.
- **Modern UI/UX**: Built with Vite, React Router v6, Tailwind CSS, and Lucide React icons, featuring a sleek Dark/Light color scheme.

## Tech Stack

### Frontend
- React.js (Vite)
- TypeScript
- Tailwind CSS
- React Router DOM
- React Hook Form
- Zod (Validation)
- Axios
- TanStack Query (React Query)
- Lucide React (Icons)

### Backend
- Node.js & Express.js
- MongoDB Atlas & Mongoose
- JSON Web Tokens (JWT)
- bcrypt (Password Hashing)
- Multer (File Uploads)
- Zod (Data Validation)

---

## Installation & Local Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd ems
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory and add the following:
```env
PORT=5000
MONGODB_URI=<YOUR_MONGODB_ATLAS_URI>
JWT_SECRET=<YOUR_SUPER_SECRET_JWT_KEY>
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

Run the Database Seeder to create the initial Super Admin:
```bash
npm run seed
```

Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```

The application will be accessible at `http://localhost:5173`.
**Default Super Admin Login:**
- **Email:** `admin@ems.com`
- **Password:** `Admin@123`

---

## Folder Structure

```
ems/
├── client/                     # Frontend Vite + React Application
│   ├── src/
│   │   ├── api/                # Axios configuration and interceptors
│   │   ├── components/         # Reusable UI components (Button, Input, etc.)
│   │   ├── context/            # Global Auth Context state
│   │   ├── layouts/            # Dashboard Layouts (Sidebar, Header)
│   │   ├── pages/              # Primary views (Login, Employees, Dashboard)
│   │   ├── types/              # TypeScript definitions
│   │   └── App.tsx             # Routing Configuration
│   ├── tailwind.config.js      # Tailwind UI tokens
│   └── package.json            
│
├── server/                     # Backend Node.js + Express Application
│   ├── config/                 # MongoDB connection
│   ├── controllers/            # API Route Logic (Auth, Employees, Org, Dashboard)
│   ├── middleware/             # JWT Protection, RBAC Auth, and Multer
│   ├── models/                 # Mongoose schemas (Employee)
│   ├── routes/                 # Express Routers
│   ├── scripts/                # Database seeders
│   ├── uploads/                # Local profile image storage
│   ├── utils/                  # JWT Generators
│   ├── server.js               # Entry point
│   └── package.json
```

---

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - Authenticate user and get JWT
- `POST /api/auth/logout` - Clear HTTP-Only cookie

### Employee Endpoints (Protected)
- `GET /api/employees` - Get all employees (Supports `?search`, `?role`, `?status`, `?department`, `?sort`, `?page`, `?limit`)
- `GET /api/employees/:id` - Get single employee by ID
- `POST /api/employees` - Create new employee (multipart/form-data)
- `PUT /api/employees/:id` - Update employee details (multipart/form-data)
- `DELETE /api/employees/:id` - Soft delete an employee

### Organization Endpoints (Protected)
- `GET /api/organization/tree` - Get full recursive organizational hierarchy
- `GET /api/employees/:id/reportees` - Get all employees reporting directly to ID
- `PATCH /api/employees/:id/manager` - Assign or update reporting manager

### Dashboard Endpoints (Protected)
- `GET /api/dashboard/stats` - Get aggregated employee metrics

---

## Deployment Steps

### Backend (Render / Heroku)
1. Push your repository to GitHub.
2. Connect the repository to your hosting provider.
3. Set the Root Directory to `server/`.
4. Add your Environment Variables (`MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`).
5. Set Build Command: `npm install`
6. Set Start Command: `npm start` (which maps to `node server.js`).
*Note: Since Multer saves images locally, using a PaaS like Render/Heroku will cause images to disappear on server restart. For production, integrate an AWS S3 or Cloudinary Multer storage engine.*

### Frontend (Vercel / Netlify)
1. Connect your repository to Vercel/Netlify.
2. Set the Root Directory to `client/`.
3. Framework Preset: Vite.
4. Set Build Command: `npm run build`
5. Set Output Directory: `dist`
6. Important: In your `client/src/api/axios.ts`, change `baseURL: '/api'` to the deployed backend URL (e.g., `baseURL: 'https://your-backend-url.onrender.com/api'`).
