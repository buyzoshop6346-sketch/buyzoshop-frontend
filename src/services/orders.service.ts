import axios from 'axios';

import { getToken } from '@/utils/auth';

import {
  AddProductToOrderPayload,
  CheckoutPayload,
  GetAllOrdersParams,
  ISingleOrder,
  OrderStatus,
  UpdateOrderPayload,
} from '@/types/orders';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_API;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  'Content-Type': 'application/json',
});

export const createOrder = async (payload: CheckoutPayload) => {
  const res = await axios.post(`${BASE_URL}/orders/checkout`, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return res.data;
};

// BUY NOW

export const singleOrder = async (payload: ISingleOrder) => {
  const res = await axios.post(`${BASE_URL}/orders/buy-now`, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return res.data;
};

// GET ALL ORDERS

export const getAllOrders = async (params?: GetAllOrdersParams) => {
  const res = await axios.get(`${BASE_URL}/orders/all`, {
    params,
    headers: getAuthHeaders(),
  });

  console.log(res);
  return res.data;
};

// GET USER ORDERS

export const getOrdersByUser = async () => {
  const res = await axios.get(`${BASE_URL}/orders`, {
    headers: getAuthHeaders(),
  });

  return res.data;
};

// get single order
export const getOrderById = async (orderId: string) => {
  const response = await axios.get(`${BASE_URL}/orders/${orderId}`);
  console.log(response);

  return response.data;
};

// UPDATE ORDER STATUS

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
) => {
  if (!orderId) {
    throw new Error('Order ID is required');
  }

  const res = await axios.patch(
    `${BASE_URL}/orders/${orderId}/status`,
    {
      status,
    },
    {
      headers: getAuthHeaders(),
    },
  );

  return res.data;
};

// UPDATE ORDER

export const updateOrder = async (
  orderId: string,
  payload: UpdateOrderPayload,
) => {
  if (!orderId) {
    throw new Error('Order ID is required');
  }

  const res = await axios.patch(`${BASE_URL}/orders/${orderId}`, payload, {
    headers: getAuthHeaders(),
  });

  return res.data;
};

// ADD PRODUCT TO EXISTING ORDER

export const addProductToOrder = async (
  orderId: string,
  payload: AddProductToOrderPayload,
) => {
  if (!orderId) {
    throw new Error('Order ID is required');
  }

  const res = await axios.patch(
    `${BASE_URL}/orders/${orderId}/items`,
    payload,
    {
      headers: getAuthHeaders(),
    },
  );

  return res.data;
};

// REMOVE PRODUCT FROM ORDER

export const removeProductFromOrder = async (
  orderId: string,
  itemId: string,
) => {
  if (!orderId || !itemId) {
    throw new Error('Order ID and Item ID are required');
  }

  const res = await axios.delete(
    `${BASE_URL}/orders/${orderId}/items/${itemId}`,
    {
      headers: getAuthHeaders(),
    },
  );

  return res.data;
};

// DELETE ORDER

export const deleteOrder = async (orderId: string) => {
  if (!orderId) {
    throw new Error('Order ID is required');
  }

  const res = await axios.delete(`${BASE_URL}/orders/${orderId}`, {
    headers: getAuthHeaders(),
  });

  return res.data;
};
