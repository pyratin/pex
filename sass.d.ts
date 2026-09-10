declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare namespace React {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
