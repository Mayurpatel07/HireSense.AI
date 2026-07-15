# HireSenseAI - Quick Reference

## Key Features

### 🎯 Search & Filter
- Search by job title, company, skills
- Filter by location, job type, experience level, workplace type
- Pagination support
- Featured jobs display

### 🤖 AI Resume Analysis
- Upload PDF or DOCX resume
- AI-powered matching against job requirements
- Fit score calculation (0-100)
- Strength and weakness identification
- Missing skills detection

### 📊 Application Tracking
- Track application status
- View company feedback
- Application history
- Status updates (applied → reviewing → hired)

### 💼 Job Management (Company)
- Post new jobs
- Edit job postings
- Delete jobs
- View applicant list
- Filter applicants by status
- AI insights on applicant fit

### 🛠 Admin Controls
- Approve/reject job postings
- Manage user accounts
- View platform statistics
- Monitor applications
- Analytics dashboard

## User Workflows

### Job Seeker Flow
1. Register → Complete Profile → Upload Resume
2. Search Jobs → View Details → Apply
3. AI Analysis → Track Application → Get Updates

### Company Flow
1. Register Company → Create Profile
2. Post Jobs → Review Applicants
3. AI Analysis → Update Status → Hire

### Admin Flow
1. Login as Admin → Dashboard
2. Review Pending Jobs → Approve/Reject
3. View Statistics → Manage Users

## Common Tasks

### Upload Resume
1. Go to Profile
2. Scroll to Resume section
3. Select PDF or DOCX file
4. Click Upload Resume
5. Wait for processing

### Create Job Post
1. Go to Dashboard (Company)
2. Click "Post a New Job"
3. Fill job details
4. Set salary and requirements
5. Set application deadline
6. Submit for approval

### View Analytics
1. Login as Admin
2. Go to Admin Dashboard
3. View charts and statistics
4. Download reports

## API Response Format

```json
{
  "message": "Success message",
  "data": {
    // Response data
  },
  "error": null
}
```

## File Upload Limits

- **Resume**: Max 5MB
- **Formats**: PDF, DOCX
- **Storage**: `/backend/uploads/`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Metrics

- **Frontend Load**: < 2s
- **API Response**: < 500ms
- **Database Query**: < 100ms
- **Search Performance**: < 1s

## Keyboard Shortcuts

- `Ctrl + K` / `Cmd + K`: Open search (future)
- `Escape`: Close modals
- `Tab`: Navigate between fields

## Browser DevTools

### React DevTools
- Inspect component hierarchy
- Track state changes
- View props

### Network Tab
- Monitor API calls
- Check response times
- Debug network issues

### Console
- View error logs
- Check API responses
- Debug JavaScript

## Useful Commands

```bash
# Backend
npm run dev          # Development server
npm run build        # Build for production
npm run seed         # Seed sample data
npm start           # Production server

# Frontend
npm run dev         # Development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Check code quality
```

## Database Collections

1. **users** - User profiles
2. **jobs** - Job listings
3. **applications** - Job applications
4. **sessions** - Auth sessions (if implemented)

## Common Error Codes

| Code | Message | Solution |
|------|---------|----------|
| 401 | Unauthorized | Login required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Email already registered |
| 422 | Invalid Input | Check form validation |
| 500 | Server Error | Check backend logs |

## Testing Scenarios

### Register New User
- Use unique email
- Password minimum 6 chars
- Select appropriate role

### Apply for Job
- Must be logged in as job seeker
- Must have uploaded resume
- Can only apply once per job

### Post Job
- Must be logged in as company
- Fill all required fields
- Set realistic deadline
- Jobs need admin approval

## Responsive Design

- **Mobile** (< 640px): Single column, full-width
- **Tablet** (640px - 1024px): Two columns
- **Desktop** (> 1024px): Three columns + sidebar

## Color Scheme

- **Primary**: Sky Blue (#0ea5e9)
- **Success**: Green (#22c55e)
- **Warning**: Yellow (#eab308)
- **Error**: Red (#ef4444)
- **Text**: Dark Gray (#1f2937)
- **Background**: Light Blue (#f0f9ff)

## Dark Mode (Future)

- Planned for v2.0
- Toggle in settings
- Persistent preference

## Accessibility

- Keyboard navigation support
- Screen reader friendly
- ARIA labels
- Color contrast compliant

---

For detailed installation instructions, see **INSTALLATION.md**
For full documentation, see **README.md**
