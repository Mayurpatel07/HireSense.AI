import { createGzip } from 'zlib';
import fs from 'fs';
import path from 'path';

/**
 * Compress a file using gzip
 * @param inputPath - Path to the original file
 * @param outputPath - Path to save compressed file (optional, defaults to .gz extension)
 */
export const compressFile = (inputPath: string, outputPath?: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const output = outputPath || `${inputPath}.gz`;
    const input = fs.createReadStream(inputPath);
    const gzip = createGzip();
    const out = fs.createWriteStream(output);

    input
      .pipe(gzip)
      .pipe(out)
      .on('finish', () => {
        console.log(`✓ File compressed: ${path.basename(inputPath)} -> ${path.basename(output)}`);
        resolve(output);
      })
      .on('error', (err) => {
        console.error(`✗ Compression error: ${err.message}`);
        reject(err);
      });

    input.on('error', (err) => {
      console.error(`✗ Input file error: ${err.message}`);
      reject(err);
    });
  });
};

/**
 * Get file size info for logging
 */
export const getFileSizeInfo = (filePath: string): string => {
  try {
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    return stats.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;
  } catch (error) {
    return 'unknown size';
  }
};

/**
 * Calculate compression ratio
 */
export const getCompressionRatio = (originalSize: number, compressedSize: number): string => {
  const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
  return `${ratio}%`;
};
