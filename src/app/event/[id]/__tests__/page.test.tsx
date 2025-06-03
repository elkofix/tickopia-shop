import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getEventById } from '../../../../features/events/events.api';
import EventDetailPage from '../page';
import { useParams, notFound } from 'next/navigation';

jest.mock('../../../../features/events/events.api');
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  notFound: jest.fn(),
}));

describe('EventDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({ id: '1' });
  });

  test('renders loading state', () => {
    render(<EventDetailPage />);
    expect(screen.getByText('Cargando evento...')).toBeInTheDocument();
    expect(screen.getByTestId('spinner')).toHaveClass('animate-spin');
  });

  test('renders error state', async () => {
    (getEventById as jest.Mock).mockRejectedValue(new Error('Error al cargar el evento'));
    
    render(<EventDetailPage />);
    
    await screen.findByText('Error al cargar evento');
    expect(screen.getByText('Error al cargar evento')).toBeInTheDocument();
    expect(screen.getByText('Intentar de nuevo')).toBeInTheDocument();
  });

  test('renders event details and presentations', async () => {
    const mockEvent = {
      id: '1',
      name: 'Concierto de Rock',
      bannerPhotoUrl: '/banner.jpg',
      isPublic: true,
      user: { name: 'Juan', lastname: 'Pérez' },
      presentations: [
        {
          id: 'p1',
          place: 'Estadio Nacional',
          city: 'Lima',
          startDate: '2025-06-10T20:00:00Z',
          price: 50,
        },
      ],
    };

    (getEventById as jest.Mock).mockResolvedValue(mockEvent);

    render(<EventDetailPage />);

    await screen.findByText('Concierto de Rock');
    expect(screen.getByText('Concierto de Rock')).toBeInTheDocument();
    expect(screen.getByText('Público')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Concierto de Rock' })).toBeInTheDocument();
  });

  test('renders no presentations message', async () => {
    const mockEvent = {
      id: '1',
      name: 'Concierto de Rock',
      bannerPhotoUrl: '/banner.jpg',
      isPublic: true,
      user: { name: 'Juan', lastname: 'Pérez' },
      presentations: [],
    };

    (getEventById as jest.Mock).mockResolvedValue(mockEvent);

    render(<EventDetailPage />);

    await screen.findByText('No hay presentaciones asociadas aún.');
    expect(screen.getByText('No hay presentaciones asociadas aún.')).toBeInTheDocument();
  });

  test('calls notFound when id is undefined', () => {
    (useParams as jest.Mock).mockReturnValue({ id: undefined });
    render(<EventDetailPage />);
    expect(notFound).toHaveBeenCalled();
  });

  
});