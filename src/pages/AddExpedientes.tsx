import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

interface SubscriptionResult {
  iue: string;
  status: 'pending' | 'success' | 'error' | 'already-tracking';
  message?: string;
  expedienteInfo?: {
    caratula: string;
    origen: string;
  };
  canRetry?: boolean;
}

const AddExpedientes: React.FC = () => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<SubscriptionResult[]>([]);

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
          iue
        });

        if (response.success) {
          // Success case
          setResults(prev => prev.map((result, index) => 
            index === i ? {
              ...result,
              status: 'success',
              message: `Siguiendo ${response.data?.expediente.caratula?.replace(/<br\s*\/?>/gi, ' - ') || iue}`,
              expedienteInfo: {
                caratula: response.data?.expediente.caratula?.replace(/<br\s*\/?>/gi, ' - ') || '',
                origen: response.data?.expediente.origen || ''
              }
            } : result
          ));
        } else {
          // Handle different error types
          const errorMessage = response.error || 'Error desconocido';
          let status: SubscriptionResult['status'] = 'error';
          let displayMessage = errorMessage;
          let canRetry = false;

          // Check for "Already tracking" case
          if (errorMessage === 'Already tracking') {
            status = 'already-tracking';
            displayMessage = 'Ya estás siguiendo este expediente';
          }
          // Judicial system errors (no retry)
          else if (errorMessage === 'Expediente mantiene reserva') {
            displayMessage = 'Expediente reservado - No disponible en el sistema judicial';
          }
          else if (errorMessage === 'Expediente no encontrado en el sistema judicial') {
            displayMessage = 'Expediente no encontrado en el sistema judicial';
          }
          else if (errorMessage === 'Expediente no disponible') {
            displayMessage = 'Expediente no disponible en el sistema judicial';
          }
          // Retryable errors
          else if (errorMessage === 'Authentication error') {
            displayMessage = 'Error de autenticación - Inténtalo de nuevo';
            canRetry = true;
          }
          else if (errorMessage === 'IUE is required') {
            displayMessage = 'IUE requerido - Verifica que ingresaste un IUE válido';
            canRetry = true;
          }
          else if (errorMessage === 'Invalid IUE format') {
            displayMessage = 'Formato de IUE inválido - Verifica el formato del IUE';
            canRetry = true;
          }
          else if (errorMessage === 'Application error') {
            displayMessage = 'Error del servidor - Inténtalo de nuevo';
            canRetry = true;
          }
          else if (errorMessage === 'Failed to fetch' || errorMessage.includes('fetch')) {
            displayMessage = 'Error de conexión con el servidor - Inténtalo de nuevo';
            canRetry = true;
          }
          else if (errorMessage.includes('network') || errorMessage.includes('Network')) {
            displayMessage = 'Error de red - Inténtalo de nuevo';
            canRetry = true;
          }

          setResults(prev => prev.map((result, index) => 
            index === i ? {
              ...result,
              status,
              message: displayMessage,
              canRetry
            } : result
          ));
        }

        // Small delay for better UX
        if (i < iues.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        let errorMessage = 'Error del servidor - Inténtalo de nuevo';
        
        // Handle specific fetch errors
        if (error instanceof Error) {
          if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
            errorMessage = 'Error de conexión con el servidor - Inténtalo de nuevo';
          } else if (error.message.includes('network') || error.message.includes('Network')) {
            errorMessage = 'Error de red - Inténtalo de nuevo';
          }
        }
        
        setResults(prev => prev.map((result, index) => 
          index === i ? {
            ...result,
            status: 'error',
            message: errorMessage,
            canRetry: true
          } : result
        ));
      }
    }

    setIsProcessing(false);
  };

  const handleClear = () => {
    setInputText('');
    setResults([]);
  };

  const handleRetry = async (index: number) => {
    const result = results[index];
    if (!result.canRetry) return;

    // Set status back to pending
    setResults(prev => prev.map((r, i) => 
      i === index ? { ...r, status: 'pending' as const, message: undefined, canRetry: false } : r
    ));

    try {
      const response = await apiService.trackExpediente({
        iue: result.iue
      });

      if (response.success) {
        setResults(prev => prev.map((r, i) => 
          i === index ? {
            ...r,
            status: 'success' as const,
            message: `Siguiendo ${response.data?.expediente.caratula?.replace(/<br\s*\/?>/gi, ' - ') || result.iue}`,
            expedienteInfo: {
              caratula: response.data?.expediente.caratula?.replace(/<br\s*\/?>/gi, ' - ') || '',
              origen: response.data?.expediente.origen || ''
            }
          } : r
        ));
      } else {
        // Handle error (same logic as before)
        const errorMessage = response.error || 'Error desconocido';
        let status: SubscriptionResult['status'] = 'error';
        let displayMessage = errorMessage;
        let canRetry = false;

        if (errorMessage === 'Already tracking') {
          status = 'already-tracking';
          displayMessage = 'Ya estás siguiendo este expediente';
        }
        else if (errorMessage === 'Expediente mantiene reserva') {
          displayMessage = 'Expediente reservado - No disponible en el sistema judicial';
        }
        else if (errorMessage === 'Expediente no encontrado en el sistema judicial') {
          displayMessage = 'Expediente no encontrado en el sistema judicial';
        }
        else if (errorMessage === 'Expediente no disponible') {
          displayMessage = 'Expediente no disponible en el sistema judicial';
        }
        else if (errorMessage === 'Authentication error') {
          displayMessage = 'Error de autenticación - Inténtalo de nuevo';
          canRetry = true;
        }
        else if (errorMessage === 'IUE is required') {
          displayMessage = 'IUE requerido - Verifica que ingresaste un IUE válido';
          canRetry = true;
        }
        else if (errorMessage === 'Invalid IUE format') {
          displayMessage = 'Formato de IUE inválido - Verifica el formato del IUE';
          canRetry = true;
        }
        else if (errorMessage === 'Application error') {
          displayMessage = 'Error del servidor - Inténtalo de nuevo';
          canRetry = true;
        }
        else if (errorMessage === 'Failed to fetch' || errorMessage.includes('fetch')) {
          displayMessage = 'Error de conexión con el servidor - Inténtalo de nuevo';
          canRetry = true;
        }
        else if (errorMessage.includes('network') || errorMessage.includes('Network')) {
          displayMessage = 'Error de red - Inténtalo de nuevo';
          canRetry = true;
        }

        setResults(prev => prev.map((r, i) => 
          i === index ? {
            ...r,
            status,
            message: displayMessage,
            canRetry
          } : r
        ));
      }
    } catch (error) {
      let errorMessage = 'Error del servidor - Inténtalo de nuevo';
      
      // Handle specific fetch errors
      if (error instanceof Error) {
        if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
          errorMessage = 'Error de conexión con el servidor - Inténtalo de nuevo';
        } else if (error.message.includes('network') || error.message.includes('Network')) {
          errorMessage = 'Error de red - Inténtalo de nuevo';
        }
      }
      
      setResults(prev => prev.map((r, i) => 
        i === index ? {
          ...r,
          status: 'error' as const,
          message: errorMessage,
          canRetry: true
        } : r
      ));
    }
  };

  const getStatusIcon = (status: SubscriptionResult['status']) => {
    switch (status) {
      case 'pending':
        return <span style={{ color: '#f59e0b' }}>⏳</span>;
      case 'success':
        return <span style={{ color: '#65A30D' }}>✅</span>;
      case 'already-tracking':
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
      case 'already-tracking':
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
      case 'already-tracking':
        return '#65A30D';
      case 'error':
        return '#B91C1C';
    }
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    }}>
      {/* Page Header */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ color: '#1E40AF', margin: 0 }}>
            Agregar Expedientes
          </h1>
          <button
            onClick={() => navigate('/expedientes')}
            disabled={isProcessing}
            style={{
              padding: '0.5rem 1rem',
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
            Volver a expedientes
          </button>
        </div>
        <p style={{ color: '#475569', margin: 0, fontSize: '1rem' }}>
          Ingresa uno o más IUEs de expedientes para comenzar a seguirlos. Puedes pegar una lista completa y los procesaremos uno por uno.
        </p>
      </div>

      {/* Main Content Grid */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '2rem',
        minHeight: 0
      }}>
        {/* Form Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          padding: '2rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          height: 'fit-content'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '600',
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
                  height: '300px',
                  padding: '1rem',
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
              <p style={{ 
                color: '#6b7280', 
                fontSize: '0.75rem', 
                marginTop: '0.5rem',
                margin: '0.5rem 0 0 0'
              }}>
                Ingresa un IUE por línea
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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
                  transition: 'background-color 0.2s ease',
                  flex: 1,
                  minWidth: '140px'
                }}
              >
                {isProcessing ? 'Procesando...' : 'Agregar'}
              </button>
              
              <button
                type="button"
                onClick={handleClear}
                disabled={isProcessing}
                style={{
                  padding: '0.75rem 1rem',
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
            </div>
          </form>
        </div>

        {/* Results Section - Always Visible */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}>
          {/* Results Header */}
          <div style={{ 
            padding: '2rem 2rem 1rem 2rem',
            borderBottom: results.length > 0 ? '1px solid #e5e7eb' : 'none',
            flexShrink: 0
          }}>
            <h2 style={{ 
              color: '#1f2937', 
              margin: '0 0 1rem 0',
              fontSize: '1.25rem'
            }}>
              Resultados
            </h2>
            
            {/* Summary - Show only when there are results */}
            {results.length > 0 && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                display: 'flex',
                gap: '1.5rem',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <div>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total:</span>
                  <strong style={{ marginLeft: '0.5rem', color: '#1f2937' }}>{results.length}</strong>
                </div>
                <div>
                  <span style={{ color: '#65A30D', fontSize: '0.875rem' }}>Exitosos:</span>
                  <strong style={{ marginLeft: '0.5rem', color: '#65A30D' }}>
                    {results.filter(r => r.status === 'success' || r.status === 'already-tracking').length}
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#B91C1C', fontSize: '0.875rem' }}>Errores:</span>
                  <strong style={{ marginLeft: '0.5rem', color: '#B91C1C' }}>
                    {results.filter(r => r.status === 'error').length}
                  </strong>
                </div>
                {results.some(r => r.status === 'pending') && (
                  <div>
                    <span style={{ color: '#f59e0b', fontSize: '0.875rem' }}>Pendientes:</span>
                    <strong style={{ marginLeft: '0.5rem', color: '#f59e0b' }}>
                      {results.filter(r => r.status === 'pending').length}
                    </strong>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Results Content */}
          <div style={{
            flex: 1,
            padding: '1rem 2rem',
            minHeight: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {results.length === 0 ? (
              <div style={{ 
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '0.875rem'
              }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem',
                  opacity: 0.5
                }}>
                  📋
                </div>
                <p style={{ margin: '0 0 0.5rem 0' }}>
                  Los resultados aparecerán aquí
                </p>
                <p style={{ margin: 0, fontSize: '0.75rem' }}>
                  Ingresa expedientes en el formulario de la izquierda para comenzar
                </p>
              </div>
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {results.map((result, index) => (
                    <div 
                      key={index}
                      style={{
                        backgroundColor: getStatusColor(result.status),
                        border: `1px solid ${getStatusTextColor(result.status)}20`,
                        borderRadius: '6px',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ fontSize: '1.25rem', flexShrink: 0 }}>
                        {getStatusIcon(result.status)}
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
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
                            color: getStatusTextColor(result.status),
                            wordBreak: 'break-word'
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

                      {/* Retry Button */}
                      {result.canRetry && result.status !== 'pending' && (
                        <button
                          onClick={() => handleRetry(index)}
                          style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: '#1E40AF',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            flexShrink: 0,
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1E3A8A'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E40AF'}
                        >
                          Reintentar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons - Show only when processing is complete */}
          {results.length > 0 && !isProcessing && results.every(r => r.status !== 'pending') && (
            <div style={{ 
              padding: '1rem 2rem 2rem 2rem',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              gap: '1rem',
              flexShrink: 0,
              flexWrap: 'wrap'
            }}>
              {results.some(r => r.status === 'success' || r.status === 'already-tracking') && (
                <button
                  onClick={() => navigate('/expedientes')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#1E40AF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  Ver expedientes
                </button>
              )}
              <button
                onClick={handleClear}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Agregar más expedientes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddExpedientes;