import formData from 'form-data';
import Mailgun from 'mailgun.js';

/**
 * Crear cliente de Mailgun (se crea cada vez para asegurar que las env vars estén cargadas)
 */
function getMailgunClient() {
  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
    return null;
  }
  
  const mailgun = new Mailgun(formData);
  return mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY,
  });
}

/**
 * Enviar email con keys digitales al cliente
 */
export async function sendKeyEmail(customerEmail, customerName, assignedKeys, order) {
  try {
    const mg = getMailgunClient();
    
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
    const mg = getMailgunClient();
    
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

/**
 * Enviar email de recuperación de contraseña
 */
export async function sendPasswordResetEmail(email, name, resetToken) {
  try {
    const mg = getMailgunClient();
    
    if (!mg) {
      console.log('📧 [SIMULADO] Email de reset a:', email);
      console.log('🔑 Token de reset:', resetToken);
      return { success: true, simulated: true };
    }

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const messageData = {
      from: `Tio Calcifer Shop <${process.env.MAILGUN_FROM_EMAIL}>`,
      to: [email],
      subject: '🔐 Recuperación de Contraseña - Tio Calcifer Shop',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #00ff87 0%, #60efff 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: #0a0e27; margin: 0; font-size: 28px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: #00ff87; color: #0a0e27; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .button:hover { background: #00e676; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Recuperación de Contraseña</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${name}</strong>,</p>
              
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Tio Calcifer Shop</strong>.</p>
              
              <p>Para crear una nueva contraseña, haz clic en el siguiente botón:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
              </div>
              
              <p>O copia y pega este enlace en tu navegador:</p>
              <p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
                ${resetUrl}
              </p>
              
              <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul style="margin: 10px 0;">
                  <li>Este enlace es válido por <strong>1 hora</strong></li>
                  <li>Si no solicitaste este cambio, ignora este correo</li>
                  <li>Tu contraseña actual permanecerá activa hasta que completes el proceso</li>
                </ul>
              </div>
              
              <p>Si tienes algún problema, contáctanos respondiendo a este correo.</p>
              
              <p>Saludos,<br><strong>Equipo de Tio Calcifer Shop</strong></p>
            </div>
            <div class="footer">
              <p>Este es un correo automático, por favor no respondas directamente.</p>
              <p>&copy; ${new Date().getFullYear()} Tio Calcifer Shop. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, messageData);

    console.log('✅ Email de reset enviado a:', email);

    return {
      success: true,
      messageId: result.id,
    };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
}
