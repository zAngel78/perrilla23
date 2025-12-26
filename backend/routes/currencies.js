import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { db } from '../utils/jsonDB.js';

const router = express.Router();

/**
 * GET /api/currencies
 * Obtener todas las monedas activas (Público)
 */
router.get('/', async (req, res) => {
  try {
    const currencies = await db.getAll('currencies');
    
    // Filtrar solo monedas activas
    const activeCurrencies = currencies.filter(curr => curr.active);
    
    res.json({
      success: true,
      data: activeCurrencies
    });
  } catch (error) {
    console.error('Error fetching currencies:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener monedas',
      details: error.message
    });
  }
});

/**
 * GET /api/currencies/all
 * Obtener todas las monedas incluyendo inactivas (Admin)
 */
router.get('/all', authenticate, isAdmin, async (req, res) => {
  try {
    const currencies = await db.getAll('currencies');
    
    res.json({
      success: true,
      data: currencies
    });
  } catch (error) {
    console.error('Error fetching all currencies:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener monedas',
      details: error.message
    });
  }
});

/**
 * GET /api/currencies/default
 * Obtener la moneda por defecto (Público)
 */
router.get('/default', async (req, res) => {
  try {
    const currencies = await db.getAll('currencies');
    const defaultCurrency = currencies.find(curr => curr.isDefault) || currencies[0];
    
    res.json({
      success: true,
      data: defaultCurrency
    });
  } catch (error) {
    console.error('Error fetching default currency:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener moneda por defecto',
      details: error.message
    });
  }
});

/**
 * POST /api/currencies
 * Crear nueva moneda (Admin)
 */
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { code, name, symbol, rateToUSD, isDefault, active } = req.body;
    
    // Validaciones
    if (!code || !name || !symbol || !rateToUSD) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son requeridos (code, name, symbol, rateToUSD)'
      });
    }
    
    if (parseFloat(rateToUSD) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'La tasa debe ser un número positivo'
      });
    }
    
    // Si esta moneda será la por defecto, quitar el flag de las demás
    if (isDefault) {
      const currencies = await db.getAll('currencies');
      for (const curr of currencies) {
        if (curr.isDefault) {
          await db.update('currencies', curr.id, { isDefault: false });
        }
      }
    }
    
    const newCurrency = await db.create('currencies', {
      code: code.toUpperCase(),
      name,
      symbol,
      rateToUSD: parseFloat(rateToUSD),
      isDefault: isDefault === true || isDefault === 'true',
      active: active === true || active === 'true'
    });
    
    console.log('✅ Moneda creada:', newCurrency.code);
    
    res.status(201).json({
      success: true,
      data: newCurrency,
      message: 'Moneda creada exitosamente'
    });
  } catch (error) {
    console.error('Error creating currency:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear moneda',
      details: error.message
    });
  }
});

/**
 * PUT /api/currencies/:id
 * Actualizar moneda (Admin)
 */
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { code, name, symbol, rateToUSD, isDefault, active } = req.body;
    
    // Obtener la moneda actual
    const currentCurrency = await db.getById('currencies', req.params.id);
    
    if (!currentCurrency) {
      return res.status(404).json({
        success: false,
        error: 'Moneda no encontrada'
      });
    }
    
    // Validación: No permitir desactivar la moneda por defecto
    if (currentCurrency.isDefault && active === false) {
      return res.status(400).json({
        success: false,
        error: 'No se puede desactivar la moneda por defecto. Cambia primero la moneda por defecto a otra.'
      });
    }
    
    const updates = {};
    if (code !== undefined) updates.code = code.toUpperCase();
    if (name !== undefined) updates.name = name;
    if (symbol !== undefined) updates.symbol = symbol;
    if (rateToUSD !== undefined) updates.rateToUSD = parseFloat(rateToUSD);
    if (active !== undefined) updates.active = active === true || active === 'true';
    
    // Si esta moneda será la por defecto, quitar el flag de las demás
    if (isDefault === true || isDefault === 'true') {
      const currencies = await db.getAll('currencies');
      for (const curr of currencies) {
        if (curr.id !== req.params.id && curr.isDefault) {
          await db.update('currencies', curr.id, { isDefault: false });
        }
      }
      updates.isDefault = true;
      // Si se marca como default, debe estar activa
      updates.active = true;
    } else if (isDefault === false || isDefault === 'false') {
      updates.isDefault = false;
    }
    
    const updatedCurrency = await db.update('currencies', req.params.id, updates);
    
    if (!updatedCurrency) {
      return res.status(404).json({
        success: false,
        error: 'Moneda no encontrada'
      });
    }
    
    console.log('✅ Moneda actualizada:', req.params.id);
    
    res.json({
      success: true,
      data: updatedCurrency,
      message: 'Moneda actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error updating currency:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar moneda',
      details: error.message
    });
  }
});

/**
 * DELETE /api/currencies/:id
 * Eliminar moneda (Admin)
 */
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const currency = await db.getById('currencies', req.params.id);
    
    if (!currency) {
      return res.status(404).json({
        success: false,
        error: 'Moneda no encontrada'
      });
    }
    
    if (currency.isDefault) {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar la moneda por defecto'
      });
    }
    
    await db.delete('currencies', req.params.id);
    
    console.log('✅ Moneda eliminada:', req.params.id);
    
    res.json({
      success: true,
      message: 'Moneda eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting currency:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar moneda',
      details: error.message
    });
  }
});

export default router;
