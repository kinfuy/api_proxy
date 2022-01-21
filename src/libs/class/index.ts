import { getChromeUrl } from '../chrome';
export class IframeView {
  loading = false;
  example: undefined | HTMLIFrameElement = undefined;
  constructor(className: string) {
    this.example = document.createElement('iframe');
    this.example.className = className;
  }
  show() {
    if (this.example) {
      this.example.src = getChromeUrl('/libs/views/injectView.html');
      document.body.appendChild(this.example);
    }
  }
  updatePosition() {}
  restory() {
    if (this.example) {
      document.body.removeChild(this.example);
      this.example = undefined;
    }
  }
}
