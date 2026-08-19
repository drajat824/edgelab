import { NavLink } from "react-router-dom";
import MenuMain from "../assets/menu-main.svg";
import MenuCpu from "../assets/menu-cpu.svg";
import MenuGround from "../assets/menu-ground.svg";

import MenuMainActive from "../assets/menu-main-active.svg";
import MenuCpuActive from "../assets/menu-cpu-active.svg";
import MenuGroundActive from "../assets/menu-ground-active.svg";

import Logo from "../assets/logo.svg";

// Ikon Learning Resource (Graduation Cap - Outline)
const MenuLearningResource = ({ className = "w-10 h-10" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12.5v5c3 2.5 9 2.5 12 0v-5" />
  </svg>
);

// Ikon Learning Resource Active (Graduation Cap - Solid/Filled)
const MenuLearningResourceActive = ({ className = "w-10 h-10" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 3 1 8.5l11 5.5 9-4.5v5h2v-6z" />
    <path d="M5 13.5v3.8c0 2.2 3.1 4.2 7 4.2s7-2 7-4.2v-3.8l-7 3.5z" />
  </svg>
);

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-4 pl-5 pr-10 py-5 transition-colors ${
      isActive ? "bg-white text-black" : "text-white"
    }`;

  const handleShutdown = () => {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin mematikan Raspberry Pi?"
    );
    if (confirmed) {
      console.log("Shutdown RPi triggered");
    }
  };

  return (
    <>
      {/* DESKTOP NAVBAR */}
      <nav className="hidden lg:flex bg-[var(--menu)] text-xl pt-10 min-h-[130vh] w-64 flex-col sticky left-0 top-0">
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

        <NavLink to="/resource" className={linkClass}>
          {({ isActive }) => (
            <>
              {isActive ? (
                <MenuLearningResourceActive className="w-10 h-10" />
              ) : (
                <MenuLearningResource className="w-10 h-10" />
              )}
              <p className="pl-2">Learning Resource</p>
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

      {/* MOBILE NAVBAR */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--menu)] border-t border-gray-700 flex justify-around items-center h-16 z-50 px-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs gap-1 ${
              isActive
                ? "text-black bg-white px-4 h-[102%] justify-center -mt-0.5"
                : "text-gray-400 bg-transparent px-4 py-1 rounded-sm"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <img
                src={isActive ? MenuMainActive : MenuMain}
                alt="Main"
                className="w-6 h-6"
              />
              <span>Main</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/cpu"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs gap-1 ${
              isActive
                ? "text-black bg-white px-4 h-[102%] justify-center -mt-0.5"
                : "text-gray-400 bg-transparent px-4 py-1 rounded-sm"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <img
                src={isActive ? MenuCpuActive : MenuCpu}
                alt="CPU"
                className="w-6 h-6"
              />
              <span>CPU</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/ground"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs gap-1 ${
              isActive
                ? "text-black bg-white px-4 h-[102%] justify-center -mt-0.5"
                : "text-gray-400 bg-transparent px-4 py-1 rounded-sm"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <img
                src={isActive ? MenuGroundActive : MenuGround}
                alt="Ground"
                className="w-6 h-6"
              />
              <span>Ground</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/resource"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs gap-1 ${
              isActive
                ? "text-black bg-white px-4 h-[102%] justify-center -mt-0.5"
                : "text-gray-400 bg-transparent px-4 py-1 rounded-sm"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive ? (
                <MenuLearningResourceActive className="w-6 h-6" />
              ) : (
                <MenuLearningResource className="w-6 h-6" />
              )}
              <span>Resource</span>
            </>
          )}
        </NavLink>

        <button
          onClick={handleShutdown}
          className="flex flex-col items-center text-xs gap-1 text-red-500 active:scale-95 transition-transform cursor-pointer"
        >
          <span>Shutdown</span>
        </button>
      </nav>
    </>
  );
}