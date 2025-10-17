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
              <div key={formation._id} className="formation-card">
                {formation.thumbnail ? (
                  <div className="formation-thumbnail">
                    <img src={formation.thumbnail} alt={formation.title} />
                    {formation.isPremium && (
                      <span className="badge-premium">Premium</span>
                    )}
                  </div>
                ) : (
                  <div className="formation-thumbnail placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                    {formation.isPremium && (
                      <span className="badge-premium">Premium</span>
                    )}
                  </div>
                )}
                
                <div className="formation-body">
                  <div className="formation-category">{formation.category}</div>
                  <h3 className="formation-title">{formation.title}</h3>
                  <p className="formation-instructor">Par {formation.instructor}</p>
                  <p className="formation-description">{formation.description}</p>
                  
                  <div className="formation-meta">
                    <span className="meta-badge level">
                      {getLevelLabel(formation.level)}
                    </span>
                    <span className="meta-badge duration">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {formatDuration(formation.duration)}
                    </span>
                  </div>

                  <div className="formation-footer">
                    <div className="formation-price">
                      {formation.price === 0 ? (
                        <span className="price-free">Gratuit</span>
                      ) : (
                        <span className="price-amount">{formation.price} €</span>
                      )}
                    </div>
                    <button 
                      className="btn-enroll"
                      onClick={() => navigate(`/formations/${formation._id}`)}
                    >
                      Voir la formation
                    </button>
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
