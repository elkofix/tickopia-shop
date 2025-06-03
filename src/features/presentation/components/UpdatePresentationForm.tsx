'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getPresentationById, updatePresentation } from '@/features/presentation/presentations.api'
import { Presentation } from '@/shared/types/presentation'
import { Event } from '@/shared/types/event'
import { UpdatePresentationDto } from '@/shared/types/presentation'
import { getCities } from '@/features/colombia/colombia.api'

interface City {
  id: number
  name: string
}

export default function EditPresentationPage() {
  const [presentation, setPresentation] = useState<Presentation | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState<Partial<UpdatePresentationDto>>({})
  const [loading, setLoading] = useState(true)
  const [cities, setCities] = useState<City[]>([])
  const [citiesLoading, setCitiesLoading] = useState(false)
  const [citiesError, setCitiesError] = useState<string | null>(null)

  const { id } = useParams()
  const router = useRouter()

  // Cargar ciudades al montar el componente
  useEffect(() => {
    const fetchCities = async () => {
      setCitiesLoading(true)
      setCitiesError(null)
      try {
        const citiesData = await getCities()
        setCities(citiesData)
      } catch (error) {
        console.error('Error al cargar ciudades:', error)
        setCitiesError('Error al cargar las ciudades')
      } finally {
        setCitiesLoading(false)
      }
    }

    fetchCities()
  }, [])

  // Cargar presentación
  useEffect(() => {
    if (!id || typeof id !== 'string') return

    const fetchPresentation = async () => {
      try {
        const data = await getPresentationById(id)
        setPresentation(data)
        setFormData({
          city: data.city,
          place: data.place,
          capacity: data.capacity,
          price: data.price,
          startDate: data.startDate,
          openDate: data.openDate,
          ticketAvailabilityDate: data.ticketAvailabilityDate,
          ticketSaleAvailabilityDate: data.ticketSaleAvailabilityDate,
          latitude: data.latitude,
          longitude: data.longitude,
          description: data.description,
          eventId: data.event?.id || '',
        })
      } catch (error) {
        console.error('Error al obtener la presentación:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPresentation()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || typeof id !== 'string') return

    try {
      console.log('Datos enviados al update:', formData)
      await updatePresentation(id, formData as UpdatePresentationDto)
      alert('Presentación actualizada correctamente')
      router.push('/presentation/my-presentations')
    } catch (error) {
      console.error('Error al actualizar:', error)
      alert('Error al actualizar la presentación')
    }
  }

  if (loading) return <p className="text-center mt-10">Cargando...</p>
  if (!presentation) return <p className="text-center mt-10">No se encontró la presentación.</p>

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Editar Presentación</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dropdown de ciudades */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            Ciudad *
          </label>
          <select
            id="city"
            name="city"
            value={formData.city || ''}
            onChange={handleChange}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={citiesLoading}
          >
            <option value="">
              {citiesLoading ? 'Cargando ciudades...' : 'Selecciona una ciudad'}
            </option>
            {cities.map((city) => (
              <option key={city.id} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
          {citiesError && (
            <p className="text-red-500 text-sm mt-1">{citiesError}</p>
          )}
        </div>

        <div>
          <label htmlFor="place" className="block text-sm font-medium text-gray-700 mb-1">
            Lugar *
          </label>
          <input
            type="text"
            id="place"
            name="place"
            value={formData.place || ''}
            onChange={handleChange}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nombre del lugar o venue"
            required
          />
        </div>

        <div>
          <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
            Capacidad *
          </label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={formData.capacity || ''}
            onChange={handleChange}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Número de personas"
            min="1"
            required
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Precio *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price || ''}
            onChange={handleChange}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Precio en pesos colombianos"
            min="0"
            step="1000"
            required
          />
        </div>

        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de inicio *
          </label>
          <input
            type="datetime-local"
            id="startDate"
            name="startDate"
            value={formData.startDate?.slice(0, 16) || ''}
            onChange={handleChange}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="openDate" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de apertura
          </label>
          <input
            type="datetime-local"
            id="openDate"
            name="openDate"
            value={formData.openDate?.slice(0, 16) || ''}
            onChange={handleChange}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="ticketAvailabilityDate" className="block text-sm font-medium text-gray-700 mb-1">
            Disponibilidad de boletas
          </label>
          <input
            type="datetime-local"
            id="ticketAvailabilityDate"
            name="ticketAvailabilityDate"
            value={formData.ticketAvailabilityDate?.slice(0, 16) || ''}
            onChange={handleChange}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="ticketSaleAvailabilityDate" className="block text-sm font-medium text-gray-700 mb-1">
            Inicio de ventas
          </label>
          <input
            type="datetime-local"
            id="ticketSaleAvailabilityDate"
            name="ticketSaleAvailabilityDate"
            value={formData.ticketSaleAvailabilityDate?.slice(0, 16) || ''}
            onChange={handleChange}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
              Latitud
            </label>
            <input
              type="number"
              id="latitude"
              name="latitude"
              step="any"
              value={formData.latitude || ''}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: 4.60971"
            />
          </div>
          <div>
            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
              Longitud
            </label>
            <input
              type="number"
              id="longitude"
              name="longitude"
              step="any"
              value={formData.longitude || ''}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: -74.08175"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Descripción del evento"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Evento asociado
          </label>
          <p className="mt-1 p-2 border rounded bg-gray-100 text-gray-700">
            {presentation?.event?.name || 'Sin evento asociado'}
          </p>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200 font-medium"
          >
            Guardar Cambios
          </button>
          <button
            type="button"
            onClick={() => router.push('/presentation/my-presentations')}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-200 font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}