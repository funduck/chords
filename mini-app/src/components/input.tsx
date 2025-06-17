import { Input as TelegramInput } from "@telegram-apps/telegram-ui";
import { ChangeEvent } from "react";

type InputProps = {
  before?: React.ReactNode;
  name?: string;
  status?: "focused" | "default";
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

function Input({ before, name, status, onChange }: InputProps) {
  return <TelegramInput before={before} name={name} status={status} onChange={onChange} />;
}

export default Input;
