'use client'

import React from 'react'
import type { Ticket } from '@/shared/types/ticket'
import { updateTicket } from '@/features/tickets/tickets.api'

type Props = {
  tickets: Ticket[]
  onRedeemSuccess: () => void
}

export function TicketListForChecker({ tickets, onRedeemSuccess }: Props) {
  
  const handleRedeem = async (ticketId: string) => {
    try {
      await updateTicket(ticketId, { isRedeemed: true })
      alert('Ticket redimido correctamente')
      onRedeemSuccess()
    } catch (error: any) {
      alert('Error al redimir ticket: ' + (error.message || 'Error desconocido'))
    }
  }

  if (tickets.length === 0) {
    return <p>No hay tickets asignados para revisar.</p>
  }

  return (
    <div className="grid gap-4">
      {tickets.map(ticket => (
        <div key={ticket.id} className="border rounded p-4 shadow-sm flex justify-between items-center">
          <div>
            <h2 className="font-bold text-lg">{ticket.presentation.event.name}</h2>
            <p>Lugar: {ticket.presentation.place}</p>
            <p>Fecha: {new Date(ticket.presentation.startDate).toLocaleString()}</p>
            <p>Usuario: {ticket.user.name} {ticket.user.lastname} ({ticket.user.email})</p>
            <p>Estado: {ticket.isRedeemed ? 'Redimido' : 'Pendiente'}</p>
          </div>
          {!ticket.isRedeemed && (
            <button
              onClick={() => handleRedeem(ticket.id)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Redimir
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
