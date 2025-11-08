import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { api, Formation, FormationSection, FormationLesson, FileResource } from '../lib/convex-client'
import { useAuth } from '../contexts/AuthContext'
import EnrollmentModal from './EnrollmentModal'
import './FormationDetailPage.css'

export default function FormationDetailPage() {
  const { formationId } = useParams<{ formationId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [formation, setFormation] = useState<Formation | null>(null)
  const [sections, setSections] = useState<FormationSection[]>([])
  const [lessons, setLessons] = useState<{ [sectionId: string]: FormationLesson[] }>({})
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showResourceModal, setShowResourceModal] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [selectedLesson, setSelectedLesson] = useState<FormationLesson | null>(null)
  const [selectedResource, setSelectedResource] = useState<FileResource | null>(null)
  const [showDescriptionModal, setShowDescriptionModal] = useState(false)

  useEffect(() => {
    if (formationId) {
      loadFormationData()
    }
    
    // Récupérer le message de succès depuis la navigation
    const state = location.state as { message?: string }
    if (state?.message) {
      setSuccessMessage(state.message)
      // Effacer le message après 5 secondes
      setTimeout(() => setSuccessMessage(''), 5000)
      // Nettoyer l'historique pour éviter de réafficher le message
      window.history.replaceState({}, document.title)
    }
  }, [formationId, location])

  const loadFormationData = async () => {
    try {
      setLoading(true)
      const [formationData, sectionsData] = await Promise.all([
        api.formations.getFormationById(formationId!),
        api.formations.getSectionsByFormation(formationId!)
      ])
      
      if (!formationData || !formationData.published) {
        navigate('/formations')
        return
      }

      setFormation(formationData)
      setSections(sectionsData)
      
      // Vérifier si l'utilisateur est inscrit
      if (user) {
        const enrolled = await api.formations.isUserEnrolled({
          userId: user.id,
          formationId: formationId!
        })
        setIsEnrolled(enrolled)
      }
      
      // Charger les leçons pour chaque section
      const lessonsData: { [key: string]: FormationLesson[] } = {}
      for (const section of sectionsData) {
        const sectionLessons = await api.formations.getLessonsBySection(section._id)
        lessonsData[section._id] = sectionLessons
      }
      setLessons(lessonsData)

      // Ouvrir toutes les sections par défaut
      setExpandedSections(new Set(sectionsData.map(s => s._id)))
    } catch (error) {
      console.error('Erreur:', error)
      navigate('/formations')
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const handleLessonClick = async (lesson: FormationLesson) => {
    // Vérifier si l'utilisateur est inscrit
    if (!isEnrolled) {
      alert('Vous devez vous inscrire à cette formation pour accéder aux leçons')
      setShowEnrollmentModal(true)
      return
    }

    // Vérifier si la leçon est accessible
    if (!lesson.isFree && !user?.isPremium) {
      alert('Cette leçon est réservée aux membres Premium')
      return
    }
    
    setSelectedLesson(lesson)
    
    // Si c'est une ressource, charger les données de la ressource
    if (lesson.lessonType === 'resource' && lesson.resourceId) {
      try {
        const resource = await api.files.getFileById(lesson.resourceId)
        if (resource) {
          setSelectedResource(resource)
          setShowResourceModal(true)
        } else {
          alert('Ressource introuvable')
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la ressource:', error)
        alert('Erreur lors du chargement de la ressource')
      }
    } else {
      // C'est une vidéo
      setShowVideoModal(true)
    }
  }

  const closeVideoModal = () => {
    setShowVideoModal(false)
    setSelectedLesson(null)
  }

  const closeResourceModal = () => {
    setShowResourceModal(false)
    setSelectedResource(null)
    setSelectedLesson(null)
  }

  const handleDownloadResource = async () => {
    if (!selectedResource || !user) return
    
    try {
      // Tracker le téléchargement
      await api.statistics.trackDownload(selectedResource._id, user.id)
      
      // Ouvrir le fichier dans un nouvel onglet
      window.open(selectedResource.fileUrl, '_blank')
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error)
      alert('Erreur lors du téléchargement')
    }
  }

  const getYoutubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1]
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  }

  const getTotalLessons = () => {
    return Object.values(lessons).reduce((total, sectionLessons) => total + sectionLessons.length, 0)
  }

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
      <div className="formation-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  if (!formation) {
    return null
  }

  return (
    <div className="formation-detail-page">
      {/* Message de succès */}
      {successMessage && (
        <div className="success-banner">
          <div className="success-content">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>{successMessage}</span>
          </div>
          <button className="btn-close-banner" onClick={() => setSuccessMessage('')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* Header */}
      <header className="detail-header">
        <div className="header-container">
          <button className="btn-back" onClick={() => navigate('/formations')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Retour aux formations
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-container">
          {formation.thumbnail && (
            <div className="formation-thumbnail-hero">
              <img 
                src={formation.thumbnail} 
                alt={formation.title}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    parent.innerHTML = '<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>';
                  }
                }}
              />
            </div>
          )}
          <div className="hero-info">
            <div className="category-badge">{formation.category}</div>
            <h1>{formation.title}</h1>
            <div className="meta-row">
              <span className="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                {formation.instructor}
              </span>
              <span className="separator">•</span>
              <span className="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                {formatDuration(formation.duration)}
              </span>
              <span className="separator">•</span>
              <span className="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
                {getLevelLabel(formation.level)}
              </span>
            </div>
            
            <div className="action-buttons">
              <button className="btn-description" onClick={() => setShowDescriptionModal(true)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                Description
              </button>
              <button className="btn-primary" onClick={() => setShowEnrollmentModal(true)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
                S'inscrire à la formation
              </button>
              <button className="btn-secondary" onClick={() => setShowPlanModal(true)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
                Voir le plan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vidéo de présentation */}
      {formation.previewVideoUrl && (
        <div className="video-section">
          <div className="video-container">
            <iframe
              src={getYoutubeEmbedUrl(formation.previewVideoUrl) || formation.previewVideoUrl}
              title="Vidéo de présentation"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* Contenu de la formation */}
      <div className="content-section">
        <div className="content-container">
          <div className="section-header">
            <h2>Plan de la formation</h2>
            <div className="content-stats">
              <span>{sections.length} chapitre{sections.length > 1 ? 's' : ''}</span>
              <span>•</span>
              <span>{getTotalLessons()} vidéo{getTotalLessons() > 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="curriculum">
            {sections.length === 0 ? (
              <div className="empty-curriculum">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                </svg>
                <p>Le contenu de cette formation sera bientôt disponible</p>
              </div>
            ) : (
              sections.map((section, sectionIndex) => {
                const sectionLessons = lessons[section._id] || []
                const isExpanded = expandedSections.has(section._id)

                return (
                  <div key={section._id} className="curriculum-section">
                    <div 
                      className="section-header-item"
                      onClick={() => toggleSection(section._id)}
                    >
                      <div className="section-info">
                        <svg 
                          className={`chevron ${isExpanded ? 'expanded' : ''}`}
                          width="20" 
                          height="20" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2"
                        >
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                        <span className="section-title">Section {sectionIndex + 1}: {section.title}</span>
                      </div>
                      <span className="lesson-count">{sectionLessons.length} leçon{sectionLessons.length > 1 ? 's' : ''}</span>
                    </div>

                    {isExpanded && sectionLessons.length > 0 && (
                      <div className="lessons-list">
                        {sectionLessons.map((lesson, lessonIndex) => {
                          // Verrouiller si l'utilisateur n'est pas inscrit OU si c'est premium et l'utilisateur n'est pas premium
                          const isLockedByEnrollment = !isEnrolled
                          const isLockedByPremium = !lesson.isFree && !user?.isPremium
                          const isLocked = isLockedByEnrollment || isLockedByPremium

                          return (
                            <div
                              key={lesson._id}
                              className={`lesson-item ${isLocked ? 'locked' : ''}`}
                              onClick={() => handleLessonClick(lesson)}
                              style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
                            >
                              <div className="lesson-icon">
                                {isLocked ? (
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                                  </svg>
                                ) : lesson.lessonType === 'resource' ? (
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                                    <polyline points="13 2 13 9 20 9"/>
                                  </svg>
                                ) : (
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="5 3 19 12 5 21 5 3"/>
                                  </svg>
                                )}
                              </div>
                              <div className="lesson-details">
                                <span className="lesson-title">
                                  {lessonIndex + 1}. {lesson.title}
                                </span>
                                <div className="lesson-meta">
                                  <span className="duration">{lesson.duration} min</span>
                                  {lesson.isFree && <span className="badge-free">Gratuit</span>}
                                  {isLockedByEnrollment && <span className="badge-locked">Inscription requise</span>}
                                  {!isLockedByEnrollment && isLockedByPremium && <span className="badge-locked">Premium</span>}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* CTA Premium */}
          {!user?.isPremium && (
            <div className="premium-cta-box">
              <div className="cta-content">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <h3>Accédez à toutes les formations</h3>
                <p>Devenez membre Premium pour débloquer l'accès illimité à toutes nos formations et ressources</p>
                <button className="btn-premium" onClick={() => navigate('/dashboard')}>
                  Découvrir Premium
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Vidéo */}
      {showVideoModal && selectedLesson && selectedLesson.videoUrl && (
        <div className="video-modal-overlay">
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="video-modal-header">
              <h3>{selectedLesson.title}</h3>
              <button className="btn-close-modal" onClick={closeVideoModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="video-modal-body">
              {getYoutubeEmbedUrl(selectedLesson.videoUrl) ? (
                <iframe
                  src={getYoutubeEmbedUrl(selectedLesson.videoUrl)!}
                  title={selectedLesson.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="video-error">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p>Vidéo non disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Ressource */}
      {showResourceModal && selectedResource && selectedLesson && (
        <div className="video-modal-overlay">
          <div className="video-modal-content resource-modal" onClick={(e) => e.stopPropagation()}>
            <div className="video-modal-header">
              <h3>{selectedLesson.title}</h3>
              <button className="btn-close-modal" onClick={closeResourceModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="resource-modal-body">
              <div className="resource-info">
                <div className="resource-icon-large">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                    <polyline points="13 2 13 9 20 9"/>
                  </svg>
                </div>
                <h4>{selectedResource.titleFr}</h4>
                <p className="resource-description">{selectedResource.descriptionFr}</p>
                
                <div className="resource-details">
                  <div className="detail-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                      <polyline points="13 2 13 9 20 9"/>
                    </svg>
                    <span>{selectedResource.fileName}</span>
                  </div>
                  <div className="detail-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    <span>{(selectedResource.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <div className="detail-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                    <span>{selectedResource.fileType}</span>
                  </div>
                </div>

                {/* Prévisualisation si c'est une image ou PDF */}
                {(selectedResource.fileType.startsWith('image/') || selectedResource.fileType === 'application/pdf') && (
                  <div className="resource-preview">
                    {selectedResource.fileType.startsWith('image/') ? (
                      <img src={selectedResource.fileUrl} alt={selectedResource.titleFr} />
                    ) : (
                      <iframe 
                        src={selectedResource.fileUrl} 
                        title={selectedResource.titleFr}
                        style={{ width: '100%', height: '500px', border: 'none', borderRadius: '8px' }}
                      />
                    )}
                  </div>
                )}

                <div className="resource-actions">
                  <button className="btn-download" onClick={handleDownloadResource}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Télécharger la ressource
                  </button>
                  <button className="btn-secondary" onClick={closeResourceModal}>
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Plan de la formation */}
      {showPlanModal && (
        <div className="video-modal-overlay">
          <div className="video-modal-content plan-modal" onClick={(e) => e.stopPropagation()}>
            <div className="video-modal-header">
              <h3>Plan de la formation</h3>
              <button className="btn-close-modal" onClick={() => setShowPlanModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="plan-modal-body">
              {sections.length === 0 ? (
                <div className="empty-plan">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                  </svg>
                  <p>Aucun contenu disponible pour cette formation</p>
                </div>
              ) : (
                <div className="plan-sections">
                  {sections.map((section, sectionIndex) => {
                    const sectionLessons = lessons[section._id] || []
                    
                    return (
                      <div key={section._id} className="plan-section-item">
                        <div className="plan-section-header">
                          <h4>Section {sectionIndex + 1}: {section.title}</h4>
                          <span className="plan-lesson-count">{sectionLessons.length} leçon{sectionLessons.length > 1 ? 's' : ''}</span>
                        </div>
                        
                        {sectionLessons.length > 0 && (
                          <div className="plan-lessons">
                            {sectionLessons.map((lesson, lessonIndex) => {
                              const isLocked = !lesson.isFree && !user?.isPremium
                              
                              return (
                                <div key={lesson._id} className={`plan-lesson-item ${isLocked ? 'locked' : ''}`}>
                                  <div className="plan-lesson-icon">
                                    {isLocked ? (
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                        <path d="M7 11V7a5 5 0 0110 0v4"/>
                                      </svg>
                                    ) : lesson.lessonType === 'resource' ? (
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
                                  <div className="plan-lesson-info">
                                    <span className="plan-lesson-title">{lessonIndex + 1}. {lesson.title}</span>
                                    <div className="plan-lesson-meta">
                                      <span>{lesson.duration} min</span>
                                      {lesson.isFree && <span className="badge-free">Gratuit</span>}
                                      {lesson.lessonType === 'resource' && <span className="badge-resource">Ressource</span>}
                                      {isLocked && <span className="badge-locked">Premium</span>}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Description */}
      {showDescriptionModal && (
        <div className="video-modal-overlay">
          <div className="video-modal-content description-modal" onClick={(e) => e.stopPropagation()}>
            <div className="video-modal-header">
              <h3>Description de la formation</h3>
              <button className="btn-close-modal" onClick={() => setShowDescriptionModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="description-modal-body">
              <div className="description-modal-content">
                <p>{formation.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'inscription */}
      <EnrollmentModal 
        isOpen={showEnrollmentModal}
        onClose={() => setShowEnrollmentModal(false)}
        formation={formation}
        onEnrollmentSuccess={() => {
          // Recharger les données de la formation pour mettre à jour l'état d'inscription
          loadFormationData()
        }}
      />
    </div>
  )
}
