import { useState } from 'react'
import { Category } from '../lib/convex-client'
import './CategoryTree.css'

interface CategoryTreeProps {
  categories: Category[]
  allCategories: Category[]
  onAddChild: (parent: Category) => void
  onEdit: (category: Category) => void
  onDelete: (category: Category, deleteChildren: boolean) => void
  onReorder: (categoryId: string, newOrder: number, parentId?: string) => void
  buildTree: (parentId?: string) => Category[]
  level?: number
}

export default function CategoryTree({
  categories,
  allCategories,
  onAddChild,
  onEdit,
  onDelete,
  onReorder,
  buildTree,
  level = 0,
}: CategoryTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIds(newExpanded)
  }

  const handleDragStart = (e: React.DragEvent, category: Category) => {
    setDraggedId(category._id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML)
  }

  const handleDragOver = (e: React.DragEvent, category: Category) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverId(category._id)
  }

  const handleDragLeave = () => {
    setDragOverId(null)
  }

  const handleDrop = (e: React.DragEvent, targetCategory: Category) => {
    e.preventDefault()
    e.stopPropagation()

    if (!draggedId || draggedId === targetCategory._id) {
      setDraggedId(null)
      setDragOverId(null)
      return
    }

    const draggedCategory = allCategories.find(c => c._id === draggedId)
    if (!draggedCategory) return

    // Vérifier qu'on ne déplace pas une catégorie dans un de ses descendants
    if (isDescendant(targetCategory._id, draggedId, allCategories)) {
      alert('Impossible de déplacer une catégorie dans un de ses descendants')
      setDraggedId(null)
      setDragOverId(null)
      return
    }

    // Trouver la nouvelle position
    const siblings = categories.filter(c => c._id !== draggedId)
    const targetIndex = siblings.findIndex(c => c._id === targetCategory._id)

    onReorder(draggedId, targetIndex, targetCategory.parentId)

    setDraggedId(null)
    setDragOverId(null)
  }

  const handleDeleteClick = (category: Category) => {
    const children = buildTree(category._id)
    
    if (children.length > 0) {
      const choice = window.confirm(
        `Cette catégorie contient ${children.length} sous-catégorie(s).\n\n` +
        `Cliquez sur "OK" pour supprimer la catégorie ET toutes ses sous-catégories.\n` +
        `Cliquez sur "Annuler" pour déplacer les sous-catégories vers le parent.`
      )
      
      if (choice === null) return // Annulé
      
      onDelete(category, choice) // true = cascade, false = déplacer
    } else {
      if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
        onDelete(category, true)
      }
    }
  }

  const isDescendant = (ancestorId: string, categoryId: string, cats: Category[]): boolean => {
    const category = cats.find(c => c._id === categoryId)
    if (!category || !category.parentId) return false
    if (category.parentId === ancestorId) return true
    return isDescendant(ancestorId, category.parentId, cats)
  }

  return (
    <div className={`category-tree level-${level}`}>
      {categories.map((category) => {
        const children = buildTree(category._id)
        const hasChildren = children.length > 0
        const isExpanded = expandedIds.has(category._id)
        const isDragging = draggedId === category._id
        const isDragOver = dragOverId === category._id

        return (
          <div key={category._id} className="category-item-wrapper">
            <div
              className={`category-item ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, category)}
              onDragOver={(e) => handleDragOver(e, category)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, category)}
            >
              <div className="category-left">
                <div className="drag-handle">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </div>

                {hasChildren && (
                  <button
                    className="expand-btn"
                    onClick={() => toggleExpand(category._id)}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                )}

                <div className="category-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                  </svg>
                </div>

                <div className="category-info">
                  <div className="category-name">{category.nameFr}</div>
                  <div className="category-name-ar">{category.nameAr}</div>
                </div>
              </div>

              <div className="category-actions">
                <button
                  onClick={() => onAddChild(category)}
                  className="btn-action btn-add"
                  title="Ajouter une sous-catégorie"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <button
                  onClick={() => onEdit(category)}
                  className="btn-action btn-edit"
                  title="Modifier"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteClick(category)}
                  className="btn-action btn-delete"
                  title="Supprimer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </div>
            </div>

            {hasChildren && isExpanded && (
              <div className="category-children">
                <CategoryTree
                  categories={children}
                  allCategories={allCategories}
                  onAddChild={onAddChild}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReorder={onReorder}
                  buildTree={buildTree}
                  level={level + 1}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
