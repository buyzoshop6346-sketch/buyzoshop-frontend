'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  deleteOrder,
  getAllOrders,
  updateOrderStatus,
} from '@/services/orders.service';

import { Order, OrderStatus } from '@/types/orders';

import OrderSummary from '../shared/orders/OrderSummary';
import OrderDetailsModal from '../shared/orders/OrderDetailsModal';
import CustomerContactTable from './CustomerContactTable';

import { Search, X } from 'lucide-react';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

const OrdersMain = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Default = DELIVERED
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | 'ALL'>('ALL');

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  const [meta, setMeta] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalPending: 0,
    totalShipped: 0,
    totalDelivered: 0,
    totalCancelled: 0,
    totalPartial: 0,
  });

  // =====================================================
  // FETCH ORDERS
  // =====================================================

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getAllOrders({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: search.trim(),
        status: status === 'ALL' ? undefined : status,
      });

      const data = response?.data;

      setOrders(Array.isArray(data?.orders) ? data.orders : []);

      if (data?.meta) {
        setMeta(data.meta);
      }

      if (data?.summary) {
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);

      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, status]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  // =====================================================
  // STATUS FILTER
  // =====================================================

  const handleStatusChange = (value: OrderStatus | 'ALL') => {
    setStatus(value);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  // =====================================================
  // PAGINATION
  // =====================================================

  const changePage = (page: number) => {
    if (page < 1 || page > meta.totalPages) {
      return;
    }

    setCurrentPage(page);
    setSelectedIds([]);
  };

  const paginationPages = useMemo(() => {
    const totalPages = meta.totalPages;
    const current = meta.page;

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (current <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (current >= totalPages - 2) {
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [current - 2, current - 1, current, current + 1, current + 2];
  }, [meta.totalPages, meta.page]);

  // =====================================================
  // SELECT
  // =====================================================

  const allSelected =
    orders.length > 0 && orders.every(order => selectedIds.includes(order.id));

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(prev =>
        prev.filter(id => !orders.some(order => order.id === id)),
      );

      return;
    }

    setSelectedIds(prev => {
      const ids = new Set(prev);

      orders.forEach(order => {
        ids.add(order.id);
      });

      return Array.from(ids);
    });
  };

  const handleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    );
  };

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: OrderStatus,
  ) => {
    if (!orderId || !newStatus) {
      return;
    }

    try {
      setUpdatingOrderId(orderId);

      await updateOrderStatus(orderId, newStatus);

      toast.success('Order status updated successfully');

      await fetchOrders();

      setSelectedOrder(prev => {
        if (!prev || prev.id !== orderId) {
          return prev;
        }

        return {
          ...prev,
          status: newStatus,
        };
      });
    } catch (error) {
      console.error('Failed to update order status:', error);

      toast.error('Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDeleteOrder = async (orderId: string) => {
    if (!orderId) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this order?',
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingOrderId(orderId);

      await deleteOrder(orderId);

      await fetchOrders();

      setSelectedIds(prev => prev.filter(id => id !== orderId));

      setSelectedOrder(prev => (prev?.id === orderId ? null : prev));

      toast.success('Order deleted successfully');
    } catch (error) {
      console.error('Failed to delete order:', error);

      toast.error('Failed to delete order');
    } finally {
      setDeletingOrderId(null);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-4">
      {/* =================================================
          SEARCH + FILTER
      ================================================= */}

      <h2 className="text-xl font-bold">Orders Management</h2>

      <div className="rounded-md border bg-background p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* SEARCH */}

          <div className="relative w-full lg:max-w-md">
            <Search
              className="
                absolute
                left-3
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-muted-foreground
              "
            />

            <input
              type="text"
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search name, phone or email..."
              className="
                h-10
                w-full
                rounded-lg
                border
                bg-background
                pl-9
                pr-9
                text-sm
                outline-none
                focus:border-primary
                focus:ring-2
                focus:ring-primary/20
              "
            />

            {search && (
              <button
                type="button"
                onClick={() => handleSearch('')}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-muted-foreground
                  hover:text-foreground
                "
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* FILTER */}

          <div className="flex items-center gap-3">
            <select
              value={status}
              onChange={e =>
                handleStatusChange(e.target.value as OrderStatus | 'ALL')
              }
              className="
                h-10
                rounded-lg
                border
                bg-background
                px-3
                text-sm
                outline-none
                focus:border-primary
                focus:ring-2
                focus:ring-primary/20
              "
            >
              <option value="ALL">All Status</option>

              <option value="PENDING">Pending</option>

              <option value="SHIPPED">Shipped</option>

              <option value="DELIVERED">Delivered</option>

              <option value="CANCELLED">Cancelled</option>

              <option value="PARTIAL">Partial</option>
            </select>

            <p className="whitespace-nowrap text-sm text-muted-foreground">
              {meta.total} order
              {meta.total !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <OrderSummary {...summary} />

      {/* =================================================
          ORDERS TABLE
      ================================================= */}

      <CustomerContactTable
        fetchOrders={fetchOrders}
        orders={orders}
        meta={meta}
        selectedIds={selectedIds}
        paginationPages={paginationPages}
        onSelectAll={handleSelectAll}
        onSelect={handleSelect}
        onPageChange={changePage}
        loading={loading}
        onUpdateStatus={handleUpdateStatus}
        onDelete={handleDeleteOrder}
        updatingOrderId={updatingOrderId}
        deletingOrderId={deletingOrderId}
      />

      {/* =================================================
          ORDER DETAILS MODAL
      ================================================= */}

      {selectedOrder && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/50
            p-4
          "
          onMouseDown={() => setSelectedOrder(null)}
        >
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        </div>
      )}
    </div>
  );
};

export default OrdersMain;
