import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import ContractSign from '../components/ContractSign';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ContractPage() {
  const { contractId } = useParams<{ contractId: string }>();
  const { t } = useTranslation();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contractId) return;
    fetchContract();
  }, [contractId]);

  const fetchContract = async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('contracts')
      .select(`
        *,
        jobs(title, required_stack, salary_min, salary_max),
        candidates(profile_id, primary_role, profiles:profile_id(full_name, email)),
        companies(name, email, country)
      `)
      .eq('id', contractId)
      .single();

    if (err) {
      setError('Contract not found or access denied.');
    } else {
      setContract(data);
    }
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg">{error}</p>
          <Link to="/" className="text-neon-cyan hover:underline mt-4 inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-heading text-white">Contract</h1>
          <Link to="/" className="text-sm text-gray-400 hover:text-neon-cyan">
            ← Dashboard
          </Link>
        </div>

        {/* Signature Status */}
        {contract.pandadoc_status && contract.pandadoc_status !== 'none' && (
          <div className="mb-4 card-neon p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">PandaDoc Status:</span>
              <span className={`text-sm font-medium ${
                contract.pandadoc_status === 'completed' ? 'text-neon-green' :
                contract.pandadoc_status === 'declined' ? 'text-red-400' :
                'text-neon-cyan'
              }`}>
                {contract.pandadoc_status.charAt(0).toUpperCase() + contract.pandadoc_status.slice(1)}
              </span>
            </div>
          </div>
        )}

        <ContractSign contract={contract} onSigned={fetchContract} />
      </div>
    </div>
  );
}
