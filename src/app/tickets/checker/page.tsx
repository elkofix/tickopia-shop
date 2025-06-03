'use client'

import React, { useEffect, useState } from 'react'
import { getMyTickets } from '@/features/tickets/tickets.api'
import type { Ticket } from '@/shared/types/ticket'
import { TicketListForChecker } from '@/features/tickets/components/TicketListForChecker'

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchTickets = async () => {
    try {
      setLoading(true)
      setError('')
      const ticketsData = await getMyTickets()
      setTickets(ticketsData)
    } catch (err: any) {
      setError(err.message || 'Error al cargar los tickets')
      console.error('Error fetching tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
    const interval = setInterval(fetchTickets, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    fetchTickets()
  }

  return (
    <main className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Mis Tickets</h1>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && tickets.length === 0 ? (
        <p>Cargando tickets...</p>
      ) : (
        <TicketListForChecker tickets={tickets} onRedeemSuccess={fetchTickets} />
      )}
    </main>
  )
}
