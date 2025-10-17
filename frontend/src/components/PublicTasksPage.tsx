import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, Task } from '../lib/convex-client'
import './PublicTasksPage.css'

export default function PublicTasksPage() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const allTasks = await api.tasks.getAllTasks()
      setTasks(allTasks)
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getYoutubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1]
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  }

  return (
    <div className="public-tasks-page">
      {/* Header */}
      <header className="tasks-page-header">
        <div className="header-container">
          <button onClick={() => navigate('/')} className="btn-back-home">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Retour à l'accueil
          </button>
          <h1>Tâches ABLLS-R</h1>
        </div>
      </header>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-container">
          <div className="filter-header">
            <h2>Filtre</h2>
            <button className="btn-reset" onClick={() => setSearchTerm('')}>
              ↻ Réinitialiser
            </button>
          </div>
          
          <div className="search-box">
            <input
              type="text"
              placeholder="Rechercher par code, titre, domaine ou catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-info">
            <p>
              Filtrer par <strong>domaine principal</strong>, puis <strong>domaine</strong>. Les tâches s'affichent dynamiquement.
            </p>
          </div>

          <div className="tasks-count">
            <span className="count-badge">{filteredTasks.length} tâches</span>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="tasks-grid-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Chargement des tâches...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <h3>Aucune tâche trouvée</h3>
            <p>Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          <div className="tasks-grid">
            {filteredTasks.map((task) => {
              const embedUrl = getYoutubeEmbedUrl(task.videoUrl)
              
              return (
                <div key={task._id} className="task-card-public">
                  <div className="task-card-header">
                    <h3>{task.title}</h3>
                  </div>
                  
                  <p className="task-description">{task.description}</p>
                  
                  {embedUrl && (
                    <div className="task-video-preview">
                      <iframe
                        src={embedUrl}
                        title={task.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                  
                  <button 
                    className="btn-view-task"
                    onClick={() => navigate(`/tasks/${task._id}`)}
                  >
                    Voir la fiche →
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
