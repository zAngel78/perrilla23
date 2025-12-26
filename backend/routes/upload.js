import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { 
  uploadSingle, 
  uploadMultiple, 
  uploadProductImages,
  handleUploadError,
  deleteFile,
  getImageUrl 
} from '../middleware/upload.js';
import { db } from '../utils/jsonDB.js';

const router = express.Router();

/**
 * POST /api/upload/single
 * Subir una sola imagen
 */
router.post('/single', authenticate, isAdmin, (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se subió ningún archivo'
      });
    }
    
    const imageUrl = getImageUrl(req.file.filename, req);
    
    console.log('✅ Imagen subida:', req.file.filename);
    
    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        filename: req.file.filename,
        url: imageUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  });
});

/**
 * POST /api/upload/multiple
 * Subir múltiples imágenes (galería)
 */
router.post('/multiple', authenticate, isAdmin, (req, res, next) => {
  uploadMultiple(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se subieron archivos'
      });
    }
    
    const images = req.files.map(file => ({
      filename: file.filename,
      url: getImageUrl(file.filename, req),
      size: file.size,
      mimetype: file.mimetype
    }));
    
    console.log(`✅ ${images.length} imágenes subidas`);
    
    res.json({
      success: true,
      message: `${images.length} imagen(es) subida(s) exitosamente`,
      data: images
    });
  });
});

/**
 * POST /api/upload/product
 * Subir imagen de portada + galería para un producto
 */
router.post('/product', authenticate, isAdmin, (req, res, next) => {
  uploadProductImages(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    
    const result = {
      coverImage: null,
      gallery: []
    };
    
    // Procesar imagen de portada
    if (req.files?.coverImage && req.files.coverImage[0]) {
      const file = req.files.coverImage[0];
      result.coverImage = {
        filename: file.filename,
        url: getImageUrl(file.filename, req),
        size: file.size,
        mimetype: file.mimetype
      };
    }
    
    // Procesar galería
    if (req.files?.galleryImages && req.files.galleryImages.length > 0) {
      result.gallery = req.files.galleryImages.map(file => ({
        filename: file.filename,
        url: getImageUrl(file.filename, req),
        size: file.size,
        mimetype: file.mimetype
      }));
    }
    
    if (!result.coverImage && result.gallery.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se subieron archivos'
      });
    }
    
    console.log('✅ Imágenes de producto subidas:', {
      coverImage: !!result.coverImage,
      galleryCount: result.gallery.length
    });
    
    res.json({
      success: true,
      message: 'Imágenes subidas exitosamente',
      data: result
    });
  });
});

/**
 * POST /api/upload/product/:id
 * Subir y actualizar imágenes de un producto existente
 */
router.post('/product/:id', authenticate, isAdmin, async (req, res, next) => {
  uploadProductImages(req, res, async (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    
    try {
      const productId = req.params.id;
      
      // Verificar que el producto existe
      const product = await db.getById('products', productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Producto no encontrado'
        });
      }
      
      const updates = {};
      
      // Actualizar imagen de portada si se subió una nueva
      if (req.files?.coverImage && req.files.coverImage[0]) {
        const file = req.files.coverImage[0];
        updates.image = getImageUrl(file.filename, req);
        
        // Eliminar imagen anterior si existe y no es URL externa
        if (product.image && !product.image.startsWith('http')) {
          const oldFilename = product.image.split('/').pop();
          deleteFile(oldFilename);
        }
      }
      
      // Actualizar galería si se subieron imágenes
      if (req.files?.galleryImages && req.files.galleryImages.length > 0) {
        const newGallery = req.files.galleryImages.map(file => 
          getImageUrl(file.filename, req)
        );
        
        // Si el producto ya tiene galería, agregar las nuevas imágenes
        if (product.gallery && Array.isArray(product.gallery)) {
          updates.gallery = [...product.gallery, ...newGallery];
        } else {
          updates.gallery = newGallery;
        }
      }
      
      // Actualizar producto
      const updatedProduct = await db.update('products', productId, updates);
      
      console.log('✅ Producto actualizado con nuevas imágenes:', productId);
      
      res.json({
        success: true,
        message: 'Imágenes actualizadas exitosamente',
        data: updatedProduct
      });
      
    } catch (error) {
      console.error('Error actualizando producto:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar producto con imágenes',
        details: error.message
      });
    }
  });
});

/**
 * DELETE /api/upload/:filename
 * Eliminar una imagen
 */
router.delete('/:filename', authenticate, isAdmin, async (req, res) => {
  try {
    const filename = req.params.filename;
    
    // Verificar que la imagen no esté siendo usada por ningún producto
    const products = await db.getAll('products');
    const isInUse = products.some(product => {
      // Verificar imagen de portada
      if (product.image && product.image.includes(filename)) {
        return true;
      }
      
      // Verificar galería
      if (product.gallery && Array.isArray(product.gallery)) {
        return product.gallery.some(img => img.includes(filename));
      }
      
      return false;
    });
    
    if (isInUse) {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar. La imagen está siendo usada por un producto'
      });
    }
    
    const deleted = deleteFile(filename);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Imagen no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    });
    
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar imagen',
      details: error.message
    });
  }
});

/**
 * DELETE /api/upload/product/:id/gallery/:index
 * Eliminar una imagen específica de la galería de un producto
 */
router.delete('/product/:id/gallery/:index', authenticate, isAdmin, async (req, res) => {
  try {
    const { id, index } = req.params;
    const imageIndex = parseInt(index);
    
    const product = await db.getById('products', id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    if (!product.gallery || !Array.isArray(product.gallery) || product.gallery.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El producto no tiene galería de imágenes'
      });
    }
    
    if (imageIndex < 0 || imageIndex >= product.gallery.length) {
      return res.status(400).json({
        success: false,
        error: 'Índice de imagen inválido'
      });
    }
    
    const imageUrl = product.gallery[imageIndex];
    const filename = imageUrl.split('/').pop();
    
    // Eliminar imagen del filesystem si no es URL externa
    if (!imageUrl.startsWith('http') || imageUrl.includes('localhost')) {
      deleteFile(filename);
    }
    
    // Eliminar de la galería
    const newGallery = [...product.gallery];
    newGallery.splice(imageIndex, 1);
    
    const updatedProduct = await db.update('products', id, { gallery: newGallery });
    
    console.log('✅ Imagen eliminada de galería:', filename);
    
    res.json({
      success: true,
      message: 'Imagen eliminada de la galería',
      data: updatedProduct
    });
    
  } catch (error) {
    console.error('Error eliminando imagen de galería:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar imagen',
      details: error.message
    });
  }
});

export default router;
