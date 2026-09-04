import { useCallback, useEffect, useMemo, useRef, useState, ChangeEvent } from 'react';
import { Button, Divider, Input, Select, message } from 'antd';
import { DatePicker, DatePickerProps } from 'antd';
import { AppstoreOutlined, CheckCircleFilled, CloseOutlined, DeleteOutlined, DownOutlined, SettingOutlined, StarFilled, UpOutlined } from '@ant-design/icons';
import clsx from 'clsx';
import type { DefaultOptionType } from 'antd/es/select';

import { WidgetComponentProps } from '../../../types/widget';
import styles from './PortfolioAnalysisScope.module.scss';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import { useSetWidgetValue } from '../../../state/Widgets/hooks';
import { useGetActiveTab } from '../../../state/Tabs/hooks';
import PortfolioToolbar from './PortfolioToolbar';
import Portfoliogrid from './Portfoliogrid';
import { Group, Portfolio, SelectedFilters, Filters, PACWidgetEmitValues} from './types';
import { sampleGroups } from './mockData';

type DateType = DatePickerProps['value'];

{/* Commented the Share functionality as are not going to deploy it now. */}
// const customPeriods: CustomPeriod[] = [
//   { key: "CUST1", label: "Since Inception", kind: "itd", factor: 3.2, seed: 11 },
// ];

