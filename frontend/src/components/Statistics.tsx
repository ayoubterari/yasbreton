import { useState, useEffect } from 'react'
import { api } from '../lib/convex-client'
import './Statistics.css'

export default function Statistics() {
  const [loading, setLoading] = useState(true)
  const [generalStats, setGeneralStats] = useState<any>(null)
  const [downloadStats, setDownloadStats] = useState<any[]>([])
  const [premiumConversions, setPremiumConversions] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'downloads' | 'conversions'>('overview')

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    try {
      setLoading(true)
      const [general, downloads, conversions] = await Promise.all([
        api.statistics.getGeneralStats(),
        api.statistics.getDownloadStats(),
        api.statistics.getPremiumConversions(),
      ])
      setGeneralStats(general)
      setDownloadStats(downloads)
      setPremiumConversions(conversions)
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getSubscriptionLabel = (type: string) => {
    switch (type) {
      case 'monthly': return 'Mensuel'
      case 'quarterly': return 'Trimestriel'
      case 'yearly': return 'Annuel'
      default: return type
    }
  }

  if (loading) {
    return (
      <div className="statistics-loading">
        <div className="spinner"></div>
        <p>Chargement des statistiques...</p>
      </div>
    )
  }

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <h1>📊 Statistiques</h1>
        <button onClick={loadStatistics} className="btn-refresh">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
          Actualiser
        </button>
      </div>

      <div className="statistics-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Vue d'ensemble
        </button>
        <button
          className={`tab ${activeTab === 'downloads' ? 'active' : ''}`}
          onClick={() => setActiveTab('downloads')}
        >
          Téléchargements
        </button>
        <button
          className={`tab ${activeTab === 'conversions' ? 'active' : ''}`}
          onClick={() => setActiveTab('conversions')}
        >
          Conversions Premium
        </button>
      </div>

      {activeTab === 'overview' && generalStats && (
        <div className="overview-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon users">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>Utilisateurs</h3>
                <div className="stat-number">{generalStats.users.total}</div>
                <div className="stat-details">
                  <span className="premium">👑 {generalStats.users.premium} Premium</span>
                  <span className="regular">👤 {generalStats.users.regular} Réguliers</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon files">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
                  <path d="M13 2v7h7"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>Fichiers</h3>
                <div className="stat-number">{generalStats.files.total}</div>
                <div className="stat-details">
                  <span className="free">🆓 {generalStats.files.free} Gratuits</span>
                  <span className="premium">💎 {generalStats.files.premium} Premium</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon downloads">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>Téléchargements</h3>
                <div className="stat-number">{generalStats.downloads.total}</div>
                <div className="stat-details">
                  <span className="free">🆓 {generalStats.downloads.free} Gratuits</span>
                  <span className="premium">💎 {generalStats.downloads.premium} Premium</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon conversions">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>Conversions Premium</h3>
                <div className="stat-number">{generalStats.conversions.total}</div>
                <div className="stat-details">
                  <span>Abonnements souscrits</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'downloads' && (
        <div className="downloads-section">
          <h2>Statistiques de téléchargement par fichier</h2>
          {downloadStats.length === 0 ? (
            <div className="empty-state">
              <p>Aucun téléchargement enregistré</p>
            </div>
          ) : (
            <div className="downloads-list">
              {downloadStats.map((stat) => (
                <div key={stat.file._id} className="download-card">
                  <div className="download-header">
                    <div className="file-info">
                      <h3>{stat.file.titleFr}</h3>
                      <span className={`file-type ${stat.file.type}`}>
                        {stat.file.type === 'premium' ? '💎 Premium' : '🆓 Gratuit'}
                      </span>
                    </div>
                    <div className="download-count">
                      <span className="count-number">{stat.totalDownloads}</span>
                      <span className="count-label">téléchargements</span>
                    </div>
                  </div>
                  {stat.downloads.length > 0 && (
                    <div className="download-details">
                      <h4>Téléchargé par :</h4>
                      <div className="downloads-table">
                        <table>
                          <thead>
                            <tr>
                              <th>Utilisateur</th>
                              <th>Email</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stat.downloads.slice(0, 5).map((download: any, index: number) => (
                              <tr key={index}>
                                <td>{download.userName}</td>
                                <td>{download.userEmail}</td>
                                <td>{formatDate(download.downloadedAt)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {stat.downloads.length > 5 && (
                          <p className="more-downloads">
                            +{stat.downloads.length - 5} autres téléchargements
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'conversions' && (
        <div className="conversions-section">
          <h2>Conversions vers Premium</h2>
          {premiumConversions.length === 0 ? (
            <div className="empty-state">
              <p>Aucune conversion enregistrée</p>
            </div>
          ) : (
            <div className="conversions-table">
              <table>
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Email</th>
                    <th>Type d'abonnement</th>
                    <th>Date de conversion</th>
                    <th>Expire le</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {premiumConversions.map((conversion) => (
                    <tr key={conversion.conversionId}>
                      <td>{conversion.userName}</td>
                      <td>{conversion.userEmail}</td>
                      <td>
                        <span className="subscription-type">
                          {getSubscriptionLabel(conversion.subscriptionType)}
                        </span>
                      </td>
                      <td>{formatDate(conversion.convertedAt)}</td>
                      <td>{formatDate(conversion.expiresAt)}</td>
                      <td>
                        <span className={`status ${conversion.isActive ? 'active' : 'expired'}`}>
                          {conversion.isActive ? '✅ Actif' : '❌ Expiré'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
