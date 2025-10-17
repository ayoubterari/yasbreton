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
            <button onClick={() => navigate('/formations')} className="nav-link-btn">Formations</button>
            <button onClick={() => navigate('/resources')} className="nav-link-btn">Ressources</button>
            <button onClick={() => navigate('/tasks')} className="nav-link-btn">Tâches</button>
            <button onClick={() => navigate('/domains')} className="nav-link-btn">Domaines</button>
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
            <button onClick={() => navigate('/formations')} className="btn-secondary-hero">
              Découvrir les formations
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
            {/* Formations Card */}
            <div className="feature-card" onClick={() => navigate('/formations')}>
              <div className="feature-card-header">
                <div className="feature-icon formations-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                </div>
                <h3>Formations</h3>
              </div>
              <p className="feature-description">
                Des formations complètes et structurées pour développer vos compétences parentales
                et comprendre les méthodes éducatives modernes.
              </p>
              <div className="feature-stats">
                <div className="stat-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  <span>Certifiées</span>
                </div>
                <div className="stat-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <span>Expert</span>
                </div>
              </div>
              <button className="feature-btn">
                Voir les formations
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

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

            {/* Domaines Card */}
            <div className="feature-card" onClick={() => navigate('/domains')}>
              <div className="feature-card-header">
                <div className="feature-icon domains-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <h3>Domaines</h3>
              </div>
              <p className="feature-description">
                Naviguez par domaines de compétences pour trouver rapidement
                les tâches et activités adaptées à vos besoins.
              </p>
              <div className="feature-stats">
                <div className="stat-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  <span>Organisé</span>
                </div>
                <div className="stat-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  <span>Recherche</span>
                </div>
              </div>
              <button className="feature-btn">
                Parcourir les domaines
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
