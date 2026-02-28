
import React, { useState } from 'react';
import AdminTable from '@/components/AdminTable';

export default function AdminCandidatesPage() {
  const [data] = useState([
    { id: '1', name: 'Alex Smith', location: 'USA', status: 'Active' },
    { id: '2', name: 'Maria Garcia', location: 'Spain', status: 'Inactive' }
  ]);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'location', label: 'Location' },
    { key: 'status', label: 'Status' }
  ];

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold">Manage Candidates</h1>
      <AdminTable 
        columns={columns} 
        data={data} 
        onEdit={(row) => alert(`Edit ${row.name}`)} 
        onDelete={(row) => alert(`Delete ${row.name}`)} 
      />
    </div>
  );
}
