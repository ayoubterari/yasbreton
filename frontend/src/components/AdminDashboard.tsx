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
import SettingsManagement from './SettingsManagement'
import DashboardOverview from './DashboardOverview'
import './AdminDashboard.css'

type Module = 'dashboard' | 'users' | 'settings' | 'resources-files' | 'resources-categories' | 'resources-tags' | 'resources-stats' | 'domains' | 'tasks' | 'formations'

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeModule, setActiveModule] = useState<Module>('users')
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: ''
  })

  useEffect(() => {
    loadUsers()
  }, [])

  // Synchroniser l'URL avec le module actif
  useEffect(() => {
    const path = location.pathname
    if (path === '/admin/users') setActiveModule('users')
    else if (path === '/admin/files') setActiveModule('resources-files')
    else if (path === '/admin/categories') setActiveModule('resources-categories')
    else if (path === '/admin/tags') setActiveModule('resources-tags')
    else if (path === '/admin/statistics') setActiveModule('resources-stats')
    else if (path === '/admin/domains') setActiveModule('domains')
    else if (path === '/admin/tasks') setActiveModule('tasks')
    else if (path === '/admin/formations') setActiveModule('formations')
  }, [location.pathname])

  // Fonction pour changer de module et mettre à jour l'URL
  const changeModule = (module: Module) => {
    setActiveModule(module)
    if (module === 'users') navigate('/admin/users')
    else if (module === 'resources-files') navigate('/admin/files')
    else if (module === 'resources-categories') navigate('/admin/categories')
    else if (module === 'resources-tags') navigate('/admin/tags')
    else if (module === 'resources-stats') navigate('/admin/statistics')
    else if (module === 'domains') navigate('/admin/domains')
    else if (module === 'tasks') navigate('/admin/tasks')
    else if (module === 'formations') navigate('/admin/formations')
    else navigate('/admin')
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

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return
    }

    try {
      await api.admin.deleteUser(user!.id, userId)
      setSuccess('Utilisateur supprimé avec succès')
      setTimeout(() => setSuccess(''), 3000)
      await loadUsers()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleChangeRole = async (userId: string, newRole: "user" | "admin") => {
    try {
      await api.admin.changeUserRole(user!.id, userId, newRole)
      setSuccess(`Rôle changé en ${newRole} avec succès`)
      setTimeout(() => setSuccess(''), 3000)
      await loadUsers()
    } catch (err: any) {
      setError(err.message || 'Erreur lors du changement de rôle')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit)
    setEditFormData({
      nom: userToEdit.nom,
      prenom: userToEdit.prenom,
      email: userToEdit.email,
      telephone: userToEdit.telephone || ''
    })
    setShowEditModal(true)
  }

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    })
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    try {
      await api.admin.updateUser(user!.id, editingUser.id, editFormData)
      setSuccess('Utilisateur modifié avec succès')
      setTimeout(() => setSuccess(''), 3000)
      setShowEditModal(false)
      setEditingUser(null)
      await loadUsers()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleCancelEdit = () => {
    setShowEditModal(false)
    setEditingUser(null)
    setEditFormData({ nom: '', prenom: '', email: '', telephone: '' })
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
              <span>Administration</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
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

          <button
            className={`nav-item ${activeModule === 'domains' ? 'active' : ''}`}
            onClick={() => changeModule('domains')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
            </svg>
            <span>Domaines</span>
          </button>

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

          {/* Ressources avec sous-menu */}
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

          <button
            className={`nav-item ${activeModule === 'settings' ? 'active' : ''}`}
            onClick={() => changeModule('settings')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
            </svg>
            <span>Paramètres</span>
          </button>
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
              {activeModule === 'settings' && 'Paramètres'}
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
                <span className="user-role">Administrateur</span>
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
          {/* Module Utilisateurs */}
          {activeModule === 'users' && (
        <div className="admin-container">
          <div className="admin-header-section">
            <h2>Gestion des utilisateurs</h2>
            <p className="section-description">
              Gérez les comptes utilisateurs de la plateforme
            </p>
          </div>

          {success && <div className="success-message">{success}</div>}
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
                    <th>Actions</th>
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
                          {u.role === 'admin' ? 'Admin' : 'Utilisateur'}
                        </span>
                      </td>
                      <td>
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('fr-FR')
                          : '-'}
                      </td>
                      <td className="actions-cell">
                        {u.id !== user?.id && (
                          <>
                            <select
                              value={u.role}
                              onChange={(e) =>
                                handleChangeRole(u.id, e.target.value as "user" | "admin")
                              }
                              className="role-select"
                            >
                              <option value="user">Utilisateur</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              onClick={() => handleEditUser(u)}
                              className="btn-edit"
                              title="Modifier"
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="btn-delete"
                              title="Supprimer"
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                              </svg>
                            </button>
                          </>
                        )}
                        {u.id === user?.id && (
                          <span className="current-user-label">Vous</span>
                        )}
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

          <div className="stats-section">
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{users.length}</div>
                <div className="stat-label">Utilisateurs totaux</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon admin">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {users.filter((u) => u.role === 'admin').length}
                </div>
                <div className="stat-label">Administrateurs</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon user">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {users.filter((u) => u.role === 'user').length}
                </div>
                <div className="stat-label">Utilisateurs standards</div>
              </div>
            </div>
          </div>
        </div>
          )}

          {/* Module Fichiers */}
          {activeModule === 'resources-files' && (
            <div className="admin-container">
              <FilesManagement />
            </div>
          )}

          {/* Module Catégories */}
          {activeModule === 'resources-categories' && (
            <div className="admin-container">
              <CategoriesManagement />
            </div>
          )}

          {/* Module Tags */}
          {activeModule === 'resources-tags' && (
            <div className="admin-container">
              <TagsManagement />
            </div>
          )}

          {/* Module Statistiques */}
          {activeModule === 'resources-stats' && (
            <Statistics />
          )}

          {/* Module Domaines */}
          {activeModule === 'domains' && (
            <DomainsManagement />
          )}

          {/* Module Tâches */}
          {activeModule === 'tasks' && (
            <TasksManagement />
          )}

          {/* Module Formations */}
          {activeModule === 'formations' && (
            <FormationsManagement />
          )}

          {/* Module Dashboard */}
          {activeModule === 'dashboard' && (
            <div className="admin-container">
              <DashboardOverview />
            </div>
          )}

          {/* Module Paramètres */}
          {activeModule === 'settings' && (
            <div className="admin-container">
              <SettingsManagement />
            </div>
          )}
        </main>
      </div>

      {/* Modal d'édition d'utilisateur */}
      {showEditModal && editingUser && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Modifier l'utilisateur</h2>
              <button className="btn-close-modal" onClick={handleCancelEdit}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="modal-form">
              <div className="form-group">
                <label htmlFor="edit-nom">Nom *</label>
                <input
                  type="text"
                  id="edit-nom"
                  name="nom"
                  value={editFormData.nom}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-prenom">Prénom *</label>
                <input
                  type="text"
                  id="edit-prenom"
                  name="prenom"
                  value={editFormData.prenom}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-email">Email *</label>
                <input
                  type="email"
                  id="edit-email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-telephone">Téléphone</label>
                <input
                  type="tel"
                  id="edit-telephone"
                  name="telephone"
                  value={editFormData.telephone}
                  onChange={handleEditFormChange}
                  placeholder="Ex: 0612345678"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCancelEdit}>
                  Annuler
                </button>
                <button type="submit" className="btn-submit">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
