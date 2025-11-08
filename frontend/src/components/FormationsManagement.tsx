import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api, Formation } from '../lib/convex-client'
import FormationStatsModal from './FormationStatsModal'
import './FormationsManagement.css'

export default function FormationsManagement() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null)
  const [editingFormation, setEditingFormation] = useState<Formation | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    previewVideoUrl: '',
    category: '',
    level: 'debutant' as 'debutant' | 'intermediaire' | 'avance',
    duration: 0,
    price: 0,
    isPremium: false,
    instructor: ''
  })
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadFormations()
  }, [])

  const loadFormations = async () => {
    try {
      setLoading(true)
      const allFormations = await api.formations.getAllFormations()
      setFormations(allFormations)
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error)
      alert('Erreur lors du chargement des formations')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? Number(value) : value
    })
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedImage(file)
      
      // Créer une prévisualisation
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    try {
      // Étape 1 : Obtenir une URL d'upload depuis Convex
      const uploadUrl = await api.files.generateUploadUrl()
      
      // Étape 2 : Uploader le fichier vers Convex Storage
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      
      if (!result.ok) {
        throw new Error('Échec de l\'upload de l\'image')
      }
      
      const { storageId } = await result.json()
      
      // Étape 3 : Obtenir l'URL de téléchargement
      const imageUrl = await api.files.getFileUrl(storageId)
      
      if (!imageUrl) {
        throw new Error('Impossible d\'obtenir l\'URL de l\'image')
      }
      
      return imageUrl
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      throw new Error('Impossible d\'uploader l\'image')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert('Vous devez être connecté')
      return
    }

    try {
      let thumbnailUrl = formData.thumbnail
      
      // Upload de l'image si une nouvelle image est sélectionnée
      if (selectedImage) {
        setUploading(true)
        thumbnailUrl = await uploadImage(selectedImage)
        setUploading(false)
      }
      
      if (editingFormation) {
        await api.formations.updateFormation({
          formationId: editingFormation._id,
          ...formData,
          thumbnail: thumbnailUrl
        })
      } else {
        await api.formations.createFormation({
          ...formData,
          thumbnail: thumbnailUrl,
          userId: user.id
        })
      }
      
      resetForm()
      await loadFormations()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde de la formation')
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (formation: Formation) => {
    setEditingFormation(formation)
    setFormData({
      title: formation.title,
      description: formation.description,
      thumbnail: formation.thumbnail || '',
      previewVideoUrl: formation.previewVideoUrl || '',
      category: formation.category,
      level: formation.level,
      duration: formation.duration,
      price: formation.price,
      isPremium: formation.isPremium,
      instructor: formation.instructor
    })
    setImagePreview(formation.thumbnail || '')
    setSelectedImage(null)
    setShowForm(true)
  }

  const handleDelete = async (formationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) return
    
    try {
      await api.formations.deleteFormation(formationId)
      await loadFormations()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleTogglePublish = async (formation: Formation) => {
    try {
      await api.formations.updateFormation({
        formationId: formation._id,
        published: !formation.published
      })
      await loadFormations()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      thumbnail: '',
      previewVideoUrl: '',
      category: '',
      level: 'debutant',
      duration: 0,
      price: 0,
      isPremium: false,
      instructor: ''
    })
    setEditingFormation(null)
    setSelectedImage(null)
    setImagePreview('')
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="formations-management">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="formations-management">
      <div className="page-header">
        <h1>Gestion des Formations</h1>
      </div>

      {/* Bouton flottant pour nouvelle formation */}
      <button 
        className="btn-floating-add" 
        onClick={() => setShowForm(true)}
        title="Créer une nouvelle formation"
        aria-label="Créer une nouvelle formation"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      {/* Formulaire Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingFormation ? 'Modifier la formation' : 'Créer une formation'}</h2>
              <button className="btn-close" onClick={resetForm}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="title">Titre de la formation *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="instructor">Instructeur *</label>
                  <input
                    type="text"
                    id="instructor"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description">Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Catégorie *</label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Ex: Guidance parentale, ABA..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="level">Niveau *</label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    required
                  >
                    <option value="debutant">Débutant</option>
                    <option value="intermediaire">Intermédiaire</option>
                    <option value="avance">Avancé</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="duration">Durée (minutes) *</label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="price">Prix (€) *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="thumbnailImage">Image de couverture</label>
                  <div className="image-upload-container">
                    <input
                      type="file"
                      id="thumbnailImage"
                      accept="image/*"
                      onChange={handleImageSelect}
                      disabled={uploading}
                      className="image-input"
                    />
                    <label htmlFor="thumbnailImage" className="image-upload-label">
                      {imagePreview ? (
                        <div className="image-preview-wrapper">
                          <img src={imagePreview} alt="Aperçu" className="image-preview" />
                          <div className="image-overlay">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                            </svg>
                            <span>Changer l'image</span>
                          </div>
                        </div>
                      ) : (
                        <div className="image-upload-placeholder">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                          <span className="upload-text">Cliquez pour sélectionner une image</span>
                          <span className="upload-hint">PNG, JPG, GIF jusqu'à 10MB</span>
                        </div>
                      )}
                    </label>
                    {selectedImage && (
                      <p className="file-selected-info">
                        📸 {selectedImage.name} ({(selectedImage.size / 1024).toFixed(2)} KB)
                      </p>
                    )}
                  </div>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="previewVideoUrl">URL de la vidéo de présentation (YouTube)</label>
                  <input
                    type="url"
                    id="previewVideoUrl"
                    name="previewVideoUrl"
                    value={formData.previewVideoUrl}
                    onChange={handleChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isPremium"
                      checked={formData.isPremium}
                      onChange={handleChange}
                    />
                    <span>Formation Premium</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={resetForm} disabled={uploading}>
                  Annuler
                </button>
                <button type="submit" className="btn-submit" disabled={uploading}>
                  {uploading ? 'Upload en cours...' : editingFormation ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste des formations */}
      <div className="formations-grid">
        {formations.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            <h3>Aucune formation</h3>
            <p>Commencez par créer votre première formation</p>
          </div>
        ) : (
          formations.map(formation => (
            <div key={formation._id} className="formation-card">
              <div className="formation-thumbnail">
                {formation.thumbnail ? (
                  <img src={formation.thumbnail} alt={formation.title} />
                ) : (
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                )}
              </div>
              <div className="formation-content">
                <div className="formation-header">
                  <h3>{formation.title}</h3>
                  <div className="formation-badges">
                    {formation.isPremium && <span className="badge premium">Premium</span>}
                    {formation.published ? (
                      <span className="badge published">Publié</span>
                    ) : (
                      <span className="badge draft">Brouillon</span>
                    )}
                  </div>
                </div>
                <p className="formation-instructor">Par {formation.instructor}</p>
                <p className="formation-description">{formation.description}</p>
                <div className="formation-meta">
                  <span className="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {formation.duration} min
                  </span>
                  <span className="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    {formation.level}
                  </span>
                  <span className="meta-item price">
                    {formation.price === 0 ? 'Gratuit' : `${formation.price} €`}
                  </span>
                </div>
                <div className="formation-actions">
                  <button 
                    className="btn-manage"
                    onClick={() => navigate(`/admin/formations/${formation._id}/edit`)}
                    title="Gérer le contenu"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                    </svg>
                    Gérer le contenu
                  </button>
                  <button 
                    className="btn-stats"
                    onClick={() => {
                      setSelectedFormation(formation)
                      setShowStatsModal(true)
                    }}
                    title="Statistiques"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="20" x2="12" y2="10"/>
                      <line x1="18" y1="20" x2="18" y2="4"/>
                      <line x1="6" y1="20" x2="6" y2="16"/>
                    </svg>
                    Statistiques
                  </button>
                  <button className="btn-icon" onClick={() => handleEdit(formation)} title="Modifier">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button 
                    className={`btn-icon ${formation.published ? 'published' : ''}`}
                    onClick={() => handleTogglePublish(formation)}
                    title={formation.published ? 'Dépublier' : 'Publier'}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="17 1 21 5 17 9"/>
                      <path d="M3 11V9a4 4 0 014-4h14"/>
                      <polyline points="7 23 3 19 7 15"/>
                      <path d="M21 13v2a4 4 0 01-4 4H3"/>
                    </svg>
                  </button>
                  <button className="btn-icon btn-delete" onClick={() => handleDelete(formation._id)} title="Supprimer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de statistiques */}
      {selectedFormation && (
        <FormationStatsModal
          isOpen={showStatsModal}
          onClose={() => {
            setShowStatsModal(false)
            setSelectedFormation(null)
          }}
          formation={selectedFormation}
        />
      )}
    </div>
  )
}
