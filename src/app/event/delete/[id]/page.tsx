'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getEventById } from '@/features/events/events.api';
import DeleteEventForm from '@/features/events/components/DeleteEventForm';
import { Event } from '@/shared/types/event';

export default function DeleteEventPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const eventId = params.id as string;

  useEffect(() => {
    const fetchEvent = async () => {
      if (authLoading) return;
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      if (!eventId) {
        setError('ID de evento no válido');
        setLoading(false);
        return;
      }

      try {
        const result = await getEventById(eventId);
        
        if ('error' in result) {
          setError(result.error);
          setLoading(false);
          return;
        }

        // Verificar que el usuario sea el propietario del evento
        if (result.user?.id !== user.id) {
          setError('Solo puedes eliminar tus propios eventos');
          setLoading(false);
          return;
        }

        setEvent(result);
      } catch (err) {
        console.error('Error loading event:', err);
        setError('Error al cargar el evento');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [user, authLoading, eventId, router]);

  if (authLoading || loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse" data-testid="loading">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="space-y-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/event/find/user')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver a mis eventos
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">Evento no encontrado</h2>
          <p className="text-yellow-600 mb-4">El evento que buscas no existe o no tienes permisos para eliminarlo</p>
          <button
            onClick={() => router.push('/event/find/user')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver a mis eventos
          </button>
        </div>
      </div>
    );
  }

  return <DeleteEventForm event={event} />;
}