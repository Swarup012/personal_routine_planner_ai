import React from "react";
import { Sidebar } from "@/components/sidebar";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Sidebar />
      <div style={{ marginLeft: 0, minHeight: "100vh" }}>{children}</div>
    </>
  );
}; 