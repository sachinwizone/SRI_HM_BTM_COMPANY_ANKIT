import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { Response } from 'express';

// Local file storage service for development
export class LocalFileStorageService {
  private uploadsDir: string;

  constructor() {
    // Create uploads directory in the project root
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadsDirectory();
  }

  private ensureUploadsDirectory() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }

    // Create subdirectories
    const subdirs = ['documents', 'images', 'temp'];
    subdirs.forEach(subdir => {
      const subdirPath = path.join(this.uploadsDir, subdir);
      if (!fs.existsSync(subdirPath)) {
        fs.mkdirSync(subdirPath, { recursive: true });
      }
    });
  }

  // Generate a simple upload URL for local development
  async getObjectEntityUploadURL(baseUrl?: string): Promise<string> {
    const objectId = randomUUID();
    const host = baseUrl || 'http://localhost:3000';
    return `${host}/api/upload/${objectId}`;
  }

  // Generate upload URL for client documents
  async getClientDocumentUploadURL(clientId: string, documentType: string, baseUrl?: string): Promise<string> {
    const filename = `${clientId}_${documentType}_${randomUUID()}`;
    const host = baseUrl || 'http://localhost:3000';
    return `${host}/api/upload/client-document/${filename}`;
  }

  // Handle file upload and return the stored file path
  async handleFileUpload(fileBuffer: Buffer, filename: string, mimetype: string, objectId?: string): Promise<string> {
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Date.now();
    
    // Use objectId if provided, otherwise generate timestamp-based name
    const finalFilename = objectId ? 
      `${objectId}_${sanitizedFilename}` : 
      `${timestamp}_${sanitizedFilename}`;
    
    // Determine subdirectory based on file type
    let subdir = 'documents';
    if (mimetype.startsWith('image/')) {
      subdir = 'images';
    }

    const filePath = path.join(this.uploadsDir, subdir, finalFilename);
    
    // Write file to disk
    fs.writeFileSync(filePath, fileBuffer);
    
    // If objectId provided, store mapping for later retrieval
    if (objectId) {
      this.storeFileMapping(objectId, `/uploads/${subdir}/${finalFilename}`, sanitizedFilename, mimetype);
    }
    
    // Return relative path for storage in database
    return `/uploads/${subdir}/${finalFilename}`;
  }

  // Store file mapping for UUID-based retrieval
  private storeFileMapping(objectId: string, filePath: string, originalName: string, mimetype: string): void {
    const mappingFile = path.join(this.uploadsDir, 'file-mappings.json');
    let mappings: Record<string, any> = {};
    
    try {
      if (fs.existsSync(mappingFile)) {
        mappings = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));
      }
    } catch (error) {
      console.error('Error reading file mappings:', error);
    }
    
    mappings[objectId] = {
      filePath,
      originalName,
      mimetype,
      uploadedAt: new Date().toISOString()
    };
    
    try {
      fs.writeFileSync(mappingFile, JSON.stringify(mappings, null, 2));
    } catch (error) {
      console.error('Error saving file mappings:', error);
    }
  }

  // Get file path by object ID
  async getFileByObjectId(objectId: string): Promise<{ filePath: string; originalName: string; mimetype: string } | null> {
    const mappingFile = path.join(this.uploadsDir, 'file-mappings.json');
    
    try {
      if (!fs.existsSync(mappingFile)) {
        return null;
      }
      
      const mappings = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));
      return mappings[objectId] || null;
    } catch (error) {
      console.error('Error reading file mappings:', error);
      return null;
    }
  }

  // Serve file from local storage
  async serveFile(filePath: string, res: Response, forceDownload: boolean = false): Promise<void> {
    try {
      // Remove leading slash and resolve full path
      const relativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
      const fullPath = path.join(process.cwd(), relativePath);

      // Check if file exists
      if (!fs.existsSync(fullPath)) {
        res.status(404).json({ error: 'File not found' });
        return;
      }

      // Get file stats and determine content type
      const stats = fs.statSync(fullPath);
      const ext = path.extname(fullPath).toLowerCase();
      const fileName = path.basename(fullPath);
      
      let contentType = 'application/octet-stream';
      const contentTypes: Record<string, string> = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.bmp': 'image/bmp',
        '.webp': 'image/webp',
        '.txt': 'text/plain',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.zip': 'application/zip',
        '.rar': 'application/x-rar-compressed',
        '.7z': 'application/x-7z-compressed',
      };

      if (contentTypes[ext]) {
        contentType = contentTypes[ext];
      }

      // Set headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Cache-Control', 'private, max-age=3600');
      
      // Set proper filename for download
      if (forceDownload) {
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      } else {
        // Try to display inline for PDFs and images, download for others
        if (contentType.startsWith('image/') || contentType === 'application/pdf') {
          res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
        } else {
          res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        }
      }

      // Add error handling for stream
      const readStream = fs.createReadStream(fullPath);
      
      readStream.on('error', (streamError) => {
        console.error('Stream error:', streamError);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error streaming file' });
        }
      });

      readStream.pipe(res);

    } catch (error) {
      console.error('Error serving file:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error serving file' });
      }
    }
  }

  // Check if file exists
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const relativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
      const fullPath = path.join(process.cwd(), relativePath);
      return fs.existsSync(fullPath);
    } catch {
      return false;
    }
  }

  // Get file info
  async getFileInfo(filePath: string): Promise<{ size: number; mtime: Date } | null> {
    try {
      const relativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
      const fullPath = path.join(process.cwd(), relativePath);
      
      if (!fs.existsSync(fullPath)) {
        return null;
      }

      const stats = fs.statSync(fullPath);
      return {
        size: stats.size,
        mtime: stats.mtime
      };
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const localFileStorage = new LocalFileStorageService();