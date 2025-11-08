import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Home.css'

export default function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="home">
      {/* Header / Navigation */}
      <header className="home-header">
        <div className="header-container">
          <div className="logo">
            <h1>Centre Yasbreton</h1>
          </div>
          <nav className="nav-menu">
            <button onClick={() => navigate('/resources')} className="nav-link-btn">Ressources</button>
            <button onClick={() => navigate('/tasks')} className="nav-link-btn">Tâches</button>
          </nav>
          <div className="user-section">
            {user?.role === 'admin' && (
              <button onClick={() => navigate('/admin')} className="btn-admin">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                Admin
              </button>
            )}
            {user?.role === 'restricted' && (
              <button onClick={() => navigate('/restricted')} className="btn-admin">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                Tableau de bord
              </button>
            )}
            {user?.role === 'user' && (
              <button onClick={() => navigate('/dashboard')} className="user-name-button">
                {user?.prenom} {user?.nom}
              </button>
            )}
            <button onClick={logout} className="btn-logout">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Bienvenue, {user?.prenom} !
          </h1>
          <p className="hero-subtitle">
            Tout ce dont vous avez besoin pour accompagner le développement de votre enfant
          </p>
          <p className="hero-description">
            Accédez à des formations, ressources et outils pratiques pour accompagner
            le développement de vos enfants avec confiance et bienveillance.
          </p>
          <div className="hero-buttons">
            {user?.role === 'restricted' ? (
              <button onClick={() => navigate('/restricted')} className="btn-primary-hero">
                Mon tableau de bord
              </button>
            ) : (
              <button onClick={() => navigate('/dashboard')} className="btn-primary-hero">
                Mon tableau de bord
              </button>
            )}
            <button onClick={() => navigate('/resources')} className="btn-secondary-hero">
              Découvrir les ressources
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-illustration">
            <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
              <circle cx="200" cy="200" r="150" fill="#E0F2FE" opacity="0.5"/>
              <circle cx="200" cy="200" r="120" fill="#BAE6FD" opacity="0.6"/>
              <circle cx="200" cy="200" r="90" fill="#7DD3FC" opacity="0.7"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="section-title">Explorez nos ressources</h2>
          <p className="section-subtitle">
            Tout ce dont vous avez besoin pour accompagner le développement de votre enfant
          </p>
          
          <div className="features-grid">
            {/* Ressources Card */}
            <div className="feature-card" onClick={() => navigate('/resources')}>
              <div className="feature-card-header">
                <div className="feature-icon resources-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                </div>
                <h3>Ressources</h3>
              </div>
              <p className="feature-description">
                Une bibliothèque complète de documents, guides pratiques et outils
                téléchargeables pour vous accompagner au quotidien.
              </p>
              <div className="feature-stats">
                <div className="stat-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <span>Téléchargeable</span>
                </div>
                <div className="stat-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                  <span>Gratuit</span>
                </div>
              </div>
              <button className="feature-btn">
                Parcourir les ressources
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

            {/* Tâches Card */}
            <div className="feature-card" onClick={() => navigate('/tasks')}>
              <div className="feature-card-header">
                <div className="feature-icon tasks-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 11 12 14 22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                </div>
                <h3>Tâches ABLLS-R</h3>
              </div>
              <p className="feature-description">
                Explorez les tâches d'évaluation ABLLS-R pour suivre et accompagner
                le développement des compétences de votre enfant.
              </p>
              <div className="feature-stats">
                <div className="stat-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <span>Structuré</span>
                </div>
                <div className="stat-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                  <span>Progressif</span>
                </div>
              </div>
              <button className="feature-btn">
                Explorer les tâches
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <p>&copy; 2025 Centre Yasbreton. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
