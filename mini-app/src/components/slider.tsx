import { Slider as TelegramSlider } from "@telegram-apps/telegram-ui";

type SliderProps = {
  onChange: (value: number) => void;
};

function Slider({ onChange }: SliderProps) {
  return <TelegramSlider onChange={onChange} />;
}

export default Slider;
