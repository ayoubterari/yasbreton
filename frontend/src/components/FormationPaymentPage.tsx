import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, Formation } from '../lib/convex-client'
import { useAuth } from '../contexts/AuthContext'
import './FormationPaymentPage.css'

export default function FormationPaymentPage() {
  const { formationId } = useParams<{ formationId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [formation, setFormation] = useState<Formation | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  
  // Informations de paiement
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/formations')
      return
    }
    
    if (formationId) {
      loadFormation()
    }
  }, [formationId, user])

  const loadFormation = async () => {
    try {
      setLoading(true)
      const formationData = await api.formations.getFormationById(formationId!)
      
      if (!formationData || !formationData.published) {
        navigate('/formations')
        return
      }

      // Si la formation est gratuite, rediriger vers le dashboard
      if (formationData.price === 0) {
        navigate(`/dashboard/formation/${formationId}`)
        return
      }

      setFormation(formationData)
    } catch (error) {
      console.error('Erreur:', error)
      navigate('/formations')
    } finally {
      setLoading(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '')
    const groups = cleaned.match(/.{1,4}/g)
    return groups ? groups.join(' ') : cleaned
  }

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4)
    }
    return cleaned
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '')
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setCardNumber(formatCardNumber(value))
    }
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 4) {
      setExpiryDate(formatExpiryDate(value))
    }
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= 3 && /^\d*$/.test(value)) {
      setCvv(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Numéro de carte invalide')
      return
    }

    if (!cardName.trim()) {
      setError('Nom du titulaire requis')
      return
    }

    if (expiryDate.length !== 5) {
      setError('Date d\'expiration invalide')
      return
    }

    if (cvv.length !== 3) {
      setError('CVV invalide')
      return
    }

    try {
      setProcessing(true)

      // Simulation de traitement de paiement (2 secondes)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // MODE TEST : Accepte n'importe quelle carte
      // En production, vous intégreriez ici un système de paiement réel
      
      // Enregistrer l'inscription de l'utilisateur à la formation
      await api.formations.enrollUser({ 
        userId: user!.id, 
        formationId: formationId! 
      })

      // Rediriger vers la page de formation (pas le dashboard)
      navigate(`/formations/${formationId}`, { 
        state: { message: 'Paiement réussi ! Vous êtes maintenant inscrit à la formation.' }
      })
    } catch (err: any) {
      setError(err.message || 'Erreur lors du paiement')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="payment-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  if (!formation) {
    return null
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <button className="btn-back-payment" onClick={() => navigate(`/formations/${formationId}`)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Retour
        </button>

        <div className="payment-content">
          {/* Résumé de la commande */}
          <div className="order-summary">
            <h2>Résumé de la commande</h2>
            
            <div className="formation-summary">
              {formation.thumbnail && (
                <img src={formation.thumbnail} alt={formation.title} className="formation-thumb" />
              )}
              <div className="formation-info">
                <h3>{formation.title}</h3>
                <p className="formation-instructor">Par {formation.instructor}</p>
                <div className="formation-meta">
                  <span className="meta-badge">{formation.category}</span>
                  <span className="meta-badge">{formation.level === 'debutant' ? 'Débutant' : formation.level === 'intermediaire' ? 'Intermédiaire' : 'Avancé'}</span>
                </div>
              </div>
            </div>

            <div className="price-breakdown">
              <div className="price-row">
                <span>Prix de la formation</span>
                <span className="price">{formation.price} DH</span>
              </div>
              <div className="price-row total">
                <span>Total</span>
                <span className="price-total">{formation.price} DH</span>
              </div>
            </div>

            <div className="guarantee-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>Garantie satisfait ou remboursé 30 jours</span>
            </div>
          </div>

          {/* Formulaire de paiement */}
          <div className="payment-form-section">
            <h2>Informations de paiement</h2>

            <div className="test-mode-banner">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>Mode Test : Toutes les cartes sont acceptées</span>
            </div>

            <form onSubmit={handleSubmit} className="payment-form">
              <div className="form-group">
                <label htmlFor="cardNumber">Numéro de carte</label>
                <div className="card-input-wrapper">
                  <input
                    id="cardNumber"
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    required
                    disabled={processing}
                  />
                  <div className="card-icons">
                    <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
                      <rect width="32" height="20" rx="3" fill="#1434CB"/>
                      <circle cx="12" cy="10" r="6" fill="#EB001B"/>
                      <circle cx="20" cy="10" r="6" fill="#F79E1B"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="cardName">Nom du titulaire</label>
                <input
                  id="cardName"
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="JEAN DUPONT"
                  required
                  disabled={processing}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expiryDate">Date d'expiration</label>
                  <input
                    id="expiryDate"
                    type="text"
                    value={expiryDate}
                    onChange={handleExpiryChange}
                    placeholder="MM/AA"
                    required
                    disabled={processing}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cvv">CVV</label>
                  <input
                    id="cvv"
                    type="text"
                    value={cvv}
                    onChange={handleCvvChange}
                    placeholder="123"
                    required
                    disabled={processing}
                  />
                </div>
              </div>

              {error && <div className="payment-error">{error}</div>}

              <button
                type="submit"
                className="btn-pay-formation"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <div className="spinner-small"></div>
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    Payer {formation.price} DH
                  </>
                )}
              </button>
            </form>

            <div className="payment-security">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <span>Paiement 100% sécurisé</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
