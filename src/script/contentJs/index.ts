import 'babel-polyfill';
import { injectCustomJs } from '../../libs/chrome';
import { addEventListener } from '../../libs/utils';
import { IframeView } from '../../libs/class';
const prefix = 'api_proxy';
document.onreadystatechange = async function () {
  if (document.readyState === 'complete') {
    injectCustomJs('libs/script/customJs.js');
    const iframeView: IframeView = new IframeView(`${prefix}-iframe-view`);
    console.log(iframeView);
    iframeView.show();
  }
};
