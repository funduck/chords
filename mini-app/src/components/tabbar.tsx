import { Tabbar as TelegramTabbar } from "@telegram-apps/telegram-ui";
import { ReactElement } from "react";

type TabbarProps = {
  children: ReactElement[];
};

type TabbarItemProps = {
  selected?: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function Tabbar({ children }: TabbarProps) {
  return <TelegramTabbar>{children}</TelegramTabbar>;
}

Tabbar.Item = function TabbarItem({ selected, onClick, children }: TabbarItemProps) {
  return (
    <TelegramTabbar.Item selected={selected} onClick={onClick}>
      {children}
    </TelegramTabbar.Item>
  );
};

export default Tabbar;
