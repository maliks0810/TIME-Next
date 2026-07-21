/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    HomeOutlined,
    LockOutlined,
    MoreOutlined,
    StarFilled,
    StarOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Tag, Typography } from 'antd';
import { Item } from './WorkspacesPanel';
import styles from './WorkspacesPanel.module.scss';
import { useCallback } from 'react';
import { Visibility } from '../../../../api/trap';
export const Row = ({
    item,
    toggleFav,
    openItem,
    owned,
    isFav,
    isLanding,
    currentHomeId,
    isLandingRow,
    onSetHome,
    renameItem,
    favs,
    toggleVis,
    deleteItem,
    editItem,
    duplicateItem,
}: {
    item: Item;
    renameItem: (item: Item) => void;
    toggleFav: (templateId: string) => void;
    openItem: (item: Item) => void;
    owned: boolean;
    isFav: boolean;
    isLanding: boolean;
    currentHomeId?: string | null;
    isLandingRow: boolean;
    favs: string[];
    toggleVis: (item: Item) => void;
    duplicateItem: (item: Item) => void;
    deleteItem: (item: Item) => void;
    editItem: (item: Item) => void;
    onSetHome?: ({ templateId, name }: { templateId: string; name: string }) => void;
}) => {
    const rowMenu = useCallback(
        (item: Item) => {
            // Landings: no favourite (you set them as home). Workflows: open/edit-or-clone/favourite.
            if (isLanding) {
                const isCur = !!(currentHomeId && item.templateId === currentHomeId);

                return {
                    items: [
                        { key: 'open', label: 'Open on Home', onClick: () => openItem(item) },
                        ...(isCur
                            ? []
                            : [
                                  {
                                      key: 'sethome',
                                      label: 'Set as home',
                                      onClick: () =>
                                          onSetHome?.({
                                              templateId: item.templateId,
                                              name: item.templateName,
                                          }),
                                  },
                              ]),
                        ...(owned
                            ? [
                                  { type: 'divider' as const },
                                  {
                                      key: 'rename',
                                      label: 'Rename',
                                      onClick: () => renameItem(item),
                                  },
                                  {
                                      key: 'del',
                                      label: 'Delete',
                                      danger: true,
                                      onClick: () => deleteItem(item),
                                  },
                              ]
                            : []),
                    ],
                };
            }
            return {
                items: [
                    { key: 'open', label: 'Open', onClick: () => openItem(item) },
                    owned
                        ? {
                              key: 'edit',
                              label: 'Edit draft',
                              onClick: () => editItem(item),
                          }
                        : { key: 'clone', label: 'Clone to edit', onClick: () => editItem(item) },
                    {
                        key: 'fav',
                        label: favs.includes(item.templateId)
                            ? 'Remove favourite'
                            : 'Add to favourites',
                        onClick: () => toggleFav(item.templateId),
                    },
                    ...(owned
                        ? [
                              { type: 'divider' as const },
                              { key: 'rename', label: 'Rename', onClick: () => renameItem(item) },
                              {
                                  key: 'dup',
                                  label: 'Duplicate',
                                  onClick: () => duplicateItem(item),
                              },
                              {
                                  key: 'vis',
                                  label:
                                      item.visibility === Visibility.PUBLIC
                                          ? 'Make private'
                                          : 'Make public',
                                  onClick: () => toggleVis(item),
                              },
                              { type: 'divider' as const },
                              {
                                  key: 'del',
                                  label: 'Delete',
                                  danger: true,
                                  onClick: () => deleteItem(item),
                              },
                          ]
                        : []),
                ],
            };
        },
        [isLanding, currentHomeId, owned]
    );

    const isCurrentHome = isLandingRow && currentHomeId && item.templateId === currentHomeId;
    return (
        <div
            key={item.templateId}
            onClick={() => openItem(item)}
            className={styles['ws-row']}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 6px',
                borderRadius: 7,
                cursor: 'pointer',
            }}
        >
            {/* Landings lead with a home glyph (you set them as home, you don't favourite
                        them). Workflows lead with a favourite star. */}
            {isLandingRow ? (
                <span
                    className={styles['ws-lead']}
                    title="Landing"
                    style={{ color: 'var(--ant-color-success)' }}
                >
                    <HomeOutlined />
                </span>
            ) : (
                <button
                    className={styles['ws-star']}
                    title={isFav ? 'Remove favourite' : 'Add to favourites'}
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleFav(item.templateId);
                    }}
                >
                    {isFav ? (
                        <StarFilled style={{ color: 'var(--ant-color-warning)' }} />
                    ) : (
                        <StarOutlined />
                    )}
                </button>
            )}
            <span style={{ flex: 1, minWidth: 0 }}>
                <Typography.Text
                    style={{
                        display: 'block',
                        fontSize: 13,
                        fontWeight: 550,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {item.templateName}
                </Typography.Text>
                <Typography.Text type="secondary" style={{ display: 'block', fontSize: 10.5 }}>
                    {isLandingRow ? 'Landing' : item.class3}
                </Typography.Text>
            </span>
            {isCurrentHome ? (
                <Tag
                    color="success"
                    style={{ margin: 0, fontSize: 10, lineHeight: '16px', padding: '0 6px' }}
                >
                    Current
                </Tag>
            ) : null}
            {!isLandingRow ? (
                <Tag
                    color="warning"
                    style={{ margin: 0, fontSize: 10, lineHeight: '16px', padding: '0 6px' }}
                >
                    Draft
                </Tag>
            ) : null}
            {/* Ownership/visibility glyph — workflows only (a landing's home glyph is its identity). */}
            {!isLandingRow ? (
                <span
                    className={styles['ws-vis']}
                    title={`${Visibility.PRIVATE ? 'Private' : 'Public'} · ${owned ? 'yours' : 'shared'}`}
                    style={{
                        color: owned
                            ? 'var(--ant-color-success)'
                            : 'var(--ant-color-text-tertiary)',
                    }}
                >
                    {Visibility.PRIVATE ? <LockOutlined /> : <TeamOutlined />}
                </span>
            ) : null}
            <Dropdown
                trigger={['click']}
                // Menu overlay is a React descendant of this row, so item clicks bubble
                // (via React's synthetic tree) to the row's onClick → openItem, which would
                // close the drawer. Stop them here; open/edit still close via their own calls.
                menu={{
                    ...(rowMenu(item) as any),
                    onClick: (info: any) => info?.domEvent?.stopPropagation?.(),
                }}
            >
                <Button
                    className={styles['ws-kebab']}
                    size="small"
                    type="text"
                    icon={<MoreOutlined />}
                    onClick={(e) => e.stopPropagation()}
                />
            </Dropdown>
        </div>
    );
};
