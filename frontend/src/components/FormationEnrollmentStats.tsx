import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, Formation } from '../lib/convex-client'
import './FormationEnrollmentStats.css'

interface EnrollmentData {
  enrollmentId: string
  enrolledAt: number
  paymentStatus?: 'free' | 'paid'
  user: {
    id: string
    nom: string
    prenom: string
    email: string
    isPremium?: boolean
  } | null
}

interface StatsData {
  totalEnrollments: number
  freeEnrollments: number
  paidEnrollments: number
  enrollments: EnrollmentData[]
}

export default function FormationEnrollmentStats() {
  const { formationId } = useParams<{ formationId: string }>()
  const navigate = useNavigate()
  const [formation, setFormation] = useState<Formation | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (formationId) {
      loadData()
    }
  }, [formationId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [formationData, statsData] = await Promise.all([
        api.formations.getFormationById(formationId!),
        api.formations.getFormationEnrollmentStats(formationId!)
      ])
      
      setFormation(formationData)
      setStats(statsData)
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors du chargement des statistiques')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredEnrollments = stats?.enrollments.filter(enrollment => {
    if (!enrollment.user) return false
    const searchLower = searchTerm.toLowerCase()
    return (
      enrollment.user.nom.toLowerCase().includes(searchLower) ||
      enrollment.user.prenom.toLowerCase().includes(searchLower) ||
      enrollment.user.email.toLowerCase().includes(searchLower)
    )
  }) || []

  if (loading) {
    return (
      <div className="enrollment-stats-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  if (!formation || !stats) {
    return null
  }

  return (
    <div className="enrollment-stats-page">
      {/* Header */}
      <div className="stats-header">
        <button className="btn-back" onClick={() => navigate('/admin/formations')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Retour aux formations
        </button>
        <div className="header-info">
          <h1>Statistiques d'inscription</h1>
          <h2>{formation.title}</h2>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon total">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Total des inscriptions</h3>
            <p className="stat-number">{stats.totalEnrollments}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon free">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Inscriptions gratuites</h3>
            <p className="stat-number">{stats.freeEnrollments}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon paid">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Inscriptions payantes</h3>
            <p className="stat-number">{stats.paidEnrollments}</p>
          </div>
        </div>
      </div>

      {/* Liste des inscrits */}
      <div className="enrollments-section">
        <div className="section-header">
          <h3>Liste des inscrits ({filteredEnrollments.length})</h3>
          <div className="search-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredEnrollments.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <p>{searchTerm ? 'Aucun résultat trouvé' : 'Aucune inscription pour le moment'}</p>
          </div>
        ) : (
          <div className="enrollments-table">
            <table>
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Date d'inscription</th>
                  <th>Type</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.enrollmentId}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {enrollment.user?.prenom?.[0]}{enrollment.user?.nom?.[0]}
                        </div>
                        <span className="user-name">
                          {enrollment.user?.prenom} {enrollment.user?.nom}
                        </span>
                      </div>
                    </td>
                    <td>{enrollment.user?.email}</td>
                    <td>{formatDate(enrollment.enrolledAt)}</td>
                    <td>
                      <span className={`badge ${enrollment.paymentStatus}`}>
                        {enrollment.paymentStatus === 'free' ? 'Gratuit' : 'Payant'}
                      </span>
                    </td>
                    <td>
                      {enrollment.user?.isPremium ? (
                        <span className="badge premium">Premium</span>
                      ) : (
                        <span className="badge standard">Standard</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
