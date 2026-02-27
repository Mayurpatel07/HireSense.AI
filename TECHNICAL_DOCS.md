# 📚 HireSenseAI - Technical Documentation

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (Browser)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ React Components + TailwindCSS + Framer Motion      │   │
│  └──────────────────────┬──────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────┘
                          │
                   HTTPS/REST API
                          │
┌─────────────────────────┼───────────────────────────────────┐
│       Express Server Layer (Node.js)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Express Middleware (Auth, CORS, Validation)         │  │
│  │  - Authentication Middleware                        │  │
│  │  - Role-Based Access Control                        │  │
│  │  - Error Handling                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ API Routes & Controllers                            │  │
│  │  - Auth Routes                                      │  │
│  │  - Job Routes                                       │  │
│  │  - Resume Routes                                    │  │
│  │  - Admin Routes                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Services & Business Logic                           │  │
│  │  - AI Resume Analysis                               │  │
│  │  - File Upload Processing                           │  │
│  │  - Email Service (future)                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────────┘
                          │
                        TCP/IP
                          │
┌─────────────────────────┼───────────────────────────────────┐
│        Data Layer (MongoDB)                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ MongoDB Collections                                  │  │
│  │  - users (job seekers, companies, admins)          │  │
│  │  - jobs (job listings)                              │  │
│  │  - applications (job applications)                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Component Hierarchy

```
App
├── AuthProvider (Context)
├── Navbar
├── Routes
│   ├── Landing (public)
│   ├── Login (public)
│   ├── Register (public)
│   ├── JobListings (public)
│   ├── JobDetails (public)
│   ├── Profile (protected)
│   ├── CompanyDashboard (protected - company only)
│   └── AdminDashboard (protected - admin only)
└── ToastContainer
```

### State Management

```
Auth Context
├── user (User | null)
├── token (string | null)
├── loading (boolean)
├── error (string | null)
├── login()
├── register()
├── logout()
└── updateProfile()

Toast Hook
├── toasts (Toast[])
├── addToast()
└── removeToast()
```

### Service Layer

```
authService/
├── registerUser()
├── loginUser()
├── getProfile()
└── updateProfile()

jobService/
├── getJobs()
├── getJobById()
├── createJob()
├── updateJob()
├── deleteJob()
├── applyJob()
└── getJobApplications()

resumeService/
├── uploadResume()
├── analyzeResumeAgainstJob()
├── getUserApplications()
└── updateApplicationStatus()

adminService/
├── getDashboardStats()
├── getAllUsers()
├── deleteUser()
├── getPendingJobs()
├── approveJob()
└── rejectJob()
```

## Backend Architecture

### Middleware Stack

```
Express Server
    │
    ├── cors()
    ├── morgan() - logging
    ├── express.json()
    ├── Static files (/uploads)
    │
    ├── Routes
    │   ├── /api/auth
    │   │   ├── authMiddleware
    │   │   └── Controllers
    │   │
    │   ├── /api/jobs
    │   │   ├── authMiddleware
    │   │   ├── roleMiddleware(['company', 'user', 'admin'])
    │   │   └── Controllers
    │   │
    │   ├── /api/resume
    │   │   ├── authMiddleware
    │   │   ├── multer (file upload)
    │   │   └── Controllers
    │   │
    │   └── /api/admin
    │       ├── authMiddleware
    │       ├── roleMiddleware(['admin'])
    │       └── Controllers
    │
    └── Error Handler
```

### Database Schema

