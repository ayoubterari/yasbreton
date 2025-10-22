import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Modal from './components/Modal.tsx'
import Login from './components/Login.tsx'
import Register from './components/Register.tsx'
import PublicHome from './components/PublicHome.tsx'
import Home from './components/Home.tsx'
import UserDashboard from './components/UserDashboard.tsx'
import AdminDashboard from './components/AdminDashboard.tsx'
import RestrictedDashboard from './components/RestrictedDashboard.tsx'
import ResourcesPage from './components/ResourcesPage.tsx'
import TaskDetailPage from './components/TaskDetailPage'
import DomainsPage from './components/DomainsPage'
import PublicTasksPage from './components/PublicTasksPage'
import FormationEditor from './components/FormationEditor'
import PublicFormationsPage from './components/PublicFormationsPage'
import FormationDetailPage from './components/FormationDetailPage'
import FormationPaymentPage from './components/FormationPaymentPage'
import './App.css'

function App() {
  const { isAuthenticated, user } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  const openLogin = () => {
    setShowRegisterModal(false)
    setShowLoginModal(true)
  }

  const openRegister = () => {
    setShowLoginModal(false)
    setShowRegisterModal(true)
  }

  const closeModals = () => {
    setShowLoginModal(false)
    setShowRegisterModal(false)
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={
          isAuthenticated ? (
            <Home />
          ) : (
            <PublicHome onOpenLogin={openLogin} onOpenRegister={openRegister} />
          )
        } />

        {/* Route ressources (accessible à tous) */}
        <Route path="/resources" element={
          <ResourcesPage onOpenLogin={isAuthenticated ? undefined : openLogin} />
        } />

        {/* Route tâches (accessible à tous) */}
        <Route path="/tasks" element={<PublicTasksPage />} />
        <Route path="/tasks/:taskId" element={<TaskDetailPage />} />

        {/* Route formations (accessible à tous) */}
        <Route path="/formations" element={<PublicFormationsPage />} />
        <Route path="/formations/:formationId" element={<FormationDetailPage />} />
        <Route path="/payment/:formationId" element={
          isAuthenticated ? <FormationPaymentPage /> : <Navigate to="/" />
        } />

        {/* Route domaines (accessible à tous) */}
        <Route path="/domains" element={<DomainsPage />} />

        {/* Routes utilisateur */}
        <Route path="/dashboard" element={
          isAuthenticated ? <UserDashboard /> : <Navigate to="/" />
        } />

        {/* Routes admin */}
        <Route path="/admin" element={
          isAuthenticated && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />
        } />
        <Route path="/admin/users" element={
          isAuthenticated && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />
        } />
        <Route path="/admin/files" element={
          isAuthenticated && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />
        } />
        <Route path="/admin/categories" element={
          isAuthenticated && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />
        } />
        <Route path="/admin/tags" element={
          isAuthenticated && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />
        } />
        <Route path="/admin/statistics" element={
          isAuthenticated && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />
        } />
        <Route path="/admin/domains" element={
          isAuthenticated && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />
        } />
        <Route path="/admin/tasks" element={
          isAuthenticated && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />
        } />
        <Route path="/admin/formations" element={
          isAuthenticated && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />
        } />
        <Route path="/admin/formations/:formationId/edit" element={
          isAuthenticated && user?.role === 'admin' ? <FormationEditor /> : <Navigate to="/" />
        } />

        {/* Routes utilisateur restreint */}
        <Route path="/restricted" element={
          isAuthenticated && user?.role === 'restricted' ? <RestrictedDashboard /> : <Navigate to="/" />
        } />
        <Route path="/restricted/users" element={
          isAuthenticated && user?.role === 'restricted' ? <RestrictedDashboard /> : <Navigate to="/" />
        } />
        <Route path="/restricted/files" element={
          isAuthenticated && user?.role === 'restricted' ? <RestrictedDashboard /> : <Navigate to="/" />
        } />
        <Route path="/restricted/categories" element={
          isAuthenticated && user?.role === 'restricted' ? <RestrictedDashboard /> : <Navigate to="/" />
        } />
        <Route path="/restricted/tags" element={
          isAuthenticated && user?.role === 'restricted' ? <RestrictedDashboard /> : <Navigate to="/" />
        } />
        <Route path="/restricted/statistics" element={
          isAuthenticated && user?.role === 'restricted' ? <RestrictedDashboard /> : <Navigate to="/" />
        } />
        <Route path="/restricted/domains" element={
          isAuthenticated && user?.role === 'restricted' ? <RestrictedDashboard /> : <Navigate to="/" />
        } />
        <Route path="/restricted/tasks" element={
          isAuthenticated && user?.role === 'restricted' ? <RestrictedDashboard /> : <Navigate to="/" />
        } />
        <Route path="/restricted/formations" element={
          isAuthenticated && user?.role === 'restricted' ? <RestrictedDashboard /> : <Navigate to="/" />
        } />

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Modaux globaux de connexion et d'inscription */}
      <Modal isOpen={showLoginModal} onClose={closeModals}>
        <Login onSwitchToRegister={openRegister} />
      </Modal>
      <Modal isOpen={showRegisterModal} onClose={closeModals}>
        <Register onSwitchToLogin={openLogin} />
      </Modal>
    </BrowserRouter>
  )
}

export default App
