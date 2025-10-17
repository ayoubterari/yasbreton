import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, Formation, FormationSection, FormationLesson } from '../lib/convex-client'
import { useAuth } from '../contexts/AuthContext'
import './FormationDetailPage.css'

export default function FormationDetailPage() {
  const { formationId } = useParams<{ formationId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [formation, setFormation] = useState<Formation | null>(null)
  const [sections, setSections] = useState<FormationSection[]>([])
  const [lessons, setLessons] = useState<{ [sectionId: string]: FormationLesson[] }>({})
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<FormationLesson | null>(null)

  useEffect(() => {
    if (formationId) {
      loadFormationData()
    }
  }, [formationId])

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

  const handleLessonClick = (lesson: FormationLesson) => {
    // Vérifier si la leçon est accessible
    if (!lesson.isFree && !user?.isPremium) {
      alert('Cette leçon est réservée aux membres Premium')
      return
    }
    setSelectedLesson(lesson)
    setShowVideoModal(true)
  }

  const closeVideoModal = () => {
    setShowVideoModal(false)
    setSelectedLesson(null)
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
          <div className="hero-left">
            {formation.thumbnail && (
              <div className="formation-thumbnail">
                <img src={formation.thumbnail} alt={formation.title} />
              </div>
            )}
            <div className="hero-info">
              <h1>{formation.title}</h1>
              <div className="meta-row">
                <span className="meta-item">{formation.category}</span>
                <span className="separator">•</span>
                <span className="meta-item">Formation enregistrée</span>
                <span className="separator">•</span>
                <span className="meta-item">Par: {formation.instructor}</span>
              </div>
              <p className="description">{formation.description}</p>
              <div className="stats-row">
                <div className="stat-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                  <span>Formation</span>
                </div>
                <div className="stat-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>Durée totale: {formatDuration(formation.duration)}</span>
                </div>
                <div className="stat-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                  <span>Langue: FR</span>
                </div>
              </div>
              <div className="action-buttons">
                <button className="btn-primary" onClick={() => navigate('/dashboard')}>
                  {user?.isPremium ? 'Accéder à la formation' : 'S\'inscrire à la formation'}
                </button>
                <button className="btn-secondary">Voir le plan</button>
              </div>
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
                          const isLocked = !lesson.isFree && !user?.isPremium

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
      {showVideoModal && selectedLesson && (
        <div className="video-modal-overlay" onClick={closeVideoModal}>
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
    </div>
  )
}
