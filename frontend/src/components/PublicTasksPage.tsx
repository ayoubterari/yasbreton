import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, Task } from '../lib/convex-client'
import './PublicTasksPage.css'

interface Domain {
  _id: string
  name: string
  description?: string
  order: number
}

interface Subdomain {
  _id: string
  name: string
  description?: string
  domainId: string
  order: number
}

export default function PublicTasksPage() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [domains, setDomains] = useState<Domain[]>([])
  const [subdomains, setSubdomains] = useState<Subdomain[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm] = useState('')
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [selectedSubdomain, setSelectedSubdomain] = useState<string | null>(null)
  const [randomTasks, setRandomTasks] = useState<Task[]>([])

  useEffect(() => {
    loadTasks()
  }, [])

  // Générer 10 tâches aléatoires quand les tâches sont chargées
  useEffect(() => {
    if (tasks.length > 0) {
      const shuffled = [...tasks].sort(() => Math.random() - 0.5)
      setRandomTasks(shuffled.slice(0, 10))
    }
  }, [tasks])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const [allTasks, allDomains, allSubdomains] = await Promise.all([
        api.tasks.getAllTasks(),
        api.domains.getAllDomains(),
        api.domains.getAllSubdomains()
      ])
      setTasks(allTasks)
      setDomains(allDomains.sort((a, b) => a.order - b.order))
      setSubdomains(allSubdomains.sort((a, b) => a.order - b.order))
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les sous-domaines selon le domaine sélectionné
  const filteredSubdomains = selectedDomain
    ? subdomains.filter(sub => sub.domainId === selectedDomain)
    : []

  // Filtrer les tâches
  const filteredTasks = tasks.filter(task => {
    const matchSearch = searchTerm === '' ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Vérifier le domaine via le subdomain
    let matchDomain = true
    if (selectedDomain && task.subdomainId) {
      const taskSubdomain = subdomains.find(sub => sub._id === task.subdomainId)
      matchDomain = taskSubdomain?.domainId === selectedDomain
    } else if (selectedDomain) {
      matchDomain = false
    }
    
    const matchSubdomain = !selectedSubdomain || task.subdomainId === selectedSubdomain
    
    return matchSearch && matchDomain && matchSubdomain
  })

  // Déterminer quelles tâches afficher
  const displayTasks = selectedDomain ? filteredTasks : randomTasks

  // Compter les tâches par domaine
  const getTaskCountByDomain = (domainId: string) => {
    return tasks.filter(task => {
      if (!task.subdomainId) return false
      const taskSubdomain = subdomains.find(sub => sub._id === task.subdomainId)
      return taskSubdomain?.domainId === domainId
    }).length
  }

  // Compter les tâches par sous-domaine
  const getTaskCountBySubdomain = (subdomainId: string) => {
    return tasks.filter(task => task.subdomainId === subdomainId).length
  }

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



      {/* Domaines et Sous-domaines Section */}
      {!loading && domains.length > 0 && (
        <div className="domains-section">
          <div className="domains-container">
            <h2 className="domains-title">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Domaines Principaux
            </h2>
            
            <div className="domains-grid">
              {domains.map((domain) => {
                const taskCount = getTaskCountByDomain(domain._id)
                const isSelected = selectedDomain === domain._id
                const domainSubdomains = subdomains.filter(sub => sub.domainId === domain._id)
                
                return (
                  <div key={domain._id} className="domain-wrapper">
                    <div 
                      className={`domain-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        if (selectedDomain === domain._id) {
                          setSelectedDomain(null)
                          setSelectedSubdomain(null)
                        } else {
                          setSelectedDomain(domain._id)
                          setSelectedSubdomain(null)
                        }
                      }}
                    >
                      <div className="domain-card-header">
                        <div className="domain-icon">
                          {domain.name.toLowerCase().includes('apprentissage') ? (
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                            </svg>
                          ) : domain.name.toLowerCase().includes('compétences') ? (
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          ) : domain.name.toLowerCase().includes('autonomie') ? (
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 12l2 2 4-4"/>
                              <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                              <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                              <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
                              <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"/>
                            </svg>
                          ) : domain.name.toLowerCase().includes('motricité') ? (
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="5" r="3"/>
                              <path d="M12 22V8"/>
                              <path d="M5 12H2a10 10 0 0 0 20 0h-3"/>
                            </svg>
                          ) : (
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                              <path d="M2 12h20"/>
                            </svg>
                          )}
                        </div>
                        <div className="domain-content">
                          <h3 className="domain-name">{domain.name}</h3>
                          {domain.description && (
                            <p className="domain-description">{domain.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="domain-meta">
                        <span className="task-count">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 11l3 3L22 4"/>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                          </svg>
                          {taskCount} tâche{taskCount > 1 ? 's' : ''}
                        </span>
                        <span className="subdomain-count">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                          </svg>
                          {domainSubdomains.length} sous-domaine{domainSubdomains.length > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="domain-footer">
                        <div className="domain-status">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M9 12l2 2 4-4"/>
                          </svg>
                          Disponible
                        </div>
                        <div className="domain-arrow">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Sous-domaines */}
                    {isSelected && filteredSubdomains.length > 0 && (
                      <div className="subdomains-container">
                        {filteredSubdomains.map((subdomain) => {
                          const subTaskCount = getTaskCountBySubdomain(subdomain._id)
                          const isSubSelected = selectedSubdomain === subdomain._id
                          
                          return (
                            <div
                              key={subdomain._id}
                              className={`subdomain-card ${isSubSelected ? 'selected' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedSubdomain(isSubSelected ? null : subdomain._id)
                              }}
                            >
                              <div className="subdomain-indicator"></div>
                              <div className="subdomain-content">
                                <h4 className="subdomain-name">{subdomain.name}</h4>
                                {subdomain.description && (
                                  <p className="subdomain-description">{subdomain.description}</p>
                                )}
                                <span className="subdomain-task-count">
                                  {subTaskCount} tâche{subTaskCount > 1 ? 's' : ''}
                                </span>
                              </div>
                              {isSubSelected && (
                                <div className="subdomain-check">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12"/>
                                  </svg>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tasks Grid */}
      <div className="tasks-grid-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Chargement des tâches...</p>
          </div>
        ) : displayTasks.length === 0 ? (
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
            {displayTasks.map((task) => {
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
