import type { Request, Response, NextFunction } from 'express';

export function xmlBodyParser(req: Request, res: Response, next: NextFunction) {
  // Handle XML content type
  if (req.headers['content-type']?.includes('application/xml') || 
      req.headers['content-type']?.includes('text/xml') ||
      req.url?.includes('/tally')) {
    
    let xmlData = '';
    
    req.on('data', (chunk) => {
      xmlData += chunk.toString();
    });
    
    req.on('end', () => {
      req.body = xmlData;
      next();
    });
  } else {
    next();
  }
}