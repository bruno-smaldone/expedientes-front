import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AddExpedienteModal from './AddExpedienteModal';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ 
        backgroundColor: '#1E40AF', 
        color: 'white', 
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
              Monitor de Expedientes
            </Link>
          </h1>
        </div>
        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            Dashboard
          </Link>
          <Link to="/expedientes" style={{ color: 'white', textDecoration: 'none' }}>
            Mis Expedientes
          </Link>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            style={{
              background: '#65A30D',
              border: 'none',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#54890B'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#65A30D'}
          >
            + Agregar Expedientes
          </button>
          <button 
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid white',
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </nav>
      </header>
      <main style={{ 
        flex: 1, 
        padding: '2rem',
        backgroundColor: '#F7F3E9'
      }}>
        <Outlet />
      </main>
      
      <AddExpedienteModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          // This could be expanded to refresh specific page data
          window.location.reload();
        }}
      />
    </div>
  );
};

export default Layout;