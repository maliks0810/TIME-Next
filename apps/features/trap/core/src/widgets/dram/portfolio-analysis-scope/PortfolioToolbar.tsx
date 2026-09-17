import React, { useEffect, useRef, useState, ChangeEvent } from 'react';
import { Input, Button, Checkbox } from 'antd';
import { DownOutlined, StarFilled, UpOutlined, UserOutlined } from '@ant-design/icons';

import styles from './PortfolioToolbar.module.scss';
import { Filters, SelectedFilters, FilterPanel } from './types';

interface ToolbarProps {
  searchText: string;
  filters: Filters;
  selectedFilters: SelectedFilters;
  showMyPortfolios: boolean;
  myPortfolioCount: number;
  showFavPortfolios: boolean;
  onPortfolioSearch: (event: ChangeEvent<HTMLInputElement>) => void;
  onFilterChange: (
    filterName: keyof SelectedFilters,
    values: string[]
  ) => void;
  onClearFilters: () => void;
  onMyPortfolios: () => void;
  onFavPortfolios: () => void;
}

const PortfolioToolbar = ({
  searchText, filters, selectedFilters, showMyPortfolios, myPortfolioCount, showFavPortfolios,
  onPortfolioSearch, onFilterChange, onClearFilters, onMyPortfolios, onFavPortfolios
}: ToolbarProps) => {
  const [openPanel, setOpenPanel] = useState<FilterPanel>(null);
  const togglePanel = (panel: FilterPanel) => {
    setOpenPanel(prev => prev === panel ? null : panel);
  };

  const toolbarRef = useRef<HTMLDivElement>(null);

  // remove filterPanel on clicking outside of panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if(toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setOpenPanel(null);
      };
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const renderPanel = () => {
    switch (openPanel) {
      case "strategy":
        return (
          <Checkbox.Group className={styles.checkboxGroup} options={filters.strategyItems} value={selectedFilters.strategy}
            onChange={(values) => onFilterChange('strategy', values as string[])}/>
        )
      case "benchmark":
        return (
          <Checkbox.Group className={styles.checkboxGroup} options={filters?.benchmarkItems} value={selectedFilters.benchmark}
            onChange={(values) => onFilterChange('benchmark', values as string[])}/>
        )
      case "region":
        return (
          <Checkbox.Group className={styles.checkboxGroup} options={filters.regionItems} value={selectedFilters.region}
            onChange={(values) => onFilterChange('region', values as string[])}/>
        )
      case "account":
        return (
          <Checkbox.Group className={styles.checkboxGroup} options={filters.accountItems} value={selectedFilters.account}
            onChange={(values) => onFilterChange('account', values as string[])}/>
        )
      case "aum":
        return (
          <Checkbox.Group className={styles.checkboxGroup} options={filters.aumItems} value={selectedFilters.aum}
            onChange={(values) => onFilterChange('aum', values as string[])}/>
        )
      default:
        return null;
    }
  }

  return (
    <div className={styles.toolbarContainer} ref={toolbarRef}>
      <div className={styles.toolbarRow}>
        <Input
          allowClear
          placeholder='Search name, ID, strategy, benchmark...'
          className={styles.search}
          onChange={onPortfolioSearch}
          value={searchText}
          onFocus={() => setOpenPanel(null)}
        />        

        <div className={styles.actions}>
          <Button
            color={showMyPortfolios ? "primary" : "default"} 
            variant={showMyPortfolios ? "solid" : "outlined"}
            icon={<UserOutlined />}
            onClick={() => onMyPortfolios()}
          >Me <span>{myPortfolioCount}</span></Button>

          <Button
            color={showFavPortfolios ? "primary" : "default"} 
            variant={showFavPortfolios ? "solid" : "outlined"}
            onClick={() => onFavPortfolios()}
          ><StarFilled /></Button>
        </div>

        {/** Filter Bar */}
        <div className={styles.filterBar}>
          <Button type="text" onClick={() => togglePanel("strategy")}>
            Strategy
            {selectedFilters.strategy?.length > 0 && <>
              <span className={styles.filterCountStyle}>{selectedFilters.strategy?.length}</span>
            </>}
            {openPanel === "strategy" ? <UpOutlined /> : <DownOutlined />}
          </Button>

          <Button type="text" onClick={() => togglePanel("benchmark")}>
            Benchmark
            {selectedFilters.benchmark?.length > 0 && <>
              <span className={styles.filterCountStyle}>{selectedFilters.benchmark?.length}</span>
            </>}
            {openPanel === "benchmark" ? <UpOutlined /> : <DownOutlined />}
          </Button>

          <Button type="text" onClick={() => togglePanel("region")}>
            Region
            {selectedFilters.region?.length > 0 && <>
              <span className={styles.filterCountStyle}>{selectedFilters.region?.length}</span>
            </>}
            {openPanel === "region" ? <UpOutlined /> : <DownOutlined />}
          </Button>

          <Button type="text" onClick={() => togglePanel("account")}>
            Account
            {selectedFilters.account?.length > 0 && <>
              <span className={styles.filterCountStyle}>{selectedFilters.account?.length}</span>
            </>}
            {openPanel === "account" ? <UpOutlined /> : <DownOutlined />}
          </Button>

          <Button type="text" onClick={() => togglePanel("aum")}>
            AUM
            {selectedFilters.aum?.length > 0 && <>
              <span className={styles.filterCountStyle}>{selectedFilters.aum?.length}</span>
            </>}
            {openPanel === "aum" ? <UpOutlined /> : <DownOutlined />}
          </Button>
        </div>

        <div className={styles.actions}>
          <Button onClick={() => {onClearFilters(); setOpenPanel(null)}} color="primary" variant="text">Clear all</Button>
        </div>
      </div>

      {/** Expanded Panel */}
      { openPanel && (
        <div className={styles.filterPanel}>
          {renderPanel()}
        </div>
      )}
    </div>
  )
}

export default PortfolioToolbar;