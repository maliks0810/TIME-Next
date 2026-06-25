import React, { useMemo } from 'react'
import { Card, Col, Row, Statistic, Space, Tag } from 'antd'
import { SafetyCertificateOutlined } from '@ant-design/icons'
import type { ImportRow, MergeLogRow, Persona, RecomputeResultRow, Role } from '../lib/types'
import { msToHuman, safeText, tryIsoDiffMs } from '../lib/utils'


export default function KpiBand({ persona, role, imports, mergeLogs, recompute }: {
  persona: Persona;
  role: Role;
  imports: ImportRow[];
  mergeLogs: MergeLogRow[];
  recompute: RecomputeResultRow[];
}) {
  const kpis = useMemo(() => {
    const totalImports = imports.length;
    const latestIngest = imports.map(x => x.ingestedAtUtc).filter(Boolean).sort().slice(-1)[0];

    const done = mergeLogs.filter(l => ['SUCCESS', 'FAILED', 'SKIPPED'].includes(l.status));
    const success = done.filter(l => l.status === 'SUCCESS').length;
    const successPct = done.length ? Math.round((success / done.length) * 100) : 0;

    const latestMerge = mergeLogs.map(x => x.completedAtUtc || x.startedAtUtc).filter(Boolean).sort().slice(-1)[0];
    const mergeDurations = mergeLogs.map(l => tryIsoDiffMs(l.startedAtUtc, l.completedAtUtc)).filter((x): x is number => typeof x === 'number' && x > 0);
    const avgMergeMs = mergeDurations.length ? Math.round(mergeDurations.reduce((a, b) => a + b, 0) / mergeDurations.length) : undefined;

    const recomputeDone = recompute.filter(r => ['SUCCESS', 'FAILED'].includes(r.status));
    const recomputeSuccessPct = recomputeDone.length ? Math.round((recomputeDone.filter(r => r.status === 'SUCCESS').length / recomputeDone.length) * 100) : 0;
    const latestRecompute = recompute.map(x => x.recomputedAtUtc).filter(Boolean).sort().slice(-1)[0];
    const durations = recompute.map(x => x.durationMs).filter((x): x is number => typeof x === 'number' && x > 0);
    const avgRecomputeMs = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : undefined;

    return { totalImports, latestIngest, successPct, latestMerge, avgMergeMs, recomputeSuccessPct, latestRecompute, avgRecomputeMs };
  }, [imports, mergeLogs, recompute]);

  return (
    <Card
      size="small"
      style={{ marginTop: 12, borderRadius: 20 }}
      title={
        <Space>
          <SafetyCertificateOutlined />
          Monitoring Summary
          <Tag color="blue">Persona: {persona}</Tag>
          <Tag color="purple">Role: {role}</Tag>
        </Space>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}><Statistic title="Rows Ingested (Import table)" value={kpis.totalImports} /></Col>
        <Col xs={12} md={6}><Statistic title="Latest Ingest (UTC)" value={safeText(kpis.latestIngest)} /></Col>
        <Col xs={12} md={6}><Statistic title="Merge Success %" value={kpis.successPct} suffix="%" /></Col>
        <Col xs={12} md={6}><Statistic title="Avg Merge Duration" value={msToHuman(kpis.avgMergeMs)} /></Col>
        <Col xs={12} md={6}><Statistic title="Latest Merge (UTC)" value={safeText(kpis.latestMerge)} /></Col>
        <Col xs={12} md={6}><Statistic title="Recompute Success %" value={kpis.recomputeSuccessPct} suffix="%" /></Col>
        <Col xs={12} md={6}><Statistic title="Avg Recompute Duration" value={msToHuman(kpis.avgRecomputeMs)} /></Col>
        <Col xs={12} md={6}><Statistic title="Latest Recompute (UTC)" value={safeText(kpis.latestRecompute)} /></Col>
      </Row>
    </Card>
  );
}
