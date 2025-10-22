import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { insertDomainsAndSubdomains, getDomainsDataSummary } from '../scripts/insert-domains';
import './ImportDomainsButton.css';

export default function ImportDomainsButton() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<any>(null);

  const summary = getDomainsDataSummary();

  const handleImport = async () => {
    if (!user) {
      alert('Vous devez être connecté pour importer les domaines');
      return;
    }

    setLoading(true);
    setShowConfirm(false);

    try {
      const results = await insertDomainsAndSubdomains();
      setResult(results);
      
      if (results.errors.length === 0) {
        alert(`✅ Import réussi!\n\n${results.domains.length} domaines et ${results.subdomains.length} sous-domaines créés.`);
      } else {
        alert(`⚠️ Import terminé avec des erreurs!\n\n${results.domains.length} domaines et ${results.subdomains.length} sous-domaines créés.\n${results.errors.length} erreurs rencontrées.`);
      }
    } catch (error: any) {
      alert(`❌ Erreur lors de l'import: ${error.message}`);
      console.error('Erreur d\'import:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="import-domains-container">
      <button
        className="btn-import-domains"
        onClick={() => setShowConfirm(true)}
        disabled={true}
        style={{ opacity: 0.5, cursor: 'not-allowed' }}
        title="Import déjà effectué"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        {loading ? 'Import en cours...' : 'Importer les domaines VB-MAPP'}
      </button>

      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-content-import" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-import">
              <h2>Confirmer l'importation</h2>
              <button className="btn-close-modal" onClick={() => setShowConfirm(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="modal-body-import">
              <div className="import-summary">
                <h3>📊 Données à importer :</h3>
                <div className="summary-stats">
                  <div className="stat-item">
                    <span className="stat-number">{summary.totalDomains}</span>
                    <span className="stat-label">Domaines</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{summary.totalSubdomains}</span>
                    <span className="stat-label">Sous-domaines</span>
                  </div>
                </div>

                <div className="domains-list">
                  {summary.domains.map((domain, index) => (
                    <div key={index} className="domain-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                      </svg>
                      <span className="domain-name">{domain.name}</span>
                      <span className="subdomain-count">{domain.subdomainsCount} sous-domaines</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="warning-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <p>Cette action va créer tous les domaines et sous-domaines dans la base de données. Assurez-vous qu'ils n'existent pas déjà.</p>
              </div>
            </div>

            <div className="modal-actions-import">
              <button className="btn-cancel" onClick={() => setShowConfirm(false)}>
                Annuler
              </button>
              <button className="btn-confirm-import" onClick={handleImport}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 11 12 14 22 4"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
                Confirmer l'import
              </button>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="import-result">
          <h4>Résultat de l'import :</h4>
          <p>✅ {result.domains.length} domaines créés</p>
          <p>✅ {result.subdomains.length} sous-domaines créés</p>
          {result.errors.length > 0 && (
            <div className="errors-list">
              <p>❌ {result.errors.length} erreurs :</p>
              <ul>
                {result.errors.map((error: string, index: number) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
