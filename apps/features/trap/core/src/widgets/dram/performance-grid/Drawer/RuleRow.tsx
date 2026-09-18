import { CloseOutlined } from '@ant-design/icons';
import { SECTORS, SECS } from '../data/universe';
import { useAttributionStore } from '../state/useStore';
import { Rule, ConditionalLevel, CompareOp } from '../types';
import { CAT_ATTRS } from './ClassEditor';
import styles from './GridDrawer.module.scss';
import { NUM_ATTRS } from '../data/catalog';
export function RuleRow({
    index,
    gi,
    ri,
    rule,
    showJoin,
}: {
    index: number;
    gi: number;
    ri: number;
    rule: Rule;
    showJoin: boolean;
}) {
    const updateLevels = useAttributionStore((store) => store.updateLevels);
    const cat = CAT_ATTRS.includes(rule.attr);
    const attrs: Record<string, string> = {
        sector: 'Sector',
        gicsGroup: 'Industry Grp',
        industry: 'Industry',
        region: 'Region',
        ...NUM_ATTRS,
    };

    const catOptions = (): string[] => {
        if (rule.attr === 'sector') return Object.keys(SECTORS);
        if (rule.attr === 'region') return ['N. America', 'Europe', 'Asia Pac'];
        if (rule.attr === 'currency') return ['USD', 'EUR', 'TWD'];
        if (rule.attr === 'gicsGroup') return [...new Set(SECS.map((s) => s.gicsGroup))];
        return [...new Set(SECS.map((s) => s.industry))];
    };

    const setRule = (patch: Partial<Rule>) =>
        updateLevels((d) => {
            const gg = (d[index] as ConditionalLevel).config.groups[gi];
            Object.assign(gg.rules[ri], patch);
        });

    return (
        <div className={styles['rule']}>
            <select
                aria-label="Rule attribute"
                style={{ maxWidth: 104 }}
                value={rule.attr}
                onChange={(e) => {
                    const v = e.target.value;
                    const isCat = CAT_ATTRS.includes(v);
                    setRule({
                        attr: v,
                        ...(isCat
                            ? {
                                  op: '=' as CompareOp,
                                  val:
                                      v === 'sector'
                                          ? 'Information Technology'
                                          : v === 'region'
                                            ? 'N. America'
                                            : v === 'currency'
                                              ? 'USD'
                                              : (SECS[0] as unknown as Record<string, string>)[v],
                              }
                            : {}),
                    });
                }}
            >
                {Object.entries(attrs).map(([k, v]) => (
                    <option key={k} value={k}>
                        {v}
                    </option>
                ))}
            </select>

            {cat ? (
                <span className={styles['muted']} style={{ fontSize: 11 }}>
                    is
                </span>
            ) : (
                <select
                    aria-label="Rule comparison"
                    style={{ width: 50 }}
                    value={rule.op}
                    onChange={(e) => setRule({ op: e.target.value as CompareOp })}
                >
                    {['≤', '<', '≥', '>', '='].map((o) => (
                        <option key={o}>{o}</option>
                    ))}
                </select>
            )}

            {cat ? (
                <select
                    aria-label="Rule value"
                    style={{ maxWidth: 130 }}
                    value={rule.val as string}
                    onChange={(e) => setRule({ val: e.target.value })}
                >
                    {catOptions().map((o) => (
                        <option key={o}>{o}</option>
                    ))}
                </select>
            ) : (
                <input
                    aria-label="Rule value"
                    className={styles['num']}
                    style={{ width: 50 }}
                    value={rule.val}
                    onChange={(e) => setRule({ val: e.target.value })}
                />
            )}

            <button
                type="button"
                className={styles['rm']}
                onClick={() =>
                    updateLevels((d) => {
                        (d[index] as ConditionalLevel).config.groups[gi].rules.splice(ri, 1);
                    })
                }
            >
                <CloseOutlined />
            </button>

            {showJoin && (
                <button
                    type="button"
                    className={styles['join']}
                    onClick={() =>
                        updateLevels((d) => {
                            const rl = (d[index] as ConditionalLevel).config.groups[gi].rules[ri];
                            rl.join = rl.join === 'OR' ? 'AND' : 'OR';
                        })
                    }
                >
                    {rule.join || 'AND'}
                </button>
            )}
        </div>
    );
}
