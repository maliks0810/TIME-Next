import { useEffect, useState } from "react";
import { Upload } from "antd";
import ExcelJS from 'exceljs';
import styles from "./UploaderWidget.module.scss";
import WidgetCardShell from "../../../components/widget-shell/WidgetCardShell";
import { WidgetComponentProps } from "../../../types/widget";
import { useSetWidgetValue } from "../../../state/Widgets/hooks";
import { useGetActiveTab } from "../../../state/Tabs/hooks";
import { fileUploaderMandatoryColumnMap, schemaToStateKeyMap } from "../../constants";
import { Uploader } from "./components/UploaderComponent";
import { findIfEntireFileToBeTransferred } from "./utils";
import { UploadState } from "../../securitized-credit/types";
import { Uploading } from "../../securitized-credit/cdi-upload/components/Uploading";
import { StateRow } from "../../securitized-credit/cdi-upload/components/StateRow";

export default function UploaderWidget(props: WidgetComponentProps) {
    const { widgetInstance: { config = {} } } = props;
    const activeTab = useGetActiveTab();
    const setWidgetValueToChannel = useSetWidgetValue();

    const [uploadState, setUploadState] = useState<UploadState>('idle');
    const [progress, setProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState("");

    const schemaKey = config?.params?.schemaKey as string;
    const fileFormatSelected = config?.params?.fileFormat as string;

    const stateKey = schemaToStateKeyMap[schemaKey];
    const mandatoryColumnKey = fileUploaderMandatoryColumnMap[schemaKey];
    const isEntireFileToBeTransferred = findIfEntireFileToBeTransferred(schemaKey);

    const handleProgressStateValues = (progressIndex: number, state: UploadState, errMsg: string) => {
        setProgress(progressIndex);
        setUploadState(state);
        setErrorMsg(errMsg);
    }

    const prepareFileContentUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            setProgress(30);
            const resultString = reader.result as string;
            const fileBase64 = resultString.includes(',')
                ? resultString.substring(resultString.indexOf(',') + 1)
                : resultString;
            setProgress(60);
            setWidgetValueToChannel({
                channelId: config.params?.channel,
                key: stateKey,
                activeTab,
                value: { fileType: file.type, fileName: file.name, fileBase64 }
            });
            handleProgressStateValues(100, 'success', '');
        };

        reader.onerror = () => {
            handleProgressStateValues(0, 'error', `${file.name} file read failed`);
        };
        reader.readAsDataURL(file);
    }

    const readCsvFile = (file: File) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const text = e.target?.result;
            if (typeof text !== "string") {
                handleProgressStateValues(0, 'error', `Unable to read the file ${file.name}!`);
                return;
            }

            const lines = text.split(/\r?\n/);
            setProgress(30);

            if (lines.length === 0 || !lines[0].trim()) {
                handleProgressStateValues(0, 'error', `The uploaded ${file.name} file is empty!`);
                return;
            }

            setProgress(60);
            const headers = lines[0].split(",").map(header => header.trim().toLowerCase());
            const columnIndex = headers.indexOf(mandatoryColumnKey.toLowerCase());

            if (columnIndex === -1) {
                handleProgressStateValues(0, 'error', `${mandatoryColumnKey} column is not found in the file ${file.name}!`);
                return;
            }

            const dataLines = lines.slice(1);
            const finalData = dataLines
                .map(line => line.split(",")[columnIndex]?.trim())
                .filter(cusip => cusip);

            setWidgetValueToChannel({
                channelId: config.params?.channel,
                key: stateKey,
                activeTab,
                value: finalData
            });
            handleProgressStateValues(100, 'success', '');
        };

        reader.onerror = () => {
            handleProgressStateValues(0, 'error', `${file.name} file read failed`);
        };

        reader.readAsText(file);
    };

    const readExcelFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const buffer = e.target?.result;
            if (!buffer || !(buffer instanceof ArrayBuffer)) {
                handleProgressStateValues(0, 'error', `Unable to read the file ${file.name}!`);
                return;
            }

            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(buffer);
            setProgress(20);

            const isEmptyFile = workbook.worksheets.every(sheet => sheet.actualRowCount === 0);

            if (isEmptyFile) {
                handleProgressStateValues(0, 'error', `The uploaded ${file.name} file is empty!`);
                return;
            }

            const worksheet = workbook.worksheets[0];
            let targetColumnIndex = -1;
            const columnValues: string[] = [];
            setProgress(30);

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) {
                    setProgress(50);
                    row.eachCell((headerCell, colNumber) => {
                        const headerCellText = String(headerCell.value ?? '');
                        if (headerCellText.trim().toLowerCase() === mandatoryColumnKey.toLowerCase()) {
                            targetColumnIndex = colNumber;
                        }
                    });
                    return;
                }

                if (targetColumnIndex !== -1) {
                    const cell: ExcelJS.Cell = row.getCell(targetColumnIndex);
                    let cellValue = cell.value;

                    if (cellValue && typeof cellValue === 'object') {
                        if ('text' in cellValue) cellValue = String(cellValue.text);
                        else if (cellValue instanceof Date) cellValue = cellValue.toISOString();
                        else cellValue = '';
                    } else {
                        cellValue = String(cellValue ?? '');
                    }

                    const stringifiedValue = cellValue.trim();
                    if (stringifiedValue !== '') {
                        columnValues.push(stringifiedValue);
                    }
                }
            });

            if (targetColumnIndex === -1) {
                handleProgressStateValues(0, 'error', `${mandatoryColumnKey} column is not found in the file ${file.name}!`);
                return;
            }

            setWidgetValueToChannel({
                key: stateKey,
                channelId: config.params?.channel,
                activeTab,
                value: columnValues,
            });
            handleProgressStateValues(100, 'success', '');
        };

        reader.onerror = () => {
            handleProgressStateValues(0, 'error', `${file.name} file read failed`);
        };

        reader.readAsArrayBuffer(file);
    };

    const csvFileuploadHandler = (file: File) => {
        const isCsv = file.type === 'text/csv' || file.name.endsWith('.csv');
        setProgress(10);
        if (!isCsv) {
            handleProgressStateValues(0, 'error', 'Please upload .csv file only!');
            return Upload.LIST_IGNORE;
        }

        if (isEntireFileToBeTransferred) {
            prepareFileContentUpload(file);
        } else {
            readCsvFile(file);
        }
        return;
    };

    const excelFileUploadHandler = (file: File) => {
        const isExcelFile = file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" && file.name.endsWith('.xlsx');
        if (!isExcelFile) {
            handleProgressStateValues(0, 'error', 'Please upload Excel (.xlsx) file only!');
            return Upload.LIST_IGNORE;
        }

        setProgress(10);

        if (isEntireFileToBeTransferred) {
            prepareFileContentUpload(file);

        } else {
            readExcelFile(file);
        }
        return;
    };

    const onUpload = (file: File) => {
        setUploadState('uploading');
        if (fileFormatSelected === ".csv") {
            csvFileuploadHandler(file);
        } else if (fileFormatSelected === ".xlsx") {
            excelFileUploadHandler(file);
        } else {
            handleProgressStateValues(0, 'error', "unsupported file format. Please upload: .csv & .xlsx formats only.")
        }
        return;
    }

    const reset = () => {
        handleProgressStateValues(0, 'idle', '');
        setWidgetValueToChannel({
            key: stateKey,
            channelId: config.params?.channel,
            activeTab,
            value: isEntireFileToBeTransferred ? { fileType: "", fileName: "", fileBase64: "" } : []
        });
    }

    useEffect(() => {
        reset();
    }, []);

    if (uploadState === 'uploading') {
            return <Uploading progress={progress} fileName={""} />;
        } else if (uploadState === 'success') {
            return (
                <StateRow
                    kind="success"
                    rich
                    title="Success"
                    detail={"File loaded successfully!"}
                    onAction={reset}
                />
            );
        } else if (uploadState === 'error') {
            return (
                <StateRow
                    kind="error"
                    rich
                    title="Upload failed"
                    detail={errorMsg}
                    onAction={reset}
                />
            );
        }

    return (
        <WidgetCardShell>
            <div className={styles.dropzoneWrapper}>
                <span className={styles.title}>{config?.params?.label}</span>
                <Uploader
                    onUpload={onUpload}
                    accept={fileFormatSelected}
                    onRemoveFile={reset}
                    showUploadList={true}
                    isRemoveFileAllowed={true}
                    setProgressStatus={handleProgressStateValues}
                />
            </div>
        </WidgetCardShell>
    );
}
