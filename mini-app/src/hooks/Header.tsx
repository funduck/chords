import { ReactNode, createContext, useContext, useState } from "react";

interface HeaderContextType {
  centerContent: ReactNode;
  setCenterContent: (content: ReactNode) => void;
  rightContent: ReactNode;
  setRightContent: (content: ReactNode) => void;
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
  const [rightContent, setRightContent] = useState<ReactNode>(null);

  return (
    <HeaderContext.Provider
      value={{
        centerContent,
        setCenterContent,
        rightContent,
        setRightContent,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
};
