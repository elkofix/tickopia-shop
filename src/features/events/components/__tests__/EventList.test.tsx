import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EventList from '../EventList';
import { getEvents } from '../../events.api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Event } from '@/shared/types/event';

// Mocks
jest.mock('../../events.api');
jest.mock('../../../../features/auth/hooks/useAuth');
jest.mock('../EventCard', () => ({
  EventCard: ({ event, showControls }: { event: Event; showControls: boolean }) => (
    <div data-testid={`event-card-${event.id}`}>
      <h3>{event.name}</h3>
      <span data-testid="show-controls">{showControls.toString()}</span>
    </div>
  ),
}));
jest.mock('../EventListEmptyState', () => ({
  EventListEmptyState: () => <div data-testid="empty-state">No events found</div>,
}));
jest.mock('../EventListPagination', () => ({
  EventListPagination: ({ 
    currentPage, 
    totalPages, 
    onLoadMore, 
    onPageChange,
    hasMoreData,
    loading 
  }: any) => (
    <div data-testid="pagination">
      <span data-testid="current-page">{currentPage}</span>
      <span data-testid="total-pages">{totalPages}</span>
      <button 
        data-testid="load-more"
        onClick={onLoadMore}
        disabled={!hasMoreData || loading}
      >
        Load More
      </button>
      <button 
        data-testid="page-change"
        onClick={() => onPageChange(2)}
      >
        Go to page 2
      </button>
    </div>
  ),
}));
jest.mock('../EventListSkeleton', () => ({
  EventListSkeleton: () => <div data-testid="loading-skeleton">Loading...</div>,
}));

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true,
});

