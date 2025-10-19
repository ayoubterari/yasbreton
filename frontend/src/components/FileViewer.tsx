import { useState } from 'react'
import './FileViewer.css'

interface FileViewerProps {
  fileUrl: string
  fileName: string
  fileType: string
  onClose: () => void
}

export default function FileViewer({ fileUrl, fileName, fileType, onClose }: FileViewerProps) {
  const [loading, setLoading] = useState(true)

  const handleLoad = () => {
    setLoading(false)
  }

  const handleError = () => {
    setLoading(false)
  }

  const renderContent = () => {
    // Images
    if (fileType.startsWith('image/')) {
      return (
        <div className="viewer-image-container">
          <img
            src={fileUrl}
            alt={fileName}
            onLoad={handleLoad}
            onError={handleError}
            className="viewer-image"
          />
        </div>
      )
    }

    // PDF
    if (fileType === 'application/pdf') {
      return (
        <iframe
          src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
          title={fileName}
          onLoad={handleLoad}
          className="viewer-iframe"
        />
      )
    }

    // Vidéos
    if (fileType.startsWith('video/')) {
      return (
        <div className="viewer-video-container">
          <video
            src={fileUrl}
            controls
            onLoadedData={handleLoad}
            onError={handleError}
            className="viewer-video"
          >
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
        </div>
      )
    }

    // Audio
    if (fileType.startsWith('audio/')) {
      return (
        <div className="viewer-audio-container">
          <audio
            src={fileUrl}
            controls
            onLoadedData={handleLoad}
            onError={handleError}
            className="viewer-audio"
          >
            Votre navigateur ne supporte pas la lecture audio.
          </audio>
          <div className="audio-info">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            <p>{fileName}</p>
          </div>
        </div>
      )
    }

    // Documents Office (Word, Excel, PowerPoint)
    if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword' ||
      fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      fileType === 'application/vnd.ms-excel' ||
      fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      fileType === 'application/vnd.ms-powerpoint'
    ) {
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
          title={fileName}
          onLoad={handleLoad}
          className="viewer-iframe"
        />
      )
    }

    // Texte brut
    if (fileType.startsWith('text/')) {
      return (
        <iframe
          src={fileUrl}
          title={fileName}
          onLoad={handleLoad}
          className="viewer-iframe"
        />
      )
    }

    // Type non supporté
    return (
      <div className="viewer-unsupported">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
          <polyline points="13 2 13 9 20 9" />
        </svg>
        <h3>Prévisualisation non disponible</h3>
        <p>Ce type de fichier ne peut pas être prévisualisé dans le navigateur.</p>
        <p className="file-type-info">Type : {fileType}</p>
      </div>
    )
  }

  return (
    <div className="file-viewer-overlay" onClick={onClose}>
      <div className="file-viewer-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="viewer-header">
          <div className="viewer-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
              <polyline points="13 2 13 9 20 9" />
            </svg>
            <span>{fileName}</span>
          </div>
          <div className="viewer-actions">
            <button onClick={onClose} className="btn-viewer-close" title="Fermer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="viewer-content">
          {loading && (
            <div className="viewer-loading">
              <div className="loader"></div>
              <p>Chargement du fichier...</p>
            </div>
          )}
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
