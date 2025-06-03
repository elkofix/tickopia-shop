import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import SuccessPage from '../../success/page'
import { getEventById } from '../../../../features/events/events.api'
import { useSearchParams } from 'next/navigation'

// --- Mocks ---
jest.mock('next/image', () => (props: any) => <img {...props} />)

const pushMock = jest.fn()
const useRouterMock = () => ({ push: pushMock })

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: jest.fn(),
}))

jest.mock('../../../../features/events/events.api', () => ({
  getEventById: jest.fn(),
}))

  describe('SuccessPage', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('shows loading spinner initially', async () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (key: string) => (key === 'eventId' ? '123' : '2'),
      })
      ;(getEventById as jest.Mock).mockImplementation(() => new Promise(() => {}))
      render(<SuccessPage />)
      expect(screen.getByText(/Cargando confirmación/i)).toBeInTheDocument()
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('shows error if eventId is missing', async () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: () => null,
      })
      render(<SuccessPage />)
      await waitFor(() =>
        expect(screen.getByText(/Error al confirmar/i)).toBeInTheDocument()
      )
      expect(screen.getByText(/No se especificó un evento/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Volver al inicio/i })).toBeInTheDocument()
    })

    it('shows error if getEventById returns error', async () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (key: string) => (key === 'eventId' ? '123' : '2'),
      })
      ;(getEventById as jest.Mock).mockResolvedValue({ error: 'Evento no encontrado.' })
      render(<SuccessPage />)
      await waitFor(() =>
        expect(screen.getByText(/Error al confirmar/i)).toBeInTheDocument()
      )
      expect(screen.getByText(/Evento no encontrado/i)).toBeInTheDocument()
    })

    it('shows error if getEventById throws', async () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (key: string) => (key === 'eventId' ? '123' : '2'),
      })
      ;(getEventById as jest.Mock).mockRejectedValue(new Error('fail'))
      render(<SuccessPage />)
      await waitFor(() =>
        expect(screen.getByText(/Error al confirmar/i)).toBeInTheDocument()
      )
      expect(screen.getByText(/Error al cargar los detalles del evento/i)).toBeInTheDocument()
    })

    it('shows success message and event info', async () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (key: string) => {
          if (key === 'eventId') return '123'
          if (key === 'quantity') return '3'
          return null
        },
      })
      ;(getEventById as jest.Mock).mockResolvedValue({ name: 'Concierto ICESI' })
      render(<SuccessPage />)
      await waitFor(() =>
        expect(screen.getByText(/¡Compra Exitosa!/i)).toBeInTheDocument()
      )
      expect(screen.getByText(/Has comprado 3 boletas para el evento/i)).toBeInTheDocument()
      expect(screen.getByText(/Concierto ICESI/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Volver al evento/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Ver mis boletos/i })).toBeInTheDocument()
    })

    it('navigates to home on error button click', async () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: () => null,
      })
      render(<SuccessPage />)
      await waitFor(() => screen.getByRole('button', { name: /Volver al inicio/i }))
      fireEvent.click(screen.getByRole('button', { name: /Volver al inicio/i }))
      expect(pushMock).toHaveBeenCalledWith('/')
    })

    it('navigates to event and tickets on button clicks', async () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (key: string) => {
          if (key === 'eventId') return '123'
          if (key === 'quantity') return '1'
          return null
        },
      })
      ;(getEventById as jest.Mock).mockResolvedValue({ name: 'Concierto ICESI' })
      render(<SuccessPage />)
      await waitFor(() => screen.getByRole('button', { name: /Volver al evento/i }))
      fireEvent.click(screen.getByRole('button', { name: /Volver al evento/i }))
      expect(pushMock).toHaveBeenCalledWith('/event/123')
      fireEvent.click(screen.getByRole('button', { name: /Ver mis boletos/i }))
      expect(pushMock).toHaveBeenCalledWith('/profile/tickets')
    })
  })
  
