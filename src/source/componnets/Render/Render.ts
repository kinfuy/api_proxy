import { VNode, App } from 'vue';

const Render = (props: { render: () => VNode[] | JSX.Element }) => {
  return props.render();
};

Render.props = {
  render: {
    type: Function,
  },
};

Render.install = (app: App) => {
  app.component('Render', Render);
};

export default Render;
