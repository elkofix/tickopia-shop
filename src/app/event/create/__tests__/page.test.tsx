import { render, screen } from '@testing-library/react';
import Page from '../page';

// Mock del componente CreateEventForm
jest.mock('../../../../features/events/components/CreateEventForm', () => {
  return function MockCreateEventForm() {
    return <div data-testid="create-event-form">Create Event Form</div>;
  };
});

describe('Page Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render successfully', async () => {
    const PageComponent = await Page();
    render(PageComponent);
    
    expect(screen.getByTestId('create-event-form')).toBeInTheDocument();
  });

  it('should render CreateEventForm component', async () => {
    const PageComponent = await Page();
    render(PageComponent);
    
    const createEventForm = screen.getByTestId('create-event-form');
    expect(createEventForm).toBeInTheDocument();
    expect(createEventForm).toHaveTextContent('Create Event Form');
  });

  it('should be an async function that returns JSX', async () => {
    const result = Page();
    expect(result).toBeInstanceOf(Promise);
    
    const resolvedComponent = await result;
    expect(resolvedComponent).toBeDefined();
  });
});

// Pruebas de integración adicionales si necesitas verificar props o comportamiento específico
describe('Page Integration Tests', () => {
  it('should pass correct props to CreateEventForm if any', async () => {
    // Si tu CreateEventForm acepta props en el futuro, puedes verificarlas aquí
    const PageComponent = await Page();
    render(PageComponent);
    
    // Ejemplo de verificación de props (ajusta según tus necesidades)
    expect(screen.getByTestId('create-event-form')).toBeInTheDocument();
  });
});

// Si estás usando Next.js App Router, también podrías querer estas pruebas
describe('Page Metadata and Structure', () => {
  it('should export default function', () => {
    expect(typeof Page).toBe('function');
  });

  it('should be an async function', () => {
    const result = Page();
    expect(result).toBeInstanceOf(Promise);
  });
});