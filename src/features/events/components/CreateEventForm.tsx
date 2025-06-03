'use client';

import { FormEvent, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createEvent } from '../events.api';
import { uploadToCloudinary } from '@/shared/utils/uploadToCloudinary';
import axiosClient from '@/shared/lib/axiosClient';

export default function CreateEventForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    isPublic: true,
    bannerPhotoUrl: '',
  });

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axiosClient.get('/auth/me');
        const user = res.data;
        
        if (!user || !user.roles.includes('event-manager')) {
          router.push('/unauthorized');
          return;
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        router.push('/login'); // o donde manejes el login
        return;
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('Archivo seleccionado:', file.type); // Depuración

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      console.log('Estableciendo error por tipo de archivo inválido'); // Depuración
      setError('Solo se permiten archivos de imagen (JPEG, PNG, WebP, GIF)');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadImage = async () => {
    if (!selectedFile) return;

    setIsUploadingImage(true);
    setError(null);

    try {
      const imageUrl = await uploadToCloudinary(selectedFile);
      setFormData(prev => ({
        ...prev,
        bannerPhotoUrl: imageUrl
      }));
      
      // Limpiar selección
      setSelectedFile(null);
      setPreviewUrl(null);
      
      // Limpiar input file
      const fileInput = document.getElementById('bannerFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Error al subir la imagen');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCancelImageSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    const fileInput = document.getElementById('bannerFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validar que se haya subido una imagen
      if (!formData.bannerPhotoUrl) {
        setError('Debes subir una imagen para el banner del evento');
        setIsLoading(false);
        return;
      }

      // Validar nombre
      if (!formData.name.trim()) {
        console.log('Estableciendo error: El nombre del evento es obligatorio'); // Depuración
        setError('El nombre del evento es obligatorio');
        setIsLoading(false);
        return;
      }
      // ...
    } catch (err: any) {
      console.error('Error creating event:', err);
      setError('Error inesperado al crear el evento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Mostrar loading mientras se verifica la autenticación
  if (isCheckingAuth) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"
          role="status"
        ></div>
        <p className="mt-2 text-gray-600">Verificando autenticación...</p>
      </div>
    </div>
  );
}

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <h2 className="text-lg font-semibold text-green-800 mb-2">
            ¡Evento creado exitosamente!
          </h2>
          <p className="text-green-600">
            Redirigiendo a la página principal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Crear Nuevo Evento
        </h1>
        <p className="text-gray-600">
          Completa los detalles de tu evento
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" role="form">
        {/* Nombre del evento */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del evento *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ingresa el nombre del evento"
          />
        </div>

        {/* Banner del evento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Banner del evento *
          </label>
          
          {/* URL actual (si ya se subió) */}
          {formData.bannerPhotoUrl && (
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">Imagen subida:</label>
              <div className="w-full px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600 break-all">
                ✓ Imagen lista para usar
              </div>
            </div>
          )}

          {/* Input para nueva imagen */}
          <div className="space-y-3">
            <div>
              <input
                type="file"
                id="bannerFile"
                data-testid="banner-file-input"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formatos permitidos: JPEG, PNG, WebP, GIF. Máximo 5MB.
              </p>
            </div>

            {/* Preview y botones de imagen seleccionada */}
            {selectedFile && previewUrl && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-2">Imagen seleccionada:</p>
                <div className="relative w-full h-40 border rounded-lg overflow-hidden mb-3">
                  <img
                    src={previewUrl}
                    alt="Preview de nueva imagen"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleUploadImage}
                    disabled={isUploadingImage}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                  >
                    {isUploadingImage ? 'Subiendo...' : 'Usar esta imagen'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelImageSelection}
                    data-testid="cancel-image-button"
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preview de la imagen ya subida */}
          {formData.bannerPhotoUrl && !previewUrl && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">Imagen del evento:</p>
              <div className="relative w-full h-40 border rounded-lg overflow-hidden">
                <img
                  src={formData.bannerPhotoUrl}
                  alt="Banner del evento"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/600x300.png?text=Error+de+Imagen';
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Visibilidad */}
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Evento público
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-7">
            Los eventos públicos son visibles para todos los usuarios
          </p>
        </div>

        {/* Botones */}
        <div className="flex flex-col space-y-3 pt-6">
          {/* Botón de crear */}
          <button
            type="submit"
            disabled={isLoading || isUploadingImage}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Creando evento...' : 'Crear Evento'}
          </button>
          
          {/* Botón de cancelar */}
          <button
            type="button"
            onClick={() => router.push('/')}
            disabled={isLoading || isUploadingImage}
            className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}