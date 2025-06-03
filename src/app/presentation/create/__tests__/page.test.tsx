import { render, screen } from '@testing-library/react'
import CreatePresentationPage from '../page'



// Mock the PresentationCreateForm to isolate the test
jest.mock('../../../../features/presentation/components/PresentationCreateForm', () => () => (
  <form data-testid="presentation-create-form"></form>
))

describe('CreatePresentationPage', () => {
  it('renders the heading', () => {
    render(<CreatePresentationPage />)
    expect(screen.getByRole('heading', { name: /crear presentación/i })).toBeInTheDocument()
  })

  it('renders the PresentationCreateForm component', () => {
    render(<CreatePresentationPage />)
    expect(screen.getByTestId('presentation-create-form')).toBeInTheDocument()
  })

  it('matches snapshot', () => {
    const { asFragment } = render(<CreatePresentationPage />)
    expect(asFragment()).toMatchSnapshot()
  })
})
