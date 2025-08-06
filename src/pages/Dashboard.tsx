import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import type { DashboardSummaryResponse, RecentDecreto } from '../types/api';

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const getDecretoText = (decretoText: string | { attributes?: any; $value: string }): string => {
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
    return date.toLocaleDateString('es-UY', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <h1 style={{ color: '#1976d2', marginBottom: '0.5rem' }}>Dashboard</h1>
        <p style={{ color: '#666', margin: 0 }}>
          Overview of your expedientes activity
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
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1976d2', marginBottom: '0.5rem' }}>
            {dashboardData.totalExpedientes}
          </div>
          <div style={{ color: '#333', fontWeight: '500', marginBottom: '1rem' }}>
            Expedientes siendo trackeados
          </div>
          <Link 
            to="/expedientes?sortBy=lastActivity"
            style={{
              color: '#1976d2',
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
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#f57c00', marginBottom: '0.5rem' }}>
            {dashboardData.expedientesWithNewMovements}
          </div>
          <div style={{ color: '#333', fontWeight: '500', marginBottom: '1rem' }}>
            Expedientes con nuevos movimientos
          </div>
          <Link 
            to="/expedientes?sortBy=hasNewMovements"
            style={{
              color: '#f57c00',
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
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#7b1fa2', marginBottom: '0.5rem' }}>
            {dashboardData.expedientesWithUnreadDecretos}
          </div>
          <div style={{ color: '#333', fontWeight: '500', marginBottom: '1rem' }}>
            Expedientes con decretos no leídos
          </div>
          <Link 
            to="/expedientes?filter=unreadDecretos"
            style={{
              color: '#7b1fa2',
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
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4caf50', marginBottom: '0.5rem' }}>
            {formatRefreshTime(dashboardData.lastRefreshTimestamp)}
          </div>
          <div style={{ color: '#333', fontWeight: '500' }}>
            Última fecha de actualización
          </div>
        </div>
      </div>

      {/* Recent Decretos Table */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#333', marginBottom: '1.5rem' }}>
          Decretos de los últimos 7 días
        </h2>
        
        {dashboardData.recentDecretos.length === 0 ? (
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: '3rem',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#666'
          }}>
            No hay decretos nuevos en los últimos 7 días.
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
                {dashboardData.recentDecretos.map((decreto, index) => (
                  <tr key={`${decreto.expedienteId}-${decreto.movementSk}`} style={{
                    backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                    borderBottom: '1px solid #e0e0e0'
                  }}>
                    <td style={{ padding: '1rem' }}>
                      <Link 
                        to={`/expedientes/${encodeURIComponent(decreto.expedienteId)}`}
                        style={{
                          color: '#1976d2',
                          textDecoration: 'none',
                          fontWeight: 'bold',
                          fontSize: '0.9rem'
                        }}
                      >
                        {decreto.expedienteId}
                      </Link>
                    </td>
                    <td style={{ padding: '1rem', maxWidth: '250px' }}>
                      <div style={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: '0.875rem'
                      }}
                      dangerouslySetInnerHTML={{ 
                        __html: decreto.expedienteCaratula.replace(/<br>/g, ' ') 
                      }}
                      />
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 'bold' }}>
                      {decreto.decretoId}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                      {formatDate(decreto.decretoDate)}
                    </td>
                    <td style={{ padding: '1rem', maxWidth: '300px' }}>
                      <div style={{ 
                        fontSize: '0.8rem',
                        lineHeight: '1.4',
                        maxHeight: '4rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {getDecretoText(decreto.decretoText).substring(0, 200)}...
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          // TODO: Implement mark as read functionality
                          console.log('Mark as read:', decreto.expedienteId, decreto.movementSk);
                        }}
                        style={{
                          backgroundColor: '#4caf50',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}
                      >
                        Marcar como visto
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;