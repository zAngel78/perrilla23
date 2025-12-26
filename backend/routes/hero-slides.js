import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { db } from '../utils/jsonDB.js';

const router = express.Router();

/**
 * GET /api/hero-slides
 * Obtener todos los slides activos (Público)
 */
router.get('/', async (req, res) => {
  try {
    const slides = await db.getAll('hero-slides');
    
    // Filtrar solo slides activos y ordenar
    const activeSlides = slides
      .filter(slide => slide.active)
      .sort((a, b) => a.order - b.order);
    
    res.json({
      success: true,
      data: activeSlides
    });
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener slides',
      details: error.message
    });
  }
});

/**
 * GET /api/hero-slides/all
 * Obtener todos los slides incluyendo inactivos (Admin)
 */
router.get('/all', authenticate, isAdmin, async (req, res) => {
  try {
    const slides = await db.getAll('hero-slides');
    
    // Ordenar por order
    const sortedSlides = slides.sort((a, b) => a.order - b.order);
    
    res.json({
      success: true,
      data: sortedSlides
    });
  } catch (error) {
    console.error('Error fetching all hero slides:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener slides',
      details: error.message
    });
  }
});

/**
 * GET /api/hero-slides/:id
 * Obtener un slide específico (Admin)
 */
router.get('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const slide = await db.getById('hero-slides', req.params.id);
    
    if (!slide) {
      return res.status(404).json({
        success: false,
        error: 'Slide no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: slide
    });
  } catch (error) {
    console.error('Error fetching hero slide:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener slide',
      details: error.message
    });
  }
});

/**
 * POST /api/hero-slides
 * Crear nuevo slide (Admin)
 */
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { image, showText, title, subtitle, buttonText, buttonLink, active } = req.body;
    
    // Validaciones
    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'La imagen es requerida'
      });
    }
    
    // Obtener el orden más alto actual
    const allSlides = await db.getAll('hero-slides');
    const maxOrder = allSlides.length > 0 
      ? Math.max(...allSlides.map(s => s.order)) 
      : 0;
    
    const newSlide = await db.create('hero-slides', {
      order: maxOrder + 1,
      image,
      showText: showText === true || showText === 'true',
      title: title || '',
      subtitle: subtitle || '',
      buttonText: buttonText || '',
      buttonLink: buttonLink || '',
      active: active === true || active === 'true'
    });
    
    console.log('✅ Hero slide creado:', newSlide.id);
    
    res.status(201).json({
      success: true,
      data: newSlide,
      message: 'Slide creado exitosamente'
    });
  } catch (error) {
    console.error('Error creating hero slide:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear slide',
      details: error.message
    });
  }
});

/**
 * PUT /api/hero-slides/:id
 * Actualizar slide (Admin)
 */
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { image, showText, title, subtitle, buttonText, buttonLink, active, order } = req.body;
    
    const updates = {};
    
    if (image !== undefined) updates.image = image;
    if (showText !== undefined) updates.showText = showText === true || showText === 'true';
    if (title !== undefined) updates.title = title;
    if (subtitle !== undefined) updates.subtitle = subtitle;
    if (buttonText !== undefined) updates.buttonText = buttonText;
    if (buttonLink !== undefined) updates.buttonLink = buttonLink;
    if (active !== undefined) updates.active = active === true || active === 'true';
    if (order !== undefined) updates.order = parseInt(order);
    
    const updatedSlide = await db.update('hero-slides', req.params.id, updates);
    
    if (!updatedSlide) {
      return res.status(404).json({
        success: false,
        error: 'Slide no encontrado'
      });
    }
    
    console.log('✅ Hero slide actualizado:', req.params.id);
    
    res.json({
      success: true,
      data: updatedSlide,
      message: 'Slide actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error updating hero slide:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar slide',
      details: error.message
    });
  }
});

/**
 * PUT /api/hero-slides/reorder
 * Reordenar slides (Admin)
 */
router.put('/reorder/bulk', authenticate, isAdmin, async (req, res) => {
  try {
    const { slides } = req.body; // Array de { id, order }
    
    if (!Array.isArray(slides)) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere un array de slides'
      });
    }
    
    // Actualizar el order de cada slide
    const updatePromises = slides.map(({ id, order }) => 
      db.update('hero-slides', id, { order: parseInt(order) })
    );
    
    await Promise.all(updatePromises);
    
    console.log('✅ Slides reordenados');
    
    res.json({
      success: true,
      message: 'Slides reordenados exitosamente'
    });
  } catch (error) {
    console.error('Error reordering slides:', error);
    res.status(500).json({
      success: false,
      error: 'Error al reordenar slides',
      details: error.message
    });
  }
});

/**
 * DELETE /api/hero-slides/:id
 * Eliminar slide (Admin)
 */
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const deleted = await db.delete('hero-slides', req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Slide no encontrado'
      });
    }
    
    console.log('✅ Hero slide eliminado:', req.params.id);
    
    res.json({
      success: true,
      message: 'Slide eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting hero slide:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar slide',
      details: error.message
    });
  }
});

export default router;
