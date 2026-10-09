'use client';

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Package,
  Pencil,
  Phone,
  StickyNote,
  Trash2,
} from 'lucide-react';

import { useState } from 'react';

import { Order, OrdersMeta, OrderStatus } from '@/types/orders';

import LoadingSpinner from '../shared/dashboard/LoadingSpinner';
import EditOrderModal from './EditOrderModal';
import OrderNoteModal from './OrderNoteModal';

interface CustomerContactTableProps {
  orders: Order[];
  meta: OrdersMeta;
  selectedIds: string[];
  paginationPages: number[];

  fetchOrders: () => Promise<void>;

  onSelectAll: () => void;
  onSelect: (id: string) => void;
  onPageChange: (page: number) => void;

  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;

  onDelete: (orderId: string) => Promise<void>;

  updatingOrderId?: string | null;
  deletingOrderId?: string | null;

  loading?: boolean;
}

const CustomerContactTable = ({
  orders,
  meta,
  selectedIds,
  paginationPages,
  fetchOrders,
  onSelectAll,
  onSelect,
  onPageChange,
  onUpdateStatus,
  onDelete,
  updatingOrderId = null,
  deletingOrderId = null,
  loading = false,
}: CustomerContactTableProps) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  const allSelected =
    orders.length > 0 && orders.every(order => selectedIds.includes(order.id));

  return (
    <div className="w-full overflow-hidden rounded-sm border bg-background">
      {/* TABLE */}
      <div className="w-full overflow-x-auto">
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <LoadingSpinner message="orders" />
          </div>
        ) : orders.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />

            <p className="font-medium">No orders found</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Try changing your search or filter.
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[1150px] table-fixed text-sm">
            {/* =================================================
                HEADER
            ================================================= */}

            <thead className="border-b bg-muted/40">
              <tr>
                {/* CHECKBOX */}

                <th className="w-[42px] px-2 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onSelectAll}
                    className="h-4 w-4 cursor-pointer"
                  />
                </th>

                {/* PRODUCT */}

                <th className="w-[32%] px-3 py-3 text-left font-semibold">
                  Order / Product
                </th>

                {/* CUSTOMER */}

                <th className="w-[16%] px-3 py-3 text-left font-semibold">
                  Customer
                </th>

                {/* ADDRESS */}

                <th className="w-[20%] px-3 py-3 text-left font-semibold">
                  Delivery Address
                </th>

                {/* AMOUNT */}

                <th className="w-[12%] px-3 py-3 text-left font-semibold">
                  Amount
                </th>

                {/* STATUS */}

                <th className="w-[10%] px-3 py-3 text-center font-semibold">
                  Status
                </th>

                {/* NOTE */}

                <th className="w-[5%] px-2 py-3 text-center font-semibold">
                  Note
                </th>

                {/* ACTION */}

                <th className="w-[8%] px-2 py-3 text-center font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            {/* =================================================
                BODY
            ================================================= */}

            <tbody className="divide-y">
              {orders.map(order => {
                const selected = selectedIds.includes(order.id);

                const isUpdating = updatingOrderId === order.id;

                const isDeleting = deletingOrderId === order.id;

                const totalQuantity = getOrderQuantity(order);

                const shippingFee = Number(order.shippingFee || 0);

                const total = Number(order.total || 0);

                const productSubtotal = Math.max(total - shippingFee, 0);

                return (
                  <tr
                    key={order.id}
                    className={`transition-colors ${
                      selected ? 'bg-primary/5' : 'hover:bg-muted/20'
                    }`}
                  >
                    {/* =================================================
                        CHECKBOX
                    ================================================= */}

                    <td className="px-2 py-3 text-center align-top">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onSelect(order.id)}
                        disabled={isUpdating || isDeleting}
                        className="mt-1 h-4 w-4 cursor-pointer"
                      />
                    </td>

                    {/* =================================================
                        PRODUCT
                    ================================================= */}

                    <td className="px-3 py-3 align-top">
                      <div className="space-y-2">
                        {/* ORDER */}

                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            #{order.id.slice(0, 8)}
                          </span>

                          <span className="text-[11px] text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>

                        {/* PRODUCTS */}

                        <div className="space-y-2">
                          {order.items?.map(item => {
                            const image =
                              getImageUrl(item.product?.thumbnail) ||
                              getImageUrl(item.product?.images?.[0]);

                            return (
                              <div
                                key={item.id}
                                className="flex min-w-0 items-center gap-2.5"
                              >
                                {/* IMAGE */}

                                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-sm border bg-muted">
                                  {image ? (
                                    <img
                                      src={image}
                                      alt={item.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                      <Package className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>

                                {/* INFO */}

                                <div className="min-w-0">
                                  <p className="line-clamp-1 font-semibold leading-5">
                                    {item.name}
                                  </p>

                                  <div className="mt-1 flex flex-wrap items-center gap-1">
                                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                                      Qty {item.quantity}
                                    </span>

                                    {item.size && (
                                      <span className="rounded border px-1.5 py-0.5 text-[10px] font-medium">
                                        {item.size}
                                      </span>
                                    )}

                                    {item.color && (
                                      <span className="rounded border px-1.5 py-0.5 text-[10px] font-medium">
                                        {item.color}
                                      </span>
                                    )}
                                  </div>

                                  <p className="mt-1 text-[11px] font-semibold">
                                    ৳
                                    {Number(item.price || 0).toLocaleString(
                                      'en-BD',
                                    )}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </td>

                    {/* =================================================
                        CUSTOMER
                    ================================================= */}

                    <td className="px-3 py-3 align-top">
                      <div className="min-w-0 space-y-1.5">
                        <p className="truncate font-semibold">
                          {order.name || order.user?.name || '-'}
                        </p>

                        <a
                          href={`tel:${order.phone || order.user?.phone || ''}`}
                          className="flex items-center gap-1.5 text-xs font-medium hover:text-primary"
                        >
                          <Phone className="h-3.5 w-3.5 shrink-0" />

                          <span className="truncate">
                            {order.phone || order.user?.phone || '-'}
                          </span>
                        </a>

                        {order.user?.email && (
                          <p className="truncate text-[11px] text-muted-foreground">
                            {order.user.email}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* =================================================
                        ADDRESS
                    ================================================= */}

                    <td className="px-3 py-3 align-top">
                      <div className="space-y-1.5">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />

                          <p className="line-clamp-2 text-xs leading-4">
                            {order.address || '-'}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-1 pl-5">
                          {order.district && (
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                              {order.district}
                            </span>
                          )}

                          {order.thana && (
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                              {order.thana}
                            </span>
                          )}
                        </div>

                        <div className="pl-5">
                          <span
                            className={`inline-flex rounded border px-1.5 py-0.5 text-[10px] font-semibold ${
                              order.isInsideDhaka
                                ? 'border-green-200 bg-green-50 text-green-700'
                                : 'border-blue-200 bg-blue-50 text-blue-700'
                            }`}
                          >
                            {order.isInsideDhaka
                              ? 'Inside Dhaka'
                              : 'Outside Dhaka'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* =================================================
                        AMOUNT
                    ================================================= */}

                    <td className="px-3 py-3 align-top">
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">Product</span>

                          <span className="font-medium">
                            ৳{productSubtotal.toLocaleString('en-BD')}
                          </span>
                        </div>

                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">
                            Delivery
                          </span>

                          <span className="font-medium">
                            ৳{shippingFee.toLocaleString('en-BD')}
                          </span>
                        </div>

                        <div className="flex justify-between gap-2 border-t pt-1.5">
                          <span className="font-semibold">Total</span>

                          <span className="font-bold text-primary">
                            ৳{total.toLocaleString('en-BD')}
                          </span>
                        </div>

                        <p className="text-[10px] text-muted-foreground">
                          {totalQuantity} item
                          {totalQuantity !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </td>

                    {/* =================================================
                        STATUS
                    ================================================= */}

                    <td className="px-2 py-3 text-center align-top">
                      <div className="relative inline-flex">
                        <select
                          value={order.status}
                          disabled={isUpdating || isDeleting}
                          onChange={async e => {
                            const newStatus = e.target.value as OrderStatus;

                            if (newStatus === order.status) return;

                            await onUpdateStatus(order.id, newStatus);
                          }}
                          className={`h-8 w-[92px] appearance-none rounded-sm border px-2 pr-6 text-[10px] font-semibold outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60 ${getStatusClass(
                            order.status,
                          )}`}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                          <option value="PARTIAL">Partial</option>
                        </select>

                        {isUpdating ? (
                          <Loader2 className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 animate-spin text-primary" />
                        ) : (
                          <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2" />
                        )}
                      </div>
                    </td>

                    {/* =================================================
                        NOTE
                    ================================================= */}

                    <td className="px-2 py-3 text-center align-top">
                      {order.note ? (
                        <button
                          type="button"
                          title={order.note}
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsNoteModalOpen(true);
                          }}
                          className="mx-auto block max-w-[70px] truncate text-[11px] font-medium hover:text-primary"
                        >
                          {order.note}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsNoteModalOpen(true);
                          }}
                          className="text-[11px] text-muted-foreground hover:text-primary"
                        >
                          Add
                        </button>
                      )}
                    </td>

                    {/* =================================================
                        ACTION
                    ================================================= */}

                    <td className="px-2 py-3 text-center align-top">
                      <div className="flex items-center justify-center gap-1">
                        {/* EDIT */}

                        <button
                          type="button"
                          disabled={isDeleting || isUpdating}
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsEditModalOpen(true);
                          }}
                          title="Edit order"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-sm border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>

                        {/* NOTE */}

                        <button
                          type="button"
                          disabled={isDeleting || isUpdating}
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsNoteModalOpen(true);
                          }}
                          title="Order note"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-sm border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <StickyNote className="h-3.5 w-3.5" />
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          disabled={isDeleting || isUpdating}
                          onClick={() => onDelete(order.id)}
                          title="Delete order"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-red-500/20 text-red-600 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-600/30 border-t-red-600" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* =================================================
          EDIT MODAL
      ================================================= */}

      {selectedOrder && (
        <EditOrderModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          order={selectedOrder}
          fetchOrders={fetchOrders}
        />
      )}

      {/* =================================================
          NOTE MODAL
      ================================================= */}

      {selectedOrder && (
        <OrderNoteModal
          open={isNoteModalOpen}
          onOpenChange={setIsNoteModalOpen}
          order={selectedOrder}
          fetchOrders={fetchOrders}
        />
      )}

      {/* =================================================
          PAGINATION
      ================================================= */}

      {!loading && orders.length > 0 && (
        <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(meta.page - 1) * meta.limit + 1} -{' '}
            {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
          </p>

          {meta.totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onPageChange(meta.page - 1)}
                disabled={!meta.hasPreviousPage}
                className="flex h-8 w-8 items-center justify-center rounded-sm border disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {paginationPages.map(page => (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={`h-8 min-w-8 rounded-sm px-2 text-sm ${
                    meta.page === page
                      ? 'bg-primary text-primary-foreground'
                      : 'border hover:bg-muted'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => onPageChange(meta.page + 1)}
                disabled={!meta.hasNextPage}
                className="flex h-8 w-8 items-center justify-center rounded-sm border disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* =====================================================
   IMAGE URL
===================================================== */

const getImageUrl = (image?: string | null) => {
  if (!image) return null;

  const markdownMatch = image.match(/\((https?:\/\/[^)]+)\)/);

  if (markdownMatch?.[1]) {
    return markdownMatch[1];
  }

  return image;
};

/* =====================================================
   DATE
===================================================== */

const formatDate = (date?: string) => {
  if (!date) return '-';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '-';
  }

  return parsedDate.toLocaleString('en-BD', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/* =====================================================
   TOTAL QUANTITY
===================================================== */

const getOrderQuantity = (order: Order) => {
  return (
    order.items?.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0,
    ) || 0
  );
};

/* =====================================================
   STATUS CLASS
===================================================== */

const getStatusClass = (status: OrderStatus) => {
  const classes: Record<OrderStatus, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    SHIPPED: 'bg-blue-50 text-blue-700 border-blue-200',
    DELIVERED: 'bg-green-50 text-green-700 border-green-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
    PARTIAL: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return classes[status] || 'bg-muted text-foreground border-border';
};

export default CustomerContactTable;
