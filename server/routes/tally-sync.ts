import { Router } from 'express';
import { z } from 'zod';
import type { IStorage } from '../storage';

const router = Router();

// Validation schemas for Tally sync endpoints
const TallyClientSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  alias: z.string().optional(),
  category: z.enum(['ALFA', 'BETA', 'GAMMA', 'DELTA']),
  contactPerson: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  creditLimit: z.number().optional(),
  tallyGuid: z.string(),
  lastSynced: z.date().optional()
});

const TallyPaymentSchema = z.object({
  id: z.string().optional(),
  clientId: z.string().optional(),
  amount: z.number(),
  dueDate: z.date(),
  status: z.enum(['PENDING', 'PARTIAL', 'PAID', 'OVERDUE']),
  description: z.string(),
  voucherNumber: z.string(),
  voucherType: z.string(),
  tallyGuid: z.string(),
  lastSynced: z.date().optional()
});

const TallyOrderSchema = z.object({
  id: z.string().optional(),
  clientId: z.string().optional(),
  orderNumber: z.string(),
  totalAmount: z.number(),
  status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  description: z.string(),
  orderDate: z.date(),
  tallyGuid: z.string(),
  lastSynced: z.date().optional()
});

const TallyProductSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  alias: z.string().optional(),
  category: z.string().optional(),
  units: z.string().optional(),
  stock: z.number().optional(),
  value: z.number().optional(),
  tallyGuid: z.string(),
  lastSynced: z.date().optional()
});

