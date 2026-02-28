
import React, { useState } from 'react';
import AdminTable from '@/components/AdminTable';

export default function AdminContractsPage() {
  const [data] = useState([
    { id: '1', candidate: 'Alex Smith', company: 'TechFlow', status: 'Signed' },
  ]);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'candidate', label: 'Candidate' },
    { key: 'company', label: 'Company' },
    { key: 'status', label: 'Status' }
  ];

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold">Manage Contracts</h1>
      <AdminTable 
        columns={columns} 
        data={data} 
        onEdit={(row) => alert(`Edit ${row.id}`)} 
        onDelete={(row) => alert(`Delete ${row.id}`)} 
      />
    </div>
  );
}
