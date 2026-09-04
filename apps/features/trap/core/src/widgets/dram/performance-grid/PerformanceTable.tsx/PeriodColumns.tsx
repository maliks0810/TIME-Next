// Currently Not deploying this functionality to production. Skip code review

import { Column } from 'devextreme-react/tree-list';

interface PeriodColumnProps {
  periodKey: string;
  caption: string
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

export function PeriodColumns ({periodKey, caption}: PeriodColumnProps) {
  return (<>
    <Column 
      key={periodKey}
      caption={caption}
      alignment="center"
    >
      <Column
        dataField={`${periodKey}_contribution`}
        caption="CONTRIB"
        width={85}
        alignment="right"
        customizeText={formatPercent}
      />
      <Column
        dataField={`${periodKey}_activeContribution`}
        caption="ACT.CON"
        width={85}
        alignment="right"
        customizeText={formatPercent}
      />
      <Column
        dataField={`${periodKey}_return`}
        caption="RETURN"
        width={85}
        alignment="right"
        customizeText={formatPercent}
      />
      <Column
        dataField={`${periodKey}_benchmarkReturn`}
        caption="R1000 GROWTH"
        width={85}
        alignment="right"
        customizeText={formatPercent}
      />
      <Column
        dataField={`${periodKey}_activeReturn`}
        caption="ACTIVE"
        width={85}
        alignment="right"
        customizeText={formatPercent}
      />
    </Column>
  </>
  )
}