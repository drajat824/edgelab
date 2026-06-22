import { NavLink } from 'react-router-dom';
import MenuMain from '../assets/menu-main.svg';
import MenuCpu from '../assets/menu-cpu.svg';
import MenuGround from '../assets/menu-ground.svg';
import Logo from '../assets/logo.svg';

export default function Navbar() {
    // Style sederhana untuk membedakan menu yang aktif
    const activeStyle = ({ isActive }) => ({
        textDecoration: 'none',
        // fontWeight: isActive ? 'bold' : 'normal',
        backgroundColor: isActive ? '#0F0F17' : 'transparent',
        // color: isActive ? 'var(--primary)' : 'var(--text)'
    });

    return (
        <nav className="bg-[var(--menu)] flex flex-col text-white text-xl pt-10">
            <img src={Logo} alt="Logo" className="w-45 mb-10 mx-auto" />
            <hr className="border-gray-700" />

            <NavLink to="/" className="flex items-center gap-4 pl-5 py-2 pr-10 py-5" style={activeStyle}>
                <img src={MenuMain} alt="Main Monitor" className="w-10 h-10" />
                <p>Main Monitor</p>
            </NavLink>
            <NavLink to="/cpu" className="flex items-center gap-4 pl-5 py-2 pr-10 py-5" style={activeStyle}>
                <img src={MenuCpu} alt="CPU" className="w-10 h-10" />
                <p>CPU Management</p>
            </NavLink>
            <NavLink to="/ground" className="flex items-center gap-4 pl-5 py-2 pr-10 py-5" style={activeStyle}>
                <img src={MenuGround} alt="Ground" className="w-10 h-10" />
                <p>Ground Truth</p>
            </NavLink>

            <button
                onClick={() => {
                    const confirmed = window.confirm("Apakah kamu yakin ingin mematikan Raspberry Pi?");
                    if (confirmed) {
                        console.log("Shutdown RPi triggered");
                    }
                }}
                className="btn bg-red-500 text-white mt-auto mb-5 mx-5 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
                Shutdown RPi
            </button>
        </nav>
    );
}