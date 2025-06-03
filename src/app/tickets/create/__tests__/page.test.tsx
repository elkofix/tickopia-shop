import { render, screen } from '@testing-library/react'
import CreateTicketPage from '../page'


// Mock que cubre tanto exportación por defecto como nombrada
jest.mock('../../../../features/tickets/components/TicketCreateForm', () => {
  const MockComponent = () => <form data-testid="ticket-create-form"></form>
  
  return {
    __esModule: true,
    default: MockComponent,        // Para import TicketCreateForm from '...'
    TicketCreateForm: MockComponent // Para import { TicketCreateForm } from '...'
  }
})

describe('CreateTicketPage', () => {
  it('renders the heading', () => {
    render(<CreateTicketPage />)
    expect(screen.getByRole('heading', { name: /create ticket/i })).toBeInTheDocument()
  })

  it('renders the TicketCreateForm component', () => {
    render(<CreateTicketPage />)
    expect(screen.getByTestId('ticket-create-form')).toBeInTheDocument()
  })

  
})