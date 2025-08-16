/**
 * Video file validation utilities
 */

export const VIDEO_EXTENSIONS = [
  '.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.m4v', '.3gp'
] as const;

export const VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm', 
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/x-flv',
  'video/x-ms-wmv',
  'video/3gpp',
] as const;

export const MAX_VIDEO_SIZE_MB = 100;
export const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

/**
 * Check if a file is a video file based on its MIME type
 */
export function isVideoFile(file: File): boolean {
  return VIDEO_MIME_TYPES.includes(file.type as any) || 
         file.type.startsWith('video/');
}

/**
 * Check if a file extension indicates a video file
 */
export function isVideoExtension(filename: string): boolean {
  const ext = getFileExtension(filename);
  return VIDEO_EXTENSIONS.includes(ext as any);
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.toLowerCase().substring(filename.lastIndexOf('.'));
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate video file size and type
 */
export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  if (!isVideoFile(file)) {
    return {
      valid: false,
      error: 'File must be a video format (MP4, WebM, MOV, etc.)'
    };
  }
  
  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_VIDEO_SIZE_MB}MB limit. Your file is ${formatFileSize(file.size)}`
    };
  }
  
  return { valid: true };
}
