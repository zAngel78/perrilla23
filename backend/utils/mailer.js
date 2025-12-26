import formData from 'form-data';
import Mailgun from 'mailgun.js';

// Configurar Mailgun
const mailgun = new Mailgun(formData);

let mg = null;

// Inicializar Mailgun solo si hay credenciales
if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
  mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY,
  });
  console.log('✅ Mailgun configurado correctamente');
} else {
  console.warn('⚠️ Mailgun no configurado - Se simularán los envíos de email');
}

/**
 * Enviar email con keys digitales al cliente
 */
export async function sendKeyEmail(customerEmail, customerName, assignedKeys, order) {
  try {
    if (!mg) {
      console.log('📧 [SIMULADO] Email a:', customerEmail);
      console.log('🔑 Keys que se enviarían:', assignedKeys);
      return {
        success: true,
        simulated: true
      };
    }

    // Construir HTML del email
    const keysHTML = assignedKeys.map(key => `
      <div style="background: #f5f5f5; padding: 20px; margin: 15px 0; border-left: 4px solid #94c11f; border-radius: 8px;">
        <h3 style="margin: 0 0 10px 0; color: #333; font-size: 18px;">📦 ${key.productName}</h3>
        <div style="background: white; padding: 15px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 16px; font-weight: bold; color: #94c11f; letter-spacing: 2px;">
          ${key.key}
        </div>
        <p style="margin: 10px 0 0 0; color: #666; font-size: 13px;">
          ✅ Copia este código para activar tu producto
        </p>
      </div>
    `).join('');

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #0b1221; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #fff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0b1221 0%, #1a2332 100%); padding: 40px 20px; text-align: center;">
            <h1 style="margin: 0; color: #94c11f; font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">
              🎮 Tio Calcifer
            </h1>
            <p style="margin: 10px 0 0 0; color: #94c11f; font-size: 14px; letter-spacing: 3px;">
              GAMING SHOP
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="margin: 0 0 20px 0; color: #333; font-size: 24px; font-weight: bold;">
              ¡Hola ${customerName}! 👋
            </h2>
            
            <p style="margin: 0 0 20px 0; color: #666; font-size: 16px; line-height: 1.6;">
              Gracias por tu compra. Tu pago ha sido <strong style="color: #94c11f;">aprobado exitosamente</strong> ✅
            </p>

            <p style="margin: 0 0 30px 0; color: #666; font-size: 16px; line-height: 1.6;">
              Aquí están tus códigos de activación:
            </p>

            <!-- Keys -->
            ${keysHTML}

            <!-- Order Info -->
            <div style="background: #f9f9f9; padding: 20px; margin: 30px 0; border-radius: 8px;">
              <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">📋 Detalles de tu Orden</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; font-size: 14px;">Número de Orden:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: bold; text-align: right; font-size: 14px;">#${order.id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-size: 14px;">Total Pagado:</td>
                  <td style="padding: 8px 0; color: #94c11f; font-weight: bold; text-align: right; font-size: 16px;">$${order.total.toLocaleString('es-CL')} CLP</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-size: 14px;">Fecha:</td>
                  <td style="padding: 8px 0; color: #333; text-align: right; font-size: 14px;">${new Date().toLocaleString('es-CL')}</td>
                </tr>
              </table>
            </div>

            <!-- Instructions -->
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                <strong>💡 Importante:</strong> Guarda estos códigos en un lugar seguro. No los compartas con nadie.
              </p>
            </div>

            <p style="margin: 30px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
              Si tienes alguna pregunta o problema, no dudes en contactarnos.
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f5f5f5; padding: 30px 20px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="margin: 0 0 10px 0; color: #999; font-size: 12px;">
              © ${new Date().getFullYear()} Tio Calcifer Gaming Shop. Todos los derechos reservados.
            </p>
            <p style="margin: 0; color: #999; font-size: 12px;">
              Este es un email automático, por favor no respondas a este mensaje.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Enviar email con Mailgun
    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `Tio Calcifer Shop <${process.env.MAILGUN_FROM_EMAIL}>`,
      to: [customerEmail],
      subject: `🎮 Tus códigos de ${assignedKeys.length} producto${assignedKeys.length > 1 ? 's' : ''} - Orden #${order.id}`,
      html: emailHTML,
    });

    console.log('✅ Email enviado exitosamente:', result);

    return {
      success: true,
      messageId: result.id
    };

  } catch (error) {
    console.error('❌ Error enviando email:', error);
    throw error;
  }
}

/**
 * Enviar email de confirmación de orden (sin keys)
 */
export async function sendOrderConfirmationEmail(customerEmail, customerName, order) {
  try {
    if (!mg) {
      console.log('📧 [SIMULADO] Email de confirmación a:', customerEmail);
      return { success: true, simulated: true };
    }

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #fff;">
          <div style="background: linear-gradient(135deg, #0b1221 0%, #1a2332 100%); padding: 40px 20px; text-align: center;">
            <h1 style="margin: 0; color: #94c11f; font-size: 32px;">🎮 Tio Calcifer</h1>
          </div>
          
          <div style="padding: 40px 30px;">
            <h2 style="color: #333;">¡Hola ${customerName}! 👋</h2>
            <p style="color: #666; line-height: 1.6;">
              Hemos recibido tu orden <strong>#${order.id}</strong>.
            </p>
            <p style="color: #666; line-height: 1.6;">
              Te enviaremos otro correo cuando tu pago sea confirmado.
            </p>
            <p style="margin-top: 30px; color: #666;">
              Total: <strong style="color: #94c11f; font-size: 18px;">$${order.total.toLocaleString('es-CL')} CLP</strong>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `Tio Calcifer Shop <${process.env.MAILGUN_FROM_EMAIL}>`,
      to: [customerEmail],
      subject: `Orden Recibida #${order.id} - Tio Calcifer`,
      html: emailHTML,
    });

    return { success: true };
  } catch (error) {
    console.error('Error enviando email de confirmación:', error);
    return { success: false, error: error.message };
  }
}
