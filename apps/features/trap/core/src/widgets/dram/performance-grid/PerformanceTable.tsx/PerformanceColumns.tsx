// Currently Not deploying this functionality to production. Skip code review

import type React from 'react';

import { PeriodColumns } from './PeriodColumns';

interface Props {
  ColumnComponent: React.ElementType;
}

export const formatPercent = ({value}: {value: unknown}) => {
  if(value === null || value == undefined) {
    return '-'
  }

  return `${Number(value).toFixed(2)}%`;
}

export const formatNumber = ({value}: {value: unknown}) => {
  if(value === null || value == undefined) {
    return '-'
  }

  return Number(value).toFixed(2);
}

export function PerformanceColumns({
  ColumnComponent: Column,
} : Props) {
  return (<>
    {/* Security Breakdown */}
    <Column
      dataField="name"
      caption="Security"
      width={220}
      fixed
      fixedPosition="left"
      alignment="left"
    />

    {/* Characteristics */}
    <Column 
      caption='CHARACTERISTICS'
      alignment="center"
    >
      <Column
        dataField="weight"
        caption="WEIGHT%"
        width={92}
        alignment="right"
        customizeText={formatPercent}
      />
      <Column
        dataField="benchmarkWeight"
        caption="R1000 GROWTH WT"
        width={120}
        alignment="right"
        customizeText={formatPercent}
      />
      <Column
        dataField="activeWeight"
        caption="ACTIVE WT"
        width={92}
        alignment="right"
        customizeText={formatPercent}
      />
      <Column
        dataField="beta"
        caption="BETA"
        width={75}
        alignment="right"
        customizeText={formatNumber}
      />
      <Column
        dataField="dividentYeild"
        caption="DIV YLD"
        width={90}
        alignment="right"
        customizeText={formatPercent}
      />
      <Column
        dataField="pe"
        caption="P/E"
        width={75}
        alignment="right"
        customizeText={formatPercent}
      />
    </Column>

    {/* Periods */}
    <PeriodColumns
      periodKey="wtd"
      caption="WTD"
    />

    <PeriodColumns
      periodKey="mtd"
      caption="MTD"
    />

    <PeriodColumns
      periodKey="qtd"
      caption="QTD"
    />

    <PeriodColumns
      periodKey="ytd"
      caption="YTD"
    />

    <PeriodColumns
      periodKey="itd"
      caption="ITD"
    />

    <PeriodColumns
      periodKey="1m"
      caption="1Y"
    />

    <PeriodColumns
      periodKey="3m"
      caption="3M"
    />

    <PeriodColumns
      periodKey="6m"
      caption="6M"
    />

    <PeriodColumns
      periodKey="1y"
      caption="1Y"
    />

    <PeriodColumns
      periodKey="3y"
      caption="3Y"
    />

    <PeriodColumns
      periodKey="5y"
      caption="5Y"
    />

    <PeriodColumns
      periodKey="10y"
      caption="10Y"
    />
  </>)
}