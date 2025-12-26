import express from 'express';
import { db } from '../utils/jsonDB.js';

const router = express.Router();

/**
 * GET /api/products
 * Obtener todos los productos (con filtros opcionales)
 */
router.get('/', async (req, res) => {
  try {
    const { category, featured, search, minPrice, maxPrice } = req.query;
    
    let products = await db.getAll('products');
    
    // Filtrar por categoría
    if (category) {
      products = products.filter(p => p.category === category);
    }
    
    // Filtrar por featured
    if (featured !== undefined) {
      const isFeatured = featured === 'true';
      products = products.filter(p => p.featured === isFeatured);
    }
    
    // Búsqueda por nombre o descripción
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtrar por rango de precio
    if (minPrice !== undefined) {
      products = products.filter(p => p.price >= parseFloat(minPrice));
    }
    if (maxPrice !== undefined) {
      products = products.filter(p => p.price <= parseFloat(maxPrice));
    }
    
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos',
      details: error.message
    });
  }
});

/**
 * GET /api/products/:id
 * Obtener un producto por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await db.getById('products', req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener producto',
      details: error.message
    });
  }
});

/**
 * POST /api/products
 * Crear un nuevo producto (requiere autenticación admin)
 */
import { authenticate, isAdmin } from '../middleware/auth.js';

router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description, price, category, stock, image, gallery, featured, isDigitalProduct, digitalKeys } = req.body;
    
    // Validaciones básicas
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: name, price, category'
      });
    }
    
    if (price < 0 || stock < 0) {
      return res.status(400).json({
        success: false,
        error: 'El precio y stock deben ser valores positivos'
      });
    }
    
    // Procesar keys digitales si es un producto digital
    let processedKeys = [];
    if (isDigitalProduct && digitalKeys) {
      // Si digitalKeys es un string, dividir por líneas
      const keysArray = typeof digitalKeys === 'string' 
        ? digitalKeys.split('\n').map(k => k.trim()).filter(k => k.length > 0)
        : digitalKeys;
      
      // Crear objetos de keys con estado
      processedKeys = keysArray.map((code, index) => ({
        id: `key-${Date.now()}-${index}`,
        code: code,
        status: 'available', // available, used, reserved
        usedAt: null,
        usedBy: null, // orderId
        createdAt: new Date().toISOString()
      }));
    }

    const newProduct = await db.create('products', {
      name,
      description: description || '',
      price: parseFloat(price),
      category,
      stock: parseInt(stock) || 0,
      image: image || 'https://placehold.co/800x600/gray/white?text=No+Image',
      gallery: gallery && Array.isArray(gallery) ? gallery : [],
      featured: featured === true || featured === 'true',
      isDigitalProduct: isDigitalProduct === true || isDigitalProduct === 'true',
      digitalKeys: processedKeys
    });
    
    console.log('✅ Producto creado:', newProduct.id);
    
    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: newProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear producto',
      details: error.message
    });
  }
});

/**
 * PUT /api/products/:id
 * Actualizar un producto (requiere autenticación admin)
 */
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description, price, category, stock, image, gallery, featured, isDigitalProduct, digitalKeys, addKeys } = req.body;
    
    // Validaciones
    if (price !== undefined && price < 0) {
      return res.status(400).json({
        success: false,
        error: 'El precio debe ser un valor positivo'
      });
    }
    
    if (stock !== undefined && stock < 0) {
      return res.status(400).json({
        success: false,
        error: 'El stock debe ser un valor positivo'
      });
    }
    
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = parseFloat(price);
    if (category !== undefined) updates.category = category;
    if (stock !== undefined) updates.stock = parseInt(stock);
    if (image !== undefined) updates.image = image;
    if (gallery !== undefined) updates.gallery = Array.isArray(gallery) ? gallery : [];
    if (featured !== undefined) updates.featured = featured === true || featured === 'true';
    if (isDigitalProduct !== undefined) updates.isDigitalProduct = isDigitalProduct === true || isDigitalProduct === 'true';
    
    // Manejar keys digitales
    if (digitalKeys !== undefined || addKeys !== undefined) {
      const currentProduct = await db.getById('products', req.params.id);
      let existingKeys = currentProduct?.digitalKeys || [];
      
      if (addKeys) {
        // Agregar nuevas keys al pool existente
        const keysArray = typeof addKeys === 'string' 
          ? addKeys.split('\n').map(k => k.trim()).filter(k => k.length > 0)
          : addKeys;
        
        const newKeys = keysArray.map((code, index) => ({
          id: `key-${Date.now()}-${index}`,
          code: code,
          status: 'available',
          usedAt: null,
          usedBy: null,
          createdAt: new Date().toISOString()
        }));
        
        updates.digitalKeys = [...existingKeys, ...newKeys];
      } else if (digitalKeys !== undefined) {
        // Reemplazar todas las keys (mantener las que ya están usadas)
        const usedKeys = existingKeys.filter(k => k.status === 'used');
        
        const keysArray = typeof digitalKeys === 'string' 
          ? digitalKeys.split('\n').map(k => k.trim()).filter(k => k.length > 0)
          : digitalKeys;
        
        const newKeys = keysArray.map((code, index) => ({
          id: `key-${Date.now()}-${index}`,
          code: code,
          status: 'available',
          usedAt: null,
          usedBy: null,
          createdAt: new Date().toISOString()
        }));
        
        updates.digitalKeys = [...usedKeys, ...newKeys];
      }
    }
    
    const updatedProduct = await db.update('products', req.params.id, updates);
    
    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    console.log('✅ Producto actualizado:', updatedProduct.id);
    
    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar producto',
      details: error.message
    });
  }
});

