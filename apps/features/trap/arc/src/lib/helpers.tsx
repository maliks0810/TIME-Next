/* eslint-disable react/prop-types */
import { NewAsset, TRAPDatePickerProps, TableRow } from './types';
import type { DatePickerProps } from 'antd';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';

/* eslint-disable @typescript-eslint/no-explicit-any */
export function extractCallDate(payload: unknown): string {
    // Must return YYYY-MM-DD or ''
    const coerceToYMD = (v: unknown): string => {
        if (typeof v !== 'string') return '';
        const s = v.trim().replace(/^"|"$/g, '');

        // exact YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

        // ISO with time -> take date portion
        if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.slice(0, 10);

        return '';
    };

    const tryParse = (s: string): any | null => {
        try {
            return JSON.parse(s);
        } catch {
            return null;
        }
    };

    if (payload && typeof payload === 'object') {
        const obj: any = payload;

        const arr = Array.isArray(obj?.payload) ? obj.payload : [];
        const call = arr.find((x: any) => String(x?.type).toUpperCase() === 'CALL_DATE');
        if (!call) return '';

        return coerceToYMD(call?.parameters?.callDate) || coerceToYMD(call?.parameters);
    }

    if (typeof payload === 'string') {
        const s1 = payload.trim();
        const obj1 = tryParse(s1);
        if (obj1) {
            const obj2 = typeof obj1 === 'string' ? tryParse(obj1) : obj1;
            return extractCallDate(obj2);
        }

        const match = s1.match(/\d{4}-\d{2}-\d{2}/);
        return match?.[0] ?? '';
    }

    return '';
}

export function extractCallDateText(payload: unknown): string {
    const tryParse = (s: string): any | null => {
        try {
            return JSON.parse(s);
        } catch {
            return null;
        }
    };

    if (payload && typeof payload === 'object') {
        const obj: any = payload;

        const arr = Array.isArray(obj?.payload) ? obj.payload : [];
        const call = arr.find((x: any) => String(x?.type).toUpperCase() === 'CALL_DATE');
        if (!call) return '';

        return call?.parameters?.callDate;
    }

    if (typeof payload === 'string') {
        const s1 = payload.trim();
        const obj1 = tryParse(s1);
        if (obj1) {
            const obj2 = typeof obj1 === 'string' ? tryParse(obj1) : obj1;
            return extractCallDateText(obj2);
        }
    }

    return '';
}

export function extractCollateralType(payload: unknown): string {
    const tryParse = (s: string): any | null => {
        try {
            return JSON.parse(s);
        } catch {
            return null;
        }
    };

    if (payload && typeof payload === 'object') {
        const obj: any = payload;

        const arr = Array.isArray(obj?.payload) ? obj.payload : [];
        const call = arr.find((x: any) => String(x?.type).toUpperCase() === 'COLLATERAL_TYPE');
        if (!call) return '';

        return call?.parameters?.collateralType;
    }

    if (typeof payload === 'string') {
        const s1 = payload.trim();
        const obj1 = tryParse(s1);
        if (obj1) {
            const obj2 = typeof obj1 === 'string' ? tryParse(obj1) : obj1;
            return extractCollateralType(obj2);
        }

        const match = s1.match(/\d{4}-\d{2}-\d{2}/);
        return match?.[0] ?? '';
    }

    return '';
}

export function extractCallable(payload: unknown): string {
    const tryParse = (s: string): any | null => {
        try {
            return JSON.parse(s);
        } catch {
            return null;
        }
    };
    if (payload && typeof payload === 'object') {
        const obj: any = payload;

        const arr = Array.isArray(obj?.payload) ? obj.payload : [];
        const call = arr.find((x: any) => String(x?.type).toUpperCase() === 'CALLABLE');
        if (!call) return '';

        return call?.parameters?.callable;
    }

    if (typeof payload === 'string') {
        const s1 = payload.trim();
        const obj1 = tryParse(s1);
        if (obj1) {
            const obj2 = typeof obj1 === 'string' ? tryParse(obj1) : obj1;
            return extractCallable(obj2);
        }

        const match = s1.match(/\d{4}-\d{2}-\d{2}/);
        return match?.[0] ?? '';
    }

    return '';
}

