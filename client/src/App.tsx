

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { AddTask } from './pages/AddTask';
import { EditTask } from './pages/EditTask';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Navbar } from './components/Navbar';
import { AuthProvider } from './AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ToastProvider } from './components/Toast';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="app-layout">
            <Navbar />
            <main>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/add" element={<AddTask />} />
                  <Route path="/edit/:id" element={<EditTask />} />
                </Route>

                {/* Catch-all route - redirect unknown paths to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
