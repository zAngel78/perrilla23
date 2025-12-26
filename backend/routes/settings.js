import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SETTINGS_FILE = path.join(__dirname, '../database/settings.json');

/**
 * GET /api/settings
 * Obtener todas las configuraciones (Público para la conversión de V-Bucks)
 */
router.get('/', async (req, res) => {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const settings = JSON.parse(data);
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error reading settings:', error);
    
    // Si el archivo no existe, devolver defaults
    res.json({
      success: true,
      data: {
        fortniteVBucksRate: 100, // Default: 100 V-Bucks = $1 USD
        updatedAt: new Date().toISOString()
      }
    });
  }
});

/**
 * PUT /api/settings
 * Actualizar configuraciones (Admin only)
 */
router.put('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { fortniteVBucksRate, heroSlideInterval, fortniteUsernames } = req.body;
    
    // Validar que la tasa sea un número positivo (permite decimales)
    if (fortniteVBucksRate !== undefined) {
      const rate = parseFloat(fortniteVBucksRate);
      if (isNaN(rate) || rate <= 0) {
        return res.status(400).json({
          success: false,
          error: 'El precio por V-Buck debe ser un número positivo'
        });
      }
    }
    
    // Validar el intervalo de slides
    if (heroSlideInterval !== undefined) {
      const interval = parseInt(heroSlideInterval);
      if (isNaN(interval) || interval < 2000 || interval > 30000) {
        return res.status(400).json({
          success: false,
          error: 'El intervalo debe estar entre 2 y 30 segundos'
        });
      }
    }
    
    // Leer settings actuales
    let currentSettings = {
      fortniteVBucksRate: 4.4,
      heroSlideInterval: 5000,
      currency: 'CLP'
    };
    
    try {
      const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
      currentSettings = JSON.parse(data);
    } catch (error) {
      // Si no existe, usar defaults
    }
    
    // Actualizar settings
    const updatedSettings = {
      ...currentSettings,
      ...(fortniteVBucksRate !== undefined && { fortniteVBucksRate: parseFloat(fortniteVBucksRate) }),
      ...(heroSlideInterval !== undefined && { heroSlideInterval: parseInt(heroSlideInterval) }),
      ...(fortniteUsernames !== undefined && { fortniteUsernames: fortniteUsernames }),
      updatedAt: new Date().toISOString()
    };
    
    // Guardar en archivo
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(updatedSettings, null, 2));
    
    console.log('✅ Settings actualizados:', updatedSettings);
    
    res.json({
      success: true,
      data: updatedSettings,
      message: 'Configuración actualizada correctamente'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar configuración',
      details: error.message
    });
  }
});

export default router;
