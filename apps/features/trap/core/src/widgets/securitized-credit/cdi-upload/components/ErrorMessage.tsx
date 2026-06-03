import { theme, Button } from 'antd';
import styles from './ErrorMessage.module.scss';

export const ErrorMessage = ({ errorMsg, reset }: { errorMsg: string; reset: () => void }) => {
    const { token } = theme.useToken();

    return (
        <div className={styles.wrapper}>
            <span
                className={styles.text}
                style={{
                    color: token.colorError,
                }}
            >
                {errorMsg}
            </span>

            <Button size="small" onClick={reset}>
                Try again
            </Button>
        </div>
    );
};