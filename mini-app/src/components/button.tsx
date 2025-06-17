import { Button as TelegramUIButton } from "@telegram-apps/telegram-ui";
import React from "react";

type ButtonProps = {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  size?: "s" | "m" | "l";
  stretched?: boolean;
};

const Button: React.FC<ButtonProps> = ({ onClick, children, disabled, size, stretched }) => {
  return (
    <TelegramUIButton onClick={onClick} disabled={disabled} size={size} stretched={stretched}>
      {children}
    </TelegramUIButton>
  );
};

export default Button;