/**
 * DELETE /api/products/:id
 * Eliminar un producto (requiere autenticación admin)
 */
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const deleted = await db.delete('products', req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    console.log('✅ Producto eliminado:', req.params.id);
    
    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar producto',
      details: error.message
    });
  }
});

/**
 * PUT /api/products/featured/reorder
 * Reordenar productos destacados
 */
router.put('/featured/reorder', async (req, res) => {
  try {
    const { orders } = req.body; // Array de { id, featuredOrder }
    
    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere un array de órdenes'
      });
    }
    
    // Validar que todos los elementos tengan id y featuredOrder
    for (const order of orders) {
      if (!order.id || typeof order.featuredOrder !== 'number') {
        return res.status(400).json({
          success: false,
          error: 'Cada elemento debe tener id y featuredOrder válidos'
        });
      }
    }
    
    // Actualizar cada producto con su nuevo orden SECUENCIALMENTE para evitar corrupción
    for (const { id, featuredOrder } of orders) {
      await db.update('products', id, { featuredOrder });
    }
    
    console.log('✅ Orden de destacados actualizado');
    
    res.json({
      success: true,
      message: 'Orden actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error reordering featured products:', error);
    res.status(500).json({
      success: false,
      error: 'Error al reordenar productos',
      details: error.message
    });
  }
});

/**
 * GET /api/products/categories/list
 * Obtener lista de categorías únicas
 */
router.get('/categories/list', async (req, res) => {
  try {
    const products = await db.getAll('products');
    const categories = [...new Set(products.map(p => p.category))];
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener categorías',
      details: error.message
    });
  }
});

/**
 * GET /api/products/:id/keys
 * Obtener todas las keys de un producto (Admin)
 */
router.get('/:id/keys', authenticate, isAdmin, async (req, res) => {
  try {
    const product = await db.getById('products', req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    if (!product.isDigitalProduct) {
      return res.status(400).json({
        success: false,
        error: 'Este producto no es digital'
      });
    }
    
    const keys = product.digitalKeys || [];
    const stats = {
      total: keys.length,
      available: keys.filter(k => k.status === 'available').length,
      used: keys.filter(k => k.status === 'used').length,
      reserved: keys.filter(k => k.status === 'reserved').length
    };
    
    res.json({
      success: true,
      data: {
        keys: keys,
        stats: stats
      }
    });
  } catch (error) {
    console.error('Error fetching keys:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener keys',
      details: error.message
    });
  }
});

/**
 * POST /api/products/:id/keys/assign
 * Asignar una key disponible a una orden (uso interno)
 */
router.post('/:id/keys/assign', authenticate, async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'orderId es requerido'
      });
    }
    
    const product = await db.getById('products', req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    if (!product.isDigitalProduct || !product.digitalKeys) {
      return res.status(400).json({
        success: false,
        error: 'Este producto no tiene keys digitales'
      });
    }
    
    // Buscar la primera key disponible
    const availableKey = product.digitalKeys.find(k => k.status === 'available');
    
    if (!availableKey) {
      return res.status(404).json({
        success: false,
        error: 'No hay keys disponibles para este producto'
      });
    }
    
    // Marcar la key como usada
    const updatedKeys = product.digitalKeys.map(k => {
      if (k.id === availableKey.id) {
        return {
          ...k,
          status: 'used',
          usedAt: new Date().toISOString(),
          usedBy: orderId
        };
      }
      return k;
    });
    
    await db.update('products', req.params.id, {
      digitalKeys: updatedKeys
    });
    
    console.log('✅ Key asignada:', availableKey.id, 'a orden:', orderId);
    
    res.json({
      success: true,
      data: {
        code: availableKey.code,
        keyId: availableKey.id
      }
    });
  } catch (error) {
    console.error('Error assigning key:', error);
    res.status(500).json({
      success: false,
      error: 'Error al asignar key',
      details: error.message
    });
  }
});

/**
 * DELETE /api/products/:id/keys/:keyId
 * Eliminar una key específica (Admin)
 */
router.delete('/:id/keys/:keyId', authenticate, isAdmin, async (req, res) => {
  try {
    const product = await db.getById('products', req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    const keyToDelete = product.digitalKeys?.find(k => k.id === req.params.keyId);
    
    if (!keyToDelete) {
      return res.status(404).json({
        success: false,
        error: 'Key no encontrada'
      });
    }
    
    if (keyToDelete.status === 'used') {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar una key que ya fue usada'
      });
    }
    
    const updatedKeys = product.digitalKeys.filter(k => k.id !== req.params.keyId);
    
    await db.update('products', req.params.id, {
      digitalKeys: updatedKeys
    });
    
    console.log('✅ Key eliminada:', req.params.keyId);
    
    res.json({
      success: true,
      message: 'Key eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting key:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar key',
      details: error.message
    });
  }
});

export default router;
