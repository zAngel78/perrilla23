import express from 'express';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { db } from '../utils/jsonDB.js';
import { sendKeyEmail } from '../utils/mailer.js';

const router = express.Router();

/**
 * POST /api/payments/webhook
 * Webhook de MercadoPago para recibir notificaciones de pago
 */
router.post('/webhook', async (req, res) => {
  try {
    // MercadoPago envía el webhook de esta forma
    const { type, data } = req.body;

    console.log('📩 Webhook recibido:', { type, data });

    // Solo procesar notificaciones de pago
    if (type === 'payment') {
      const paymentId = data.id;

      // Configurar cliente de MercadoPago (crear en cada request para asegurar que las variables de entorno estén cargadas)
      const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
      });

      // Obtener información del pago
      const payment = new Payment(client);
      const paymentInfo = await payment.get({ id: paymentId });

      console.log('💳 Información del pago:', {
        id: paymentInfo.id,
        status: paymentInfo.status,
        external_reference: paymentInfo.external_reference,
      });

      const orderId = paymentInfo.external_reference;

      if (!orderId) {
        console.error('❌ No se encontró orderId en external_reference');
        return res.status(200).send('OK'); // Responder 200 para evitar reintentos
      }

      // Obtener la orden
      const order = await db.getById('orders', orderId);

      if (!order) {
        console.error('❌ Orden no encontrada:', orderId);
        return res.status(200).send('OK');
      }

      // Actualizar estado según el status del pago
      if (paymentInfo.status === 'approved') {
        console.log('✅ Pago aprobado para orden:', orderId);

        // Asignar keys digitales
        const assignedKeys = await assignKeysToOrder(order);

        // Actualizar orden
        await db.update('orders', orderId, {
          status: 'paid',
          mercadopagoPaymentId: paymentInfo.id,
          paymentStatus: paymentInfo.status,
          paidAt: new Date().toISOString(),
          digitalKeys: assignedKeys,
        });

        // Enviar correo con las keys
        if (assignedKeys.length > 0) {
          await sendKeyEmail(order.customerEmail, order.customerName, assignedKeys, order);
          console.log('📧 Correo enviado a:', order.customerEmail);
        }

      } else if (paymentInfo.status === 'rejected' || paymentInfo.status === 'cancelled') {
        console.log('❌ Pago rechazado/cancelado para orden:', orderId);

        await db.update('orders', orderId, {
          status: 'payment_failed',
          mercadopagoPaymentId: paymentInfo.id,
          paymentStatus: paymentInfo.status,
        });

      } else if (paymentInfo.status === 'pending' || paymentInfo.status === 'in_process') {
        console.log('⏳ Pago pendiente para orden:', orderId);

        await db.update('orders', orderId, {
          status: 'pending_payment',
          mercadopagoPaymentId: paymentInfo.id,
          paymentStatus: paymentInfo.status,
        });
      }
    }

    // Siempre responder 200 para que MercadoPago no reintente
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing webhook:', error);
    // Aún así responder 200 para evitar reintentos
    res.status(200).send('OK');
  }
});

/**
 * Asignar keys digitales a una orden
 */
async function assignKeysToOrder(order) {
  const assignedKeys = [];

  try {
    for (const item of order.items) {
      // Solo procesar productos digitales
      if (!item.isDigitalProduct) continue;

      // Obtener el producto
      const product = await db.getById('products', item.productId);

      if (!product || !product.digitalKeys || product.digitalKeys.length === 0) {
        console.warn(`⚠️ Producto ${item.name} no tiene keys disponibles`);
        continue;
      }

      // Asignar una key por cada cantidad comprada
      for (let i = 0; i < item.quantity; i++) {
        // Buscar la primera key disponible
        const availableKey = product.digitalKeys.find(k => k.status === 'available');

        if (!availableKey) {
          console.warn(`⚠️ No hay más keys disponibles para ${item.name}`);
          break;
        }

        // Marcar la key como usada
        const updatedKeys = product.digitalKeys.map(k => {
          if (k.id === availableKey.id) {
            return {
              ...k,
              status: 'used',
              usedAt: new Date().toISOString(),
              usedBy: order.id
            };
          }
          return k;
        });

        await db.update('products', item.productId, {
          digitalKeys: updatedKeys
        });

        // Agregar a la lista de keys asignadas
        assignedKeys.push({
          productName: item.name,
          productId: item.productId,
          key: availableKey.code,
          keyId: availableKey.id
        });

        console.log(`🔑 Key asignada para ${item.name}:`, availableKey.id);
      }
    }
  } catch (error) {
    console.error('Error assigning keys:', error);
  }

  return assignedKeys;
}

export default router;
