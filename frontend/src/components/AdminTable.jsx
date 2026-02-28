
import React from 'react';

export default function AdminTable({ columns, data, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto bg-card rounded-lg border border-border">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {columns.map((col, idx) => (
              <th key={idx} className="p-4 font-semibold text-muted-foreground">{col.label}</th>
            ))}
            <th className="p-4 font-semibold text-muted-foreground text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr key={rowIdx} className="border-b border-border hover:bg-muted/20 transition-colors">
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="p-4">{row[col.key]}</td>
              ))}
              <td className="p-4 text-right space-x-2">
                <button onClick={() => onEdit(row)} className="text-sm text-blue-500 hover:underline">Edit</button>
                <button onClick={() => onDelete(row)} className="text-sm text-red-500 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length + 1} className="p-8 text-center text-muted-foreground">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
