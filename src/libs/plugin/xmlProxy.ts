const originXmlHttpRequest = window.XMLHttpRequest;
const beforeXmlRequest = (req: XMLHttpRequest) => {
  console.log('请求前钩子');
  req.addEventListener('readystatechange', () => {
    console.log('onload change');
    if (req.readyState === 4 && req.status == 200) {
      beforeXmlResponse();
    }
  });
};
const beforeXmlResponse = () => {
  console.log('响应前钩子');
};
class SELF_XMLHttpRequest extends window.XMLHttpRequest {
  constructor() {
    super();
  }
  send(body?: Document | XMLHttpRequestBodyInit | null) {
    beforeXmlRequest(this);
  }
}

// window.XMLHttpRequest = SELF_XMLHttpRequest;
