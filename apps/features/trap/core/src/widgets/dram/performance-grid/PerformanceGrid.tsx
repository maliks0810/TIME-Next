// Currently Not deploying this functionality to production. Skip code review

import { useEffect, useMemo } from 'react';
import { Divider } from 'antd';

import { WidgetComponentProps } from '../../../types/widget';
import styles from './PerformanceGrid.module.scss';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import { useGetWidgetValueArray } from '../../../state/Widgets/hooks';
// import { useSetWidgetValue } from '../../../state/Widgets/hooks';
// import { useGetActiveTab } from '../../../state/Tabs/hooks';

import PerformanceGridHeader from './PerformanceGridHeader';
import { PerformanceTable } from './PerformanceTable.tsx/PerformanceTable';

export const PerformanceGrid = ({
  widgetInstance: { config = {} },
  // loading,
  // error,
  result,
  execute,
  // mode,
}: WidgetComponentProps) => {
  console.log("config", config);
  console.log("result from datagrid", result);
  const key = config.params?.emitsKeys;
  const channelId = config.params?.channel;
  const operation = config.params?.operation;
  console.log(key, channelId);
  console.log("operation", operation);

  const listensToKeys = useMemo(
      () =>
          Array.isArray(config?.params?.listensToKeys)
              ? config?.params?.listensToKeys
              : [config?.params?.listensToKeys],
      [config?.params?.listensToKeys]
  );
  // const selectionMode = config?.params?.selectionMode;

  const context = useGetWidgetValueArray({
      channelId: config.params?.channel,
      keys: listensToKeys
  });

  console.log("context from PerformanceGrid", context);

  // State communication
  // const setWidgetValueToChannel = useSetWidgetValue();
  // const activeTab = useGetActiveTab();

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const subscribedValues = useMemo(
    () =>
      listensToKeys
        ? listensToKeys.reduce(
          (acc: any, cur: string) => ({ ...acc, [cur]: context?.[cur] || null }),
          {}
        )
        : {},
    [context, listensToKeys]
  );

  console.log("subscribedValues", subscribedValues);

  useEffect(() => {
    console.log("subscribedValues in useEffect", subscribedValues);
    if (subscribedValues && listensToKeys) {
      execute?.({ ...subscribedValues.pacInputs }, { ...subscribedValues.pacInputs });
    }
  }, [subscribedValues, listensToKeys]);

  return (
    <WidgetCardShell>
      <div className={styles.performanceGrid}>
        <PerformanceGridHeader 
          portfolioName={subscribedValues.pacInputs?.portfolioName} 
          benchmarkName={subscribedValues.pacInputs?.benchmarkName} 
          startDate={subscribedValues.pacInputs?.startDate}
          endDate={subscribedValues.pacInputs?.endDate}
          linkAsOf={false}
        />

        <Divider />

        <PerformanceTable />
      </div>
    </WidgetCardShell>
  )
}