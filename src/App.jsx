import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import './App.css';

export default function App() {
  return (
    <div className="flex w-full h-fit bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 pt-6 h-full">
        <Outlet />
      </main>
    </div>
  );
}

// bg-[var(--bg)]