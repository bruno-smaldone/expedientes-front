import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import apiService from '../services/api';
import type { ExpedienteTracking } from '../types/api';

type ViewMode = 'normal' | 'decretos-first' | 'movements-first';

const ExpedientesList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [expedientes, setExpedientes] = useState<ExpedienteTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'iue' | 'caratula' | 'lastMovement' | 'lastDecreto'>('lastMovement');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const view = searchParams.get('view') as ViewMode;
    return ['normal', 'decretos-first', 'movements-first'].includes(view) ? view : 'normal';
  });
  const [tooltip, setTooltip] = useState<{text: string, x: number, y: number} | null>(null);

  useEffect(() => {
    const fetchExpedientes = async () => {
      try {
        setLoading(true);
        const response = await apiService.getExpedientes();
        
        if (response.success && response.data) {
          setExpedientes(response.data.expedientes);
        } else {
          setError(response.error || 'Failed to fetch expedientes');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchExpedientes();
  }, []);

  const handleSort = (field: 'iue' | 'caratula' | 'lastMovement' | 'lastDecreto') => {
    // Only allow sorting in normal view mode
    if (viewMode !== 'normal') return;
    
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    const newSearchParams = new URLSearchParams(searchParams);
    if (mode === 'normal') {
      newSearchParams.delete('view');
    } else {
      newSearchParams.set('view', mode);
    }
    setSearchParams(newSearchParams);
  };

  // Filter expedientes based on search term
  const filteredExpedientes = expedientes.filter(expediente => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const iueMatches = expediente.expediente.iue.toLowerCase().includes(searchLower);
    const caratulaMatches = expediente.expediente.caratula.toLowerCase().includes(searchLower);
    
    return iueMatches || caratulaMatches;
  });

  const getGroupedExpedientes = () => {
    let sortedExpedientes = [...filteredExpedientes];
    
    // Apply sorting only in normal view
    if (viewMode === 'normal') {
      sortedExpedientes = sortedExpedientes.sort((a, b) => {
        let aValue: string, bValue: string;
        
        switch (sortField) {
          case 'iue':
            aValue = a.expediente.iue;
            bValue = b.expediente.iue;
            break;
          case 'caratula':
            aValue = a.expediente.caratula;
            bValue = b.expediente.caratula;
            break;
          case 'lastMovement':
            aValue = a.expediente.lastMovementDate || a.expediente.updatedAt;
            bValue = b.expediente.lastMovementDate || b.expediente.updatedAt;
            break;
          case 'lastDecreto':
            aValue = a.expediente.lastDecretoDate || '';
            bValue = b.expediente.lastDecretoDate || '';
            break;
          default:
            return 0;
        }

        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      });
      
      return [{ items: sortedExpedientes, title: null }];
    }
    
    // Group by view mode
    if (viewMode === 'decretos-first') {
      const withDecretos = sortedExpedientes.filter(exp => exp.hasNewDecretos);
      const withoutDecretos = sortedExpedientes.filter(exp => !exp.hasNewDecretos);
      
      return [
        { items: withDecretos, title: `Expedientes con nuevos decretos (${withDecretos.length})` },
        { items: withoutDecretos, title: `Otros expedientes (${withoutDecretos.length})` }
      ].filter(group => group.items.length > 0);
    }
    
    if (viewMode === 'movements-first') {
      const withMovements = sortedExpedientes.filter(exp => exp.hasNewMovements);
      const withoutMovements = sortedExpedientes.filter(exp => !exp.hasNewMovements);
      
      return [
        { items: withMovements, title: `Expedientes con nuevos movimientos (${withMovements.length})` },
        { items: withoutMovements, title: `Otros expedientes (${withoutMovements.length})` }
      ].filter(group => group.items.length > 0);
    }
    
    return [{ items: sortedExpedientes, title: null }];
  };

  const groupedExpedientes = getGroupedExpedientes();
  const totalFilteredCount = groupedExpedientes.reduce((sum, group) => sum + group.items.length, 0);

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

  const getSortIcon = (field: 'iue' | 'caratula' | 'lastMovement' | 'lastDecreto') => {
    if (viewMode !== 'normal') return '↕️'; // Show neutral icon when sorting is disabled
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>Loading expedientes...</div>
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

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#1E40AF', marginBottom: '0.5rem' }}>Todos mis Expedientes</h1>
        <p style={{ color: '#666', margin: 0 }}>
          Lista completa de todos los expedientes que estás siguiendo ({expedientes.length} total
          {searchTerm && `, ${totalFilteredCount} filtrados`})
        </p>
      </div>

      {/* Search Bar and View Mode Controls */}
      <div style={{ 
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        flexWrap: 'wrap'
      }}>
        {/* Search Bar */}
        <div style={{
          position: 'relative',
          flexShrink: 0,
          minWidth: '300px'
        }}>
          <input
            type="text"
            placeholder="Buscar por IUE o carátula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.875rem 1rem 0.875rem 2.5rem',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '0.875rem',
              boxSizing: 'border-box',
              backgroundColor: 'white',
              color: '#333',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          />
          <div style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#666',
            fontSize: '1rem'
          }}>
            🔍
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#999',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0.25rem'
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* View Mode Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#333', flexShrink: 0 }}>
            Vista:
          </span>
          
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
            <input
              type="radio"
              name="viewMode"
              value="normal"
              checked={viewMode === 'normal'}
              onChange={(e) => handleViewModeChange(e.target.value as ViewMode)}
              style={{ marginRight: '0.5rem' }}
            />
            Vista normal (todos los expedientes)
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
            <input
              type="radio"
              name="viewMode"
              value="decretos-first"
              checked={viewMode === 'decretos-first'}
              onChange={(e) => handleViewModeChange(e.target.value as ViewMode)}
              style={{ marginRight: '0.5rem' }}
            />
            Expedientes con nuevos decretos primero
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
            <input
              type="radio"
              name="viewMode"
              value="movements-first"
              checked={viewMode === 'movements-first'}
              onChange={(e) => handleViewModeChange(e.target.value as ViewMode)}
              style={{ marginRight: '0.5rem' }}
            />
            Expedientes con nuevos movimientos primero
          </label>
        </div>
      </div>

      {expedientes.length === 0 ? (
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '3rem',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#666'
        }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>No expedientes found</h3>
          <p>You are not currently tracking any expedientes.</p>
        </div>
      ) : totalFilteredCount === 0 ? (
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '3rem',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#666'
        }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>No expedientes match your search</h3>
          <p>Try different keywords or clear the search to see all expedientes.</p>
          <button
            onClick={() => setSearchTerm('')}
            style={{
              backgroundColor: '#1E40AF',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
              marginTop: '1rem'
            }}
          >
            Clear Search
          </button>
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
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  borderBottom: '1px solid #e0e0e0',
                  cursor: viewMode === 'normal' ? 'pointer' : 'not-allowed',
                  userSelect: 'none',
                  opacity: viewMode === 'normal' ? 1 : 0.6
                }} onClick={() => handleSort('iue')}>
                  IUE {getSortIcon('iue')}
                </th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  borderBottom: '1px solid #e0e0e0',
                  cursor: viewMode === 'normal' ? 'pointer' : 'not-allowed',
                  userSelect: 'none',
                  opacity: viewMode === 'normal' ? 1 : 0.6
                }} onClick={() => handleSort('caratula')}>
                  Carátula {getSortIcon('caratula')}
                </th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  borderBottom: '1px solid #e0e0e0'
                }}>
                  Movimientos
                </th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  borderBottom: '1px solid #e0e0e0'
                }}>
                  Decretos
                </th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  borderBottom: '1px solid #e0e0e0',
                  cursor: viewMode === 'normal' ? 'pointer' : 'not-allowed',
                  userSelect: 'none',
                  opacity: viewMode === 'normal' ? 1 : 0.6
                }} onClick={() => handleSort('lastMovement')}>
                  Último movimiento {getSortIcon('lastMovement')}
                </th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  borderBottom: '1px solid #e0e0e0',
                  cursor: viewMode === 'normal' ? 'pointer' : 'not-allowed',
                  userSelect: 'none',
                  opacity: viewMode === 'normal' ? 1 : 0.6
                }} onClick={() => handleSort('lastDecreto')}>
                  Último decreto {getSortIcon('lastDecreto')}
                </th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  borderBottom: '1px solid #e0e0e0'
                }}>
                  Actividad
                </th>
              </tr>
            </thead>
            <tbody>
              {groupedExpedientes.map((group, groupIndex) => (
                <React.Fragment key={`group-${groupIndex}`}>
                  {group.title && (
                    <tr>
                      <td 
                        colSpan={7} 
                        style={{
                          backgroundColor: '#f0f4f8',
                          padding: '0.75rem 1rem',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          color: '#1E40AF',
                          borderBottom: '1px solid #e0e0e0',
                          borderTop: groupIndex > 0 ? '2px solid #1E40AF' : 'none'
                        }}
                      >
                        {group.title}
                      </td>
                    </tr>
                  )}
                  {group.items.map((expediente, index) => (
                <tr key={expediente.expediente.iue} style={{
                  backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                  borderBottom: '1px solid #e0e0e0'
                }}>
                  <td style={{ padding: '1rem' }}>
                    <Link 
                      to={`/expedientes/${encodeURIComponent(expediente.expediente.iue)}`}
                      style={{
                        color: '#1E40AF',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}
                    >
                      {expediente.expediente.iue}
                    </Link>
                  </td>
                  <td style={{ 
                    padding: '1rem',
                    maxWidth: '300px'
                  }}>
                    <div 
                      style={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'help',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          text: `Carátula completa: ${expediente.expediente.caratula.replace(/<br\s*\/?>/gi, ' - ')}`,
                          x: rect.left,
                          y: rect.bottom + 5
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      {expediente.expediente.caratula.replace(/<br\s*\/?>/gi, ' - ')}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#666',
                      marginTop: '0.25rem'
                    }}>
                      {expediente.expediente.origen}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    <span style={{
                      backgroundColor: '#dbeafe',
                      color: '#1E40AF',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      fontWeight: 'bold'
                    }}>
                      {expediente.expediente.movementCount}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    <span style={{
                      backgroundColor: '#fef2f2',
                      color: '#B91C1C',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      fontWeight: 'bold'
                    }}>
                      {expediente.expediente.decretoCount}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    {expediente.expediente.lastMovementDate || '-'}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    {expediente.expediente.lastDecretoDate || '-'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {expediente.hasNewDecretos && (
                        <span style={{
                          backgroundColor: '#65A30D',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 'bold'
                        }}>
                          NUEVOS DECRETOS
                        </span>
                      )}
                      {expediente.hasNewMovements && !expediente.hasNewDecretos && (
                        <span style={{
                          backgroundColor: '#B91C1C',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 'bold'
                        }}>
                          NUEVOS MOVIMIENTOS
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
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
            maxWidth: '300px',
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

export default ExpedientesList;