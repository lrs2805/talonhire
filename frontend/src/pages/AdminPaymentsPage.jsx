
import React, { useState } from 'react';
import AdminTable from '@/components/AdminTable';

export default function AdminPaymentsPage() {
  const [data] = useState([
    { id: '1', amount: '$12,000', method: 'Stripe', status: 'Paid' },
  ]);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'amount', label: 'Amount' },
    { key: 'method', label: 'Method' },
    { key: 'status', label: 'Status' }
  ];

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold">Manage Payments</h1>
      <AdminTable 
        columns={columns} 
        data={data} 
        onEdit={(row) => alert(`Edit ${row.id}`)} 
        onDelete={(row) => alert(`Delete ${row.id}`)} 
      />
    </div>
  );
}