const mockGetEvents = getEvents as jest.MockedFunction<typeof getEvents>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('EventList', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      name: 'Event 1',
      bannerPhotoUrl: 'https://example.com/banner1.jpg',
      isPublic: true,
      user: {
        id: '1',
        email: 'user1@example.com',
        name: 'John',
        lastname: 'Doe',
        isActive: true,
        roles: ['client'],
      },
    },
    {
      id: '2',
      name: 'Event 2',
      bannerPhotoUrl: 'https://example.com/banner2.jpg',
      isPublic: false,
      user: {
        id: '2',
        email: 'user2@example.com',
        name: 'Jane',
        lastname: 'Smith',
        isActive: true,
        roles: ['event-manager'],
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: jest.fn(),
      logout: jest.fn(),
      hasRole: jest.fn().mockReturnValue(false),
      hasAnyRole: jest.fn().mockReturnValue(false),
      hasAllRoles: jest.fn().mockReturnValue(false),
      loginTime: null,
      updateUserProfile: jest.fn(),
      checkSessionExpiration: jest.fn().mockReturnValue(false),
    });
  });

  describe('Rendering', () => {
    it('renders with initial events', () => {
      render(<EventList initialEvents={mockEvents} />);

      expect(screen.getByText('Eventos Disponibles')).toBeInTheDocument();
      expect(screen.getByText('Descubre los mejores eventos cerca de ti')).toBeInTheDocument();
      expect(screen.getByTestId('event-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('event-card-2')).toBeInTheDocument();
    });

    it('renders empty state when no events are provided', () => {
      render(<EventList initialEvents={[]} />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });

    it('renders pagination when events are present', () => {
      render(<EventList initialEvents={mockEvents} />);

      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('applies correct itemsPerPage prop', () => {
      render(<EventList initialEvents={mockEvents} itemsPerPage={1} />);

      // With itemsPerPage=1 and 2 events, we should have 2 total pages
      expect(screen.getByTestId('total-pages')).toHaveTextContent('2');
    });
  });

  describe('Role-based content', () => {
    it('shows default title and description when user has no event-manager role', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        login: jest.fn(),
        logout: jest.fn(),
        hasRole: jest.fn().mockReturnValue(false),
        hasAnyRole: jest.fn().mockReturnValue(false),
        hasAllRoles: jest.fn().mockReturnValue(false),
        loginTime: null,
        updateUserProfile: jest.fn(),
        checkSessionExpiration: jest.fn().mockReturnValue(false),
      });

      render(<EventList initialEvents={mockEvents} showControls={true} />);

      expect(screen.getByText('Eventos Disponibles')).toBeInTheDocument();
      expect(screen.getByText('Descubre los mejores eventos cerca de ti')).toBeInTheDocument();
    });

    it('shows "Mis Eventos" title when user has event-manager role and showControls is true', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        login: jest.fn(),
        logout: jest.fn(),
        hasRole: jest.fn().mockImplementation((role: string) => role === 'event-manager'),
        hasAnyRole: jest.fn().mockReturnValue(false),
        hasAllRoles: jest.fn().mockReturnValue(false),
        loginTime: null,
        updateUserProfile: jest.fn(),
        checkSessionExpiration: jest.fn().mockReturnValue(false),
      });

      render(<EventList initialEvents={mockEvents} showControls={true} />);

      expect(screen.getByText('Mis Eventos')).toBeInTheDocument();
      expect(screen.getByText('Aquí encontrarás los eventos que te pertenecen')).toBeInTheDocument();
    });

    it('passes showControls prop to EventCard components', () => {
      render(<EventList initialEvents={mockEvents} showControls={true} />);

      const eventCards = screen.getAllByTestId(/^event-card-/);
      eventCards.forEach(card => {
        expect(card.querySelector('[data-testid="show-controls"]')).toHaveTextContent('true');
      });
    });
  });

  describe('Loading states', () => {
    it('shows loading skeleton when loading is true', async () => {
      mockGetEvents.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockEvents), 100)));

      render(<EventList initialEvents={mockEvents} />);

      fireEvent.click(screen.getByTestId('load-more'));

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
      });
    });
  });

  describe('Pagination functionality', () => {
    beforeEach(() => {
      mockGetEvents.mockResolvedValue(mockEvents);
    });

    it('calls getEvents with correct parameters on load more', async () => {
      render(<EventList initialEvents={mockEvents} itemsPerPage={10} />);

      fireEvent.click(screen.getByTestId('load-more'));

      await waitFor(() => {
        expect(mockGetEvents).toHaveBeenCalledWith({
          limit: 10,
          offset: 10, // Second page offset
        });
      });
    });

    it('updates current page on load more', async () => {
      render(<EventList initialEvents={mockEvents} />);

      expect(screen.getByTestId('current-page')).toHaveTextContent('1');

      fireEvent.click(screen.getByTestId('load-more'));

      await waitFor(() => {
        expect(screen.getByTestId('current-page')).toHaveTextContent('2');
      });
    });

    it('calls getEvents with correct parameters on page change', async () => {
      render(<EventList initialEvents={mockEvents} itemsPerPage={5} />);

      fireEvent.click(screen.getByTestId('page-change'));

      await waitFor(() => {
        expect(mockGetEvents).toHaveBeenCalledWith({
          limit: 5,
          offset: 5, // Page 2 offset
        });
      });
    });

    it('scrolls to top on page change', async () => {
      render(<EventList initialEvents={mockEvents} />);

      fireEvent.click(screen.getByTestId('page-change'));

      await waitFor(() => {
        expect(window.scrollTo).toHaveBeenCalledWith({
          top: 0,
          behavior: 'smooth',
        });
      });
    });

    it('replaces events on page 1 load', async () => {
      const newEvents = [
        {
          id: '3',
          name: 'New Event',
          bannerPhotoUrl: 'https://example.com/banner3.jpg',
          isPublic: true,
          user: mockEvents[0].user,
        },
      ];
      mockGetEvents.mockResolvedValue(newEvents);

      render(<EventList initialEvents={mockEvents} />);

      // Simulate going to page 1 (which should replace events)
      fireEvent.click(screen.getByTestId('page-change'));

      await waitFor(() => {
        expect(mockGetEvents).toHaveBeenCalled();
      });
    });

    it('sets hasMoreData to false when returned events length is less than itemsPerPage', async () => {
      const incompleteEvents = [mockEvents[0]]; // Only 1 event when itemsPerPage is 10
      mockGetEvents.mockResolvedValue(incompleteEvents);

      render(<EventList initialEvents={mockEvents} itemsPerPage={10} />);

      fireEvent.click(screen.getByTestId('load-more'));

      await waitFor(() => {
        const loadMoreButton = screen.getByTestId('load-more');
        expect(loadMoreButton).toBeDisabled();
      });
    });
  });

  describe('Error handling', () => {
    it('handles API errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockGetEvents.mockRejectedValue(new Error('API Error'));

      render(<EventList initialEvents={mockEvents} />);

      fireEvent.click(screen.getByTestId('load-more'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error loading events:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });

    it('stops loading state even when API call fails', async () => {
      mockGetEvents.mockRejectedValue(new Error('API Error'));

      render(<EventList initialEvents={mockEvents} />);

      fireEvent.click(screen.getByTestId('load-more'));

      // Should show loading initially
      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();

      // Should stop loading after error
      await waitFor(() => {
        expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
      });
    });
  });

  describe('Props and configuration', () => {
    it('uses default itemsPerPage when not provided', () => {
      render(<EventList initialEvents={mockEvents} />);

      // With default itemsPerPage=10 and 2 events, total pages should be 1
      expect(screen.getByTestId('total-pages')).toHaveTextContent('1');
    });

    it('uses custom itemsPerPage when provided', () => {
      render(<EventList initialEvents={mockEvents} itemsPerPage={1} />);

      // With itemsPerPage=1 and 2 events, total pages should be 2
      expect(screen.getByTestId('total-pages')).toHaveTextContent('2');
    });

    it('defaults showControls to false', () => {
      render(<EventList initialEvents={mockEvents} />);

      const eventCards = screen.getAllByTestId(/^event-card-/);
      eventCards.forEach(card => {
        expect(card.querySelector('[data-testid="show-controls"]')).toHaveTextContent('false');
      });
    });
  });

  describe('Event slicing and pagination display', () => {
    it('displays correct events for current page', () => {
      const manyEvents = Array.from({ length: 15 }, (_, i) => ({
        ...mockEvents[0],
        id: `${i + 1}`,
        name: `Event ${i + 1}`,
      }));

      render(<EventList initialEvents={manyEvents} itemsPerPage={5} />);

      // Should show first 5 events on page 1
      expect(screen.getByTestId('event-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('event-card-5')).toBeInTheDocument();
      expect(screen.queryByTestId('event-card-6')).not.toBeInTheDocument();
    });
  });
});