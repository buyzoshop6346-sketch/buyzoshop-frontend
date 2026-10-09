import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BASE_API;

export interface SyncPathaoResponse {
  success: boolean;
  message: string;
  data?: {
    success: Array<{
      orderId: string;
      consignmentId: string;
      message: string;
    }>;
    failed: Array<{
      orderId: string;
      message: string;
    }>;
  };
}

export const syncOrdersToPathao = async (
  orderIds: string[],
): Promise<SyncPathaoResponse> => {
  const response = await axios.post<SyncPathaoResponse>(
    `${API_URL}/pathao/orders/sync`,
    {
      orderIds,
    },
  );

  return response.data;
};
