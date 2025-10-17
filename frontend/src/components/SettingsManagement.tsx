import { useState, useEffect } from 'react'
import { api, User } from '../lib/convex-client'
import { useAuth } from '../contexts/AuthContext'
import './SettingsManagement.css'

interface UserPermissions {
  dashboard: boolean
  users: boolean
  domains: boolean
  tasks: boolean
  formations: boolean
  resources: boolean
  settings: boolean
}

interface RestrictedUser extends User {
  permissions?: UserPermissions
}

const DEFAULT_PERMISSIONS: UserPermissions = {
  dashboard: false,
  users: false,
  domains: false,
  tasks: false,
  formations: false,
  resources: false,
  settings: false,
}

export default function SettingsManagement() {
  const { user } = useAuth()
  const [restrictedUsers, setRestrictedUsers] = useState<RestrictedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    telephone: '',
  })
  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_PERMISSIONS)

  useEffect(() => {
    loadRestrictedUsers()
  }, [])

  const loadRestrictedUsers = async () => {
    try {
      setLoading(true)
      setError('')
      const allUsers = await api.admin.getAllUsers(user!.id)
      // Filter users with restricted role
      const restricted = allUsers.filter(u => u.role === 'restricted' && u.permissions)
      setRestrictedUsers(restricted as RestrictedUser[])
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePermissionChange = (module: keyof UserPermissions) => {
    setPermissions(prev => ({ ...prev, [module]: !prev[module] }))
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.nom || !formData.prenom || !formData.email || !formData.password || !formData.telephone) {
      setError('Tous les champs sont obligatoires')
      return
    }

    // Check if at least one permission is selected
    const hasPermissions = Object.values(permissions).some(p => p)
    if (!hasPermissions) {
      setError('Veuillez sélectionner au moins un module')
      return
    }

    try {
      setError('')
      setSuccess('')
      
      // Create user with permissions
      await api.admin.createRestrictedUser({
        ...formData,
        permissions,
        createdBy: user!.id,
      })

      setSuccess('Utilisateur créé avec succès')
      
      // Reset form
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        telephone: '',
      })
      setPermissions(DEFAULT_PERMISSIONS)
      setShowCreateModal(false)
      
      // Reload users
      await loadRestrictedUsers()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de l\'utilisateur')
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
      await loadRestrictedUsers()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression')
      setTimeout(() => setError(''), 3000)
    }
  }

  const getPermissionsList = (perms: UserPermissions) => {
    const modules = []
    if (perms.dashboard) modules.push('Tableau de bord')
    if (perms.users) modules.push('Utilisateurs')
    if (perms.domains) modules.push('Domaines')
    if (perms.tasks) modules.push('Tâches')
    if (perms.formations) modules.push('Formations')
    if (perms.resources) modules.push('Ressources')
    if (perms.settings) modules.push('Paramètres')
    return modules.join(', ') || 'Aucun'
  }

  return (
    <div className="settings-management">
      <div className="settings-header">
        <div>
          <h2>Paramètres</h2>
          <p className="section-description">
            Configuration de l'application
          </p>
        </div>
      </div>

      <div className="settings-section">
        <div className="section-header">
          <h3>Gestion des utilisateurs restreints</h3>
          <button 
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            Créer un utilisateur
          </button>
        </div>

        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-state">Chargement...</div>
        ) : (
          <div className="users-grid">
            {restrictedUsers.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
                <p>Aucun utilisateur restreint</p>
                <button 
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(true)}
                >
                  Créer le premier utilisateur
                </button>
              </div>
            ) : (
              restrictedUsers.map((u) => (
                <div key={u.id} className="user-card">
                  <div className="user-card-header">
                    <div className="user-avatar-large">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div className="user-card-info">
                      <h4>{u.prenom} {u.nom}</h4>
                      <p>{u.email}</p>
                      <span className="user-phone">{u.telephone}</span>
                    </div>
                  </div>
                  
                  <div className="user-card-permissions">
                    <h5>Modules autorisés</h5>
                    <p className="permissions-text">
                      {u.permissions ? getPermissionsList(u.permissions) : 'Aucun'}
                    </p>
                  </div>

                  <div className="user-card-actions">
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="btn-delete-card"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                      Supprimer
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Créer un utilisateur restreint</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="create-user-form">
              <div className="form-section">
                <h4>Informations personnelles</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="prenom">Prénom *</label>
                    <input
                      type="text"
                      id="prenom"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="nom">Nom *</label>
                    <input
                      type="text"
                      id="nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="telephone">Téléphone *</label>
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Mot de passe *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="form-section">
                <h4>Permissions d'accès</h4>
                <p className="form-hint">Sélectionnez les modules auxquels cet utilisateur aura accès</p>
                
                <div className="permissions-grid">
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.dashboard}
                      onChange={() => handlePermissionChange('dashboard')}
                    />
                    <div className="permission-label">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                      <span>Tableau de bord</span>
                    </div>
                  </label>

                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.users}
                      onChange={() => handlePermissionChange('users')}
                    />
                    <div className="permission-label">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87" />
                        <path d="M16 3.13a4 4 0 010 7.75" />
                      </svg>
                      <span>Utilisateurs</span>
                    </div>
                  </label>

                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.domains}
                      onChange={() => handlePermissionChange('domains')}
                    />
                    <div className="permission-label">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                      </svg>
                      <span>Domaines</span>
                    </div>
                  </label>

                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.tasks}
                      onChange={() => handlePermissionChange('tasks')}
                    />
                    <div className="permission-label">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 11 12 14 22 4"/>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                      </svg>
                      <span>Tâches</span>
                    </div>
                  </label>

                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.formations}
                      onChange={() => handlePermissionChange('formations')}
                    />
                    <div className="permission-label">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                      </svg>
                      <span>Formations</span>
                    </div>
                  </label>

                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.resources}
                      onChange={() => handlePermissionChange('resources')}
                    />
                    <div className="permission-label">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                      </svg>
                      <span>Ressources</span>
                    </div>
                  </label>

                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.settings}
                      onChange={() => handlePermissionChange('settings')}
                    />
                    <div className="permission-label">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
                      </svg>
                      <span>Paramètres</span>
                    </div>
                  </label>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Créer l'utilisateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
