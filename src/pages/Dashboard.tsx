import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import type { DashboardSummaryResponse } from '../types/api';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{text: string, x: number, y: number} | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDashboardSummary();
      
      if (response.success && response.data) {
        setDashboardData(response.data);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Helper function to extract decreto text from various formats
  const getDecretoText = (decretoText: string | { attributes?: Record<string, unknown>; $value: string }): string => {
    if (typeof decretoText === 'string') {
      return decretoText;
    }
    if (decretoText && typeof decretoText === 'object' && decretoText.$value) {
      return decretoText.$value;
    }
    return 'No content available';
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const [day, month, year] = dateString.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('es-UY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to format refresh timestamp
  const formatRefreshTime = (timestamp: string | null) => {
    if (!timestamp) return 'No disponible';
    const date = new Date(timestamp);
    const today = new Date();
    
    // Check if the date is today
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      // Show "Today, " + 24-hour time
      const timeString = date.toLocaleTimeString('es-UY', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      return `Hoy, ${timeString}`;
    } else {
      // Show full date and 24-hour time
      return date.toLocaleDateString('es-UY', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        backgroundColor: '#ffebee', 
        color: '#c62828', 
        padding: '1rem', 
        borderRadius: '4px',
        margin: '1rem 0'
      }}>
        Error: {error}
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#1E40AF', marginBottom: '0.5rem' }}>¡Hola {user?.username}!</h1>
        <p style={{ color: '#475569', margin: 0 }}>
          Resumen de la actividad de tus expedientes
        </p>
      </div>

      {/* Summary Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Total Expedientes */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1E40AF', marginBottom: '0.5rem' }}>
            {dashboardData.totalExpedientes}
          </div>
          <div style={{ color: '#333', fontWeight: '500', marginBottom: '1rem' }}>
            Expedientes siendo trackeados
          </div>
          <Link 
            to="/expedientes?sortBy=lastActivity"
            style={{
              color: '#1E40AF',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            ver expedientes →
          </Link>
        </div>

        {/* With New Movements */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#B91C1C', marginBottom: '0.5rem' }}>
            {dashboardData.expedientesWithNewMovements}
          </div>
          <div style={{ color: '#333', fontWeight: '500', marginBottom: '1rem' }}>
            Expedientes con nuevos movimientos
          </div>
          <Link 
            to="/expedientes?view=movements-first"
            style={{
              color: '#B91C1C',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            ver expedientes →
          </Link>
        </div>

        {/* With Unread Decretos */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#B91C1C', marginBottom: '0.5rem' }}>
            {dashboardData.expedientesWithNewDecretos}
          </div>
          <div style={{ color: '#333', fontWeight: '500', marginBottom: '1rem' }}>
            Expedientes con decretos no leídos
          </div>
          <Link 
            to="/expedientes?view=decretos-first"
            style={{
              color: '#B91C1C',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            ver expedientes →
          </Link>
        </div>

        {/* Last Refresh */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#65A30D', marginBottom: '0.5rem' }}>
            {formatRefreshTime(dashboardData.lastAutomaticSyncDate)}
          </div>
          <div style={{ color: '#333', fontWeight: '500' }}>
            Última fecha de actualización
          </div>
        </div>
      </div>

      {/* Recent Decretos Table */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#1E40AF', marginBottom: '1.5rem' }}>
          Decretos que no leiste
        </h2>
        
        {dashboardData.newDecretos.length === 0 ? (
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: '3rem',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#666'
          }}>
            No hay decretos sin leer.
          </div>
        ) : (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>
                    Expediente ID
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>
                    Nombre
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>
                    Decreto ID
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>
                    Fecha
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>
                    Contenido
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.newDecretos.map((decreto, index) => (
                  <tr key={`${decreto.expedienteId}-${decreto.movementSk}`} style={{
                    backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                    borderBottom: '1px solid #e0e0e0'
                  }}>
                    <td style={{ padding: '1rem' }}>
                      <Link 
                        to={`/expedientes/${encodeURIComponent(decreto.expedienteId)}`}
                        style={{
                          color: '#1E40AF',
                          textDecoration: 'none',
                          fontWeight: 'bold',
                          fontSize: '0.9rem'
                        }}
                      >
                        {decreto.expedienteId}
                      </Link>
                    </td>
                    <td style={{ padding: '1rem', maxWidth: '250px' }}>
                      <div 
                        style={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '0.875rem',
                          cursor: 'help',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({
                            text: `Carátula completa: ${decreto.expedienteCaratula.replace(/<br\s*\/?>/gi, ' - ')}`,
                            x: rect.left,
                            y: rect.bottom + 5
                          });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        {decreto.expedienteCaratula.replace(/<br\s*\/?>/gi, ' - ')}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 'bold' }}>
                      {decreto.decretoId}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                      {formatDate(decreto.decretoDate)}
                    </td>
                    <td style={{ padding: '1rem', maxWidth: '300px' }}>
                      <div 
                        style={{ 
                          fontSize: '0.8rem',
                          lineHeight: '1.4',
                          maxHeight: '4rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          cursor: 'help',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({
                            text: `Decreto completo: ${getDecretoText(decreto.decretoText)}`,
                            x: rect.left,
                            y: rect.bottom + 5
                          });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        {getDecretoText(decreto.decretoText).substring(0, 200)}...
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Link
                        to={`/expedientes/${encodeURIComponent(decreto.expedienteId)}`}
                        style={{
                          backgroundColor: '#1E40AF',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          display: 'inline-block'
                        }}
                      >
                        Ver todo
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Custom Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            backgroundColor: '#333',
            color: 'white',
            padding: '0.5rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            maxWidth: '400px',
            wordWrap: 'break-word',
            zIndex: 9999,
            pointerEvents: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default Dashboard;