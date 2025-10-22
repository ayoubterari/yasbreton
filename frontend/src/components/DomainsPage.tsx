import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, Domain, Subdomain, Task } from '../lib/convex-client'
import './DomainsPage.css'

export default function DomainsPage() {
  const navigate = useNavigate()
  const [domains, setDomains] = useState<Domain[]>([])
  const [subdomains, setSubdomains] = useState<Subdomain[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubdomainId, setSelectedSubdomainId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [openSubdomains, setOpenSubdomains] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [allDomains, allSubdomains, allTasks] = await Promise.all([
        api.domains.getAllDomains(),
        api.domains.getAllSubdomains(),
        api.tasks.getAllTasks()
      ])
      setDomains(allDomains)
      setSubdomains(allSubdomains)
      setTasks(allTasks)
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTasksBySubdomain = (subdomainId: string) => {
    return tasks.filter(task => task.subdomainId === subdomainId && !task.deleted)
  }

  const getSubdomainsByDomain = (domainId: string) => {
    return subdomains.filter(sub => sub.domainId === domainId)
  }

  const filteredSubdomains = selectedSubdomainId
    ? subdomains.filter(sub => sub._id === selectedSubdomainId)
    : subdomains

  const searchFilteredSubdomains = searchQuery
    ? filteredSubdomains.filter(sub =>
        sub.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredSubdomains

  const toggleSubdomain = (subdomainId: string) => {
    setOpenSubdomains(prev => ({
      ...prev,
      [subdomainId]: !prev[subdomainId]
    }))
  }

  if (loading) {
    return (
      <div className="domains-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="domains-page">
      <div className="domains-header">
        <div className="header-content">
          <div className="header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
            </svg>
          </div>
          <h1>Tâches ABLLS par domaine</h1>
        </div>
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Retour aux tâches
        </button>
      </div>

      <div className="filters-and-search-section">
        <div className="filters-container">
          <div className="filter-label">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            <span>Filtrer par sous-domaine :</span>
          </div>
          <div className="filter-tabs">
            <button
              className={`filter-tab ${!selectedSubdomainId ? 'active' : ''}`}
              onClick={() => setSelectedSubdomainId(null)}
            >
              Tous
            </button>
            {domains.map(domain => {
              const domainSubdomains = getSubdomainsByDomain(domain._id)
              return domainSubdomains.map(subdomain => (
                <button
                  key={subdomain._id}
                  className={`filter-tab ${selectedSubdomainId === subdomain._id ? 'active' : ''}`}
                  onClick={() => setSelectedSubdomainId(subdomain._id)}
                >
                  {subdomain.name}
                </button>
              ))
            })}
          </div>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Rechercher par code ou titre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="subdomains-grid">
        {domains.map(domain => {
          const domainSubdomains = searchFilteredSubdomains.filter(
            sub => sub.domainId === domain._id
          )

          if (domainSubdomains.length === 0) return null

          return (
            <div key={domain._id} className="domain-section">
              <h2 className="domain-title">{domain.name}</h2>
              <div className="subdomain-cards">
                {domainSubdomains.map(subdomain => {
                  const subdomainTasks = getTasksBySubdomain(subdomain._id)
                  
                  const isOpen = openSubdomains[subdomain._id] || false
                  
                  return (
                    <div key={subdomain._id} className="subdomain-card">
                      <div 
                        className="subdomain-card-header"
                        onClick={() => toggleSubdomain(subdomain._id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="subdomain-icon">
                          <svg 
                            width="24" 
                            height="24" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2"
                            style={{ 
                              transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                              transition: 'transform 0.3s ease'
                            }}
                          >
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        </div>
                        <div className="subdomain-info">
                          <h3>{subdomain.name}</h3>
                          <span className="task-count">{subdomainTasks.length} tâche(s)</span>
                        </div>
                      </div>
                      {isOpen && (
                        <>
                          {subdomain.description && (
                            <p className="subdomain-description">{subdomain.description}</p>
                          )}
                          
                          {subdomainTasks.length > 0 ? (
                            <div className="tasks-list">
                              {subdomainTasks.map(task => (
                                <div
                                  key={task._id}
                                  className="task-item"
                                  onClick={() => navigate(`/tasks/${task._id}`)}
                                >
                                  <div className="task-item-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <polygon points="5 3 19 12 5 21 5 3"/>
                                    </svg>
                                  </div>
                                  <span className="task-item-title">{task.title}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="no-tasks">Aucune tâche pour ce sous-domaine</p>
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {searchFilteredSubdomains.length === 0 && (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <h3>Aucun résultat</h3>
            <p>Aucun sous-domaine ne correspond à votre recherche</p>
          </div>
        )}
      </div>
    </div>
  )
}
