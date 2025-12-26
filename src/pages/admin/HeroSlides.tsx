import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, GripVertical, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import { heroSlidesService, HeroSlide } from '../../services/hero-slides.service';
import { apiService } from '../../services/api.service';

export const HeroSlides = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    image: '',
    showText: true,
    title: '',
    subtitle: '',
    buttonText: '',
    buttonLink: '',
    active: true,
  });

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      setLoading(true);
      const data = await heroSlidesService.getAll();
      setSlides(data);
    } catch (error) {
      console.error('Error loading slides:', error);
      alert('Error al cargar slides');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (slide?: HeroSlide) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData({
        image: slide.image,
        showText: slide.showText,
        title: slide.title,
        subtitle: slide.subtitle,
        buttonText: slide.buttonText,
        buttonLink: slide.buttonLink,
        active: slide.active,
      });
    } else {
      setEditingSlide(null);
      setFormData({
        image: '',
        showText: true,
        title: '',
        subtitle: '',
        buttonText: '',
        buttonLink: '',
        active: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSlide(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
      // Crear FormData para el upload
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);
      
      // Subir imagen usando el endpoint /single
      const response = await apiService.upload<{ success: boolean; data: { url: string } }>(
        '/api/upload/single',
        uploadFormData
      );
      
      if (response.success && response.data?.url) {
        setFormData(prev => ({ ...prev, image: response.data.url }));
      } else {
        throw new Error('No se recibió URL de imagen');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image) {
      alert('La imagen es requerida');
      return;
    }

    try {
      if (editingSlide) {
        await heroSlidesService.update(editingSlide.id!, formData);
        alert('Slide actualizado correctamente');
      } else {
        await heroSlidesService.create(formData);
        alert('Slide creado correctamente');
      }
      handleCloseModal();
      loadSlides();
    } catch (error) {
      console.error('Error saving slide:', error);
      alert('Error al guardar el slide');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este slide?')) return;

    try {
      await heroSlidesService.delete(id);
      alert('Slide eliminado correctamente');
      loadSlides();
    } catch (error) {
      console.error('Error deleting slide:', error);
      alert('Error al eliminar el slide');
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      await heroSlidesService.update(slide.id!, { active: !slide.active });
      loadSlides();
    } catch (error) {
      console.error('Error toggling slide:', error);
      alert('Error al actualizar el slide');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando slides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <ImageIcon className="text-brand-green" />
            Hero Slides
          </h1>
          <p className="text-gray-400 mt-2">
            Gestiona los banners del hero principal de la página de inicio
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-brand-green hover:bg-brand-green/80 text-black font-bold rounded-lg transition-all"
        >
          <Plus size={20} />
          Nuevo Slide
        </button>
      </div>

      {/* Slides List */}
      <div className="grid grid-cols-1 gap-4">
        {slides.length === 0 ? (
          <div className="bg-[#121a2b] border border-white/10 rounded-xl p-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-semibold mb-2">No hay slides configurados</p>
            <p className="text-gray-500 text-sm mb-4">Crea tu primer slide para el hero</p>
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-2 bg-brand-green hover:bg-brand-green/80 text-black font-bold rounded-lg transition-all"
            >
              Crear Slide
            </button>
          </div>
        ) : (
          slides.map((slide, index) => (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#121a2b] border border-white/10 rounded-xl overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                {/* Preview Image */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-black/50">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  {!slide.active && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">INACTIVO</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-white text-xs font-bold">
                    #{slide.order}
                  </div>
                </div>

                {/* Content Info */}
                <div className="md:col-span-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        {slide.showText ? (
                          <>
                            <h3 className="text-white font-bold text-lg">{slide.title || 'Sin título'}</h3>
                            <p className="text-gray-400 text-sm">{slide.subtitle || 'Sin subtítulo'}</p>
                            {slide.buttonText && (
                              <span className="inline-block mt-2 px-3 py-1 bg-brand-green/20 text-brand-green text-xs font-bold rounded">
                                Botón: {slide.buttonText}
                              </span>
                            )}
                          </>
                        ) : (
                          <p className="text-gray-500 italic">Solo imagen (sin texto)</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => handleToggleActive(slide)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                        slide.active
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}
                    >
                      {slide.active ? <Eye size={16} /> : <EyeOff size={16} />}
                      {slide.active ? 'Activo' : 'Inactivo'}
                    </button>
                    
                    <button
                      onClick={() => handleOpenModal(slide)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg font-semibold text-sm hover:bg-blue-500/30 transition-all"
                    >
                      <Edit2 size={16} />
                      Editar
                    </button>
                    
                    <button
                      onClick={() => handleDelete(slide.id!)}
                      className="flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg font-semibold text-sm hover:bg-red-500/30 transition-all"
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0f1e] border border-white/20 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-white/10">
              <h2 className="text-2xl font-black text-white uppercase">
                {editingSlide ? 'Editar Slide' : 'Nuevo Slide'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-gray-400 text-sm font-semibold mb-2">
                  Imagen del Banner *
                </label>
                {formData.image ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-black/50 mb-2">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="block w-full aspect-video border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-brand-green/50 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      {uploading ? (
                        <>
                          <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin mb-2"></div>
                          <p>Subiendo imagen...</p>
                        </>
                      ) : (
                        <>
                          <ImageIcon size={48} className="mb-2" />
                          <p className="font-semibold">Click para subir imagen</p>
                          <p className="text-sm">Recomendado: 1920x600px</p>
                        </>
                      )}
                    </div>
                  </label>
                )}
              </div>

              {/* Show Text Toggle */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showText}
                    onChange={(e) => setFormData({ ...formData, showText: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-brand-green focus:ring-brand-green"
                  />
                  <span className="text-white font-semibold">Mostrar Texto sobre la Imagen</span>
                </label>
              </div>

              {/* Text Fields (conditional) */}
              {formData.showText && (
                <>
                  <div>
                    <label className="block text-gray-400 text-sm font-semibold mb-2">
                      Título
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-green/50 transition-all"
                      placeholder="Ej: Bienvenido a Tio Calcifer"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm font-semibold mb-2">
                      Subtítulo
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-green/50 transition-all"
                      placeholder="Ej: La mejor tienda gaming"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm font-semibold mb-2">
                        Texto del Botón
                      </label>
                      <input
                        type="text"
                        value={formData.buttonText}
                        onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-green/50 transition-all"
                        placeholder="Ej: Explorar Tienda"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-semibold mb-2">
                        Link del Botón
                      </label>
                      <input
                        type="text"
                        value={formData.buttonLink}
                        onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-green/50 transition-all"
                        placeholder="Ej: /shop"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Active Toggle */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-brand-green focus:ring-brand-green"
                  />
                  <span className="text-white font-semibold">Slide Activo</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={!formData.image || uploading}
                  className="flex-1 py-3 bg-brand-green hover:bg-brand-green/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold rounded-lg transition-all"
                >
                  {editingSlide ? 'Actualizar Slide' : 'Crear Slide'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