export const PortfolioAnalysisScope = ({
    widgetInstance: { config = {} },
    // loading,
    // error,
    result,
    // execute,
    // mode,
}: WidgetComponentProps) => {
  const key = config.params?.emitsKeys;
  const channelId = config.params?.channel;
  const dateFormat = config.params?.dateFormat || 'YYYY-MM-DD';

  // State communication
  const setWidgetValueToChannel = useSetWidgetValue();
  const activeTab = useGetActiveTab();

  const [messageApi, contextHolder] = message.useMessage();
  const [showPortfolioContainer, setShowPortfolioContainer] = useState(false);
  const [showPortfolioGroupsSection, setShowPortfolioGroupsSection] = useState(false);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [showDeleteConfirmMessage, setShowDeleteConfirmMessage] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("name");
  {/* Commented the Share functionality as are not going to deploy it now. */}
  // const [showPortfolioShare, setShowPortfolioShare] = useState<boolean>(false);
  // const [shareResult, setShareResult] = useState<ShareResult | null>(null);
  const [showMyPortfolios, setShowMyPortfolios] = useState<boolean>(false);
  const [showFavPortfolios, setShowFavPortfolios] = useState<boolean>(false);
  const [favPortfolioIds, setFavPortfolioIds] = useState<string[]>(() => {
    const savedFavorites = localStorage.getItem("favPortfolioIds");
    return savedFavorites ? JSON.parse(savedFavorites): [];
  });
  
  const [filters, setFilters] = useState<Filters>({
    strategyItems: [],
    benchmarkItems: [],
    regionItems: [],
    accountItems: [],
    aumItems: []
  });

  const [selectedGridItemKeys, setSelectedGridItemKeys] = useState<string[]>([]); 

  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroup, setNewGroup] = useState<Group | null>(
    {name: 'Untitled group', portfolioSelectionIds: []}
  );
  const [showOnlyGroup, setShowOnlyGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const [searchText, setSearchText] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    strategy: [], benchmark: [], region: [], account: [], aum: []
  });

  const [widgetEmitValues, setWidgetEmitValues] = useState<PACWidgetEmitValues>({
    portfolioScope: "all",
    assetClass: "EQ",
    frequency: "monthly",
    breakdown: "GICS1",
    portfolio: "",
    portfolioName: "",
    benchmarkCode: "",
    benchmarkName: "",
    secondaryBenchmarkCode: "",
    secondaryBenchmarkname: "",
    periodList: "MTD,QTD,YTD",
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    setWidgetValueToChannel({
      channelId,
      key,
      activeTab,
      value: widgetEmitValues,
    });
  }, [widgetEmitValues])

  const getUserInfo = () => {
    const octaTokenStorage = localStorage.getItem('okta-token-storage');
    if(octaTokenStorage) {
      const userInfo = JSON.parse(octaTokenStorage);
      return userInfo;
    }
  }

  const getUserId = () => getUserInfo().accessToken.claims.ad_samaccountname;

  useEffect(() => {
    const items = Array.isArray(result?.items) ? result?.items as Portfolio[] : [];
    items?.forEach((portfolio: Portfolio) => {      
      if(portfolio.pmLoginName === getUserId()) {
        portfolio.isMine = true;
      }
    });

    setPortfolios(items)
  }, [result]);

  useEffect(() => {
    setFilters({
      strategyItems: [...new Set(portfolios.map(portfolio => portfolio.strategy).filter(strategy => strategy != null))],
      benchmarkItems: [...new Set(portfolios.map(portfolio => portfolio.benchmarkCode).filter(benchmarkCode => benchmarkCode != null))],
      regionItems: [...new Set(portfolios.map(portfolio => portfolio.region).filter(region => region != null))],
      accountItems: [...new Set(portfolios.map(portfolio => portfolio.account).filter(account => account != null))],
      aumItems: ['<$1B', '$1-5B', '$5-20B', '>$20B']
    })
  }, [portfolios]);

  useEffect(() => {
    const storedGroups = localStorage.getItem("portfolioGroups");
    if(storedGroups) {
       try {
        const parsedGroups : Group[] = JSON.parse(storedGroups);
        setGroups(parsedGroups);
        if(parsedGroups.length > 0) {
          setNewGroup(null);
          setSelectedGroup(parsedGroups[0])
          setSelectedGridItemKeys(parsedGroups[0].portfolioSelectionIds!);
        } else {
          setSelectedGroup(newGroup);
        }
      } catch {
        console.log("Failed to load groups");
      }
    } else {
      setSelectedGroup(newGroup);
    }
  }, []);

  useEffect(() => {
    if(groups.length && !newGroup) {
      setShowPortfolioGroupsSection(false);
    }
  }, [groups, newGroup]);

  useEffect(() => {
    localStorage.setItem("favPortfolioIds", JSON.stringify(favPortfolioIds));
  }, [favPortfolioIds]);

  useEffect(() => {
    setNewGroup(prev => {
      if(!prev) {
        return prev;
      }
      return {...prev,
        portfolioSelectionIds: selectedGridItemKeys
      };
    })
  }, [selectedGridItemKeys]);

  
  const portfolioSelectionRef = useRef<HTMLDivElement>(null);

  const filteredPortfolios = useMemo(() => {
    const search = searchText?.trim().toLowerCase();

    return portfolios.filter((portfolio: Portfolio) => {
      // search filter
      const matchesSearch = 
        !search || 
        portfolio?.portfolioName?.toLowerCase().includes(search) || 
        portfolio?.portfolioNumber?.toLowerCase().includes(search) ||
        portfolio?.strategy?.toLowerCase().includes(search) ||
        portfolio?.benchmarkName?.toLowerCase().includes(search) ||
        portfolio?.benchmarkCode?.toLowerCase().includes(search) ||
        portfolio?.secondaryBenchmarkName?.toLowerCase().includes(search) ||
        portfolio?.secondaryBenchmarkCode?.toLowerCase().includes(search);

      // strategy filter
      const matchesStrategy = 
        selectedFilters.strategy.length === 0 ||
        selectedFilters.strategy.includes(portfolio.strategy ?? '');

      // benchmark filter
      const matchesBenchmark = 
        selectedFilters.benchmark?.length === 0 ||
        selectedFilters.benchmark.includes(portfolio.benchmarkCode ?? '');
        
      // region filter
      const matchesRegion = 
        selectedFilters.region?.length === 0 ||
        selectedFilters.region.includes(portfolio.region ?? '');

      // account filter
      const matchesAccount = 
        selectedFilters.account?.length === 0 ||
        selectedFilters.account.includes(portfolio.account ?? '');

      // aum filter
      const matchesAum = 
        selectedFilters.aum?.length === 0 ||
        selectedFilters.aum.some((aumFilter) => {
          const aum = Number(portfolio.baseMarketValue);

          switch(aumFilter) {
            case "<$1B":
              return aum < 1;
            case "$1-5B":
              return aum >= 1 && aum <= 5;
            case "$5-20B":
              return aum >= 5 && aum < 20;
            case ">$20B":
              return aum >= 20;
            default:
              return false;
          }
        })

      // in this group / show all filter
      const matchesShowOnlyGroup = 
      !showOnlyGroup ||
      selectedGroup?.portfolioSelectionIds!.includes(portfolio.portfolioNumber);

      const matchesShowMyPortfolios = !showMyPortfolios || portfolio.pmLoginName === getUserId();

      const matchesShowFavPortfolios = !showFavPortfolios || favPortfolioIds.includes(portfolio.portfolioNumber);

      // All conditions must match
      return (
        matchesSearch &&
        matchesStrategy &&
        matchesBenchmark &&
        matchesRegion &&
        matchesAccount &&
        matchesAum &&
        matchesShowOnlyGroup &&
        matchesShowMyPortfolios &&
        matchesShowFavPortfolios
      )
    });
  }, [portfolios, searchText, selectedFilters, showOnlyGroup, showMyPortfolios, showFavPortfolios]);

  const handleScopeChange = useCallback(
    (value: string) => {
      setWidgetEmitValues(prev => ({
        ...prev,
        portfolioScope: value
      }));
    }, []
  );

  const handlePortfolioChange = useCallback(
    (value: string, option?: DefaultOptionType) => {
      setWidgetEmitValues(prev => ({
        ...prev,
        portfolioName: option?.label as string,
        portfolio: value
      }));
    }, []
  );

  const handleBenchMarkChange = useCallback(
    (value: string, option?: DefaultOptionType) => {
      if(!option) return;
      setWidgetEmitValues(prev => ({
        ...prev,        
        benchmarkCode: value,
        benchmarkName: option.label as string,
      }));
    }, []
  );

  const handleCompareVsChange = useCallback(
    (value: string, option?: DefaultOptionType) => {
      setWidgetEmitValues(prev => ({
        ...prev,
        secondaryBenchmarkCode: value,
        secondaryBenchmarkName: option?.label as string
      }));
    }, []
  );

  const handleAsOfDateChange = useCallback(
    (date: DateType) => {
      setWidgetEmitValues(prev => ({
        ...prev,
        startDate: date?.format(dateFormat) ?? ""
      }));
    },
    []
  );

  const handleCompareDateChange = useCallback(
    (date: DateType) => {
      setWidgetEmitValues(prev => ({
        ...prev,
        endDate: date?.format(dateFormat) ?? ""
      }));
    },
    []
  );

  const showPortfolioGroups = () => {
    setShowPortfolioGroupsSection(true);
    if(!newGroup) {
      const group : Group = {
        name: 'Untitled group',
        portfolioSelectionIds: []
      };
      setNewGroup(group);
      setSelectedGroup(group)
    }
  }

  const handleGroupNameChange = (value: string) => {
    if(!selectedGroup) return;

    const updatedGroup: Group = {
      ...selectedGroup,
      name: value
    };

    setSelectedGroup(updatedGroup);

    if(updatedGroup.id !== undefined) {
      setGroups(prev => prev.map(group =>
        group.id === updatedGroup.id ? updatedGroup : group
      ));
    } else  {
      setNewGroup(updatedGroup);
    }
  }

  const handleCreateNewGroup = () => {
    const group : Group = {
      name: 'Untitled group',
      portfolioSelectionIds: []
    };
    setNewGroup(group);
    setSelectedGroup(group);
    setSelectedGridItemKeys([]);
  }

  const handleSaveGroup = () => {
    if(!newGroup) {
      return;
    }

    const newId = crypto.randomUUID();

    const groupToSave: Group = {
      id: newId,
      name: newGroup.name.trim(),
      portfolioSelectionIds: newGroup.portfolioSelectionIds
    };

    const updatedGroups = [...groups, groupToSave];

    // Update react state
    setGroups(updatedGroups)

    // Save to localstorage
    localStorage.setItem("portfolioGroups", JSON.stringify(updatedGroups));

    setSelectedGroup(groupToSave);

    //Clear draft
    setNewGroup(null);

    messageApi.success('Group saved successfully.');
  }

  const handleDeleteGroup = () => {
    if(!selectedGroup) {
      return;
    }

    // if selected group is the unsaved new group
    if(!selectedGroup.id) {
      setNewGroup(null);
      
      // Select the previous/saved group if one exists
      if(groups.length > 0) {
        const previousGroup = groups[groups.length - 1];
        setSelectedGroup(previousGroup);
        setSelectedGridItemKeys(previousGroup.portfolioSelectionIds ?? []);
      } else {
        setSelectedGroup(null);
        setSelectedGridItemKeys([]);
      }
      return;
    }    

    // find the selected group's index
    const selectedIndex = groups.findIndex(group => group.id === selectedGroup.id);

    if(selectedIndex === -1) {
      return;
    }

    // Remove selected group
    const updatedGroups = groups.filter(group => group.id !== selectedGroup.id);

    // Decide which group to select next
    let groupToSelect: Group | null = null;

    if(updatedGroups.length > 0) {
      // if there a group at the same index, that is the NEXT group
      // Otherwise select the PREVIOUS group
      if(selectedIndex < updatedGroups.length) {
        groupToSelect = updatedGroups[selectedIndex];
      } else {
        groupToSelect = updatedGroups[updatedGroups.length - 1];
      }
    }

    // save updated groups
    setGroups(updatedGroups);

    localStorage.setItem('portfolioGroups', JSON.stringify(updatedGroups));

    if(groupToSelect) {
      setSelectedGroup(groupToSelect);
      setSelectedGridItemKeys(groupToSelect.portfolioSelectionIds ?? []);
    } else {
      // No groups remaining
      setSelectedGroup(null);
      setSelectedGridItemKeys([]);
    }

    messageApi.success('Group deleted successfully.');
  }

  const handleOnGroupSelect = (selectedGroup: Group) => {
    setSelectedGroup(selectedGroup);
    setSelectedGridItemKeys(selectedGroup.portfolioSelectionIds!)
  }

  const handlePortfolioContainer = () => {
    setShowPortfolioContainer(!showPortfolioContainer);

    const storedGroups = localStorage.getItem("portfolioGroups");
    if(!storedGroups) { 
      setNewGroup(prev => ({
        ...prev,
        name: "Untitled group",
        portfolioSelectionIds: []
      }));
    }
  }

  const handlePortfolioSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  }

  const handleClearFilters = () => {
    setSelectedFilters({
      strategy: [],
      benchmark: [],
      region: [],
      account: [],
      aum: []
    });
    setSearchText('');
  }

  const handleGridSelectionKeys = (selectedItems: string[]) => {
    setSelectedGridItemKeys(selectedItems);
    setSelectedGroup(prev => {
      if(!prev) {
        return prev;
      }
      return {
        ...prev,
        portfolioSelectionIds: selectedItems
      }
    });
  }

  const handleFavoritePortfolio = (data: Portfolio) => {
    setFavPortfolioIds((prev: string[]) => {
      if(prev.includes(data.portfolioNumber)) {
        return prev.filter(id => id !== data.portfolioNumber)
      }

      return [...prev, data.portfolioNumber]
    })
  }

  const handleAddAllFiltered = () => {
    if(!selectedGridItemKeys.length) {
        setSelectedGridItemKeys(filteredPortfolios.map(portfolio => portfolio.portfolioNumber));
    }    
  }

  const scopeOptions = [
    { label: "Quick run",
      options: [
        {
          label : (
            <span>
              <StarFilled /> All TCW Portfolios ({portfolios?.length})
            </span>
          ),
          value: 'all'
        }
      ]
    },
    {
      label: "Your groups",
      options: groups.map(group => ({
        label : (
            <span>
              {group.name} ({group.portfolioSelectionIds?.length ?? 0})
            </span>
          ),
        value: group.id
      }))
    }
  ];

  const sortingOptions = [
    {label: "Name", value: 'portfolioName'},
    {label: "AUM", value: 'baseMarketValue'},
    {label: "Strategy", value: 'strategy'},
    {label: "Manager", value: 'portfolioManagerName'},
  ];

  const portfoliosOptions: DefaultOptionType[] = useMemo(() => {
    if(widgetEmitValues.portfolioScope && widgetEmitValues.portfolioScope !== 'all') {
      const selectedGroupFromScope = groups.find(group => group.id === widgetEmitValues.portfolioScope)!;
      return Array.from(new Map(portfolios.filter(portfolio => portfolio.portfolioName && portfolio.portfolioNumber && selectedGroupFromScope.portfolioSelectionIds?.includes(portfolio.portfolioNumber))
        .map(portfolio => [portfolio.portfolioNumber, {label: portfolio.portfolioName, value: portfolio.portfolioNumber}])).values());
    }
    return Array.from(new Map(
      portfolios
      .filter(portfolio => portfolio.portfolioName && portfolio.portfolioNumber)
      .map(portfolio => [portfolio.portfolioNumber, {label: portfolio.portfolioName, value: portfolio.portfolioNumber}])
      ).values()
    );
  }, [portfolios, widgetEmitValues]);

  const loadSampleGroups = () => {
    setNewGroup(null);
    setSelectedGroup(sampleGroups?.[0])
    setSelectedGridItemKeys(sampleGroups?.[0].portfolioSelectionIds);
    return setGroups(sampleGroups);
  }

  const onSortingChanged = (selectedSorting: string) => {
    setSortBy(selectedSorting);
  }

  {/* Commented the Share functionality as are not going to deploy it now. */}
  // const handleShare = () => {
  //   setShowPortfolioShare(true);
  //   setShowPortfolioGroupsSection(false);
  // }

  // const handleEndShare = () => {
  //   setShowPortfolioShare(false);
  //   setShowPortfolioGroupsSection(true);
  // }

  // const handleShareSuccess = () => {
  //   setShowPortfolioGroupsSection(false);
  //   // prototype token — a real service would mint a signed short link server-side
  //   const token = Math.random().toString(36).slice(2, 9);
  //   setShareResult({ link: `https://time.tcw.com/share/${token}`, recipients: [], count: 5 });
  // }

  return (
    <WidgetCardShell>
      {contextHolder}
      <div className={styles.portfolioAnalysisScope} ref={portfolioSelectionRef}>
        <div className={styles.header}>
          <div className={styles.leftSection}>
            <div className={styles.headerItem}>
              <label>Scope</label>
              <Select
                style={{width: 200}}
                placeholder="Please select"
                value={widgetEmitValues.portfolioScope}
                onChange={handleScopeChange}
                options={scopeOptions}
              />
            </div>

            <div className={styles.headerItem}>
              <label>Portfolio · Quick Run</label>          
              <Select
                style={{width: 300}}
                placeholder="Please select"
                onChange={handlePortfolioChange}
                options={portfoliosOptions}
              />
            </div>

            <div className={styles.headerItem}>
              <label>Benchmark</label>          
              <Select
                style={{width: 125}}
                placeholder="Please select"
                onChange={handleBenchMarkChange}
                options={[...new Set(
                  portfolios.map((portfolio: Portfolio) => portfolio?.benchmarkCode?.trim()).filter(Boolean)
                )].map((benchmarkCode) => ({
                  label: benchmarkCode,
                  value: benchmarkCode
                }))}
              />
            </div>

            <div className={styles.headerItem}>
              <label>· Compare Vs</label>          
              <Select
                style={{width: 125}}
                placeholder="Please select"
                onChange={handleCompareVsChange}
                options={[...new Set(
                  portfolios.map((portfolio: Portfolio) => portfolio?.secondaryBenchmarkCode?.trim()).filter(Boolean)
                )].map((secondaryBenchmarkCode) => ({
                  label: secondaryBenchmarkCode ?? "",
                  value: secondaryBenchmarkCode ?? ""
                }))}
              />
            </div>

            <div className={styles.headerItem}>
              <label>As Of · Month-End</label>          
              <DatePicker
                className={styles.select}
                onChange={handleAsOfDateChange}
                picker="month"
              />
            </div>

            <div className={styles.headerItem}>
              <label></label>
              <DatePicker
                className={styles.select}
                onChange={handleCompareDateChange}
                picker="month"
              />
            </div>
          </div>
          
          <div className={styles.rightSection}>
            <div className={styles.headerItem}>
              <label></label>
              
              <Button type="default" icon={<AppstoreOutlined />} 
                onClick={() => {handlePortfolioContainer()}}>
                  Portfolios & Groups
                  {!showPortfolioContainer ? <DownOutlined /> : <UpOutlined />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showPortfolioContainer && (
        <div className={styles.portfolioContainer}>
          <div className={styles.portfolioPanel}>
            <div className={styles.panelHeader}>
              <span>
                <AppstoreOutlined/> Portfolios & Groups
              </span>
              <Button type='text' icon={<CloseOutlined />}
                onClick={() => setShowPortfolioContainer(false)}
              />
            </div>

            {(!showPortfolioGroupsSection && !groups.length) && (
              <div className={styles.emptyState}>
                <div className={styles.icon}>
                  <AppstoreOutlined />
                </div>
                <h3>No Groups yet</h3>
                <Button type='primary' onClick={showPortfolioGroups}>+ Create your first group</Button>
                <Button color="primary" variant="link" className={styles.sampleGroups}
                  onClick={loadSampleGroups}>
                  or load sample groups
                </Button>
              </div>
            )}

            {(showPortfolioGroupsSection || groups.length > 0) && (
              <div className={styles.portfolioGroups}>
                <div className={styles.sideSection}>
                  <div className={styles.groupsInfo}>
                    <span className={styles.groupCnt}>Your Groups {!newGroup ? groups.length : groups.length + 1}</span>
                    <div className={styles.groupsHeader}>
                      {/* Commented the Share functionality as are not going to deploy it now. */}
                      {/* <Button className="btn sm" title="Share groups & views" onClick={handleShare}>
                        <ShareAltOutlined /> Share
                      </Button> */}
                      <Button size='small' type='primary' className={styles.newBtn} onClick={handleCreateNewGroup}>
                        + New
                      </Button>
                      <Button size='small' color="primary" variant="filled" onClick={handleSaveGroup}>Save</Button>
                    </div>
                    <div className={styles.groupsList}>
                      {groups && groups?.map((group: Group) => (
                        <Button 
                          className={clsx(
                            styles.groupBtn,
                            selectedGroup?.id === group.id && styles.activeGroup
                          )} 
                          key={group.id} 
                          color="default" variant="filled"
                          onClick={() => {handleOnGroupSelect(group)}}
                        >
                          {group.name}
                          <div className={styles.groupInfo}>
                            {selectedGroup?.id === group.id && <CheckCircleFilled />}
                            <div className={styles.groupLength}>{group.portfolioSelectionIds?.length}</div>
                          </div>
                        </Button>
                      ))}
                      {newGroup && <>
                        <Button className={clsx(
                          styles.groupBtn,
                          selectedGroup?.id === newGroup.id && styles.activeGroup
                        )} 
                          color="default" variant="filled"
                          onClick={() => {handleOnGroupSelect(newGroup)}}
                        >
                          {newGroup?.name}
                          <div className={styles.groupInfo}>
                            {selectedGroup?.id === newGroup?.id && <CheckCircleFilled />}
                            <div className={styles.groupLength}>{newGroup?.portfolioSelectionIds?.length}</div>
                          </div>
                        </Button>
                      </>}
                    </div>
                  </div>                  
                </div>

                <Divider type='vertical' />

                <div className={styles.mainSection}>
                  <div className={styles.mainSectionHeader}>
                    <div className={styles.groupNameInput}>
                      <Input
                        autoFocus
                        value={selectedGroup?.name ?? ""}
                        onChange={(e) => handleGroupNameChange(e.target.value)}
                      />
                    </div>
                    <label><CheckCircleFilled /><div>On grid</div></label>
                  </div>

                  <div className={styles.infoHeader}>
                    <span className='viewLabel'><SettingOutlined />View</span>
                    <span>All Securities</span>
                    <span>8 periods</span>
                  </div>

                  <div className={styles.subHeader}>
                    <div className={styles.subHeaderLabel}>
                      {selectedGroup?.portfolioSelectionIds?.length ? <span>Currently on the grid</span> : <></>}
                    </div>

                    {showDeleteConfirmMessage && <div className={styles.confirmDeleteMsg}>
                      <span>Delete {selectedGroup?.name} ?</span>
                      <Button size='small' color="pink" variant="outlined" 
                        onClick={() =>setShowDeleteConfirmMessage(false)}
                      >
                        Cancel
                      </Button>

                      <Button size='small' color="danger" variant="outlined" 
                        icon={<DeleteOutlined />}
                        onClick={() => {handleDeleteGroup(); setShowDeleteConfirmMessage(false)}}
                      >
                        Delete
                      </Button>
                    </div>}
                    
                    {(!showDeleteConfirmMessage && selectedGroup) && <Button color="danger" variant="text" type='text' 
                        icon={<DeleteOutlined />}
                        onClick={() => setShowDeleteConfirmMessage(true)}
                      >
                        Delete
                      </Button>
                    }
                  </div>

                  <Divider orientation='start' />

                  <PortfolioToolbar 
                    searchText={searchText}
                    filters={filters}
                    selectedFilters={selectedFilters}
                    showMyPortfolios={showMyPortfolios}
                    myPortfolioCount={portfolios.filter(p => p.pmLoginName === getUserId()).length}
                    showFavPortfolios={showFavPortfolios}
                    onPortfolioSearch={(event: ChangeEvent<HTMLInputElement>) => {handlePortfolioSearch(event)}} 
                    onFilterChange={(filterName: keyof SelectedFilters, values: string[]) => {
                      setSelectedFilters(prev => ({
                        ...prev,
                        [filterName]: values
                      }))
                    }}
                    onClearFilters={handleClearFilters}
                    onMyPortfolios={() => setShowMyPortfolios(prev => !prev)}
                    onFavPortfolios={() => setShowFavPortfolios(prev => !prev)}
                  />

                  <div className={styles.gridHelper}>
                    <div className={styles.gridInfo}>
                      <span>
                        <strong>{!showOnlyGroup ? filteredPortfolios.length : selectedGridItemKeys.length}
                        </strong> shown
                      </span>
                      <span> · </span>
                      <span>
                        <strong>{selectedGroup?.portfolioSelectionIds?.length}</strong> in group</span>
                    </div>

                    <div className={styles.gridActions}>
                      <Button color="primary" variant="text"
                        onClick={() => setShowOnlyGroup(prev => !prev)}
                      >
                        {showOnlyGroup ? 'Show All' : 'In this group'}
                      </Button>
                      <Button color="primary" variant="text"
                        onClick={handleAddAllFiltered}
                      >
                        Add all filtered
                      </Button>
                      <Select
                        defaultValue="portfolioName"
                        style={{width: 100}}
                        placeholder="Please select"
                        onChange={onSortingChanged}
                        options={sortingOptions}
                      />
                    </div>
                  </div>           

                  <Portfoliogrid 
                    portfolios={filteredPortfolios} selectedGridItemKeys={selectedGridItemKeys} sortBy={sortBy}
                    favPortfolioIds={favPortfolioIds}
                    onSelectionKeys={handleGridSelectionKeys} onFavoriteClick={handleFavoritePortfolio}
                  />
                </div>
              </div>
            )}

            {/* Commented the Share functionality as are not going to deploy it now. */}
            {/* {showPortfolioShare && <>
              <PortfolioShare groups={groups} shareResult={shareResult} customPeriods={customPeriods}
                endShare={handleEndShare}
                onShare={handleShareSuccess} 
              />
            </>} */}
          </div>
        </div>
      )}
    </WidgetCardShell>
  );
}