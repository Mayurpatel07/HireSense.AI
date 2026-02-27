import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import path from 'path';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const bucketName = process.env.SUPABASE_BUCKET_NAME || 'resumes';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase credentials not configured. Falling back to local storage.');
}

// Initialize Supabase client
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Memory storage for multer (we'll handle upload to Supabase separately)
const storage = multer.memoryStorage();

/**
 * Multer upload middleware
 * Files are stored in memory, then uploaded to Supabase
 */
export const uploadResume = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
  },
});

/**
 * Upload file to Supabase Storage
 */
export const uploadFileToSupabase = async (
  file: Express.Multer.File,
  userId: string
): Promise<{ path: string; publicUrl: string }> => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  try {
    // Generate unique filename
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileName = `resume-${userId}-${uniqueSuffix}${ext}`;

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Generate a signed URL that's valid for 1 year (for reliable access)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 31536000); // 1 year in seconds

    if (signedUrlError) {
      console.error('Error creating signed URL:', signedUrlError);
      // Fallback to public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
      
      return {
        path: fileName,
        publicUrl: publicUrlData.publicUrl,
      };
    }

    return {
      path: fileName,
      publicUrl: signedUrlData.signedUrl,
    };
  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    throw error;
  }
};

/**
 * Delete file from Supabase Storage
 */
export const deleteFileFromSupabase = async (fileName: string): Promise<void> => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting from Supabase:', error);
    throw error;
  }
};

/**
 * Download file from Supabase
 */
export const downloadFileFromSupabase = async (fileName: string): Promise<Buffer> => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(fileName);

    if (error) {
      console.error('Supabase download error:', error);
      throw new Error(`Download failed: ${error.message}`);
    }

    return Buffer.from(await data.arrayBuffer());
  } catch (error) {
    console.error('Error downloading from Supabase:', error);
    throw error;
  }
};

export default supabase;
