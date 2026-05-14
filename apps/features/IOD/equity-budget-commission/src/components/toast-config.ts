export type ToastType = 'info' | 'warning' | 'error' | 'success' | 'custom';

export interface ToastConfig {
  visible: boolean;
  message: string;
  // Use the DevExtreme ToastType union type if available, or define it manually:
  type: ToastType | 'info' | 'warning' | 'error' | 'success' | 'custom';
}