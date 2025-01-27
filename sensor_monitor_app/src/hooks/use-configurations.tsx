import { ConfigurationContextType } from "@/app/devices/page";
import React from "react";

export const ConfigurationContext = React.createContext<ConfigurationContextType | null>(null)

// Custom hook to use socket context with type safety
export const useConfigurations = (): ConfigurationContextType => {

  const context = React.useContext(ConfigurationContext);
if (!context) {
  throw new Error('useConfigurations must be used within a ConfigurationsProvider');
}
return context;
};