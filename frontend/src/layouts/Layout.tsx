import React from "react";
import { useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { BoardDetailSidebar } from "./BoardDetailSidebar";
import { useSidebar } from "../contexts";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isOpen, mainContentWidth } = useSidebar();
  const location = useLocation();

  // Check if we're on a board detail page
  const isBoardDetailPage =
    location.pathname.includes("/boards/") &&
    location.pathname.split("/").length > 2;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <div className="flex flex-row">
        {/* Sidebar */}
        {isOpen && (isBoardDetailPage ? <BoardDetailSidebar /> : <Sidebar />)}

        {/* Main Content */}
        <main
          className="flex-1 p-6 min-h-screen flex overflow-hidden"
          style={{ width: mainContentWidth }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
