import jwt from 'jsonwebtoken';
import { db } from '../utils/jsonDB.js';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-this';

/**
 * Middleware para verificar autenticación JWT
 */
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado'
      });
    }
    
    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar usuario
    const user = await db.getById('users', decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    // Agregar usuario al request (sin password)
    const { password: _, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado'
      });
    }
    
    console.error('Error en autenticación:', error);
    res.status(500).json({
      success: false,
      error: 'Error en autenticación'
    });
  }
};

/**
 * Middleware para verificar que el usuario sea admin
 */
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autenticado'
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requieren permisos de administrador'
    });
  }
  
  next();
};

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await db.getById('users', decoded.id);
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
      }
    }
  } catch (error) {
    // Ignorar errores en autenticación opcional
  }
  
  next();
};
