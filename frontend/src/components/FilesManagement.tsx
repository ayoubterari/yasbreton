import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api, FileResource, Category } from '../lib/convex-client'
import FileForm from './FileForm'
import FileViewer from './FileViewer'
import './FilesManagement.css'

export default function FilesManagement() {
  const { user } = useAuth()
  const [files, setFiles] = useState<FileResource[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingFile, setEditingFile] = useState<FileResource | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'free' | 'premium'>('all')
  const [viewingFile, setViewingFile] = useState<FileResource | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [filesData, categoriesData] = await Promise.all([
        api.files.getFiles(),
        api.files.getCategories(),
      ])
      setFiles(filesData)
      setCategories(categoriesData)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (fileId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      return
    }

    try {
      await api.files.deleteFile(fileId)
      setSuccess('Fichier supprimé avec succès')
      setTimeout(() => setSuccess(''), 3000)
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleEdit = (file: FileResource) => {
    setEditingFile(file)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingFile(null)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingFile(null)
    loadData()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const getCategoryNames = (categoryIds: string[]) => {
    return categoryIds
      .map((id) => {
        const cat = categories.find((c) => c._id === id)
        return cat ? cat.nameFr : ''
      })
      .filter(Boolean)
      .join(', ')
  }

  const filteredFiles = filterType === 'all' 
    ? files 
    : files.filter(f => f.type === filterType)

  return (
    <div className="files-management">
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="files-header">
        <div className="header-left">
          <h2>Gestion des fichiers</h2>
          <p className="section-description">
            Gérez vos fichiers et ressources
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-add-file">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ajouter un fichier
        </button>
      </div>

      {/* Filtres */}
      <div className="files-filters">
        <button
          className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          Tous ({files.length})
        </button>
        <button
          className={`filter-btn ${filterType === 'free' ? 'active' : ''}`}
          onClick={() => setFilterType('free')}
        >
          Gratuit ({files.filter(f => f.type === 'free').length})
        </button>
        <button
          className={`filter-btn ${filterType === 'premium' ? 'active' : ''}`}
          onClick={() => setFilterType('premium')}
        >
          Premium ({files.filter(f => f.type === 'premium').length})
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Chargement des fichiers...</div>
      ) : (
        <div className="files-grid">
          {filteredFiles.map((file) => (
            <div key={file._id} className="file-card">
              <div className="file-card-header">
                <div className="file-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                    <polyline points="13 2 13 9 20 9" />
                  </svg>
                </div>
                <span className={`file-type-badge ${file.type}`}>
                  {file.type === 'free' ? 'Gratuit' : 'Premium'}
                </span>
              </div>

              <div className="file-card-body">
                <h3 className="file-title">{file.titleFr}</h3>
                <p className="file-title-ar">{file.titleAr}</p>
                <p className="file-description">{file.descriptionFr}</p>

                <div className="file-meta">
                  <div className="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                    </svg>
                    <span>{getCategoryNames(file.categories) || 'Sans catégorie'}</span>
                  </div>

                  <div className="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                    </svg>
                    <span>{formatFileSize(file.fileSize)}</span>
                  </div>
                </div>

                {file.tags.length > 0 && (
                  <div className="file-tags">
                    {file.tags.map((tag, idx) => (
                      <span key={idx} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="file-card-actions">
                <button
                  onClick={() => setViewingFile(file)}
                  className="btn-action btn-read"
                  title="Lire"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-action btn-download"
                  title="Télécharger"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                </a>
                <button
                  onClick={() => handleEdit(file)}
                  className="btn-action btn-edit"
                  title="Modifier"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(file._id)}
                  className="btn-action btn-delete"
                  title="Supprimer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {filteredFiles.length === 0 && (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
              <p>Aucun fichier trouvé</p>
            </div>
          )}
        </div>
      )}

      {/* Modal de formulaire */}
      {showForm && (
        <FileForm
          file={editingFile}
          categories={categories}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
          userId={user!.id}
        />
      )}

      {/* File Viewer Modal */}
      {viewingFile && (
        <FileViewer
          fileUrl={viewingFile.fileUrl}
          fileName={viewingFile.fileName}
          fileType={viewingFile.fileType}
          onClose={() => setViewingFile(null)}
        />
      )}
    </div>
  )
}
