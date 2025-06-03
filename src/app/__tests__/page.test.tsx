// src/app/__tests__/HomePage.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../page';
import { getEvents } from '../../features/events/events.api';
import { Event } from '@/shared/types/event';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/slices/authSlice';
import { Provider } from 'react-redux';

// Mock the events API
jest.mock('../../features/events/events.api', () => ({
  getEvents: jest.fn(),
}));

// Mock EventHeroSection and EventList components
jest.mock('../../features/events/components/EventHeroSection', () => ({
  __esModule: true,
  default: ({ events }: { events: Event[] }) => (
    <div data-testid="hero-section">{`Hero section with ${events.length} events`}</div>
  ),
}));

jest.mock('../../features/events/components/EventList', () => ({
  __esModule: true,
  default: ({ initialEvents }: { initialEvents: Event[] }) => (
    <div data-testid="event-list">{`Event list with ${initialEvents.length} events`}</div>
  ),
}));

const mockGetEvents = getEvents as jest.MockedFunction<typeof getEvents>;

const mockEvents: Event[] = [
  {
    id: '1',
    name: 'Concert',
    bannerPhotoUrl: '/concert.jpg',
    isPublic: true,
    user: {
      id: 'user1',
      email: 'organizer@example.com',
      name: 'John',
      lastname: 'Doe',
      isActive: true,
      roles: ['event-manager'],
    },
  },
  {
    id: '2',
    name: 'Conference',
    bannerPhotoUrl: '/conference.jpg',
    isPublic: true,
    user: {
      id: 'user2',
      email: 'organizer2@example.com',
      name: 'Jane',
      lastname: 'Smith',
      isActive: true,
      roles: ['admin'],
    },
  },
];

const createTestStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
    },
  });

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getEvents with correct params', async () => {
    mockGetEvents.mockResolvedValue([]);
    const store = createTestStore();

    render(
      <Provider store={store}>
        <HomePage />
      </Provider>
    );

    await waitFor(() => {
      expect(mockGetEvents).toHaveBeenCalledWith({ limit: 10, offset: 0 });
    });
  });

  it('renders hero and list with fetched events', async () => {
    mockGetEvents.mockResolvedValue(mockEvents);
    const store = createTestStore();

    render(
      <Provider store={store}>
        <HomePage />
      </Provider>
    );

    expect(await screen.findByTestId('hero-section')).toHaveTextContent(
      'Hero section with 2 events'
    );
    expect(await screen.findByTestId('event-list')).toHaveTextContent(
      'Event list with 2 events'
    );
  });

  it('renders correctly when no events are returned', async () => {
    mockGetEvents.mockResolvedValue([]);
    const store = createTestStore();

    render(
      <Provider store={store}>
        <HomePage />
      </Provider>
    );

    expect(await screen.findByTestId('hero-section')).toHaveTextContent(
      'Hero section with 0 events'
    );
    expect(await screen.findByTestId('event-list')).toHaveTextContent(
      'Event list with 0 events'
    );
  });

  it('sets error on fetch failure with thrown error', async () => {
    mockGetEvents.mockRejectedValue(new Error('API Error'));
    const store = createTestStore();

    render(
      <Provider store={store}>
        <HomePage />
      </Provider>
    );

    const errorMessages = await screen.findAllByText('Error al cargar eventos');
    expect(errorMessages).toHaveLength(2);
  });

  it('sets error on fetch failure with error object from backend', async () => {
    mockGetEvents.mockResolvedValue({ error: 'Error desde backend' } as any);
    const store = createTestStore();

    render(
      <Provider store={store}>
        <HomePage />
      </Provider>
    );

    expect(await screen.findByText('Error al cargar eventos')).toBeInTheDocument();
    expect(screen.getByText('Error desde backend')).toBeInTheDocument();
  });

  it('logs error and sets fallback error on rejected promise', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetEvents.mockRejectedValue(new Error('Excepción de red'));
    const store = createTestStore();

    render(
      <Provider store={store}>
        <HomePage />
      </Provider>
    );

    const errorMessages = await screen.findAllByText('Error al cargar eventos');
    expect(errorMessages).toHaveLength(2);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error fetching initial events:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  



});
