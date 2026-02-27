# HireSenseAI - AI-Powered Job Finder Portal

A modern, full-stack job finder platform with AI-powered resume analysis and intelligent job matching.

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- Framer Motion (animations)
- React Router (navigation)
- Axios (HTTP client)

### Backend
- Node.js with Express + TypeScript
- MongoDB + Mongoose (database)
- JWT (authentication)
- Multer (file uploads)
- OpenAI API (AI resume analysis)

## Project Structure

```
HireSenseAI/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── context/         # React context
│   │   ├── hooks/           # Custom hooks
│   │   ├── types/           # TypeScript types
│   │   └── App.tsx          # Main app
│   └── package.json
│
├── backend/                  # Express backend
│   ├── src/
│   │   ├── config/          # Database config
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth middleware
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utilities
│   │   └── index.ts         # Server entry
│   ├── uploads/             # Resume uploads
│   └── package.json
│
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally or Atlas)
- npm or yarn

### Backend Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables**
   ```
   MONGODB_URI=mongodb://localhost:27017/hiresenseai
   JWT_SECRET=your_secret_key_here
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   OPENAI_API_KEY=your_openai_key_here
   ```

4. **Seed database** (optional)
   ```bash
   npm run seed
   ```

5. **Start backend**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start frontend**
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`

## Demo Credentials

### Admin
- Email: `admin@hiresenseai.com`
- Password: `admin123`

### Company
- Email: `hr@techinnovations.com`
- Password: `company123`

### Job Seeker
- Email: `john@example.com`
- Password: `user123`

## Features

### For Job Seekers
- ✅ Create profile with resume upload
- ✅ Search jobs with filters (location, type, experience level)
- ✅ Apply for jobs directly
- ✅ AI-powered resume analysis and matching
- ✅ View application status
- ✅ Track job applications

### For Companies
- ✅ Post and manage job listings
- ✅ Review applicant resumes
- ✅ View AI-generated resume analysis
- ✅ Update application status
- ✅ View company dashboard

### For Admins
- ✅ Manage all users
- ✅ Approve/reject job postings
- ✅ View platform statistics
- ✅ Monitor applications
- ✅ Admin dashboard with charts

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user
- `PUT /api/auth/profile` - Update profile

### Jobs
- `GET /api/jobs` - Get all jobs with filters
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job (company only)
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `POST /api/jobs/:jobId/apply` - Apply for job
- `GET /api/jobs/:jobId/applications` - Get job applications

### Resume
- `POST /api/resume/upload` - Upload resume
- `POST /api/resume/analyze/:jobId` - Analyze resume vs job

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/jobs/pending` - Get pending jobs
- `PUT /api/admin/jobs/:jobId/approve` - Approve job
- `PUT /api/admin/jobs/:jobId/reject` - Reject job

## UI Features

- 🎨 Modern glassmorphism design
- 🌓 Dark/light mode ready
- 📱 Fully responsive (mobile, tablet, desktop)
- ⚡ Smooth animations with Framer Motion
- 🎯 Intuitive user experience
- ♿ Accessible components

## Resume Analysis

The AI resume analysis feature:
1. Extracts text from PDF/DOCX resumes
2. Compares against job description
3. Calculates fit score (0-100)
4. Identifies strengths and weaknesses
5. Highlights missing skills

**Current Implementation**: Pattern matching with keyword extraction
**For Production**: Integrate with OpenAI GPT-4 API for advanced analysis

## Build & Deployment

### Build Frontend
```bash
cd frontend
npm run build
```

### Build Backend
```bash
cd backend
npm run build
npm start
```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/hiresenseai
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
OPENAI_API_KEY=your_api_key
MAX_FILE_SIZE=5242880
FRONTEND_URL=http://localhost:3000
```

## Testing

### Test Admin Features
- Login with admin account
- Approve/reject job postings
- View statistics dashboard

### Test Company Features
- Post a new job
- View applicants
- Update application status

### Test Job Seeker Features
- Apply for jobs
- Upload resume
- View AI analysis
- Track applications

## Performance Optimizations

- Lazy loading of components
- Image optimization
- Code splitting with React Router
- API caching strategies
- Database indexing
- Multer file size limits

## Security Features

- JWT token authentication
- Password hashing with bcryptjs
- CORS protection
- Input validation
- Role-based access control
- File upload validation

## Future Enhancements

- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Video interview integration
- [ ] Salary negotiation tool
- [ ] Machine learning recommendations
- [ ] Real-time chat between companies and candidates
- [ ] Blog and resources section
- [ ] Mobile app

## Contributing

Contributions are welcome! Please feel free to submit pull requests.

## License

MIT License - See LICENSE file for details

## Support

For support, email support@hiresenseai.com or open an issue on GitHub.

---

**Built with ❤️ by the HireSenseAI Team**
Supabase@job@123