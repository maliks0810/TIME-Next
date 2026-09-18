import {
    ArrowLeftOutlined,
    CheckCircleFilled,
    CheckOutlined,
    RightOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import { Button, Checkbox, Divider, Input, Switch } from 'antd';
import type { RadioChangeEvent } from 'antd';
import { Radio } from 'antd';
import type { CheckboxChangeEvent, CheckboxGroupProps } from 'antd/es/checkbox';
import { useEffect, useState } from 'react';

import { CustomPeriod, Group, ShareResult } from './types';
import styles from './PortfolioShare.module.scss';
import { COLLEAGUES } from './mockData';

interface PortfolioShareProps {
    groups: Group[];
    customPeriods: CustomPeriod[];
    shareResult: ShareResult | null;
    endShare: () => void;
    onShare: () => void;
}

export const PortfolioShare = ({
    groups,
    customPeriods,
    shareResult,
    endShare,
    onShare,
}: PortfolioShareProps) => {
    const [access, setAccess] = useState<string>('view');
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<Group[]>(groups);
    const [isShareSuccess, setIsShareSuccess] = useState<boolean>(false);
    const [linkCopied, setLinkCopied] = useState<boolean>(false);
    const [inclPeriods, setInclPeriods] = useState<boolean>(true);
    const [inclView, setInclView] = useState<Set<number>>(new Set());
    const [canShare, setCanShare] = useState<boolean>(false);

    // const viewCount = useMemo(() => [...pickGroups].filter((i) => inclView.has(i)).length, [pickGroups, inclView]);

    useEffect(() => {
        const canShare =
            selectedRecipients.length > 0 && (selectedGroups.length > 0 || inclPeriods);
        setCanShare(canShare);
    }, [selectedRecipients, selectedGroups, inclPeriods]);

    const accessOptions: CheckboxGroupProps<string>['options'] = [
        { label: 'Can View', value: 'view' },
        { label: 'Can Edit', value: 'edit' },
    ];

    const onRecipientChange = (recipient: string, checked: boolean) => {
        setSelectedRecipients((prev) => {
            if (checked) {
                return [...prev, recipient];
            }
            return prev.filter((item) => item !== recipient);
        });
    };

    const onGroupsChange = (group: Group, checked: boolean) => {
        setSelectedGroups((prev) => {
            if (checked) {
                return [...prev, group];
            }
            return prev.filter((item) => item.id !== group.id);
        });
    };

    const onLinkCopy = () => {
        if (!shareResult) return;
        navigator.clipboard?.writeText(shareResult.link).catch(() => {});
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 1600);
    };

    const onToggleView = (index: number) => {
        setInclView((prev) => {
            const updated = new Set(prev);

            if (updated.has(index)) {
                updated.delete(index);
            } else {
                updated.add(index);
            }
            return updated;
        });
    };

    const onTogglePeriods = (checked: boolean) => {
        setInclPeriods(checked);
    };

    return (
        <div className={styles.portfolioShare}>
            <div className={styles.pgSectionHeader}>
                <Button
                    className={styles.backBtn}
                    variant="link"
                    title="Back to groups"
                    onClick={endShare}
                >
                    <ArrowLeftOutlined />
                </Button>
                <span className={styles.title}>Share workspace</span>
                <span className={styles.shareInfo}>
                    Send groups &amp; saved views to a colleague
                </span>
            </div>

            <Divider />

            <div className={styles.content}>
                {!isShareSuccess && (
                    <>
                        <div className={styles.mainSection}>
                            <div className={styles.recipientPicker}>
                                <div className={styles.subhead}>
                                    Share with{' '}
                                    <span className={styles.subLabel}>
                                        {selectedRecipients.length > 0
                                            ? selectedRecipients.length
                                            : 'none'}{' '}
                                        selected
                                    </span>
                                </div>
                                <div className={styles.recipients}>
                                    {COLLEAGUES.slice(0, 8).map((c) => {
                                        return (
                                            <div key={c.name} className={styles.recipientBtn}>
                                                <span className={styles.recipientInitials}>
                                                    {c.initials}
                                                </span>
                                                <span style={{ flex: 1, minWidth: 0 }}>
                                                    <div className={styles.name}>{c.name}</div>
                                                    <div className={styles.label}>{c.role}</div>
                                                </span>
                                                <Checkbox
                                                    checked={selectedRecipients.includes(c.name)}
                                                    onChange={(e: CheckboxChangeEvent) => {
                                                        onRecipientChange(c.name, e.target.checked);
                                                    }}
                                                ></Checkbox>
                                            </div>
                                        );
                                    })}

                                    <div className={styles.subhead}>Access</div>
                                    <div className="miniseg">
                                        <Radio.Group
                                            options={accessOptions}
                                            defaultValue="view"
                                            optionType="button"
                                            buttonStyle="solid"
                                            onChange={(e: RadioChangeEvent) =>
                                                setAccess(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={styles.portfolioGroups}>
                                <div className={styles.subhead}>
                                    Portfolio groups{' '}
                                    <span className={styles.subLabel}>pick &amp; choose</span>
                                </div>

                                <div>
                                    {groups.map((group, index) => {
                                        return (
                                            <div className={styles.groups} key={index}>
                                                <Checkbox
                                                    checked={selectedGroups.some(
                                                        (item) => item.id == group.id
                                                    )}
                                                    onChange={(e: CheckboxChangeEvent) => {
                                                        onGroupsChange(group, e.target.checked);
                                                    }}
                                                ></Checkbox>

                                                <span style={{ flex: 1, minWidth: 0 }}>
                                                    <div className={styles.name}>
                                                        {group.name}{' '}
                                                        {/* {g.smart && (
                            <span className="smart-tag">
                              <ThunderboltFilled /> SMART
                            </span>
                          )} */}
                                                    </div>
                                                    <div className={styles.label}>
                                                        {group.portfolioSelectionIds?.length}{' '}
                                                        portfolio
                                                        {group.portfolioSelectionIds?.length !== 1
                                                            ? 's'
                                                            : ''}
                                                    </div>
                                                </span>

                                                <Button
                                                    type={inclView.has(index) ? 'text' : 'primary'}
                                                    title="Include all of this group's saved views (breakdown, metrics, periods & display)"
                                                    onClick={() => onToggleView(index)}
                                                    style={{ fontSize: 10.5 }}
                                                >
                                                    <SettingOutlined /> incl.
                                                    {group.views?.length} view
                                                    {group.views?.length !== 1 ? 's' : ''}
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>

                                {customPeriods.length > 0 && (
                                    <div className={styles.workspace}>
                                        <div className={styles.subhead}>Workspace</div>

                                        <div className={styles.periods}>
                                            <div>
                                                Custom periods{' '}
                                                <span className={styles.period}>
                                                    ({customPeriods.map((c) => c.label).join(', ')})
                                                </span>
                                            </div>

                                            <div className="tog">
                                                <Switch
                                                    defaultChecked={inclPeriods}
                                                    onChange={onTogglePeriods}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {isShareSuccess && (
                    <>
                        <div className={styles.shareSection}>
                            <div className={styles.msg}>
                                <div className={styles.icon}>
                                    <CheckOutlined />
                                </div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 680 }}>
                                        Shared with {selectedRecipients.length}{' '}
                                        {selectedRecipients.length === 1 ? 'person' : 'people'}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 11.5,
                                            color: 'var(--ant-color-tertiary)',
                                        }}
                                    >
                                        They can <b>{access === 'view' ? 'view' : 'view & edit'}</b>{' '}
                                        {selectedGroups.length} group
                                        {selectedGroups.length !== 1 ? 's' : ''}.
                                    </div>
                                </div>
                            </div>

                            <div className="subhead">Recipients</div>
                            <div className="chips" style={{ marginBottom: 16 }}>
                                {selectedRecipients.map((r) => (
                                    <span key={r} className="chip on" style={{ cursor: 'default' }}>
                                        {r}
                                    </span>
                                ))}
                            </div>

                            <div className="subhead">Shareable link</div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <Input
                                    readOnly
                                    value={shareResult?.link}
                                    onFocus={(e) => e.currentTarget.select()}
                                    style={{
                                        flex: 1,
                                        fontFamily:
                                            'ui-monospace, SFMono-Regular, Menlo, monospace',
                                        fontSize: 11.5,
                                    }}
                                />
                                <Button
                                    type="primary"
                                    className="btn sm primary2"
                                    style={{ flex: 'none' }}
                                    onClick={onLinkCopy}
                                >
                                    {linkCopied ? (
                                        <>
                                            <CheckOutlined /> Copied
                                        </>
                                    ) : (
                                        'Copy'
                                    )}
                                </Button>
                            </div>
                            <div
                                className="mini-note"
                                style={{ color: 'var(--ant-color-tertiary)', marginTop: 10 }}
                            >
                                Anyone at the firm with this link and access can open a copy of the
                                selected groups
                                {access === 'edit' ? ' and edit their views' : ''}.
                            </div>
                        </div>
                    </>
                )}
            </div>

            <Divider />

            <div className={styles.pgFoot}>
                {!isShareSuccess && (
                    <>
                        <div>
                            <span
                                className="cnt"
                                style={{ fontSize: 11.5, color: 'var(--ant-color-text-secondary)' }}
                            >
                                <b>{groups.length}</b> group{groups.length !== 1 ? 's' : ''}
                                {/* {f.viewCount ? ` · ${f.viewCount} with view` : ""} */}
                                {inclPeriods ? ' · periods' : ''} ·
                                {access === 'view' ? 'Can view' : 'Can edit'}
                            </span>
                        </div>
                        <div className={styles.actionBtns}>
                            <Button className="btn" onClick={endShare}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                disabled={!canShare}
                                onClick={() => {
                                    onShare();
                                    setIsShareSuccess(true);
                                }}
                            >
                                Share <RightOutlined />
                            </Button>
                        </div>
                    </>
                )}

                {isShareSuccess && (
                    <>
                        <div>
                            <span className="cnt">
                                <span className="cfg-save" style={{ color: 'var(--pos)' }}>
                                    <CheckCircleFilled /> Shared
                                </span>{' '}
                                with <b>{selectedRecipients.length}</b>
                            </span>
                        </div>

                        <div className={styles.actionBtns}>
                            <Button
                                onClick={() => {
                                    setIsShareSuccess(false);
                                }}
                            >
                                Share more
                            </Button>
                            <Button type="primary" onClick={endShare}>
                                Back to groups
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
