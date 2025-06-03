"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { getEventById } from "@/features/events/events.api";

export default function SuccessPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [event, setEvent] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const quantity = searchParams.get("quantity");

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        setError("No se especificó un evento.");
        setLoading(false);
        return;
      }

      try {
        const data = await getEventById(eventId);
        if ("error" in data) {
          setError(data.error);
        } else {
          setEvent(data);
        }
      } catch (err) {
        setError("Error al cargar los detalles del evento.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando confirmación...</p>
        </div>
      </div>
    );
  }

  if (error || !eventId) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Error al confirmar
          </h2>
          <p className="text-red-600">{error || "Evento no encontrado."}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="bg-white shadow-md rounded-lg p-6 text-center">
        <div className="mb-6">
          <Image
            src="/success-check.png" // Reemplaza con una imagen de checkmark o usa event.bannerPhotoUrl
            alt="Compra exitosa"
            width={100}
            height={100}
            className="mx-auto"
          />
        </div>
        <h1 className="text-3xl font-bold mb-4 text-green-600">¡Compra Exitosa!</h1>
        <p className="text-gray-700 mb-4">
          Has comprado {quantity} boleta{quantity === "1" ? "" : "s"} para el evento{" "}
          <strong>{event?.name}</strong>.
        </p>
        <p className="text-sm text-gray-600 mb-6">
          Tus boletos están asociados a tu cuenta. Puedes verlos en tu perfil.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.push(`/event/${eventId}`)}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Volver al evento
          </button>
          <button
            onClick={() => router.push("/profile/tickets")} // Ajusta según la ruta de tus boletos
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition"
          >
            Ver mis boletos
          </button>
        </div>
      </div>
    </div>
  );
}