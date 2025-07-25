type ImageProps = {
  style?: React.CSSProperties;
  src: string;
  alt?: string;
};

function Image({ style, src, alt }: ImageProps) {
  return <img style={style} src={src} alt={alt} />;
}

export default Image;
