import { useState, useEffect } from 'react'
import { api, Domain, Subdomain } from '../lib/convex-client'
import './DomainsManagement.css'

export default function DomainsManagement() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [subdomains, setSubdomains] = useState<Subdomain[]>([])
  const [loading, setLoading] = useState(true)
  const [showDomainForm, setShowDomainForm] = useState(false)
  const [showSubdomainForm, setShowSubdomainForm] = useState(false)
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null)
  const [editingSubdomain, setEditingSubdomain] = useState<Subdomain | null>(null)
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null)
  
  const [domainFormData, setDomainFormData] = useState({
    name: '',
    description: ''
  })

  const [subdomainFormData, setSubdomainFormData] = useState({
    name: '',
    description: '',
    domainId: ''
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
          domains.map(domain => {
            const domainSubdomains = getSubdomainsByDomain(domain._id)
            const isExpanded = selectedDomainId === domain._id

            return (
              <div key={domain._id} className="domain-card">
                <div className="domain-header">
                  <div className="domain-info" onClick={() => setSelectedDomainId(isExpanded ? null : domain._id)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                    </svg>
                    <div>
                      <h3>{domain.name}</h3>
                      {domain.description && <p>{domain.description}</p>}
                      <span className="subdomain-count">{domainSubdomains.length} sous-domaine(s)</span>
                    </div>
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
                  </div>
                  <div className="domain-actions">
                    <button className="btn-icon" onClick={() => handleEditDomain(domain)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button className="btn-icon btn-delete" onClick={() => handleDeleteDomain(domain._id)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {isExpanded && domainSubdomains.length > 0 && (
                  <div className="subdomains-list">
                    {domainSubdomains.map(subdomain => (
                      <div key={subdomain._id} className="subdomain-item">
                        <div className="subdomain-info">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                          <div>
                            <h4>{subdomain.name}</h4>
                            {subdomain.description && <p>{subdomain.description}</p>}
                          </div>
                        </div>
                        <div className="subdomain-actions">
                          <button className="btn-icon" onClick={() => handleEditSubdomain(subdomain)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button className="btn-icon btn-delete" onClick={() => handleDeleteSubdomain(subdomain._id)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18"/>
                              <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
