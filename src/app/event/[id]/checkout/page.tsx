"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { buyTickets } from "@/features/tickets/tickets.api";
import { getEventById } from "@/features/events/events.api";
import Image from "next/image";
import { Event } from "@/shared/types/event";

export default function CheckoutPage() {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const searchParams = useSearchParams();
  const presentationId = searchParams.get("presentationId");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        console.log('🔍 Cargando evento con ID:', id);
        const data = await getEventById(id);
        if ("error" in data) {
          console.error("❌ Error cargando evento:", data.error);
          setError(data.error);
        } else {
          console.log('✅ Evento cargado exitosamente:', data.name);
          setEvent(data);
        }
      } catch (err) {
        console.error("❌ Error cargando evento:", err);
      }
    };

    if (id) fetchEvent();
  }, [id]);

  const handleCheckout = async () => {
    if (!id) {
      console.error('❌ No hay ID de evento disponible');
      alert('Error: ID de evento no disponible');
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      console.log('🎫 Iniciando compra con datos:', {
        quantity,
        presentationId:  presentationId!,
      });

      console.log("🧾 presentationId en checkout:", presentationId);

      const session = await buyTickets({
        quantity,
        idPresentation: presentationId!, // Tu backend espera el ID del evento aquí
      });

      console.log('✅ Sesión de pago creada:', session);
      window.location.href = session.url;
    } catch (error: any) {
      console.error("❌ Error iniciando checkout:", error);
      
      // Mensaje de error más específico
      let errorMessage = 'Error al procesar la compra.';
      if (error.response?.status === 404) {
        errorMessage = 'No se encontró el endpoint de compra. Verifica la configuración del API.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error interno del servidor. Intenta de nuevo más tarde.';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="text-center">
          <p>Cargando evento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Compra de Boletas</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative w-full md:w-1/2 h-48 md:h-64 rounded overflow-hidden">
            <Image
              src={event.bannerPhotoUrl || '/placeholder-banner.jpg'}
              alt={event.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-2xl font-semibold text-brand mb-2">{event.name}</h2>
            <p className="text-sm text-gray-700">
              Organizado por:{" "}
              <span className="font-medium">
                {event.user?.name} {event.user?.lastname}
              </span>
            </p>
            <p className="text-sm mt-1">
              Estado:{" "}
              <span className={`font-semibold ${event.isPublic ? "text-green-600" : "text-gray-600"}`}>
                {event.isPublic ? "Público" : "Privado"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Mostrar presentaciones disponibles si existen */}
      {event.presentations && event.presentations.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Presentaciones Disponibles</h3>
          <div className="space-y-3">
            {event.presentations.map((presentation: any, index: number) => (
              <div key={presentation.id || index} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div><strong>Lugar:</strong> {presentation.place}</div>
                  <div><strong>Ciudad:</strong> {presentation.city}</div>
                  <div><strong>Fecha:</strong> {new Date(presentation.startDate).toLocaleDateString()}</div>
                </div>
                <div className="mt-1 text-lg font-semibold text-green-600">
                  Precio: ${presentation.price}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded shadow-md">
        <div className="mb-4">
          <label className="block mb-2 font-medium">Cantidad de boletas</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min={1}
            max={10}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading || !id}
          className="bg-brand text-white px-6 py-2 rounded hover:bg-brand-dark transition w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Procesando pago..." : "Ir a Pagar"}
        </button>
        
        {/* Debug info - remover en producción */}
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
          <strong>Debug Info:</strong><br/>
          Event ID: {id}<br/>
          Event Name: {event.name}<br/>
          Presentations: {event.presentations?.length || 0}
        </div>
      </div>
    </div>
  );
}