import axios from 'axios';

import { getToken } from '@/utils/auth';

import {
  BlockedCustomerListResponse,
  BlockedCustomerQuery,
  BlockedCustomerResponse,
  CreateBlockedCustomerPayload,
} from '@/types/blocked-customer';

const API_URL = `${process.env.NEXT_PUBLIC_BASE_API}/blocked-customers`;

const getAuthHeaders = () => {
  const token = getToken();

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// ========================================
// GET BLOCKED CUSTOMERS
// Search, filter and pagination
// ========================================

export const getBlockedCustomers = async (
  params: BlockedCustomerQuery = {},
): Promise<BlockedCustomerListResponse> => {
  const response = await axios.get<BlockedCustomerListResponse>(API_URL, {
    params,
    headers: getAuthHeaders(),
  });

  return response.data;
};

// ========================================
// CREATE BLOCK
// ========================================

export const createBlockedCustomer = async (
  payload: CreateBlockedCustomerPayload,
): Promise<BlockedCustomerResponse> => {
  const response = await axios.post<BlockedCustomerResponse>(API_URL, payload, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

// ========================================
// GET SINGLE BLOCK DETAILS
// ========================================

export const getBlockedCustomerById = async (
  id: string,
): Promise<BlockedCustomerResponse> => {
  const response = await axios.get<BlockedCustomerResponse>(
    `${API_URL}/${id}`,
    {
      headers: getAuthHeaders(),
    },
  );

  return response.data;
};

// ========================================
// UNBLOCK CUSTOMER
// ========================================

export const unblockCustomer = async (
  id: string,
): Promise<BlockedCustomerResponse> => {
  const response = await axios.patch<BlockedCustomerResponse>(
    `${API_URL}/${id}/unblock`,
    {},
    {
      headers: getAuthHeaders(),
    },
  );

  return response.data;
};
