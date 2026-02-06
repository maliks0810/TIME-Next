import { Form } from 'antd';
import styles from './lib/styles.module.scss';
import NewsSidebar from './features/NewsSidebar';
import NewsContent from './features/NewsContent';
import RightSideMenu from './features/RightSideMenu';

export default function App() {
    const [form] = Form.useForm();

    return (
        <Form form={form} className={styles['levered-finance-news-form']}>
            <div className={styles['main-container']}>
                <NewsSidebar />
                <NewsContent />
                <RightSideMenu />
            </div>
        </Form>
    );
}