export function extractPrepaymentType(payload: unknown): string {
    const tryParse = (s: string): any | null => {
        try {
            return JSON.parse(s);
        } catch {
            return null;
        }
    };

    if (payload && typeof payload === 'object') {
        const obj: any = payload;

        const arr = Array.isArray(obj?.payload) ? obj.payload : [];
        const speed = arr.find((x: any) => String(x?.type).toUpperCase() === 'SPEED_OVERRIDES');
        if (!speed) return '';

        return speed?.parameters?.prepaymentType;
    }

    if (typeof payload === 'string') {
        const s1 = payload.trim();
        const obj1 = tryParse(s1);
        if (obj1) {
            const obj2 = typeof obj1 === 'string' ? tryParse(obj1) : obj1;
            return extractPrepaymentType(obj2);
        }

        const match = s1.match(/\d{4}-\d{2}-\d{2}/);
        return match?.[0] ?? '';
    }

    return '';
}

export function extractInfoInterestRateScenarioType(payload: unknown): string {
    const tryParse = (s: string): any | null => {
        try {
            return JSON.parse(s);
        } catch {
            return null;
        }
    };

    if (payload && typeof payload === 'object') {
        const obj: any = payload;

        const arr = Array.isArray(obj?.payload) ? obj.payload : [];
        const secruitySettings = arr.find((x: any) => String(x?.type).toUpperCase() === 'SECURITY_SETTINGS');
        if (!secruitySettings) return '';

        return secruitySettings?.parameters?.interestRateScenario;
    }

    if (typeof payload === 'string') {
        const s1 = payload.trim();
        const obj1 = tryParse(s1);
        if (obj1) {
            const obj2 = typeof obj1 === 'string' ? tryParse(obj1) : obj1;
            return extractInfoInterestRateScenarioType(obj2);
        }

        const match = s1.match(/\d{4}-\d{2}-\d{2}/);
        return match?.[0] ?? '';
    }

    return '';
}
export function extractInfoModelFamilyOverrideType(payload: unknown): string {
    const tryParse = (s: string): any | null => {
        try {
            return JSON.parse(s);
        } catch {
            return null;
        }
    };

    if (payload && typeof payload === 'object') {
        const obj: any = payload;

        const arr = Array.isArray(obj?.payload) ? obj.payload : [];
        const secruitySettings = arr.find((x: any) => String(x?.type).toUpperCase() === 'SECURITY_SETTINGS');
        if (!secruitySettings) return '';

        return secruitySettings?.parameters?.modelFamilyOverride;
    }

    if (typeof payload === 'string') {
        const s1 = payload.trim();
        const obj1 = tryParse(s1);
        if (obj1) {
            const obj2 = typeof obj1 === 'string' ? tryParse(obj1) : obj1;
            return extractInfoModelFamilyOverrideType(obj2);
        }

        const match = s1.match(/\d{4}-\d{2}-\d{2}/);
        return match?.[0] ?? '';
    }

    return '';
}

export function extractOriginalAssetSetupId(payload: unknown): string {
    const tryParse = (s: string): any | null => {
        try {
            return JSON.parse(s);
        } catch {
            return null;
        }
    };

    if (payload && typeof payload === 'object') {
        const obj: any = payload;

        const arr = Array.isArray(obj?.payload) ? obj.payload : [];
        const secruitySettings = arr.find((x: any) => String(x?.type).toUpperCase() === 'CORRECTION');
        if (!secruitySettings) return '';

        return secruitySettings?.parameters?.assetAnalyticsSetupId;
    }

    if (typeof payload === 'string') {
        const s1 = payload.trim();
        const obj1 = tryParse(s1);
        if (obj1) {
            const obj2 = typeof obj1 === 'string' ? tryParse(obj1) : obj1;
            return extractOriginalAssetSetupId(obj2);
        }

        const match = s1.match(/\d{4}-\d{2}-\d{2}/);
        return match?.[0] ?? '';
    }

    return '';
}

export function extractPrepaymentSpeed(payload: unknown): string {
    const tryParse = (s: string): any | null => {
        try {
            return JSON.parse(s);
        } catch {
            return null;
        }
    };

    if (payload && typeof payload === 'object') {
        const obj: any = payload;

        const arr = Array.isArray(obj?.payload) ? obj.payload : [];
        const speed = arr.find((x: any) => String(x?.type).toUpperCase() === 'SPEED_OVERRIDES');
        if (!speed) return '';

        return speed?.parameters?.prepaymentSpeed;
    }

    if (typeof payload === 'string') {
        const s1 = payload.trim();
        const obj1 = tryParse(s1);
        if (obj1) {
            const obj2 = typeof obj1 === 'string' ? tryParse(obj1) : obj1;
            return extractPrepaymentSpeed(obj2);
        }

        const match = s1.match(/\d{4}-\d{2}-\d{2}/);
        return match?.[0] ?? '';
    }

    return '';
}

