import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api, Task, TaskCriterion, Domain, Subdomain } from '../lib/convex-client'
import './TasksManagement.css'

interface FileResource {
  _id: string
  titleFr: string
  titleAr: string
  fileName: string
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
    videoUrl: ''
  })
  const [editingCriterionIndex, setEditingCriterionIndex] = useState<number | null>(null)

  useEffect(() => {
    loadTasks()
    loadResources()
    loadDomains()
  }, [])

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
      setResources(allFiles.map((f: any) => ({
        _id: f._id,
        titleFr: f.titleFr,
        titleAr: f.titleAr,
        fileName: f.fileName
      })))
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

  const handleCriterionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentCriterion({
      ...currentCriterion,
      [e.target.name]: e.target.value
    })
  }

  const addCriterion = () => {
    if (currentCriterion.title && currentCriterion.videoUrl) {
      if (editingCriterionIndex !== null) {
        // Mode édition
        const updatedCriteria = [...criteria]
        updatedCriteria[editingCriterionIndex] = currentCriterion
        setCriteria(updatedCriteria)
        setEditingCriterionIndex(null)
      } else {
        // Mode ajout
        setCriteria([...criteria, currentCriterion])
      }
      setCurrentCriterion({ title: '', videoUrl: '' })
    }
  }

  const editCriterion = (index: number) => {
    setCurrentCriterion(criteria[index])
    setEditingCriterionIndex(index)
  }

  const cancelEditCriterion = () => {
    setCurrentCriterion({ title: '', videoUrl: '' })
    setEditingCriterionIndex(null)
  }

  const removeCriterion = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index))
    if (editingCriterionIndex === index) {
      setCurrentCriterion({ title: '', videoUrl: '' })
      setEditingCriterionIndex(null)
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
    setCriteria([])
    setShowForm(false)
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
          criteria
        })
      } else {
        // Mode création
        await api.tasks.createTask({
          ...formData,
          resourceIds: selectedResourceIds,
          criteria,
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
        <div className="task-form-card">
          <div className="form-header">
            <h2>{editingTask ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}</h2>
            <button className="btn-close" onClick={handleCancelEdit}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

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
                Ressources attachées
              </label>
              <div className="resources-list">
                {resources.length === 0 ? (
                  <p className="no-resources">Aucune ressource disponible. Ajoutez des fichiers dans la section Ressources.</p>
                ) : (
                  resources.map(resource => (
                    <label key={resource._id} className="resource-checkbox">
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
                      <span className="resource-name">{resource.titleFr}</span>
                      <span className="resource-file">{resource.fileName}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Section Critères */}
            <div className="criteria-section-form">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 11 12 14 22 4"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
                Critères liés
              </h3>
              
              <div className="criteria-input-group">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="criterionTitle">Titre du critère</label>
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
                    <label htmlFor="criterionVideoUrl">Lien vidéo YouTube du critère</label>
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
                <div className="criterion-actions-buttons">
                  <button type="button" className="btn-add-criterion" onClick={addCriterion}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {editingCriterionIndex !== null ? (
                        <>
                          <polyline points="9 11 12 14 22 4"/>
                          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                        </>
                      ) : (
                        <>
                          <line x1="12" y1="5" x2="12" y2="19"/>
                          <line x1="5" y1="12" x2="19" y2="12"/>
                        </>
                      )}
                    </svg>
                    {editingCriterionIndex !== null ? 'Mettre à jour le critère' : 'Ajouter le critère'}
                  </button>
                  {editingCriterionIndex !== null && (
                    <button type="button" className="btn-cancel-criterion" onClick={cancelEditCriterion}>
                      Annuler
                    </button>
                  )}
                </div>
              </div>

              {criteria.length > 0 && (
                <div className="criteria-list-form">
                  <h4>Critères ajoutés ({criteria.length})</h4>
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
                        <button type="button" className="btn-edit-criterion" onClick={() => editCriterion(index)}>
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
      )}

      <div className="tasks-list">
        {loading ? (
          <div className="empty-state">
            <div className="spinner-large"></div>
            <h3>Chargement des tâches...</h3>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
            <h3>Aucune tâche</h3>
            <p>Commencez par créer votre première tâche</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task._id} className="task-card">
              <div className="task-header">
                <h3>{task.title}</h3>
                <div className="task-actions">
                  <button className="btn-edit" onClick={() => handleEdit(task)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(task._id)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>

              {task.videoUrl && (
                <div className="task-video">
                  <a href={task.videoUrl} target="_blank" rel="noopener noreferrer">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    Voir la vidéo
                  </a>
                </div>
              )}

              <div className="task-section">
                <h4>Description</h4>
                <p>{task.description}</p>
              </div>

              <div className="task-section">
                <h4>Ligne de base</h4>
                <p>{task.baseline}</p>
              </div>

              <div className="task-section">
                <h4>Détails techniques & Matériel</h4>
                <p>{task.technicalDetails}</p>
              </div>

              <div className="task-section">
                <h4>Ressources</h4>
                <p>{task.resources}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
