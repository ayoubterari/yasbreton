import { useState } from 'react'
import { insertABLLSTasks } from '../scripts/insert-ablls-tasks'
import { useAuth } from '../contexts/AuthContext'

export default function ImportABLLSTasksButton() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { user } = useAuth()

  const handleImport = async () => {
    if (!user?.id) {
      alert('❌ Vous devez être connecté pour insérer des tâches')
      return
    }

    if (!confirm('Voulez-vous vraiment insérer toutes les tâches ABLLS-R ? Cette opération peut prendre quelques minutes.')) {
      return
    }

    setLoading(true)
    setSuccess(false)

    try {
      const result = await insertABLLSTasks(user.id)
      setSuccess(true)
      alert(`✅ ${result.tasksCreated} tâches ABLLS-R ont été créées avec succès !`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      alert(`❌ Erreur lors de l'insertion : ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleImport}
      disabled={loading}
      className="btn-primary"
      style={{
        opacity: loading ? 0.6 : 1,
        cursor: loading ? 'wait' : 'pointer',
        background: success ? '#10B981' : undefined
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
      {loading ? 'Insertion en cours...' : success ? 'Tâches insérées ✓' : 'Insérer tâches ABLLS-R'}
    </button>
  )
}
