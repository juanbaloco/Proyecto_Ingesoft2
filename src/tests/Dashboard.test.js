import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Dashboard } from '../components/Dashboard';
import { logoutAuth } from '../store/thunks/logout';
import { clearCdtState } from '../store/slices/cdtSlice';


jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));
jest.mock('../store/thunks/logout', () => ({
  logoutAuth: jest.fn(() => ({ type: 'auth/logoutAuth' })),
}));
jest.mock('../store/slices/cdtSlice', () => ({
  clearCdtState: jest.fn(() => ({ type: 'cdt/clearCdtState' })),
}));

jest.mock('../components/ListaCDT', () => ({
  ListaCDT: () => <div>ListaCDT Mock</div>,
}));
jest.mock('../components/FormularioCDT', () => ({
  FormularioCDT: () => <div>FormularioCDT Mock</div>,
}));

describe('Dashboard Component - handleLogout', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    useDispatch.mockReturnValue(mockDispatch);

    useNavigate.mockReturnValue(jest.fn());

    useSelector.mockImplementation((selector) => selector({
      auth: { status: 'authenticated', displayName: 'Test User', uid: '123' },
      cdt: { solicitudes: [{}, {}] },
    }));
  });

  test('handleLogout debe despachar clearCdtState y luego logoutAuth', () => {
    render(<Dashboard />);

    const logoutButton = screen.getByRole('button', { name: /Cerrar Sesión/i });
    fireEvent.click(logoutButton);

    expect(clearCdtState).toHaveBeenCalledTimes(1);
    
    expect(logoutAuth).toHaveBeenCalledTimes(1);

    expect(mockDispatch).toHaveBeenCalledTimes(2);

    const clearAction = clearCdtState();
    const logoutAction = logoutAuth();

    expect(mockDispatch).toHaveBeenCalledWith(clearAction);
    
    expect(mockDispatch).toHaveBeenCalledWith(logoutAction);
    
    expect(mockDispatch.mock.calls[0][0].type).toBe(clearAction.type); 
    expect(mockDispatch.mock.calls[1][0].type).toBe(logoutAction.type);
  });
});
