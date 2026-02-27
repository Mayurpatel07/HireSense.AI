# 📡 HireSenseAI - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer {token}
```

---

## Auth Endpoints

### 1. Register User
**POST** `/auth/register`

**Request Body**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response** (201)
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "123abc",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Cases**
- 400: Missing required fields
- 400: Email already registered
- 500: Server error

---

### 2. Login User
**POST** `/auth/login`

**Request Body**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** (200)
```json
{
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "123abc",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Cases**
- 400: Email and password required
- 401: Invalid credentials
- 500: Server error

---

### 3. Get User Profile
**GET** `/auth/profile`

**Headers**
```
Authorization: Bearer {token}
```

**Response** (200)
```json
{
  "user": {
    "_id": "123abc",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "phone": "+1234567890",
    "bio": "Full-stack developer",
    "location": "New York, NY",
    "skills": ["React", "Node.js", "MongoDB"],
    "experience": 5
  }
}
```

**Error Cases**
- 401: Not authenticated
- 404: User not found

---

### 4. Update Profile
**PUT** `/auth/profile`

**Headers**
```
Authorization: Bearer {token}
```

**Request Body**
```json
{
  "name": "Jane Doe",
  "phone": "+9876543210",
  "bio": "Senior developer",
  "location": "San Francisco, CA",
  "skills": ["React", "TypeScript", "Node.js"],
  "experience": 7
}
```

**Response** (200)
```json
{
  "message": "Profile updated successfully",
  "user": { /* updated user data */ }
}
```

---

## Job Endpoints

### 1. Get All Jobs
**GET** `/jobs`

**Query Parameters**
```
search=developer        // Search keyword
location=New York      // Location filter
jobType=full-time      // Job type
experienceLevel=senior // Experience level
workplaceType=remote   // Workplace type
page=1                 // Page number
limit=12               // Items per page
```

**Response** (200)
```json
{
  "jobs": [
    {
      "_id": "123abc",
      "title": "Senior Developer",
      "company": "Tech Corp",
      "location": "New York, NY",
      "jobType": "full-time",
      "experienceLevel": "senior",
      "workplaceType": "hybrid",
      "salary": {
        "min": 120000,
        "max": 160000,
        "currency": "USD"
      },
      "skills": ["React", "Node.js", "MongoDB"],
      "featured": true,
      "views": 324,
      "createdAt": "2024-01-10T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "pages": 4,
    "currentPage": 1
  }
}
```

---

### 2. Get Job by ID
**GET** `/jobs/:id`

**Response** (200)
```json
{
  "job": {
    "_id": "123abc",
    "title": "Senior Developer",
    "description": "We are looking for...",
    "requirements": ["5+ years experience", "React expertise"],
    "skills": ["React", "Node.js", "MongoDB"],
    "company": "Tech Corp",
    "companyId": {
      "_id": "comp123",
      "name": "Tech Corp",
      "avatar": "https://..."
    },
    "location": "New York, NY",
    "workplaceType": "hybrid",
    "applicationDeadline": "2024-02-10T00:00:00Z",
    "status": "published",
    "views": 325,
    "featured": true
  }
}
```

---

### 3. Create Job (Company Only)
**POST** `/jobs`

**Headers**
```
Authorization: Bearer {token}
```

**Request Body**
```json
{
  "title": "React Developer",
  "description": "We are looking for...",
  "requirements": ["3+ years React", "JavaScript expert"],
  "skills": ["React", "JavaScript", "TailwindCSS"],
  "salary": {
    "min": 80000,
    "max": 120000,
    "currency": "USD"
  },
  "jobType": "full-time",
  "experienceLevel": "mid",
  "location": "San Francisco, CA",
  "workplaceType": "remote",
  "company": "Tech Corp",
  "applicationDeadline": "2024-02-10T00:00:00Z"
}
```

**Response** (201)
```json
{
  "message": "Job created successfully",
  "job": { /* job data */ }
}
```

**Error Cases**
- 401: Not authenticated
- 403: Only companies can post jobs

---

### 4. Update Job
**PUT** `/jobs/:id`

**Headers**
```
Authorization: Bearer {token}
```

**Request Body** (same as create, any fields)

**Response** (200)
```json
{
  "message": "Job updated successfully",
  "job": { /* updated job data */ }
}
```

---

### 5. Delete Job
**DELETE** `/jobs/:id`

**Headers**
```
Authorization: Bearer {token}
```

**Response** (200)
```json
{
  "message": "Job deleted successfully"
}
```

---

### 6. Apply for Job
**POST** `/jobs/:jobId/apply`

**Headers**
```
Authorization: Bearer {token}
```

**Request Body**
```json
{
  "resume": "resume-file.pdf",
  "coverLetter": "I am excited to apply..."
}
```

**Response** (201)
```json
{
  "message": "Application submitted successfully",
  "application": {
    "_id": "app123",
    "jobId": "job123",
    "userId": "user123",
    "status": "applied",
    "appliedAt": "2024-01-15T10:00:00Z"
  }
}
```

**Error Cases**
- 401: Not authenticated
- 400: Already applied for this job
- 404: Job not found

---

### 7. Get Job Applications
**GET** `/jobs/:jobId/applications`

**Headers**
```
Authorization: Bearer {token}
```

**Response** (200)
```json
{
  "applications": [
    {
      "_id": "app123",
      "jobId": "job123",
      "userId": {
        "_id": "user123",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "resumeAnalysis": {
          "score": 85,
          "strengths": ["React expertise", "5 years experience"],
          "weaknesses": ["Limited DevOps knowledge"]
        }
      },
      "status": "reviewing",
      "appliedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

## Resume Endpoints

### 1. Upload Resume
**POST** `/resume/upload`

**Headers**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data**
```
resume: [file] // PDF or DOCX
```

**Response** (200)
```json
{
  "message": "Resume uploaded successfully",
  "resumeUrl": "/uploads/resume-123.pdf",
  "user": { /* updated user data */ }
}
```

**Error Cases**
- 400: No file uploaded
- 413: File too large (max 5MB)
- 415: Unsupported file type

---

### 2. Analyze Resume
**POST** `/resume/analyze/:jobId`

**Headers**
```
Authorization: Bearer {token}
```

**Response** (200)
```json
{
  "analysis": {
    "fitScore": 85,
    "strengths": [
      "Strong React experience",
      "5 years development background",
      "MongoDB expertise"
    ],
    "weaknesses": [
      "Limited DevOps knowledge",
      "No AWS experience mentioned"
    ],
    "missingSkills": [
      "TypeScript",
      "GraphQL",
      "Docker"
    ],
    "summary": "Resume matches 85% of job requirements..."
  },
  "jobTitle": "Senior React Developer",
  "company": "Tech Corp"
}
```

---

### 3. Get User Applications
**GET** `/resume/applications`

**Headers**
```
Authorization: Bearer {token}
```

**Response** (200)
```json
{
  "applications": [
    {
      "_id": "app123",
      "jobId": "job123",
      "status": "applied",
      "matchScore": 85,
      "appliedAt": "2024-01-15T10:00:00Z",
      "jobId": {
        "title": "Senior Developer",
        "company": "Tech Corp",
        "location": "New York, NY"
      }
    }
  ]
}
```

---

### 4. Update Application Status
**PUT** `/resume/applications/:applicationId/status`

**Headers**
```
Authorization: Bearer {token}
```

**Request Body**
```json
{
  "status": "shortlisted"
}
```

**Valid Statuses**
- applied
- reviewing
- shortlisted
- rejected
- offer
- hired

**Response** (200)
```json
{
  "message": "Application status updated",
  "application": { /* updated application */ }
}
```

---

## Admin Endpoints

### 1. Get Dashboard Statistics
**GET** `/admin/stats`

**Headers**
```
Authorization: Bearer {token}
```

**Response** (200)
```json
{
  "stats": {
    "totalUsers": 1234,
    "totalCompanies": 56,
    "totalJobs": 342,
    "totalApplications": 2891,
    "publishedJobs": 300,
    "pendingJobs": 42
  },
  "charts": {
    "applicationsPerMonth": [
      { "_id": { "year": 2024, "month": 1 }, "count": 245 },
      { "_id": { "year": 2024, "month": 2 }, "count": 189 }
    ],
    "jobsPerMonth": [
      { "_id": { "year": 2024, "month": 1 }, "count": 23 },
      { "_id": { "year": 2024, "month": 2 }, "count": 18 }
    ]
  }
}
```

---

### 2. Get All Users
**GET** `/admin/users`

**Headers**
```
Authorization: Bearer {token}
```

**Query Parameters**
```
role=user      // Filter by role
page=1         // Page number
limit=20       // Items per page
```

**Response** (200)
```json
{
  "users": [ /* user list */ ],
  "pagination": {
    "total": 1234,
    "pages": 62
  }
}
```

---

### 3. Delete User
**DELETE** `/admin/users/:userId`

**Headers**
```
Authorization: Bearer {token}
```

**Response** (200)
```json
{
  "message": "User deleted successfully"
}
```

---

### 4. Get Pending Jobs
**GET** `/admin/jobs/pending`

**Headers**
```
Authorization: Bearer {token}
```

**Response** (200)
```json
{
  "jobs": [
    {
      "_id": "job123",
      "title": "Developer",
      "company": "Tech Corp",
      "companyId": {
        "_id": "comp123",
        "name": "Tech Corp",
        "email": "hr@techcorp.com"
      },
      "status": "draft",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### 5. Approve Job
**PUT** `/admin/jobs/:jobId/approve`

**Headers**
```
Authorization: Bearer {token}
```

**Response** (200)
```json
{
  "message": "Job approved successfully",
  "job": { /* updated job with status: "published" */ }
}
```

---

### 6. Reject Job
**PUT** `/admin/jobs/:jobId/reject`

**Headers**
```
Authorization: Bearer {token}
```

**Request Body**
```json
{
  "reason": "Job description contains inappropriate content"
}
```

**Response** (200)
```json
{
  "message": "Job rejected",
  "job": { /* updated job with status: "rejected" */ }
}
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "message": "Error description",
  "error": "ERROR_TYPE"
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Auth required |
| 403 | Forbidden - Permission denied |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource conflict |
| 422 | Unprocessable Entity - Validation error |
| 500 | Server Error - Backend error |

---

## Rate Limiting (Future Implementation)

```
100 requests per minute per IP
1000 requests per hour per user
```

---

## Testing with cURL

### Example: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Example: Get Jobs
```bash
curl -X GET "http://localhost:5000/api/jobs?search=react&location=New%20York&page=1" \
  -H "Authorization: Bearer {token}"
```

### Example: Create Job
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"title":"React Dev","description":"...","skills":["React"],...}'
```

---

## Postman Collection

Import the collection JSON for easier API testing:

```json
{
  "info": {
    "name": "HireSenseAI API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    // Add API endpoints here
  ]
}
```

---

For more information, refer to:
- README.md - Full documentation
- TECHNICAL_DOCS.md - Technical architecture
