export interface BlockedCustomer {
  id: string;
  phone: string | null;
  ipAddress: string | null;
  reason: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BlockStatus = 'all' | 'blocked' | 'unblocked';

export interface BlockedCustomerQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: BlockStatus;
}

export interface BlockedCustomerMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  activeCount: number;
  inactiveCount: number;
}

export interface BlockedCustomerListResponse {
  success: boolean;
  message: string;
  data: BlockedCustomer[];
  meta: BlockedCustomerMeta;
}

export interface BlockedCustomerResponse {
  success: boolean;
  message: string;
  data: BlockedCustomer;
}

export interface CreateBlockedCustomerPayload {
  phone?: string;
  ipAddress?: string;
  reason: string;
}
