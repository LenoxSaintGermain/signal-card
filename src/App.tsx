import React from 'react';
import { SignalProvider } from './context/SignalContext';
import SignalCardContainer from './components/SignalCardContainer';

function App() {
  return (
    <SignalProvider>
      <SignalCardContainer />
    </SignalProvider>
  );
}

export default App;
