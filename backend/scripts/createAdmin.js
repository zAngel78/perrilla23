import bcrypt from 'bcryptjs';

/**
 * Script para generar hash de contraseña de admin
 * Uso: node scripts/createAdmin.js
 */

const password = 'admin123'; // Cambia esto por la contraseña que quieras
const email = 'admin@tiocalcifer.com';

async function generateHash() {
  const hash = await bcrypt.hash(password, 10);
  
  console.log('\n✅ Admin user credentials:\n');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('\nHash para users.json:');
  console.log(hash);
  console.log('\n⚠️ IMPORTANTE: Cambia la contraseña después del primer login!\n');
}

generateHash();
