import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import './App.css';
import DesktopOnly from './components/DesktopOnly.jsx';

export default function App() {
  return (
    <div className="flex min-h-screen w-full">
      <DesktopOnly>
        <Sidebar />
        <main className="flex-1 p-6 bg-[var(--bg)]">
          <Outlet />
        </main>
      </DesktopOnly>
    </div>
  );
}