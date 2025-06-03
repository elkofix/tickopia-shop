import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../../features/auth/hooks/useAuth';
import { getEventById, deleteEvent } from '../../../../../features/events/events.api';
import DeleteEventPage from '../page';

jest.mock('next/navigation');
jest.mock('../../../../../features/auth/hooks/useAuth');
jest.mock('../../../../../features/events/events.api');

describe('DeleteEventPage', () => {
  const mockPush = jest.fn();
  const mockBack = jest.fn();
  const mockUser = { id: 'user1', name: 'Juan', lastname: 'Pérez' };

  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({ id: '1' });
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: mockBack, replace: jest.fn(), prefetch: jest.fn() });
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser, isLoading: false });
  });

  test('renders loading state when auth is loading', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, isLoading: true });
    render(<DeleteEventPage />);
    expect(screen.getByTestId('loading')).toHaveClass('animate-pulse');
  });

  test('renders loading state when event is loading', () => {
    render(<DeleteEventPage />);
    expect(screen.getByTestId('loading')).toHaveClass('animate-pulse');
  });

  test('redirects to login when user is not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, isLoading: false });
    render(<DeleteEventPage />);
    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });

  test('shows error for invalid event ID', async () => {
    (useParams as jest.Mock).mockReturnValue({ id: undefined });
    render(<DeleteEventPage />);
    await screen.findByText('ID de evento no válido');
    expect(screen.getByText('ID de evento no válido')).toBeInTheDocument();
    expect(screen.getByText('Volver a mis eventos')).toBeInTheDocument();
  });

  test('shows error when user is not the event owner', async () => {
    const mockEvent = {
      id: '1',
      name: 'Concierto de Rock',
      user: { id: 'user2', name: 'Ana', lastname: 'Gómez' },
    };
    (getEventById as jest.Mock).mockResolvedValue(mockEvent);
    render(<DeleteEventPage />);
    await screen.findByText('Solo puedes eliminar tus propios eventos');
    expect(screen.getByText('Solo puedes eliminar tus propios eventos')).toBeInTheDocument();
    expect(screen.getByText('Volver a mis eventos')).toBeInTheDocument();
  });

  test('shows error when getEventById fails', async () => {
    (getEventById as jest.Mock).mockResolvedValue({ error: 'Evento no encontrado' });
    render(<DeleteEventPage />);
    await screen.findByText('Evento no encontrado');
    expect(screen.getByText('Evento no encontrado')).toBeInTheDocument();
    expect(screen.getByText('Volver a mis eventos')).toBeInTheDocument();
  });

  test('shows generic error on API failure', async () => {
    (getEventById as jest.Mock).mockRejectedValue(new Error('API error'));
    render(<DeleteEventPage />);
    await screen.findByText('Error al cargar el evento');
    expect(screen.getByText('Error al cargar el evento')).toBeInTheDocument();
    expect(screen.getByText('Volver a mis eventos')).toBeInTheDocument();
  });

  test('renders DeleteEventForm for valid event and authorized user', async () => {
    const mockEvent = {
      id: '1',
      name: 'Concierto de Rock',
      user: { id: 'user1', name: 'Juan', lastname: 'Pérez' },
      isPublic: true,
      bannerPhotoUrl: '/banner.jpg',
    };
    (getEventById as jest.Mock).mockResolvedValue(mockEvent);
    render(<DeleteEventPage />);
    await screen.findByText('Eliminar Evento');
    expect(screen.getByText('Concierto de Rock')).toBeInTheDocument();
    expect(screen.getByText('Público')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Banner del evento' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Para confirmar la eliminación/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmar Eliminación' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  test('calls router.back on cancel', async () => {
    const mockEvent = {
      id: '1',
      name: 'Concierto de Rock',
      user: { id: 'user1', name: 'Juan', lastname: 'Pérez' },
      isPublic: true,
    };
    (getEventById as jest.Mock).mockResolvedValue(mockEvent);
    render(<DeleteEventPage />);
    await screen.findByText('Eliminar Evento');
    const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
    await userEvent.click(cancelButton);
    expect(mockBack).toHaveBeenCalled();
  });

  test('handles deleteEvent API error', async () => {
    const mockEvent = {
      id: '1',
      name: 'Concierto de Rock',
      user: { id: 'user1', name: 'Juan', lastname: 'Pérez' },
      isPublic: true,
    };
    (getEventById as jest.Mock).mockResolvedValue(mockEvent);
    (deleteEvent as jest.Mock).mockRejectedValue({ response: { data: { message: 'No se pudo eliminar el evento' } } });
    render(<DeleteEventPage />);
    await screen.findByText('Eliminar Evento');
    const input = screen.getByLabelText(/Para confirmar la eliminación/);
    await userEvent.type(input, 'Concierto de Rock');
    const submitButton = screen.getByRole('button', { name: 'Confirmar Eliminación' });
    await userEvent.click(submitButton);
    await screen.findByText('No se pudo eliminar el evento');
    expect(deleteEvent).toHaveBeenCalledWith('1');
  });

  test('shows event not found message when event is null', async () => {
    (getEventById as jest.Mock).mockRejectedValue(new Error('API error'));
    render(<DeleteEventPage />);
    await screen.findByText('Error al cargar el evento');
    expect(screen.getByText('Error al cargar el evento')).toBeInTheDocument();
    expect(screen.getByText('Volver a mis eventos')).toBeInTheDocument();
  });
});