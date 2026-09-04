import { useCallback, useEffect, useRef } from 'react';
import DataGrid, { Column, DataGridTypes, Paging, Selection } from 'devextreme-react/data-grid';
import type { DataGridRef } from 'devextreme-react/data-grid';
import { StarFilled, StarOutlined } from '@ant-design/icons';
import clsx from 'clsx';

import styles from './Portfoliogrid.module.scss'
import { Portfolio } from './types';

interface PortfoliogridProps {
  portfolios : Portfolio[];
  selectedGridItemKeys: string[];
  sortBy: string;
  favPortfolioIds: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSelectionKeys: (data: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFavoriteClick: (data: any) => void;
}

const Portfoliogrid = ({portfolios, selectedGridItemKeys, sortBy, favPortfolioIds, onSelectionKeys, onFavoriteClick} : PortfoliogridProps) => {
  const gridRef = useRef<DataGridRef>(null);
  const onSelectionChanged = useCallback((data: DataGridTypes.SelectionChangedEvent) => {
    onSelectionKeys(data.selectedRowKeys);
  }, []);

  useEffect(() => {
    if(!gridRef.current || !sortBy) {
      return
    }
    const dataGrid = gridRef.current.instance();
    dataGrid.clearSorting();
    dataGrid.columnOption(sortBy, "sortOrder", "asc");
  }, [sortBy])

  return (
    <div className={clsx('antd-dx-container', styles.gridContainer)}>
      <DataGrid
        ref={gridRef}
        height={"100%"}
        id="gridContainer"
        dataSource={portfolios}
        keyExpr="portfolioNumber"
        allowColumnReordering={true}
        showBorders={false}
        showColumnLines={false}
        selectedRowKeys={selectedGridItemKeys}
        onSelectionChanged={onSelectionChanged}
        >
        <Paging enabled={false} />
        <Selection mode="multiple" showCheckBoxesMode='always' />

        <Column caption='Portfolio' dataField='portfolioName'
          cellRender={({data}) => {
            return (
            <div className={styles.portfolioCell}>
              <div>
                <div className={styles.portfolioTitle}>{data.portfolioName}
                  {data.isMine && (
                    <span className={styles.mineBadge}>
                      MINE
                    </span>
                  )}
                </div>

                <div className={styles.portfolioDetails}>
                  <span>{data.portfolioNumber}</span>
                  <span className={styles.separator}>.</span>
                  <span className={styles.strategy}>{data.strategy}</span>
                  <span className={styles.separator}>.</span>
                  <span>{data.portfolioManagerName}</span>
                </div>
              </div>
            </div>
            )
          }}
        />
        <Column caption='Benchmark' dataField="benchmarkName" />
        <Column caption='AUM' dataField="baseMarketValue" width={100}
        />
        <Column dataField='strategy' visible={false} />
        <Column dataField='portfolioManagerName' visible={false} />
        <Column
          caption=''
          width={60}
          cellRender={({data}) => {
            return ( favPortfolioIds.includes(data.portfolioNumber)
              ? <StarFilled onClick={() => {onFavoriteClick(data)}} /> 
              : <StarOutlined onClick={() => {onFavoriteClick(data)}} />
            )
          }
        }
        />
      </DataGrid>
    </div>
  );
};

export default Portfoliogrid;