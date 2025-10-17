import { useState } from 'react'
import { Formation, api } from '../lib/convex-client'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './EnrollmentModal.css'

interface EnrollmentModalProps {
  isOpen: boolean
  onClose: () => void
  formation: Formation
  onOpenLogin?: () => void
  onEnrollmentSuccess?: () => void
}

export default function EnrollmentModal({ isOpen, onClose, formation, onOpenLogin, onEnrollmentSuccess }: EnrollmentModalProps) {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleEnroll = async () => {
    // Vérifier si l'utilisateur est connecté
    if (!isAuthenticated || !user) {
      onClose()
      if (onOpenLogin) {
        onOpenLogin()
      } else {
        // Si pas de callback, rediriger vers la page d'accueil
        navigate('/')
      }
      return
    }

    if (formation.price > 0) {
      // Formation payante - rediriger vers la page de paiement
      navigate(`/payment/${formation._id}`)
    } else {
      // Formation gratuite - inscrire l'utilisateur et rester sur la page
      try {
        setEnrolling(true)
        setError('')
        
        await api.formations.enrollUser({
          userId: user.id,
          formationId: formation._id
        })
        
        // Fermer le modal
        onClose()
        
        // Notifier le parent pour recharger les données
        if (onEnrollmentSuccess) {
          onEnrollmentSuccess()
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors de l\'inscription')
      } finally {
        setEnrolling(false)
      }
    }
  }

  return (
    <div className="enrollment-modal-overlay" onClick={onClose}>
      <div className="enrollment-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="enrollment-modal-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="enrollment-modal-body">
          <div className="enrollment-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>

          <h2>S'inscrire à la formation</h2>
          <h3 className="formation-title">{formation.title}</h3>

          <div className="enrollment-info">
            <div className="info-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>{Math.floor(formation.duration / 60)}h{formation.duration % 60 > 0 ? ` ${formation.duration % 60}min` : ''} de contenu</span>
            </div>

            <div className="info-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>Par {formation.instructor}</span>
            </div>

            <div className="info-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
              <span>Niveau {formation.level === 'debutant' ? 'Débutant' : formation.level === 'intermediaire' ? 'Intermédiaire' : 'Avancé'}</span>
            </div>
          </div>

          {formation.price > 0 ? (
            <div className="enrollment-price-section">
              <div className="price-tag">
                <span className="price-amount">{formation.price} DH</span>
                <span className="price-label">Prix de la formation</span>
              </div>
              <p className="price-description">
                Vous serez redirigé vers la page de paiement pour finaliser votre inscription.
              </p>
            </div>
          ) : (
            <div className="enrollment-free-section">
              <div className="free-badge">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Formation Gratuite</span>
              </div>
              <p className="free-description">
                Cette formation est entièrement gratuite. Commencez dès maintenant !
              </p>
            </div>
          )}

          {!isAuthenticated && (
            <div className="login-notice">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>Vous devez être connecté pour vous inscrire à cette formation</span>
            </div>
          )}

          {error && (
            <div className="enrollment-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="enrollment-actions">
            <button 
              className="btn-enroll-primary" 
              onClick={handleEnroll}
              disabled={enrolling}
            >
              {enrolling ? (
                <>
                  <div className="spinner-small"></div>
                  Inscription en cours...
                </>
              ) : (
                !isAuthenticated ? 'Se connecter pour s\'inscrire' : formation.price > 0 ? 'Procéder au paiement' : 'Commencer la formation'
              )}
            </button>
            <button className="btn-enroll-secondary" onClick={onClose} disabled={enrolling}>
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
