import { render, screen, waitFor } from '@testing-library/react';
import { useParams } from 'next/navigation';
import { getEventForEditing } from '../../../../../features/events/events.api';
import UpdateEventPage from '../page';

jest.mock('next/navigation');
jest.mock('../../../../../features/events/events.api');

// Mock the UpdateEventForm component with proper test attributes
jest.mock('../../../../../features/events/components/UpdateEventForm', () => {
  return function MockUpdateEventForm({ event }: { event: any }) {
    return (
      <div data-testid="update-event-form">
        <p>Update Event Form for {event.name}</p>
      </div>
    );
  };
});

describe('UpdateEventPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({ id: '1' });
  });

  test('renders loading state when fetching event', () => {
    render(<UpdateEventPage />);
    expect(screen.getByText('Cargando información del evento...')).toBeInTheDocument();
  });

  test('shows error for invalid event ID', async () => {
    (useParams as jest.Mock).mockReturnValue({ id: undefined });
    render(<UpdateEventPage />);
    await waitFor(() => expect(screen.getByText('ID del evento no válido')).toBeInTheDocument());
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  test('shows error when getEventForEditing fails with error response', async () => {
    (getEventForEditing as jest.Mock).mockResolvedValue({ error: 'Evento no encontrado' });
    render(<UpdateEventPage />);
    await waitFor(() => expect(screen.getByText('Evento no encontrado')).toBeInTheDocument());
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  test('shows generic error when getEventForEditing throws', async () => {
    (getEventForEditing as jest.Mock).mockRejectedValue(new Error('API error'));
    render(<UpdateEventPage />);
    await waitFor(() => expect(screen.getByText('Error al cargar el evento')).toBeInTheDocument());
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  test('shows event not found message when event is null', async () => {
    (getEventForEditing as jest.Mock).mockResolvedValue(null);
    render(<UpdateEventPage />);
    await waitFor(() => expect(screen.getByText('Evento no encontrado')).toBeInTheDocument());
  });

  test('renders UpdateEventForm for valid event', async () => {
    const mockEvent = {
      id: '1',
      name: 'Concierto de Rock',
      user: { id: 'user1', name: 'Juan', lastname: 'Pérez' },
    };
    (getEventForEditing as jest.Mock).mockResolvedValue(mockEvent);
    render(<UpdateEventPage />);
    await waitFor(() => expect(screen.getByTestId('update-event-form')).toBeInTheDocument());
    expect(screen.getByText('Update Event Form for Concierto de Rock')).toBeInTheDocument();
    expect(getEventForEditing).toHaveBeenCalledWith('1');
  });
});