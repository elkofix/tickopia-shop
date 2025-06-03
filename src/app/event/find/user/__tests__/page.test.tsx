import { render, screen, waitFor} from '@testing-library/react';
import { useAuth } from '../../../../../features/auth/hooks/useAuth';
import { getEventsByUserId } from '../../../../../features/events/events.api';
import MyEventsPage from '../page';

jest.mock('../../../../../features/auth/hooks/useAuth');
jest.mock('../../../../../features/events/events.api');

// Mock del componente EventList para que renderice los eventos esperados
jest.mock('../../../../../features/events/components/EventList', () => {
  return function MockEventList({ initialEvents, showControls }: { initialEvents: any[], showControls: boolean }) {
    return (
      <div data-testid="event-list">
        {initialEvents.map((event: any) => (
          <div key={event.id} data-testid={`event-${event.id}`}>
            {event.name} {showControls && '(Controls)'}
          </div>
        ))}
      </div>
    );
  };
});

describe('MyEventsPage', () => {
  const mockUser = { id: 'user1', name: 'Juan', lastname: 'Pérez' };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser, isLoading: false });
  });

  test('renders loading state when auth is loading', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, isLoading: true });
    render(<MyEventsPage />);
    expect(screen.getByTestId('loading')).toHaveClass('animate-pulse');
    expect(screen.getAllByTestId('loading-placeholder').length).toBe(6);
  });

  test('renders loading state when events are loading', () => {
    // Para simular el estado de carga de eventos, necesitamos que getEventsByUserId
    // tome tiempo en resolverse
    (getEventsByUserId as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve([]), 100))
    );
    
    render(<MyEventsPage />);
    expect(screen.getByTestId('loading')).toHaveClass('animate-pulse');
    expect(screen.getAllByTestId('loading-placeholder').length).toBe(6);
  });

  test('shows unauthorized message when user is not authenticated', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, isLoading: false });
    render(<MyEventsPage />);
    await screen.findByText('Error');
    expect(screen.getByText('No autorizado')).toBeInTheDocument();
  });

  test('shows error when getEventsByUserId fails with error response', async () => {
    (getEventsByUserId as jest.Mock).mockResolvedValue({ error: 'Eventos no encontrados' });
    render(<MyEventsPage />);
    await screen.findByText('Error');
    expect(screen.getByText('Eventos no encontrados')).toBeInTheDocument();
  });

  test('shows generic error when getEventsByUserId throws', async () => {
    (getEventsByUserId as jest.Mock).mockRejectedValue(new Error('API error'));
    render(<MyEventsPage />);
    await screen.findByText('Error');
    expect(screen.getByText('Error al cargar los eventos')).toBeInTheDocument();
  });

  test('renders EventList with events for authenticated user', async () => {
    const mockEvents = [
      { id: '1', name: 'Concierto de Rock' },
      { id: '2', name: 'Festival de Jazz' },
    ];
    (getEventsByUserId as jest.Mock).mockResolvedValue(mockEvents);
    render(<MyEventsPage />);
    await waitFor(() => expect(screen.getByTestId('event-list')).toBeInTheDocument());
    expect(screen.getByTestId('event-1')).toHaveTextContent('Concierto de Rock (Controls)');
    expect(screen.getByTestId('event-2')).toHaveTextContent('Festival de Jazz (Controls)');
    expect(getEventsByUserId).toHaveBeenCalled();
  });

  test('renders EventList with no events for authenticated user', async () => {
    (getEventsByUserId as jest.Mock).mockResolvedValue([]);
    render(<MyEventsPage />);
    await waitFor(() => expect(screen.getByTestId('event-list')).toBeInTheDocument());
    expect(screen.queryByTestId(/^event-\d+$/)).not.toBeInTheDocument();
    expect(getEventsByUserId).toHaveBeenCalled();
  });
});