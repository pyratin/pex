import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';

import Route_ from '#/Route_';
import Home from '#/Route_/Home';
import '#/index.scss';

createRoot(document.body).render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<Route_ />}>
        <Route index element={<Navigate to='Home' />} />

        <Route path='Home' element={<Home />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
