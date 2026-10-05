import React from 'react';
import {
  Content,
  Header,
  Page,
  Progress,
  ResponseErrorPanel,
  Table,
  ContentHeader,
} from '@backstage/core-components';
import {
  discoveryApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';

type WorkflowRun = {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  html_url: string;
  head_branch: string;
  head_sha: string;
  created_at: string;
  run_started_at: string | null;
};

export const CICDPage = () => {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);

  const { value, loading, error } = useAsync(async (): Promise<WorkflowRun[]> => {
    const baseUrl = await discoveryApi.getBaseUrl('proxy');

    const response = await fetchApi.fetch(
      `${baseUrl}/github-actions/repos/akashcoder02/azure-devops-aks-demo/actions/runs?per_page=20`,
    );

    if (!response.ok) {
      throw new Error(
        `GitHub Actions request failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data.workflow_runs ?? [];
  });

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  const runs = value ?? [];

  return (
    <Page themeId="tool">
      <Header
        title="CI/CD"
        subtitle="GitHub Actions workflow status"
      />
      <Content>
        <ContentHeader title="azure-devops-aks-demo" />

        <Table
          title="Recent Workflow Runs"
          options={{ paging: true, pageSize: 10 }}
          columns={[
            { title: 'Workflow', field: 'name' },
            { title: 'Status', field: 'status' },
            { title: 'Branch', field: 'head_branch' },
            { title: 'Commit', field: 'head_sha' },
            { title: 'Started', field: 'created_at' },
          ]}
          data={runs.map(run => ({
            ...run,
            status:
              run.conclusion === 'success'
                ? '✅ Success'
                : run.status === 'in_progress'
                  ? '🔄 Running'
                  : run.conclusion === 'failure'
                    ? '❌ Failed'
                    : run.conclusion ?? run.status,
            head_sha: run.head_sha.slice(0, 7),
            created_at: new Date(run.created_at).toLocaleString(),
          }))}
        />
      </Content>
    </Page>
  );
};
