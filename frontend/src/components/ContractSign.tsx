import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

interface ContractData {
  id: string;
  contract_type: 'fee_15pct' | 'service_markup_40pct';
  fee_percentage?: number;
  fee_total_amount?: number;
  monthly_salary?: number;
  monthly_markup_pct?: number;
  monthly_total?: number;
  relocation_fee?: number;
  start_date?: string;
  end_date?: string;
  both_signed?: boolean;
  jobs?: { title: string };
  candidates?: { profiles?: { full_name: string } };
  companies?: { name: string };
}

interface Props {
  contract: ContractData;
  onSigned?: () => void;
}

export default function ContractSign({ contract, onSigned }: Props) {
  const { t } = useTranslation();
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);

  const isFee = contract.contract_type === 'fee_15pct';
  const candidateName = contract.candidates?.profiles?.full_name || 'Candidate';
  const companyName = contract.companies?.name || 'Company';
  const jobTitle = contract.jobs?.title || 'Position';

  const handleSign = async () => {
    if (!agreed) return;
    setSigning(true);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await supabase.functions.invoke('contract-sign', {
        body: {
          contractId: contract.id,
          consentText: `I, the undersigned, agree to all terms of this ${isFee ? 'Recruitment Fee' : 'Service'} Agreement for the position of ${jobTitle} between ${companyName} and ${candidateName}.`,
        },
      });

      if (res.error) throw new Error(res.error.message);
      setResult(res.data);
      if (res.data?.success) onSigned?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign';
      setResult({ error: message });
    } finally {
      setSigning(false);
    }
  };

  if (contract.both_signed) {
    return (
      <div className="card-neon p-6 text-center">
        <div className="text-4xl mb-2">✅</div>
        <h3 className="text-lg font-heading text-neon-green">Contract Fully Signed</h3>
        <p className="text-gray-400 text-sm mt-1">Both parties have agreed to the terms.</p>
      </div>
    );
  }

  return (
    <div className="card-neon p-6 space-y-6">
      <h3 className="text-xl font-heading text-white">
        {isFee ? 'Recruitment Fee Agreement' : 'Service Agreement'}
      </h3>

      {/* Contract Summary */}
      <div className="bg-gray-900/50 rounded-lg p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Position</span>
          <span className="text-white">{jobTitle}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Company</span>
          <span className="text-white">{companyName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Candidate</span>
          <span className="text-white">{candidateName}</span>
        </div>
        <hr className="border-gray-700" />
        {isFee ? (
          <>
            <div className="flex justify-between">
              <span className="text-gray-400">Fee</span>
              <span className="text-neon-cyan">{contract.fee_percentage || 15}% of annual salary</span>
            </div>
            {contract.fee_total_amount && (
              <div className="flex justify-between">
                <span className="text-gray-400">Total Amount</span>
                <span className="text-neon-green font-bold">€{contract.fee_total_amount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Payment</span>
              <span className="text-white">90 days or 3 installments</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Guarantee</span>
              <span className="text-white">90-day free replacement</span>
            </div>
          </>
        ) : (
          <>
            {contract.monthly_salary && (
              <div className="flex justify-between">
                <span className="text-gray-400">Monthly Salary</span>
                <span className="text-white">€{contract.monthly_salary.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Markup</span>
              <span className="text-neon-cyan">{contract.monthly_markup_pct || 40}%</span>
            </div>
            {contract.monthly_total && (
              <div className="flex justify-between">
                <span className="text-gray-400">Monthly Total</span>
                <span className="text-neon-green font-bold">€{contract.monthly_total.toLocaleString()}</span>
              </div>
            )}
            {(contract.relocation_fee ?? 0) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">Relocation Fee</span>
                <span className="text-white">€{contract.relocation_fee?.toLocaleString()} (one-time)</span>
              </div>
            )}
          </>
        )}
        {contract.start_date && (
          <div className="flex justify-between">
            <span className="text-gray-400">Start Date</span>
            <span className="text-white">{contract.start_date}</span>
          </div>
        )}
      </div>

      {/* Sign Contract */}
      <div className="space-y-4">
        <div className="border border-gray-700 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-neon-cyan text-lg">⚡</span>
            <span className="text-white font-medium">Electronic Signature</span>
          </div>
          <p className="text-gray-400 text-xs">
            Legally valid electronic signature (eIDAS / LGPD compliant). Recorded with SHA-256 document hash, IP address, timestamp, and user agent.
          </p>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-neon-cyan focus:ring-neon-cyan"
            />
            <span className="text-sm text-gray-300">
              I have read and agree to all terms of this {isFee ? 'Recruitment Fee' : 'Service'} Agreement.
              I understand this constitutes a legally binding electronic signature.
            </span>
          </label>

          <button
            onClick={handleSign}
            disabled={!agreed || signing}
            className="btn-cta-cyan w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {signing ? 'Signing...' : 'Sign Contract'}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className={`rounded-lg p-3 text-sm ${result.error ? 'bg-red-900/30 text-red-400' : 'bg-neon-green/10 text-neon-green'}`}>
          {result.error || result.message}
        </div>
      )}

      {/* Legal Note */}
      <p className="text-xs text-gray-500 text-center">
        LGPD/GDPR compliant. Data retained for 90 days after contract end.
        Each signature records: SHA-256 document hash, signer IP, timestamp, and user agent.
      </p>
    </div>
  );
}
