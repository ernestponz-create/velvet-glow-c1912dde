import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Users, ClipboardCheck, CheckCircle, XCircle, ArrowRight } from "lucide-react";

interface Stats {
  totalProviders: number;
  pendingApplications: number;
  approvedProviders: number;
  rejectedProviders: number;
}

const AdminOverview = () => {
  const [stats, setStats] = useState<Stats>({
    totalProviders: 0,
    pendingApplications: 0,
    approvedProviders: 0,
    rejectedProviders: 0
  });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.rpc('get_all_providers');
      
      if (data) {
        const pending = data.filter((p: any) => p.status === 'pending');
        const approved = data.filter((p: any) => p.status === 'approved');
        const rejected = data.filter((p: any) => p.status === 'rejected');
        
        setStats({
          totalProviders: data.length,
          pendingApplications: pending.length,
          approvedProviders: approved.length,
          rejectedProviders: rejected.length
        });
        
        setRecentApplications(pending.slice(0, 5));
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const statCards = [
    { icon: Users, label: "Total Providers", value: stats.totalProviders, color: "text-blue-400", bgColor: "bg-blue-400/10" },
    { icon: ClipboardCheck, label: "Pending Applications", value: stats.pendingApplications, color: "text-yellow-400", bgColor: "bg-yellow-400/10" },
    { icon: CheckCircle, label: "Approved", value: stats.approvedProviders, color: "text-emerald-400", bgColor: "bg-emerald-400/10" },
    { icon: XCircle, label: "Rejected", value: stats.rejectedProviders, color: "text-red-400", bgColor: "bg-red-400/10" }
  ];

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
          Admin Dashboard
        </h1>
        <p className="text-white/60">
          Manage provider applications and monitor platform activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-white/50 text-sm">{stat.label}</p>
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Applications */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-medium text-lg">Pending Applications</h2>
          <Link
            to="/admin/applications"
            className="text-[#d4af37] text-sm hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <div className="text-center py-8">
            <ClipboardCheck className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/50">No pending applications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentApplications.map((app) => (
              <Link
                key={app.id}
                to={`/admin/applications/${app.id}`}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
              >
                <div>
                  <p className="text-white font-medium">{app.clinic_name}</p>
                  <p className="text-white/50 text-sm">{app.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">
                    {app.primary_specialty}
                  </span>
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-[#d4af37] group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOverview;
