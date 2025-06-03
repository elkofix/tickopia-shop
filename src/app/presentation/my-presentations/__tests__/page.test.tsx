import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import MyPresentationsPage from '../../my-presentations/page'
const { getPresentations } = require('../../../../features/presentation/presentations.api')


jest.mock('../../../../features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user1', name: 'Test User' } }),
}))

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('../../../../features/presentation/presentations.api', () => ({
  getPresentations: jest.fn(),
}))


describe('MyPresentationsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading state', async () => {
    getPresentations.mockReturnValue(new Promise(() => {}))
    render(<MyPresentationsPage />)
    expect(screen.getByText(/cargando presentaciones/i)).toBeInTheDocument()
  })

  it('shows empty state if no presentations', async () => {
    getPresentations.mockResolvedValue([])
    render(<MyPresentationsPage />)
    await waitFor(() =>
      expect(screen.getByText(/no has creado presentaciones/i)).toBeInTheDocument()
    )
  })

  it('renders presentations list', async () => {
    getPresentations.mockResolvedValue([
      {
        presentationId: 'pres1',
        event: { name: 'Evento Test' },
        city: 'Cali',
        place: 'Teatro',
        startDate: '2024-06-01T10:00:00Z',
        capacity: 100,
        price: 50,
      },
    ])
    render(<MyPresentationsPage />)
    expect(await screen.findByText(/mis presentaciones/i)).toBeInTheDocument()
    expect(screen.getByText(/evento test/i)).toBeInTheDocument()
    expect(screen.getByText(/cali/i)).toBeInTheDocument()
    expect(screen.getByText(/teatro/i)).toBeInTheDocument()
    expect(screen.getByText(/\$50/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument()
  })

  it('calls router.push when clicking Editar', async () => {
    getPresentations.mockResolvedValue([
      {
        presentationId: 'pres2',
        event: { name: 'Evento 2' },
        city: 'Bogotá',
        place: 'Auditorio',
        startDate: '2024-07-01T12:00:00Z',
        capacity: 200,
        price: 80,
      },
    ])
    render(<MyPresentationsPage />)
    const editBtn = await screen.findByRole('button', { name: /editar/i })
    fireEvent.click(editBtn)
    expect(mockPush).toHaveBeenCalledWith('/presentation/edit/pres2')
  })

  
})
