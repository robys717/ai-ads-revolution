import { Link, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';

function Nav(){
  return (
    <nav className="flex gap-4 items-center p-4 border-b border-slate-800 bg-slate-900/70">
      <Link className="hover:text-blue-400 font-semibold" to="/">AI Ads</Link>
      <Link className="hover:text-blue-400" to="/features">Features</Link>
      <Link className="hover:text-blue-400" to="/pricing">Pricing</Link>
      <Link className="hover:text-blue-400" to="/about">About</Link>
      <Link className="hover:text-blue-400" to="/contact">Contact</Link>
      <div className="flex-1" />
      <Link className="hover:text-blue-400" to="/dashboard">Dashboard</Link>
      <Link className="hover:text-blue-400" to="/upload">Upload</Link>
    </nav>
  );
}

function Footer(){
  return (
    <footer className="border-t border-slate-800 mt-12">
      <div className="max-w-6xl mx-auto p-4 text-sm text-slate-400">
        © {new Date().getFullYear()} AI Ads Revolution — All rights reserved.
      </div>
    </footer>
  );
}

export default function App(){
  return (
    <>
      <Nav/>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/features" element={<Features/>} />
        <Route path="/pricing" element={<Pricing/>} />
        <Route path="/about" element={<About/>} />
        <Route path="/contact" element={<Contact/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/upload" element={<Upload/>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer/>
    </>
  );
}
