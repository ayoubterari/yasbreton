import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/convex-client'
import PremiumSection from './PremiumSection'
import './UserDashboard.css'

export default function UserDashboard() {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'premium'>('profile')

  // Gérer le paramètre tab dans l'URL
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam === 'premium' || tabParam === 'profile' || tabParam === 'password') {
      setActiveTab(tabParam)
    }
  }, [searchParams])
  
  // Profile form
  const [profileData, setProfileData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    telephone: user?.telephone || '',
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    })
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    })
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')
    setProfileLoading(true)

    try {
      const updatedUser = await api.auth.updateProfile(user!.id, profileData)
      login(updatedUser) // Mettre à jour le contexte
      setProfileSuccess('Profil mis à jour avec succès !')
      setTimeout(() => setProfileSuccess(''), 3000)
    } catch (err: any) {
      setProfileError(err.message || 'Erreur lors de la mise à jour')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas')
      return
    }

    setPasswordLoading(true)

    try {
      await api.auth.changePassword(
        user!.id,
        passwordData.currentPassword,
        passwordData.newPassword
      )
      setPasswordSuccess('Mot de passe changé avec succès !')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setPasswordSuccess(''), 3000)
    } catch (err: any) {
      setPasswordError(err.message || 'Erreur lors du changement de mot de passe')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="user-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-container">
          <div className="logo">
            <h1>Centre Yasbreton</h1>
          </div>
          <div className="user-section">
            <button onClick={() => navigate('/')} className="btn-back">
              ← Retour à l'accueil
            </button>
            <span className="user-name">{user?.prenom} {user?.nom}</span>
            <button onClick={logout} className="btn-logout">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-sidebar">
            <h2>Mon Compte</h2>
            <nav className="dashboard-nav">
              <button
                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Informations personnelles
              </button>
              <button
                className={`nav-item ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                Mot de passe
              </button>
              <button
                className={`nav-item ${activeTab === 'premium' ? 'active' : ''}`}
                onClick={() => setActiveTab('premium')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                Abonnement Premium
              </button>
            </nav>
          </div>

          <div className="dashboard-content">
            {activeTab === 'profile' && (
              <div className="content-section">
                <div className="section-header">
                  <div className="section-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div>
                    <h2>Informations personnelles</h2>
                    <p className="section-description">
                      Gérez vos informations personnelles et coordonnées
                    </p>
                  </div>
                </div>

                <div className="form-card">
                  {profileSuccess && <div className="success-message">{profileSuccess}</div>}
                  {profileError && <div className="error-message">{profileError}</div>}

                  {user?.isPremium && (
                    <div className="premium-status-banner">
                      <div className="premium-status-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5z" />
                          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                      </div>
                      <div className="premium-status-info">
                        <strong>Compte Premium actif</strong>
                        <span>
                          Abonnement {user.subscriptionType === 'monthly' ? 'mensuel' : user.subscriptionType === 'quarterly' ? 'trimestriel' : 'annuel'}
                          {user.premiumExpiresAt && ` • Expire le ${new Date(user.premiumExpiresAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}`}
                        </span>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleProfileSubmit} className="profile-form">
                    <div className="form-group">
                      <label htmlFor="nom">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        Nom
                      </label>
                      <input
                        id="nom"
                        name="nom"
                        type="text"
                        value={profileData.nom}
                        onChange={handleProfileChange}
                        placeholder="Entrez votre nom de famille"
                        required
                        disabled={profileLoading}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="prenom">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        Prénom
                      </label>
                      <input
                        id="prenom"
                        name="prenom"
                        type="text"
                        value={profileData.prenom}
                        onChange={handleProfileChange}
                        placeholder="Entrez votre prénom"
                        required
                        disabled={profileLoading}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={user?.email}
                        disabled
                        className="disabled-input"
                      />
                      <small className="input-hint">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="16" x2="12" y2="12"/>
                          <line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                        L'email ne peut pas être modifié
                      </small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="telephone">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                        </svg>
                        Numéro de téléphone
                      </label>
                      <input
                        id="telephone"
                        name="telephone"
                        type="tel"
                        value={profileData.telephone}
                        onChange={handleProfileChange}
                        placeholder="Ex: 06 12 34 56 78"
                        required
                        disabled={profileLoading}
                      />
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn-save" disabled={profileLoading}>
                        {profileLoading ? (
                          <>
                            <div className="spinner-small"></div>
                            Enregistrement...
                          </>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                            <polyline points="17 21 17 13 7 13 7 21"/>
                            <polyline points="7 3 7 8 15 8"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="content-section">
                <div className="section-header">
                  <div className="section-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                  </div>
                  <div>
                    <h2>Changer le mot de passe</h2>
                    <p className="section-description">
                      Assurez-vous d'utiliser un mot de passe sécurisé
                    </p>
                  </div>
                </div>

                <div className="form-card">
                  {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}
                  {passwordError && <div className="error-message">{passwordError}</div>}

                  <div className="security-tips">
                    <h3>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      Conseils de sécurité
                    </h3>
                    <ul>
                      <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Utilisez au moins 8 caractères
                      </li>
                      <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Mélangez lettres, chiffres et symboles
                      </li>
                      <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Évitez les mots courants
                      </li>
                    </ul>
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="password-form">
                    <div className="form-group">
                      <label htmlFor="currentPassword">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="3"/>
                          <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
                        </svg>
                        Mot de passe actuel
                      </label>
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Entrez votre mot de passe actuel"
                        required
                        disabled={passwordLoading}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="newPassword">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0110 0v4"/>
                        </svg>
                        Nouveau mot de passe
                      </label>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Entrez votre nouveau mot de passe"
                        required
                        disabled={passwordLoading}
                      />
                      <small className="input-hint">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="16" x2="12" y2="12"/>
                          <line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                        Minimum 6 caractères
                      </small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirmPassword">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Confirmer le nouveau mot de passe
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirmez votre nouveau mot de passe"
                        required
                        disabled={passwordLoading}
                      />
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn-save" disabled={passwordLoading}>
                        {passwordLoading ? (
                          <>
                            <div className="spinner-small"></div>
                            Changement...
                          </>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'premium' && user && (
              <div className="content-section">
                <PremiumSection
                  user={{
                    id: user.id,
                    isPremium: user.isPremium,
                    premiumExpiresAt: user.premiumExpiresAt,
                    subscriptionType: user.subscriptionType,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
