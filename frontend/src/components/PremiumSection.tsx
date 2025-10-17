import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PaymentModal from './PaymentModal.tsx'
import './PremiumSection.css'

interface PremiumSectionProps {
  user: {
    id: string
    isPremium?: boolean
    premiumExpiresAt?: number
    subscriptionType?: 'monthly' | 'quarterly' | 'yearly'
  }
  onUpgradeSuccess?: () => void
}

export default function PremiumSection({ user }: PremiumSectionProps) {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [selectedPackage, setSelectedPackage] = useState<'monthly' | 'quarterly' | 'yearly' | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const packages = [
    {
      id: 'monthly' as const,
      name: 'Mensuel',
      price: 29.99,
      duration: '1 mois',
      features: [
        'Accès illimité aux ressources premium',
        'Téléchargement sans limite',
        'Support prioritaire',
        'Nouvelles ressources en avant-première',
      ],
      badge: null,
    },
    {
      id: 'quarterly' as const,
      name: 'Trimestriel',
      price: 79.99,
      duration: '3 mois',
      features: [
        'Accès illimité aux ressources premium',
        'Téléchargement sans limite',
        'Support prioritaire',
        'Nouvelles ressources en avant-première',
        'Économisez 11%',
      ],
      badge: 'Populaire',
    },
    {
      id: 'yearly' as const,
      name: 'Annuel',
      price: 299.99,
      duration: '12 mois',
      features: [
        'Accès illimité aux ressources premium',
        'Téléchargement sans limite',
        'Support prioritaire',
        'Nouvelles ressources en avant-première',
        'Économisez 17%',
        'Bonus : Accès anticipé aux formations',
      ],
      badge: 'Meilleure offre',
    },
  ]

  const handleSelectPackage = (packageId: 'monthly' | 'quarterly' | 'yearly') => {
    setSelectedPackage(packageId)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false)
    setSelectedPackage(null)
    // Rafraîchir les données utilisateur pour mettre à jour le statut premium
    await refreshUser()
    // Rediriger vers la page ressources après l'achat
    navigate('/resources')
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (user.isPremium) {
    return (
      <div className="premium-section">
        <div className="premium-active-banner">
          <div className="premium-active-content">
            <div className="premium-active-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="premium-active-info">
              <h2>Vous êtes Premium ! 🎉</h2>
              <p>Profitez de tous les avantages de votre abonnement {user.subscriptionType === 'monthly' ? 'mensuel' : user.subscriptionType === 'quarterly' ? 'trimestriel' : 'annuel'}.</p>
              {user.premiumExpiresAt && (
                <p className="premium-expires">
                  Votre abonnement expire le <strong>{formatDate(user.premiumExpiresAt)}</strong>
                </p>
              )}
            </div>
          </div>
          <div className="premium-features-list">
            <h3>Vos avantages Premium :</h3>
            <ul>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Accès illimité aux ressources premium
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Téléchargement sans limite
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Support prioritaire
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Nouvelles ressources en avant-première
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="premium-section">
      <div className="premium-header">
        <h2>Passez au Premium</h2>
        <p>Débloquez l'accès complet à toutes nos ressources et fonctionnalités exclusives</p>
      </div>

      <div className="packages-grid">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`package-card ${selectedPackage === pkg.id ? 'selected' : ''}`}
          >
            {pkg.badge && <div className="package-badge">{pkg.badge}</div>}
            
            <div className="package-header">
              <h3>{pkg.name}</h3>
              <div className="package-price">
                <span className="price-amount">{pkg.price}€</span>
                <span className="price-duration">/ {pkg.duration}</span>
              </div>
            </div>

            <ul className="package-features">
              {pkg.features.map((feature, idx) => (
                <li key={idx}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelectPackage(pkg.id)}
              className="btn-select-package"
            >
              Choisir ce forfait
            </button>
          </div>
        ))}
      </div>

      {showPaymentModal && selectedPackage && (
        <PaymentModal
          packageType={selectedPackage}
          price={packages.find(p => p.id === selectedPackage)!.price}
          userId={user.id}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedPackage(null)
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}