#### Users Collection
```typescript
{
  _id: ObjectId,
  name: string,
  email: string (unique),
  password: string (hashed),
  role: 'user' | 'company' | 'admin',
  phone?: string,
  avatar?: string,
  resume?: string,
  resumeUrl?: string,
  resumeAnalysis?: {
    score: number,
    strengths: string[],
    weaknesses: string[],
    extractedText: string,
    analyzedAt: Date
  },
  bio?: string,
  location?: string,
  skills?: string[],
  experience?: number,
  isVerified: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Jobs Collection
```typescript
{
  _id: ObjectId,
  title: string,
  description: string,
  requirements: string[],
  skills: string[],
  salary?: {
    min: number,
    max: number,
    currency: string
  },
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship',
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead',
  location: string,
  workplaceType: 'remote' | 'on-site' | 'hybrid',
  company: string,
  companyId: ObjectId (ref: User),
  applicationDeadline: Date,
  applicants: ObjectId[] (ref: User),
  status: 'published' | 'draft' | 'closed' | 'rejected',
  approvedBy?: ObjectId (ref: User),
  rejectionReason?: string,
  views: number,
  featured: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Applications Collection
```typescript
{
  _id: ObjectId,
  jobId: ObjectId (ref: Job),
  userId: ObjectId (ref: User),
  company: string,
  resume: string,
  coverLetter?: string,
  status: 'applied' | 'reviewing' | 'shortlisted' | 'rejected' | 'offer' | 'hired',
  matchScore?: number (0-100),
  resumeAnalysis?: {
    strengths: string[],
    weaknesses: string[],
    missingSkills: string[]
  },
  appliedAt: Date,
  updatedAt: Date
}
```

## Authentication Flow

### JWT Token Flow

```
1. User Registration
   ├── POST /api/auth/register
   ├── Hash password
   ├── Create user document
   ├── Generate JWT token
   ├── Return token + user data
   └── Store token in localStorage

2. User Login
   ├── POST /api/auth/login
   ├── Validate credentials
   ├── Generate JWT token
   ├── Return token + user data
   └── Store token in localStorage

3. Protected Requests
   ├── Add Authorization header: `Bearer {token}`
   ├── Backend validates token
   ├── Extract user info from token
   ├── Continue with request
   └── Handle expired/invalid tokens

4. Logout
   ├── Clear token from localStorage
   ├── Update auth context
   └── Redirect to home
```

## Data Flow Examples

### Job Search Flow

```
User Input (Search/Filter)
    ↓
SearchBar Component
    ↓
JobListings Component (handleSearch)
    ↓
jobService.getJobs({ search, filters, page })
    ↓
API Call: GET /api/jobs?search=...&filters=...
    ↓
Express Route Handler
    ↓
Job Controller (getJobs)
    ↓
MongoDB Query with aggregation
    ↓
Return results + pagination
    ↓
Update component state
    ↓
Render JobCard components
```

### Resume Upload & Analysis Flow

```
User selects resume file
    ↓
Profile Component (handleResumeUpload)
    ↓
FormData with file
    ↓
resumeService.uploadResume(file)
    ↓
API Call: POST /api/resume/upload (multipart/form-data)
    ↓
Express Route + Multer
    ↓
Resume Controller (uploadResume)
    ↓
Extract text from PDF/DOCX
    ↓
Update user document
    ↓
Return resumeUrl
    ↓
Display success message
```

### Job Application Flow

```
User clicks "Apply Now"
    ↓
Check authentication
    ↓
ApplyModal opens
    ↓
User submits application
    ↓
jobService.applyJob(jobId, resume)
    ↓
API Call: POST /api/jobs/{jobId}/apply
    ↓
Verify user & job exist
    ↓
Check not already applied
    ↓
Create application document
    ↓
Add user to job.applicants
    ↓
Return success
    ↓
Show success toast
    ↓
Update applications list
```

## File Upload Process

### Resume Upload Workflow

```
1. Frontend
   ├── Select file (PDF/DOCX)
   ├── Validate file type
   ├── Create FormData
   └── POST to /api/resume/upload

2. Backend
   ├── Multer middleware
   │   ├── Check file size
   │   ├── Validate mime type
   │   └── Save to /uploads
   ├── Controller
   │   ├── Extract resume text
   │   ├── Update user document
   │   └── Return resumeUrl
   └── Response

3. Storage
   └── /backend/uploads/{unique-filename}
```

## Error Handling Strategy

### Backend Error Handling

```typescript
try {
  // Business logic
} catch (error) {
  // Log error
  console.error(error);
  
  // Send appropriate response
  if (error is ValidationError)
    res.status(422).json({ message })
  else if (error is AuthError)
    res.status(401).json({ message })
  else if (error is PermissionError)
    res.status(403).json({ message })
  else if (error is NotFoundError)
    res.status(404).json({ message })
  else
    res.status(500).json({ message })
}
```

### Frontend Error Handling

```typescript
try {
  const response = await apiCall();
  // Handle success
} catch (error) {
  const message = error.response?.data?.message || 'Error occurred';
  addToast(message, 'error');
  // Handle user feedback
}
```

## API Request/Response Format

### Request Format
```json
{
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer {token}"
  },
  "body": {
    "field1": "value1",
    "field2": "value2"
  }
}
```

### Response Format
```json
{
  "message": "Success/Error message",
  "data": {
    // Response data
  },
  "error": null
}
```

## Security Implementations

### Password Security
- Hashed with bcryptjs (10 salt rounds)
- Never transmitted in plain text
- Minimum 6 characters validation

### JWT Security
- Signed with secret key
- Expiration time (7 days)
- Validated on every protected route
- Stored in localStorage (XSS vulnerable)

### File Upload Security
- Type validation (PDF, DOCX only)
- Size limit (5MB)
- Filename sanitization
- Stored outside web root

### CORS Security
- Whitelist frontend URL
- Only allow specific origins
- Allow specific methods

## Performance Optimizations

### Frontend
- Code splitting with React Router
- Lazy component loading
- Image optimization
- CSS minification with Tailwind
- Production build optimization

### Backend
- Database indexing on frequently queried fields
- Pagination for large datasets
- Query optimization with lean()
- Caching strategies
- File upload size limits

### Database
- Indexes on:
  - users.email
  - jobs.status
  - applications.userId
  - applications.jobId
- Connection pooling
- Query optimization

## Testing Recommendations

### Unit Tests
- Service functions
- Utility functions
- Component logic

### Integration Tests
- API endpoint testing
- Database operations
- Authentication flow

### E2E Tests
- Complete user workflows
- Cross-browser testing
- Mobile responsiveness

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] HTTPS enabled
- [ ] Security headers set
- [ ] Rate limiting implemented
- [ ] Error monitoring setup
- [ ] Performance monitoring
- [ ] Log aggregation
- [ ] CDN configured
- [ ] Dependencies updated
- [ ] Secrets not in code
- [ ] Testing completed

## Monitoring & Logging

### Backend Logging
- Use Morgan for HTTP logging
- Console.error for errors
- Structured logging recommended

### Frontend Logging
- Browser console
- Error tracking service (Sentry, etc.)
- User analytics

### Database Monitoring
- Connection monitoring
- Query performance
- Disk space
- Backup status

## Scaling Considerations

### Horizontal Scaling
- Load balancer (nginx)
- Multiple backend instances
- Database replication

### Vertical Scaling
- Server resource upgrade
- Database optimization
- Cache layer (Redis)

### Database Scaling
- Sharding by user ID
- Read replicas
- Connection pooling

---

For more information, refer to:
- README.md - Full documentation
- INSTALLATION.md - Setup guide
- QUICK_REFERENCE.md - Quick lookup
