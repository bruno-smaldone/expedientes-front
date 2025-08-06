import React, { useState } from 'react';
import apiService from '../services/api';

interface SubscriptionResult {
  iue: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  expedienteInfo?: {
    caratula: string;
    origen: string;
  };
}

interface AddExpedienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Callback to refresh dashboard data
}

const AddExpedienteModal: React.FC<AddExpedienteModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<SubscriptionResult[]>([]);

  const handleClose = () => {
    if (!isProcessing) {
      setInputText('');
      setResults([]);
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;

    const iues = inputText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (iues.length === 0) return;

    setIsProcessing(true);
    setResults([]);

    // Initialize results with pending status
    const initialResults: SubscriptionResult[] = iues.map(iue => ({
      iue,
      status: 'pending'
    }));
    setResults(initialResults);

    // Process each IUE individually
    for (let i = 0; i < iues.length; i++) {
      const iue = iues[i];
      
      try {
        const response = await apiService.trackExpediente({
          iue,
          notificationPreferences: {
            movementTypes: ['DECRETO', 'Mesa De Giro'],
            channels: ['email'],
            enabled: true
          }
        });

        setResults(prev => prev.map((result, index) => 
          index === i ? {
            ...result,
            status: response.success ? 'success' : 'error',
            message: response.success 
              ? `Siguiendo ${response.data?.expediente.caratula?.replace(/<br\s*\/?>/gi, ' - ') || iue}`
              : response.error || 'Error al seguir expediente',
            expedienteInfo: response.success ? {
              caratula: response.data?.expediente.caratula?.replace(/<br\s*\/?>/gi, ' - ') || '',
              origen: response.data?.expediente.origen || ''
            } : undefined
          } : result
        ));

        // Small delay for better UX
        if (i < iues.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
        setResults(prev => prev.map((result, index) => 
          index === i ? {
            ...result,
            status: 'error',
            message: 'Error de conexión'
          } : result
        ));
      }
    }

    setIsProcessing(false);
    
    // Use a timeout to ensure state is updated before checking results
    setTimeout(() => {
      setResults(currentResults => {
        const successCount = currentResults.filter(r => r.status === 'success').length;
        if (successCount > 0 && onSuccess) {
          onSuccess();
        }
        return currentResults;
      });
    }, 100);
  };

  const handleClear = () => {
    setInputText('');
    setResults([]);
  };

  const getStatusIcon = (status: SubscriptionResult['status']) => {
    switch (status) {
      case 'pending':
        return <span style={{ color: '#f59e0b' }}>⏳</span>;
      case 'success':
        return <span style={{ color: '#65A30D' }}>✅</span>;
      case 'error':
        return <span style={{ color: '#B91C1C' }}>❌</span>;
    }
  };

  const getStatusColor = (status: SubscriptionResult['status']) => {
    switch (status) {
      case 'pending':
        return '#fef3c7';
      case 'success':
        return '#ecfccb';
      case 'error':
        return '#fef2f2';
    }
  };

  const getStatusTextColor = (status: SubscriptionResult['status']) => {
    switch (status) {
      case 'pending':
        return '#d97706';
      case 'success':
        return '#65A30D';
      case 'error':
        return '#B91C1C';
    }
  };

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
        onClick={handleClose}
      >
        {/* Modal Content */}
        <div 
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div style={{
            padding: '2rem 2rem 0 2rem',
            borderBottom: results.length > 0 ? '1px solid #e5e7eb' : 'none'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ color: '#1E40AF', marginBottom: '0.5rem', margin: 0 }}>
                  Agregar expedientes
                </h2>
                <p style={{ color: '#475569', margin: 0, fontSize: '0.9rem' }}>
                  Ingresa uno o más IUEs de expedientes para comenzar a seguirlos
                </p>
              </div>
              <button
                onClick={handleClose}
                disabled={isProcessing}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  color: '#6b7280',
                  padding: '0.25rem',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Cerrar"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '500',
                  color: '#1f2937',
                  fontSize: '0.875rem'
                }}>
                  IUEs de Expedientes
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ejemplo:&#10;40-21/2025&#10;50-15/2024&#10;60-30/2025"
                  disabled={isProcessing}
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '0.875rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    backgroundColor: isProcessing ? '#f9fafb' : 'white',
                    color: '#1f2937'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', paddingBottom: '1.5rem' }}>
                <button
                  type="submit"
                  disabled={isProcessing || !inputText.trim()}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: isProcessing || !inputText.trim() ? '#9ca3af' : '#1E40AF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: isProcessing || !inputText.trim() ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  {isProcessing ? 'Procesando...' : 'Agregar'}
                </button>
                
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isProcessing}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'transparent',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Limpiar
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isProcessing}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'transparent',
                    color: '#6b7280',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    marginLeft: 'auto'
                  }}
                >
                  Cerrar
                </button>
              </div>
            </form>
          </div>

          {/* Results Section */}
          {results.length > 0 && (
            <div style={{
              padding: '1.5rem 2rem 2rem 2rem',
              maxHeight: '400px',
              overflowY: 'auto',
              borderTop: '1px solid #e5e7eb'
            }}>
              <h3 style={{ 
                color: '#1f2937', 
                marginBottom: '1rem', 
                margin: '0 0 1rem 0',
                fontSize: '1rem'
              }}>
                Resultados ({results.filter(r => r.status === 'success').length} exitosos, {results.filter(r => r.status === 'error').length} errores)
              </h3>
              
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {results.map((result, index) => (
                  <div 
                    key={index}
                    style={{
                      backgroundColor: getStatusColor(result.status),
                      border: `1px solid ${getStatusTextColor(result.status)}20`,
                      borderRadius: '4px',
                      padding: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.875rem'
                    }}
                  >
                    <div style={{ fontSize: '1rem' }}>
                      {getStatusIcon(result.status)}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: '600', 
                        color: getStatusTextColor(result.status),
                        marginBottom: '0.25rem',
                        fontSize: '0.875rem'
                      }}>
                        {result.iue}
                      </div>
                      
                      {result.message && (
                        <div style={{ 
                          fontSize: '0.8rem', 
                          color: getStatusTextColor(result.status)
                        }}>
                          {result.message}
                        </div>
                      )}
                      
                      {result.expedienteInfo && (
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: '#6b7280',
                          marginTop: '0.25rem'
                        }}>
                          {result.expedienteInfo.origen}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AddExpedienteModal;