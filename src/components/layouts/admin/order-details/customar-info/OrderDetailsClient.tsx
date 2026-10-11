'use client';

import { useRouter } from 'next/navigation';
import CustomerInformation from '@/components/layouts/admin/order-details/customar-info/CustomerInformation';
import { Order } from '@/types/orders';

interface OrderDetailsClientProps {
  order: Order;
}

const OrderDetailsClient = ({ order }: OrderDetailsClientProps) => {
  const router = useRouter();

  const fetchOrders = async () => {
    router.refresh();
  };

  return <CustomerInformation order={order} fetchOrders={fetchOrders} />;
};

export default OrderDetailsClient;
