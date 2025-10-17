import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api, User } from '../lib/convex-client'
import FilesManagement from './FilesManagement'
import CategoriesManagement from './CategoriesManagement'
import TagsManagement from './TagsManagement'
import Statistics from './Statistics'
import TasksManagement from './TasksManagement'
import DomainsManagement from './DomainsManagement'
import FormationsManagement from './FormationsManagement'
import DashboardOverview from './DashboardOverview'
import './AdminDashboard.css'

type Module = 'dashboard' | 'users' | 'settings' | 'resources-files' | 'resources-categories' | 'resources-tags' | 'resources-stats' | 'domains' | 'tasks' | 'formations'

export default function RestrictedDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeModule, setActiveModule] = useState<Module>('dashboard')
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Vérifier les permissions de l'utilisateur
  const permissions = user?.permissions || {
    dashboard: false,
    users: false,
    domains: false,
    tasks: false,
    formations: false,
    resources: false,
    settings: false,
  }

  // Déterminer le premier module accessible
  useEffect(() => {
    if (permissions.dashboard) {
      setActiveModule('dashboard')
    } else if (permissions.users) {
      setActiveModule('users')
    } else if (permissions.domains) {
      setActiveModule('domains')
    } else if (permissions.tasks) {
      setActiveModule('tasks')
    } else if (permissions.formations) {
      setActiveModule('formations')
    } else if (permissions.resources) {
      setActiveModule('resources-files')
    } else if (permissions.settings) {
      setActiveModule('settings')
    }
  }, [permissions])

  useEffect(() => {
    if (permissions.users) {
      loadUsers()
    }
  }, [permissions.users])

  // Synchroniser l'URL avec le module actif
  useEffect(() => {
    const path = location.pathname
    if (path === '/restricted/users' && permissions.users) setActiveModule('users')
    else if (path === '/restricted/files' && permissions.resources) setActiveModule('resources-files')
    else if (path === '/restricted/categories' && permissions.resources) setActiveModule('resources-categories')
    else if (path === '/restricted/tags' && permissions.resources) setActiveModule('resources-tags')
    else if (path === '/restricted/statistics' && permissions.resources) setActiveModule('resources-stats')
    else if (path === '/restricted/domains' && permissions.domains) setActiveModule('domains')
    else if (path === '/restricted/tasks' && permissions.tasks) setActiveModule('tasks')
    else if (path === '/restricted/formations' && permissions.formations) setActiveModule('formations')
  }, [location.pathname, permissions])

  // Fonction pour changer de module et mettre à jour l'URL
  const changeModule = (module: Module) => {
    setActiveModule(module)
    if (module === 'users') navigate('/restricted/users')
    else if (module === 'resources-files') navigate('/restricted/files')
    else if (module === 'resources-categories') navigate('/restricted/categories')
    else if (module === 'resources-tags') navigate('/restricted/tags')
    else if (module === 'resources-stats') navigate('/restricted/statistics')
    else if (module === 'domains') navigate('/restricted/domains')
    else if (module === 'tasks') navigate('/restricted/tasks')
    else if (module === 'formations') navigate('/restricted/formations')
    else navigate('/restricted')
  }

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError('')
      const allUsers = await api.admin.getAllUsers(user!.id)
      setUsers(allUsers)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="logo-text">
              <h2>Centre Yasbreton</h2>
              <span>Tableau de bord</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {permissions.dashboard && (
            <button
              className={`nav-item ${activeModule === 'dashboard' ? 'active' : ''}`}
              onClick={() => changeModule('dashboard')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <span>Tableau de bord</span>
            </button>
          )}

          {permissions.users && (
            <button
              className={`nav-item ${activeModule === 'users' ? 'active' : ''}`}
              onClick={() => changeModule('users')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
              <span>Utilisateurs</span>
            </button>
          )}

          {permissions.domains && (
            <button
              className={`nav-item ${activeModule === 'domains' ? 'active' : ''}`}
              onClick={() => changeModule('domains')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
              </svg>
              <span>Domaines</span>
            </button>
          )}

          {permissions.tasks && (
            <button
              className={`nav-item ${activeModule === 'tasks' ? 'active' : ''}`}
              onClick={() => changeModule('tasks')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 11 12 14 22 4"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
              <span>Tâches</span>
            </button>
          )}

          {permissions.formations && (
            <button
              className={`nav-item ${activeModule === 'formations' ? 'active' : ''}`}
              onClick={() => changeModule('formations')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              <span>Formations</span>
            </button>
          )}

          {/* Ressources avec sous-menu */}
          {permissions.resources && (
            <div className="nav-group">
              <button
                className={`nav-item ${activeModule.startsWith('resources') ? 'active' : ''}`}
                onClick={() => setResourcesOpen(!resourcesOpen)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                </svg>
                <span>Ressources</span>
                <svg 
                  className={`chevron ${resourcesOpen ? 'open' : ''}`}
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              
              <div className={`sub-menu ${resourcesOpen ? 'open' : ''}`}>
                <button
                  className={`sub-item ${activeModule === 'resources-files' ? 'active' : ''}`}
                  onClick={() => changeModule('resources-files')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                    <polyline points="13 2 13 9 20 9" />
                  </svg>
                  <span>Fichiers</span>
                </button>

                <button
                  className={`sub-item ${activeModule === 'resources-categories' ? 'active' : ''}`}
                  onClick={() => changeModule('resources-categories')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  <span>Catégories</span>
                </button>

                <button
                  className={`sub-item ${activeModule === 'resources-tags' ? 'active' : ''}`}
                  onClick={() => changeModule('resources-tags')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                  <span>Tags</span>
                </button>

                <button
                  className={`sub-item ${activeModule === 'resources-stats' ? 'active' : ''}`}
                  onClick={() => changeModule('resources-stats')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="20" x2="12" y2="10" />
                    <line x1="18" y1="20" x2="18" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="16" />
                  </svg>
                  <span>Statistiques</span>
                </button>
              </div>
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <button onClick={() => navigate('/')} className="sidebar-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Retour à l'accueil</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-content-wrapper">
        {/* Top Bar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <h1 className="page-title">
              {activeModule === 'dashboard' && 'Tableau de bord'}
              {activeModule === 'users' && 'Gestion des utilisateurs'}
              {activeModule === 'resources-files' && 'Fichiers'}
              {activeModule === 'resources-categories' && 'Catégories'}
              {activeModule === 'resources-tags' && 'Tags'}
              {activeModule === 'resources-stats' && 'Statistiques'}
              {activeModule === 'domains' && 'Domaines'}
              {activeModule === 'tasks' && 'Tâches'}
              {activeModule === 'formations' && 'Formations'}
            </h1>
          </div>
          <div className="topbar-right">
            <div className="user-menu">
              <div className="user-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="user-info">
                <span className="user-name">{user?.prenom} {user?.nom}</span>
                <span className="user-role">Utilisateur restreint</span>
              </div>
            </div>
            <button onClick={logout} className="btn-logout-topbar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="admin-main">
          {/* Module Dashboard */}
          {activeModule === 'dashboard' && permissions.dashboard && (
            <div className="admin-container">
              <DashboardOverview />
            </div>
          )}

          {/* Module Utilisateurs */}
          {activeModule === 'users' && permissions.users && (
            <div className="admin-container">
              <div className="admin-header-section">
                <h2>Gestion des utilisateurs</h2>
                <p className="section-description">
                  Gérez les comptes utilisateurs de la plateforme
                </p>
              </div>

              {error && <div className="error-message">{error}</div>}

              {loading ? (
                <div className="loading-state">Chargement des utilisateurs...</div>
              ) : (
                <div className="users-table-container">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Nom complet</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                        <th>Rôle</th>
                        <th>Date d'inscription</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td className="user-name-cell">
                            {u.prenom} {u.nom}
                          </td>
                          <td>{u.email}</td>
                          <td>{u.telephone}</td>
                          <td>
                            <span className={`role-badge ${u.role}`}>
                              {u.role === 'admin' ? 'Admin' : u.role === 'restricted' ? 'Restreint' : 'Utilisateur'}
                            </span>
                          </td>
                          <td>
                            {u.createdAt
                              ? new Date(u.createdAt).toLocaleDateString('fr-FR')
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {users.length === 0 && (
                    <div className="empty-state">Aucun utilisateur trouvé</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Module Fichiers */}
          {activeModule === 'resources-files' && permissions.resources && (
            <div className="admin-container">
              <FilesManagement />
            </div>
          )}

          {/* Module Catégories */}
          {activeModule === 'resources-categories' && permissions.resources && (
            <div className="admin-container">
              <CategoriesManagement />
            </div>
          )}

          {/* Module Tags */}
          {activeModule === 'resources-tags' && permissions.resources && (
            <div className="admin-container">
              <TagsManagement />
            </div>
          )}

          {/* Module Statistiques */}
          {activeModule === 'resources-stats' && permissions.resources && (
            <Statistics />
          )}

          {/* Module Domaines */}
          {activeModule === 'domains' && permissions.domains && (
            <DomainsManagement />
          )}

          {/* Module Tâches */}
          {activeModule === 'tasks' && permissions.tasks && (
            <TasksManagement />
          )}

          {/* Module Formations */}
          {activeModule === 'formations' && permissions.formations && (
            <FormationsManagement />
          )}
        </main>
      </div>
    </div>
  )
}
