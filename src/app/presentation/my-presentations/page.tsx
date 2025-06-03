'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Presentation } from '@/shared/types/presentation'
import { getPresentations } from '@/features/presentation/presentations.api'
import { useAuth } from '@/features/auth/hooks/useAuth'

export default function MyPresentationsPage() {
  const [presentations, setPresentations] = useState<Presentation[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  const handleEdit = (presentationId: string) => {
    router.push(`/presentation/edit/${presentationId}`)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const all = await getPresentations()
        setPresentations(all)
      } catch (err) {
        console.error('Error fetching presentations:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (loading) return <p className="text-center mt-10">Cargando presentaciones...</p>

  if (presentations.length === 0) {
    return <p className="text-center mt-10">No has creado presentaciones aún.</p>
  }

        return (
            <div className="max-w-4xl mx-auto mt-10 p-4">
            <h1 className="text-2xl font-bold mb-6">Mis Presentaciones</h1>
            <ul className="space-y-6">
                {presentations.map((p) => (
        <li key={p.idPresentation} className="border rounded-lg p-6 shadow-lg shadow-blue-500/50">
            <div className="flex justify-between items-start">
            <div className="flex-1">
                <p><strong>Evento:</strong> {p.event.name}</p>
                <p><strong>Ciudad:</strong> {p.city}</p>
                <p><strong>Lugar:</strong> {p.place}</p>
                <p><strong>Fecha:</strong> {new Date(p.startDate).toLocaleString()}</p>
                <p><strong>Capacidad:</strong> {p.capacity}</p>
                <p><strong>Precio:</strong> ${p.price}</p>
            </div>
            <button
                onClick={() => handleEdit(p.idPresentation)}
                className="ml-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
                Editar
            </button>
            </div>
        </li>
        ))}
      </ul>
    </div>
  )
}