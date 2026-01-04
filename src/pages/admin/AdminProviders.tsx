import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Users, Search, Building2, MapPin, Star, ArrowRight } from "lucide-react";

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

const AdminProviders = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      const { data, error } = await supabase.rpc('get_all_providers');
      if (data) {
        const approved = data.filter((p: Provider) => p.status === 'approved');
        setProviders(approved);
        setFilteredProviders(approved);
      }
      setIsLoading(false);
    };

    fetchProviders();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = providers.filter(
      p => p.clinic_name.toLowerCase().includes(query) ||
           p.email.toLowerCase().includes(query) ||
           p.city.toLowerCase().includes(query) ||
           p.primary_specialty.toLowerCase().includes(query)
    );
    setFilteredProviders(filtered);
  }, [searchQuery, providers]);

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
          Active Providers
        </h1>
        <p className="text-white/60">
          Manage approved providers on the platform
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, city, or specialty..."
            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
          />
        </div>
      </div>

      {/* Providers Grid */}
      {filteredProviders.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-white font-medium text-lg mb-2">
            {searchQuery ? "No providers found" : "No Active Providers"}
          </h3>
          <p className="text-white/50">
            {searchQuery 
              ? "Try adjusting your search query" 
              : "Approved providers will appear here"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProviders.map(provider => (
            <Link
              key={provider.id}
              to={`/admin/applications/${provider.id}`}
              className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-[#d4af37]/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-[#d4af37]" />
                </div>
                <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-[#d4af37] group-hover:translate-x-1 transition-all" />
              </div>

              <h3 className="text-white font-medium mb-1">{provider.clinic_name}</h3>
              <p className="text-white/50 text-sm mb-3">{provider.email}</p>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-white/60">
                  <MapPin className="w-3 h-3" />
                  <span>{provider.city}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-xs">
                  {provider.primary_specialty}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProviders;
