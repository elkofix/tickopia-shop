import { render, screen } from '@testing-library/react'
import CreatePresentationPage from '../page'

// Mock Next.js useRouter - this is needed because UpdatePresentationForm uses it internally
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })),
}))

// Mock the UpdatePresentationForm component
jest.mock('../../../../../features/presentation/components/UpdatePresentationForm', () => {
  return function MockUpdatePresentationForm() {
    return <form data-testid="update-presentation-form">Update Presentation Form</form>
  }
})

describe('CreatePresentationPage (edit/[id]/page)', () => {

  it('renders the UpdatePresentationForm component', () => {
    render(<CreatePresentationPage />)
    
    expect(screen.getByTestId('update-presentation-form')).toBeInTheDocument()
  })

  it('renders the container div with correct classes', () => {
    render(<CreatePresentationPage />)
    const container = screen.getByTestId('update-presentation-form').parentElement
    expect(container).toHaveClass('max-w-xl', 'mx-auto', 'mt-10', 'p-4', 'border', 'rounded', 'shadow', 'space-y-6')
  })

  
})