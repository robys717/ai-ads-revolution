import { Link, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';

export default function App(){
  return (
    <>
      <nav className="nav">
        <Link className="link font-bold" to="/">AI Ads</Link>
        <Link className="link" to="/dashboard">Dashboard</Link>
        <Link className="link" to="/upload">Upload</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/upload" element={<Upload/>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}
