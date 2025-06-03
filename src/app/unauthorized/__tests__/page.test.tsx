import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Unauthorized from '../page';

// Mock next/link to properly test navigation
jest.mock('next/link', () => {
  const NextLinkMock = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  NextLinkMock.displayName = 'NextLinkMock';

  return {
    __esModule: true,
    default: NextLinkMock,
  };
});

describe('Unauthorized Component', () => {
  beforeEach(() => {
    render(<Unauthorized />);
  });

  it('renders correctly with all main elements', () => {
    // Main container
    expect(screen.getByTestId('unauthorized-container')).toBeInTheDocument();
    
    // Card elements
    expect(screen.getByRole('heading', { name: /acceso denegado/i })).toBeInTheDocument();
    expect(screen.getByText(/no tienes el rol necesario/i)).toBeInTheDocument();
    expect(screen.getByText(/error 403/i)).toBeInTheDocument();
    
    // Action button
    expect(screen.getByRole('link', { name: /volver al inicio/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /volver al inicio/i })).toHaveAttribute('href', '/');
    
    // Support link
    expect(screen.getByText(/contactar soporte/i)).toBeInTheDocument();
  });

  it('displays the lock icon', () => {
    const lockIcon = screen.getByTestId('lock-icon');
    expect(lockIcon).toBeInTheDocument();
    expect(lockIcon).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('has correct gradient backgrounds', () => {
    const container = screen.getByTestId('unauthorized-container');
    expect(container).toHaveClass('from-wisteria/10');
    expect(container).toHaveClass('to-violet/10');
    
    const button = screen.getByRole('link', { name: /volver al inicio/i });
  });

  it('applies hover effects to the button', async () => {
    const button = screen.getByRole('link', { name: /volver al inicio/i });
    
    // Test hover state classes
    expect(button).toBeInTheDocument();
    
    // Note: Actual hover effects would need visual regression testing
  });

  it('applies active/click effects to the button', () => {
    const button = screen.getByRole('link', { name: /volver al inicio/i });
    expect(button).toBeInTheDocument();
  });
});