import { notFound } from 'next/navigation';

import OrderActions from '../OrderActions';
import { Order } from '@/types/orders';
import { HistoryStat } from '../HistoryStat';
import OrderDetailsClient from '@/components/layouts/admin/order-details/customar-info/OrderDetailsClient';
import OrderItems from '@/components/layouts/admin/order-details/order-items/OrderItems';

interface OrderDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_API;

const getOrderById = async (id: string) => {
  const res = await fetch(`${BASE_URL}/orders/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return null;
  }

  const result = await res.json();

  return result.data;
};

const orderHistory = async (phone: string) => {
  const url = `${BASE_URL}/orders/customer-history?phone=${encodeURIComponent(phone)}`;

  const res = await fetch(url, {
    cache: 'no-store',
  });
  const text = await res.text();

  if (!res.ok) {
    return null;
  }

  const result = JSON.parse(text);

  return result.data;
};

const OrderDetailsPage = async ({ params }: OrderDetailsPageProps) => {
  const { id } = await params;

  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }
  const history = await orderHistory(order.phone);

  const summary = history?.summary;

  const successRate =
    summary && summary.totalOrders > 0
      ? ((summary.totalDelivered / summary.totalOrders) * 100).toFixed(0)
      : '0';

  return (
    <main className=" space-y-6 p-4 md:p-6 print:p-0">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold">Order Details</h1>
          <p className="text-sm text-muted-foreground">Order #{order.id}</p>
        </div>

        <OrderActions orderId={order.id} currentStatus={order.status} />
      </div>

      {/* Printable Content */}
      <div id="order-details-print">
        {/* Order Information */}
        <section className="rounded-sm border bg-background p-5">
          <h2 className="mb-4 text-lg font-semibold">Order Information</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem label="Order ID" value={order.id} />

            <InfoItem label="Status" value={order.status} />

            <InfoItem
              label="Order Date"
              value={new Date(order.createdAt).toLocaleString()}
            />

            <InfoItem
              label="Shipping"
              value={order.isInsideDhaka ? 'Inside Dhaka' : 'Outside Dhaka'}
            />
          </div>
        </section>
        {/* Customer Order Summary */}
        {history?.summary && (
          <section className="mt-6 rounded-sm border bg-background p-5">
            <h2 className="mb-4 text-lg font-semibold">
              Customer Order History
            </h2>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <HistoryStat
                label="Total Orders"
                value={history.summary.totalOrders}
              />

              <HistoryStat
                label="Delivered"
                value={history.summary.totalDelivered}
              />

              <HistoryStat
                label="Cancelled"
                value={history.summary.totalCancelled}
              />

              <HistoryStat label="Success Rate" value={`${successRate}%`} />
            </div>
          </section>
        )}

        {/* Customer Information */}
        <OrderDetailsClient order={order} />

        {/* Order Items */}
        <OrderItems order={order} />

        {/* Payment & Shipping */}
        <section className="mt-6 rounded-sm border bg-background p-5">
          <h2 className="mb-5 text-lg font-semibold">
            Payment & Shipping Summary
          </h2>

          <div className="ml-auto max-w-md space-y-3">
            <SummaryRow
              label="Subtotal"
              value={`৳${getSubtotal(order).toFixed(2)}`}
            />

            <SummaryRow
              label="Shipping"
              value={`${
                order.isInsideDhaka ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'
              } (৳${Number(order.shippingFee).toFixed(2)})`}
            />

            <div className="border-t pt-3">
              <SummaryRow
                label="Total"
                value={`৳${Number(order.total).toFixed(2)}`}
                bold
              />
            </div>

            <SummaryRow label="Payment Method" value="Cash on Delivery" />
          </div>
        </section>
      </div>
    </main>
  );
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-medium text-muted-foreground">{label}</p>

    <p className="mt-1 break-words text-sm font-medium">{value}</p>
  </div>
);

const SummaryRow = ({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) => (
  <div
    className={`flex items-center justify-between gap-4 ${
      bold ? 'text-base font-bold' : 'text-sm'
    }`}
  >
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

const getSubtotal = (order: Order): number => {
  return order.items.reduce(
    (total, item) =>
      total +
      Number(item.product?.specialPrice ?? item.product?.price) * item.quantity,
    0,
  );
};

export default OrderDetailsPage;
