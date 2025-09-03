declare module 'play-sound' {
  interface Player {
    play(file: string, options?: any, callback?: (err: Error | null) => void): any;
  }

  function createPlayer(): Player;
  export = createPlayer;
}