import { useState, useEffect } from 'react'
import { api } from '../lib/convex-client'
import './TagsManagement.css'

interface Tag {
  _id: string
  name: string
  createdAt: number
}

export default function TagsManagement() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      setLoading(true)
      const data = await api.tags.getAll()
      setTags(data)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTagName.trim()) return

    try {
      await api.tags.create(newTagName.trim())
      setSuccess('Tag créé avec succès')
      setNewTagName('')
      setTimeout(() => setSuccess(''), 3000)
      await loadTags()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag)
    setEditName(tag.name)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTag || !editName.trim()) return

    try {
      await api.tags.update(editingTag._id, editName.trim())
      setSuccess('Tag modifié avec succès')
      setEditingTag(null)
      setEditName('')
      setTimeout(() => setSuccess(''), 3000)
      await loadTags()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleDelete = async (tag: Tag) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le tag "${tag.name}" ?`)) {
      return
    }

    try {
      await api.tags.delete(tag._id)
      setSuccess('Tag supprimé avec succès')
      setTimeout(() => setSuccess(''), 3000)
      await loadTags()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression')
      setTimeout(() => setError(''), 3000)
    }
  }

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="tags-management">
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="tags-header">
        <div className="header-left">
          <h2>Gestion des tags</h2>
          <p className="section-description">
            Créez et gérez les tags pour organiser vos fichiers
          </p>
        </div>
      </div>

      {/* Formulaire de création */}
      <div className="create-tag-section">
        <form onSubmit={handleCreate} className="create-tag-form">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Nom du nouveau tag..."
            className="tag-input"
          />
          <button type="submit" className="btn-create-tag" disabled={!newTagName.trim()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Créer
          </button>
        </form>
      </div>

      {/* Barre de recherche */}
      <div className="search-section">
        <div className="search-input-wrapper">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un tag..."
            className="search-input"
          />
        </div>
        <div className="tags-count">
          {filteredTags.length} tag{filteredTags.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Liste des tags */}
      {loading ? (
        <div className="loading-state">Chargement des tags...</div>
      ) : (
        <div className="tags-list">
          {filteredTags.length > 0 ? (
            filteredTags.map((tag) => (
              <div key={tag._id} className="tag-item">
                {editingTag?._id === tag._id ? (
                  <form onSubmit={handleUpdate} className="tag-edit-form">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="tag-edit-input"
                      autoFocus
                    />
                    <div className="tag-edit-actions">
                      <button type="submit" className="btn-save" disabled={!editName.trim()}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTag(null)
                          setEditName('')
                        }}
                        className="btn-cancel-edit"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="tag-info">
                      <div className="tag-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                          <line x1="7" y1="7" x2="7.01" y2="7" />
                        </svg>
                      </div>
                      <span className="tag-name">{tag.name}</span>
                    </div>
                    <div className="tag-actions">
                      <button
                        onClick={() => handleEdit(tag)}
                        className="btn-action btn-edit"
                        title="Modifier"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(tag)}
                        className="btn-action btn-delete"
                        title="Supprimer"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              <p>{searchTerm ? 'Aucun tag trouvé' : 'Aucun tag. Créez-en un pour commencer.'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
