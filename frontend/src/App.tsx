import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import Crawl from './pages/Crawl';
import NotFound from './pages/NotFound';
import LandingPage from './pages/LandingPage';
import UrlDetailPage from './pages/UrlDetailPage';
import About from './pages/About';
import LandingLayout from './components/LandingLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LandingLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<About />} />
        </Route>
        <Route element={<AppLayout />}>
          <Route path="/crawl" element={<Crawl />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/url/:urlId" element={<UrlDetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
