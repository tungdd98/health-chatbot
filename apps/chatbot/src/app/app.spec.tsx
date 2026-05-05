import { render } from '@testing-library/react';

import App from './App';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App />);
    expect(baseElement).toBeInTheDocument();
  });

  it('should render the chatbot shell', async () => {
    const { findByText } = render(<App />);
    expect(await findByText('Health Chatbot')).toBeInTheDocument();
  });
});
