declare module 'keypress' {
  interface Key {
    name: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  }

  function keypress(stream: NodeJS.ReadStream): void;
  export = keypress;
}