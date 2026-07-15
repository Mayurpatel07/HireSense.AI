# MongoDB Atlas & Cloudinary Setup Guide

## 1️⃣ MongoDB Atlas Setup

### Step 1: Create Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account
3. Create a new organization (or use existing)

### Step 2: Create Cluster
1. Click **"Build a Database"**
2. Choose **FREE** tier (M0 Sandbox)
3. Select a cloud provider and region (choose closest to you)
4. Name your cluster (or keep default)
5. Click **"Create"**

### Step 3: Create Database User
1. Click **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set username: `hiresense_admin`
5. Set password: (save this password!)
6. Set role: **"Read and write to any database"**
7. Click **"Add User"**

### Step 4: Whitelist IP Address
1. Click **"Network Access"** in left sidebar
2. Click **"Add IP Address"**x
3. Click **"Allow Access from Anywhere"** (for development)
   - Or add your specific IP for production
4. Click **"Confirm"**

### Step 5: Get Connection String
1. Click **"Database"** in left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://hiresense_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name: `/hiresenseai` before the `?`
   ```
   mongodb+srv://hiresense_admin:yourpassword@cluster0.xxxxx.mongodb.net/hiresenseai?retryWrites=true&w=majority
   ```

---

## 2️⃣ Cloudinary Setup

### Step 1: Create Account
1. Go to https://cloudinary.com/users/register/free
2. Sign up for a free account
3. Verify your email

### Step 2: Get Credentials
1. Go to your **Dashboard** (https://cloudinary.com/console)
2. You'll see:
   - **Cloud Name**: (e.g., `dxxx1234`)
   - **API Key**: (e.g., `123456789012345`)
   - **API Secret**: (click to reveal)
3. Copy all three values

### Step 3: Create Upload Preset (Optional)
1. Click **Settings** (gear icon) 
2. Click **Upload** tab
3. Scroll to **Upload presets**
4. Click **Add upload preset**
5. Set:
   - Signing Mode: **Signed**
   - Folder: `hiresenseai/resumes`
6. Click **Save**

---

## 3️⃣ Update .env File

Open `backend/.env` and update:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://hiresense_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/hiresenseai?retryWrites=true&w=majority

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Other settings (keep as is)
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=5242880
```

---

## 4️⃣ Test Connection

```powershell
# In backend folder
cd "G:\webdevelopment clients project\Job-Finder\backend"

# Seed database (tests MongoDB connection)
npm run seed

# Start backend (tests both MongoDB and Cloudinary config)
npm run dev
```

### Expected Output:
```
MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
Server running on port 5000
```

---

## 5️⃣ Test Resume Upload

1. Start the backend server
2. Open Postman or use curl:

```bash
# Login first
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"user123"}'

# Copy the token from response

# Upload resume
curl -X POST http://localhost:5000/api/resume/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "resume=@/path/to/resume.pdf"
```

---

## 📋 Quick Reference

### MongoDB Atlas Connection String Format:
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

### Cloudinary Dashboard:
https://cloudinary.com/console

### Resume Upload Folder:
All resumes will be stored in: `hiresenseai/resumes/` on Cloudinary

---

## 🔧 Troubleshooting

### MongoDB Connection Error
- ✅ Check your IP is whitelisted in Network Access
- ✅ Verify username and password are correct
- ✅ Ensure database name is included in connection string
- ✅ Check if cluster is active (not paused)

### Cloudinary Upload Error
- ✅ Verify API credentials are correct
- ✅ Check file size is under 5MB
- ✅ Ensure file format is PDF or DOCX
- ✅ Check Cloudinary account is active

### "Invalid file type" Error
- Only `.pdf` and `.docx` files are allowed
- Check file mimetype matches allowed types

---

## 🎉 You're All Set!

Once both services are configured:
1. Run `npm run seed` to populate database
2. Run `npm run dev` to start backend
3. Run frontend with `cd ../frontend && npm run dev`
4. Test resume upload from Profile page

