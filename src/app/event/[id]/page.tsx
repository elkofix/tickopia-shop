"use client"
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getEventById } from '@/features/events/events.api';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Event } from '@/shared/types/event';

export default function EventDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Validación del ID antes de hacer la llamada al API
    if (!id) {
      console.error('Event ID is undefined');
      notFound();
      return;
    }

    const fetchEvent = async () => {
      try {
        const result = await getEventById(id);
        
        console.log('🔍 Resultado completo del API:', result);
        console.log('🔍 Tipo de resultado:', typeof result);
        console.log('🔍 ¿Es array?', Array.isArray(result));
        
        if ('error' in result) {
          setError(result.error);
        } else {
          console.log('🎪 Evento recibido:', result);
          console.log('🎭 Presentaciones:', result.presentations);
          console.log('🎭 Tipo de presentations:', typeof result.presentations);
          console.log('🎭 ¿presentations es array?', Array.isArray(result.presentations));
          console.log('🎭 Longitud de presentations:', result.presentations?.length);
          
          setEvent(result);
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Error al cargar el evento');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

    // In page.tsx, within the loading state block:
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
              data-testid="spinner"
            />
            <p className="text-gray-600">Cargando evento...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h2 className="text-lg font-semibold text-red-800 mb-2">
                Error al cargar evento
              </h2>
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-6">
      {/* Título */}
      <h1 className="text-4xl font-bold mb-6">{event.name}</h1>
      
      {/* Banner */}
      <div className="mb-6">
        <Image
          src={event.bannerPhotoUrl || '/placeholder-banner.jpg'}
          alt={event.name}
          width={800}
          height={400}
          className="w-full h-64 object-cover rounded-lg"
        />
      </div>
      
      {/* Estado */}
      <div className="mb-4">
        <span className="text-lg font-semibold">Estado: </span>
        <span className={`px-3 py-1 rounded-full text-sm ${
          event.isPublic 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {event.isPublic ? 'Público' : 'Privado'}
        </span>
      </div>
      
      {/* Organizador */}
      <div className="mb-6">
        <span className="text-lg font-semibold">Organizado por: </span>
        <span>{event.user?.name} {event.user?.lastname}</span>
      </div>
      
      {/* Lista de presentaciones */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Presentaciones Disponibles</h2>
      
        
        {Array.isArray(event.presentations) && event.presentations.length > 0 ? (
          <div className="space-y-4">
            {event.presentations.map((presentation: any, index: number) => (
              <div 
                key={presentation.id || `presentation-${index}`} 
                className="border rounded-lg p-4 mb-4 shadow-sm"
              >
                <h3 className="text-xl font-semibold mb-2">{presentation.place}</h3>
                
                <div className="space-y-2 mb-4">
                  <p><strong>Ciudad:</strong> {presentation.city}</p>
                  <p><strong>Fecha:</strong> {new Date(presentation.startDate).toLocaleString()}</p>
                  <p><strong>Precio:</strong> ${presentation.price}</p>
                </div>
                
                <Link
                  href={`/event/${id}/checkout?presentationId=${presentation.id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Comprar Boletas
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <p className="text-gray-500">No hay presentaciones asociadas aún.</p>
            <p className="text-sm text-gray-400 mt-2">
              {event.presentations ? 
                `Presentaciones encontradas pero no son un array válido (${typeof event.presentations})` : 
                'No se encontraron presentaciones en el evento'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}