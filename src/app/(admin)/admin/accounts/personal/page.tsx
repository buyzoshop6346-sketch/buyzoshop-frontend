'use client';

import PersonalEntryModal from '@/components/layouts/admin/accounts/personal/PersonalFormModal';
import PersonalTable from '@/components/layouts/admin/accounts/personal/PersonalTable';
import AccountPageHeader from '@/components/layouts/admin/accounts/shared/AccountPageHeader';
import {
  createPersonalEntry,
  deletePersonalEntry,
  getAllPersonalEntries,
  updatePersonalEntry,
} from '@/services/accounts/personal.service';
import {
  PersonalEntry,
  PersonalEntryMeta,
  PersonalEntryPayload,
  PersonalEntrySummary,
} from '@/types/accounts/personal-entry.types';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CircleDollarSign, CreditCard, Receipt, Wallet } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const initialMeta: PersonalEntryMeta = {
  page: 1,
  limit: ITEMS_PER_PAGE,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

const initialSummary: PersonalEntrySummary = {
  totalEntries: 0,
  paid: 0,
  unpaid: 0,
  received: 0,
};

const PersonalPage = () => {
  const [entries, setEntries] = useState<PersonalEntry[]>([]);

  const [meta, setMeta] = useState<PersonalEntryMeta>(initialMeta);

  const [summary, setSummary] = useState<PersonalEntrySummary>(initialSummary);

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);

  const [selectedEntry, setSelectedEntry] = useState<PersonalEntry | null>(
    null,
  );

  const [submitLoading, setSubmitLoading] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ==============================
  // FETCH
  // ==============================

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getAllPersonalEntries({
        page,
        limit: ITEMS_PER_PAGE,
      });

      // service already returns response.data.data
      const result = response;

      setEntries(Array.isArray(result?.data) ? result.data : []);

      if (result?.meta) {
        setMeta(result.meta);
      }

      if (result?.summary) {
        setSummary(result.summary);
      }
    } catch (error) {
      console.error('Failed to fetch personal entries:', error);

      toast.error('Failed to load personal entries');

      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  //  summary data
  const summaryCards = [
    {
      label: 'Total Entries',
      value: summary.totalEntries,
      icon: Receipt,
      iconClassName: 'text-primary',
    },
    {
      label: 'Paid',
      value: summary.paid,
      icon: CircleDollarSign,
      className: '',
      iconClassName: 'text-green-600',
    },
    {
      label: 'Unpaid',
      value: summary.unpaid,
      icon: CreditCard,
      className: '',
      iconClassName: 'text-yellow-600',
    },
    {
      label: 'Received',
      value: summary.received,
      icon: Wallet,
      className: '',
      iconClassName: 'text-blue-600',
    },
  ];

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // ==============================
  // CREATE
  // ==============================

  const handleCreate = () => {
    setSelectedEntry(null);
    setModalOpen(true);
  };

  // ==============================
  // EDIT
  // ==============================

  const handleEdit = (entry: PersonalEntry) => {
    setSelectedEntry(entry);
    setModalOpen(true);
  };

  // ==============================
  // CLOSE MODAL
  // ==============================

  const handleCloseModal = () => {
    if (submitLoading) return;

    setModalOpen(false);
    setSelectedEntry(null);
  };

  // ==============================
  // CREATE / UPDATE
  // ==============================

  const handleSubmit = async (payload: PersonalEntryPayload) => {
    try {
      setSubmitLoading(true);

      if (selectedEntry) {
        const response = await updatePersonalEntry(selectedEntry.id, payload);

        toast.success(
          response?.message || 'Personal entry updated successfully',
        );
      } else {
        const response = await createPersonalEntry(payload);

        toast.success(
          response?.message || 'Personal entry created successfully',
        );
      }

      setModalOpen(false);
      setSelectedEntry(null);

      await fetchEntries();
    } catch (error) {
      console.error('Failed to save personal entry:', error);

      toast.error(
        selectedEntry
          ? 'Failed to update personal entry'
          : 'Failed to create personal entry',
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // ==============================
  // DELETE
  // ==============================

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this entry?',
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const response = await deletePersonalEntry(id);

      toast.success(response?.message || 'Personal entry deleted successfully');

      // যদি current page-এ শেষ item delete হয়
      // তাহলে previous page-এ যাবে
      if (entries.length === 1 && page > 1) {
        setPage(prev => prev - 1);
      } else {
        await fetchEntries();
      }
    } catch (error) {
      console.error('Failed to delete personal entry:', error);

      toast.error('Failed to delete personal entry');
    } finally {
      setDeletingId(null);
    }
  };

  // ==============================
  // PAGINATION
  // ==============================

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > meta.totalPages) {
      return;
    }

    setPage(newPage);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <AccountPageHeader
        title="Personal Entries"
        description="Manage personal account entries."
        buttonText="New Entry"
        onCreate={handleCreate}
        summaryCards={summaryCards}
      />

      {/* TABLE */}

      <PersonalTable
        entries={entries}
        meta={meta}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPageChange={handlePageChange}
        deletingId={deletingId}
      />

      {/* MODAL */}

      <PersonalEntryModal
        open={modalOpen}
        entry={selectedEntry}
        loading={submitLoading}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />

      {/* DELETE LOADING */}
      {deletingId && (
        <div className="pointer-events-none fixed bottom-5 right-5 z-[60]">
          <div className="flex items-center gap-2 rounded-lg border bg-background px-4 py-3 text-sm shadow-lg">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Deleting...
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalPage;