export function createTallySyncRoutes(storage: IStorage) {
  // Health check endpoint
  router.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      service: 'tally-sync',
      timestamp: new Date().toISOString() 
    });
  });

  // Sync clients from Tally
  router.post('/sync/clients', async (req, res) => {
    try {
      const clients = z.array(TallyClientSchema).parse(req.body);
      const results = [];

      for (const clientData of clients) {
        try {
          // Check if client with same Tally GUID already exists
          const existingClients = await storage.getClients();
          const existingClient = existingClients.find(c => c.tallyGuid === clientData.tallyGuid);

          if (existingClient) {
            // Update existing client
            const updatedClient = await storage.updateClient(existingClient.id, {
              name: clientData.name,
              category: clientData.category,
              email: clientData.email,
              phone: clientData.phone,
              address: clientData.address,
              contactPerson: clientData.contactPerson,
              creditLimit: clientData.creditLimit?.toString() || null,
              tallyGuid: clientData.tallyGuid,
              lastSynced: new Date()
            });
            results.push({ action: 'updated', client: updatedClient });
          } else {
            // Create new client
            const newClient = await storage.createClient({
              name: clientData.name,
              category: clientData.category,
              email: clientData.email,
              phone: clientData.phone,
              address: clientData.address,
              contactPerson: clientData.contactPerson,
              creditLimit: clientData.creditLimit?.toString() || null,
              tallyGuid: clientData.tallyGuid,
              lastSynced: new Date()
            });
            results.push({ action: 'created', client: newClient });
          }
        } catch (error) {
          console.error('Error syncing client:', error);
          results.push({ 
            action: 'error', 
            client: clientData, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }

      res.json({
        success: true,
        message: `Processed ${clients.length} clients`,
        results
      });
    } catch (error) {
      console.error('Tally client sync error:', error);
      res.status(400).json({
        success: false,
        message: 'Invalid client data format',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Sync payments from Tally
  router.post('/sync/payments', async (req, res) => {
    try {
      const payments = z.array(TallyPaymentSchema).parse(req.body);
      const results = [];

      for (const paymentData of payments) {
        try {
          // Check if payment with same Tally GUID already exists
          const existingPayments = await storage.getPayments();
          const existingPayment = existingPayments.find(p => p.tallyGuid === paymentData.tallyGuid);

          if (existingPayment) {
            // Update existing payment
            const updatedPayment = await storage.updatePayment(existingPayment.id, {
              clientId: paymentData.clientId || existingPayment.clientId,
              amount: paymentData.amount.toString(),
              dueDate: paymentData.dueDate,
              status: paymentData.status,
              notes: paymentData.description,
              voucherNumber: paymentData.voucherNumber,
              voucherType: paymentData.voucherType,
              tallyGuid: paymentData.tallyGuid,
              lastSynced: new Date()
            });
            results.push({ action: 'updated', payment: updatedPayment });
          } else {
            // Create new payment - need clientId to be provided or lookup by name
            if (!paymentData.clientId) {
              throw new Error('ClientId is required for new payments');
            }
            const newPayment = await storage.createPayment({
              clientId: paymentData.clientId,
              amount: paymentData.amount.toString(),
              dueDate: paymentData.dueDate,
              status: paymentData.status,
              notes: paymentData.description,
              voucherNumber: paymentData.voucherNumber,
              voucherType: paymentData.voucherType,
              tallyGuid: paymentData.tallyGuid,
              lastSynced: new Date()
            });
            results.push({ action: 'created', payment: newPayment });
          }
        } catch (error) {
          console.error('Error syncing payment:', error);
          results.push({ 
            action: 'error', 
            payment: paymentData, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }

      res.json({
        success: true,
        message: `Processed ${payments.length} payments`,
        results
      });
    } catch (error) {
      console.error('Tally payment sync error:', error);
      res.status(400).json({
        success: false,
        message: 'Invalid payment data format',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Sync orders from Tally
  router.post('/sync/orders', async (req, res) => {
    try {
      const orders = z.array(TallyOrderSchema).parse(req.body);
      const results = [];

      for (const orderData of orders) {
        try {
          // Check if order with same Tally GUID already exists
          const existingOrders = await storage.getOrders();
          const existingOrder = existingOrders.find(o => o.tallyGuid === orderData.tallyGuid);

          if (existingOrder) {
            // Update existing order
            const updatedOrder = await storage.updateOrder(existingOrder.id, {
              orderNumber: orderData.orderNumber,
              clientId: orderData.clientId || existingOrder.clientId,
              amount: orderData.totalAmount.toString(),
              status: orderData.status as any,
              description: orderData.description,
              orderDate: orderData.orderDate,
              tallyGuid: orderData.tallyGuid,
              lastSynced: new Date()
            });
            results.push({ action: 'updated', order: updatedOrder });
          } else {
            // Create new order - need clientId and salesPersonId
            if (!orderData.clientId) {
              throw new Error('ClientId is required for new orders');
            }
            const newOrder = await storage.createOrder({
              orderNumber: orderData.orderNumber,
              clientId: orderData.clientId,
              salesPersonId: orderData.clientId, // Temporary - should be actual sales person
              amount: orderData.totalAmount.toString(),
              status: orderData.status as any,
              description: orderData.description,
              orderDate: orderData.orderDate,
              tallyGuid: orderData.tallyGuid,
              lastSynced: new Date()
            });
            results.push({ action: 'created', order: newOrder });
          }
        } catch (error) {
          console.error('Error syncing order:', error);
          results.push({ 
            action: 'error', 
            order: orderData, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }

      res.json({
        success: true,
        message: `Processed ${orders.length} orders`,
        results
      });
    } catch (error) {
      console.error('Tally order sync error:', error);
      res.status(400).json({
        success: false,
        message: 'Invalid order data format',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Sync products from Tally (if product management is implemented)
  router.post('/sync/products', async (req, res) => {
    try {
      const products = z.array(TallyProductSchema).parse(req.body);
      
      res.json({
        success: true,
        message: `Processed ${products.length} products`,
        note: 'Product management not implemented in current schema'
      });
    } catch (error) {
      console.error('Tally product sync error:', error);
      res.status(400).json({
        success: false,
        message: 'Invalid product data format',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get sync status and statistics
  router.get('/sync/status', async (req, res) => {
    try {
      const clients = await storage.getClients();
      const payments = await storage.getPayments();
      const orders = await storage.getOrders();

      const tallySyncedClients = clients.filter((c: any) => c.tallyGuid);
      const tallySyncedPayments = payments.filter((p: any) => p.tallyGuid);
      const tallySyncedOrders = orders.filter((o: any) => o.tallyGuid);

      const lastSyncTimes = [
        ...tallySyncedClients.map((c: any) => c.lastSynced),
        ...tallySyncedPayments.map((p: any) => p.lastSynced),
        ...tallySyncedOrders.map((o: any) => o.lastSynced)
      ].filter(Boolean).sort((a: any, b: any) => b.getTime() - a.getTime());

      res.json({
        success: true,
        syncStatus: {
          lastSyncTime: lastSyncTimes[0] || null,
          tallySyncedRecords: {
            clients: tallySyncedClients.length,
            payments: tallySyncedPayments.length,
            orders: tallySyncedOrders.length
          },
          totalRecords: {
            clients: clients.length,
            payments: payments.length,
            orders: orders.length
          }
        }
      });
    } catch (error) {
      console.error('Sync status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get sync status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return router;
}

export default router;