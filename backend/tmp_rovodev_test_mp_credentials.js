import dotenv from 'dotenv';
import { MercadoPagoConfig, Payment } from 'mercadopago';

// Cargar variables de entorno
dotenv.config();

console.log('\n🔍 Verificando credenciales de MercadoPago...\n');
console.log('📋 Configuración actual:');
console.log('  - Access Token:', process.env.MERCADOPAGO_ACCESS_TOKEN?.substring(0, 20) + '...');
console.log('  - Public Key:', process.env.MERCADOPAGO_PUBLIC_KEY?.substring(0, 20) + '...');
console.log('  - Tipo:', process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith('TEST') ? 'TEST' : 'PRODUCCIÓN');
console.log('  - Backend URL:', process.env.BACKEND_URL);
console.log('');

// Intentar crear un cliente
try {
  const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  });
  
  console.log('✅ Cliente de MercadoPago creado correctamente');
  console.log('');
  
  // Intentar consultar un pago (usando el ID del webhook que recibiste)
  console.log('🧪 Intentando consultar el pago ID: 1343409853...');
  
  const payment = new Payment(client);
  const paymentInfo = await payment.get({ id: '1343409853' });
  
  console.log('✅ Pago encontrado:');
  console.log('  - ID:', paymentInfo.id);
  console.log('  - Status:', paymentInfo.status);
  console.log('  - Amount:', paymentInfo.transaction_amount);
  console.log('  - External Reference:', paymentInfo.external_reference);
  console.log('');
  console.log('🎉 ¡Las credenciales funcionan correctamente!');
  
} catch (error) {
  console.error('❌ Error al verificar credenciales:');
  console.error('  - Mensaje:', error.message);
  console.error('  - Status:', error.status);
  console.error('  - Causa:', error.cause);
  console.error('');
  
  if (error.status === 401) {
    console.log('💡 Posibles soluciones:');
    console.log('  1. Verifica que el Access Token sea correcto');
    console.log('  2. Regenera las credenciales en MercadoPago');
    console.log('  3. Verifica que el pago ID existe en el entorno correcto (TEST vs PROD)');
  }
  
  if (error.status === 404) {
    console.log('💡 El pago no existe o fue creado en un entorno diferente');
    console.log('  - Si el pago es de PRODUCCIÓN, usa credenciales APP_USR');
    console.log('  - Si el pago es de TEST, usa credenciales TEST');
  }
}

console.log('');