export function extractDefaultType(payload: unknown): string {
    const tryParse = (s: string): any | null => {
        try {
            return JSON.parse(s);
        } catch {
            return null;
        }
    };

    if (payload && typeof payload === 'object') {
        const obj: any = payload;

        const arr = Array.isArray(obj?.payload) ? obj.payload : [];
        const speed = arr.find((x: any) => String(x?.type).toUpperCase() === 'SPEED_OVERRIDES');
        if (!speed) return '';

        return speed?.parameters?.defaultType;
    }

    if (typeof payload === 'string') {
        const s1 = payload.trim();
        const obj1 = tryParse(s1);
        if (obj1) {
            const obj2 = typeof obj1 === 'string' ? tryParse(obj1) : obj1;
            return extractDefaultType(obj2);
        }

        const match = s1.match(/\d{4}-\d{2}-\d{2}/);
        return match?.[0] ?? '';
    }

    return '';
}

export function extractDefaultSpeed(payload: unknown): string {
    const tryParse = (s: string): any | null => {
        try {
            return JSON.parse(s);
        } catch {
            return null;
        }
    };

    if (payload && typeof payload === 'object') {
        const obj: any = payload;

        const arr = Array.isArray(obj?.payload) ? obj.payload : [];
        const speed = arr.find((x: any) => String(x?.type).toUpperCase() === 'SPEED_OVERRIDES');
        if (!speed) return '';

        return speed?.parameters?.defaultSpeed;
    }

    if (typeof payload === 'string') {
        const s1 = payload.trim();
        const obj1 = tryParse(s1);
        if (obj1) {
            const obj2 = typeof obj1 === 'string' ? tryParse(obj1) : obj1;
            return extractDefaultSpeed(obj2);
        }

        const match = s1.match(/\d{4}-\d{2}-\d{2}/);
        return match?.[0] ?? '';
    }

    return '';
}

export function extractSeverity(payload: unknown): string {
    const tryParse = (s: string): any | null => {
        try {
            return JSON.parse(s);
        } catch {
            return null;
        }
    };

    if (payload && typeof payload === 'object') {
        const obj: any = payload;

        const arr = Array.isArray(obj?.payload) ? obj.payload : [];
        const speed = arr.find((x: any) => String(x?.type).toUpperCase() === 'SPEED_OVERRIDES');
        if (!speed) return '';

        return speed?.parameters?.severity;
    }

    if (typeof payload === 'string') {
        const s1 = payload.trim();
        const obj1 = tryParse(s1);
        if (obj1) {
            const obj2 = typeof obj1 === 'string' ? tryParse(obj1) : obj1;
            return extractSeverity(obj2);
        }

        const match = s1.match(/\d{4}-\d{2}-\d{2}/);
        return match?.[0] ?? '';
    }

    return '';
}

export function extractDelinquency(payload: unknown): string {
    const tryParse = (s: string): any | null => {
        try {
            return JSON.parse(s);
        } catch {
            return null;
        }
    };

    if (payload && typeof payload === 'object') {
        const obj: any = payload;

        const arr = Array.isArray(obj?.payload) ? obj.payload : [];
        const speed = arr.find((x: any) => String(x?.type).toUpperCase() === 'SPEED_OVERRIDES');
        if (!speed) return '';

        return speed?.parameters?.delinquency;
    }

    if (typeof payload === 'string') {
        const s1 = payload.trim();
        const obj1 = tryParse(s1);
        if (obj1) {
            const obj2 = typeof obj1 === 'string' ? tryParse(obj1) : obj1;
            return extractDelinquency(obj2);
        }

        const match = s1.match(/\d{4}-\d{2}-\d{2}/);
        return match?.[0] ?? '';
    }

    return '';
}

export function speedOverridesExist(payload: unknown): boolean {
    if (!payload) return false;

    let obj: any;

    if (typeof payload === 'string') {
        try {
            obj = JSON.parse(payload);
        } catch {
            return false;
        }
    } else if (typeof payload === 'object') {
        obj = payload;
    } else {
        return false;
    }

    const arr = Array.isArray(obj?.payload) ? obj.payload : [];
    if (!arr.length) return false;

    const speedNode = arr.find(
        (x: any) => String(x?.type).toUpperCase() === 'SPEED_OVERRIDES'
    );

    if (!speedNode || typeof speedNode.parameters !== 'object') {
        return false;
    }

    const SPEED_OVERRIDE_KEYS = [
        'prepaymentType',
        'prepaymentSpeed',
        'defaultType',
        'defaultSpeed',
        'severity',
        'delinquency'
    ];

    return SPEED_OVERRIDE_KEYS.some((key) => {
        const val = speedNode.parameters[key];
        return (
            typeof val === 'number' ||
            (typeof val === 'string' && val.trim().length > 0)
        );
    });
}

