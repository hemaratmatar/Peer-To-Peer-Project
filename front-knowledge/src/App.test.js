import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders the login form', () => {
  const { getByPlaceholderText } = render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );

  expect(getByPlaceholderText('Username')).toBeInTheDocument();
});
