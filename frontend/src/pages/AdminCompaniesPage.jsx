
import React, { useState } from 'react';
import AdminTable from '@/components/AdminTable';

export default function AdminCompaniesPage() {
  const [data] = useState([
    { id: '1', name: 'TechFlow', country: 'USA', status: 'Active' },
    { id: '2', name: 'InnovateX', country: 'UK', status: 'Pending' }
  ]);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Company Name' },
    { key: 'country', label: 'Country' },
    { key: 'status', label: 'Status' }
  ];

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold">Manage Companies</h1>
      <AdminTable 
        columns={columns} 
        data={data} 
        onEdit={(row) => alert(`Edit ${row.name}`)} 
        onDelete={(row) => alert(`Delete ${row.name}`)} 
      />
    </div>
  );
}
