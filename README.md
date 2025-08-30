# Hospital Claims Management System

A full-stack web application for managing hospital claims with React frontend and Django backend.

## 🚀 Free Hosting Deployment Guide

This project can be deployed for free using the following services:

### Frontend (React) - Vercel
### Backend (Django) - Railway/Render  
### Database (PostgreSQL) - Supabase/Neon

## 📋 Prerequisites

- GitHub account
- Vercel account (free)
- Railway account (free tier) or Render account (free tier)
- Supabase account (free) or Neon account (free)

## 🛠️ Deployment Steps

### 1. Frontend Deployment (Vercel)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your repository
   - Set build settings:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Add environment variable:
     - `VITE_API_URL`: Your backend URL (will be set after backend deployment)

### 2. Database Setup (Supabase)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note down your database credentials

2. **Get Database URL**
   - Go to Settings > Database
   - Copy the connection string

### 3. Backend Deployment (Railway)

1. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project" > "Deploy from GitHub repo"
   - Select your repository
   - Set the root directory to `hospital_claims_backend`

2. **Configure Environment Variables**
   ```
   SECRET_KEY=your-secret-key-here
   DEBUG=False
   DB_NAME=your-db-name
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   DB_HOST=your-db-host
   DB_PORT=5432
   ```

3. **Add PostgreSQL Service**
   - In Railway dashboard, click "New" > "Database" > "PostgreSQL"
   - Railway will automatically set the database environment variables

### 4. Update Frontend API URL

1. **Get Backend URL**
   - Copy your Railway app URL (e.g., `https://your-app.railway.app`)

2. **Update Vercel Environment Variable**
   - Go to Vercel dashboard > Your project > Settings > Environment Variables
   - Add `VITE_API_URL` with your Railway backend URL

## 🔧 Local Development

### Frontend
```bash
cd project
npm install
npm run dev
```

### Backend
```bash
cd hospital_claims_backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## 📁 Project Structure

```
frontend_hospital/
├── project/                 # React frontend
│   ├── src/
│   ├── package.json
│   └── vercel.json         # Vercel configuration
└── hospital_claims_backend/ # Django backend
    ├── hospital_claims/
    ├── requirements.txt
    ├── Procfile            # Railway/Render configuration
    └── build.sh            # Build script
```

## 🔐 Environment Variables

### Backend (.env)
```
SECRET_KEY=your-secret-key
DEBUG=False
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_HOST=your-database-host
DB_PORT=5432
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend-url.railway.app
```

## 🚀 Alternative Free Hosting Options

### Frontend Alternatives:
- **Netlify** - Similar to Vercel, great for React apps
- **GitHub Pages** - Free static hosting

### Backend Alternatives:
- **Render** - Free tier with PostgreSQL
- **Heroku** - Free tier (limited but available)
- **PythonAnywhere** - Free Python hosting

### Database Alternatives:
- **Neon** - Free PostgreSQL with 3GB storage
- **ElephantSQL** - Free PostgreSQL with 20MB storage

## 📞 Support

If you encounter any issues during deployment, check:
1. Environment variables are correctly set
2. Database connection is working
3. CORS settings allow your frontend domain
4. Static files are being served correctly

## 🔄 Continuous Deployment

Both Vercel and Railway support automatic deployments:
- Push to `main` branch triggers automatic deployment
- Preview deployments for pull requests
- Easy rollback to previous versions
