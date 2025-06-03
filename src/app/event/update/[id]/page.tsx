'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Event } from '@/shared/types/event';
import { getEventById, getEventForEditing } from '@/features/events/events.api';
import UpdateEventForm from '@/features/events/components/UpdateEventForm';

export default function UpdateEventPage() {
  const params = useParams();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        setError('ID del evento no válido');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Usar getEventForEditing en lugar de getEventById para obtener eventos sin restricción
        const eventData = await getEventForEditing(eventId);
        if (eventData && 'error' in eventData) {
          setError(eventData.error);
        } else if (!eventData) {
          // Handle null case specifically - this is when event is not found
          setEvent(null);
        } else {
          setEvent(eventData);
        }
        
      } catch (err: any) {
        console.error('Error fetching event:', err);
        setError(err.response?.data?.message || 'Error al cargar el evento');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center" data-testid="loading">
          <p className="text-blue-800">Cargando información del evento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Error
          </h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800">Evento no encontrado</p>
        </div>
      </div>
    );
  }

  return <UpdateEventForm event={event} />;
}