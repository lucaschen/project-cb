declare global {
  interface ObjectConstructor {
    keys<T extends object>(o: T): Array<keyof T>;
  }

  interface Window {
    __FOO__: string;
  }
}

export {};
