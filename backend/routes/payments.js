import express from 'express';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { authenticate } from '../middleware/auth.js';
import { db } from '../utils/jsonDB.js';

const router = express.Router();

/**
 * POST /api/payments/create-preference
 * Crear preferencia de pago en MercadoPago
 * Cualquier usuario autenticado puede crear una preferencia
 */
router.post('/create-preference', authenticate, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'orderId es requerido'
      });
    }

    // Obtener la orden
    const order = await db.getById('orders', orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Orden no encontrada'
      });
    }

    // Verificar que la orden pertenezca al usuario
    if (order.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'No autorizado'
      });
    }

    // Crear items para MercadoPago
    const items = order.items.map((item) => ({
      title: item.name,
      description: item.description || 'Producto digital',
      quantity: item.quantity,
      unit_price: Math.round(parseFloat(item.price)), // Redondear a entero (CLP no usa centavos)
      currency_id: 'CLP', // Moneda base (pesos chilenos)
    }));

    // Configurar cliente de MercadoPago (recrear en cada request)
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    });

    // Crear la preferencia de pago
    const preference = new Preference(client);
    
    const preferenceData = {
      items: items,
      payer: {
        email: order.customerEmail,
        name: order.customerName,
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/payment/success?orderId=${orderId}`,
        failure: `${process.env.FRONTEND_URL}/payment/failure?orderId=${orderId}`,
        pending: `${process.env.FRONTEND_URL}/payment/pending?orderId=${orderId}`,
      },
      notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
      external_reference: orderId,
      statement_descriptor: 'Tio Calcifer Shop',
      binary_mode: true,
    };

    console.log('📋 Datos enviados a MercadoPago:', JSON.stringify(preferenceData, null, 2));

    const response = await preference.create({ body: preferenceData });

    // Actualizar la orden con el ID de preferencia
    await db.update('orders', orderId, {
      mercadopagoPreferenceId: response.id,
      status: 'pending_payment'
    });

    console.log('✅ Preferencia de MercadoPago creada:', response.id);

    res.json({
      success: true,
      data: {
        preferenceId: response.id,
        initPoint: response.init_point, // URL para redirigir al usuario
        sandboxInitPoint: response.sandbox_init_point,
      }
    });
  } catch (error) {
    console.error('Error creating MercadoPago preference:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear preferencia de pago',
      details: error.message
    });
  }
});

/**
 * GET /api/payments/status/:orderId
 * Obtener estado de pago de una orden
 */
router.get('/status/:orderId', authenticate, async (req, res) => {
  try {
    const order = await db.getById('orders', req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Orden no encontrada'
      });
    }

    // Verificar que la orden pertenezca al usuario
    if (order.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'No autorizado'
      });
    }

    res.json({
      success: true,
      data: {
        status: order.status,
        paymentId: order.mercadopagoPaymentId,
        preferenceId: order.mercadopagoPreferenceId,
      }
    });
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estado de pago',
      details: error.message
    });
  }
});

export default router;
