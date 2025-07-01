import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/app-context';
import Index from './pages/Index';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';
import Onboarding from './pages/Onboarding';
import NotFound from './pages/NotFound';
import { Layout } from './components/Layout';
import Profile from './pages/Profile';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/landing" element={<Layout><Landing /></Layout>} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/finance" element={<Layout><Finance /></Layout>} />
            <Route path="/profile" element={<Layout><Profile /></Layout>} />
            <Route path="/onboarding" element={<Layout><Onboarding /></Layout>} />
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;