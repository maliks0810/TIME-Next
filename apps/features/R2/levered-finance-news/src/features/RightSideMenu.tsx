import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { lliLocation } from '../lib/config';
import styles from '../lib/styles.module.scss';
import AdvancedSearchForm from './AdvancedSearchForm';

export default function RightSideMenu() {
    return (
        <aside className={styles['right-sidebar']}>
            <div className={styles['search-form']}>
                <h2>Filters</h2>
                <AdvancedSearchForm />
                <h2>Miscellanous</h2>
                <a href={lliLocation} download className={styles['download-lli']}>
                    <Button
                        icon={<DownloadOutlined />}
                        title={'Download LLI Factsheet'}
                        className={styles['download']}
                    >
                        Download LLI Factsheet
                    </Button>
                </a>
            </div>
        </aside>
    );
}
