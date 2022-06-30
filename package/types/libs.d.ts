interface addEventListenerReturn {
  remove: () => void;
}
interface PostMessage {
  from: string;
  key: string;
  data: any;
}

interface RequestConfig {
  input: RequestInfo;
  init?: RequestInit;
}
interface CustomRequestConfig extends RequestConfig {
  isMock: boolean;
  apiProxy: ApiProxy | undefined;
}
