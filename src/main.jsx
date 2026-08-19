import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'

import Main from './pages/Main.jsx'
import Cpu from './pages/Cpu.jsx'
import Ground from './pages/Ground.jsx'
import LearningResource from './pages/LearningResource.jsx'

import './index.css'
import CPUProvider from '../src/context/CPUProvider.jsx'
import GroundProvider from '../src/context/GroundProvider.jsx'

// Definisi rute bertingkat (nested routes)
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // App bertindak sebagai layout utama
    children: [
      {
        path: "/",
        element: <Main />,
      },
      {
        path: "/cpu",
        element: <Cpu />,
      },
      {
        path: "/ground",
        element: <Ground />,
      },
      {
        path: "/resource",
        element: <LearningResource />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CPUProvider>
      <GroundProvider>
        <RouterProvider router={router} />
      </GroundProvider>
    </CPUProvider>
  </React.StrictMode>,
)