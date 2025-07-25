import { ButtonVariant, Button as MantineButton } from "@mantine/core";
import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  stretched?: boolean;
  variant?: ButtonVariant;
};

const Button: React.FC<ButtonProps> = ({ children, disabled, onClick, stretched, variant }) => {
  return (
    <MantineButton w={stretched ? "100%" : ""} variant={variant || "outline"} onClick={onClick} disabled={disabled}>
      {children}
    </MantineButton>
  );
};

export default Button;
