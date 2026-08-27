/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Input, Button, Empty, message } from 'antd';
import {
    RightOutlined,
    DownOutlined,
    HomeOutlined,
    SearchOutlined,
    PlusOutlined,
    ContainerOutlined,
} from '@ant-design/icons';
import { useGetUserClaims, useGetUserLogin } from '../../../../state/User/hooks';
import {
    getTemplates,
    updateTemplate,
    deleteTemplate,
    cloneTemplate,
    getTeams,
    Team,
    TemplateSummary,
} from '../../../../api/trap';
import styles from './WorkspacesPanel.module.scss';
import { Row } from './Row';
import { CreateNewSection } from './CreateNewSection';

import { Kind, Visibility } from '../../../../api/trap';

export type Item = {
    templateId: string;
    templateName: string;
    kind: Kind;
    visibility: Visibility;
    ownerUserId: string | null;
    class3: string | null;
    isDraft: boolean;
    scopeKey?: null | Record<string, string>;
    scopeType?: 'USER' | 'AUDIENCE' | null;
};

type Selection = Item & {
    templateId: string;
    templateName: string;
};

type Props = {
    onLaunch: (sel: Selection) => void;
    onEdit: (ws: { workflowId: string; title: string; templateId: string }) => void;
    onActivateLanding: (sel: { templateId: string; templateName?: string }) => void;
    onCloneTemplate: (sel: Item) => void;
    onSetHome?: (sel: { templateId: string; name?: string }) => void;
    currentHomeId?: string | null;
    onCreateWorkspace: (
        input: {
            name: string;
            kind: Kind;
            visibility: Visibility;
        },
        organization: Team
    ) => Promise<void> | void;
    // Let the shell keep open tabs in sync when a workspace is mutated from this list
    // (close orphaned tabs on delete, retitle on rename, refresh menu state on change).
    onTemplateChanged?: (info: {
        templateId: string;
        type: 'deleted' | 'renamed' | 'changed';
        name?: string;
    }) => void;
    templates: TemplateSummary[];
};

export type DepartmentTree = Map<string, Map<string, Set<string>>>;
const FAV_KEY = 'favoriteWorkspaces';
const loadFavs = (): string[] => {
    try {
        return JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
    } catch {
        return [];
    }
};

