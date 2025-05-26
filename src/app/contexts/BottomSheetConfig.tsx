import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { StyleProp, ViewStyle, Dimensions } from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

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

// Default config values - ensure consistent handling of maxHeight
const defaultConfig: BottomSheetConfigOptions = {
  animationDuration: 300,
  backdropOpacity: 0.5,
  minHeight: 180,
  maxHeight: 0.8, // 80% of screen height
  snapPoints: [0.8, 0.5], // 80% and 50% of screen height
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
    
    // Create a new config object with the overrides
    const mergedConfig = { ...config, ...overrides };
    
    // Ensure maxHeight is properly handled
    if (typeof mergedConfig.maxHeight === 'number' && mergedConfig.maxHeight <= 1) {
      // This is a percentage value, convert it to actual height value only in the returned object
      // We keep the original percentage in the stored config
      return {
        ...mergedConfig,
        maxHeight: mergedConfig.maxHeight // Let the BottomSheet component handle the conversion
      };
    }
    
    return mergedConfig;
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