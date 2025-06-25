import { Button as MantineButton } from "@mantine/core";
import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  stretched?: boolean;
};

const Button: React.FC<ButtonProps> = ({ children, disabled, onClick, stretched }) => {
  return (
    <MantineButton w={stretched ? "100%" : ""} variant="outline" onClick={onClick} disabled={disabled}>
      {children}
    </MantineButton>
  );
};

export default Button;
