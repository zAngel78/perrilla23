import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../utils/jsonDB.js';
import { sendPasswordResetEmail } from '../utils/mailer.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * POST /api/auth/register
 * Registrar nuevo usuario
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Validaciones
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password y nombre son requeridos'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }
    
    // Verificar si el usuario ya existe
    const existingUser = await db.findOne('users', user => user.email === email);
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado'
      });
    }
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear usuario
    const newUser = await db.create('users', {
      email,
      password: hashedPassword,
      name,
      role: 'user' // Por defecto es usuario normal
    });
    
    // Generar token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    // Remover password de la respuesta
    const { password: _, ...userWithoutPassword } = newUser;
    
    console.log('✅ Usuario registrado:', newUser.email);
    
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      error: 'Error al registrar usuario',
      details: error.message
    });
  }
});

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validaciones
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y password son requeridos'
      });
    }
    
    // Buscar usuario
    const user = await db.findOne('users', u => u.email === email);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }
    
    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }
    
    // Generar token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    // Remover password de la respuesta
    const { password: _, ...userWithoutPassword } = user;
    
    console.log('✅ Usuario autenticado:', user.email);
    
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({
      success: false,
      error: 'Error al iniciar sesión',
      details: error.message
    });
  }
});

/**
 * GET /api/auth/me
 * Obtener usuario actual (requiere autenticación)
 */
router.get('/me', async (req, res) => {
  try {
    // El middleware de autenticación debe agregar req.user
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado'
      });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.getById('users', decoded.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(401).json({
      success: false,
      error: 'Token inválido o expirado'
    });
  }
});

/**
 * POST /api/auth/forgot-password
 * Solicitar reset de contraseña
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email es requerido'
      });
    }
    
    // Buscar usuario
    const user = await db.findOne('users', u => u.email === email);
    
    // Por seguridad, siempre responder success aunque el usuario no exista
    if (!user) {
      return res.json({
        success: true,
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
      });
    }
    
    // Generar token de reset (válido por 1 hora)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hora
    
    // Guardar token en el usuario
    await db.update('users', user.id, {
      resetPasswordToken: resetTokenHash,
      resetPasswordExpiry: resetTokenExpiry
    });
    
    // Enviar email
    await sendPasswordResetEmail(user.email, user.name, resetToken);
    
    console.log('✅ Token de reset generado para:', user.email);
    
    res.json({
      success: true,
      message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({
      success: false,
      error: 'Error al procesar solicitud',
      details: error.message
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Resetear contraseña con token
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token y nueva contraseña son requeridos'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }
    
    // Hash del token recibido
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Buscar usuario con token válido
    const users = await db.getAll('users');
    const user = users.find(u => 
      u.resetPasswordToken === resetTokenHash &&
      u.resetPasswordExpiry > Date.now()
    );
    
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Token inválido o expirado'
      });
    }
    
    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Actualizar contraseña y limpiar token
    await db.update('users', user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpiry: null
    });
    
    console.log('✅ Contraseña actualizada para:', user.email);
    
    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      error: 'Error al restablecer contraseña',
      details: error.message
    });
  }
});

export default router;
