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

interface ExpedienteSubscriptionProps {
  onSuccess?: () => void; // Callback to refresh dashboard data
}

const ExpedienteSubscription: React.FC<ExpedienteSubscriptionProps> = ({ onSuccess }) => {
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

        // Small delay for better UX (optional)
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
    
    // Call success callback if any expedientes were successfully added
    const successCount = results.filter(r => r.status === 'success').length;
    if (successCount > 0 && onSuccess) {
      onSuccess();
    }
  };

  const handleClear = () => {
    setInputText('');
    setResults([]);
  };

  const getStatusIcon = (status: SubscriptionResult['status']) => {
    switch (status) {
      case 'pending':
        return <span style={{ color: '#ff9800' }}>⏳</span>;
      case 'success':
        return <span style={{ color: '#4caf50' }}>✅</span>;
      case 'error':
        return <span style={{ color: '#f44336' }}>❌</span>;
    }
  };

  const getStatusColor = (status: SubscriptionResult['status']) => {
    switch (status) {
      case 'pending':
        return '#fff3e0';
      case 'success':
        return '#ecfccb';
      case 'error':
        return '#ffebee';
    }
  };

  const getStatusTextColor = (status: SubscriptionResult['status']) => {
    switch (status) {
      case 'pending':
        return '#f57c00';
      case 'success':
        return '#65A30D';
      case 'error':
        return '#c62828';
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '2rem',
      marginBottom: '2rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#1E40AF', marginBottom: '0.5rem' }}>
          Agregar expedientes
        </h2>
        <p style={{ color: '#666', margin: 0 }}>
          Ingresa uno o más IUEs de expedientes para comenzar a seguirlos (uno por línea)
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '500',
            color: '#333'
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
              minHeight: '120px',
              padding: '0.875rem',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              resize: 'vertical',
              boxSizing: 'border-box',
              backgroundColor: isProcessing ? '#f5f5f5' : 'white',
              color: '#333'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={isProcessing || !inputText.trim()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: isProcessing || !inputText.trim() ? '#ccc' : '#1E40AF',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
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
              color: '#666',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
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

      {results.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ color: '#333', marginBottom: '1rem' }}>
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
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div style={{ fontSize: '1.25rem' }}>
                  {getStatusIcon(result.status)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: getStatusTextColor(result.status),
                    marginBottom: '0.25rem'
                  }}>
                    {result.iue}
                  </div>
                  
                  {result.message && (
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: getStatusTextColor(result.status)
                    }}>
                      {result.message}
                    </div>
                  )}
                  
                  {result.expedienteInfo && (
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#666',
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
  );
};

export default ExpedienteSubscription;