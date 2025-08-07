import React from 'react';

interface UntrackConfirmModalProps {
  isOpen: boolean;
  expedienteIue: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const UntrackConfirmModal: React.FC<UntrackConfirmModalProps> = ({
  isOpen,
  expedienteIue,
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}
        onClick={onCancel}
      >
        {/* Modal Content */}
        <div 
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            width: '100%',
            maxWidth: '500px',
            padding: '2rem'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '1.5rem',
            fontSize: '3rem'
          }}>
            ⚠️
          </div>

          {/* Title */}
          <h2 style={{ 
            color: '#1E40AF', 
            textAlign: 'center',
            margin: '0 0 1rem 0',
            fontSize: '1.5rem'
          }}>
            Dejar de seguir expediente
          </h2>

          {/* Expediente Info */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#64748b',
              marginBottom: '0.25rem'
            }}>
              Expediente:
            </div>
            <div style={{ 
              fontWeight: '600',
              color: '#1f2937',
              fontSize: '1rem'
            }}>
              {expedienteIue}
            </div>
          </div>

          {/* Warning Message */}
          <p style={{ 
            color: '#475569', 
            textAlign: 'center',
            margin: '0 0 2rem 0',
            fontSize: '1rem',
            lineHeight: '1.5'
          }}>
            Ya no vas a recibir notificaciones de este expediente en tu correo.
          </p>

          {/* Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem',
            justifyContent: 'center'
          }}>
            <button
              onClick={onCancel}
              disabled={isLoading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'transparent',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Cancelar
            </button>
            
            <button
              onClick={onConfirm}
              disabled={isLoading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: isLoading ? '#9ca3af' : '#B91C1C',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease',
                minWidth: '140px'
              }}
            >
              {isLoading ? 'Procesando...' : 'Dejar de seguir'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UntrackConfirmModal;