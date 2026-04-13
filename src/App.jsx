import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dogs from './pages/Dogs';
import DogDetail from './pages/DogDetail';
import Cats from './pages/Cats';
import CatDetail from './pages/CatDetail';
import Rodents from './pages/Rodents';
import RodentDetail from './pages/RodentDetail';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="dogs" element={<Dogs />} />
          <Route path="dogs/:id" element={<DogDetail />} />
          <Route path="cats" element={<Cats />} />
          <Route path="cats/:id" element={<CatDetail />} />
          <Route path="rodents" element={<Rodents />} />
          <Route path="rodents/:id" element={<RodentDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
