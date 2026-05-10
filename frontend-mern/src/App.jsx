import { Routes, Route, useLocation } from 'react-router-dom';
import GtuPredictor from './components/GtuPredictor';
import SubjectDetails from './pages/SubjectDetails';
import Subjects from './pages/Subjects';
import History from './pages/History';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';

import MainLayout from './components/MainLayout';

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <>
      {isAuthPage ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      ) : (
        <MainLayout>
          <Routes>
            <Route path="/" element={<GtuPredictor />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/subject/:subjectId" element={<SubjectDetails />} />
          </Routes>
        </MainLayout>
      )}
    </>
  );
}

export default App;