// The grouped workspace list for the drawer's Workspaces segment. Organized the way
// the concept calls for: Home (landings) → Favourites → Your team (Org-4) → Other teams.
export default function WorkspacesPanel({
    onLaunch,
    onEdit,
    onSetHome,
    currentHomeId,
    templates,
    onActivateLanding,
    onCreateWorkspace,
    onTemplateChanged,
    onCloneTemplate,
}: Props) {
    const login = useGetUserLogin();
    const claims = useGetUserClaims();

    const currentUser =
        (typeof window !== 'undefined' && localStorage.getItem('debug-user')) || login;
    const org1 = String((claims as any)?.OrgLevel1 ?? '').trim();
    const org2 = String((claims as any)?.OrgLevel2 ?? '').trim();
    const myTeam = String((claims as any)?.OrgLevel4 ?? '').trim();

    const [departmentTree, setDepartmentTree] = React.useState<DepartmentTree | null>();
    const [items, setItems] = React.useState<Item[]>(
        templates?.map((el) => ({
            class3: el.class3 || null,
            ownerUserId: el.ownerUserId || el.createdByUserId || null,
            visibility: el.visibility as Visibility,
            templateId: el.id,
            templateName: el.name,
            kind: el.kind as Kind,
            scopeKey: el.scopeKey,
            scopeType: el.scopeType,
            isDraft:
                el.latestDraft?.version &&
                el.latestPublished?.version &&
                el.latestPublished?.version < el.latestDraft?.version,
        })) || []
    );
    const [loading, setLoading] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const [favs, setFavs] = React.useState<string[]>(loadFavs);
    const [openTeams, setOpenTeams] = React.useState<Record<string, boolean>>({});
    // Long flat groups get truncated to a handful with a "Show all N →" expander (per concept),
    // so the list stays scannable when a user has dozens of workspaces in one bucket.
    const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({});

    // Inline new-workspace form (P6) — replaces the launcher modal + class dropdowns.
    const [showNew, setShowNew] = React.useState(false);

    const refresh = React.useCallback(async () => {
        setLoading(true);
        try {
            const templates: any[] = await getTemplates();
            const withVers = await Promise.all(
                templates.map(async (t) => {
                    return {
                        templateId: t.id,
                        templateName: t.name,
                        kind: t.kind,
                        visibility: t.visibility,
                        ownerUserId: t.ownerUserId,
                        class3: (t.class3 ?? '').trim() || 'Unclassified',
                    } as Item;
                })
            );
            setItems(withVers);
        } catch (e: any) {
            message.error(e?.message ?? 'Failed to load workspaces');
        } finally {
            setLoading(false);
        }
    }, []);

    const buildTree = (data: Team[]) => {
        return data.reduce<DepartmentTree>((tree, { departmentName, groupName, teamName }) => {
            if (!tree.has(groupName)) tree.set(groupName, new Map());

            const groups = tree.get(groupName);

            if (!groups?.has(departmentName)) groups?.set(departmentName, new Set());

            groups?.get(departmentName)?.add(teamName);

            return tree;
        }, new Map());
    };
    const fetchTeams = async () => {
        const data = await getTeams();
        const departmentTree = buildTree(data);
        setDepartmentTree(departmentTree);
    };
    React.useEffect(() => {
        fetchTeams();
    }, []);

    const toggleFav = (id: string) => {
        setFavs((prev) => {
            const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
            localStorage.setItem(FAV_KEY, JSON.stringify(next));
            return next;
        });
    };

    const query = search.trim().toLowerCase();
    const matches = (item: Item) =>
        !query ||
        item.templateName.toLowerCase().includes(query) ||
        item.class3?.toLowerCase().includes(query);
    const visible = items.filter(matches);

    const owned = (item: Item) => item.ownerUserId === currentUser;
    const isLanding = (item: Item) => item.kind === Kind.LANDING;
    const isDepartmentLanding = (item: Item) =>
        item?.scopeKey?.['OrgLevel1'] === claims.OrgLevel1 &&
        item?.scopeKey?.['OrgLevel2'] === claims.OrgLevel2;

    const openItem = (item: Item) => {
        if (isLanding(item)) {
            onActivateLanding({
                templateId: item.templateId,

                templateName: item.templateName,
            });
            return;
        }
        onLaunch({
            ...item,
            templateId: item.templateId,
            templateName: item.templateName,
            ownerUserId: item.ownerUserId || '',
        });
    };

    const editItem = (item: Item) => {
        onEdit({
            workflowId: `wf_${item.templateId}`,
            title: item.templateName,
            templateId: item.templateId,
        });
    };

    const renameItem = async (item: Item) => {
        const name = window.prompt('Rename workspace', item.templateName)?.trim();
        if (!name || name === item.templateName) return;
        try {
            await updateTemplate({ templateId: item.templateId, name });
            message.success('Renamed');
            onTemplateChanged?.({ templateId: item.templateId, type: 'renamed', name });
            void refresh();
        } catch (e: any) {
            message.error(e?.message ?? 'Rename failed');
        }
    };
    const toggleVis = async (item: Item) => {
        try {
            await updateTemplate({
                templateId: item.templateId,
                visibility:
                    item.visibility === Visibility.PUBLIC ? Visibility.PRIVATE : Visibility.PUBLIC,
            });
            message.success(item.visibility === Visibility.PUBLIC ? 'Now private' : 'Now public');
            onTemplateChanged?.({ templateId: item.templateId, type: 'changed' });
            void refresh();
        } catch (e: any) {
            message.error(e?.message ?? 'Update failed');
        }
    };
    const duplicateItem = async (item: Item) => {
        try {
            await cloneTemplate(item.templateId, `${item.templateName} (copy)`);
            message.success('Duplicated');
            onTemplateChanged?.({ templateId: item.templateId, type: 'changed' });
            void refresh();
        } catch (e: any) {
            message.error(e?.message ?? 'Duplicate failed');
        }
    };
    const deleteItem = async (item: Item) => {
        if (!window.confirm(`Delete “${item.templateName}”? This cannot be undone.`)) return;
        try {
            await deleteTemplate(item.templateId);
            message.success('Deleted');
            onTemplateChanged?.({ templateId: item.templateId, type: 'deleted' });
            void refresh();
        } catch (e: any) {
            message.error(e?.message ?? 'Delete failed');
        }
    };

    const GROUP_LIMIT = 5;
    const renderGroup = (groupKey: string, list: Item[], label: React.ReactNode) => {
        if (!list.length) return null;
        const expanded = !!expandedGroups[groupKey];
        const shown = expanded ? list : list.slice(0, GROUP_LIMIT);
        const overflow = list.length - shown.length;
        return (
            <div>
                <div className={styles['ws-sec']}>{label}</div>
                {shown.map((item) => {
                    const isFav = favs.includes(item.templateId);
                    const landingRow = isLanding(item);

                    return (
                        <Row
                            item={item}
                            toggleFav={toggleFav}
                            owned={owned(item)}
                            isFav={isFav}
                            isLanding={isLanding(item)}
                            currentHomeId={currentHomeId}
                            isLandingRow={landingRow}
                            favs={favs}
                            toggleVis={toggleVis}
                            duplicateItem={duplicateItem}
                            deleteItem={deleteItem}
                            editItem={editItem}
                            onSetHome={onSetHome}
                            openItem={openItem}
                            renameItem={renameItem}
                            key={item.templateId}
                            cloneItem={onCloneTemplate}
                            isDraft={!!item.isDraft}
                        />
                    );
                })}
                {overflow > 0 ? (
                    <div
                        className={styles['ws-showall']}
                        onClick={() => setExpandedGroups((p) => ({ ...p, [groupKey]: true }))}
                    >
                        Show all {list.length} →
                    </div>
                ) : expanded && list.length > GROUP_LIMIT ? (
                    <div
                        className={styles['ws-showall']}
                        onClick={() => setExpandedGroups((p) => ({ ...p, [groupKey]: false }))}
                    >
                        Show less
                    </div>
                ) : null}
            </div>
        );
    };

    const departmentLandings = visible.filter(
        (item) => isLanding(item) && isDepartmentLanding(item)
    );
    const landings = visible.filter((item) => isLanding(item) && !isDepartmentLanding(item));
    const workflows = visible.filter((item) => !isLanding(item));
    const favItems = visible.filter((item) => favs.includes(item.templateId));
    const yourTeam = workflows.filter((item) => myTeam && item.class3 === myTeam);
    const otherWorkflows = workflows.filter((item) => !(myTeam && item.class3 === myTeam));
    const otherTeams = Array.from(new Set(otherWorkflows.map((item) => item.class3))).sort();

    if (showNew)
        return (
            <CreateNewSection
                orgTree={departmentTree}
                onCreateWorkspace={onCreateWorkspace}
                org1={org1}
                org2={org2}
                myTeam={myTeam}
                setShowNew={setShowNew}
            />
        );
    return (
        <div>
            <Input
                allowClear
                prefix={<SearchOutlined />}
                placeholder={`Search ${items.length} workspaces…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                style={{ marginBottom: 8 }}
            />
            <Button
                block
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowNew(true)}
                style={{ marginBottom: 4 }}
            >
                Create Workspace
            </Button>

            {renderGroup(
                'Department',
                departmentLandings,
                <>
                    <ContainerOutlined /> Department
                </>
            )}

            {renderGroup(
                'home',
                landings,
                <>
                    <HomeOutlined /> Home
                </>
            )}

            {renderGroup('favourites', favItems, 'Favourites')}

            {renderGroup('yourteam', yourTeam, `Your team · ${myTeam || '—'}`)}

            {otherTeams.length ? (
                <div>
                    <div className={styles['ws-sec']}>Other teams</div>
                    {otherTeams.map((team) => {
                        if (!team) return null;
                        const list = otherWorkflows.filter((item) => item.class3 === team);
                        const open = openTeams[team] ?? false;
                        return (
                            <div key={team}>
                                <div
                                    onClick={() => setOpenTeams((p) => ({ ...p, [team]: !open }))}
                                    className={styles.team}
                                >
                                    {open ? (
                                        <DownOutlined style={{ fontSize: 10 }} />
                                    ) : (
                                        <RightOutlined style={{ fontSize: 10 }} />
                                    )}
                                    <span style={{ fontSize: 12, fontWeight: 600 }}>{team}</span>
                                    <span
                                        style={{
                                            fontSize: 11,
                                            color: 'var(--ant-color-text-tertiary)',
                                        }}
                                    >
                                        {list.length}
                                    </span>
                                </div>
                                {open ? (
                                    <div>
                                        {list.map((item) => {
                                            const isFav = favs.includes(item.templateId);
                                            const landingRow = isLanding(item);

                                            return (
                                                <Row
                                                    item={item}
                                                    toggleFav={toggleFav}
                                                    owned={owned(item)}
                                                    isFav={isFav}
                                                    isLanding={isLanding(item)}
                                                    currentHomeId={currentHomeId}
                                                    isLandingRow={landingRow}
                                                    favs={favs}
                                                    toggleVis={toggleVis}
                                                    duplicateItem={duplicateItem}
                                                    deleteItem={deleteItem}
                                                    editItem={editItem}
                                                    cloneItem={onCloneTemplate}
                                                    onSetHome={onSetHome}
                                                    openItem={openItem}
                                                    renameItem={renameItem}
                                                    key={item.templateId}
                                                    isDraft={!!item.isDraft}
                                                />
                                            );
                                        })}
                                    </div>
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            ) : null}

            {!visible.length && !loading ? (
                <Empty description="No workspaces" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : null}
        </div>
    );
}
