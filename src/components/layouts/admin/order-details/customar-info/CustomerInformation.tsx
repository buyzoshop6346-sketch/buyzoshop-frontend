'use client';

import React, { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { Pencil } from 'lucide-react';

import { Order } from '@/types/orders';
import EditOrderModal from './EditOrderModal';

interface InfoItemProps {
  label: string;
  value: string;
}

interface CustomerInformationProps {
  order: Order;
  fetchOrders: () => Promise<void>;
}

const InfoItem = ({ label, value }: InfoItemProps) => {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-medium">{value}</p>
    </div>
  );
};

const CustomerInformation = ({
  order,
  fetchOrders,
}: CustomerInformationProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const whatsappNumber = (order.phone || '').replace(/\D/g, '');

  return (
    <>
      <section className="mt-6 rounded-sm border bg-background p-5">
        {/* HEADER */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Customer Information</h2>

          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>
        </div>

        {/* CUSTOMER INFORMATION */}
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoItem
            label="Name"
            value={order.name || order.user?.name || '-'}
          />

          <InfoItem label="Email" value={order.user?.email || '-'} />

          <div>
            <p className="text-xs font-medium text-muted-foreground">Phone</p>

            {whatsappNumber ? (
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-green-600 transition-colors hover:text-green-700 hover:underline"
              >
                <FaWhatsapp className="h-5 w-5" />
                <span>{order.phone}</span>
              </a>
            ) : (
              <p className="mt-1 text-sm font-medium">-</p>
            )}
          </div>

          <InfoItem label="District (Zila)" value={order.district || '-'} />

          <InfoItem label="Thana / Upazila" value={order.thana || '-'} />

          <InfoItem label="Address" value={order.address || '-'} />
        </div>

        {/* ORDER NOTES */}
        <div className="mt-5 border-t pt-4">
          <p className="text-sm font-medium">Order Notes</p>

          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-muted-foreground">
            {order.note || 'No notes provided'}
          </p>
        </div>
      </section>

      {/* EDIT ORDER MODAL */}
      <EditOrderModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        order={order}
        fetchOrders={fetchOrders}
      />
    </>
  );
};

export default CustomerInformation;
