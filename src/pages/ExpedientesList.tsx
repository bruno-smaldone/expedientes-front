import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import type { ExpedienteTracking } from '../types/api';

const ExpedientesList: React.FC = () => {
  const [expedientes, setExpedientes] = useState<ExpedienteTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'iue' | 'caratula' | 'lastActivity'>('lastActivity');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleSort = (field: 'iue' | 'caratula' | 'lastActivity') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter expedientes based on search term
  const filteredExpedientes = expedientes.filter(expediente => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const iueMatches = expediente.expediente.iue.toLowerCase().includes(searchLower);
    const caratulaMatches = expediente.expediente.caratula.toLowerCase().includes(searchLower);
    
    return iueMatches || caratulaMatches;
  });

  const sortedExpedientes = [...filteredExpedientes].sort((a, b) => {
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
      case 'lastActivity':
        aValue = a.expediente.updatedAt;
        bValue = b.expediente.updatedAt;
        break;
      default:
        return 0;
    }

    const comparison = aValue.localeCompare(bValue);
    return sortDirection === 'asc' ? comparison : -comparison;
  });

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

  const getSortIcon = (field: 'iue' | 'caratula' | 'lastActivity') => {
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
        <h1 style={{ color: '#1976d2', marginBottom: '0.5rem' }}>Todos mis Expedientes</h1>
        <p style={{ color: '#666', margin: 0 }}>
          Complete list of all expedientes you are tracking ({expedientes.length} total
          {searchTerm && `, ${sortedExpedientes.length} filtered`})
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          position: 'relative',
          maxWidth: '400px'
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
      ) : sortedExpedientes.length === 0 ? (
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
              backgroundColor: '#1976d2',
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
                  cursor: 'pointer',
                  userSelect: 'none'
                }} onClick={() => handleSort('iue')}>
                  IUE {getSortIcon('iue')}
                </th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  borderBottom: '1px solid #e0e0e0',
                  cursor: 'pointer',
                  userSelect: 'none'
                }} onClick={() => handleSort('caratula')}>
                  Carátula {getSortIcon('caratula')}
                </th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  borderBottom: '1px solid #e0e0e0',
                  cursor: 'pointer',
                  userSelect: 'none'
                }} onClick={() => handleSort('lastActivity')}>
                  Last Activity {getSortIcon('lastActivity')}
                </th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  borderBottom: '1px solid #e0e0e0'
                }}>
                  Status
                </th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  borderBottom: '1px solid #e0e0e0'
                }}>
                  Activity
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedExpedientes.map((expediente, index) => (
                <tr key={expediente.expediente.iue} style={{
                  backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                  borderBottom: '1px solid #e0e0e0'
                }}>
                  <td style={{ padding: '1rem' }}>
                    <Link 
                      to={`/expedientes/${encodeURIComponent(expediente.expediente.iue)}`}
                      style={{
                        color: '#1976d2',
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
                    <div style={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {expediente.expediente.caratula}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#666',
                      marginTop: '0.25rem'
                    }}>
                      {expediente.expediente.origen}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    {formatDate(expediente.expediente.updatedAt)}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    <div style={{
                      backgroundColor: '#e8f5e8',
                      color: '#2e7d32',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      display: 'inline-block'
                    }}>
                      {expediente.expediente.estado}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {expediente.hasNewDecretos && (
                        <span style={{
                          backgroundColor: '#4caf50',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 'bold'
                        }}>
                          NEW DECRETOS
                        </span>
                      )}
                      {expediente.unreadCount > 0 && (
                        <span style={{
                          backgroundColor: '#ff9800',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: 'bold'
                        }}>
                          {expediente.unreadCount} unread
                        </span>
                      )}
                      <span style={{
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold'
                      }}>
                        {expediente.expediente.movementCount} mov
                      </span>
                      <span style={{
                        backgroundColor: '#f3e5f5',
                        color: '#7b1fa2',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold'
                      }}>
                        {expediente.expediente.decretoCount} dec
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExpedientesList;