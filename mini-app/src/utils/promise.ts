export function delay<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(promise);
    }, ms);
  });
}
