import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Home from './pages/Home';
import AdminVisits from './pages/AdminVisits';
import AudioPlayer from './components/AudioPlayer';
import { logVisit } from './lib/analytics';

function App() {
  const [showAudio, setShowAudio] = useState(false);

  // one quiet visit log per session
  useEffect(() => {
    logVisit();
  }, []);

  return (
    <Router>
      <AudioPlayer isVisible={showAudio} />
      <Routes>
        {/* unlisted: not in the nav; gated by a server-checked password */}
        <Route path="/admin/visits" element={<AdminVisits />} />
        <Route path="/*" element={<Home setShowAudio={setShowAudio} />} />
      </Routes>
    </Router>
  );
}

export default App;
