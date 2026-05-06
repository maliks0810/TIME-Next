import { Typography, theme, Button } from 'antd';
import styles from './ErrorMessage.module.scss';
const { Text } = Typography;
export const ErrorMessage = ({ errorMsg, reset }: { errorMsg: string; reset: () => void }) => {
    const { token } = theme.useToken();

    return (
        <div className={styles.wrapper}>
            <Text
                style={{
                    fontSize: 12,
                    color: token.colorError,
                    textAlign: 'center',
                }}
            >
                {errorMsg}
            </Text>
            <Button size="small" onClick={reset}>
                Try again
            </Button>
        </div>
    );
};
