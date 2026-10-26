import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/Home';
import AudioPlayer from './components/AudioPlayer';

function App() {
  const [showAudio, setShowAudio] = useState(false);

  return (
    <Router>
      <AudioPlayer isVisible={showAudio} />
      <Routes>
        <Route path="/*" element={<Home setShowAudio={setShowAudio} />} />
      </Routes>
    </Router>
  );
}

export default App;
