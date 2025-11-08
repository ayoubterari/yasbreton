import { useState, useEffect } from 'react'
import { api, Formation } from '../lib/convex-client'
import './FormationStatsModal.css'

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

interface FormationStatsModalProps {
  isOpen: boolean
  onClose: () => void
  formation: Formation
}

export default function FormationStatsModal({ isOpen, onClose, formation }: FormationStatsModalProps) {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (isOpen && formation) {
      loadStats()
    }
  }, [isOpen, formation])

  const loadStats = async () => {
    try {
      setLoading(true)
      const statsData = await api.formations.getFormationEnrollmentStats(formation._id)
      setStats(statsData)
    } catch (error) {
      console.error('Erreur:', error)
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

  if (!isOpen) return null

  return (
    <div className="stats-modal-overlay">
      <div className="stats-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="stats-modal-header">
          <div>
            <h2>Statistiques d'inscription</h2>
            <p className="formation-title">{formation.title}</p>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="stats-modal-body">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Chargement des statistiques...</p>
            </div>
          ) : stats ? (
            <>
              {/* Statistiques globales */}
              <div className="stats-cards-modal">
                <div className="stat-card-modal">
                  <div className="stat-icon-modal total">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <div className="stat-content-modal">
                    <h3>Total</h3>
                    <p className="stat-number-modal">{stats.totalEnrollments}</p>
                  </div>
                </div>

                <div className="stat-card-modal">
                  <div className="stat-icon-modal free">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div className="stat-content-modal">
                    <h3>Gratuit</h3>
                    <p className="stat-number-modal">{stats.freeEnrollments}</p>
                  </div>
                </div>

                <div className="stat-card-modal">
                  <div className="stat-icon-modal paid">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                  </div>
                  <div className="stat-content-modal">
                    <h3>Payant</h3>
                    <p className="stat-number-modal">{stats.paidEnrollments}</p>
                  </div>
                </div>
              </div>

              {/* Liste des inscrits */}
              <div className="enrollments-section-modal">
                <div className="section-header-modal">
                  <h3>Liste des inscrits ({filteredEnrollments.length})</h3>
                  <div className="search-box-modal">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {filteredEnrollments.length === 0 ? (
                  <div className="empty-state-modal">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                    </svg>
                    <p>{searchTerm ? 'Aucun résultat trouvé' : 'Aucune inscription'}</p>
                  </div>
                ) : (
                  <div className="enrollments-list-modal">
                    {filteredEnrollments.map((enrollment) => (
                      <div key={enrollment.enrollmentId} className="enrollment-item-modal">
                        <div className="user-info-modal">
                          <div className="user-avatar-modal">
                            {enrollment.user?.prenom?.[0]}{enrollment.user?.nom?.[0]}
                          </div>
                          <div className="user-details-modal">
                            <span className="user-name-modal">
                              {enrollment.user?.prenom} {enrollment.user?.nom}
                            </span>
                            <span className="user-email-modal">{enrollment.user?.email}</span>
                          </div>
                        </div>
                        <div className="enrollment-meta-modal">
                          <span className="enrollment-date-modal">{formatDate(enrollment.enrolledAt)}</span>
                          <div className="enrollment-badges-modal">
                            <span className={`badge-modal ${enrollment.paymentStatus}`}>
                              {enrollment.paymentStatus === 'free' ? 'Gratuit' : 'Payant'}
                            </span>
                            {enrollment.user?.isPremium && (
                              <span className="badge-modal premium">Premium</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="error-state">
              <p>Erreur lors du chargement des statistiques</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
