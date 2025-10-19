import { useState, useEffect } from 'react'
import { api, Domain, Subdomain } from '../lib/convex-client'
import ImportDomainsButton from './ImportDomainsButton'
import ImportABLLSTasksButton from './ImportABLLSTasksButton'
import './DomainsManagement.css'

export default function DomainsManagement() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [subdomains, setSubdomains] = useState<Subdomain[]>([])
  const [loading, setLoading] = useState(true)
  const [showDomainForm, setShowDomainForm] = useState(false)
  const [showSubdomainForm, setShowSubdomainForm] = useState(false)
  const [showGenerateTasksForm, setShowGenerateTasksForm] = useState(false)
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null)
  const [editingSubdomain, setEditingSubdomain] = useState<Subdomain | null>(null)
  const [showSubdomainsModal, setShowSubdomainsModal] = useState(false)
  const [selectedDomainForModal, setSelectedDomainForModal] = useState<Domain | null>(null)
  const [selectedSubdomainForTasks, setSelectedSubdomainForTasks] = useState<Subdomain | null>(null)
  
  const [domainFormData, setDomainFormData] = useState({
    name: '',
    description: ''
  })

  const [subdomainFormData, setSubdomainFormData] = useState({
    name: '',
    description: '',
    domainId: ''
  })

  const [generateTasksFormData, setGenerateTasksFormData] = useState({
    count: 10,
    prefix: '',
    criteriaCount: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [allDomains, allSubdomains] = await Promise.all([
        api.domains.getAllDomains(),
        api.domains.getAllSubdomains()
      ])
      setDomains(allDomains)
      setSubdomains(allSubdomains)
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      alert('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  // ========== DOMAINES ==========

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDomainFormData({
      ...domainFormData,
      [e.target.name]: e.target.value
    })
  }

  const handleDomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingDomain) {
        await api.domains.updateDomain({
          domainId: editingDomain._id,
          ...domainFormData
        })
      } else {
        await api.domains.createDomain({
          ...domainFormData,
          order: domains.length
        })
      }
      
      setDomainFormData({ name: '', description: '' })
      setEditingDomain(null)
      setShowDomainForm(false)
      await loadData()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du domaine:', error)
      alert('Erreur lors de la sauvegarde du domaine')
    }
  }

  const handleEditDomain = (domain: Domain) => {
    setEditingDomain(domain)
    setDomainFormData({
      name: domain.name,
      description: domain.description || ''
    })
    setShowDomainForm(true)
  }

  const handleDeleteDomain = async (domainId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce domaine ?')) return
    
    try {
      await api.domains.deleteDomain(domainId)
      await loadData()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression du domaine')
    }
  }

  const handleCancelDomain = () => {
    setEditingDomain(null)
    setDomainFormData({ name: '', description: '' })
    setShowDomainForm(false)
  }

  // ========== SOUS-DOMAINES ==========

  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setSubdomainFormData({
      ...subdomainFormData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubdomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subdomainFormData.domainId) {
      alert('Veuillez sélectionner un domaine')
      return
    }

    try {
      if (editingSubdomain) {
        await api.domains.updateSubdomain({
          subdomainId: editingSubdomain._id,
          ...subdomainFormData
        })
      } else {
        const domainSubdomains = subdomains.filter(s => s.domainId === subdomainFormData.domainId)
        await api.domains.createSubdomain({
          ...subdomainFormData,
          order: domainSubdomains.length
        })
      }
      
      setSubdomainFormData({ name: '', description: '', domainId: '' })
      setEditingSubdomain(null)
      setShowSubdomainForm(false)
      await loadData()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du sous-domaine:', error)
      alert('Erreur lors de la sauvegarde du sous-domaine')
    }
  }

  const handleEditSubdomain = (subdomain: Subdomain) => {
    setEditingSubdomain(subdomain)
    setSubdomainFormData({
      name: subdomain.name,
      description: subdomain.description || '',
      domainId: subdomain.domainId
    })
    setShowSubdomainForm(true)
  }

  const handleDeleteSubdomain = async (subdomainId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce sous-domaine ?')) return
    
    try {
      await api.domains.deleteSubdomain(subdomainId)
      await loadData()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression du sous-domaine')
    }
  }

  const handleCancelSubdomain = () => {
    setEditingSubdomain(null)
    setSubdomainFormData({ name: '', description: '', domainId: '' })
    setShowSubdomainForm(false)
  }

  const getSubdomainsByDomain = (domainId: string) => {
    return subdomains.filter(s => s.domainId === domainId)
  }

  // ========== GÉNÉRATION DE TÂCHES ==========

  const handleGenerateTasksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setGenerateTasksFormData({
      ...generateTasksFormData,
      [name]: (name === 'count' || name === 'criteriaCount') ? parseInt(value) || 0 : value
    })
  }

  const handleOpenGenerateTasks = (subdomain: Subdomain) => {
    setSelectedSubdomainForTasks(subdomain)
    setGenerateTasksFormData({
      count: 10,
      prefix: subdomain.name,
      criteriaCount: 0
    })
    setShowGenerateTasksForm(true)
  }

  const handleGenerateTasksSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedSubdomainForTasks) return
    
    if (generateTasksFormData.count <= 0 || generateTasksFormData.count > 100) {
      alert('Le nombre de tâches doit être entre 1 et 100')
      return
    }
    
    if (!generateTasksFormData.prefix.trim()) {
      alert('Le préfixe ne peut pas être vide')
      return
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (!user.id) {
        alert('Vous devez être connecté pour générer des tâches')
        return
      }

      const result = await api.tasks.generateEmptyTasks({
        subdomainId: selectedSubdomainForTasks._id,
        count: generateTasksFormData.count,
        prefix: generateTasksFormData.prefix,
        criteriaCount: generateTasksFormData.criteriaCount,
        userId: user.id
      })
      
      alert(`${result.count} tâche(s) créée(s) avec succès !`)
      setShowGenerateTasksForm(false)
      setSelectedSubdomainForTasks(null)
      setGenerateTasksFormData({ count: 10, prefix: '', criteriaCount: 0 })
    } catch (error) {
      console.error('Erreur lors de la génération des tâches:', error)
      alert('Erreur lors de la génération des tâches')
    }
  }

  const handleCancelGenerateTasks = () => {
    setShowGenerateTasksForm(false)
    setSelectedSubdomainForTasks(null)
    setGenerateTasksFormData({ count: 10, prefix: '', criteriaCount: 0 })
  }

  if (loading) {
    return (
      <div className="domains-management">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="domains-management">
      <div className="page-header">
        <h1>Gestion des Domaines</h1>
        <div className="header-actions">
          <ImportDomainsButton />
          <ImportABLLSTasksButton />
          <button className="btn-primary" onClick={() => setShowDomainForm(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nouveau domaine
          </button>
          <button className="btn-secondary" onClick={() => setShowSubdomainForm(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nouveau sous-domaine
          </button>
        </div>
      </div>

      {/* Formulaire Domaine */}
      {showDomainForm && (
        <div className="modal-overlay" onClick={handleCancelDomain}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingDomain ? 'Modifier le domaine' : 'Créer un domaine'}</h2>
              <button className="btn-close" onClick={handleCancelDomain}>×</button>
            </div>
            <form onSubmit={handleDomainSubmit}>
              <div className="form-group">
                <label htmlFor="domainName">Nom du domaine *</label>
                <input
                  type="text"
                  id="domainName"
                  name="name"
                  value={domainFormData.name}
                  onChange={handleDomainChange}
                  placeholder="Ex: Communication"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="domainDescription">Description</label>
                <textarea
                  id="domainDescription"
                  name="description"
                  value={domainFormData.description}
                  onChange={handleDomainChange}
                  placeholder="Description du domaine..."
                  rows={3}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={handleCancelDomain}>
                  Annuler
                </button>
                <button type="submit" className="btn-submit">
                  {editingDomain ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Formulaire Génération de Tâches */}
      {showGenerateTasksForm && (
        <div className="modal-overlay" onClick={handleCancelGenerateTasks}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Générer des tâches vides</h2>
              <button className="btn-close" onClick={handleCancelGenerateTasks}>×</button>
            </div>
            <form onSubmit={handleGenerateTasksSubmit}>
              <div className="form-group">
                <label>Sous-domaine sélectionné</label>
                <input
                  type="text"
                  value={selectedSubdomainForTasks?.name || ''}
                  disabled
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="taskPrefix">Préfixe des tâches *</label>
                <input
                  type="text"
                  id="taskPrefix"
                  name="prefix"
                  value={generateTasksFormData.prefix}
                  onChange={handleGenerateTasksChange}
                  placeholder="Ex: Tâche"
                  required
                />
                <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                  Les tâches seront nommées : {generateTasksFormData.prefix || 'Préfixe'}1, {generateTasksFormData.prefix || 'Préfixe'}2, etc.
                </small>
              </div>
              <div className="form-group">
                <label htmlFor="taskCount">Nombre de tâches *</label>
                <input
                  type="number"
                  id="taskCount"
                  name="count"
                  value={generateTasksFormData.count}
                  onChange={handleGenerateTasksChange}
                  min="1"
                  max="100"
                  required
                />
                <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                  Maximum : 100 tâches
                </small>
              </div>
              <div className="form-group">
                <label htmlFor="criteriaCount">Nombre de critères par tâche</label>
                <input
                  type="number"
                  id="criteriaCount"
                  name="criteriaCount"
                  value={generateTasksFormData.criteriaCount}
                  onChange={handleGenerateTasksChange}
                  min="0"
                  max="20"
                />
                <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                  Chaque tâche aura {generateTasksFormData.criteriaCount} critère{generateTasksFormData.criteriaCount > 1 ? 's' : ''} vide{generateTasksFormData.criteriaCount > 1 ? 's' : ''} (Maximum : 20)
                </small>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={handleCancelGenerateTasks}>
                  Annuler
                </button>
                <button type="submit" className="btn-submit">
                  Générer {generateTasksFormData.count} tâche(s)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Formulaire Sous-domaine */}
      {showSubdomainForm && (
        <div className="modal-overlay" onClick={handleCancelSubdomain}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSubdomain ? 'Modifier le sous-domaine' : 'Créer un sous-domaine'}</h2>
              <button className="btn-close" onClick={handleCancelSubdomain}>×</button>
            </div>
            <form onSubmit={handleSubdomainSubmit}>
              <div className="form-group">
                <label htmlFor="subdomainDomain">Domaine parent *</label>
                <select
                  id="subdomainDomain"
                  name="domainId"
                  value={subdomainFormData.domainId}
                  onChange={handleSubdomainChange}
                  required
                >
                  <option value="">Sélectionner un domaine</option>
                  {domains.map(domain => (
                    <option key={domain._id} value={domain._id}>{domain.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="subdomainName">Nom du sous-domaine *</label>
                <input
                  type="text"
                  id="subdomainName"
                  name="name"
                  value={subdomainFormData.name}
                  onChange={handleSubdomainChange}
                  placeholder="Ex: Langage réceptif"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="subdomainDescription">Description</label>
                <textarea
                  id="subdomainDescription"
                  name="description"
                  value={subdomainFormData.description}
                  onChange={handleSubdomainChange}
                  placeholder="Description du sous-domaine..."
                  rows={3}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={handleCancelSubdomain}>
                  Annuler
                </button>
                <button type="submit" className="btn-submit">
                  {editingSubdomain ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste des domaines */}
      <div className="domains-list">
        {domains.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
            </svg>
            <h3>Aucun domaine</h3>
            <p>Commencez par créer votre premier domaine</p>
          </div>
        ) : (
          <div className="domains-grid">
            {domains.map(domain => {
              const domainSubdomains = getSubdomainsByDomain(domain._id)

              return (
                <div 
                  key={domain._id} 
                  className="domain-card-simple"
                  onClick={() => {
                    setSelectedDomainForModal(domain)
                    setShowSubdomainsModal(true)
                  }}
                >
                  <div className="domain-number">{domain.order}</div>
                  
                  <div className="domain-card-content">
                    <div className="domain-info-main">
                      <h3 className="domain-title">{domain.name}</h3>
                      {domain.description && (
                        <p className="domain-description">{domain.description}</p>
                      )}
                    </div>
                    
                    <span className="subdomain-badge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                      </svg>
                      {domainSubdomains.length}
                    </span>
                    
                    <div className="domain-card-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="btn-icon-small" onClick={() => handleEditDomain(domain)} title="Modifier">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="btn-icon-small btn-delete" onClick={() => handleDeleteDomain(domain._id)} title="Supprimer">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal des sous-domaines */}
      {showSubdomainsModal && selectedDomainForModal && (
        <div className="modal-overlay" onClick={() => setShowSubdomainsModal(false)}>
          <div className="modal-content modal-subdomains" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-content">
                <div className="domain-number-large">{selectedDomainForModal.order}</div>
                <div>
                  <h2>{selectedDomainForModal.name}</h2>
                  {selectedDomainForModal.description && (
                    <p className="modal-domain-description">{selectedDomainForModal.description}</p>
                  )}
                </div>
              </div>
              <button className="btn-close" onClick={() => setShowSubdomainsModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="modal-subdomains-header">
                <h3>Sous-domaines ({getSubdomainsByDomain(selectedDomainForModal._id).length})</h3>
              </div>

              <div className="modal-subdomains-grid">
                {getSubdomainsByDomain(selectedDomainForModal._id).map(subdomain => (
                  <div key={subdomain._id} className="modal-subdomain-card">
                    <div className="modal-subdomain-header">
                      <div className="subdomain-number-badge">{subdomain.order}</div>
                      <h4>{subdomain.name}</h4>
                    </div>
                    {subdomain.description && (
                      <p className="modal-subdomain-description">{subdomain.description}</p>
                    )}
                    <div className="modal-subdomain-actions">
                      <button 
                        className="btn-action-modal btn-generate"
                        onClick={() => {
                          handleOpenGenerateTasks(subdomain)
                          setShowSubdomainsModal(false)
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <line x1="12" y1="18" x2="12" y2="12"/>
                          <line x1="9" y1="15" x2="15" y2="15"/>
                        </svg>
                        Générer tâches
                      </button>
                      <button 
                        className="btn-action-modal btn-edit-modal"
                        onClick={() => {
                          handleEditSubdomain(subdomain)
                          setShowSubdomainsModal(false)
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Modifier
                      </button>
                      <button 
                        className="btn-action-modal btn-delete-modal"
                        onClick={() => {
                          handleDeleteSubdomain(subdomain._id)
                          setShowSubdomainsModal(false)
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
