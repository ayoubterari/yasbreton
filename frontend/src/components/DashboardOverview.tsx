import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/convex-client'
import './DashboardOverview.css'

interface DashboardStats {
  users: {
    total: number
    admins: number
    restricted: number
    regular: number
  }
  files: {
    total: number
    free: number
    premium: number
  }
  downloads: {
    total: number
  }
  domains: number
  tasks: number
  formations: {
    total: number
    published: number
  }
}

export default function DashboardOverview() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>({
    users: { total: 0, admins: 0, restricted: 0, regular: 0 },
    files: { total: 0, free: 0, premium: 0 },
    downloads: { total: 0 },
    domains: 0,
    tasks: 0,
    formations: { total: 0, published: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Charger les statistiques générales
      const generalStats = await api.statistics.getGeneralStats()
      
      // Charger les utilisateurs
      const users = await api.admin.getAllUsers(user!.id)
      const admins = users.filter(u => u.role === 'admin').length
      const restricted = users.filter(u => u.role === 'restricted').length
      const regular = users.filter(u => u.role === 'user').length

      // Charger les domaines
      const domains = await api.domains.getAllDomains()
      
      // Charger les tâches
      const tasks = await api.tasks.getAllTasks()
      
      // Charger les formations
      const formations = await api.formations.getAllFormations()
      const published = formations.filter(f => f.published).length

      setStats({
        users: {
          total: users.length,
          admins,
          restricted,
          regular
        },
        files: {
          total: generalStats.files.total,
          free: generalStats.files.free,
          premium: generalStats.files.premium
        },
        downloads: {
          total: generalStats.downloads.total
        },
        domains: domains.length,
        tasks: tasks.length,
        formations: {
          total: formations.length,
          published
        }
      })

      // Simuler une activité récente (vous pouvez créer une vraie fonction backend)
      setRecentActivity([
        { type: 'user', action: 'Nouvel utilisateur inscrit', time: '5 min' },
        { type: 'formation', action: 'Formation publiée', time: '1 heure' },
        { type: 'download', action: 'Ressource téléchargée', time: '2 heures' },
        { type: 'task', action: 'Nouvelle tâche créée', time: '3 heures' }
      ])

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Chargement des statistiques...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-overview">
      {/* Header avec message de bienvenue */}
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h1>Bienvenue, {user?.prenom} !</h1>
          <p>Voici un aperçu de votre plateforme Centre Yasbreton</p>
        </div>
        <div className="welcome-date">
          <div className="date-badge">
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="stats-grid">
        {/* Utilisateurs */}
        <div className="stat-card users-card" onClick={() => navigate('/admin/users')}>
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Utilisateurs</h3>
            <div className="stat-value">{stats.users.total}</div>
            <div className="stat-details">
              <span className="detail-item">
                <span className="detail-dot admin"></span>
                {stats.users.admins} Admins
              </span>
              <span className="detail-item">
                <span className="detail-dot restricted"></span>
                {stats.users.restricted} Restreints
              </span>
              <span className="detail-item">
                <span className="detail-dot user"></span>
                {stats.users.regular} Utilisateurs
              </span>
            </div>
          </div>
          <div className="stat-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </div>

        {/* Ressources */}
        <div className="stat-card files-card" onClick={() => navigate('/admin/files')}>
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
              <polyline points="13 2 13 9 20 9" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Ressources</h3>
            <div className="stat-value">{stats.files.total}</div>
            <div className="stat-details">
              <span className="detail-item">
                <span className="detail-dot free"></span>
                {stats.files.free} Gratuites
              </span>
              <span className="detail-item">
                <span className="detail-dot premium"></span>
                {stats.files.premium} Premium
              </span>
            </div>
          </div>
          <div className="stat-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </div>

        {/* Téléchargements */}
        <div className="stat-card downloads-card" onClick={() => navigate('/admin/statistics')}>
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Téléchargements</h3>
            <div className="stat-value">{stats.downloads.total}</div>
            <div className="stat-details">
              <span className="detail-item">Total des téléchargements</span>
            </div>
          </div>
          <div className="stat-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </div>

        {/* Domaines */}
        <div className="stat-card domains-card" onClick={() => navigate('/admin/domains')}>
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Domaines</h3>
            <div className="stat-value">{stats.domains}</div>
            <div className="stat-details">
              <span className="detail-item">Domaines de compétences</span>
            </div>
          </div>
          <div className="stat-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </div>

        {/* Tâches */}
        <div className="stat-card tasks-card" onClick={() => navigate('/admin/tasks')}>
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Tâches ABLLS-R</h3>
            <div className="stat-value">{stats.tasks}</div>
            <div className="stat-details">
              <span className="detail-item">Tâches d'évaluation</span>
            </div>
          </div>
          <div className="stat-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </div>

        {/* Formations */}
        <div className="stat-card formations-card" onClick={() => navigate('/admin/formations')}>
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Formations</h3>
            <div className="stat-value">{stats.formations.total}</div>
            <div className="stat-details">
              <span className="detail-item">
                <span className="detail-dot published"></span>
                {stats.formations.published} Publiées
              </span>
              <span className="detail-item">
                <span className="detail-dot draft"></span>
                {stats.formations.total - stats.formations.published} Brouillons
              </span>
            </div>
          </div>
          <div className="stat-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Section inférieure avec graphiques et activité */}
      <div className="dashboard-bottom">
        {/* Graphique de répartition */}
        <div className="dashboard-card chart-card">
          <div className="card-header">
            <h3>Répartition des ressources</h3>
            <button className="btn-view-all" onClick={() => navigate('/admin/statistics')}>
              Voir tout
            </button>
          </div>
          <div className="chart-content">
            <div className="chart-bars">
              <div className="chart-bar">
                <div className="bar-label">Gratuites</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill free" 
                    style={{ width: `${stats.files.total > 0 ? (stats.files.free / stats.files.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="bar-value">{stats.files.free}</div>
              </div>
              <div className="chart-bar">
                <div className="bar-label">Premium</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill premium" 
                    style={{ width: `${stats.files.total > 0 ? (stats.files.premium / stats.files.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="bar-value">{stats.files.premium}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Activité récente */}
        <div className="dashboard-card activity-card">
          <div className="card-header">
            <h3>Activité récente</h3>
          </div>
          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className={`activity-icon ${activity.type}`}>
                  {activity.type === 'user' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                  {activity.type === 'formation' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                  )}
                  {activity.type === 'download' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  )}
                  {activity.type === 'task' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 11 12 14 22 4"/>
                      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                    </svg>
                  )}
                </div>
                <div className="activity-content">
                  <p className="activity-action">{activity.action}</p>
                  <span className="activity-time">Il y a {activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="dashboard-card quick-actions-card">
          <div className="card-header">
            <h3>Actions rapides</h3>
          </div>
          <div className="quick-actions">
            <button className="quick-action-btn" onClick={() => navigate('/admin/files')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              <span>Ajouter une ressource</span>
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/admin/formations')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              <span>Créer une formation</span>
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/admin/tasks')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 11 12 14 22 4"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
              <span>Ajouter une tâche</span>
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/admin/domains')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
              </svg>
              <span>Créer un domaine</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
