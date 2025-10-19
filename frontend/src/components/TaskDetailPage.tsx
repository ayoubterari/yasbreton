import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, Task } from '../lib/convex-client'
import './TaskDetailPage.css'

interface FileResource {
  _id: string
  titleFr: string
  titleAr: string
  fileName: string
  fileUrl: string
}

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const [task, setTask] = useState<Task | null>(null)
  const [resources, setResources] = useState<FileResource[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'description' | 'baseline' | 'technical' | 'resources'>('description')
  const [currentVideo, setCurrentVideo] = useState<{ url: string; title: string } | null>(null)
  const [selectedCriterionIndex, setSelectedCriterionIndex] = useState<number | null>(null)

  useEffect(() => {
    if (taskId) {
      loadTask()
    }
  }, [taskId])

  useEffect(() => {
    // Initialiser la vidéo principale quand la tâche est chargée
    if (task && !currentVideo) {
      setCurrentVideo({ url: task.videoUrl, title: task.title })
    }
  }, [task])

  const loadTask = async () => {
    try {
      setLoading(true)
      const taskData = await api.tasks.getTaskById(taskId!)
      if (taskData) {
        setTask(taskData)
        
        // Charger les ressources si des IDs sont présents
        if (taskData.resourceIds && taskData.resourceIds.length > 0) {
          await loadResources(taskData.resourceIds)
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la tâche:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadResources = async (resourceIds: string[]) => {
    try {
      const allFiles = await api.files.getFiles()
      const taskResources = allFiles.filter((f: any) => resourceIds.includes(f._id))
      setResources(taskResources.map((f: any) => ({
        _id: f._id,
        titleFr: f.titleFr,
        titleAr: f.titleAr,
        fileName: f.fileName,
        fileUrl: f.fileUrl
      })))
    } catch (error) {
      console.error('Erreur lors du chargement des ressources:', error)
    }
  }

  const getYoutubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1]
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  }

  const getYoutubeThumbnail = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1]
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null
  }

  if (loading) {
    return (
      <div className="task-detail-page">
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Chargement de la tâche...</p>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="task-detail-page">
        <div className="error-container">
          <h2>Tâche introuvable</h2>
          <button onClick={() => navigate('/tasks')} className="btn-back">
            Retour aux tâches
          </button>
        </div>
      </div>
    )
  }

  const handleCriterionClick = (index: number) => {
    const criterion = task.criteria![index]
    setCurrentVideo({ url: criterion.videoUrl, title: criterion.title })
    setSelectedCriterionIndex(index)
  }

  const handleBackToMainVideo = () => {
    setCurrentVideo({ url: task.videoUrl, title: task.title })
    setSelectedCriterionIndex(null)
  }

  const embedUrl = currentVideo ? getYoutubeEmbedUrl(currentVideo.url) : null

  return (
    <div className="task-detail-page">
      {/* Header */}
      <header className="task-detail-header">
        <div className="header-content">
          <h1>{task.title}</h1>
          <button onClick={() => navigate('/tasks')} className="btn-back-tasks">
            ← Retour aux tâches
          </button>
        </div>
      </header>

      <div className="task-detail-container">
        {/* Main Content */}
        <div className="task-main-content">
          {/* Video Section */}
          <div className="video-section">
            {selectedCriterionIndex !== null && (
              <div className="video-header">
                <button className="btn-back-to-main" onClick={handleBackToMainVideo}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="19" y1="12" x2="5" y2="12"/>
                    <polyline points="12 19 5 12 12 5"/>
                  </svg>
                  Retour à la présentation principale
                </button>
                <h3 className="video-title">{currentVideo?.title}</h3>
              </div>
            )}
            {embedUrl ? (
              <div className="video-embed">
                <iframe
                  src={embedUrl}
                  title={currentVideo?.title || task.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="video-placeholder">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <p>Vidéo non disponible</p>
              </div>
            )}
          </div>

          {/* Presentation Section */}
          <div className="presentation-section">
            <h2>{selectedCriterionIndex !== null ? 'Informations du critère' : 'Présentation générale'}</h2>
            
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button
                className={`tab ${activeTab === 'baseline' ? 'active' : ''}`}
                onClick={() => setActiveTab('baseline')}
              >
                Ligne de base
              </button>
              <button
                className={`tab ${activeTab === 'technical' ? 'active' : ''}`}
                onClick={() => setActiveTab('technical')}
              >
                Détails techniques
              </button>
              <button
                className={`tab ${activeTab === 'resources' ? 'active' : ''}`}
                onClick={() => setActiveTab('resources')}
              >
                Ressources
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'description' && (
                <div className="content-box">
                  <p>
                    {selectedCriterionIndex !== null && task.criteria?.[selectedCriterionIndex]?.description
                      ? task.criteria[selectedCriterionIndex].description
                      : selectedCriterionIndex !== null
                      ? 'Aucune description pour ce critère'
                      : task.description}
                  </p>
                </div>
              )}
              
              {activeTab === 'baseline' && (
                <div className="content-box">
                  <p>
                    {selectedCriterionIndex !== null && task.criteria?.[selectedCriterionIndex]?.baseline
                      ? task.criteria[selectedCriterionIndex].baseline
                      : selectedCriterionIndex !== null
                      ? 'Aucune ligne de base pour ce critère'
                      : task.baseline}
                  </p>
                </div>
              )}
              
              {activeTab === 'technical' && (
                <div className="content-box">
                  <h3>Matériel</h3>
                  <p>
                    {selectedCriterionIndex !== null && task.criteria?.[selectedCriterionIndex]?.technicalDetails
                      ? task.criteria[selectedCriterionIndex].technicalDetails
                      : selectedCriterionIndex !== null
                      ? 'Aucun détail technique pour ce critère'
                      : task.technicalDetails}
                  </p>
                </div>
              )}
              
              {activeTab === 'resources' && (
                <div className="content-box">
                  {(() => {
                    const currentResources = selectedCriterionIndex !== null && task.criteria?.[selectedCriterionIndex]?.resourceIds
                      ? resources.filter(r => task.criteria![selectedCriterionIndex].resourceIds?.includes(r._id))
                      : resources
                    
                    return currentResources.length === 0 ? (
                      <p>Aucune ressource attachée.</p>
                    ) : (
                      <div className="resources-attached-list">
                        <h3>Ressources attachées :</h3>
                        <ul>
                          {currentResources.map(resource => (
                            <li key={resource._id} className="resource-item">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
                                <polyline points="13 2 13 9 20 9"/>
                              </svg>
                              <div className="resource-details">
                                <strong>{resource.titleFr}</strong>
                                <span className="resource-filename">{resource.fileName}</span>
                              </div>
                              <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-download-resource">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                                  <polyline points="7 10 12 15 17 10"/>
                                  <line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                                Télécharger
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="task-sidebar">
          {task.criteria && task.criteria.length > 0 && (
            <div className="sidebar-section">
              <h3>Critères liés avec miniatures</h3>
              <div className="related-tasks">
                {task.criteria.map((criterion, index) => {
                  const thumbnailUrl = getYoutubeThumbnail(criterion.videoUrl)
                  const isActive = selectedCriterionIndex === index
                  return (
                    <div 
                      key={index} 
                      className={`related-task-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleCriterionClick(index)}
                    >
                      <div className="task-thumbnail">
                        {thumbnailUrl ? (
                          <div className="thumbnail-wrapper">
                            <img src={thumbnailUrl} alt={criterion.title} />
                            <div className="play-overlay">
                              <svg width="40" height="40" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
                                <polygon points="5 3 19 12 5 21 5 3"/>
                              </svg>
                            </div>
                          </div>
                        ) : (
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                          </svg>
                        )}
                      </div>
                      <div className="task-info">
                        <h4>{criterion.title}</h4>
                        <span className="task-code">ABLLS-R</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="sidebar-section">
            <h3>Informations</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Processus</span>
                <span className="info-value">En cours</span>
              </div>
              <div className="info-item">
                <span className="info-label">Domaine principal</span>
                <span className="info-value">Communication</span>
              </div>
              <div className="info-item">
                <span className="info-label">Créé le</span>
                <span className="info-value">{new Date(task.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

    </div>
  )
}
