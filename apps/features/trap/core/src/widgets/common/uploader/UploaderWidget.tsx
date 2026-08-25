import { useEffect } from "react";
import { message } from "antd";
import styles from "./UploaderWidget.module.scss";
import WidgetCardShell from "../../../components/widget-shell/WidgetCardShell";
import { WidgetComponentProps } from "../../../types/widget";
import { useSetWidgetValue } from "../../../state/Widgets/hooks";
import { useGetActiveTab } from "../../../state/Tabs/hooks";
import { schemaToStateKeyMap } from "../../constants";
import { Uploader } from "./components/UploaderComponent";

export default function UploaderWidget(props: WidgetComponentProps) {

    const { widgetInstance: { config = {} } } = props;
    const activeTab = useGetActiveTab();
    const setWidgetValueToChannel = useSetWidgetValue();
    const [messageApi, contextHolder] = message.useMessage();

    const schemaKey = config?.params?.schemaKey as string;
    const fileFormat = config?.params?.fileFormat as string;

    const stateKey = schemaToStateKeyMap[schemaKey];

    const onUpload = (file: File) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const text = e.target?.result;

            if (typeof text === "string") {
                const lines = text.split(/\r?\n/);

                if (lines.length === 0 || !lines[0].trim()) {
                    message.error(`The uploaded ${fileFormat} file is empty!`);
                    return;
                }

                const headers = lines[0].split(",").map(header => header.trim().toLowerCase());

                const cusipIndex = headers.indexOf(stateKey);

                if (cusipIndex === -1) {
                    message.error(`${stateKey} column is not found in the file uploaded!`);
                    return;
                }

                const dataLines = lines.slice(1);
                const cusipArray: string[] = dataLines
                    .map(line => line.split(",")[cusipIndex]?.trim())
                    .filter(cusip => cusip);
                messageApi.success(`${file.name} read locally successfully!`);
                setWidgetValueToChannel({
                    channelId: config.params?.channel,
                    value: cusipArray,
                    key: stateKey,
                    activeTab,
                });
            } else {
                messageApi.error("Unable to read file content!");
            }
        };

        reader.onerror = () => {
            messageApi.error("Unable to read file content!");
        };

        reader.readAsText(file);
        return;
    }

    const reset = () => {
        setWidgetValueToChannel({
            key: stateKey,
            channelId: config.params?.channel,
            activeTab,
            value: []
        });
    }

    useEffect(() => {
        reset();
    }, []);

    return (
        <WidgetCardShell>
            {contextHolder}
            <div className={styles.dropzoneWrapper}>
                <span className={styles.title}>{config?.params?.label}</span>
                <Uploader
                    onUpload={onUpload}
                    accept={fileFormat}
                    onRemoveFile={reset}
                    showUploadList={true}
                    isRemoveFileAllowed={true}
                />
            </div>
        </WidgetCardShell>
    );
}