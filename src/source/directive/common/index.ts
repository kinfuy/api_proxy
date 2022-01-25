const getHeight = function getHeight() {
  return document.documentElement.clientHeight || document.body.clientHeight;
};
const Height = {
  name: 'Height',
  fn: {
    mounted: function (el: HTMLElement) {
      el.style.height = getHeight() - 2 + 'px';
    },
  },
};
export { Height };
