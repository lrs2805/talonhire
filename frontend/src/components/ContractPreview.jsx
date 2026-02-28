
import React from 'react';
import Card from '@/components/Card';

export default function ContractPreview({ contract, onSendSignature }) {
  if (!contract) return null;

  return (
    <Card className="space-y-6 max-w-2xl mx-auto">
      <div className="border-b border-border pb-4">
        <h2 className="text-2xl font-bold">Contract Summary</h2>
        <p className="text-muted-foreground">ID: {contract.id}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Company</p>
          <p className="font-semibold">{contract.companyName}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Candidate</p>
          <p className="font-semibold">{contract.candidateName}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Job Title</p>
          <p className="font-semibold">{contract.jobTitle}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Salary</p>
          <p className="font-semibold">{contract.salary}</p>
        </div>
        <div className="col-span-2 bg-muted/30 p-4 rounded mt-2">
          <p className="text-muted-foreground">Placement Fee</p>
          <p className="text-xl font-bold text-primary">{contract.feeAmount}</p>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button 
          onClick={onSendSignature}
          className="bg-primary text-primary-foreground px-6 py-2 rounded font-bold hover:bg-primary/90 transition-colors"
        >
          Send for Signature (DocuSign)
        </button>
      </div>
    </Card>
  );
}
