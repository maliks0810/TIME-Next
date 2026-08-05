import { BRAND_LIGHT, BRAND_DARK } from '../../../../theme/constants';
import { BrandSwatch } from './ThemePanel';
import styles from './ThemePanel.module.scss';
export function BrandInfo() {
    const rows = (list: BrandSwatch[]) =>
        list.map((s) => (
            <div className={styles['bi-row']} key={s.role}>
                <span className={styles['bi-sw']} style={{ background: s.hex }} />
                <span className={styles['bi-role']}>{s.role}</span>
                <span className={styles['bi-name']}>{s.name}</span>
                <span className={styles['bi-hex']}>{s.hex}</span>
            </div>
        ));
    return (
        <div className={styles['bi']}>
            <div className={styles['bi-hd']}>TCW brand — from the design &amp; UI kit</div>
            <div className={styles['bi-type']}>
                <b>Type</b> Monument Grotesk
                <span className={styles['bi-dim']}> · Helvetica (guideline backup)</span>
            </div>
            <div className={styles['bi-sec']}>Light mode</div>
            {rows(BRAND_LIGHT)}
            <div className={styles['bi-sec']}>Dark mode</div>
            {rows(BRAND_DARK)}
            <div className={styles['bi-ft']}>
                Dark mode uses lighter steps from each primary`s published tint scale so they read
                on the dark ground. Data Red has no tint scale, so it stays at brand base. Source:
                TCW Brand Guidelines.
            </div>
        </div>
    );
}
