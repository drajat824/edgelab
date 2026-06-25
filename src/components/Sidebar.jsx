import { NavLink } from 'react-router-dom';
import MenuMain from '../assets/menu-main.svg';
import MenuCpu from '../assets/menu-cpu.svg';
import MenuGround from '../assets/menu-ground.svg';

import MenuMainActive from '../assets/menu-main-active.svg';
import MenuCpuActive from '../assets/menu-cpu-active.svg';
import MenuGroundActive from '../assets/menu-ground-active.svg';

import Logo from '../assets/logo.svg';

export default function Navbar() {
    const linkClass = ({ isActive }) =>
        `flex items-center gap-4 pl-5 pr-10 py-5 transition-colors ${isActive ? 'bg-white text-black' : 'text-white'
        }`;

    const handleShutdown = () => {
        const confirmed = window.confirm("Apakah kamu yakin ingin mematikan Raspberry Pi?");
        if (confirmed) {
            console.log("Shutdown RPi triggered");
        }
    };

    return (
        <>
            <nav className="hidden lg:flex bg-[var(--menu)] text-xl pt-10 min-h-screen w-64 flex-col left-0 top-0">
                <img src={Logo} alt="Logo" className="w-45 mb-10 mx-auto" />
                <hr className="border-gray-700" />

                <NavLink to="/" className={linkClass}>
                    {({ isActive }) => (
                        <>
                            <img
                                src={isActive ? MenuMainActive : MenuMain}
                                alt="Main Monitor"
                                className="w-10 h-10 hidden md:flex"
                            />
                            <p>Main Monitor</p>
                        </>
                    )}
                </NavLink>

                <NavLink to="/cpu" className={linkClass}>
                    {({ isActive }) => (
                        <>
                            <img
                                src={isActive ? MenuCpuActive : MenuCpu}
                                alt="CPU Management"
                                className="w-10 h-10"
                            />
                            <p>CPU Management</p>
                        </>
                    )}
                </NavLink>

                <NavLink to="/ground" className={linkClass}>
                    {({ isActive }) => (
                        <>
                            <img
                                src={isActive ? MenuGroundActive : MenuGround}
                                alt="Ground Truth"
                                className="w-10 h-10"
                            />
                            <p>Ground Truth</p>
                        </>
                    )}
                </NavLink>

                <button
                    onClick={handleShutdown}
                    className="mt-auto mb-5 mx-5 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
                >
                    Shutdown RPi
                </button>
            </nav>

            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--menu)] border-t border-gray-700 flex justify-around items-center h-16 z-50 px-2">
                <NavLink to="/" className={({ isActive }) => `flex flex-col items-center text-xs gap-1 ${isActive ? 'text-black bg-white px-4 py-1 rounded-sm' : 'text-gray-400'}`}>
                    {({ isActive }) => (
                        <>
                            <img src={isActive ? MenuMainActive : MenuMain} alt="Main" className="w-6 h-6" />
                            <span>Main</span>
                        </>
                    )}
                </NavLink>

                <NavLink to="/cpu" className={({ isActive }) => `flex flex-col items-center text-xs gap-1 ${isActive ? 'text-black bg-white px-4 py-1 rounded-sm' : 'text-gray-400'}`}>
                    {({ isActive }) => (
                        <>
                            <img src={isActive ? MenuCpuActive : MenuCpu} alt="CPU" className="w-6 h-6" />
                            <span>CPU</span>
                        </>
                    )}
                </NavLink>

                <NavLink to="/ground" className={({ isActive }) => `flex flex-col items-center text-xs gap-1 ${isActive ? 'text-black bg-white px-4 py-1 rounded-sm' : 'text-gray-400'}`}>
                    {({ isActive }) => (
                        <>
                            <img src={isActive ? MenuGroundActive : MenuGround} alt="Ground" className="w-6 h-6" />
                            <span>Ground</span>
                        </>
                    )}
                </NavLink>

                {/* Tombol Shutdown Versi Mobile */}
                <button
                    onClick={handleShutdown}
                    className="flex flex-col items-center text-xs gap-1 text-red-500 active:scale-95 transition-transform cursor-pointer">
                    <p>Shutdown</p>
                </button>
            </nav>
        </>
    );
}