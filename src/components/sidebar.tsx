import React, { useEffect, useState } from "react";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import { Sun, Moon, LogOut, Menu } from "lucide-react";

const SIDEBAR_WIDTH = 240;
const EDGE_TRIGGER = 30; // px from left edge to trigger sidebar

export const Sidebar: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [hoveringSidebar, setHoveringSidebar] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const { logout } = useAuth();

  useEffect(() => {
    // Only enable hover sidebar on desktop
    if (window.innerWidth < 640) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientX <= EDGE_TRIGGER) {
        setVisible(true);
      } else if (!hoveringSidebar) {
        setVisible(false);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [hoveringSidebar]);

  // Keep sidebar open if mouse is over it
  const handleMouseEnter = () => setHoveringSidebar(true);
  const handleMouseLeave = () => {
    setHoveringSidebar(false);
    setVisible(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Responsive sidebar: mobile uses drawer, desktop uses hover sidebar
  return (
    <>
      {/* Hamburger for mobile */}
      <button
        className="fixed top-4 left-4 z-[1100] sm:hidden bg-primary text-primary-foreground rounded-full p-2 shadow-lg focus:outline-none"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu className="w-6 h-6" />
      </button>
      {/* Mobile Drawer Sidebar */}
      <div
        className={`fixed inset-0 z-[1050] bg-black/40 transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} sm:hidden`}
        onClick={() => setMobileOpen(false)}
      />
      <div
        className={`fixed top-0 left-0 h-full w-[80vw] max-w-xs bg-primary text-primary-foreground shadow-lg z-[1200] flex flex-col justify-between p-6 transition-transform duration-300 sm:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ borderTopRightRadius: 16, borderBottomRightRadius: 16 }}
      >
        <div>
          <div className="font-bold text-xl mb-8">Routine Planner</div>
          <nav className="flex flex-col gap-6 text-base">
            <a href="/landing" className="hover:underline">Dashboard</a>
            <a href="/finance" className="hover:underline">Finance</a>
            <a href="/profile" className="hover:underline">Profile</a>
            <a href="/" className="hover:underline">Home</a>
          </nav>
        </div>
        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors shadow border-none cursor-pointer group"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span className="relative w-6 h-6 flex items-center justify-center">
              <Sun
                className={`absolute transition-all duration-300 ${darkMode ? 'opacity-0 scale-75' : 'opacity-100 scale-100'} text-yellow-300`}
              />
              <Moon
                className={`absolute transition-all duration-300 ${darkMode ? 'opacity-100 scale-100' : 'opacity-0 scale-75'} text-gray-200`}
              />
            </span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors shadow border-none cursor-pointer group"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-red-300" />
          </button>
          <span className="text-xs text-muted-foreground opacity-70">Theme applies everywhere</span>
        </div>
      </div>
      {/* Desktop Sidebar */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="hidden sm:flex"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: SIDEBAR_WIDTH,
          background: "rgba(30, 41, 59, 0.98)", // dark bg
          color: "#fff",
          boxShadow: visible ? "2px 0 8px rgba(0,0,0,0.08)" : undefined,
          transform: visible ? "translateX(0)" : `translateX(-${SIDEBAR_WIDTH}px)`,
          transition: "transform 0.3s cubic-bezier(.4,0,.2,1)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          padding: "2rem 1rem 1rem 1.5rem",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 32 }}>
            Routine Planner
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <a href="/landing" style={{ color: "#fff", textDecoration: "none" }}>Dashboard</a>
            <a href="/finance" style={{ color: "#fff", textDecoration: "none" }}>Finance</a>
            <a href="/profile" style={{ color: "#fff", textDecoration: "none" }}>Profile</a>
            <a href="/" style={{ color: "#fff", textDecoration: "none" }}>Home</a>
          </nav>
        </div>
        {/* Dark Mode Toggle and Logout */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors shadow border-none cursor-pointer group"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span className="relative w-6 h-6 flex items-center justify-center">
              <Sun
                className={`absolute transition-all duration-300 ${darkMode ? 'opacity-0 scale-75' : 'opacity-100 scale-100'} text-yellow-300`}
              />
              <Moon
                className={`absolute transition-all duration-300 ${darkMode ? 'opacity-100 scale-100' : 'opacity-0 scale-75'} text-gray-200`}
              />
            </span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors shadow border-none cursor-pointer group"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-red-300" />
          </button>
          <span className="text-xs text-muted-foreground opacity-70">Theme applies everywhere</span>
        </div>
      </div>
    </>
  );
}; 