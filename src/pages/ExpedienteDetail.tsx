import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import type { ExpedienteDetailResponse } from '../types/api';
import UntrackConfirmModal from '../components/UntrackConfirmModal';

const ExpedienteDetail: React.FC = () => {
  const { iue } = useParams<{ iue: string }>();
  const navigate = useNavigate();
  const [expedienteDetail, setExpedienteDetail] = useState<ExpedienteDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [untrackModal, setUntrackModal] = useState<{isOpen: boolean, iue: string}>({isOpen: false, iue: ''});
  const [isUntracking, setIsUntracking] = useState(false);

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

          // Check if we need to mark as viewed
          const movements = response.data.movements;
          const lastViewedSK = response.data.lastViewedMovementSK;
          
          if (movements.length > 0) {
            // Get the most recent movement (movements are sorted by date)
            const sortedMovements = movements.sort((a, b) => {
              const dateA = new Date(a.createdAt);
              const dateB = new Date(b.createdAt);
              return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
            });
            const mostRecentMovementSK = sortedMovements[0].sk;
            
            // If the most recent movement is different from the last viewed, mark as viewed
            if (!lastViewedSK || mostRecentMovementSK !== lastViewedSK) {
              apiService.markExpedienteAsViewed(decodeURIComponent(iue));
            }
          }
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

  const handleUntrackClick = () => {
    if (iue) {
      setUntrackModal({isOpen: true, iue});
    }
  };

  const handleUntrackConfirm = async () => {
    if (!untrackModal.iue) return;
    
    setIsUntracking(true);
    try {
      const response = await apiService.untrackExpediente(untrackModal.iue);
      
      if (response.success) {
        // Navigate back to expedientes list since we untracked this one
        navigate('/expedientes');
      } else {
        // Handle error - you might want to show a toast/notification here
        alert(response.error || 'Error al dejar de seguir expediente');
        setUntrackModal({isOpen: false, iue: ''});
      }
    } catch (error) {
      alert('Error de conexión al dejar de seguir expediente');
      setUntrackModal({isOpen: false, iue: ''});
    } finally {
      setIsUntracking(false);
    }
  };

  const handleUntrackCancel = () => {
    if (!isUntracking) {
      setUntrackModal({isOpen: false, iue: ''});
    }
  };

  // Helper function to extract decreto text from various formats
  const getDecretoText = (decretoText: string | { attributes?: Record<string, unknown>; $value: string } | undefined): string => {
    if (!decretoText) return 'Sin contenido disponible';
    if (typeof decretoText === 'string') {
      return decretoText;
    }
    if (decretoText && typeof decretoText === 'object' && decretoText.$value) {
      return decretoText.$value;
    }
    return 'Sin contenido disponible';
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
    if (tipo.toLowerCase().includes('decreto') || tipo.toLowerCase().includes('sentencia interlocutoria')) {
      return { bg: '#fef2f2', text: '#B91C1C' };
    }
    if (tipo.toLowerCase().includes('mesa')) {
      return { bg: '#fff3e0', text: '#f57c00' };
    }
    if (tipo.toLowerCase().includes('presentación')) {
      return { bg: '#dbeafe', text: '#1E40AF' };
    }
    if (tipo.toLowerCase().includes('audiencia')) {
      return { bg: '#fef2f2', text: '#B91C1C' };
    }
    return { bg: '#f5f5f5', text: '#666' };
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>Cargando detalles del expediente...</div>
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
        <Link to="/expedientes" style={{ color: '#1E40AF', textDecoration: 'none' }}>
          ← Volver a Lista de Expedientes
        </Link>
      </div>
    );
  }

  if (!expedienteDetail) {
    return (
      <div>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          Expediente no encontrado
        </div>
        <Link to="/expedientes" style={{ color: '#1E40AF', textDecoration: 'none' }}>
          ← Volver a Lista de Expedientes
        </Link>
      </div>
    );
  }

  const { expediente, movements, hasNewMovements, hasNewDecretos, lastViewedMovementSK } = expedienteDetail;

  return (
    <div>
      {/* Navigation */}
      <div style={{ marginBottom: '1rem' }}>
        <Link 
          to="/expedientes" 
          style={{ 
            color: '#1E40AF', 
            textDecoration: 'none',
            fontSize: '0.875rem'
          }}
        >
          ← Volver a Lista de Expedientes
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
            <h1 style={{ margin: '0 0 0.5rem 0', color: '#1E40AF' }}>
              {expediente.iue}
            </h1>
            <h2 style={{ margin: '0 0 1rem 0', color: '#333', fontWeight: 'normal' }}>
              {expediente.caratula.replace(/<br\s*\/?>/gi, ' - ')}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {hasNewDecretos && (
              <span style={{
                backgroundColor: '#65A30D',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                NUEVOS DECRETOS
              </span>
            )}
            {hasNewMovements && (
              <span style={{
                backgroundColor: '#B91C1C',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '16px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                NUEVOS MOVIMIENTOS
              </span>
            )}
            <button
              onClick={handleUntrackClick}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #dc2626',
                color: '#dc2626',
                padding: '0.375rem 0.75rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#dc2626';
              }}
              title="Dejar de seguir este expediente"
            >
              🗑️ Dejar de seguir
            </button>
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
              Origen
            </div>
            <div style={{ fontWeight: 'bold' }}>{expediente.origen}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
              Estado
            </div>
            <div style={{
              backgroundColor: '#ecfccb',
              color: '#65A30D',
              padding: '0.25rem 0.75rem',
              borderRadius: '16px',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              display: 'inline-block'
            }}>
              {expediente.status === 'active' ? 'Activo' : expediente.status === 'archived' ? 'Archivado' : expediente.status}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
              Movimientos totales
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#1E40AF' }}>
              {expediente.movementCount}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
              Decretos totales
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#B91C1C' }}>
              {expediente.decretoCount}
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.875rem', color: '#666' }}>
          Última actualización: {formatDate(expediente.updatedAt)}
        </div>
      </div>

      {/* Movements Timeline */}
      <div>
        <h2 style={{ color: '#1E40AF', marginBottom: '1.5rem' }}>
          Historial de Movimientos ({movements.length} total)
        </h2>

        {movements.length === 0 ? (
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: '2rem',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#666'
          }}>
            No se encontraron movimientos para este expediente.
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
              .map((movement) => {
              const colors = getMovementTypeColor(movement.tipo);
              const isDecreto = movement.decretoNumber;
              
              // Check if this movement is newer than the last viewed
              const isNewMovement = !lastViewedMovementSK || movement.sk > lastViewedMovementSK;
              
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
                    border: isDecreto ? '2px solid #B91C1C' : '1px solid #e0e0e0'
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
                          {isNewMovement && (
                            <span style={{
                              backgroundColor: '#65A30D',
                              color: 'white',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '12px',
                              fontSize: '0.625rem',
                              fontWeight: 'bold',
                              marginLeft: '0.5rem'
                            }}>
                              NUEVO
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {isDecreto && (
                          <div style={{
                            backgroundColor: '#B91C1C',
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
                            Vence: {movement.vencimiento}
                          </div>
                        )}
                      </div>
                    </div>

                    {isDecreto && (
                      <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '1rem',
                        borderRadius: '4px',
                        borderLeft: '4px solid #B91C1C'
                      }}>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: 'bold', 
                          marginBottom: '0.5rem',
                          color: '#B91C1C'
                        }}>
                          Contenido del Decreto:
                        </div>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          lineHeight: '1.5',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {movement.isReserved ? (
                            <em style={{ color: '#666' }}>
                              [Decreto reservado - contenido no disponible]
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
                      Agregado: {formatDate(movement.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Untrack Confirmation Modal */}
      <UntrackConfirmModal
        isOpen={untrackModal.isOpen}
        expedienteIue={untrackModal.iue}
        onConfirm={handleUntrackConfirm}
        onCancel={handleUntrackCancel}
        isLoading={isUntracking}
      />
    </div>
  );
};

export default ExpedienteDetail;