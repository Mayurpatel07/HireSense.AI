import { v2 as cloudinary } from 'cloudinary';

/**
 * Generate a signed Cloudinary URL for raw files (resumes, documents)
 * This ensures the file is securely delivered
 */
export const generateSignedCloudinaryUrl = (
  publicId: string,
  expirationTime: number = 86400 * 30 // 30 days in seconds
): string => {
  try {
    // Remove extension if already in public_id
    const cleanPublicId = publicId.includes('.')
      ? publicId
      : publicId;

    const signedUrl = cloudinary.url(cleanPublicId, {
      type: 'upload',
      resource_type: 'raw',
      format: 'pdf',
      flags: 'attachment', // Force download
      expires_at: Math.floor(Date.now() / 1000) + expirationTime,
      sign_url: true, // Add authentication signature
    });

    return signedUrl;
  } catch (error) {
    console.error('Error generating signed Cloudinary URL:', error);
    // Fallback to basic URL
    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${publicId}`;
  }
};

/**
 * Generate a public Cloudinary URL for raw files
 * Use this when you want public access without signing
 */
export const generatePublicCloudinaryUrl = (publicId: string): string => {
  try {
    const url = cloudinary.url(publicId, {
      type: 'upload',
      resource_type: 'raw',
      flags: 'attachment', // Force download
      secure: true, // Use HTTPS
    });

    return url;
  } catch (error) {
    console.error('Error generating public Cloudinary URL:', error);
    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${publicId}`;
  }
};
