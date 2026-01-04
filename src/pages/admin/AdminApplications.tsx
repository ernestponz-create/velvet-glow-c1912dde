import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ClipboardCheck, ArrowRight, Building2, MapPin, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Provider {
  id: string;
  clinic_name: string;
  practice_type: string;
  primary_specialty: string;
  city: string;
  status: string;
  created_at: string;
  email: string;
}

const AdminApplications = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      const { data, error } = await supabase.rpc('get_all_providers');
      if (data) {
        setProviders(data);
      }
      setIsLoading(false);
    };

    fetchProviders();
  }, []);

  const pendingProviders = providers.filter(p => p.status === 'pending');
  const approvedProviders = providers.filter(p => p.status === 'approved');
  const rejectedProviders = providers.filter(p => p.status === 'rejected');

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  const ProviderCard = ({ provider }: { provider: Provider }) => (
    <Link
      to={`/admin/applications/${provider.id}`}
      className="block bg-white/5 border border-white/10 rounded-xl p-5 hover:border-[#d4af37]/30 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white font-medium text-lg">{provider.clinic_name}</h3>
          <p className="text-white/50 text-sm">{provider.email}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[provider.status]}`}>
          {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
        <div className="flex items-center gap-2 text-white/60">
          <Building2 className="w-4 h-4" />
          <span>{provider.practice_type === 'solo' ? 'Solo' : 'Multi-Staff'}</span>
        </div>
        <div className="flex items-center gap-2 text-white/60">
          <MapPin className="w-4 h-4" />
          <span>{provider.city}</span>
        </div>
        <div className="flex items-center gap-2 text-white/60">
          <Calendar className="w-4 h-4" />
          <span>{format(new Date(provider.created_at), 'MMM d, yyyy')}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs">
          {provider.primary_specialty}
        </span>
        <span className="text-[#d4af37] text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
          Review <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-serif text-2xl lg:text-3xl font-medium text-white mb-2">
          Provider Applications
        </h1>
        <p className="text-white/60">
          Review and manage provider applications
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 p-1">
          <TabsTrigger 
            value="pending" 
            className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-[#0f0f1a]"
          >
            Pending ({pendingProviders.length})
          </TabsTrigger>
          <TabsTrigger 
            value="approved"
            className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-[#0f0f1a]"
          >
            Approved ({approvedProviders.length})
          </TabsTrigger>
          <TabsTrigger 
            value="rejected"
            className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-[#0f0f1a]"
          >
            Rejected ({rejectedProviders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingProviders.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              <ClipboardCheck className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-white font-medium text-lg mb-2">No Pending Applications</h3>
              <p className="text-white/50">All applications have been reviewed.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingProviders.map(provider => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved">
          {approvedProviders.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              <ClipboardCheck className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-white font-medium text-lg mb-2">No Approved Providers</h3>
              <p className="text-white/50">Approved providers will appear here.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {approvedProviders.map(provider => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected">
          {rejectedProviders.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              <ClipboardCheck className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-white font-medium text-lg mb-2">No Rejected Applications</h3>
              <p className="text-white/50">Rejected applications will appear here.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {rejectedProviders.map(provider => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminApplications;
