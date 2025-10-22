import { useState } from 'react';
import { api } from '../lib/convex-client';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

interface RegisterProps {
  onSwitchToLogin: () => void;
  onClose?: () => void;
}

export default function Register({ onSwitchToLogin, onClose }: RegisterProps) {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    telephone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.nom || !formData.prenom || !formData.email || !formData.password || !formData.telephone) {
      setError('Tous les champs sont obligatoires');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email invalide');
      return false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.telephone.replace(/\s/g, ''))) {
      setError('Numéro de téléphone invalide (10 chiffres)');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const user = await api.auth.register({
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        password: formData.password,
        telephone: formData.telephone,
      });
      
      // Connecter automatiquement après l'inscription
      login(user);
      // Fermer le modal après une inscription réussie
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-content">
      <h1>Inscription</h1>
      <p className="auth-subtitle">Créez votre compte Centre Yasbreton</p>

      <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nom">Nom</label>
              <input
                id="nom"
                name="nom"
                type="text"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Nom"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="prenom">Prénom</label>
              <input
                id="prenom"
                name="prenom"
                type="text"
                value={formData.prenom}
                onChange={handleChange}
                placeholder="Prénom"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="telephone">Numéro de téléphone</label>
            <input
              id="telephone"
              name="telephone"
              type="tel"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="0612345678"
              required
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Déjà un compte ?{' '}
            <button onClick={onSwitchToLogin} className="link-button">
              Se connecter
            </button>
          </p>
        </div>
    </div>
  );
}
