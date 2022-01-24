/**
 * url 是否存在于keys
 * @param url
 * @param keys
 * @returns
 */
export const IsurlExait = (url: string, keys: Array<string>) => {
  let isExist = false;
  // 都是hostname
  keys.forEach((val) => {
    if (val === url) {
      isExist = true;
    }
  });
  return isExist;
};
// 生成uuid
export const UUID = (): string => {
  let d = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x7) | 0x8).toString(16);
  });
  return uuid;
};
// 生成随机码
export const createRandomCode = (len = 6) => {
  const charset = `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`;
  const maxLen = charset.length;
  let ret = '';
  for (let i = 0; i < len; i++) {
    const randomIndex = Math.floor(Math.random() * maxLen);
    ret += charset[randomIndex];
  }
  return ret;
};
