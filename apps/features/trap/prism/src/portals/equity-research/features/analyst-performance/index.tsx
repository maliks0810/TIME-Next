/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Checkbox, CheckboxChangeEvent, Radio, Spin } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { getActiveAnalystsLists, getAnalystPerformanceListByDate } from '../../../../lib/services';

import {
  analystPerformanceDataConverter,
  formatAnalystPerformanceLabel,
  getCurrentDate,
  getStartDate,
  formatDate,
} from '../../lib/helpers';
import { AnalystLinesEnum, DateFormatEnum } from '../../lib/types';
import AnalystPBChart from './components/AnalystPBChart';
import { datePeriodOptions } from './lib/constants';
import AnalystKPIsTable from './components/AnalystKPIsTable';
import { PerformanceExport } from './components/PerformanceExport';

export default function AnalystPerformance() {
  const [selectedAnalysts, setSelectedAnalysts] = useState<string[]>([]);
  const [selectedLines, setSelectedLines] = useState<AnalystLinesEnum[]>([
    AnalystLinesEnum.ANALYST_PERFORMANCE,
    AnalystLinesEnum.BENCHMARK_PERFORMANCE,
  ]);

  const [analystsList, setAnalystList] = useState<string[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dateFormat, setDateFormat] = useState(DateFormatEnum.DAY);
  const [originalData, setOriginalData] = useState<any>();

  const [dataSource, setDataSource] = useState<{
    analystPerformanceDataPoints: any;
    excessReturnsDataPoints: any;
    kpiDataPoints: any;
  }>({
    analystPerformanceDataPoints: { dates: [], series: [] },
    excessReturnsDataPoints: { dates: [], labels: [], series: [] },
    kpiDataPoints: null,
  });

  const [selectedDateRange, setSelectedDateRange] = useState<[string, string]>(['', '']);
  const [selectedPeriodKey, setSelectedPeriodKey] = useState<string>('YTD');

  const handleSelectAnalysts = (e: CheckboxChangeEvent) => {
    const { value, checked } = e.target;
    setSelectedAnalysts((prevState) =>
      checked ? [...prevState, value] : prevState.filter((analyst) => analyst !== value)
    );
  };

  useEffect(() => {
    if (originalData) {
      setDataSource(
        analystPerformanceDataConverter({
          data: originalData,
          selectedNames: selectedAnalysts,
          selectedLines,
          selectedPeriodKey,
        })
      );
    }
  }, [selectedAnalysts, selectedLines, originalData, selectedPeriodKey]);

  const handleSelectAllAnalysts = (e: CheckboxChangeEvent) => {
    setSelectedAnalysts(e.target.checked ? analystsList : []);
  };

  const handleSelectLine = (e: CheckboxChangeEvent) => {
    const { value, checked } = e.target;
    setSelectedLines((prevState) =>
      checked ? [...prevState, value] : prevState.filter((line) => line !== value)
    );
  };

  const extractResults = (resp: any) =>
    resp?.data?.equitiesAnalystPerformanceFilter?.results?.results ?? [];

  const handleDateRangeChange = useCallback(
    (e: any) => {
      const periodKey = e.target.value;

      setSelectedPeriodKey(periodKey);
      setIsDataLoading(true);

      const startDate = getStartDate(periodKey);
      const endDate = getCurrentDate();
      setSelectedDateRange([startDate, endDate]);

      getAnalystPerformanceListByDate({ startDate, endDate })
        .then((resp: any) => {
          const results = extractResults(resp);
          setOriginalData(results);

          setDataSource(
            analystPerformanceDataConverter({
              data: results,
              selectedNames: selectedAnalysts,
              selectedLines,
              selectedPeriodKey: periodKey,
            })
          );
        })
        .finally(() => setIsDataLoading(false));

      if (periodKey === '5Y' || periodKey === '10Y' || periodKey === 'Max')
        setDateFormat(DateFormatEnum.MONTH);
      else setDateFormat(DateFormatEnum.DAY);
    },
    [selectedAnalysts, selectedLines]
  );

  useEffect(() => {
    const startDate = getStartDate('YTD');
    const endDate = getCurrentDate();

    setSelectedPeriodKey('YTD');
    setSelectedDateRange([startDate, endDate]);
    setIsDataLoading(true);

    getActiveAnalystsLists().then(({ data }: any) => {
      setAnalystList(data);
    });

    getAnalystPerformanceListByDate({ startDate, endDate })
      .then((resp: any) => {
        const results = extractResults(resp);
        setOriginalData(results);

        setDataSource(
          analystPerformanceDataConverter({
            data: results,
            selectedNames: selectedAnalysts,
            selectedLines,
            selectedPeriodKey: 'YTD',
          })
        );
      })
      .finally(() => setIsDataLoading(false));
  }, []); // keep same mount behavior

  return (
    <div style={{ margin: '24px 3%' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontWeight: 600 }}>US Equity Research Department - Analyst Performance</div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ opacity: 0.8 }}>As of {formatDate(Date())}</div>
          <PerformanceExport
            results={originalData}
            runDate={originalData?.[0]?.performanceMetrics?.asOfDate}
            selectedAnalystNames={selectedAnalysts}
          />
        </div>
      </div>

      <div className="analystPerformanceContainer">
        <div className="componentHighlight analystPerformanceChartContainer">
          <div>
            <h3 style={{ textAlign: 'start' }}>Performance Comparisons</h3>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: 16,
              }}
            >
              <Radio.Group
                options={datePeriodOptions}
                defaultValue="YTD"
                optionType="button"
                buttonStyle="solid"
                onChange={handleDateRangeChange}
                disabled={isDataLoading}
              />

              <div>
                <Checkbox
                  checked={selectedLines.some((line) => line === AnalystLinesEnum.ANALYST_PERFORMANCE)}
                  value={AnalystLinesEnum.ANALYST_PERFORMANCE}
                  onChange={handleSelectLine}
                >
                  Performance
                </Checkbox>
                <Checkbox
                  checked={selectedLines.some((line) => line === AnalystLinesEnum.BENCHMARK_PERFORMANCE)}
                  value={AnalystLinesEnum.BENCHMARK_PERFORMANCE}
                  onChange={handleSelectLine}
                >
                  Benchmark
                </Checkbox>
                <Checkbox
                  checked={selectedLines.some((line) => line === AnalystLinesEnum.EXCESS_RETURN)}
                  value={AnalystLinesEnum.EXCESS_RETURN}
                  onChange={handleSelectLine}
                >
                  Excess Return
                </Checkbox>
              </div>
            </div>

            {isDataLoading ? (
              <div className="analystPerformanceSpinContainer">
                <Spin size="large" />
              </div>
            ) : (
              <AnalystPBChart chartData={dataSource.analystPerformanceDataPoints} dateFormat={dateFormat} />
            )}

            <h3 style={{ textAlign: 'start' }}>Excess Returns</h3>

            {isDataLoading ? (
              <div className="analystPerformanceSpinContainer">
                <Spin size="large" />
              </div>
            ) : (
              <AnalystPBChart
                chartData={dataSource.excessReturnsDataPoints}
                dateFormat={dateFormat}
                isAnnualChart
              />
            )}
          </div>
        </div>

        <div className="analystPerformanceRightSideContainer">
          <div className="componentHighlight analystPerformanceCheckboxesContainer">
            <Checkbox
              indeterminate={selectedAnalysts.length > 0 && selectedAnalysts.length < analystsList.length}
              onChange={handleSelectAllAnalysts}
              checked={analystsList.length === selectedAnalysts.length && analystsList.length > 0}
            >
              <span style={{ fontWeight: 'bold' }}>Select All</span>
            </Checkbox>

            {analystsList.map((name) => (
              <Checkbox
                key={name}
                checked={selectedAnalysts.some((selectedAnalystName) => selectedAnalystName === name)}
                value={name}
                onChange={handleSelectAnalysts}
                style={{ paddingTop: 4 }}
              >
                {formatAnalystPerformanceLabel(name)}
              </Checkbox>
            ))}
          </div>

          <br />

          <div className="componentHighlight analystPerformanceKpisContainer">
            <h3 style={{ fontWeight: 'bold', textAlign: 'left' }}>KPI Comparison</h3>
            <div style={{ marginTop: 8 }}>
              <AnalystKPIsTable
                kpiData={dataSource.kpiDataPoints}
                selectedRange={selectedPeriodKey}
                loading={isDataLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}