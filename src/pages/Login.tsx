import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const location = useLocation();

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor ingresa usuario y contraseña');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await login({ username: username.trim(), password });

    if (!result.success) {
      setError(result.error || 'Error de inicio de sesión');
    }
    setIsLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F7F3E9',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        width: '100%',
        maxWidth: '450px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ 
            color: '#1E40AF', 
            margin: '0 0 0.5rem 0',
            fontSize: '2.5rem',
            fontWeight: '600'
          }}>
            Cicero
          </h1>
          <p style={{ 
            color: '#475569', 
            margin: 0,
            fontSize: '1.1rem'
          }}>
            Inicia sesión en tu cuenta
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <label htmlFor="username" style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500',
              color: '#1f2937',
              fontSize: '0.9rem'
            }}>
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem',
                boxSizing: 'border-box',
                backgroundColor: 'white',
                color: '#1f2937',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
              }}
              disabled={isLoading}
              autoComplete="username"
              onFocus={(e) => {
                e.target.style.borderColor = '#1E40AF';
                e.target.style.boxShadow = '0 0 0 2px rgba(30, 64, 175, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <label htmlFor="password" style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500',
              color: '#1f2937',
              fontSize: '0.9rem'
            }}>
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem',
                boxSizing: 'border-box',
                backgroundColor: 'white',
                color: '#1f2937',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
              }}
              disabled={isLoading}
              autoComplete="current-password"
              onFocus={(e) => {
                e.target.style.borderColor = '#1E40AF';
                e.target.style.boxShadow = '0 0 0 2px rgba(30, 64, 175, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              padding: '0.875rem',
              borderRadius: '6px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              textAlign: 'left',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.875rem 1.5rem',
              backgroundColor: isLoading ? '#ccc' : '#1E40AF',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              minHeight: '3rem'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#1d4ed8';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#1E40AF';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;