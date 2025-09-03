declare module 'systray2' {
  export interface MenuItem {
    title: string;
    tooltip?: string;
    enabled?: boolean;
    checked?: boolean;
    click?: () => void;
  }

  export interface SystrayOptions {
    menu: {
      icon: string;
      title?: string;
      tooltip?: string;
      items: MenuItem[];
    };
    debug?: boolean;
    copyDir?: boolean;
  }

  export interface SystrayClickEvent {
    seq_id: number;
    item: MenuItem;
  }

  export default class SysTray {
    constructor(options: SystrayOptions);
    
    onClick(callback: (action: SystrayClickEvent) => void): void;
    onExit(callback: () => void): void;
    sendAction(action: { type: string; item?: any }): void;
    kill(): void;
  }
}