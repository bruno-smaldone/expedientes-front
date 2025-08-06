import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiService from '../services/api';
import type { ExpedienteDetailResponse, Movement } from '../types/api';

const ExpedienteDetail: React.FC = () => {
  const { iue } = useParams<{ iue: string }>();
  const [expedienteDetail, setExpedienteDetail] = useState<ExpedienteDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpedienteDetail = async () => {
      if (!iue) {
        setError('Invalid IUE parameter');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.getExpediente(decodeURIComponent(iue), {
          includeMovements: true
        });
        
        if (response.success && response.data) {
          setExpedienteDetail(response.data);
          setError(null);
        } else {
          setError(response.error || 'Failed to fetch expediente details');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchExpedienteDetail();
  }, [iue]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-UY', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to extract decreto text from various formats
  const getDecretoText = (decretoText: string | { attributes?: any; $value: string } | undefined): string => {
    if (!decretoText) return 'No content available';
    if (typeof decretoText === 'string') {
      return decretoText;
    }
    if (decretoText && typeof decretoText === 'object' && decretoText.$value) {
      return decretoText.$value;
    }
    return 'No content available';
  };

  const formatMovementDate = (dateString: string) => {
    const [day, month, year] = dateString.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('es-UY', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMovementTypeColor = (tipo: string) => {
    if (tipo.toLowerCase().includes('decreto')) {
      return { bg: '#e8f5e8', text: '#2e7d32' };
    }
    if (tipo.toLowerCase().includes('mesa')) {
      return { bg: '#fff3e0', text: '#f57c00' };
    }
    if (tipo.toLowerCase().includes('presentación')) {
      return { bg: '#e3f2fd', text: '#1976d2' };
    }
    if (tipo.toLowerCase().includes('audiencia')) {
      return { bg: '#f3e5f5', text: '#7b1fa2' };
    }
    return { bg: '#f5f5f5', text: '#666' };
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>Loading expediente details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div style={{ 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          padding: '1rem', 
          borderRadius: '4px',
          margin: '1rem 0'
        }}>
          Error: {error}
        </div>
        <Link to="/expedientes" style={{ color: '#1976d2', textDecoration: 'none' }}>
          ← Back to Expedientes List
        </Link>
      </div>
    );
  }

  if (!expedienteDetail) {
    return (
      <div>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          Expediente not found
        </div>
        <Link to="/expedientes" style={{ color: '#1976d2', textDecoration: 'none' }}>
          ← Back to Expedientes List
        </Link>
      </div>
    );
  }

  const { expediente, movements, unreadCount, hasNewDecretos } = expedienteDetail;

  return (
    <div>
      {/* Navigation */}
      <div style={{ marginBottom: '1rem' }}>
        <Link 
          to="/expedientes" 
          style={{ 
            color: '#1976d2', 
            textDecoration: 'none',
            fontSize: '0.875rem'
          }}
        >
          ← Back to Expedientes List
        </Link>
      </div>

      {/* Expediente Header */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', color: '#1976d2' }}>
              {expediente.iue}
            </h1>
            <h2 
              style={{ margin: '0 0 1rem 0', color: '#333', fontWeight: 'normal' }}
              dangerouslySetInnerHTML={{ 
                __html: expediente.caratula.replace(/<br>/g, '<br/>') 
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {hasNewDecretos && (
              <span style={{
                backgroundColor: '#4caf50',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                NEW DECRETOS
              </span>
            )}
            {unreadCount > 0 && (
              <span style={{
                backgroundColor: '#ff9800',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '16px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {unreadCount} unread
              </span>
            )}
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
              Origin
            </div>
            <div style={{ fontWeight: 'bold' }}>{expediente.origen}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
              Status
            </div>
            <div style={{
              backgroundColor: '#e8f5e8',
              color: '#2e7d32',
              padding: '0.25rem 0.75rem',
              borderRadius: '16px',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              display: 'inline-block'
            }}>
              {expediente.estado}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
              Total Movements
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#1976d2' }}>
              {expediente.movementCount}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
              Total Decretos
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#7b1fa2' }}>
              {expediente.decretoCount}
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.875rem', color: '#666' }}>
          Last updated: {formatDate(expediente.updatedAt)}
        </div>
      </div>

      {/* Movements Timeline */}
      <div>
        <h2 style={{ color: '#333', marginBottom: '1.5rem' }}>
          Movement History ({movements.length} total)
        </h2>

        {movements.length === 0 ? (
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: '2rem',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#666'
          }}>
            No movements found for this expediente.
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Timeline line */}
            <div style={{
              position: 'absolute',
              left: '2rem',
              top: '1rem',
              bottom: '1rem',
              width: '2px',
              backgroundColor: '#e0e0e0'
            }} />

            {movements
              .sort((a, b) => {
                // Sort by date in ascending order (oldest first)
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return dateA.getTime() - dateB.getTime();
              })
              .map((movement, index) => {
              const colors = getMovementTypeColor(movement.tipo);
              const isDecreto = movement.decretoNumber;
              
              return (
                <div key={movement.sk} style={{
                  position: 'relative',
                  marginBottom: '2rem',
                  paddingLeft: '4rem'
                }}>
                  {/* Timeline dot */}
                  <div style={{
                    position: 'absolute',
                    left: '1.25rem',
                    top: '0.75rem',
                    width: '1.5rem',
                    height: '1.5rem',
                    backgroundColor: colors.text,
                    borderRadius: '50%',
                    border: '4px solid white',
                    boxShadow: '0 0 0 2px #e0e0e0'
                  }} />

                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: isDecreto ? '2px solid #7b1fa2' : '1px solid #e0e0e0'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '1rem'
                    }}>
                      <div>
                        <div style={{
                          backgroundColor: colors.bg,
                          color: colors.text,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '16px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          display: 'inline-block',
                          marginBottom: '0.5rem'
                        }}>
                          {movement.tipo}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#666' }}>
                          {formatMovementDate(movement.fecha)} • {movement.sede}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {isDecreto && (
                          <div style={{
                            backgroundColor: '#7b1fa2',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            marginBottom: '0.25rem'
                          }}>
                            DECRETO #{movement.decretoNumber}
                          </div>
                        )}
                        {movement.vencimiento && (
                          <div style={{ fontSize: '0.75rem', color: '#f57c00' }}>
                            Due: {movement.vencimiento}
                          </div>
                        )}
                      </div>
                    </div>

                    {isDecreto && (
                      <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '1rem',
                        borderRadius: '4px',
                        borderLeft: '4px solid #7b1fa2'
                      }}>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: 'bold', 
                          marginBottom: '0.5rem',
                          color: '#7b1fa2'
                        }}>
                          Decreto Content:
                        </div>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          lineHeight: '1.5',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {movement.isReserved ? (
                            <em style={{ color: '#666' }}>
                              [Reserved decreto - content not available]
                            </em>
                          ) : (
                            getDecretoText(movement.decretoText)
                          )}
                        </div>
                      </div>
                    )}

                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#999', 
                      marginTop: '0.5rem',
                      textAlign: 'right'
                    }}>
                      Added: {formatDate(movement.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpedienteDetail;