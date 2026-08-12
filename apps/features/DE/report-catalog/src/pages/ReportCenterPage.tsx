import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import {
  alpha,
  Box,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  // Link,
  List,
  ListItemButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,


} from "@mui/material";
import {
  Search,
  Star,
  StarBorder,
  InfoOutlined,
  KeyboardArrowDown,
  ChevronRight,
  MenuOpen,
  Menu,
  Close,
  BarChart,
} from "@mui/icons-material";
import ClearIcon from "@mui/icons-material/Clear";
import { groupByDepartment } from "../utils/report";
import { useReportCatalog } from "../hooks/useReportCatalog";
import { Report, ViewerTab } from "../types/report.types";
import { buildReportIframeUrl, getExternalReportUrl } from "../utils/ssrs-embed";
import { useInfiniteScrollTrigger } from "../hooks/useInfiniteScrollTrigger";
import { useDebounce } from "../hooks/useDebounce";
import { useQueryClient } from "@tanstack/react-query";
import { useToggleFavourite } from "../hooks/useToggleFavourite";
import { ReportOverviewDialog } from "../components/report-overview-dialog";
import TabCloseConfirmDialog from "../components/tab-close-confirm";
import { usePersistedTabs } from "../hooks/usePersistedTabs";
import ActiveTabIframeView from "../components/active-tab";
import EnvironmentBadge from "../components/environment-badge";
import { UserInfo } from "../../../../../../packages/utils/src/hooks/Authentication/user-info";
// import { useNavigate } from "react-router-dom";

type ReportCenterPageProps = {
  user: UserInfo;
};

type Category = "all" | "favorites";




