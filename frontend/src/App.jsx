import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import store from './store'
import ProtectedRoute from './components/Common/ProtectedRoute'
import Layout from './components/Layout/Layout'

// Pages
import Home from './pages/Home'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Profile from './pages/Profile/Profile'
import Settings from './pages/Settings/Settings'
import ArticleCreate from './pages/Article/ArticleCreate'
import ArticleEdit from './pages/Article/ArticleEdit'
import ArticleView from './pages/Article/ArticleView'
import Dashboard from './pages/Dashboard/Dashboard'
import Admin from './pages/Admin/Admin'
import NotFound from './pages/NotFound'

/**
 * Main App Component
 * Sets up routing, Redux store, and global providers
 */
function App() {
  return (
    <Provider store={store}>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Layout Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/articles/:slug" element={<ArticleView />} />
            <Route path="/profile/:username" element={<Profile />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />
            <Route
              path="/settings"
              element={<ProtectedRoute><Settings /></ProtectedRoute>}
            />
            <Route
              path="/article/new"
              element={<ProtectedRoute><ArticleCreate /></ProtectedRoute>}
            />
            <Route
              path="/article/:id/edit"
              element={<ProtectedRoute><ArticleEdit /></ProtectedRoute>}
            />
            <Route
              path="/admin"
              element={<ProtectedRoute><Admin /></ProtectedRoute>}
            />
          </Route>

          {/* 404 Route */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Router>
    </Provider>
  )
}

export default App
