import { useState, useEffect } from 'react'
import { api, Category } from '../lib/convex-client'
import CategoryForm from './CategoryForm.tsx'
import CategoryTree from './CategoryTree.tsx'
import './CategoriesManagement.css'

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [parentCategory, setParentCategory] = useState<Category | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await api.categories.getAll()
      setCategories(data)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleAddRoot = () => {
    setEditingCategory(null)
    setParentCategory(null)
    setShowForm(true)
  }

  const handleAddChild = (parent: Category) => {
    setEditingCategory(null)
    setParentCategory(parent)
    setShowForm(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setParentCategory(null)
    setShowForm(true)
  }

  const handleDelete = async (category: Category, deleteChildren: boolean) => {
    try {
      await api.categories.delete(category._id, deleteChildren)
      setSuccess('Catégorie supprimée avec succès')
      setTimeout(() => setSuccess(''), 3000)
      await loadCategories()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleReorder = async (categoryId: string, newOrder: number, parentId?: string) => {
    try {
      await api.categories.reorder(categoryId, newOrder, parentId)
      await loadCategories()
    } catch (err: any) {
      setError(err.message || 'Erreur lors du réordonnancement')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingCategory(null)
    setParentCategory(null)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingCategory(null)
    setParentCategory(null)
    setSuccess(editingCategory ? 'Catégorie modifiée avec succès' : 'Catégorie créée avec succès')
    setTimeout(() => setSuccess(''), 3000)
    loadCategories()
  }

  // Construire l'arbre hiérarchique
  const buildTree = (parentId?: string): Category[] => {
    return categories
      .filter(cat => cat.parentId === parentId)
      .sort((a, b) => a.order - b.order)
  }

  const rootCategories = buildTree(undefined)

  return (
    <div className="categories-management">
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="categories-header">
        <div className="header-left">
          <h2>Gestion des catégories</h2>
          <p className="section-description">
            Organisez vos catégories de manière hiérarchique
          </p>
        </div>
        <button onClick={handleAddRoot} className="btn-add-category">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ajouter une catégorie racine
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Chargement des catégories...</div>
      ) : (
        <div className="categories-tree-container">
          {rootCategories.length > 0 ? (
            <CategoryTree
              categories={rootCategories}
              allCategories={categories}
              onAddChild={handleAddChild}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReorder={handleReorder}
              buildTree={buildTree}
            />
          ) : (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              </svg>
              <p>Aucune catégorie. Commencez par créer une catégorie racine.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal de formulaire */}
      {showForm && (
        <CategoryForm
          category={editingCategory}
          parentCategory={parentCategory}
          allCategories={categories}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}
