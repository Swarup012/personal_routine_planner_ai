import React, { useEffect, useState } from "react";

const SIDEBAR_WIDTH = 240;
const EDGE_TRIGGER = 30; // px from left edge to trigger sidebar

export const Sidebar: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [hoveringSidebar, setHoveringSidebar] = useState(false);

  useEffect(() => {
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

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 32 }}>
        Routine Planner
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Replace with your navigation links */}
        <a href="/landing" style={{ color: "#fff", textDecoration: "none" }}>Dashboard</a>
        <a href="/finance" style={{ color: "#fff", textDecoration: "none" }}>Finance</a>
        <a href="/profile" style={{ color: "#fff", textDecoration: "none" }}>Profile</a>
        <a href="/" style={{ color: "#fff", textDecoration: "none" }}>Home</a>
        {/* Add more links as needed */}
      </nav>
    </div>
  );
}; 