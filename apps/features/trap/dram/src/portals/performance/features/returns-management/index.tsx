import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Card,
  Space,
  Spin,
  Tabs,
  message,
} from 'antd';
import "devextreme/dist/css/dx.light.css";
import type { TabsProps } from 'antd';
import {
  ErrorLogRow,
  ImportRow,
  MergeLogRow,
  Persona,
  RecomputeResultRow,
  Role
} from './lib/types';
import ImportUploadCard from './components/ImportUploadCard';
import ImportTable from './components/ImportTable';
import { allow, getRoleByOrg, RBAC } from './lib/rbac';
import MergeLogTable from './components/MergeLogTable';
import ErrorLogTable from './components/ErrorLogTable';
import RecomputeResultsTable from './components/RecomputeResultsTable';
import MergeDetailsDrawer from './components/MergeDetailsDrawer';
import CsvPreviewModal from './components/CsvPreviewModal';
import { showInfoMessage } from './lib/notifications';
import { getImports, getMergeLogs } from './lib/services';
import { useUserInfo } from '@platform/utils';

message.config({ duration: 5 });

export default function ReturnsOverlayUpload() {
  const { claims } = useUserInfo();

  const [role, setRole] = useState<Role>('R2-Developer-ReadWrite');
  const [persona, setPersona] = useState<Persona>('Ops');
  const [noPermission,setNoPermission] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [imports, setImports] = useState<ImportRow[]>([]);
  const [mergeLogs, setMergeLogs] = useState<MergeLogRow[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLogRow[]>([]);
  const [recompute, setRecompute] = useState<RecomputeResultRow[]>([]);

  useEffect(() => {
    if (claims?.OrgLevel4) {
      void loadAll();
    }
  }, [claims?.OrgLevel4]);

  const loadAll = async () => {
    if (!claims?.OrgLevel4) return;

    const resolvedRole = getRoleByOrg(claims.OrgLevel4) as Role;
    if(resolvedRole === undefined){
      const resolvedRole1 = getRoleByOrg(claims.OrgLevel1) as Role
      if(resolvedRole1 !== undefined)
        setRole(resolvedRole1);
    }
    else{
      setRole(resolvedRole);
      if(resolvedRole === 'None')
        setNoPermission('You have no permission to view the page');
        message.warning('You do not have permission to preview CSV.');
    }

    if (resolvedRole === 'PMRA-Analyst-ReadWrite') {
      setPersona('PerformanceAnalyst');
    } else if (resolvedRole === 'R2-Developer-ReadWrite') {
      setPersona('Ops');
    }

    try {
      setLoading(true);

      const [importsRes, mergeRes] = await Promise.allSettled([
        getImports(),
        getMergeLogs(),
      ]);

      if (importsRes.status === 'fulfilled') {
        setImports(importsRes.value.data.results ?? []);
      } else {
        message.error('Failed to load imports');
      }

      if (mergeRes.status === 'fulfilled') {
        setMergeLogs(mergeRes.value.data.results ?? []);
      } else {
        message.error('Failed to load merge logs');
      }

      setErrorLogs([]);
      setRecompute([]);
    } finally {
      setLoading(false);
    }
  };

  const [csvOpen, setCsvOpen] = useState(false);
  const [csvTitle, setCsvTitle] = useState('');
  const [csvText, setCsvText] = useState('');
  const [csvLoading, setCsvLoading] = useState(false);

  const openCsvPreview = async (row: ImportRow) => {
    if (!allow(role, RBAC.actions.csvPreview)) {
      message.warning('You do not have permission to preview CSV.');
      return;
    }

    try {
      setCsvTitle(row.fileName);
      setCsvText('');
      setCsvOpen(true);
      setCsvLoading(true);

      setCsvText('result');
    } catch {
      setCsvText('Failed to load CSV.');
    } finally {
      setCsvLoading(false);
    }
  };

  const onUpload = async (info: string): Promise<ImportRow[]> => {
    try {
      setUploading(true);
      showInfoMessage(info);

      const importsRes = await getImports();
      const newRows = importsRes?.data.results ?? [];
      setImports(newRows);

      return newRows;
    } finally {
      setUploading(false);
    }
  };

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedMerge, setSelectedMerge] = useState<MergeLogRow | null>(null);

  const onDrill = (row: MergeLogRow) => {
    setSelectedMerge(row);
    setDrawerOpen(true);
  };

  const tabItems = useMemo<NonNullable<TabsProps['items']>>(() => {
    const items: NonNullable<TabsProps['items']> = [];

    if (allow(role, RBAC.tabs.imports)) {
      items.push({
        key: 'imports',
        label: (
          <Space size={6}>
            Import Data <Badge count={imports.length} size="small" />
          </Space>
        ),
        children: (
          <Space direction="vertical" style={{ width: '100%' }}>
            <ImportUploadCard
              persona={persona}
              role={role}
              uploading={uploading}
              onUpload={onUpload}
            />
            <ImportTable
              role={role}
              persona={persona}
              rows={imports}
            />
          </Space>
        ),
      });
    }

    if (allow(role, RBAC.tabs.merge)) {
      items.push({
        key: 'merge',
        label: (
          <Space size={6}>
            Merge Log <Badge count={mergeLogs.length} size="small" />
          </Space>
        ),
        children: (
          <MergeLogTable
            role={role}
            persona={persona}
            rows={mergeLogs}
            onDrill={onDrill}
          />
        ),
      });
    }

    if (allow(role, RBAC.tabs.errors)) {
      items.push({
        key: 'errors',
        label: (
          <Space size={6}>
            Error Log <Badge count={errorLogs.length} size="small" />
          </Space>
        ),
        children: (
          <ErrorLogTable role={role} rows={errorLogs} />
        ),
      });
    }

    if (allow(role, RBAC.tabs.recompute)) {
      items.push({
        key: 'recompute',
        label: (
          <Space size={6}>
            Recompute Results <Badge count={recompute.length} size="small" />
          </Space>
        ),
        children: (
          <RecomputeResultsTable role={role} rows={recompute} />
        ),
      });
    }

    return items;
  }, [
    role,
    persona,
    uploading,
    imports,
    mergeLogs,
    errorLogs,
    recompute,
  ]);

  return (

    <Card style={{ borderRadius: 24 }}>
      <Spin spinning={loading} style={{ marginTop: 12 }}>
        <div>{noPermission}</div>
        <Tabs items={tabItems} />
      </Spin>

      <MergeDetailsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        selectedMerge={selectedMerge}
        errorLogs={errorLogs}
        imports={imports}
        role={role}
        onPreviewCsv={openCsvPreview}
      />

      <CsvPreviewModal
        open={csvOpen}
        title={csvTitle}
        loading={csvLoading}
        text={csvText}
        onClose={() => setCsvOpen(false)}
      />
    </Card>
  );
}