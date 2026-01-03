import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';

import RecipeBuilder from './pages/RecipeBuilder';
import Inventory from './pages/Inventory';
import Prep from './pages/Prep';

import Settings from './pages/Settings';

// ... (other imports)

// ...

// (Inside Routes)
<Route path="/settings" element={<Settings />} />

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/recipes" element={<RecipeBuilder />} />
            <Route path="/items" element={<Inventory />} />
            <Route path="/prep" element={<Prep />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
