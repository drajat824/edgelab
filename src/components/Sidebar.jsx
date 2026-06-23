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
        `flex items-center gap-4 pl-5 pr-10 py-5 transition-colors ${
            isActive ? 'bg-white text-black' : 'text-white'
        }`;

    return (
        <nav className="bg-[var(--menu)] flex flex-col text-xl pt-10 min-h-screen">
            <img src={Logo} alt="Logo" className="w-45 mb-10 mx-auto" />
            <hr className="border-gray-700" />

            <NavLink to="/" className={linkClass}>
                {({ isActive }) => (
                    <>
                        <img
                            src={isActive ? MenuMainActive : MenuMain}
                            alt="Main Monitor"
                            className="w-10 h-10"
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
                onClick={() => {
                    const confirmed = window.confirm(
                        "Apakah kamu yakin ingin mematikan Raspberry Pi?"
                    );
                    if (confirmed) {
                        console.log("Shutdown RPi triggered");
                    }
                }}
                className="mt-auto mb-5 mx-5 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
                Shutdown RPi
            </button>
        </nav>
    );
}