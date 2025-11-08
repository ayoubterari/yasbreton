import { useState, useEffect } from 'react'
import { api, FileResource, Category } from '../lib/convex-client'
import './FileForm.css'

interface FileFormProps {
  file: FileResource | null
  categories: Category[]
  onClose: () => void
  onSuccess: () => void
  userId: string
}

export default function FileForm({ file, categories, onClose, onSuccess, userId }: FileFormProps) {
  const [formData, setFormData] = useState({
    titleFr: file?.titleFr || '',
    titleAr: file?.titleAr || '',
    descriptionFr: file?.descriptionFr || '',
    descriptionAr: file?.descriptionAr || '',
    categories: file?.categories || [],
    tags: file?.tags || [],
    type: file?.type || 'free' as 'free' | 'premium',
  })

  const [availableTags, setAvailableTags] = useState<Array<{ _id: string; name: string }>>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      const tags = await api.tags.getAll()
      setAvailableTags(tags)
    } catch (err) {
      console.error('Error loading tags:', err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = formData.categories.includes(categoryId)
      ? formData.categories.filter(id => id !== categoryId)
      : [...formData.categories, categoryId]
    setFormData({ ...formData, categories: newCategories })
  }

  const handleTagToggle = (tagName: string) => {
    const newTags = formData.tags.includes(tagName)
      ? formData.tags.filter(t => t !== tagName)
      : [...formData.tags, tagName]
    setFormData({ ...formData, tags: newTags })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const uploadFile = async (file: File): Promise<{ fileUrl: string; storageId: string }> => {
    try {
      // Étape 1 : Obtenir une URL d'upload depuis Convex
      const uploadUrl = await api.files.generateUploadUrl()
      
      // Étape 2 : Uploader le fichier vers Convex Storage
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      
      if (!result.ok) {
        throw new Error('Échec de l\'upload du fichier')
      }
      
      const { storageId } = await result.json()
      
      // Étape 3 : Obtenir l'URL de téléchargement
      const fileUrl = await api.files.getFileUrl(storageId)
      
      if (!fileUrl) {
        throw new Error('Impossible d\'obtenir l\'URL du fichier')
      }
      
      return { fileUrl, storageId }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      throw new Error('Impossible d\'uploader le fichier')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validation
      if (!formData.titleFr || !formData.titleAr) {
        throw new Error('Les titres FR et AR sont requis')
      }

      if (!formData.descriptionFr || !formData.descriptionAr) {
        throw new Error('Les descriptions FR et AR sont requises')
      }

      if (formData.categories.length === 0) {
        throw new Error('Sélectionnez au moins une catégorie')
      }

      // Si c'est un nouveau fichier, l'upload est obligatoire
      if (!file && !selectedFile) {
        throw new Error('Veuillez sélectionner un fichier')
      }

      let fileUrl = file?.fileUrl || ''
      let storageId = file?.storageId || ''
      let fileName = file?.fileName || ''
      let fileType = file?.fileType || ''
      let fileSize = file?.fileSize || 0

      // Upload du fichier si un nouveau fichier est sélectionné
      if (selectedFile) {
        setUploading(true)
        const uploadResult = await uploadFile(selectedFile)
        fileUrl = uploadResult.fileUrl
        storageId = uploadResult.storageId
        fileName = selectedFile.name
        fileType = selectedFile.type
        fileSize = selectedFile.size
        setUploading(false)
      }

      if (file) {
        // Mise à jour
        await api.files.updateFile({
          fileId: file._id,
          ...formData,
          ...(selectedFile ? { fileUrl, fileName, fileType, fileSize } : {}),
        })
      } else {
        // Création
        await api.files.createFile({
          ...formData,
          fileUrl,
          storageId,
          fileName,
          fileType,
          fileSize,
          uploadedBy: userId,
        })
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content file-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{file ? 'Modifier le fichier' : 'Ajouter un fichier'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="file-form">
          {error && <div className="error-message">{error}</div>}

          {/* Titres */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="titleFr">Titre (FR) *</label>
              <input
                id="titleFr"
                name="titleFr"
                type="text"
                value={formData.titleFr}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="titleAr">Titre (AR) *</label>
              <input
                id="titleAr"
                name="titleAr"
                type="text"
                value={formData.titleAr}
                onChange={handleChange}
                required
                disabled={loading}
                dir="rtl"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="descriptionFr">Description (FR) *</label>
              <textarea
                id="descriptionFr"
                name="descriptionFr"
                value={formData.descriptionFr}
                onChange={handleChange}
                required
                disabled={loading}
                rows={4}
              />
            </div>

            <div className="form-group">
              <label htmlFor="descriptionAr">Description (AR) *</label>
              <textarea
                id="descriptionAr"
                name="descriptionAr"
                value={formData.descriptionAr}
                onChange={handleChange}
                required
                disabled={loading}
                rows={4}
                dir="rtl"
              />
            </div>
          </div>

          {/* Catégories */}
          <div className="form-group">
            <label>Catégories *</label>
            <div className="categories-grid">
              {categories.map((cat) => (
                <label key={cat._id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(cat._id)}
                    onChange={() => handleCategoryToggle(cat._id)}
                    disabled={loading}
                  />
                  <span>{cat.nameFr}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>Tags</label>
            {availableTags.length > 0 ? (
              <div className="tags-grid">
                {availableTags.map((tag) => (
                  <label key={tag._id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.tags.includes(tag.name)}
                      onChange={() => handleTagToggle(tag.name)}
                      disabled={loading}
                    />
                    <span>{tag.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="no-tags-message">
                Aucun tag disponible. Créez d'abord des tags dans la section "Ressources → Tags".
              </p>
            )}
            {formData.tags.length > 0 && (
              <div className="selected-tags-preview">
                <span className="preview-label">Tags sélectionnés :</span>
                {formData.tags.map((tag, idx) => (
                  <span key={idx} className="tag-preview">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Type */}
          <div className="form-group">
            <label htmlFor="type">Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="free">Gratuit</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          {/* Upload de fichier */}
          <div className="form-group">
            <label htmlFor="file">
              Fichier {!file && '*'}
              {file && ' (laisser vide pour conserver le fichier actuel)'}
            </label>
            <input
              id="file"
              type="file"
              onChange={handleFileSelect}
              disabled={loading || uploading}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp3,.mp4,.zip,.rar"
            />
            {selectedFile && (
              <p className="file-selected">
                Fichier sélectionné : {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
            {file && !selectedFile && (
              <p className="file-current">
                Fichier actuel : {file.fileName}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel" disabled={loading || uploading}>
              Annuler
            </button>
            <button type="submit" className="btn-submit" disabled={loading || uploading}>
              {uploading ? 'Upload en cours...' : loading ? 'Enregistrement...' : file ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
