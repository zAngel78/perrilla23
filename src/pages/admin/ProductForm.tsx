import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { productsService } from '../../services/products.service';
import { Product } from '../../types';

export const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: '',
    featured: false,
    isDigitalProduct: false,
  });

  const [imagePreview, setImagePreview] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [digitalKeys, setDigitalKeys] = useState('');
  const [existingKeys, setExistingKeys] = useState<any[]>([]);

  useEffect(() => {
    if (isEdit && id) {
      loadProduct(id);
    }
  }, [id, isEdit]);

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true);
      const product = await productsService.getById(productId);
      setFormData({
        name: product.name,
        description: product.description,
        price: String(product.price),
        category: product.category,
        stock: String(product.stock || 0),
        image: product.image,
        featured: product.featured || false,
        isDigitalProduct: product.isDigitalProduct || false,
      });
      setImagePreview(product.image);
      setGallery(product.gallery || []);
      setExistingKeys(product.digitalKeys || []);
    } catch (error) {
      console.error('Error loading product:', error);
      alert('Error al cargar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const imageUrl = await productsService.uploadImage(file);
      setFormData({ ...formData, image: imageUrl });
      setImagePreview(imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const urls = await productsService.uploadImages(files);
      setGallery([...gallery, ...urls]);
    } catch (error) {
      console.error('Error uploading gallery images:', error);
      alert('Error al subir las imágenes de la galería');
    } finally {
      setUploading(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setSaving(true);

      const productData: any = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock) || 0,
        image: formData.image || 'https://placehold.co/800x600/gray/white?text=No+Image',
        gallery: gallery,
        featured: formData.featured,
        isDigitalProduct: formData.isDigitalProduct,
      };

      // Si es un producto digital y hay keys nuevas para agregar
      if (formData.isDigitalProduct && digitalKeys.trim()) {
        if (isEdit && id) {
          // En edición, agregar nuevas keys al pool existente
          productData.addKeys = digitalKeys;
        } else {
          // En creación, establecer las keys iniciales
          productData.digitalKeys = digitalKeys;
        }
      }

      if (isEdit && id) {
        await productsService.update(id, productData);
        alert('Producto actualizado correctamente');
        // Recargar para ver las keys actualizadas
        await loadProduct(id);
        setDigitalKeys(''); // Limpiar el textarea de nuevas keys
      } else {
        await productsService.create(productData);
        alert('Producto creado correctamente');
      }

      navigate('/admin/products');
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert(error?.error || 'Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-brand-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Volver a Productos
          </Link>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-[#121a2b] border border-white/10 rounded-xl p-6">
              <h2 className="text-white font-bold text-lg mb-4 uppercase tracking-tight">
                Información Básica
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm font-semibold mb-2">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-green/50 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-semibold mb-2">
                    Descripción
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-green/50 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-semibold mb-2">
                      Precio *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-green/50 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm font-semibold mb-2">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-green/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-semibold mb-2">
                    Categoría *
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="consoles, games, accessories, etc."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-green/50 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20 bg-white/5 text-brand-green focus:ring-brand-green"
                    />
                    <span className="text-white font-semibold">Producto Destacado</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDigitalProduct}
                      onChange={(e) => setFormData({ ...formData, isDigitalProduct: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20 bg-white/5 text-brand-green focus:ring-brand-green"
                    />
                    <span className="text-white font-semibold">Producto Digital (con Keys)</span>
                  </label>
                  <p className="text-gray-500 text-sm mt-1 ml-8">
                    Los productos digitales se envían automáticamente por correo
                  </p>
                </div>
              </div>
            </div>

            {/* Digital Keys Section */}
            {formData.isDigitalProduct && (
              <div className="bg-[#121a2b] border border-white/10 rounded-xl p-6">
                <h2 className="text-white font-bold text-lg mb-4 uppercase tracking-tight">
                  Gestión de Keys Digitales
                </h2>

                <div className="space-y-4">
                  {/* Existing Keys */}
                  {isEdit && existingKeys.length > 0 && (
                    <div>
                      <label className="block text-gray-400 text-sm font-semibold mb-2">
                        Keys Existentes ({existingKeys.filter(k => k.status === 'available').length} disponibles / {existingKeys.length} total)
                      </label>
                      <div className="bg-black/30 rounded-lg p-4 max-h-60 overflow-y-auto">
                        <div className="space-y-2">
                          {existingKeys.map((key) => (
                            <div
                              key={key.id}
                              className={`flex items-center justify-between p-3 rounded-lg ${
                                key.status === 'used'
                                  ? 'bg-gray-800/50 text-gray-500'
                                  : key.status === 'reserved'
                                  ? 'bg-yellow-900/20 text-yellow-400'
                                  : 'bg-green-900/20 text-green-400'
                              }`}
                            >
                              <code className="font-mono text-sm">{key.code}</code>
                              <span className="text-xs uppercase font-bold">
                                {key.status === 'used' ? '✓ Enviada' : key.status === 'reserved' ? 'Reservada' : 'Disponible'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Add New Keys */}
                  <div>
                    <label className="block text-gray-400 text-sm font-semibold mb-2">
                      {isEdit ? 'Agregar Nuevas Keys' : 'Keys del Producto'}
                    </label>
                    <textarea
                      rows={8}
                      value={digitalKeys}
                      onChange={(e) => setDigitalKeys(e.target.value)}
                      placeholder="Pega las keys aquí, una por línea:&#10;XXXX-XXXX-XXXX-XXXX&#10;YYYY-YYYY-YYYY-YYYY&#10;ZZZZ-ZZZZ-ZZZZ-ZZZZ"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-brand-green/50 transition-all resize-none"
                    />
                    <p className="text-gray-500 text-sm mt-2">
                      {digitalKeys.split('\n').filter(k => k.trim()).length} keys para agregar
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Gallery */}
            <div className="bg-[#121a2b] border border-white/10 rounded-xl p-6">
              <h2 className="text-white font-bold text-lg mb-4 uppercase tracking-tight">
                Galería de Imágenes
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {gallery.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>

                <label className="block">
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-brand-green/50 transition-colors cursor-pointer">
                    <ImageIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-white font-semibold mb-1">Agregar imágenes a la galería</p>
                    <p className="text-gray-400 text-sm">Hasta 10 imágenes (5MB cada una)</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleGalleryUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="space-y-6">
            <div className="bg-[#121a2b] border border-white/10 rounded-xl p-6 sticky top-6">
              <h2 className="text-white font-bold text-lg mb-4 uppercase tracking-tight">
                Imagen de Portada
              </h2>

              {imagePreview ? (
                <div className="relative group mb-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setFormData({ ...formData, image: '' });
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={20} className="text-white" />
                  </button>
                </div>
              ) : (
                <label className="block mb-4">
                  <div className="border-2 border-dashed border-white/20 rounded-lg aspect-square flex flex-col items-center justify-center hover:border-brand-green/50 transition-colors cursor-pointer">
                    {uploading ? (
                      <Loader2 className="w-12 h-12 text-brand-green animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-gray-500 mb-3" />
                        <p className="text-white font-semibold">Subir imagen</p>
                        <p className="text-gray-400 text-sm">PNG, JPG (máx. 5MB)</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}

              <button
                type="submit"
                disabled={saving || uploading}
                className="w-full bg-brand-green hover:bg-brand-green/90 text-black font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    {isEdit ? 'Actualizar Producto' : 'Crear Producto'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
