import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WaiterPage from './pages/WaiterPage';
import ChefPage from './pages/ChefPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import { AuthProvider, RequireAuth } from './components/AuthGuard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-orange-500/30">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/waiter" replace />} />
            
            <Route path="/waiter" element={
              <RequireAuth>
                <WaiterPage />
              </RequireAuth>
            } />
            
            <Route path="/chef" element={
              <RequireAuth>
                <ChefPage />
              </RequireAuth>
            } />
            
            <Route path="/admin" element={
              <RequireAuth>
                <AdminPage />
              </RequireAuth>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
