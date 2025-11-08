import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, Formation, FormationSection, FormationLesson, FileResource } from '../lib/convex-client'
import './FormationEditor.css'

export default function FormationEditor() {
  const { formationId } = useParams<{ formationId: string }>()
  const navigate = useNavigate()
  const [formation, setFormation] = useState<Formation | null>(null)
  const [sections, setSections] = useState<FormationSection[]>([])
  const [lessons, setLessons] = useState<{ [sectionId: string]: FormationLesson[] }>({})
  const [loading, setLoading] = useState(true)
  
  // États pour les modals
  const [showSectionModal, setShowSectionModal] = useState(false)
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [editingSection, setEditingSection] = useState<FormationSection | null>(null)
  const [editingLesson, setEditingLesson] = useState<FormationLesson | null>(null)
  const [selectedSectionId, setSelectedSectionId] = useState<string>('')
  
  // Données des formulaires
  const [sectionData, setSectionData] = useState({ title: '' })
  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    lessonType: 'video' as 'video' | 'resource',
    videoUrl: '',
    resourceId: '',
    duration: 0,
    isFree: false
  })
  const [resources, setResources] = useState<FileResource[]>([])
  const [availableTags, setAvailableTags] = useState<Array<{ _id: string; name: string }>>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [filteredResources, setFilteredResources] = useState<FileResource[]>([])

  useEffect(() => {
    if (formationId) {
      loadFormationData()
      loadResources()
    }
  }, [formationId])

  // Filtrer les ressources par tags sélectionnés
  useEffect(() => {
    if (selectedTags.length === 0) {
      setFilteredResources(resources)
    } else {
      const filtered = resources.filter(resource => 
        selectedTags.some(tag => resource.tags.includes(tag))
      )
      setFilteredResources(filtered)
    }
  }, [selectedTags, resources])

  const handleToggleTag = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    )
  }

  const loadResources = async () => {
    try {
      const [allResources, tags] = await Promise.all([
        api.files.getFiles(),
        api.tags.getAll()
      ])
      setResources(allResources)
      setFilteredResources(allResources)
      setAvailableTags(tags)
    } catch (error) {
      console.error('Erreur lors du chargement des ressources:', error)
    }
  }

  const loadFormationData = async () => {
    try {
      setLoading(true)
      const [formationData, sectionsData] = await Promise.all([
        api.formations.getFormationById(formationId!),
        api.formations.getSectionsByFormation(formationId!)
      ])
      
      setFormation(formationData)
      setSections(sectionsData)
      
      // Charger les leçons pour chaque section
      const lessonsData: { [key: string]: FormationLesson[] } = {}
      for (const section of sectionsData) {
        const sectionLessons = await api.formations.getLessonsBySection(section._id)
        lessonsData[section._id] = sectionLessons
      }
      setLessons(lessonsData)
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  // Gestion des sections
  const handleAddSection = () => {
    setSectionData({ title: '' })
    setEditingSection(null)
    setShowSectionModal(true)
  }

  const handleEditSection = (section: FormationSection) => {
    setEditingSection(section)
    setSectionData({ title: section.title })
    setShowSectionModal(true)
  }

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingSection) {
        await api.formations.updateSection({
          sectionId: editingSection._id,
          title: sectionData.title
        })
      } else {
        await api.formations.createSection({
          formationId: formationId!,
          title: sectionData.title,
          order: sections.length
        })
      }
      setShowSectionModal(false)
      await loadFormationData()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Supprimer cette section et toutes ses leçons ?')) return
    try {
      await api.formations.deleteSection(sectionId)
      await loadFormationData()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  // Gestion des leçons
  const handleAddLesson = (sectionId: string) => {
    setSelectedSectionId(sectionId)
    setLessonData({ title: '', description: '', lessonType: 'video', videoUrl: '', resourceId: '', duration: 0, isFree: false })
    setEditingLesson(null)
    setShowLessonModal(true)
  }

  const handleEditLesson = (lesson: FormationLesson) => {
    setEditingLesson(lesson)
    setSelectedSectionId(lesson.sectionId)
    setLessonData({
      title: lesson.title,
      description: lesson.description || '',
      lessonType: lesson.lessonType || 'video',
      videoUrl: lesson.videoUrl || '',
      resourceId: lesson.resourceId || '',
      duration: lesson.duration,
      isFree: lesson.isFree || false
    })
    setShowLessonModal(true)
  }

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const lessonPayload: any = {
        title: lessonData.title,
        description: lessonData.description,
        lessonType: lessonData.lessonType,
        duration: lessonData.duration,
        isFree: lessonData.isFree
      }

      if (lessonData.lessonType === 'video') {
        lessonPayload.videoUrl = lessonData.videoUrl
      } else {
        lessonPayload.resourceId = lessonData.resourceId
      }

      if (editingLesson) {
        await api.formations.updateLesson({
          lessonId: editingLesson._id,
          ...lessonPayload
        })
      } else {
        const sectionLessons = lessons[selectedSectionId] || []
        await api.formations.createLesson({
          sectionId: selectedSectionId,
          formationId: formationId!,
          ...lessonPayload,
          order: sectionLessons.length
        })
      }
      setShowLessonModal(false)
      await loadFormationData()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Supprimer cette leçon ?')) return
    try {
      await api.formations.deleteLesson(lessonId)
      await loadFormationData()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  if (loading) {
    return (
      <div className="formation-editor">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  if (!formation) {
    return <div className="formation-editor"><p>Formation introuvable</p></div>
  }

  return (
    <div className="formation-editor">
      {/* Header */}
      <div className="editor-header">
        <button className="btn-back" onClick={() => navigate('/admin/formations')}>
          ← Retour aux formations
        </button>
        <div className="header-info">
          <h1>{formation.title}</h1>
          <p>Gestion du contenu de la formation</p>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="editor-content">
        <div className="content-header">
          <h2>Programme de la formation</h2>
        </div>
        
        {/* Bouton flottant pour ajouter une section */}
        <button className="btn-floating-add" onClick={handleAddSection} title="Ajouter une section">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>

        {/* Liste des sections */}
        {sections.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
            </svg>
            <h3>Aucune section</h3>
            <p>Commencez par créer votre première section</p>
          </div>
        ) : (
          <div className="sections-list">
            {sections.map((section, sectionIndex) => (
              <div key={section._id} className="section-card">
                <div className="section-header">
                  <div className="section-title">
                    <span className="section-number">Section {sectionIndex + 1}</span>
                    <h3>{section.title}</h3>
                  </div>
                  <div className="section-actions">
                    <button className="btn-icon" onClick={() => handleEditSection(section)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button className="btn-icon" onClick={() => handleAddLesson(section._id)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </button>
                    <button className="btn-icon btn-delete" onClick={() => handleDeleteSection(section._id)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Leçons de la section */}
                <div className="lessons-list">
                  {(!lessons[section._id] || lessons[section._id].length === 0) ? (
                    <p className="no-lessons">Aucune leçon. Cliquez sur + pour ajouter une leçon.</p>
                  ) : (
                    lessons[section._id].map((lesson, lessonIndex) => (
                      <div key={lesson._id} className="lesson-item">
                        <div className="lesson-icon">
                          {lesson.lessonType === 'resource' ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                              <polyline points="13 2 13 9 20 9"/>
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polygon points="5 3 19 12 5 21 5 3"/>
                            </svg>
                          )}
                        </div>
                        <div className="lesson-info">
                          <div className="lesson-title">
                            <span className="lesson-number">Leçon {lessonIndex + 1}</span>
                            <span>{lesson.title}</span>
                            {lesson.lessonType === 'resource' && <span className="badge-free" style={{ background: '#10b981' }}>RESSOURCE</span>}
                            {lesson.isFree && <span className="badge-free">Gratuit</span>}
                          </div>
                          <span className="lesson-duration">{lesson.duration} min</span>
                        </div>
                        <div className="lesson-actions">
                          <button className="btn-icon-small" onClick={() => handleEditLesson(lesson)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button className="btn-icon-small btn-delete" onClick={() => handleDeleteLesson(lesson._id)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18"/>
                              <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Section */}
      {showSectionModal && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSection ? 'Modifier la section' : 'Nouvelle section'}</h2>
              <button className="btn-close" onClick={() => setShowSectionModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveSection}>
              <div className="form-group">
                <label htmlFor="sectionTitle">Titre de la section *</label>
                <input
                  type="text"
                  id="sectionTitle"
                  value={sectionData.title}
                  onChange={(e) => setSectionData({ title: e.target.value })}
                  placeholder="Ex: Introduction, Concepts de base..."
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowSectionModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-submit">
                  {editingSection ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Leçon */}
      {showLessonModal && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingLesson ? 'Modifier la leçon' : 'Nouvelle leçon'}</h2>
              <button className="btn-close" onClick={() => setShowLessonModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveLesson}>
              <div className="form-group">
                <label htmlFor="lessonTitle">Titre de la leçon *</label>
                <input
                  type="text"
                  id="lessonTitle"
                  value={lessonData.title}
                  onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lessonDescription">Description</label>
                <textarea
                  id="lessonDescription"
                  value={lessonData.description}
                  onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              {/* Type de leçon - Design simplifié */}
              <div className="form-group">
                <label>Type de leçon *</label>
                <div className="lesson-type-selector">
                  <button
                    type="button"
                    className={`lesson-type-btn ${lessonData.lessonType === 'video' ? 'active' : ''}`}
                    onClick={() => setLessonData({ ...lessonData, lessonType: 'video' })}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    <span>Vidéo YouTube</span>
                  </button>
                  <button
                    type="button"
                    className={`lesson-type-btn ${lessonData.lessonType === 'resource' ? 'active' : ''}`}
                    onClick={() => setLessonData({ ...lessonData, lessonType: 'resource' })}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                      <polyline points="13 2 13 9 20 9"/>
                    </svg>
                    <span>Ressource (fichier)</span>
                  </button>
                </div>
              </div>

              {/* Champ conditionnel selon le type */}
              {lessonData.lessonType === 'video' ? (
                <div className="form-group">
                  <label htmlFor="lessonVideoUrl">URL de la vidéo YouTube *</label>
                  <input
                    type="url"
                    id="lessonVideoUrl"
                    value={lessonData.videoUrl}
                    onChange={(e) => setLessonData({ ...lessonData, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                </div>
              ) : (
                <div className="resource-selection-container">
                  {/* Sélection par tags - Design simplifié */}
                  {availableTags.length > 0 && (
                    <div className="form-group">
                      <label className="label-with-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                          <line x1="7" y1="7" x2="7.01" y2="7"/>
                        </svg>
                        Filtrer par tags
                      </label>
                      <div className="tags-filter-simple">
                        {availableTags.map((tag) => (
                          <button
                            key={tag._id}
                            type="button"
                            className={`tag-chip ${selectedTags.includes(tag.name) ? 'selected' : ''}`}
                            onClick={() => handleToggleTag(tag.name)}
                          >
                            #{tag.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sélection de la ressource */}
                  <div className="form-group">
                    <label htmlFor="lessonResource" className="label-with-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                        <polyline points="13 2 13 9 20 9"/>
                      </svg>
                      Sélectionner une ressource *
                    </label>
                    <select
                      id="lessonResource"
                      value={lessonData.resourceId}
                      onChange={(e) => setLessonData({ ...lessonData, resourceId: e.target.value })}
                      required
                      className="resource-select"
                    >
                      <option value="">-- Choisir une ressource --</option>
                      {filteredResources.map((resource) => (
                        <option key={resource._id} value={resource._id}>
                          {resource.titleFr} • {resource.type === 'premium' ? '⭐ Premium' : '✓ Gratuit'}
                        </option>
                      ))}
                    </select>
                    {selectedTags.length > 0 && (
                      <div className="filter-result-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span>{filteredResources.length} ressource(s) trouvée(s)</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="lessonDuration">Durée (minutes) *</label>
                <input
                  type="number"
                  id="lessonDuration"
                  value={lessonData.duration}
                  onChange={(e) => setLessonData({ ...lessonData, duration: Number(e.target.value) })}
                  min="0"
                  required
                />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={lessonData.isFree}
                    onChange={(e) => setLessonData({ ...lessonData, isFree: e.target.checked })}
                  />
                  <span>Leçon gratuite (accessible sans abonnement)</span>
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowLessonModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-submit">
                  {editingLesson ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
