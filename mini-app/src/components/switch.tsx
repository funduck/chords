import { Switch as TelegramSwitch } from "@telegram-apps/telegram-ui";

type SwitchProps = {
  disabled?: boolean;
  checked?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

function Switch({ disabled, checked, onChange }: SwitchProps) {
  return <TelegramSwitch disabled={disabled} checked={checked} onChange={onChange} />;
}

export default Switch;
