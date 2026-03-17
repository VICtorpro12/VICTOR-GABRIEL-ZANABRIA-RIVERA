import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getMe, User } from './auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Calculator from './pages/Calculator';
import StudySession from './pages/StudySession';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then((currentUser) => {
        setUser(currentUser);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Cargando...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login onLogin={setUser} />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} onLogout={() => setUser(null)} /> : <Navigate to="/" />} />
        <Route path="/calculator" element={user ? <Calculator user={user} onLogout={() => setUser(null)} /> : <Navigate to="/" />} />
        <Route path="/study/:branch/:topic" element={user ? <StudySession user={user} onLogout={() => setUser(null)} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
