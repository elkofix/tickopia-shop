"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await getEventById(id);
        setEvent(data);
      } catch (err) {
        console.error("Error cargando evento:", err);
        setError("Error al cargar el evento");
      }
    };

    if (id) fetchEvent();
  }, [id]);

  const handleCheckout = async () => {
    setLoading(true);
    setError("");
    
    try {
      const result = await buyTickets({
        quantity,
        presentationId: id,
      });

      if (result.success && result.url) {
        console.log("Redirigiendo a Stripe:", result.url);
        window.location.href = result.url;
      } else {
        setError(result.error || "Error al procesar el pago");
      }
    } catch (error) {
      console.error("Error iniciando checkout:", error);
      setError("Error inesperado al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Compra de Boletas</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {event && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative w-full md:w-1/2 h-48 md:h-64 rounded overflow-hidden">
              <Image
                src={event.bannerPhotoUrl}
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
                  {event.user.name} {event.user.lastname}
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
      )}

      <div className="bg-white p-6 rounded shadow-md">
        <label className="block mb-2 font-medium">Cantidad de boletas</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          min={1}
          max={10}
          className="border rounded px-3 py-2 w-full mb-4"
        />

        <button
          onClick={handleCheckout}
          disabled={loading || !event}
          className="bg-brand text-white px-6 py-2 rounded hover:bg-brand-dark transition w-full disabled:opacity-50"
        >
          {loading ? "Procesando pago..." : "Ir a Pagar"}
        </button>
      </div>
    </div>
  );
}