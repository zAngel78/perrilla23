import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asegurar que la carpeta de uploads existe
const uploadsDir = path.join(__dirname, '../uploads/products');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Configuración de almacenamiento para multer
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único: timestamp-random-extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `product-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

/**
 * Filtro para validar tipos de archivo
 */
const fileFilter = (req, file, cb) => {
  // Tipos permitidos
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP)'), false);
  }
};

/**
 * Configuración de multer
 */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo por archivo
  }
});

/**
 * Middleware para subir una sola imagen (portada)
 */
export const uploadSingle = upload.single('image');

/**
 * Middleware para subir múltiples imágenes (galería)
 * Máximo 10 imágenes
 */
export const uploadMultiple = upload.array('images', 10);

/**
 * Middleware para subir portada + galería
 * Campos: 'coverImage' (1 archivo) y 'galleryImages' (hasta 10 archivos)
 */
export const uploadProductImages = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'galleryImages', maxCount: 10 }
]);

/**
 * Helper para eliminar un archivo
 */
export const deleteFile = (filename) => {
  try {
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Archivo eliminado: ${filename}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error eliminando archivo: ${filename}`, error);
    return false;
  }
};

/**
 * Helper para obtener URL pública de una imagen
 */
export const getImageUrl = (filename, req) => {
  if (!filename) return null;
  
  // Si ya es una URL completa, retornarla tal cual
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  // Construir URL basada en el request
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/uploads/products/${filename}`;
};

/**
 * Middleware para manejar errores de multer
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'El archivo es demasiado grande. Máximo 5MB'
      });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Demasiados archivos. Máximo 10 imágenes'
      });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Campo de archivo inesperado'
      });
    }
    
    return res.status(400).json({
      success: false,
      error: `Error al subir archivo: ${err.message}`
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  
  next();
};

export default upload;
