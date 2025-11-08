import { useState } from 'react'
import { api } from '../lib/convex-client'
import './PaymentModal.css'

interface PaymentModalProps {
  packageType: 'monthly' | 'quarterly' | 'yearly'
  price: number
  userId: string
  onClose: () => void
  onSuccess: () => void
}

export default function PaymentModal({ packageType, price, userId, onClose, onSuccess }: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const packageNames = {
    monthly: 'Mensuel',
    quarterly: 'Trimestriel',
    yearly: 'Annuel',
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

    // Validation basique
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
      // En production, vous intégreriez ici Stripe, PayPal, etc.
      
      // Activer le premium côté backend
      await api.premium.upgradeToPremium({
        userId,
        subscriptionType: packageType,
      })

      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Erreur lors du paiement')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h2>Paiement sécurisé</h2>
          <button onClick={onClose} className="btn-close-payment">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="payment-summary">
          <div className="summary-item">
            <span>Forfait :</span>
            <strong>{packageNames[packageType]}</strong>
          </div>
          <div className="summary-item summary-total">
            <span>Total :</span>
            <strong className="total-price">{price}€</strong>
          </div>
        </div>

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
            className="btn-pay"
            disabled={processing}
          >
            {processing ? (
              <>
                <div className="spinner"></div>
                Traitement en cours...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                Payer {price}€
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
  )
}
