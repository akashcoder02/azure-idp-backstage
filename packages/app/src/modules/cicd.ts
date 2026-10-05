import { createFrontendModule, PageBlueprint } from '@backstage/frontend-plugin-api';

const cicdPage = PageBlueprint.make({
  params: {
    path: '/cicd',
    loader: () =>
      import('../components/cicd/CICDPage').then(m => (
        <m.CICDPage />
      )),
  },
});

export default createFrontendModule({
  pluginId: 'app',
  extensions: [cicdPage],
});
