import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import SearchPage from './components/SearchPage'; // Import the SearchPage component

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate replace to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<SearchPage />} /> {/* Add the SearchPage route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
