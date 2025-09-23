import React from 'react';
import TitleBar from './components/TitleBar';
import Welcome from './pages/welcome';
const AppContent: React.FC = () => {

  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--vscode-editor-background)]">
      <TitleBar />

      {/* container */}
      <div className='flex-1 flex overflow-hidden pt-8'>
        <div className='flex-1 overflow-y-auto'>
          <Welcome />
        </div>
      </div>
      
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppContent />
  );
};

export default App
