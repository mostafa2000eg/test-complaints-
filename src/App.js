import React, { useState, createContext, useContext } from 'react';
import localStorageService from './services/localStorageService';

// Context for Local Storage
const AppContext = createContext(null);

// Main Application Component
function App() {
  const [userId] = useState('local-user'); // Simple user ID since we're not using authentication
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Initialize local storage on first load
  React.useEffect(() => {
    localStorageService.init();
  }, []);

  return (
    <AppContext.Provider value={{ userId, localStorageService }}>
      <div className="min-h-screen bg-gray-100 font-sans text-right" dir="rtl">
        <Header setCurrentPage={setCurrentPage} />
        <div className="container mx-auto p-4 max-w-7xl">
          {currentPage === 'dashboard' && (
            <Dashboard 
              setCurrentPage={setCurrentPage} 
              setSelectedComplaint={setSelectedComplaint} 
            />
          )}
          {currentPage === 'addComplaint' && (
            <ComplaintForm 
              setCurrentPage={setCurrentPage} 
              initialComplaint={selectedComplaint}
            />
          )}
          {currentPage === 'viewComplaint' && selectedComplaint && (
            <ComplaintDetail 
              complaint={selectedComplaint} 
              setCurrentPage={setCurrentPage} 
            />
          )}
        </div>
      </div>
    </AppContext.Provider>
  );
}

// Export the App component as default
export default App;