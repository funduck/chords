import { ReactNode, createContext, useContext, useState } from "react";

interface HeaderContextType {
  centerContent: ReactNode;
  defaultCenterContent?: ReactNode;
  setCenterContent: (content?: ReactNode) => void;
  setDefaultCenterContent: (content?: ReactNode) => void;
  settingsContent: ReactNode[];
  setSettingsContent: (content: ReactNode[]) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error("useHeader must be used within HeaderProvider");
  }
  return context;
};

export const HeaderProvider = ({ children }: { children: ReactNode }) => {
  const [centerContent, setCenterContent] = useState<ReactNode>(null);
  const [defaultCenterContent, setDefaultCenterContent] = useState<ReactNode>(null);
  const [settingsContent, setSettingsContent] = useState<ReactNode[]>([]);

  return (
    <HeaderContext.Provider
      value={{
        centerContent,
        defaultCenterContent,
        setCenterContent,
        setDefaultCenterContent,
        settingsContent,
        setSettingsContent,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
};
