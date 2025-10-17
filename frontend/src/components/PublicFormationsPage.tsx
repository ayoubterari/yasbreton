import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, Formation } from '../lib/convex-client'
import './PublicFormationsPage.css'

export default function PublicFormationsPage() {
  const navigate = useNavigate()
  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')

  useEffect(() => {
    loadFormations()
  }, [])

  const loadFormations = async () => {
    try {
      setLoading(true)
      const allFormations = await api.formations.getAllFormations()
      // Filtrer uniquement les formations publiées
      const publishedFormations = allFormations.filter(f => f.published && !f.deleted)
      setFormations(publishedFormations)
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['all', ...Array.from(new Set(formations.map(f => f.category)))]
  
  const filteredFormations = formations.filter(formation => {
    const categoryMatch = selectedCategory === 'all' || formation.category === selectedCategory
    const levelMatch = selectedLevel === 'all' || formation.level === selectedLevel
    return categoryMatch && levelMatch
  })

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`
    }
    return `${mins} min`
  }

  const getLevelLabel = (level: string) => {
    const labels: { [key: string]: string } = {
      'debutant': 'Débutant',
      'intermediaire': 'Intermédiaire',
      'avance': 'Avancé'
    }
    return labels[level] || level
  }

  if (loading) {
    return (
      <div className="public-formations-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement des formations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="public-formations-page">
      {/* Header */}
      <header className="formations-header">
        <div className="header-container">
          <button onClick={() => navigate('/')} className="btn-back-home">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Retour à l'accueil
          </button>
          <div className="header-content">
            <h1>Nos Formations</h1>
            <p>Développez vos compétences avec nos formations en ligne</p>
          </div>
        </div>
      </header>

      {/* Filtres */}
      <div className="filters-section">
        <div className="filters-container">
          <div className="filter-group">
            <label>Catégorie</label>
            <div className="filter-buttons">
              {categories.map(category => (
                <button
                  key={category}
                  className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? 'Toutes' : category}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Niveau</label>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${selectedLevel === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedLevel('all')}
              >
                Tous
              </button>
              <button
                className={`filter-btn ${selectedLevel === 'debutant' ? 'active' : ''}`}
                onClick={() => setSelectedLevel('debutant')}
              >
                Débutant
              </button>
              <button
                className={`filter-btn ${selectedLevel === 'intermediaire' ? 'active' : ''}`}
                onClick={() => setSelectedLevel('intermediaire')}
              >
                Intermédiaire
              </button>
              <button
                className={`filter-btn ${selectedLevel === 'avance' ? 'active' : ''}`}
                onClick={() => setSelectedLevel('avance')}
              >
                Avancé
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grille des formations */}
      <div className="formations-content">
        {filteredFormations.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            <h3>Aucune formation disponible</h3>
            <p>Revenez bientôt pour découvrir nos nouvelles formations</p>
          </div>
        ) : (
          <div className="formations-grid">
            {filteredFormations.map(formation => (
              <div key={formation._id} className="formation-card" onClick={() => navigate(`/formations/${formation._id}`)}>
                <div className="formation-thumbnail-wrapper">
                  {formation.thumbnail ? (
                    <img 
                      src={formation.thumbnail} 
                      alt={formation.title}
                      className="formation-thumbnail-img"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const placeholder = target.nextElementSibling as HTMLElement;
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="formation-thumbnail-placeholder" style={{ display: formation.thumbnail ? 'none' : 'flex' }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                    </svg>
                  </div>
                  <div className="formation-overlay">
                    <div className="overlay-content">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.2)" stroke="white"/>
                        <polygon points="10 8 16 12 10 16 10 8" fill="white"/>
                      </svg>
                      <span>Voir la formation</span>
                    </div>
                  </div>
                  {formation.isPremium && (
                    <span className="badge-premium">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                      </svg>
                      Premium
                    </span>
                  )}
                </div>
                
                <div className="formation-body">
                  <div className="formation-header">
                    <span className="formation-category">{formation.category}</span>
                    <span className="meta-badge level">
                      {getLevelLabel(formation.level)}
                    </span>
                  </div>
                  
                  <h3 className="formation-title">{formation.title}</h3>
                  <p className="formation-instructor">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    {formation.instructor}
                  </p>
                  <p className="formation-description">{formation.description}</p>
                  
                  <div className="formation-footer">
                    <div className="formation-meta">
                      <span className="meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {formatDuration(formation.duration)}
                      </span>
                    </div>
                    <div className="formation-price">
                      {formation.price === 0 ? (
                        <span className="price-free">Gratuit</span>
                      ) : (
                        <span className="price-amount">{formation.price}€</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
