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
            <a href="#guidance">Guidance</a>
            <button onClick={() => navigate('/resources')} className="nav-link-btn">Ressources</button>
            <button onClick={() => navigate('/tasks')} className="nav-link-btn">Tâches</button>
            <button onClick={() => navigate('/domains')} className="nav-link-btn">Domaines</button>
            <a href="#apropos">À propos</a>
            <a href="#contact">Contact</a>
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
            <button onClick={() => navigate('/dashboard')} className="user-name-button">
              {user?.prenom} {user?.nom}
            </button>
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
            Formations & Guidance Parentale
          </h1>
          <p className="hero-subtitle">
            Transmettre les outils pour agir au quotidien
          </p>
          <p className="hero-description">
            Accompagnement personnalisé pour les parents souhaitant développer
            des compétences éducatives et renforcer leur confiance dans leur rôle parental.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary-hero">Découvrir nos formations</button>
            <button className="btn-secondary-hero">Prendre rendez-vous</button>
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

      {/* Services Section */}
      <section className="services" id="formations">
        <div className="services-container">
          <h2 className="section-title">Nos Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <h3>Formations Parentales</h3>
              <p>
                Ateliers et formations pour développer vos compétences parentales
                et mieux comprendre les besoins de vos enfants.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <h3>Guidance Parentale</h3>
              <p>
                Accompagnement individuel pour répondre à vos questions spécifiques
                et trouver des solutions adaptées à votre famille.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <h3>Outils Pratiques</h3>
              <p>
                Ressources et outils concrets pour gérer le quotidien avec vos enfants
                et renforcer votre confiance parentale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about" id="about">
        <div className="about-container">
          <div className="about-content">
            <h2 className="section-title">Notre Mission</h2>
            <p className="about-text">
              Le Centre Yasbreton accompagne les parents dans leur parcours éducatif
              en leur transmettant des outils pratiques et des connaissances fondées
              sur les dernières recherches en psychologie de l'enfant.
            </p>
            <p className="about-text">
              Notre approche bienveillante et personnalisée vous permet de développer
              votre confiance et de créer des relations familiales harmonieuses.
            </p>
            <div className="stats">
              <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">Familles accompagnées</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">15+</div>
                <div className="stat-label">Années d'expérience</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">98%</div>
                <div className="stat-label">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact" id="contact">
        <div className="contact-container">
          <h2 className="section-title">Contactez-nous</h2>
          <p className="contact-subtitle">
            Vous avez des questions ? N'hésitez pas à nous contacter
          </p>
          <div className="contact-info">
            <div className="contact-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <span>contact@centre-yasbreton.fr</span>
            </div>
            <div className="contact-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              <span>+33 1 23 45 67 89</span>
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
