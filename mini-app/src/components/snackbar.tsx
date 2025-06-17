import { Snackbar as TelegramSnackbar } from "@telegram-apps/telegram-ui";

type SnackbarProps = {
  onClose: () => void;
  children: React.ReactNode;
};

function Snackbar({ onClose, children }: SnackbarProps) {
  return <TelegramSnackbar onClose={onClose}>{children}</TelegramSnackbar>;
}

export default Snackbar;
