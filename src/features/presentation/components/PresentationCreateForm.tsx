'use client';

import { useState, useEffect } from 'react';
import { getCities } from '@/features/colombia/colombia.api';
import { createPresentation } from '@/features/presentation/presentations.api';
import { getEvents } from '@/features/events/events.api';
import { useRouter } from 'next/navigation';
import type { Event as AppEvent } from '@/shared/types/event';

export default function PresentationCreateForm() {
  const router = useRouter();
  const [cities, setCities] = useState<{ id: number, name: string }[]>([]);
  const [formData, setFormData] = useState({
    place: '',
    capacity: '',
    openDate: '',
    startDate: '',
    price: '',
    latitude: '',
    longitude: '',
    description: '',
    ticketAvailabilityDate: '',
    ticketSaleAvailabilityDate: '',
    city: '',
    eventId: '',
  });

  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  

  useEffect(() => {
    getEvents({ limit: 100, offset: 0 })
      .then((result) => {
        if (Array.isArray(result)) {
          setEvents(result);
        } else if ('error' in result) {
          setError(result.error);
        } else {
          setError('Error cargando eventos');
        }
      })
      .catch((err) => {
        console.error('Error fetching events', err);
        setError('Error cargando eventos');
      });
  }, []);

  // Ciudades
  useEffect(() => {
    getCities()
      .then(setCities)
      .catch((err) => {
        console.error('Error al cargar ciudades', err);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const dto = {
        ...formData,
        capacity: Number(formData.capacity),
        price: Number(formData.price),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      };

      console.log("DTO que se envía:", dto);

      await createPresentation(dto);
      setSuccess(true);
      setFormData({
        place: '',
        capacity: '',
        openDate: '',
        startDate: '',
        price: '',
        latitude: '',
        longitude: '',
        description: '',
        ticketAvailabilityDate: '',
        ticketSaleAvailabilityDate: '',
        city: '',
        eventId: '',
      });
    } catch (err: any) {
      console.error(err);
      const message = err.response?.data?.message || 'Error al crear la presentación';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <h2 className="text-lg font-semibold text-green-800 mb-2">
          ¡Presentación creada exitosamente!
        </h2>
        <p className="text-green-600">
          La presentación ha sido registrada correctamente.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Crear Nueva Presentación
        </h1>
        <p className="text-gray-600">
          Completa los detalles de la presentación
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" role="form">
        {/* Evento asociado */}
        <div>
          <label htmlFor="eventId" className="block text-sm font-medium text-gray-700 mb-2">
            Evento asociado *
          </label>
          <select
            name="eventId"
            value={formData.eventId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Selecciona un evento</option>
            {events.map((event: AppEvent) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

        {/* Lugar */}
        <div>
          <label htmlFor="place" className="block text-sm font-medium text-gray-700 mb-2">
            Lugar *
          </label>
          <input
            name="place"
            value={formData.place}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ingresa el lugar de la presentación"
          />
        </div>

        {/* Ciudad */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
            Ciudad *
          </label>
          <select
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Selecciona una ciudad</option>
            {cities.map((city) => (
              <option key={city.id} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        {/* Capacidad y Precio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
              Capacidad *
            </label>
            <input
              name="capacity"
              type="number"
              value={formData.capacity}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Número de asistentes"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Precio *
            </label>
            <input
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Precio en pesos"
            />
          </div>
        </div>

        {/* Coordenadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
              Latitud *
            </label>
            <input
              name="latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: 3.4516"
            />
          </div>

          <div>
            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
              Longitud *
            </label>
            <input
              name="longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: -76.5320"
            />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            placeholder="Describe los detalles de la presentación..."
          />
        </div>

        {/* Fechas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Fechas importantes</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="openDate" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de apertura *
              </label>
              <input
                name="openDate"
                type="datetime-local"
                value={formData.openDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de inicio *
              </label>
              <input
                name="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="ticketAvailabilityDate" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha disponibilidad boletas *
              </label>
              <input
                name="ticketAvailabilityDate"
                type="datetime-local"
                value={formData.ticketAvailabilityDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="ticketSaleAvailabilityDate" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha inicio venta *
              </label>
              <input
                name="ticketSaleAvailabilityDate"
                type="datetime-local"
                value={formData.ticketSaleAvailabilityDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col space-y-3 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creando presentación...' : 'Crear Presentación'}
          </button>
          
          <button
            type="button"
            onClick={() => router.push('/')}
            disabled={loading}
            className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </>
  );
}