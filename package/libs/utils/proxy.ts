/**
 * 将字符串转为可读流
 * @param str
 * @returns
 */
export const createStream = function (str: string) {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(str));
      controller.close();
    },
  });
  return stream;
};
