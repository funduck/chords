import { Image as TelegramImage } from "@telegram-apps/telegram-ui";

type ImageProps = {
  style?: React.CSSProperties;
  src: string;
  alt?: string;
};

function Image({ style, src, alt }: ImageProps) {
  return <TelegramImage style={style} src={src} alt={alt} />;
}

export default Image;