export default function ReportCenterPage({
  user
}: ReportCenterPageProps) {
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [collapsedDepartments, setCollapsedDepartments] = useState<
    Record<string, boolean>
  >({});
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [maximized] = useState(false);

  const [selectedTabId, setSelectedTabId] = useState<string>('')
  // const navigate = useNavigate();
  const {
    tabs,
    setTabs,
    activeTabId,
    setActiveTabId
  } = usePersistedTabs();


  const [openDialog, setOpenDialog] = useState(false)

  const [infoReport, setInfoReport] = useState<Report | null>(null);
  const debouncedSearchText = useDebounce(searchText, 400);
  const queryClient = useQueryClient()
  const filters = {
    search: debouncedSearchText,
    status: "Active",
    userId: user.login ?? '',
    showOnlyUserFav: category === 'favorites'
  }
  const {
    data: records,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading } = useReportCatalog(filters);

  const groupedData = useMemo(
    () => groupByDepartment(records?.pages ?? []),
    [records]
  );

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ['reportCatalog'],
      exact: false
    });
  }, [category]);


  const activeTab = useMemo(() => {
    if (tabs.length === 0) return null;

    return (
      tabs.find((t) => String(t.id) === String(activeTabId)
      ) || tabs[0]

    );

  }, [tabs, activeTabId]);


  // Changed: default collapsed = true
  const isDepartmentCollapsed = (department: string) => {
    const key = `${category}::${department}`;
    return collapsedDepartments[key] ?? true;
  };

  const toggleDepartment = (department: string) => {
    const key = `${category}::${department}`;
    setCollapsedDepartments((prev) => ({
      ...prev,
      [key]: !(prev[key] ?? true),
    }));
  };




  const toggleFavouriteMutation = useToggleFavourite(user.login ?? '', filters);

  const handleToggleFavourite = (report: Report) => {
    toggleFavouriteMutation.mutate(report);
  };


  const openReport = (report: Report) => {
    const iframeUrl = buildReportIframeUrl(report.reportlink);
    const url = new URL(iframeUrl ?? '')
    if (!iframeUrl) return;
    if (url.hostname.startsWith('rpt')) {
      setTabs((prev) => {
        const existing = prev.find((t) => t.id === report.reportnum);
        if (existing) {
          setActiveTabId(existing.id);
          return prev;
        }

        const newTab: ViewerTab = {
          id: report.reportnum,
          title: report.reportname,
          iframeUrl,
          rawUrl: report.reportlink ?? '',
        };

        setActiveTabId(newTab.id);
        return [...prev, newTab];
      });
    }
    else {
      handleOpenExternal(report.reportlink)
    }
  };

  const closeTab = (tabId: string) => {
    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.id === tabId);
      const nextTabs = prev.filter((t) => t.id !== tabId);

      if (activeTabId === tabId) {
        const nextActive = nextTabs[idx]?.id ?? nextTabs[idx - 1]?.id ?? null;
        setActiveTabId(nextActive);
      }

      return nextTabs;
    });
  };

  const handleOpenExternal = (rawUrl: string | null) => {
    const url = getExternalReportUrl(rawUrl);
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };



  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const loadMoreRef = useInfiniteScrollTrigger({
    rootRef: scrollContainerRef,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  });

  const handleClear = () => {
    setSearchText("");
  };


  const handleCloseClick = (e: React.MouseEvent<HTMLButtonElement>, tabId: string) => {
    e.stopPropagation();

    startTransition(() => {
      setSelectedTabId(tabId);
      setOpenDialog(true);
    });

  };
  const totalFilteredCount = useMemo(() => {
    return records?.pages?.reduce((sum, page) => sum + page.length, 0) || 0;
  }, [records?.pages]);
  const noCollapse = searchText.length > 0 && totalFilteredCount < 10
  const handleConfirmClose = () => {
    setOpenDialog(false);

    startTransition(() => {
      closeTab(selectedTabId);
    });
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          minHeight: "calc(100vh - 120px)",
          position: "relative",
        }}
      >
        {/* LEFT SIDEBAR */}
        {!maximized && (
          <Card
            elevation={0}
            sx={{
              width: sidebarHidden ? 0 : { xs: "100%", md: 380 },
              minWidth: sidebarHidden ? 0 : { xs: "100%", md: 380 },
              overflow: "hidden",
              transition: "all 220ms ease",
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                px: 2.5,
                py: 2.25,
                borderBottom: "1px solid",
                borderColor: "divider",
                background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#111827",
                    lineHeight: 1.2,
                  }}
                >
                  SSRS Reports

                  {/* <Link
                    component="button"
                    underline="hover"
                    onClick={() =>
                      navigate("/report-center/admin")
                    }
                    sx={{ ml: 1, cursor: "pointer" }}
                  >
                    Manage
                  </Link> */}

                </Typography>
                <Typography
                  sx={{
                    fontSize: 13,
                    color: "#6b7280",
                    mt: 0.5,
                  }}
                >
                  Department-wise report navigation
                </Typography>
              </Box>

              <Tooltip title="Hide navigation">
                <IconButton
                  onClick={() => setSidebarHidden(true)}
                  sx={{
                    color: "#455a64",
                  }}
                >
                  <MenuOpen />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Search and segmented buttons - restyled to match HTML reference */}
            <Box
              sx={{
                px: 2,
                py: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="Search by report, department, report #, or description..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: "#6b7280", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchText && (
                      <InputAdornment position="end">
                        <IconButton onClick={handleClear}>
                          <ClearIcon color="error" fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 40,
                    borderRadius: "10px",
                    backgroundColor: "#fff",
                    fontSize: 14,
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#d1d5db",
                  },
                }}
              />

              <Box
                sx={{
                  mt: 1.75,
                  backgroundColor: "#f3f4f6",
                  borderRadius: "999px",
                  p: "4px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "6px",
                }}
              >
                <Box
                  component="button"
                  type="button"
                  onClick={() => setCategory("all")}
                  sx={{
                    border: "none",
                    borderRadius: "999px",
                    height: 40,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    backgroundColor: category === "all" ? "#ffffff" : "transparent",
                    color: category === "all" ? "#1976d2" : "#4b5563",
                    boxShadow:
                      category === "all"
                        ? "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)"
                        : "none",
                  }}
                >
                  All Reports
                </Box>

                <Box
                  component="button"
                  type="button"
                  onClick={() => setCategory("favorites")}
                  sx={{
                    border: "none",
                    borderRadius: "999px",
                    height: 40,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    backgroundColor:
                      category === "favorites" ? "#ffffff" : "transparent",
                    color:
                      category === "favorites" ? "#1976d2" : "#4b5563",
                    boxShadow:
                      category === "favorites"
                        ? "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)"
                        : "none",
                  }}
                >
                  Favorites
                </Box>
              </Box>
            </Box>

            <Box sx={{ flex: 1, overflow: "auto", p: 1.5 }}>
              {isLoading ? (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    textAlign: "center",
                    color: "text.secondary",
                  }}
                >
                  Loading report catalog...
                </Paper>
              ) : groupedData.length === 0 ? (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    textAlign: "center",
                    color: "text.secondary",
                    borderStyle: "dashed",
                  }}
                >
                  No reports found for the current search/filter.
                </Paper>
              ) : (
                <Box ref={scrollContainerRef} sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  <Stack spacing={1.5}>
                    {groupedData.map((groupedValues) => {
                      const departmentName = groupedValues.departmentName
                      const reports = groupedValues.reports

                      const collapsed = !(noCollapse) && isDepartmentCollapsed(departmentName);
                      return (
                        <Paper
                          key={departmentName}
                          variant="outlined"
                          sx={{
                            borderRadius: 3,
                            overflow: "hidden",
                            borderColor: alpha("#0B4F8A", 0.08),
                          }}
                        >
                          <ListItemButton
                            onClick={() => toggleDepartment(departmentName)}
                            sx={{
                              py: 1.25,
                              px: 1.5,
                              background:
                                "linear-gradient(180deg, #ffffff 0%, #fbfcfd 100%)",
                            }}
                          >
                            {collapsed ? (
                              <ChevronRight sx={{ color: "#111827" }} />
                            ) : (
                              <KeyboardArrowDown sx={{ color: "#111827" }} />
                            )}

                            <Box
                              sx={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                minWidth: 0,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  fontSize: 14,
                                  color: "#111827",
                                }}
                              >
                                {departmentName}
                              </Typography>

                              <Chip
                                label={reports.length}
                                size="small"
                                sx={{
                                  bgcolor: alpha("#1976d2", 0.12),
                                  color: "primary.main",
                                  fontWeight: 700,
                                  height: 24,
                                }}
                              />
                            </Box>
                          </ListItemButton>

                          {!collapsed && (
                            <List disablePadding sx={{ px: 1, pb: 1 }}>
                              {reports.map((report) => {
                                const fav = report.isuserfavourite
                                return (
                                  <Paper
                                    key={report.reportnum}
                                    variant="outlined"
                                    sx={{
                                      mt: 1,
                                      borderRadius: 2.5,
                                      borderColor: "#e5e7eb",
                                      boxShadow: "none",
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        justifyContent: "space-between",
                                        gap: 1,
                                        p: 1.5,
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          flex: 1,
                                          minWidth: 0,
                                          cursor: "pointer",
                                        }}
                                        onClick={() => openReport(report)}
                                      >
                                        <Typography
                                          sx={{
                                            fontSize: 14,
                                            fontWeight: 700,
                                            color: "#111827",
                                            lineHeight: 1.3,
                                          }}
                                          noWrap
                                          title={report.reportname}
                                        >
                                          {report.reportname}
                                        </Typography>

                                        <Stack
                                          direction="row"
                                          spacing={1}
                                          sx={{
                                            mt: 1,
                                            flexWrap: "wrap",
                                          }}
                                        >
                                          <Chip
                                            size="small"
                                            label={`# ${report.reportnum}`}
                                            variant="outlined"
                                            sx={{
                                              height: 24,
                                              borderRadius: "999px",
                                            }}
                                          />
                                          {report.status && (
                                            <Chip
                                              size="small"
                                              label={report.status}
                                              variant="outlined"
                                              sx={{
                                                height: 24,
                                                borderRadius: "999px",
                                              }}
                                            />
                                          )}
                                        </Stack>

                                        {report.description && (
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              mt: 1.1,
                                              color: "#6b7280",
                                              display: "-webkit-box",
                                              WebkitLineClamp: 2,
                                              WebkitBoxOrient: "vertical",
                                              overflow: "hidden",
                                            }}
                                          >
                                            {report.description}
                                          </Typography>
                                        )}
                                      </Box>

                                      <Stack direction="row" spacing={0.25}>
                                        <Tooltip title="Report info">
                                          <IconButton
                                            size="small"
                                            onClick={() => setInfoReport(report)}
                                            sx={{ color: "#6b7280" }}
                                          >
                                            <InfoOutlined fontSize="small" />
                                          </IconButton>
                                        </Tooltip>

                                        <Tooltip
                                          title={
                                            fav
                                              ? "Remove from favourites"
                                              : "Add to favourites"
                                          }
                                        >
                                          <IconButton
                                            size="small"
                                            onClick={() =>
                                              handleToggleFavourite(report)
                                            }
                                            sx={{
                                              color: fav ? "#f4b400" : "#6b7280",
                                            }}
                                          >
                                            {fav ? (
                                              <Star fontSize="small" />
                                            ) : (
                                              <StarBorder fontSize="small" />
                                            )}
                                          </IconButton>
                                        </Tooltip>
                                      </Stack>
                                    </Box>
                                  </Paper>
                                );
                              })}


                            </List>
                          )}
                        </Paper>
                      );
                    })}

                    {/* Infinite Loader Trigger */}
                    <Box
                      ref={loadMoreRef}
                      sx={{ display: 'flex', justifyContent: 'center', py: 2 }}
                    >
                      {isFetchingNextPage && <CircularProgress size={24} />}
                    </Box>
                  </Stack>
                </Box>

              )}
            </Box>
          </Card>
        )}

        {/* RIGHT CONTENT */}
        <Box
          sx={
            maximized
              ? {
                position: "fixed",
                inset: 16,
                zIndex: 1300,
                backgroundColor: "background.default",
              }
              : {
                flex: 1,
                minWidth: 0,
              }
          }
        >
          <Card
            elevation={0}
            sx={{
              height: maximized ? "calc(100vh - 32px)" : "100%",
              borderRadius: maximized ? 2 : 4,
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 1.5,
                py: 1,
                borderBottom: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                {!maximized && sidebarHidden && (
                  <Tooltip title="Show navigation">
                    <IconButton onClick={() => setSidebarHidden(false)}>
                      <Menu />
                    </IconButton>
                  </Tooltip>
                )}

                <Typography variant="subtitle1" fontWeight={700}>
                  Report Viewer
                </Typography>
                <EnvironmentBadge />
              </Stack>

            </Box>

            {tabs?.length > 0 && (
              <Box
                sx={{
                  px: 1.5,
                  pt: 1.5,
                  backgroundColor: "#fcfdff",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                {tabs.map((tab) => {
                  const isActive = activeTabId === tab.id;

                  return (
                    <Box
                      key={tab.id}
                      onClick={() => setActiveTabId(tab.id)}
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        maxWidth: 260,
                        minWidth: 140,
                        px: 1.5,
                        py: 1,
                        borderRadius: "14px 14px 0 0",
                        border: "1px solid",
                        borderColor: isActive ? "divider" : "transparent",
                        bgcolor: isActive ? "#ffffff" : "#eef3f8",
                        color: isActive ? "primary.main" : "#455a64",
                        cursor: "pointer",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontWeight: 500,
                        }}
                      >
                        {tab.title}
                      </Typography>

                      <IconButton
                        size="small"
                        onClick={(e) => handleCloseClick(e, tab.id)}
                        sx={{
                          color: "#607d8b",
                        }}
                      >
                        <Close sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  );
                })}
              </Box>
            )}

            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                position: "relative",
                bgcolor: "#f8fafc",
              }}
            >
              {tabs.length === 0 || !activeTab ? (
                <Box
                  sx={{
                    height: "100%",
                    display: "grid",
                    placeItems: "center",
                    p: 4,
                  }}
                >
                  <Paper
                    variant="outlined"
                    sx={{
                      maxWidth: 560,
                      p: 4,
                      textAlign: "center",
                      borderRadius: 4,
                    }}
                  >
                    <Box
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        mx: "auto",
                        mb: 2,
                        bgcolor: alpha("#1976d2", 0.12),
                        color: "primary.main",
                      }}
                    >
                      <BarChart sx={{ fontSize: 36 }} />
                    </Box>

                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Select a report to preview
                    </Typography>

                    <Typography color="text.secondary">
                      Use the left panel to browse reports by department, search
                      across all categories, mark favorites, and open multiple reports
                      in tabs.
                    </Typography>
                  </Paper>
                </Box>
              ) : (
                <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
                  {tabs.map((tab) => (
                    <Box
                      key={tab.id}
                      sx={{
                        display: activeTabId === tab.id ? "block" : "none",
                        width: "100%",
                        height: "100%",
                        position: "relative",
                      }}
                    >
                      <ActiveTabIframeView tab={tab} />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Card>
          <TabCloseConfirmDialog open={openDialog} onClose={() => setOpenDialog(false)} onConfirm={handleConfirmClose} />
        </Box>
      </Box>

      {/* REPORT INFO POPUP */}
      <ReportOverviewDialog reportInfo={infoReport} onOpenReport={() => {
        if (infoReport) {
          handleOpenExternal(infoReport.reportlink);

        }
        setInfoReport(null);
      }} onClose={() => setInfoReport(null)} />
    </>
  );
}
