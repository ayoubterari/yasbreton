import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api, Task, TaskCriterion, Domain, Subdomain } from '../lib/convex-client'
import './TasksManagement.css'
import './TasksManagement-domains.css'

interface FileResource {
  _id: string
  titleFr: string
  titleAr: string
  fileName: string
  tags: string[]
}

export default function TasksManagement() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [resources, setResources] = useState<FileResource[]>([])
  const [domains, setDomains] = useState<Domain[]>([])
  const [subdomains, setSubdomains] = useState<Subdomain[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [searchQuery] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    description: '',
    baseline: '',
    technicalDetails: '',
    subdomainId: ''
  })
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([])
  const [criteria, setCriteria] = useState<TaskCriterion[]>([])
  const [currentCriterion, setCurrentCriterion] = useState({
    title: '',
    videoUrl: '',
    description: '',
    baseline: '',
    technicalDetails: '',
    resourceIds: [] as string[]
  })
  const [criterionSelectedTags, setCriterionSelectedTags] = useState<string[]>([])
  const [editingCriterionIndex, setEditingCriterionIndex] = useState<number | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [openSubdomains, setOpenSubdomains] = useState<Record<string, boolean>>({})
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null)
  const [showCriterionForm, setShowCriterionForm] = useState(false)

  useEffect(() => {
    loadTasks()
    loadResources()
    loadDomains()
  }, [])

  // Fonction pour sélectionner un domaine
  const selectDomain = (domainId: string | null) => {
    setSelectedDomainId(domainId)
    setOpenSubdomains({}) // Réinitialiser les sous-domaines ouverts
  }

  // Fonction pour toggle l'ouverture/fermeture d'un sous-domaine
  const toggleSubdomain = (subdomainId: string) => {
    setOpenSubdomains(prev => ({
      ...prev,
      [subdomainId]: !prev[subdomainId]
    }))
  }

  // Obtenir les sous-domaines d'un domaine
  const getSubdomainsByDomain = (domainId: string) => {
    return subdomains.filter(sd => sd.domainId === domainId).sort((a, b) => a.order - b.order)
  }

  // Obtenir les tâches d'un sous-domaine
  const getTasksBySubdomain = (subdomainId: string) => {
    return tasks.filter(t => t.subdomainId === subdomainId)
  }

  const loadTasks = async () => {
    try {
      setLoading(true)
      const allTasks = await api.tasks.getAllTasks()
      setTasks(allTasks)
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error)
      alert('Erreur lors du chargement des tâches')
    } finally {
      setLoading(false)
    }
  }

  const loadResources = async () => {
    try {
      const allFiles = await api.files.getFiles()
      const mappedResources = allFiles.map((f: any) => ({
        _id: f._id,
        titleFr: f.titleFr,
        titleAr: f.titleAr,
        fileName: f.fileName,
        tags: f.tags || []
      }))
      setResources(mappedResources)
      
      // Extraire tous les tags uniques
      const tagsSet = new Set<string>()
      mappedResources.forEach((resource: FileResource) => {
        resource.tags.forEach(tag => tagsSet.add(tag))
      })
      setAvailableTags(Array.from(tagsSet).sort())
    } catch (error) {
      console.error('Erreur lors du chargement des ressources:', error)
    }
  }

  const loadDomains = async () => {
    try {
      const [allDomains, allSubdomains] = await Promise.all([
        api.domains.getAllDomains(),
        api.domains.getAllSubdomains()
      ])
      setDomains(allDomains)
      setSubdomains(allSubdomains)
    } catch (error) {
      console.error('Erreur lors du chargement des domaines:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleCriterionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCurrentCriterion({
      ...currentCriterion,
      [e.target.name]: e.target.value
    })
  }

  const addCriterion = () => {
    if (currentCriterion.title && currentCriterion.videoUrl) {
      if (editingCriterionIndex !== null) {
        // Mettre à jour un critère existant
        const updatedCriteria = [...criteria]
        updatedCriteria[editingCriterionIndex] = currentCriterion
        setCriteria(updatedCriteria)
        setEditingCriterionIndex(null)
      } else {
        // Ajouter un nouveau critère
        setCriteria([...criteria, currentCriterion])
      }
      setCurrentCriterion({ 
        title: '', 
        videoUrl: '', 
        description: '', 
        baseline: '', 
        technicalDetails: '', 
        resourceIds: [] 
      })
      setCriterionSelectedTags([])
      setShowCriterionForm(false) // Fermer le formulaire après l'ajout
    }
  }

  const editCriterion = (index: number) => {
    const criterion = criteria[index]
    setCurrentCriterion({
      title: criterion.title,
      videoUrl: criterion.videoUrl,
      description: criterion.description || '',
      baseline: criterion.baseline || '',
      technicalDetails: criterion.technicalDetails || '',
      resourceIds: criterion.resourceIds || []
    })
    // Récupérer les tags des ressources du critère
    const criterionResourceTags = new Set<string>()
    resources.forEach(resource => {
      if (criterion.resourceIds?.includes(resource._id)) {
        resource.tags.forEach(tag => criterionResourceTags.add(tag))
      }
    })
    setCriterionSelectedTags(Array.from(criterionResourceTags))
    setEditingCriterionIndex(index)
  }


  const removeCriterion = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index))
    if (editingCriterionIndex === index) {
      setCurrentCriterion({ 
        title: '', 
        videoUrl: '', 
        description: '', 
        baseline: '', 
        technicalDetails: '', 
        resourceIds: [] 
      })
      setCriterionSelectedTags([])
      setEditingCriterionIndex(null)
      setShowCriterionForm(false)
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      videoUrl: task.videoUrl,
      description: task.description,
      baseline: task.baseline,
      technicalDetails: task.technicalDetails,
      subdomainId: task.subdomainId || ''
    })
    setSelectedResourceIds(task.resourceIds || [])
    setCriteria(task.criteria || [])
    setShowForm(true)
  }

  const handleCancelEdit = () => {
    setEditingTask(null)
    setFormData({
      title: '',
      videoUrl: '',
      description: '',
      baseline: '',
      technicalDetails: '',
      subdomainId: ''
    })
    setSelectedResourceIds([])
    setSelectedTags([])
    setCriteria([])
    setShowForm(false)
    setShowCriterionForm(false)
    setCurrentCriterion({
      title: '',
      videoUrl: '',
      description: '',
      baseline: '',
      technicalDetails: '',
      resourceIds: []
    })
    setCriterionSelectedTags([])
    setEditingCriterionIndex(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert('Vous devez être connecté pour créer une tâche')
      return
    }

    try {
      if (editingTask) {
        // Mode édition
        await api.tasks.updateTask({
          taskId: editingTask._id,
          ...formData,
          resourceIds: selectedResourceIds,
          criteria: criteria
        })
      } else {
        // Mode création
        await api.tasks.createTask({
          ...formData,
          resourceIds: selectedResourceIds,
          criteria: criteria,
          userId: user.id
        })
      }
      
      setFormData({
        title: '',
        videoUrl: '',
        description: '',
        baseline: '',
        technicalDetails: '',
        subdomainId: ''
      })
      setSelectedResourceIds([])
      setCriteria([])
      setEditingTask(null)
      setShowForm(false)
      
      // Recharger les tâches
      await loadTasks()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la tâche:', error)
      alert('Erreur lors de la sauvegarde de la tâche')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await api.tasks.deleteTask(id)
        await loadTasks()
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        alert('Erreur lors de la suppression de la tâche')
      }
    }
  }

  // Filtrer les tâches selon la recherche
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.baseline?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Filtrer les ressources selon les tags sélectionnés
  const filteredResources = selectedTags.length === 0 
    ? [] 
    : resources.filter(resource => 
        selectedTags.some(tag => resource.tags.includes(tag))
      )

  // Gérer la sélection/désélection d'un tag
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  // Gérer la sélection/désélection d'un tag pour le critère
  const handleCriterionTagToggle = (tag: string) => {
    if (criterionSelectedTags.includes(tag)) {
      setCriterionSelectedTags(criterionSelectedTags.filter(t => t !== tag))
    } else {
      setCriterionSelectedTags([...criterionSelectedTags, tag])
    }
  }

  // Filtrer les ressources selon les tags sélectionnés pour le critère
  const filteredCriterionResources = criterionSelectedTags.length === 0 
    ? [] 
    : resources.filter(resource => 
        criterionSelectedTags.some(tag => resource.tags.includes(tag))
      )

  // Sélectionner automatiquement toutes les ressources filtrées pour le critère
  const handleSelectAllCriterionResources = () => {
    const allFilteredIds = filteredCriterionResources.map(r => r._id)
    setCurrentCriterion({
      ...currentCriterion,
      resourceIds: allFilteredIds
    })
  }

  // Gérer la sélection de toutes les ressources filtrées
  const handleSelectAllResources = () => {
    const allFilteredIds = filteredResources.map(r => r._id)
    const allSelected = allFilteredIds.every(id => selectedResourceIds.includes(id))
    
    if (allSelected) {
      // Désélectionner toutes les ressources filtrées
      setSelectedResourceIds(selectedResourceIds.filter(id => !allFilteredIds.includes(id)))
    } else {
      // Sélectionner toutes les ressources filtrées
      const newIds = [...new Set([...selectedResourceIds, ...allFilteredIds])]
      setSelectedResourceIds(newIds)
    }
  }

  return (
    <div className="tasks-management">
      <div className="tasks-header">
        <div>
          <h1>Gestion des Tâches</h1>
          <p>Créez et gérez vos tâches avec vidéos et ressources</p>
        </div>
        <button className="btn-add-task" onClick={() => setShowForm(!showForm)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nouvelle tâche
        </button>
      </div>



      {showForm && (
        <div className="task-modal-overlay">
          <div className="task-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="task-modal-header">
              <h2>{editingTask ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}</h2>
              <button className="btn-close-modal" onClick={handleCancelEdit}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <div className="task-modal-body">

          <form onSubmit={handleSubmit} className="task-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Titre de la tâche
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ex: Installation du système de chauffage"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="videoUrl">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="23 7 16 12 23 17 23 7"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                  </svg>
                  Lien vidéo YouTube
                </label>
                <input
                  type="url"
                  id="videoUrl"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="subdomainId">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                </svg>
                Sous-domaine
              </label>
              <select
                id="subdomainId"
                name="subdomainId"
                value={formData.subdomainId}
                onChange={handleChange}
              >
                <option value="">Aucun sous-domaine</option>
                {domains.map(domain => (
                  <optgroup key={domain._id} label={domain.name}>
                    {subdomains
                      .filter(sub => sub.domainId === domain._id)
                      .map(subdomain => (
                        <option key={subdomain._id} value={subdomain._id}>
                          {subdomain.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description détaillée de la tâche..."
                rows={4}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="baseline">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                Ligne de base
              </label>
              <textarea
                id="baseline"
                name="baseline"
                value={formData.baseline}
                onChange={handleChange}
                placeholder="Objectifs et critères de base..."
                rows={3}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="technicalDetails">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
                </svg>
                Détails techniques & Matériel
              </label>
              <textarea
                id="technicalDetails"
                name="technicalDetails"
                value={formData.technicalDetails}
                onChange={handleChange}
                placeholder="Spécifications techniques, matériel nécessaire..."
                rows={4}
                required
              />
            </div>

            <div className="form-group resources-selector">
              <label>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                </svg>
                Ressources attachées (via tags)
              </label>
              
              {/* Sélection des tags en checklist */}
              {availableTags.length > 0 && (
                <div className="tags-filter">
                  <label className="tags-filter-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                      <line x1="7" y1="7" x2="7.01" y2="7"/>
                    </svg>
                    Filtrer par tags :
                  </label>
                  <div className="tags-checklist">
                    {availableTags.map(tag => (
                      <label key={tag} className="tag-checkbox-item">
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag)}
                          onChange={() => handleTagToggle(tag)}
                        />
                        <span className="tag-checkbox-label">{tag}</span>
                      </label>
                    ))}
                  </div>
                  {selectedTags.length > 0 && (
                    <button
                      type="button"
                      className="btn-clear-tags"
                      onClick={() => setSelectedTags([])}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                      Effacer les filtres
                    </button>
                  )}
                </div>
              )}

              {/* Liste des ressources filtrées */}
              {selectedTags.length === 0 ? (
                <div className="resources-placeholder">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                    <line x1="7" y1="7" x2="7.01" y2="7"/>
                  </svg>
                  <p>Sélectionnez un ou plusieurs tags pour afficher les ressources correspondantes</p>
                </div>
              ) : (
                <>
                  {filteredResources.length > 0 && (
                    <div className="resources-header">
                      <span className="resources-count">
                        {filteredResources.length} ressource{filteredResources.length > 1 ? 's' : ''} trouvée{filteredResources.length > 1 ? 's' : ''}
                      </span>
                      <button
                        type="button"
                        className="btn-select-all"
                        onClick={handleSelectAllResources}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 11 12 14 22 4"/>
                          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                        </svg>
                        {filteredResources.every(r => selectedResourceIds.includes(r._id)) ? 'Tout désélectionner' : 'Tout sélectionner'}
                      </button>
                    </div>
                  )}
                  <div className="resources-list-simple">
                    {filteredResources.length === 0 ? (
                      <p className="no-resources">Aucune ressource ne correspond aux tags sélectionnés.</p>
                    ) : (
                      filteredResources.map(resource => (
                        <label key={resource._id} className="resource-checkbox-simple">
                          <input
                            type="checkbox"
                            checked={selectedResourceIds.includes(resource._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedResourceIds([...selectedResourceIds, resource._id])
                              } else {
                                setSelectedResourceIds(selectedResourceIds.filter(id => id !== resource._id))
                              }
                            }}
                          />
                          <div className="resource-simple-info">
                            <span className="resource-simple-name">{resource.titleFr}</span>
                            <span className="resource-simple-file">{resource.fileName}</span>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Section Critères */}
            <div className="criteria-section-form">
              <div className="criteria-section-header">
                <h3>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 11 12 14 22 4"/>
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                  </svg>
                  Critères liés
                </h3>
                {!showCriterionForm && criteria.length === 0 && (
                  <button 
                    type="button" 
                    className="btn-add-first-criterion" 
                    onClick={() => setShowCriterionForm(true)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Ajouter un critère
                  </button>
                )}
              </div>
              
              {showCriterionForm && (
              <div className="criteria-input-group">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="criterionTitle">Titre du critère *</label>
                    <input
                      type="text"
                      id="criterionTitle"
                      name="title"
                      value={currentCriterion.title}
                      onChange={handleCriterionChange}
                      placeholder="Ex: Critère 1 — Réponse au prénom"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="criterionVideoUrl">Lien vidéo YouTube *</label>
                    <input
                      type="url"
                      id="criterionVideoUrl"
                      name="videoUrl"
                      value={currentCriterion.videoUrl}
                      onChange={handleCriterionChange}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="criterionDescription">Description du critère</label>
                  <textarea
                    id="criterionDescription"
                    name="description"
                    value={currentCriterion.description}
                    onChange={handleCriterionChange}
                    placeholder="Description détaillée du critère..."
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="criterionBaseline">Ligne de base du critère</label>
                  <textarea
                    id="criterionBaseline"
                    name="baseline"
                    value={currentCriterion.baseline}
                    onChange={handleCriterionChange}
                    placeholder="Objectifs et critères de base..."
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="criterionTechnicalDetails">Détails techniques & Matériel</label>
                  <textarea
                    id="criterionTechnicalDetails"
                    name="technicalDetails"
                    value={currentCriterion.technicalDetails}
                    onChange={handleCriterionChange}
                    placeholder="Spécifications techniques, matériel nécessaire..."
                    rows={3}
                  />
                </div>

                {/* Ressources pour le critère avec sélecteur de tags */}
                <div className="form-group criterion-resources-section">
                  <label>Ressources attachées au critère</label>
                  
                  {/* Sélecteur de tags pour le critère */}
                  {availableTags.length > 0 && (
                    <div className="criterion-tags-filter">
                      <label className="criterion-tags-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                          <line x1="7" y1="7" x2="7.01" y2="7"/>
                        </svg>
                        Tags du critère :
                      </label>
                      <div className="tags-checklist-small">
                        {availableTags.map(tag => (
                          <label key={tag} className="tag-checkbox-item-small">
                            <input
                              type="checkbox"
                              checked={criterionSelectedTags.includes(tag)}
                              onChange={() => handleCriterionTagToggle(tag)}
                            />
                            <span className="tag-checkbox-label">{tag}</span>
                          </label>
                        ))}
                      </div>
                      {criterionSelectedTags.length > 0 && (
                        <button
                          type="button"
                          className="btn-clear-tags-small"
                          onClick={() => setCriterionSelectedTags([])}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                          Effacer
                        </button>
                      )}
                    </div>
                  )}

                  {/* Liste des ressources filtrées */}
                  {criterionSelectedTags.length === 0 ? (
                    <div className="criterion-resources-placeholder">
                      <p>Sélectionnez un ou plusieurs tags pour afficher les ressources correspondantes</p>
                    </div>
                  ) : (
                    <>
                      {filteredCriterionResources.length > 0 && (
                        <div className="criterion-resources-header">
                          <span className="resources-count-small">
                            {filteredCriterionResources.length} ressource{filteredCriterionResources.length > 1 ? 's' : ''}
                          </span>
                          <button
                            type="button"
                            className="btn-select-all-small"
                            onClick={handleSelectAllCriterionResources}
                          >
                            Tout sélectionner
                          </button>
                        </div>
                      )}
                      <div className="criterion-resources-list">
                        {filteredCriterionResources.length === 0 ? (
                          <p className="no-resources-small">Aucune ressource ne correspond aux tags sélectionnés.</p>
                        ) : (
                          filteredCriterionResources.map(resource => (
                            <label key={resource._id} className="resource-checkbox-simple">
                              <input
                                type="checkbox"
                                checked={currentCriterion.resourceIds.includes(resource._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setCurrentCriterion({
                                      ...currentCriterion,
                                      resourceIds: [...currentCriterion.resourceIds, resource._id]
                                    })
                                  } else {
                                    setCurrentCriterion({
                                      ...currentCriterion,
                                      resourceIds: currentCriterion.resourceIds.filter(id => id !== resource._id)
                                    })
                                  }
                                }}
                              />
                              <div className="resource-simple-info">
                                <span className="resource-simple-name">{resource.titleFr}</span>
                                <span className="resource-simple-file">{resource.fileName}</span>
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className="criterion-actions-buttons">
                  <button 
                    type="button" 
                    className="btn-save-criterion" 
                    onClick={addCriterion}
                    disabled={!currentCriterion.title.trim() || !currentCriterion.videoUrl.trim()}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {editingCriterionIndex !== null ? (
                        <>
                          <polyline points="9 11 12 14 22 4"/>
                          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                        </>
                      ) : (
                        <>
                          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                          <polyline points="17 21 17 13 7 13 7 21"/>
                          <polyline points="7 3 7 8 15 8"/>
                        </>
                      )}
                    </svg>
                    {editingCriterionIndex !== null ? 'Mettre à jour' : 'Enregistrer'}
                  </button>
                  
                  {editingCriterionIndex === null && criteria.length > 0 && (
                    <button 
                      type="button" 
                      className="btn-add-new-criterion" 
                      onClick={() => {
                        // Réinitialiser le formulaire pour ajouter un nouveau critère
                        setCurrentCriterion({
                          title: '',
                          videoUrl: '',
                          description: '',
                          baseline: '',
                          technicalDetails: '',
                          resourceIds: []
                        })
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Ajouter un autre critère
                    </button>
                  )}
                  
                  <button 
                    type="button" 
                    className="btn-cancel-criterion" 
                    onClick={() => {
                      setShowCriterionForm(false)
                      setCurrentCriterion({
                        title: '',
                        videoUrl: '',
                        description: '',
                        baseline: '',
                        technicalDetails: '',
                        resourceIds: []
                      })
                      setCriterionSelectedTags([])
                    }}
                  >
                    Annuler
                  </button>
                  
                </div>
              </div>
              )}

              {criteria.length > 0 && (
                <div className="criteria-list-form">
                  <div className="criteria-list-header">
                    <h4>Critères ajoutés ({criteria.length})</h4>
                    {!showCriterionForm && (
                      <button 
                        type="button" 
                        className="btn-add-criterion-from-list" 
                        onClick={() => setShowCriterionForm(true)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"/>
                          <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Ajouter
                      </button>
                    )}
                  </div>
                  {criteria.map((criterion, index) => (
                    <div key={index} className={`criterion-item-form ${editingCriterionIndex === index ? 'editing' : ''}`}>
                      <div className="criterion-info">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                        <div>
                          <strong>{criterion.title}</strong>
                          <span>{criterion.videoUrl}</span>
                        </div>
                      </div>
                      <div className="criterion-actions">
                        <button type="button" className="btn-edit-criterion" onClick={() => { editCriterion(index); setShowCriterionForm(true); }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button type="button" className="btn-remove-criterion" onClick={() => removeCriterion(index)}>
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

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={handleCancelEdit}>
                Annuler
              </button>
              <button type="submit" className="btn-submit">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 11 12 14 22 4"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
                {editingTask ? 'Mettre à jour' : 'Créer la tâche'}
              </button>
            </div>
          </form>
            </div>
          </div>
        </div>
      )}

      <div className="tasks-by-subdomain">
        {loading ? (
          <div className="empty-state">
            <div className="spinner-large"></div>
            <h3>Chargement des tâches...</h3>
          </div>
        ) : !selectedDomainId ? (
          // Affichage des domaines principaux
          <div className="domains-list-tasks">
            <div className="domains-grid-tasks">
              {domains.sort((a, b) => a.order - b.order).map(domain => {
                const domainSubdomains = getSubdomainsByDomain(domain._id)
                const domainTasksCount = domainSubdomains.reduce((count, sd) => 
                  count + getTasksBySubdomain(sd._id).length, 0
                )
                
                return (
                  <div 
                    key={domain._id} 
                    className="domain-card-tasks"
                    onClick={() => selectDomain(domain._id)}
                  >
                    <div className="domain-number-tasks">{domain.order}</div>
                    <h3 className="domain-title-tasks">{domain.name}</h3>
                    {domain.description && (
                      <p className="domain-description-tasks">{domain.description}</p>
                    )}
                    <div className="domain-stats-tasks">
                      <span className="stat-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                        </svg>
                        {domainSubdomains.length} sous-domaine{domainSubdomains.length > 1 ? 's' : ''}
                      </span>
                      <span className="stat-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 11l3 3L22 4"/>
                          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                        </svg>
                        {domainTasksCount} tâche{domainTasksCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <button className="btn-back" onClick={() => selectDomain(null)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              Retour aux domaines
            </button>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
            <h3>{searchQuery ? 'Aucune tâche trouvée' : 'Aucune tâche'}</h3>
            <p>{searchQuery ? 'Essayez avec d\'autres mots-clés' : 'Commencez par créer votre première tâche'}</p>
          </div>
        ) : (
          (() => {
            const selectedDomain = domains.find(d => d._id === selectedDomainId)
            const domainSubdomains = getSubdomainsByDomain(selectedDomainId)
            
            // Filtrer les tâches pour ne garder que celles du domaine sélectionné
            const domainTasks = filteredTasks.filter(task => {
              const taskSubdomain = subdomains.find(sd => sd._id === task.subdomainId)
              return taskSubdomain && taskSubdomain.domainId === selectedDomainId
            })
            
            // Grouper les tâches par sous-domaine
            const tasksBySubdomain = domainTasks.reduce((acc, task) => {
              const subdomainId = task.subdomainId || 'no-subdomain'
              if (!acc[subdomainId]) {
                acc[subdomainId] = []
              }
              acc[subdomainId].push(task)
              return acc
            }, {} as Record<string, Task[]>)

            // Trier les sous-domaines par ordre
            const sortedSubdomainIds = Object.keys(tasksBySubdomain).sort((a, b) => {
              if (a === 'no-subdomain') return 1
              if (b === 'no-subdomain') return -1
              const subA = subdomains.find(s => s._id === a)
              const subB = subdomains.find(s => s._id === b)
              return (subA?.order || 0) - (subB?.order || 0)
            })

            return (
              <>
                <div className="domain-header-tasks">
                  <button className="btn-back" onClick={() => selectDomain(null)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="19" y1="12" x2="5" y2="12"/>
                      <polyline points="12 19 5 12 12 5"/>
                    </svg>
                    Retour aux domaines
                  </button>
                  <h2 className="domain-title-header">
                    <span className="domain-number-header">{selectedDomain?.order}</span>
                    {selectedDomain?.name}
                  </h2>
                  <div className="domain-stats-header">
                    <span>{domainSubdomains.length} sous-domaines</span>
                    <span>{domainTasks.length} tâches</span>
                  </div>
                </div>
                {sortedSubdomainIds.map(subdomainId => {
              const subdomain = subdomains.find(s => s._id === subdomainId)
              const tasksInSubdomain = tasksBySubdomain[subdomainId]
              const domain = subdomain ? domains.find(d => d._id === subdomain.domainId) : null

              const isOpen = openSubdomains[subdomainId] !== false // Ouvert par défaut

              return (
                <div key={subdomainId} className="subdomain-section">
                  <div className="subdomain-header" onClick={() => toggleSubdomain(subdomainId)}>
                    <div className="subdomain-info">
                      <button className="btn-toggle-subdomain" type="button">
                        <svg 
                          width="20" 
                          height="20" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2"
                          style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                        >
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </button>
                      <h2 className="subdomain-title">
                        {subdomain ? subdomain.name : 'Sans sous-domaine'}
                      </h2>
                      {domain && (
                        <span className="domain-badge">{domain.name}</span>
                      )}
                    </div>
                    <span className="tasks-count">
                      {tasksInSubdomain.length} tâche{tasksInSubdomain.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {isOpen && (
                  <div className="tasks-grid">
                    {tasksInSubdomain.map(task => (
                      <div key={task._id} className="task-card-grid">
                        <div className="task-card-header">
                          <h3>{task.title}</h3>
                          <div className="task-actions">
                            <button className="btn-edit" onClick={() => handleEdit(task)} title="Modifier">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button className="btn-delete" onClick={() => handleDelete(task._id)} title="Supprimer">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                        {task.videoUrl && (
                          <div className="task-video-grid">
                            <a href={task.videoUrl} target="_blank" rel="noopener noreferrer" title="Voir la vidéo">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="5 3 19 12 5 21 5 3"/>
                              </svg>
                            </a>
                          </div>
                        )}
                        {task.criteria && task.criteria.length > 0 && (
                          <div className="task-criteria-badge">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="9 11 12 14 22 4"/>
                              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                            </svg>
                            {task.criteria.length} critère{task.criteria.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  )}
                </div>
              )
            })}
            </>
          )
          })()
        )}
      </div>
    </div>
  )
}
