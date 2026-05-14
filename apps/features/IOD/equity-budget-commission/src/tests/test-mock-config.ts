import { 
  MaintenanceBroker, 
  MaintenanceDepartment, 
  MaintenanceDivision, 
  MaintenanceMasterBroker, 
  MaintenanceUser } from '@/datatypes/budget-maintenance-types';
import { ResearchBudget } from '@/datatypes/research-budget-types';

export type PopupProps = React.ComponentProps<typeof import('devextreme-react/data-grid').Popup>;  
export type SelectionProps = React.ComponentProps<typeof import('devextreme-react/data-grid').Selection>;  
//export type ButtonProps = React.ComponentProps<typeof import('devextreme-react/data-grid').Button>;  
export type FormProps = React.ComponentProps<typeof import('devextreme-react/data-grid').Form>; 
export type FormItemProps = React.ComponentProps<typeof import('devextreme-react/data-grid').FormItem>;
export type ItemProps = React.ComponentProps<typeof import('devextreme-react/data-grid').Item>;  
export type ToolbarProps = React.ComponentProps<typeof import('devextreme-react/data-grid').Toolbar>;  
export type LoadPanelProps = React.ComponentProps<typeof import('devextreme-react/data-grid').LoadPanel>;  
export type FilterRowProps = React.ComponentProps<typeof import('devextreme-react/data-grid').FilterRow>;  
export type ScrollingProps = React.ComponentProps<typeof import('devextreme-react/data-grid').Scrolling>;  
export type LookupProps = React.ComponentProps<typeof import('devextreme-react/data-grid').Lookup>;  

export type CallBackDataSetter_MstBroker = React.Dispatch<React.SetStateAction<MaintenanceMasterBroker[]>>;
export type CallBackDataSetter_Department = React.Dispatch<React.SetStateAction<MaintenanceDepartment[]>>;
export type CallBackDataSetter_Division = React.Dispatch<React.SetStateAction<MaintenanceDivision[]>>;
export type CallBackDataSetter_Broker = React.Dispatch<React.SetStateAction<MaintenanceBroker[]>>;
export type CallBackDataSetter_User = React.Dispatch<React.SetStateAction<MaintenanceUser[]>>;
export type CallBackDataSetter_ResearchBudget = React.Dispatch<React.SetStateAction<ResearchBudget[]>>;

export interface DataGridInstanceMock {  
  editRow: (rowIndex: number) => void;  
}  

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {  
    name?: string;  
    cssClass?: string;  
    text?: string;  
    visible?: boolean;  
    }

export interface ToastProps {  
  visible: boolean;  
  message: string;  
  onHidden?: () => void;  
  width?: number;  
  type?: string;  
  position?: string;  
  displayTime?: number;  
} 

export interface CheckBoxProps {  
  value?: boolean;  
  disabled?: boolean;  
}  
