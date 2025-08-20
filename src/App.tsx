import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Web3Provider } from './components/Web3Provider';

import Admin from './components/admin/page';
import Auction from './components/auction/page';
import LazyMint from './components/lazy-mint/page';
import Marketplace from './components/marketplace/page';
import Home from './app/page'; // Assuming the original page.tsx is the home page
import Profile from './components/profile/page';

import './App.css'; // Import a new CSS file for App-specific styles

function App() {
  return (
    <Web3Provider>
      <Router>
        <header className="app-header">
          <nav className="app-nav">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/admin" className="nav-link">Admin</Link>
            <Link to="/auction" className="nav-link">Auction</Link>
            <Link to="/lazy-mint" className="nav-link">Lazy Mint</Link>
            <Link to="/marketplace" className="nav-link">Marketplace</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
          </nav>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/auction" element={<Auction />} />
            <Route path="/lazy-mint" element={<LazyMint />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <p>&copy; 2025 NFT Marketplace</p>
        </footer>
      </Router>
    </Web3Provider>
  );
}

export default App;