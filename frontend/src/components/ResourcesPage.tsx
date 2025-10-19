import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api, FileResource, Category } from '../lib/convex-client'
import FileViewer from './FileViewer'
import './ResourcesPage.css'

interface ResourcesPageProps {
  onOpenLogin?: () => void
}

export default function ResourcesPage({ onOpenLogin }: ResourcesPageProps) {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [files, setFiles] = useState<FileResource[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<'all' | 'free' | 'premium'>('all')
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all')
  const [viewingFile, setViewingFile] = useState<FileResource | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [filesData, categoriesData] = await Promise.all([
        api.files.getFiles(),
        api.categories.getAll(),
      ])
      setFiles(filesData)
      setCategories(categoriesData)
    } catch (err) {
      console.error('Error loading resources:', err)
    } finally {
      setLoading(false)
    }
  }


  // Obtenir les sous-catégories (catégories avec parentId)
  const subcategories = categories.filter(cat => cat.parentId)
  
  // Filtrer les sous-catégories selon la catégorie principale sélectionnée
  const filteredSubcategories = selectedCategory === 'all' 
    ? subcategories 
    : subcategories.filter(sub => sub.parentId === selectedCategory)

  // Filtrer les fichiers
  const filteredFiles = files.filter(file => {
    const matchSearch = searchTerm === '' || 
      file.titleFr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.titleAr.includes(searchTerm) ||
      file.descriptionFr.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchCategory = selectedCategory === 'all' || file.categories.includes(selectedCategory)
    const matchType = selectedType === 'all' || file.type === selectedType
    const matchSubcategory = selectedSubcategory === 'all' || file.categories.includes(selectedSubcategory)

    return matchSearch && matchCategory && matchType && matchSubcategory
  })

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find(c => c._id === categoryId)
    return cat ? cat.nameFr : ''
  }

  // Obtenir uniquement les catégories principales (sans parentId)
  const mainCategories = categories.filter(cat => !cat.parentId).sort((a, b) => a.order - b.order)

  return (
    <div className="resources-page">
      {/* Hero Section */}
      <section className="resources-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content-wrapper">
          <button onClick={() => navigate('/')} className="btn-back-home">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Retour à l'accueil
          </button>
          <h1 className="hero-title">Bibliothèque de Ressources</h1>
          <p className="hero-subtitle">
            Découvrez nos ressources pédagogiques et outils pratiques
          </p>
        </div>
      </section>


      {/* Filters Section */}
      <section className="filters-section">
        <div className="filters-container">
          {/* Search Bar */}
          <div className="search-bar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher une ressource..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="clear-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="filter-pills">
            <div className="filter-group">
              <label>Type :</label>
              <button
                className={`pill ${selectedType === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedType('all')}
              >
                Tous
              </button>
              <button
                className={`pill ${selectedType === 'free' ? 'active' : ''}`}
                onClick={() => setSelectedType('free')}
              >
                Gratuit
              </button>
              <button
                className={`pill ${selectedType === 'premium' ? 'active' : ''}`}
                onClick={() => setSelectedType('premium')}
              >
                Premium
              </button>
            </div>

            {mainCategories.length > 0 && (
              <div className="filter-group">
                <label>Catégorie :</label>
                <button
                  className={`pill ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory('all')
                    setSelectedSubcategory('all')
                  }}
                >
                  Toutes
                </button>
                {mainCategories.map(category => (
                  <button
                    key={category._id}
                    className={`pill ${selectedCategory === category._id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(category._id)
                      setSelectedSubcategory('all')
                    }}
                  >
                    {category.nameFr}
                  </button>
                ))}
              </div>
            )}

            {selectedCategory !== 'all' && filteredSubcategories.length > 0 && (
              <div className="filter-group">
                <label>Sous-catégorie :</label>
                <button
                  className={`pill ${selectedSubcategory === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedSubcategory('all')}
                >
                  Toutes
                </button>
                {filteredSubcategories.map(subcategory => (
                  <button
                    key={subcategory._id}
                    className={`pill ${selectedSubcategory === subcategory._id ? 'active' : ''}`}
                    onClick={() => setSelectedSubcategory(subcategory._id)}
                  >
                    {subcategory.nameFr}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="results-count">
            {filteredFiles.length} ressource{filteredFiles.length > 1 ? 's' : ''} trouvée{filteredFiles.length > 1 ? 's' : ''}
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="resources-grid-section">
        <div className="resources-container">
          {loading ? (
            <div className="loading-state">
              <div className="loader"></div>
              <p>Chargement des ressources...</p>
            </div>
          ) : filteredFiles.length > 0 ? (
            <div className="resources-grid">
              {filteredFiles.map((file) => (
                <div key={file._id} className="resource-card">
                  <div className="resource-card-header">
                    <div className="resource-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                        <polyline points="13 2 13 9 20 9" />
                      </svg>
                    </div>
                    <span className={`type-badge ${file.type}`}>
                      {file.type === 'free' ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Gratuit
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                          </svg>
                          Premium
                        </>
                      )}
                    </span>
                  </div>

                  <div className="resource-card-body">
                    <h3 className="resource-title">{file.titleFr}</h3>
                    <p className="resource-title-ar">{file.titleAr}</p>
                    <p className="resource-description">{file.descriptionFr}</p>

                    {file.categories.length > 0 && (
                      <div className="resource-categories">
                        {file.categories.map((catId, idx) => (
                          <span key={idx} className="category-badge">
                            {getCategoryName(catId)}
                          </span>
                        ))}
                      </div>
                    )}


                    <div className="resource-meta">
                      <span className="meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                        </svg>
                        {formatFileSize(file.fileSize)}
                      </span>
                    </div>
                  </div>

                  <div className="resource-card-footer">
                    {/* Bouton Lire - conditionnel selon le type de fichier et le statut premium */}
                    {isAuthenticated ? (
                      // Utilisateur connecté
                      file.type === 'free' || user?.isPremium ? (
                        // Fichier gratuit OU utilisateur premium : peut lire
                        <button
                          onClick={() => setViewingFile(file)}
                          className="btn-read"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          Lire
                        </button>
                      ) : (
                        // Fichier premium mais utilisateur non premium : bouton désactivé
                        <button
                          className="btn-read btn-premium-locked"
                          disabled
                          title="Contenu premium - Abonnement requis"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0110 0v4" />
                          </svg>
                          Lire
                        </button>
                      )
                    ) : (
                      // Visiteur non connecté : peut lire les fichiers gratuits
                      file.type === 'free' ? (
                        <button
                          onClick={() => setViewingFile(file)}
                          className="btn-read"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          Lire
                        </button>
                      ) : (
                        // Fichier premium : doit se connecter
                        <button
                          onClick={onOpenLogin}
                          className="btn-read btn-login-required"
                          title="Connectez-vous pour accéder au contenu premium"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
                          </svg>
                          Se connecter
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
              <h3>Aucune ressource trouvée</h3>
              <p>Essayez de modifier vos filtres de recherche</p>
            </div>
          )}
        </div>
      </section>

      {/* File Viewer Modal */}
      {viewingFile && (
        <FileViewer
          fileUrl={viewingFile.fileUrl}
          fileName={viewingFile.fileName}
          fileType={viewingFile.fileType}
          onClose={() => setViewingFile(null)}
        />
      )}
    </div>
  )
}
