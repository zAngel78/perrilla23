import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const execAsync = promisify(exec);

/**
 * GET /api/email-accounts
 * Listar todas las cuentas de correo
 * Solo admins
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { stdout } = await execAsync('docker exec mailserver setup email list');
    
    // Parsear la salida para extraer las cuentas
    const lines = stdout.split('\n').filter(line => line.includes('@'));
    const accounts = lines.map(line => {
      const match = line.match(/\* (.+@.+) \(/);
      return match ? match[1].trim() : null;
    }).filter(Boolean);

    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    console.error('Error listing email accounts:', error);
    res.status(500).json({
      success: false,
      error: 'Error al listar cuentas de correo',
      details: error.message
    });
  }
});

/**
 * POST /api/email-accounts
 * Crear nueva cuenta de correo
 * Solo admins
 */
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@tiocalcifer\.com$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'El email debe ser del dominio @tiocalcifer.com'
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Crear la cuenta usando printf para pasar la contraseña
    const command = `printf "${password}\\n${password}\\n" | docker exec -i mailserver setup email add ${email}`;
    await execAsync(command);

    console.log('✅ Cuenta de correo creada:', email);

    res.json({
      success: true,
      message: 'Cuenta de correo creada exitosamente',
      data: { email }
    });
  } catch (error) {
    console.error('Error creating email account:', error);
    
    // Verificar si el error es porque la cuenta ya existe
    if (error.message.includes('already exists') || error.stderr?.includes('already exists')) {
      return res.status(400).json({
        success: false,
        error: 'Esta cuenta de correo ya existe'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error al crear cuenta de correo',
      details: error.message
    });
  }
});

/**
 * PUT /api/email-accounts/:email
 * Actualizar contraseña de una cuenta
 * Solo admins
 */
router.put('/:email', authenticate, requireAdmin, async (req, res) => {
  try {
    const { email } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Contraseña es requerida'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Actualizar contraseña
    const command = `echo -e "${password}\n${password}" | docker exec -i mailserver setup email update ${email}`;
    await execAsync(command);

    console.log('✅ Contraseña actualizada para:', email);

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error updating email password:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar contraseña',
      details: error.message
    });
  }
});

/**
 * DELETE /api/email-accounts/:email
 * Eliminar cuenta de correo
 * Solo admins
 */
router.delete('/:email', authenticate, requireAdmin, async (req, res) => {
  try {
    const { email } = req.params;

    // Eliminar la cuenta
    await execAsync(`docker exec mailserver setup email del ${email}`);

    console.log('✅ Cuenta de correo eliminada:', email);

    res.json({
      success: true,
      message: 'Cuenta de correo eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting email account:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar cuenta de correo',
      details: error.message
    });
  }
});

export default router;
