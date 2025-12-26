import express from 'express';
import { db } from '../utils/jsonDB.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/fortnite-prices
 * Obtener todos los overrides de precios de Fortnite
 */
router.get('/', async (req, res) => {
  try {
    const overrides = await db.getAll('fortnite-price-overrides');
    
    res.json({
      success: true,
      data: overrides
    });
  } catch (error) {
    console.error('Error fetching fortnite price overrides:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener overrides de precios',
      details: error.message
    });
  }
});

/**
 * GET /api/fortnite-prices/:itemId
 * Obtener override de precio específico por itemId
 */
router.get('/:itemId', async (req, res) => {
  try {
    const overrides = await db.getAll('fortnite-price-overrides');
    const override = overrides.find(o => o.itemId === req.params.itemId);
    
    if (!override) {
      return res.status(404).json({
        success: false,
        error: 'Override no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: override
    });
  } catch (error) {
    console.error('Error fetching fortnite price override:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener override',
      details: error.message
    });
  }
});

/**
 * POST /api/fortnite-prices
 * Crear o actualizar override de precio
 * Solo admins
 */
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { itemId, itemName, originalPrice, customPrice, active } = req.body;
    
    if (!itemId || !itemName || customPrice === undefined) {
      return res.status(400).json({
        success: false,
        error: 'itemId, itemName y customPrice son requeridos'
      });
    }
    
    // Verificar si ya existe un override para este item
    const overrides = await db.getAll('fortnite-price-overrides');
    const existingIndex = overrides.findIndex(o => o.itemId === itemId);
    
    if (existingIndex !== -1) {
      // Actualizar existente
      const updated = await db.update('fortnite-price-overrides', overrides[existingIndex].id, {
        itemName,
        originalPrice: parseFloat(originalPrice || 0),
        customPrice: parseFloat(customPrice),
        active: active !== undefined ? active : true
      });
      
      console.log('✅ Override actualizado:', itemId);
      
      return res.json({
        success: true,
        message: 'Override actualizado exitosamente',
        data: updated
      });
    }
    
    // Crear nuevo
    const newOverride = await db.create('fortnite-price-overrides', {
      itemId,
      itemName,
      originalPrice: parseFloat(originalPrice || 0),
      customPrice: parseFloat(customPrice),
      active: active !== undefined ? active : true
    });
    
    console.log('✅ Override creado:', itemId);
    
    res.status(201).json({
      success: true,
      message: 'Override creado exitosamente',
      data: newOverride
    });
  } catch (error) {
    console.error('Error creating/updating fortnite price override:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear/actualizar override',
      details: error.message
    });
  }
});

/**
 * DELETE /api/fortnite-prices/:id
 * Eliminar override de precio
 * Solo admins
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const deleted = await db.delete('fortnite-price-overrides', req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Override no encontrado'
      });
    }
    
    console.log('✅ Override eliminado:', req.params.id);
    
    res.json({
      success: true,
      message: 'Override eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting fortnite price override:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar override',
      details: error.message
    });
  }
});

export default router;
