import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const hasCloudinaryConfig =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

const useCloudinary =
  hasCloudinaryConfig &&
  process.env.USE_CLOUDINARY === 'true';

const localUploadDir = path.join(process.cwd(), 'uploads', 'resumes');
if (!fs.existsSync(localUploadDir)) {
  fs.mkdirSync(localUploadDir, { recursive: true });
}

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'hiresenseai/resumes',
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'raw', // Important for non-image files
    type: 'upload', // Make files publicly accessible via upload (not authenticated)
    public_id: (req: any, file: any) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = (path.extname(file.originalname || '').replace('.', '').toLowerCase() || 'pdf');
      return `resume-${req.user.id}-${uniqueSuffix}.${extension}`;
    },
    // Add quality optimization for storage
    quality: 'auto',
  } as any
});

const localStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, localUploadDir);
  },
  filename: (req: any, file, cb) => {
    const ext = path.extname(file.originalname) || '.pdf';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `resume-${req.user?.id || 'user'}-${uniqueSuffix}${ext}`);
  },
});

// Create multer upload middleware
export const uploadResume = multer({
  storage: useCloudinary ? storage : localStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
  }
});

export default cloudinary;
