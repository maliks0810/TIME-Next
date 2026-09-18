import { useMemo, useState, type ReactNode } from 'react';
import { ApartmentOutlined } from '@ant-design/icons';
import type { BreakdownLevel, AttributeLevel, TaxonomyLevel } from '../data/types';
import styles from './ClassEditor.module.scss';
import { useAttributionStore } from '../state/useStore';
import clsx from 'clsx';
import { Select } from 'antd';

const CLASS_META: [BreakdownLevel['cls'], ReactNode, string, string][] = [
    [
        'attribute',
        <ApartmentOutlined key="attribute-icon" />,
        'Attribute',
        'Discrete / hierarchical',
    ],
    ['taxonomy', <ApartmentOutlined key="attribute-icon" />, 'Taxonomy', ''],
    // ['band', <SlidersOutlined key="band-icon" />, 'Range / Band', 'Numeric bands'],
    // ['ntile', <AppstoreOutlined key="ntile-icon" />, 'N-tile', 'Equal buckets'],
    // ['conditional', <FilterOutlined key="conditional-icon" />, 'Conditional', 'AND/OR rules'],
];

export const CAT_ATTRS = ['sector', 'region', 'industry', 'gicsGroup', 'currency'];

/** Editor for the currently-selected level's grouping class + config. */
export function ClassEditor({ level, index }: { level: BreakdownLevel; index: number }) {
    const setLevelClass = useAttributionStore((state) => state.setLevelClass);
    const updateLevels = useAttributionStore((state) => state.updateLevels);
    const attributionCatalog = useAttributionStore((state) => state.attributionCatalog);

    const [selectedTaxonomy, setSelectedTaxonomy] = useState<string>();

    const taxanomiesCatalog = useAttributionStore((state) => state.taxanomiesCatalog);
    const hierarchyOptions = useMemo(
        () =>
            selectedTaxonomy
                ? taxanomiesCatalog[selectedTaxonomy]?.map((el) => ({
                      label: el.levelLabels,
                      value: el.capabilityKey,
                  }))
                : [],
        [selectedTaxonomy]
    );
    const attributeFieldId = `breakdown-${index}-attribute-field`;

    const handleTaxonomySelect = (key: string) => {
        setSelectedTaxonomy(key);
        updateLevels((levels) => {
            (levels[index] as TaxonomyLevel).config.value = '';
            (levels[index] as TaxonomyLevel).config.label = selectedTaxonomy || '';
            (levels[index] as TaxonomyLevel).config.level = '';
        });
    };
    const handleLevelSelect = (value: string) => {
        const levelLabel = hierarchyOptions.find((el) => el.value === value)?.label;
        updateLevels((levels) => {
            (levels[index] as TaxonomyLevel).config.value = value;
            (levels[index] as TaxonomyLevel).config.label = selectedTaxonomy || '';
            (levels[index] as TaxonomyLevel).config.level = levelLabel || '';
        });
    };
    const pick = (
        <div className={styles['classpick']}>
            {CLASS_META.map(([cls, ic, title, desc]) => (
                <button
                    key={cls}
                    type="button"
                    className={clsx(styles['classopt'], {
                        [styles['classopt-on']]: level.cls === cls,
                    })}
                    onClick={() => setLevelClass(index, cls)}
                >
                    <div className={styles['t']}>
                        <span className={styles['gi']}>{ic}</span>
                        {title}
                    </div>
                    <div className={styles['d']}>{desc}</div>
                </button>
            ))}
        </div>
    );

    if (!attributionCatalog) return null;
    let form = null;

    const attributions = Object.entries(attributionCatalog);
    if (level.cls === 'attribute') {
        form = (
            <div className={styles['f-row']}>
                <label htmlFor={attributeFieldId}>Field</label>
                <select
                    id={attributeFieldId}
                    className={styles['input']}
                    style={{ flex: 1 }}
                    value={level.config.field}
                    aria-placeholder="Select attribute"
                    onChange={(e) => {
                        const flatten = Object.keys(attributionCatalog)
                            .map((el) => attributionCatalog[el])
                            .flat();
                        const label = flatten.find((el) => el[0] === e.target.value)?.[1] || '';

                        updateLevels((levels) => {
                            (levels[index] as AttributeLevel).config.field = e.target.value;
                            (levels[index] as AttributeLevel).config.label = label;
                        });
                    }}
                >
                    <option value="" disabled selected hidden>
                        Select an attribute
                    </option>
                    {attributions.length === 0 ? (
                        <option value="empty" disabled>
                            No attributes available
                        </option>
                    ) : (
                        attributions.map(([cat, arr]) => (
                            <optgroup key={cat} label={cat}>
                                {arr.map(([k, v]) => (
                                    <option key={k} value={k}>
                                        {v}
                                    </option>
                                ))}
                            </optgroup>
                        ))
                    )}
                </select>
            </div>
        );
    }

    if (level.cls === 'taxonomy') {
        form = (
            <div className={styles.taxonomies}>
                <div className={styles.taxonomy}>
                    <label htmlFor="taxonomy">Taxonomy</label>
                    <Select
                        className={styles['taxonomy-select']}
                        id="taxonomy"
                        options={Object.keys(taxanomiesCatalog).map((el) => ({
                            label: el,
                            value: el,
                        }))}
                        onSelect={handleTaxonomySelect}
                    ></Select>
                </div>
                <div className={styles.taxonomy}>
                    <label htmlFor="level">Hierarchy level</label>
                    <Select
                        onSelect={(e) => handleLevelSelect(e)}
                        className={styles['taxonomy-select']}
                        id="level"
                        options={hierarchyOptions}
                    ></Select>
                </div>
            </div>
        );
    }
    return (
        <>
            {pick}
            {form}
        </>
    );
}
