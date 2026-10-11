'use client';

import {
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldX,
  Unlock,
  X,
} from 'lucide-react';

import { useCallback, useEffect, useRef, useState } from 'react';

import { toast } from 'sonner';

import {
  BlockStatus,
  BlockedCustomer,
  CreateBlockedCustomerPayload,
} from '@/types/blocked-customer';

import {
  createBlockedCustomer,
  getBlockedCustomers,
  unblockCustomer,
} from '@/services/blocked-customer.service';

const BlockListPage = () => {
  const [customers, setCustomers] = useState<BlockedCustomer[]>([]);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<BlockStatus>('all');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateBlockedCustomerPayload>({
    phone: '',
    ipAddress: '',
    reason: '',
  });

  const [formError, setFormError] = useState('');

  const requestIdRef = useRef(0);

  // ========================================
  // FETCH BLOCK LIST
  // ========================================

  const fetchCustomers = useCallback(
    async (showRefresh = false) => {
      const requestId = ++requestIdRef.current;

      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response = await getBlockedCustomers({
          page,
          limit,
          search: search.trim() || undefined,
          status,
        });

        // Ignore outdated requests.
        if (requestId !== requestIdRef.current) {
          return;
        }

        setCustomers(response.data);

        setTotal(response.meta.total);
        setTotalPages(response.meta.totalPages);

        setActiveCount(response.meta.activeCount);
        setInactiveCount(response.meta.inactiveCount);
      } catch (error: unknown) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        const message =
          getApiErrorMessage(error) || 'Failed to load blocked customers.';

        // toast.error(message);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [page, limit, search, status],
  );

  // Debounced search + filter + pagination.
  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchCustomers();
    }, 350);

    return () => clearTimeout(timeout);
  }, [fetchCustomers]);

  // ========================================
  // CREATE BLOCK
  // ========================================

  const handleBlockCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    const phone = formData.phone?.trim() || '';
    const ipAddress = formData.ipAddress?.trim() || '';
    const reason = formData.reason.trim();

    if (!phone && !ipAddress) {
      setFormError('Enter a phone number or IP address.');
      return;
    }

    if (!reason) {
      setFormError('Please provide a reason for blocking.');
      return;
    }

    const payload: CreateBlockedCustomerPayload = {
      reason,
      ...(phone ? { phone } : {}),
      ...(ipAddress ? { ipAddress } : {}),
    };

    try {
      setBlocking(true);

      await createBlockedCustomer(payload);

      toast.success('Customer blocked successfully.');

      setIsBlockModalOpen(false);

      setFormData({
        phone: '',
        ipAddress: '',
        reason: '',
      });

      // Show the newest records.
      setPage(1);

      // Refresh immediately when already on page 1.
      if (page === 1) {
        await fetchCustomers(true);
      }
    } catch (error: unknown) {
      const message = getApiErrorMessage(error) || 'Failed to block customer.';

      console.log(message);
    } finally {
      setBlocking(false);
    }
  };

  // ========================================
  // UNBLOCK
  // ========================================

  const handleUnblock = async (customer: BlockedCustomer) => {
    const identifier = customer.phone || customer.ipAddress || 'this customer';

    const confirmed = window.confirm(
      `Are you sure you want to unblock ${identifier}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setUnblockingId(customer.id);

      await unblockCustomer(customer.id);

      toast.success('Customer unblocked successfully.');

      await fetchCustomers(true);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error) || 'Failed to unblock customer.');
    } finally {
      setUnblockingId(null);
    }
  };

  // ========================================
  // RESET FILTERS
  // ========================================

  const handleResetFilters = () => {
    setSearch('');
    setStatus('all');
    setPage(1);
  };

  // ========================================
  // UI
  // ========================================

  return (
    <main className="min-h-screen space-y-6 bg-muted/20 p-4 md:p-6">
      {/* PAGE HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-background">
              <ShieldX className="h-5 w-5 text-destructive" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Blocked Customers
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage blocked phone numbers and IP addresses.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void fetchCustomers(true)}
            disabled={loading || refreshing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => {
              setFormError('');
              setIsBlockModalOpen(true);
            }}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Block Customer
          </button>
        </div>
      </div>

      {/* STATISTICS */}

      {/* <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Records"
          value={activeCount + inactiveCount}
          description="All block records"
          icon={<Ban className="h-5 w-5" />}
        />

        <StatCard
          title="Active Blocks"
          value={activeCount}
          description="Currently blocked"
          icon={<ShieldX className="h-5 w-5" />}
        />

        <StatCard
          title="Unblocked"
          value={inactiveCount}
          description="Previously blocked"
          icon={<ShieldCheck className="h-5 w-5" />}
        />
      </div> */}

      {/* MAIN CONTENT */}

      <section className="overflow-hidden rounded-md border bg-background">
        {/* SEARCH + FILTER */}

        <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold">Block Records</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {total} record{total === 1 ? '' : 's'} found
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="search"
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search phone, IP or reason..."
                className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <select
              value={status}
              onChange={e => {
                setStatus(e.target.value as BlockStatus);
                setPage(1);
              }}
              className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              aria-label="Filter block status"
            >
              <option value="all">All Records</option>
              <option value="blocked">Blocked</option>
              <option value="unblocked">Unblocked</option>
            </select>

            <select
              value={limit}
              onChange={e => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              aria-label="Records per page"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-5 py-4 text-left font-medium">
                  Customer Identifier
                </th>

                <th className="px-5 py-4 text-left font-medium">Reason</th>

                <th className="px-5 py-4 text-left font-medium">Date</th>

                <th className="px-5 py-4 text-left font-medium">Status</th>

                <th className="px-5 py-4 text-right font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin" />

                      <span>Loading block records...</span>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Search className="h-5 w-5 text-muted-foreground" />
                      </div>

                      <p className="font-medium">No records found</p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Try changing your search or filter.
                      </p>

                      {(search || status !== 'all') && (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="mt-3 text-sm font-medium text-primary hover:underline"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map(customer => (
                  <tr
                    key={customer.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-5 py-4">
                      <div className="space-y-1.5">
                        {customer.phone && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Phone
                            </p>

                            <p className="font-medium">{customer.phone}</p>
                          </div>
                        )}

                        {customer.ipAddress && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              IP Address
                            </p>

                            <p className="font-mono text-xs">
                              {customer.ipAddress}
                            </p>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="max-w-xs px-5 py-4">
                      <p className="whitespace-pre-wrap break-words text-muted-foreground">
                        {customer.reason || '-'}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                      {new Date(customer.createdAt).toLocaleDateString(
                        'en-GB',
                        {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        },
                      )}

                      <p className="mt-1 text-xs">
                        {new Date(customer.createdAt).toLocaleTimeString(
                          'en-GB',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge isActive={customer.isActive} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      {customer.isActive ? (
                        <button
                          type="button"
                          onClick={() => void handleUnblock(customer)}
                          disabled={unblockingId === customer.id}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {unblockingId === customer.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Unlock className="h-3.5 w-3.5" />
                          )}
                          Unblock
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}

        {!loading && (
          <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {total === 0
                ? 'Showing 0 records'
                : `Showing ${(page - 1) * limit + 1}–${Math.min(
                    page * limit,
                    total,
                  )} of ${total} records`}
            </p>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <span className="text-sm text-muted-foreground">
                Page {page} of {Math.max(totalPages, 1)}
              </span>

              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  disabled={page >= totalPages || totalPages === 0 || loading}
                  onClick={() =>
                    setPage(prev => Math.min(totalPages, prev + 1))
                  }
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* BLOCK CUSTOMER MODAL */}

      {isBlockModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          onMouseDown={e => {
            if (e.target === e.currentTarget && !blocking) {
              setIsBlockModalOpen(false);
            }
          }}
        >
          <div className="my-8 w-full max-w-lg overflow-hidden rounded-md border bg-background shadow-xl">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold">Block Customer</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Block by phone number, IP address, or both.
                </p>
              </div>

              <button
                type="button"
                disabled={blocking}
                onClick={() => setIsBlockModalOpen(false)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleBlockCustomer}>
              <div className="space-y-4 p-5">
                <div>
                  <label htmlFor="block-phone" className="text-sm font-medium">
                    Phone Number
                  </label>

                  <input
                    id="block-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    disabled={blocking}
                    placeholder="017XXXXXXXX"
                    className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="block-ip" className="text-sm font-medium">
                    IP Address
                  </label>

                  <input
                    id="block-ip"
                    type="text"
                    value={formData.ipAddress}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        ipAddress: e.target.value,
                      }))
                    }
                    disabled={blocking}
                    placeholder="192.0.2.10"
                    className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3 font-mono text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
                  />

                  <p className="mt-1 text-xs text-muted-foreground">
                    Enter a phone number or IP address. Both are optional
                    individually, but at least one is required.
                  </p>
                </div>

                <div>
                  <label htmlFor="block-reason" className="text-sm font-medium">
                    Reason <span className="text-destructive">*</span>
                  </label>

                  <textarea
                    id="block-reason"
                    value={formData.reason}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                    disabled={blocking}
                    rows={3}
                    maxLength={500}
                    placeholder="Explain why this customer is being blocked..."
                    className="mt-1.5 w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
                  />

                  <p className="mt-1 text-right text-xs text-muted-foreground">
                    {formData.reason.length}/500
                  </p>
                </div>

                {formError && (
                  <div
                    role="alert"
                    className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
                  >
                    {formError}
                  </div>
                )}
              </div>

              {/* MODAL FOOTER */}

              <div className="flex justify-end gap-2 border-t px-5 py-4">
                <button
                  type="button"
                  disabled={blocking}
                  onClick={() => setIsBlockModalOpen(false)}
                  className="h-10 rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={blocking}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-destructive px-4 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {blocking ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Blocking...
                    </>
                  ) : (
                    <>
                      <Ban className="h-4 w-4" />
                      Block Customer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

// ========================================
// STAT CARD
// ========================================

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, description, icon }: StatCardProps) => {
  return (
    <div className="rounded-md border bg-background p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight">
            {value.toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted/40">
          {icon}
        </div>
      </div>
    </div>
  );
};

// ========================================
// STATUS BADGE
// ========================================

const StatusBadge = ({ isActive }: { isActive: boolean }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${
        isActive
          ? 'border-destructive/20 bg-destructive/10 text-destructive'
          : 'border-emerald-600/20 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? 'bg-destructive' : 'bg-emerald-600'
        }`}
      />

      {isActive ? 'Blocked' : 'Unblocked'}
    </span>
  );
};

// ========================================
// API ERROR HELPER
// ========================================

const getApiErrorMessage = (error: unknown): string | undefined => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    return response?.data?.message;
  }

  return undefined;
};

export default BlockListPage;
