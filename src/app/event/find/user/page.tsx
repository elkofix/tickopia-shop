'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import EventList from '@/features/events/components/EventList';
import { getEventsByUserId } from '@/features/events/events.api';
import { Event } from '@/shared/types/event';

export default function MyEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const fetchUserEvents = async () => {
      if (isLoading) return; // Esperar a que termine de cargar auth
      
      if (!user) {
        setError('No autorizado');
        setLoading(false);
        return;
      }

      try {
        const result = await getEventsByUserId();
        
        if ('error' in result) {
          setError(result.error);
        } else {
          setEvents(result);
        }
      } catch (err) {
        console.error('Error fetching user events:', err);
        setError('Error al cargar los eventos');
      } finally {
        setLoading(false);
      }
    };

    fetchUserEvents();
  }, [user, isLoading]);

  if (isLoading || loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div data-testid="loading" className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} data-testid="loading-placeholder" className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Acceso Restringido</h2>
          <p className="text-yellow-600">Debes iniciar sesión para ver tus eventos</p>
        </div>
      </div>
    );
  }

  return (
    <EventList
      initialEvents={events}
      showControls={true}
    />
  );
}