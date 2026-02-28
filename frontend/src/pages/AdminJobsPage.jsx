
import React, { useState } from 'react';
import AdminTable from '@/components/AdminTable';

export default function AdminJobsPage() {
  const [data] = useState([
    { id: '1', title: 'Senior Frontend', company: 'TechFlow', status: 'Open' },
  ]);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'company', label: 'Company' },
    { key: 'status', label: 'Status' }
  ];

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold">Manage Jobs</h1>
      <AdminTable 
        columns={columns} 
        data={data} 
        onEdit={(row) => alert(`Edit ${row.title}`)} 
        onDelete={(row) => alert(`Delete ${row.title}`)} 
      />
    </div>
  );
}
