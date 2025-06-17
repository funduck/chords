import { ButtonCell as TelegramButtonCell } from "@telegram-apps/telegram-ui";

type ButtonCellProps = {
  onClick: () => void;
  children: React.ReactNode;
};

function ButtonCell({ onClick, children }: ButtonCellProps) {
  return <TelegramButtonCell onClick={onClick}>{children}</TelegramButtonCell>;
}

export default ButtonCell;
