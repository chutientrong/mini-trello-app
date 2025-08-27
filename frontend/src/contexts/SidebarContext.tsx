/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface SidebarState {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  sidebarWidth: number;
  mainContentWidth: string;
}

const SidebarContext = createContext<SidebarState | undefined>(undefined);

interface SidebarProviderProps {
  children: React.ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  // Initialize state from localStorage or default to true
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem('sidebar-state');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.state?.isOpen ?? true;
      } catch {
        return true;
      }
    }
    return true;
  });

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebar-state', JSON.stringify({ state: { isOpen } }));
  }, [isOpen]);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Memoize computed values to prevent unnecessary re-renders
  const sidebarWidth = useMemo(() => isOpen ? 256 : 0, [isOpen]);
  const mainContentWidth = useMemo(() => isOpen ? 'calc(100vw - 256px)' : '100vw', [isOpen]);

  const value = useMemo(() => ({
    isOpen,
    toggle,
    open,
    close,
    sidebarWidth,
    mainContentWidth,
  }), [isOpen, toggle, open, close, sidebarWidth, mainContentWidth]);

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = (): SidebarState => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
