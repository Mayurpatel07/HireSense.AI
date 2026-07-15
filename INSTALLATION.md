# HireSenseAI - Complete Installation Guide

## System Requirements

- **Node.js**: v16.0.0 or higher
- **npm**: v7.0.0 or higher
- **MongoDB**: v4.4 or higher (local or cloud - MongoDB Atlas)
- **RAM**: Minimum 4GB
- **Disk Space**: 500MB

## Quick Start (Windows)

### Step 1: Install Prerequisites

#### Install Node.js
1. Download from https://nodejs.org/
2. Choose LTS version
3. Run installer and follow prompts
4. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

#### Install MongoDB
1. Download from https://www.mongodb.com/try/download/community
2. Run installer and follow prompts
3. MongoDB should start automatically

### Step 2: Clone/Setup Project

```powershell
# Navigate to project directory
cd "g:\webdevelopment clients project\Job-Finder"
```

### Step 3: Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
Copy-Item .env.example .env

# Edit .env with your settings
notepad .env
```

**Update .env file with:**
```
MONGODB_URI=mongodb://localhost:27017/hiresenseai
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
MAX_FILE_SIZE=5242880
FRONTEND_URL=http://localhost:3000
```

**Seed Database (optional):**
```powershell
npm run seed
```

**Start Backend:**
```powershell
npm run dev
```

Backend will run on `http://localhost:5000`

### Step 4: Frontend Setup (New PowerShell Terminal)

```powershell
# Navigate to frontend directory
cd "g:\webdevelopment clients project\Job-Finder\frontend"

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

## Accessing the Application

1. **Open Browser**: http://localhost:3000
2. **Login with Demo Credentials**:
   - **Admin**: admin@hiresenseai.com / admin123
   - **Company**: hr@techinnovations.com / company123
   - **User**: john@example.com / user123

## Project Structure

```
Job-Finder/
├── backend/
│   ├── src/
│   │   ├── config/database.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── jobController.ts
│   │   │   ├── resumeController.ts
│   │   │   └── adminController.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Job.ts
│   │   │   └── Application.ts
│   │   ├── routes/
│   │   ├── middleware/auth.ts
│   │   ├── services/aiResumeAnalysis.ts
│   │   ├── utils/
│   │   └── index.ts
│   ├── uploads/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── JobCard.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── JobListings.tsx
│   │   │   ├── JobDetails.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   └── CompanyDashboard.tsx
│   │   ├── services/
│   │   ├── context/AuthContext.tsx
│   │   ├── hooks/useToast.ts
│   │   ├── types/index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.js
│
└── README.md
```

## Database Setup

### Using Local MongoDB

1. **Install MongoDB Community Edition**: https://docs.mongodb.com/manual/installation/

2. **Start MongoDB service**:
   ```powershell
   # Windows
   mongod
   ```

3. **Connect to database**:
   ```powershell
   mongo
   ```

### Using MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create account and sign in
3. Create new cluster
4. Get connection string
5. Update `MONGODB_URI` in `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hiresenseai
   ```

## Environment Variables Guide

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/hiresenseai |
| JWT_SECRET | Secret key for JWT tokens | your_super_secret_key |
| JWT_EXPIRE | Token expiration time | 7d |
| PORT | Backend server port | 5000 |
| NODE_ENV | Environment type | development |
| OPENAI_API_KEY | OpenAI API key (optional) | sk-... |
| MAX_FILE_SIZE | Max resume file size (bytes) | 5242880 |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:3000 |

## Running the Application

### Terminal 1 - Backend
```powershell
cd backend
npm run dev
```

### Terminal 2 - Frontend
```powershell
cd frontend
npm run dev
```

### Terminal 3 - MongoDB (if local)
```powershell
mongod
```

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB service is running
- Check connection string in `.env`
- Verify MongoDB is listening on port 27017

### Port Already in Use
```powershell
# Find and kill process on port 5000 (backend)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Port 3000 (frontend)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### npm install fails
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Reinstall
npm install
```

### Module not found errors
- Make sure you've run `npm install` in both frontend and backend
- Check that file paths are correct
- Clear node_modules cache

## Building for Production

### Backend
```powershell
cd backend
npm run build
npm start
```

### Frontend
```powershell
cd frontend
npm run build
```

## Features Overview

### 👤 User (Job Seeker)
- ✅ Register/Login
- ✅ Create profile
- ✅ Upload resume (PDF/DOCX)
- ✅ Search jobs with filters
- ✅ Apply for jobs
- ✅ View applications status
- ✅ AI resume analysis

### 🏢 Company
- ✅ Register/Login
- ✅ Post jobs
- ✅ Edit/Delete jobs
- ✅ View applicants
- ✅ View AI resume analysis
- ✅ Company dashboard

### 👨‍💼 Admin
- ✅ Manage users
- ✅ Manage companies
- ✅ Approve/reject jobs
- ✅ View statistics
- ✅ Admin dashboard

## API Testing

Use Postman or VS Code REST Client to test API endpoints:

```bash
# Register
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}

# Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload during development
2. **Redux DevTools**: Available if you add Redux later
3. **MongoDB Compass**: Use for visual database management
4. **Postman**: For API testing
5. **VS Code Extensions**: REST Client, MongoDB for VS Code

## Performance Tips

1. Enable MongoDB indexing
2. Use React DevTools
3. Monitor network requests in browser DevTools
4. Check backend logs for query performance
5. Enable CORS only for trusted origins in production

## Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS in production
- [ ] Set up MongoDB authentication
- [ ] Validate all file uploads
- [ ] Implement rate limiting
- [ ] Use CORS properly
- [ ] Sanitize inputs
- [ ] Update dependencies regularly

## Next Steps

1. Start the backend and frontend servers
2. Navigate to http://localhost:3000
3. Login with demo credentials
4. Explore the application
5. Test all features
6. Customize as needed

## Support & Resources

- **Documentation**: See README.md
- **Issues**: Check GitHub issues
- **MongoDB Docs**: https://docs.mongodb.com/
- **React Docs**: https://react.dev/
- **Express Docs**: https://expressjs.com/

---

**Happy coding! 🚀**
