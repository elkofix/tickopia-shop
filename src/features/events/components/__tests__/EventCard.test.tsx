import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Event } from '@/shared/types/event';
import { EventCard } from '../EventCard';

// Mock the useAuth hook
jest.mock('../../../../features/auth/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock next/link to make it easier to test
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('EventCard', () => {
  const mockEvent: any = {
    id: '1',
    name: 'Tech Conference 2023',
    bannerPhotoUrl: '/tech-conf.jpg',
    isPublic: true,
    user: {
      id: 'user1',
      name: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
    },
    // Add other required fields from your Event type
  };

  beforeEach(() => {
    // Default mock for useAuth
    (require('../../../../features/auth/hooks/useAuth').useAuth.mockReturnValue({
      hasRole: jest.fn().mockReturnValue(false),
    }));
  });

  it('renders event information correctly', () => {
    render(<EventCard event={mockEvent} />);
    
    expect(screen.getByText('Tech Conference 2023')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Organizador')).toBeInTheDocument();
    expect(screen.getByText('Público')).toBeInTheDocument();
    expect(screen.getByText('Ver Evento')).toBeInTheDocument();
  });

  it('shows private badge when event is not public', () => {
    const privateEvent = { ...mockEvent, isPublic: false };
    render(<EventCard event={privateEvent} />);
    
    expect(screen.getByText('Privado')).toBeInTheDocument();
    expect(screen.queryByText('Público')).not.toBeInTheDocument();
  });

  it('renders the correct button for regular users', () => {
    render(<EventCard event={mockEvent} />);
    
    const button = screen.getByRole('link', { name: /Ver Evento/i });
    expect(button).toHaveAttribute('href', '/event/1');
  });

  it('renders the correct button and link for event managers when showControls is true', () => {
    // Mock hasRole to return true for event-manager
    (require('../../../../features/auth/hooks/useAuth').useAuth.mockReturnValue({
      hasRole: (role: string) => role === 'event-manager',
    }));
    
    render(<EventCard event={mockEvent} showControls={true} />);
    
    const button = screen.getByRole('link', { name: /Gestionar evento/i });
    expect(button).toHaveAttribute('href', '/event/update/1');
    });

  it('does not show manager controls when showControls is false even if user is manager', () => {
    (require('../../../../features/auth/hooks/useAuth').useAuth.mockReturnValue({
      hasRole: (role: string) => role === 'event-manager',
    }));
    
    render(<EventCard event={mockEvent} showControls={false} />);
    
    expect(screen.getByText('Ver Evento')).toBeInTheDocument();
    expect(screen.queryByText('Gestionar evento')).not.toBeInTheDocument();
  });


  it('applies hover styles', () => {
    render(<EventCard event={mockEvent} />);
    
    const card = screen.getByTestId('event-card'); // You might need to add data-testid="event-card" to the root div
    expect(card).toHaveClass('hover:shadow-xl');
    
    const title = screen.getByText('Tech Conference 2023');
    expect(title).toHaveClass('group-hover:text-brand');
  });

  it('truncates long event names', () => {
    const longNameEvent = {
      ...mockEvent,
      name: 'Very Long Event Name That Should Be Truncated After Two Lines',
    };
    
    render(<EventCard event={longNameEvent} />);
    
    const title = screen.getByText(longNameEvent.name);
    expect(title).toHaveClass('line-clamp-2');
  });
});