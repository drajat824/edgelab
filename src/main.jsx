import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import Main from './pages/Main.jsx'
import Cpu from './pages/Cpu.jsx'
import Ground from './pages/Ground.jsx'
import './index.css'
import CPUProvider from '../src/context/CPUProvider.jsx'

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
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CPUProvider>
      <RouterProvider router={router} />
    </CPUProvider>
  </React.StrictMode>,
)