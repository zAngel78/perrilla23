# 📁 Carpeta de Uploads

Esta carpeta almacena las imágenes subidas por los administradores.

## Estructura

```
uploads/
├── products/       # Imágenes de productos
│   ├── product-123456-789.jpg
│   └── product-123456-790.png
└── README.md
```

## Notas

- Las imágenes se nombran automáticamente: `product-{timestamp}-{random}.{ext}`
- Tamaño máximo: **5MB** por imagen
- Formatos permitidos: **JPEG, PNG, GIF, WebP**
- Máximo **10 imágenes** por galería

## Acceso

Las imágenes son accesibles vía:
```
http://localhost:3001/uploads/products/nombre-archivo.jpg
```
