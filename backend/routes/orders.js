import express from 'express';
import { db } from '../utils/jsonDB.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/orders
 * Obtener todas las órdenes (con filtros opcionales)
 */
router.get('/', async (req, res) => {
  try {
    const { status, customerId, limit } = req.query;
    
    let orders = await db.getAll('orders');
    
    // Filtrar por estado
    if (status) {
      orders = orders.filter(o => o.status === status);
    }
    
    // Filtrar por cliente
    if (customerId) {
      orders = orders.filter(o => o.customerId === customerId);
    }
    
    // Ordenar por fecha (más recientes primero)
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Limitar resultados
    if (limit) {
      orders = orders.slice(0, parseInt(limit));
    }
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener órdenes',
      details: error.message
    });
  }
});

/**
 * GET /api/orders/:id
 * Obtener una orden por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const order = await db.getById('orders', req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Orden no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener orden',
      details: error.message
    });
  }
});

/**
 * POST /api/orders
 * Crear una nueva orden
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      userId,
      customerName,
      customerEmail,
      items,
      subtotal,
      tax,
      shipping,
      total,
      paymentMethod,
      shippingAddress,
      status
    } = req.body;
    
    // Validaciones
    if (!customerName || !customerEmail || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos'
      });
    }
    
    const newOrder = await db.create('orders', {
      userId: userId || req.user.id,
      customerName,
      customerEmail,
      items,
      subtotal: parseFloat(subtotal || 0),
      tax: parseFloat(tax || 0),
      shipping: parseFloat(shipping || 0),
      total: parseFloat(total),
      status: status || 'pending',
      paymentMethod: paymentMethod || 'mercadopago',
      shippingAddress: shippingAddress || {}
    });
    
    console.log('✅ Orden creada:', newOrder.id);
    
    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      data: newOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear orden',
      details: error.message
    });
  }
});

/**
 * PUT /api/orders/:id
 * Actualizar una orden (principalmente el estado)
 */
router.put('/:id', async (req, res) => {
  try {
    const { status, shippingAddress, ...otherUpdates } = req.body;
    
    const updates = {};
    if (status) updates.status = status;
    if (shippingAddress) updates.shippingAddress = shippingAddress;
    
    Object.keys(otherUpdates).forEach(key => {
      updates[key] = otherUpdates[key];
    });
    
    const updatedOrder = await db.update('orders', req.params.id, updates);
    
    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        error: 'Orden no encontrada'
      });
    }
    
    console.log('✅ Orden actualizada:', updatedOrder.id);
    
    res.json({
      success: true,
      message: 'Orden actualizada exitosamente',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar orden',
      details: error.message
    });
  }
});

/**
 * DELETE /api/orders/:id
 * Eliminar una orden
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db.delete('orders', req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Orden no encontrada'
      });
    }
    
    console.log('✅ Orden eliminada:', req.params.id);
    
    res.json({
      success: true,
      message: 'Orden eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar orden',
      details: error.message
    });
  }
});

/**
 * GET /api/orders/stats/summary
 * Obtener estadísticas de órdenes
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const orders = await db.getAll('orders');
    
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      completed: orders.filter(o => o.status === 'completed').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      totalRevenue: orders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.total, 0)
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas',
      details: error.message
    });
  }
});

export default router;
