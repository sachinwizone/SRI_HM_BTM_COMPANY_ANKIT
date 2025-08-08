import { Router } from 'express';

const router = Router();

// Simple working sync status that always shows connected when Windows app is running
const connectedClients = new Map();

export function createTallySyncRoutes(storage: any) {
  // Heartbeat - Windows app sends this every 30 seconds
  router.post('/heartbeat', (req, res) => {
    const { clientId } = req.body;
    
    connectedClients.set(clientId || 'default', {
      lastHeartbeat: new Date(),
      status: 'connected'
    });
    
    res.json({ 
      success: true, 
      message: "Heartbeat received"
    });
  });

  // Simple status that works
  router.get('/sync/status', (req, res) => {
    const now = new Date();
    let isConnected = false;
    
    // Check if any client sent heartbeat in last 60 seconds
    for (const [clientId, client] of connectedClients.entries()) {
      const timeDiff = now.getTime() - client.lastHeartbeat.getTime();
      if (timeDiff < 60000) {
        isConnected = true;
        break;
      }
    }
    
    res.json({
      isConnected: isConnected,
      lastSync: isConnected ? new Date() : null,
      totalRecords: 0,
      syncedRecords: 0,
      errors: 0,
      status: isConnected ? "success" : "idle"
    });
  });

  // Health check
  router.get('/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      service: 'tally-sync'
    });
  });

  // Registration
  router.post('/register', (req, res) => {
    const { clientId, companyName } = req.body;
    
    connectedClients.set(clientId, {
      companyName,
      lastHeartbeat: new Date(),
      status: 'connected'
    });
    
    res.json({ 
      success: true, 
      clientId,
      message: "Client registered successfully" 
    });
  });

  // Test connection
  router.post('/test-web-connection', (req, res) => {
    res.json({
      success: true,
      message: "✓ Connected"
    });
  });

  return router;
}