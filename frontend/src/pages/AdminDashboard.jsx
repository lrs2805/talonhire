
import React from 'react';
import { Link } from 'react-router-dom';
import Card from '@/components/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { name: 'Jan', revenue: 4000, matches: 24 },
  { name: 'Feb', revenue: 3000, matches: 13 },
  { name: 'Mar', revenue: 2000, matches: 98 },
  { name: 'Apr', revenue: 2780, matches: 39 },
  { name: 'May', revenue: 1890, matches: 48 },
  { name: 'Jun', revenue: 2390, matches: 38 },
];

export default function AdminDashboard() {
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="space-x-4 text-sm font-medium">
          <Link to="/admin/companies" className="hover:text-primary">Companies</Link>
          <Link to="/admin/candidates" className="hover:text-primary">Candidates</Link>
          <Link to="/admin/jobs" className="hover:text-primary">Jobs</Link>
          <Link to="/admin/contracts" className="hover:text-primary">Contracts</Link>
          <Link to="/admin/payments" className="hover:text-primary">Payments</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card><p className="text-muted-foreground">Total Matches</p><p className="text-3xl font-bold">1,204</p></Card>
        <Card><p className="text-muted-foreground">Conversion %</p><p className="text-3xl font-bold">18.5%</p></Card>
        <Card><p className="text-muted-foreground">Total Revenue</p><p className="text-3xl font-bold text-green-500">$45,200</p></Card>
        <Card><p className="text-muted-foreground">Active Contracts</p><p className="text-3xl font-bold">32</p></Card>
      </div>

      <Card className="h-[400px]">
        <h2 className="text-xl font-bold mb-6">Revenue & Matches Over Time</h2>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="matches" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
