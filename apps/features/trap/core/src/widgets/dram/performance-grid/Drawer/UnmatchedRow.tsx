import styles from './ClassEditor.module.scss';
export function UnmatchedRow({
    id,
    value,
    onChange,
}: {
    id: string;
    value: string;
    onChange: (v: 'bucket' | 'exclude') => void;
}) {
    return (
        <div className={styles['unm']}>
            <label htmlFor={id}>Unmatched positions</label>
            <select
                id={id}
                className={styles['input']}
                value={value}
                onChange={(e) => onChange(e.target.value as 'bucket' | 'exclude')}
            >
                <option value="bucket">Show as Unclassified</option>
                <option value="exclude">Exclude from view</option>
            </select>
            <span className={styles['cap']}>C2</span>
        </div>
    );
}
