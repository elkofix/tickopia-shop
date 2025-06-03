import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import MyTicketsPage from '../../my-tickets/page'
import { getMyTickets } from '../../../../features/tickets/tickets.api'

// Mock getMyTickets and TicketCard
jest.mock('../../../../features/tickets/tickets.api', () => ({
  getMyTickets: jest.fn(),
}))
jest.mock('../../../../features/tickets/components/TicketCard', () => ({
  __esModule: true,
  TicketCard: ({ ticket }: any) => <div data-testid="ticket-card">{ticket.title}</div>,
}))

describe('MyTicketsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading state initially', async () => {
    (getMyTickets as jest.Mock).mockResolvedValueOnce([])
    render(<MyTicketsPage />)
    expect(screen.getByText(/Cargando tickets/i)).toBeInTheDocument()
    await waitFor(() => expect(getMyTickets).toHaveBeenCalled())
  })

  it('renders tickets when API returns data', async () => {
    (getMyTickets as jest.Mock).mockResolvedValueOnce([
      { id: 1, title: 'Ticket 1' },
      { id: 2, title: 'Ticket 2' },
    ])
    render(<MyTicketsPage />)
    await waitFor(() => expect(screen.getAllByTestId('ticket-card')).toHaveLength(2))
    expect(screen.getByText('Ticket 1')).toBeInTheDocument()
    expect(screen.getByText('Ticket 2')).toBeInTheDocument()
  })

  it('shows "No tienes tickets aún." when API returns empty array', async () => {
    (getMyTickets as jest.Mock).mockResolvedValueOnce([])
    render(<MyTicketsPage />)
    await waitFor(() => expect(screen.getByText(/No tienes tickets/i)).toBeInTheDocument())
  })

  it('shows error message if API throws', async () => {
    (getMyTickets as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
    render(<MyTicketsPage />)
    await waitFor(() => expect(screen.getByText(/Network error/i)).toBeInTheDocument())
  })

  it('refresh button calls fetch and updates UI', async () => {
    (getMyTickets as jest.Mock)
      .mockResolvedValueOnce([{ id: 1, title: 'Ticket 1' }])
      .mockResolvedValueOnce([{ id: 2, title: 'Ticket 2' }])
    render(<MyTicketsPage />)
    
    // Esperar a que termine la carga inicial y aparezca el botón
    await waitFor(() => expect(screen.getByText('Ticket 1')).toBeInTheDocument())
    
    const button = screen.getByRole('button', { name: /Actualizar/i })
    fireEvent.click(button)
    await waitFor(() => expect(screen.getByText('Ticket 2')).toBeInTheDocument())
  })

  it('disables refresh button when loading after initial load', async () => {
    // Simular que ya hay tickets cargados
    (getMyTickets as jest.Mock)
      .mockResolvedValueOnce([{ id: 1, title: 'Initial Ticket' }])
      .mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve([]), 100)))

    render(<MyTicketsPage />)
    
    // Esperar a que termine la carga inicial
    await waitFor(() => expect(screen.getByText('Initial Ticket')).toBeInTheDocument())
    
    const button = screen.getByRole('button', { name: /Actualizar/i })
    expect(button).not.toBeDisabled()
    
    fireEvent.click(button)
    
    // Verificar que el botón se deshabilita durante la recarga
    await waitFor(() => expect(button).toBeDisabled())
    await waitFor(() => expect(button).not.toBeDisabled())
  })

  
})