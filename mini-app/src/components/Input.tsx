import { ChangeEvent } from "react";

type InputProps = {
  before?: React.ReactNode;
  name?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

function Input({ before, name, onChange }: InputProps) {
  return (
    <div>
      {before}
      <input name={name} onChange={onChange} />
    </div>
  );
}

export default Input;
