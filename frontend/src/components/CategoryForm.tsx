import { useState } from 'react'
import { api, Category } from '../lib/convex-client'
import './CategoryForm.css'

interface CategoryFormProps {
  category: Category | null
  parentCategory: Category | null
  allCategories: Category[]
  onClose: () => void
  onSuccess: () => void
}

export default function CategoryForm({
  category,
  parentCategory,
  allCategories,
  onClose,
  onSuccess,
}: CategoryFormProps) {
  const [formData, setFormData] = useState({
    nameFr: category?.nameFr || '',
    nameAr: category?.nameAr || '',
    descriptionFr: category?.descriptionFr || '',
    descriptionAr: category?.descriptionAr || '',
    parentId: category?.parentId || parentCategory?._id || '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.nameFr || !formData.nameAr) {
        throw new Error('Les noms FR et AR sont requis')
      }

      const data = {
        nameFr: formData.nameFr,
        nameAr: formData.nameAr,
        descriptionFr: formData.descriptionFr || undefined,
        descriptionAr: formData.descriptionAr || undefined,
        parentId: formData.parentId || undefined,
      }

      if (category) {
        // Mise à jour
        await api.categories.update({
          categoryId: category._id,
          ...data,
        })
      } else {
        // Création
        await api.categories.create(data)
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour vérifier si une catégorie est un descendant
  const isDescendant = (cat: Category, ancestorId: string, cats: Category[]): boolean => {
    if (!cat.parentId) return false
    if (cat.parentId === ancestorId) return true
    const parent = cats.find(c => c._id === cat.parentId)
    if (!parent) return false
    return isDescendant(parent, ancestorId, cats)
  }

  // Filtrer les catégories pour éviter les boucles
  const availableParents = allCategories.filter(cat => {
    // Ne pas inclure la catégorie elle-même
    if (category && cat._id === category._id) return false
    
    // Ne pas inclure les descendants de la catégorie
    if (category && isDescendant(cat, category._id, allCategories)) return false
    
    return true
  })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content category-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {category ? 'Modifier la catégorie' : parentCategory ? 'Ajouter une sous-catégorie' : 'Ajouter une catégorie'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="category-form">
          {error && <div className="error-message">{error}</div>}

          {parentCategory && !category && (
            <div className="parent-info">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              </svg>
              <span>Sous-catégorie de : <strong>{parentCategory.nameFr}</strong></span>
            </div>
          )}

          {/* Noms */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nameFr">Nom (FR) *</label>
              <input
                id="nameFr"
                name="nameFr"
                type="text"
                value={formData.nameFr}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Ex: Communication"
              />
            </div>

            <div className="form-group">
              <label htmlFor="nameAr">Nom (AR) *</label>
              <input
                id="nameAr"
                name="nameAr"
                type="text"
                value={formData.nameAr}
                onChange={handleChange}
                required
                disabled={loading}
                dir="rtl"
                placeholder="مثال: التواصل"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="descriptionFr">Description (FR)</label>
              <textarea
                id="descriptionFr"
                name="descriptionFr"
                value={formData.descriptionFr}
                onChange={handleChange}
                disabled={loading}
                rows={3}
                placeholder="Description optionnelle..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="descriptionAr">Description (AR)</label>
              <textarea
                id="descriptionAr"
                name="descriptionAr"
                value={formData.descriptionAr}
                onChange={handleChange}
                disabled={loading}
                rows={3}
                dir="rtl"
                placeholder="وصف اختياري..."
              />
            </div>
          </div>

          {/* Catégorie parente */}
          {!parentCategory && (
            <div className="form-group">
              <label htmlFor="parentId">Catégorie parente</label>
              <select
                id="parentId"
                name="parentId"
                value={formData.parentId}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Aucune (catégorie racine)</option>
                {availableParents.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.nameFr}
                  </option>
                ))}
              </select>
              <small className="input-hint">
                Laissez vide pour créer une catégorie racine
              </small>
            </div>
          )}

          {/* Actions */}
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel" disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Enregistrement...' : category ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
