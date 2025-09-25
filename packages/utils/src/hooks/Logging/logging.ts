import * as tlog from '@tcw/tlog';
import { JsonValueType } from '@tcw/tlog';

export enum LogLevel {
    'debug' = 'debug',
    'info' = 'info',
    'warn' = 'warn',
    'error' = 'error',
    'fatal' = 'fatal'
}

export function LogWarn(content: string, methodName?: string, eventId?: string, error?: Error, values?:  { [key: string]: JsonValueType; }) {
    tlog.warn(content, methodName, eventId, error, values);
}

export function LogInfo(content: string, methodName?: string, eventId?: string, error?: Error, values?:  { [key: string]: JsonValueType; }) {
    tlog.info(content, methodName, eventId, error, values);
}

export function LogError(error: Error, content: string, methodName?: string, eventId?: string, values?:  { [key: string]: JsonValueType; }) {
    tlog.error(error, content, methodName, eventId, values);
}

export function LogFatal(content: string, methodName?: string, eventId?: string, error?: Error, values?:  { [key: string]: JsonValueType; }) {
    tlog.fatal(content, methodName, eventId, error, values )
}