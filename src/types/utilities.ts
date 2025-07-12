
/**
 * TypeScript Utility Types
 * Enhances developer experience with common type helpers
 */

// Branded types for better type safety
export type Brand<T, B> = T & { __brand: B };
export type UUID = Brand<string, 'UUID'>;
export type Email = Brand<string, 'Email'>;
export type OrganizationSlug = Brand<string, 'OrganizationSlug'>;

// API Response types
export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  status: ApiStatus;
  error: string | null;
}

// Component prop helpers
export type PropsWithClassName<P = {}> = P & {
  className?: string;
};

export type PropsWithChildren<P = {}> = P & {
  children?: React.ReactNode;
};

// Form helpers
export type FormField<T> = {
  value: T;
  error?: string;
  touched: boolean;
};

export type FormState<T extends Record<string, any>> = {
  [K in keyof T]: FormField<T[K]>;
};

// Event handlers
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

// Configuration types
export interface AppConfig {
  apiUrl: string;
  environment: 'development' | 'staging' | 'production';
  features: Record<string, boolean>;
}

// Permission types
export type Permission = 
  | 'read_organization'
  | 'write_organization'
  | 'manage_users'
  | 'manage_settings'
  | 'admin_access';

export type Role = 'owner' | 'admin' | 'manager' | 'analyst' | 'member' | 'viewer';

// Utility type functions
export type NonEmptyArray<T> = [T, ...T[]];
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

// API pagination
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Error handling
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface AppError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}
