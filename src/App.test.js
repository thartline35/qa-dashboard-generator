import { render, screen } from '@testing-library/react';
import App from './App';

test('renders QA Dashboard Generator', () => {
  render(<App />);
  const headingElement = screen.getByText(/QA Dashboard Generator/i);
  expect(headingElement).toBeInTheDocument();
});
