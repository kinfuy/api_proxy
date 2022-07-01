/**
 * 将字符串转为可读流
 * @param str
 * @returns
 */
export const createStream = (str: string) => {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(str));
      controller.close();
    },
  });
  return stream;
};

/**
 * 篡改fetch可读流数据
 * @param body
 * @param data
 * @param extracOptions 额外参数
 * @returns
 */
export const replaceFetchDate = (
  body: Response,
  data: any,
  extracOptions: Partial<Response>
) => {
  const bodyInit = {
    ok: body.ok,
    redirected: body.redirected,
    type: body.type,
    url: body.url,
    bodyUsed: body.bodyUsed,
  };
  const stream = createStream(JSON.stringify(data));
  const response = new Response(stream, {
    ...bodyInit,
    headers: body.headers,
    status: 200,
    statusText: body.statusText,
    ...extracOptions,
  });
  return response;
};
