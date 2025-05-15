import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

// Types for bottom sheet config
export interface BottomSheetConfigOptions {
  // Animation
  animationDuration: number;
  backdropOpacity: number;
  
  // Sizing and positioning
  minHeight: number;
  maxHeight: number;
  snapPoints: number[];
  
  // Appearance
  showDragIndicator: boolean;
  footerHeight: number;
  
  // Behavior
  dismissible: boolean;
  
  // Styling
  footerStyle?: StyleProp<ViewStyle>;
  handleStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

// Context interface
interface BottomSheetConfigContextType {
  config: BottomSheetConfigOptions;
  updateConfig: (newConfig: Partial<BottomSheetConfigOptions>) => void;
  getConfig: (overrides?: Partial<BottomSheetConfigOptions>) => BottomSheetConfigOptions;
}

// Create context with default values
const BottomSheetConfigContext = createContext<BottomSheetConfigContextType | undefined>(undefined);

// Default config values
const defaultConfig: BottomSheetConfigOptions = {
  animationDuration: 300,
  backdropOpacity: 0.5,
  minHeight: 180,
  maxHeight: 0.9, // 90% of screen height
  snapPoints: [0.9, 0.5], // 90% and 50% of screen height
  showDragIndicator: true,
  footerHeight: 80,
  dismissible: true,
};

// Provider component
export const BottomSheetConfigProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [config, setConfig] = useState<BottomSheetConfigOptions>(defaultConfig);
  
  // Update config with partial new settings
  const updateConfig = (newConfig: Partial<BottomSheetConfigOptions>) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      ...newConfig,
    }));
  };
  
  // Get config with optional overrides
  const getConfig = useMemo(() => (overrides?: Partial<BottomSheetConfigOptions>) => {
    if (!overrides) return config;
    return { ...config, ...overrides };
  }, [config]);
  
  const contextValue = useMemo(() => ({
    config,
    updateConfig,
    getConfig,
  }), [config, getConfig]);
  
  return (
    <BottomSheetConfigContext.Provider value={contextValue}>
      {children}
    </BottomSheetConfigContext.Provider>
  );
};

// Hook for consuming the context
export const useBottomSheetConfig = () => {
  const context = useContext(BottomSheetConfigContext);
  if (!context) {
    throw new Error('useBottomSheetConfig must be used within a BottomSheetConfigProvider');
  }
  return context;
}; 