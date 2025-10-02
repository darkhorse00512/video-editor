import React, { createContext, useContext, useState } from "react";
import { OverlayType } from "../types";
import { useSidebar as useUISidebar } from "../../../ui/sidebar";

// Define the shape of our context data
type SidebarContextType = {
  activePanel: OverlayType; // Stores the currently active panel name
  setActivePanel: (panel: OverlayType) => void; // Function to update the active panel
  setIsOpen: (open: boolean) => void;
};

// Create the context with undefined as initial value
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Custom hook to consume the sidebar context
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  const uiSidebar = useUISidebar();

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }

  return {
    ...context,
    setIsOpen: uiSidebar.setOpen,
  };
};

// Provider component that wraps parts of the app that need access to sidebar state
export const SidebarProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [activePanel, setActivePanel] = useState<OverlayType>(OverlayType.TEXT);
  const { setOpen } = useUISidebar();

  const value = {
    activePanel,
    setActivePanel,
    setIsOpen: setOpen,
  };

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};