export const normalizeStatus = (s?: string | null) => (s ?? '').trim().toUpperCase();

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null;

// Function that will extract the response from multiple types of API responses
export function extractResponseArray(payload: unknown): Record<string, unknown>[] {
    const p = payload as any;

    if (Array.isArray(p)) return p;

    if (isObj(p) && Array.isArray(p.response)) return p.response;

    if (isObj(p) && isObj(p.data) && Array.isArray(p.data.response)) return p.data.response;

    if (isObj(p) && Array.isArray(p.data)) return p.data;

    if (isObj(p) && Array.isArray(p.result)) return p.result;
    if (isObj(p) && Array.isArray(p.results)) return p.results;
    if (isObj(p) && Array.isArray(p.items)) return p.items;

    return [];
}

export const toRows = (items: NewAsset[]): TableRow<NewAsset>[] =>
    items.map((it) => ({
        key: it.assetAnalyticsSetupId,
        assetAnalyticsSetupId: it.assetAnalyticsSetupId,
        aladdinId: it.aladdinId,
        status: it.status,
        createdDate: it.createdDate,
        assetType: it.assetType,
        raw: it,
    }));

const parseDate = (dateString: string): Date => {
    if (dateString.includes('T')) {
        return new Date(dateString);
    }

    const dateTimeWOTimeZone = dateString
        .trim()
        .trim()
        .replace(/\s+[\+\-]\d{2}:\d{2}$/, '');

    return new Date(dateTimeWOTimeZone + ' UTC');
};

const formatToPST = (date: Date): string => {
    const pstOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    };

    const formatter = new Intl.DateTimeFormat('en-US', pstOptions);
    const parts = formatter.formatToParts(date);

    const day = parts.find((p) => p.type === 'day')?.value;
    const month = parts.find((p) => p.type === 'month')?.value;
    const year = parts.find((p) => p.type === 'year')?.value;
    const hour = parts.find((p) => p.type === 'hour')?.value;
    const minute = parts.find((p) => p.type === 'minute')?.value;

    return `${month}/${day}/${year} ${hour}:${minute} PST`;
};

export const convertDateToPST = (dateString = ''): string => {
    if (dateString === '') {
        return dateString;
    }
    if (!dateString || typeof dateString !== 'string') {
        throw new Error('Invalid date string provided');
    }

    const date = parseDate(dateString);

    if (isNaN(date.getTime())) {
        throw new Error(`Unable to parse date: ${dateString}`);
    }

    return formatToPST(date);
};

export const nullspace = '';

export const formatNumNullSafe = (n: number | null | undefined, digits = 3): string => {
    return typeof n === 'number' ? n.toFixed(digits) : nullspace;
};

export const formatPctNullSafe = (n: number | null | undefined, digits = 2): string => {
    return typeof n === 'number' ? `${n.toFixed(digits)}%` : nullspace;
};

export const formatDate = (s?: string) => (s ? s : '');

export const TRAPDatePicker: React.FC<TRAPDatePickerProps> = ({
    id,
    style,
    placeholder = 'Select Date',
    format = 'YYYY-MM-DD',
    disabled,
    allowClear = true,
    value,
    onChange,
}) => {
    const parsed = value ? dayjs(value, format, true) : null;
    const pickerValue = parsed && parsed.isValid() ? parsed : null;

    const handleChange: DatePickerProps['onChange'] = (date, dateString) => {
        const str = Array.isArray(dateString) ? (dateString[0] ?? '') : dateString;
        onChange?.(str || '', date ?? null);
    };

    return (
        <DatePicker
            id={id}
            style={style}
            placeholder={placeholder}
            format={format}
            value={pickerValue}
            onChange={handleChange}
            disabled={disabled}
            allowClear={allowClear}
            size="small"
        />
    );
};

export function formatIso(iso?: string | null): string {
    if (!iso) return '';
    const d = dayjs(iso);
    if (!d.isValid()) return '';
    return d.format('YYYY-MM-DD hh:mm A');
}

export const hasValue = (v: unknown) =>
    v !== null &&
    v !== undefined &&
    !(typeof v === 'string' && v.trim() === '');
