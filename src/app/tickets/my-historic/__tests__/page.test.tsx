import { render, screen, waitFor } from '@testing-library/react'

import MyHistoricTicketsPage from '../../my-historic/page'
import { getMyHistoricTickets } from '../../../../features/tickets/tickets.api'


// Mock getMyHistoricTickets and TicketCard
jest.mock('../../../../features/tickets/tickets.api', () => ({
  getMyHistoricTickets: jest.fn(),
}))
jest.mock('../../../../features/tickets/components/TicketCard', () => ({
  TicketCard: ({ ticket }: any) => <div data-testid="ticket-card">{ticket?.id}</div>,
}))


describe('MyHistoricTicketsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading initially', async () => {
    (getMyHistoricTickets as jest.Mock).mockReturnValue(new Promise(() => {}))
    render(<MyHistoricTicketsPage />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('shows empty state when no tickets', async () => {
    (getMyHistoricTickets as jest.Mock).mockResolvedValue([])
    render(<MyHistoricTicketsPage />)
    await waitFor(() =>
      expect(screen.getByText(/you don't have any historic tickets yet/i)).toBeInTheDocument()
    )
    expect(
      screen.getByText(/when you attend events, your used tickets will appear here/i)
    ).toBeInTheDocument()
  })

  it('renders TicketCard for each ticket', async () => {
    const tickets = [
      { id: '1', name: 'Ticket 1' },
      { id: '2', name: 'Ticket 2' },
    ]
    ;(getMyHistoricTickets as jest.Mock).mockResolvedValue(tickets)
    render(<MyHistoricTicketsPage />)
    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument())
    const cards = screen.getAllByTestId('ticket-card')
    expect(cards).toHaveLength(2)
    expect(cards[0]).toHaveTextContent('1')
    expect(cards[1]).toHaveTextContent('2')
  })

  it('shows empty state if API fails', async () => {
    (getMyHistoricTickets as jest.Mock).mockRejectedValue(new Error('API error'))
    render(<MyHistoricTicketsPage />)
    await waitFor(() =>
      expect(screen.getByText(/you don't have any historic tickets yet/i)).toBeInTheDocument()
    )
  })
})