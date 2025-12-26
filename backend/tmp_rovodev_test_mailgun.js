import dotenv from 'dotenv';
import formData from 'form-data';
import Mailgun from 'mailgun.js';

// Cargar variables de entorno
dotenv.config();

console.log('\n🔍 Verificando credenciales de Mailgun...\n');
console.log('📋 Variables de entorno:');
console.log('  - MAILGUN_API_KEY:', process.env.MAILGUN_API_KEY ? process.env.MAILGUN_API_KEY.substring(0, 20) + '...' : '❌ NO CONFIGURADO');
console.log('  - MAILGUN_DOMAIN:', process.env.MAILGUN_DOMAIN || '❌ NO CONFIGURADO');
console.log('  - MAILGUN_FROM_EMAIL:', process.env.MAILGUN_FROM_EMAIL || '❌ NO CONFIGURADO');
console.log('');

if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
  console.error('❌ Mailgun NO está configurado correctamente');
  console.log('\n💡 Verifica que tu archivo .env tenga:');
  console.log('   MAILGUN_API_KEY=tu-api-key');
  console.log('   MAILGUN_DOMAIN=tu-dominio.com');
  console.log('   MAILGUN_FROM_EMAIL=noreply@tu-dominio.com');
  process.exit(1);
}

// Intentar crear cliente de Mailgun
try {
  const mailgun = new Mailgun(formData);
  const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY,
  });
  
  console.log('✅ Cliente de Mailgun creado correctamente');
  console.log('');
  
  // Intentar enviar un email de prueba
  console.log('🧪 Enviando email de prueba a: kehansarg@gmail.com...');
  
  const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
    from: `Tio Calcifer Shop Test <${process.env.MAILGUN_FROM_EMAIL}>`,
    to: ['kehansarg@gmail.com'],
    subject: '🧪 Test - Verificación de Mailgun',
    html: `
      <h2>✅ Mailgun funciona correctamente</h2>
      <p>Este es un email de prueba enviado desde el servidor.</p>
      <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CL')}</p>
    `,
  });
  
  console.log('✅ Email enviado exitosamente!');
  console.log('  - ID del mensaje:', result.id);
  console.log('  - Status:', result.status);
  console.log('');
  console.log('🎉 ¡Mailgun está configurado y funcionando correctamente!');
  console.log('');
  console.log('💡 Revisa la bandeja de entrada (y spam) de kehansarg@gmail.com');
  
} catch (error) {
  console.error('❌ Error al verificar Mailgun:');
  console.error('  - Mensaje:', error.message);
  console.error('  - Status:', error.status);
  console.error('');
  
  if (error.status === 401) {
    console.log('💡 Error de autenticación:');
    console.log('  1. Verifica que el API Key sea correcto');
    console.log('  2. Verifica que el dominio esté verificado en Mailgun');
    console.log('  3. Asegúrate de usar el API Key correcto (no el de sandbox)');
  }
  
  if (error.message.includes('domain')) {
    console.log('💡 Problema con el dominio:');
    console.log('  1. Verifica que tiocalcifer.com esté agregado y verificado en Mailgun');
    console.log('  2. Revisa los registros DNS (SPF, DKIM, etc.)');
    console.log('  3. Puedes usar el dominio sandbox para pruebas');
  }
}

console.log('');
