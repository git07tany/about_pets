import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dogs from './pages/Dogs';
import DogDetail from './pages/DogDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="dogs" element={<Dogs />} />
          <Route path="dogs/:id" element={<DogDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
