import express from 'express';
import { db } from '../utils/jsonDB.js';

const router = express.Router();

/**
 * POST /api/coupons/validate
 * Validar un cupón (público - cualquiera puede validar)
 */
router.post('/validate', async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Código de cupón requerido'
      });
    }
    
    // Buscar cupón por código (case insensitive)
    const coupon = await db.findOne('coupons', c => 
      c.code.toLowerCase() === code.toLowerCase()
    );
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Cupón no válido'
      });
    }
    
    // Validar si está activo
    if (!coupon.active) {
      return res.status(400).json({
        success: false,
        error: 'Este cupón ya no está activo'
      });
    }
    
    // Validar si está expirado
    if (coupon.expiresAt) {
      const now = new Date();
      const expiryDate = new Date(coupon.expiresAt);
      if (now > expiryDate) {
        return res.status(400).json({
          success: false,
          error: 'Este cupón ha expirado'
        });
      }
    }
    
    // Validar límite de uso
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        error: 'Este cupón ha alcanzado su límite de uso'
      });
    }
    
    // Validar compra mínima
    if (cartTotal < coupon.minPurchase) {
      return res.status(400).json({
        success: false,
        error: `Este cupón requiere una compra mínima de $${coupon.minPurchase}`
      });
    }
    
    // Calcular descuento
    let discount = 0;
    let freeShipping = false;
    
    if (coupon.type === 'percentage') {
      discount = (cartTotal * coupon.value) / 100;
      
      // Aplicar descuento máximo si existe
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else if (coupon.type === 'fixed') {
      discount = coupon.value;
      
      // No puede ser mayor al total del carrito
      if (discount > cartTotal) {
        discount = cartTotal;
      }
    } else if (coupon.type === 'free_shipping') {
      freeShipping = true;
    }
    
    res.json({
      success: true,
      message: 'Cupón válido',
      data: {
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        discount: parseFloat(discount.toFixed(2)),
        freeShipping,
        originalValue: coupon.value,
        minPurchase: coupon.minPurchase
      }
    });
    
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({
      success: false,
      error: 'Error al validar cupón',
      details: error.message
    });
  }
});

/**
 * POST /api/coupons/apply
 * Aplicar un cupón (incrementa contador de uso)
 */
router.post('/apply', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Código de cupón requerido'
      });
    }
    
    const coupon = await db.findOne('coupons', c => 
      c.code.toLowerCase() === code.toLowerCase()
    );
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Cupón no válido'
      });
    }
    
    // Incrementar contador de uso
    await db.update('coupons', coupon.id, {
      usageCount: (coupon.usageCount || 0) + 1
    });
    
    console.log(`✅ Cupón aplicado: ${coupon.code}`);
    
    res.json({
      success: true,
      message: 'Cupón aplicado exitosamente'
    });
    
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({
      success: false,
      error: 'Error al aplicar cupón',
      details: error.message
    });
  }
});

// Importar middleware
import { authenticate, isAdmin } from '../middleware/auth.js';

/**
 * GET /api/coupons (Admin only)
 * Obtener todos los cupones
 */
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { active, search } = req.query;
    
    let coupons = await db.getAll('coupons');
    
    // Filtrar por activos
    if (active !== undefined) {
      const isActive = active === 'true';
      coupons = coupons.filter(c => c.active === isActive);
    }
    
    // Búsqueda
    if (search) {
      const searchLower = search.toLowerCase();
      coupons = coupons.filter(c =>
        c.code.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Ordenar por fecha de creación
    coupons.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      count: coupons.length,
      data: coupons
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener cupones',
      details: error.message
    });
  }
});

/**
 * POST /api/coupons (Admin only)
 * Crear un nuevo cupón
 */
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { code, description, type, value, minPurchase, maxDiscount, usageLimit, expiresAt } = req.body;
    
    // Validaciones
    if (!code || !description || !type) {
      return res.status(400).json({
        success: false,
        error: 'Código, descripción y tipo son requeridos'
      });
    }
    
    // Validar que el código no exista
    const existingCoupon = await db.findOne('coupons', c => 
      c.code.toLowerCase() === code.toLowerCase()
    );
    
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un cupón con este código'
      });
    }
    
    const newCoupon = await db.create('coupons', {
      code: code.toUpperCase(),
      description,
      type,
      value: parseFloat(value) || 0,
      minPurchase: parseFloat(minPurchase) || 0,
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      usageCount: 0,
      active: true,
      expiresAt: expiresAt || null
    });
    
    console.log('✅ Cupón creado:', newCoupon.code);
    
    res.status(201).json({
      success: true,
      message: 'Cupón creado exitosamente',
      data: newCoupon
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear cupón',
      details: error.message
    });
  }
});

/**
 * PUT /api/coupons/:id (Admin only)
 * Actualizar un cupón
 */
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { description, value, minPurchase, maxDiscount, usageLimit, active, expiresAt } = req.body;
    
    const updates = {};
    if (description !== undefined) updates.description = description;
    if (value !== undefined) updates.value = parseFloat(value);
    if (minPurchase !== undefined) updates.minPurchase = parseFloat(minPurchase);
    if (maxDiscount !== undefined) updates.maxDiscount = maxDiscount ? parseFloat(maxDiscount) : null;
    if (usageLimit !== undefined) updates.usageLimit = usageLimit ? parseInt(usageLimit) : null;
    if (active !== undefined) updates.active = active;
    if (expiresAt !== undefined) updates.expiresAt = expiresAt;
    
    const updatedCoupon = await db.update('coupons', req.params.id, updates);
    
    if (!updatedCoupon) {
      return res.status(404).json({
        success: false,
        error: 'Cupón no encontrado'
      });
    }
    
    console.log('✅ Cupón actualizado:', updatedCoupon.code);
    
    res.json({
      success: true,
      message: 'Cupón actualizado exitosamente',
      data: updatedCoupon
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar cupón',
      details: error.message
    });
  }
});

/**
 * DELETE /api/coupons/:id (Admin only)
 * Eliminar un cupón
 */
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const deleted = await db.delete('coupons', req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Cupón no encontrado'
      });
    }
    
    console.log('✅ Cupón eliminado:', req.params.id);
    
    res.json({
      success: true,
      message: 'Cupón eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar cupón',
      details: error.message
    });
  }
});

export default router;
