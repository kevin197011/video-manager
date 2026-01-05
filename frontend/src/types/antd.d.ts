// Type declarations for antd (Ant Design)
// This ensures TypeScript recognizes antd components when node_modules is not available

declare module 'antd' {
  import { ReactNode, ComponentType } from 'react';

  export interface CardProps {
    title?: ReactNode;
    extra?: ReactNode;
    children?: ReactNode;
    [key: string]: any;
  }

  export const Card: ComponentType<CardProps> & {
    Grid: ComponentType<any>;
    Meta: ComponentType<any>;
  };

  export interface ButtonProps {
    type?: 'default' | 'primary' | 'dashed' | 'link' | 'text';
    size?: 'small' | 'middle' | 'large';
    icon?: ReactNode;
    loading?: boolean;
    onClick?: (e: any) => void;
    children?: ReactNode;
    [key: string]: any;
  }

  export const Button: ComponentType<ButtonProps>;

  export interface TableProps<T = any> {
    dataSource?: T[];
    columns?: any[];
    loading?: boolean;
    pagination?: any;
    [key: string]: any;
  }

  export const Table: ComponentType<TableProps>;

  export interface SelectProps {
    value?: any;
    onChange?: (value: any) => void;
    placeholder?: string;
    allowClear?: boolean;
    style?: any;
    children?: ReactNode;
    [key: string]: any;
  }

  export const Select: ComponentType<SelectProps> & {
    Option: ComponentType<{ value: any; children?: ReactNode; [key: string]: any }>;
  };

  export interface FormProps {
    form?: any;
    onFinish?: (values: any) => void;
    children?: ReactNode;
    [key: string]: any;
  }

  export const Form: ComponentType<FormProps> & {
    Item: ComponentType<any>;
    useForm: () => any;
  };

  export interface InputProps {
    value?: string;
    onChange?: (e: any) => void;
    placeholder?: string;
    [key: string]: any;
  }

  export const Input: ComponentType<InputProps> & {
    Password: ComponentType<InputProps>;
    Search: ComponentType<InputProps & { onSearch?: (value: string) => void }>;
    TextArea: ComponentType<InputProps>;
  };

  export interface ModalProps {
    open?: boolean;
    onOk?: () => void;
    onCancel?: () => void;
    title?: ReactNode;
    children?: ReactNode;
    [key: string]: any;
  }

  export const Modal: ComponentType<ModalProps>;

  export interface DescriptionsProps {
    title?: ReactNode;
    children?: ReactNode;
    [key: string]: any;
  }

  export const Descriptions: ComponentType<DescriptionsProps> & {
    Item: ComponentType<{ label: ReactNode; children?: ReactNode; [key: string]: any }>;
  };

  export interface TagProps {
    color?: string;
    children?: ReactNode;
    [key: string]: any;
  }

  export const Tag: ComponentType<TagProps>;

  export interface SwitchProps {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    size?: 'small' | 'default';
    [key: string]: any;
  }

  export const Switch: ComponentType<SwitchProps>;

  export interface SpaceProps {
    size?: number | 'small' | 'middle' | 'large';
    children?: ReactNode;
    [key: string]: any;
  }

  export const Space: ComponentType<SpaceProps>;

  export interface ResultProps {
    status?: 'success' | 'error' | 'info' | 'warning' | '404' | '403' | '500';
    title?: ReactNode;
    subTitle?: ReactNode;
    extra?: ReactNode;
    children?: ReactNode;
    [key: string]: any;
  }

  export const Result: ComponentType<ResultProps>;

  export interface SpinProps {
    spinning?: boolean;
    children?: ReactNode;
    [key: string]: any;
  }

  export const Spin: ComponentType<SpinProps>;

  export interface message {
    success: (content: string, duration?: number) => void;
    error: (content: string, duration?: number) => void;
    info: (content: string, duration?: number) => void;
    warning: (content: string, duration?: number) => void;
  }

  export const message: message;

  export interface PaginationProps {
    current?: number;
    pageSize?: number;
    total?: number;
    onChange?: (page: number, pageSize: number) => void;
    onShowSizeChange?: (current: number, size: number) => void;
    showSizeChanger?: boolean;
    showTotal?: (total: number, range: [number, number]) => ReactNode;
    [key: string]: any;
  }

  export const Pagination: ComponentType<PaginationProps>;

  export interface StatisticProps {
    title?: ReactNode;
    value?: number | string;
    prefix?: ReactNode;
    suffix?: ReactNode;
    [key: string]: any;
  }

  export const Statistic: ComponentType<StatisticProps>;

  export interface RowProps {
    gutter?: number | [number, number];
    children?: ReactNode;
    [key: string]: any;
  }

  export const Row: ComponentType<RowProps>;

  export interface ColProps {
    span?: number;
    children?: ReactNode;
    [key: string]: any;
  }

  export const Col: ComponentType<ColProps>;

  export const Typography: {
    Title: ComponentType<any>;
    Text: ComponentType<any>;
    Paragraph: ComponentType<any>;
  };

  export interface ProgressProps {
    percent?: number;
    status?: 'success' | 'exception' | 'active' | 'normal';
    [key: string]: any;
  }

  export const Progress: ComponentType<ProgressProps>;

  export interface LayoutProps {
    children?: ReactNode;
    [key: string]: any;
  }

  export const Layout: ComponentType<LayoutProps> & {
    Header: ComponentType<any>;
    Sider: ComponentType<any>;
    Content: ComponentType<any>;
    Footer: ComponentType<any>;
  };

  export interface MenuProps {
    items?: any[];
    mode?: 'horizontal' | 'vertical' | 'inline';
    selectedKeys?: string[];
    onClick?: (e: any) => void;
    [key: string]: any;
  }

  export const Menu: ComponentType<MenuProps>;

  export interface DropdownProps {
    menu?: any;
    children?: ReactNode;
    [key: string]: any;
  }

  export const Dropdown: ComponentType<DropdownProps>;

  export interface PopconfirmProps {
    title?: ReactNode;
    onConfirm?: () => void;
    onCancel?: () => void;
    children?: ReactNode;
    [key: string]: any;
  }

  export const Popconfirm: ComponentType<PopconfirmProps>;

  export interface AlertProps {
    message?: ReactNode;
    description?: ReactNode;
    type?: 'success' | 'info' | 'warning' | 'error';
    showIcon?: boolean;
    [key: string]: any;
  }

  export const Alert: ComponentType<AlertProps>;

  export interface InputNumberProps {
    value?: number;
    onChange?: (value: number | null) => void;
    min?: number;
    max?: number;
    [key: string]: any;
  }

  export const InputNumber: ComponentType<InputNumberProps>;
}

