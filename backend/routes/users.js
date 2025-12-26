import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../utils/jsonDB.js';

const router = express.Router();

/**
 * GET /api/users
 * Obtener todos los usuarios (sin passwords)
 */
router.get('/', async (req, res) => {
  try {
    const { role, search, limit } = req.query;
    
    let users = await db.getAll('users');
    
    // Filtrar por rol
    if (role) {
      users = users.filter(u => u.role === role);
    }
    
    // Búsqueda por nombre o email
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(u => 
        u.name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Remover passwords
    users = users.map(({ password, ...user }) => user);
    
    // Ordenar por fecha de creación (más recientes primero)
    users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Limitar resultados
    if (limit) {
      users = users.slice(0, parseInt(limit));
    }
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuarios',
      details: error.message
    });
  }
});

/**
 * GET /api/users/:id
 * Obtener un usuario por ID (sin password)
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await db.getById('users', req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    // Remover password
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuario',
      details: error.message
    });
  }
});

/**
 * PUT /api/users/:id
 * Actualizar un usuario
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;
    
    // Verificar que el usuario existe
    const existingUser = await db.getById('users', req.params.id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    // Verificar que el email no esté en uso por otro usuario
    if (email && email !== existingUser.email) {
      const emailExists = await db.findOne('users', u => u.email === email && u.id !== req.params.id);
      if (emailExists) {
        return res.status(400).json({
          success: false,
          error: 'El email ya está en uso'
        });
      }
    }
    
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    if (role) updates.role = role;
    
    // Si se proporciona nueva contraseña, hashearla
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }
    
    const updatedUser = await db.update('users', req.params.id, updates);
    
    // Remover password de la respuesta
    const { password: _, ...userWithoutPassword } = updatedUser;
    
    console.log('✅ Usuario actualizado:', updatedUser.id);
    
    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar usuario',
      details: error.message
    });
  }
});

/**
 * DELETE /api/users/:id
 * Eliminar un usuario (no puede eliminar admins)
 */
router.delete('/:id', async (req, res) => {
  try {
    const user = await db.getById('users', req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    // No permitir eliminar administradores
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No se pueden eliminar administradores'
      });
    }
    
    const deleted = await db.delete('users', req.params.id);
    
    console.log('✅ Usuario eliminado:', req.params.id);
    
    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar usuario',
      details: error.message
    });
  }
});

/**
 * GET /api/users/stats/summary
 * Obtener estadísticas de usuarios
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const users = await db.getAll('users');
    
    const stats = {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      customers: users.filter(u => u.role === 'user').length,
      totalOrders: users.reduce((sum, u) => sum + (u.totalOrders || 0), 0),
      totalRevenue: users.reduce((sum, u) => sum + (u.totalSpent || 0), 0)
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas',
      details: error.message
    });
  }
});

/**
 * PATCH /api/users/:id/orders
 * Actualizar contadores de órdenes de un usuario
 */
router.patch('/:id/orders', async (req, res) => {
  try {
    const { totalOrders, totalSpent } = req.body;
    
    const updates = {};
    if (totalOrders !== undefined) updates.totalOrders = totalOrders;
    if (totalSpent !== undefined) updates.totalSpent = totalSpent;
    
    const updatedUser = await db.update('users', req.params.id, updates);
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error updating user orders:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar órdenes del usuario',
      details: error.message
    });
  }
});

export default router;
