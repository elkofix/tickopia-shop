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
},  []);

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

      console.log("DTO que se envía:", dto); // 👈🏼 Esto te muestra el JSON en consola


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

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Crear Presentación</h2>

      {success && (
        <div className="bg-green-100 text-green-700 border border-green-300 p-3 rounded">
          ✅ La presentación fue creada exitosamente.
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 p-3 rounded">
          ❌ {error}
        </div>
      )}
      <div>
        <label htmlFor="place" className="block font-medium text-sm mb-1">Lugar</label>
        <input
          name="place"
          value={formData.place}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Lugar"
          required
        />
      </div>

      {/* Campo: Capacidad */}
      <div>
        <label htmlFor="capacity" className="block font-medium text-sm mb-1">Capacidad</label>
        <input
          name="capacity"
          type="number"
          value={formData.capacity}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Capacidad"
          required
        />
      </div>

      {/* Campo: Fecha de apertura */}
      <div>
        <label htmlFor="openDate" className="block font-medium text-sm mb-1">Fecha de apertura</label>
        <input
          name="openDate"
          type="datetime-local"
          value={formData.openDate}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Campo: Fecha de inicio */}
      <div>
        <label htmlFor="startDate" className="block font-medium text-sm mb-1">Fecha de inicio</label>
        <input
          name="startDate"
          type="datetime-local"
          value={formData.startDate}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Campo: Precio */}
      <div>
        <label htmlFor="price" className="block font-medium text-sm mb-1">Precio</label>
        <input
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Precio"
          required
        />
      </div>

      {/* Campo: Latitud */}
      <div>
        <label htmlFor="latitude" className="block font-medium text-sm mb-1">Latitud</label>
        <input
          name="latitude"
          type="number"
          step="any"
          value={formData.latitude}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Latitud"
          required
        />
      </div>

      {/* Campo: Longitud */}
      <div>
        <label htmlFor="longitude" className="block font-medium text-sm mb-1">Longitud</label>
        <input
          name="longitude"
          type="number"
          step="any"
          value={formData.longitude}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Longitud"
          required
        />
      </div>

      {/* Campo: Descripción */}
      <div>
        <label htmlFor="description" className="block font-medium text-sm mb-1">Descripción</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Descripción"
          required
        />
      </div>

      {/* Campo: Fecha disponibilidad boletas */}
      <div>
        <label htmlFor="ticketAvailabilityDate" className="block font-medium text-sm mb-1">Fecha disponibilidad boletas</label>
        <input
          name="ticketAvailabilityDate"
          type="datetime-local"
          value={formData.ticketAvailabilityDate}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Campo: Fecha inicio venta */}
      <div>
        <label htmlFor="ticketSaleAvailabilityDate" className="block font-medium text-sm mb-1">Fecha inicio venta</label>
        <input
          name="ticketSaleAvailabilityDate"
          type="datetime-local"
          value={formData.ticketSaleAvailabilityDate}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

       {/* Campo: Ciudad */}
        <div>
        <label htmlFor="city" className="block font-medium text-sm mb-1">Ciudad</label>
        <select
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
        >
            <option value="">Selecciona una ciudad</option>
            {cities.map((city) => (
            <option key={city.id} value={city.name}>
                {city.name}
            </option>
            ))}
        </select>
        </div>

      {/* Campo: Evento asociado */}
      <div>
        <label htmlFor="eventId" className="block font-medium text-sm mb-1">Evento asociado</label>
        <select
          name="eventId"
          value={formData.eventId}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Selecciona un evento</option>
          {events.map((event: AppEvent) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>
      </div>

      {/* Botón enviar */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition"
      >
        Crear Presentación
      </button>
    </form>
  );
}
