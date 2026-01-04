import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, Building2, MapPin, Phone, Globe, Mail, Calendar, 
  CheckCircle, XCircle, Clock, User, Award, FileText 
} from "lucide-react";

interface ProviderDetail {
  id: string;
  user_id: string;
  clinic_name: string;
  practice_type: string;
  primary_specialty: string;
  secondary_specialties: string[];
  address: string;
  city: string;
  phone: string;
  website: string | null;
  bio: string | null;
  years_in_practice: string | null;
  credentials: string | null;
  status: string;
  rejection_reason: string | null;
  approved_at: string | null;
  created_at: string;
  email: string;
}

const AdminApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [provider, setProvider] = useState<ProviderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchProvider = async () => {
      if (!id) return;
      
      const { data, error } = await supabase.rpc('get_provider_details', { 
        _provider_id: id 
      });
      
      if (data && data.length > 0) {
        setProvider(data[0]);
      }
      setIsLoading(false);
    };

    fetchProvider();
  }, [id]);

  const handleApprove = async () => {
    if (!provider) return;
    setIsProcessing(true);

    const { error } = await supabase.rpc('approve_provider', {
      _provider_id: provider.id
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Approved", description: `${provider.clinic_name} has been approved` });
      navigate("/admin/applications");
    }
    setIsProcessing(false);
  };

  const handleReject = async () => {
    if (!provider || !rejectionReason.trim()) return;
    setIsProcessing(true);

    const { error } = await supabase.rpc('reject_provider', {
      _provider_id: provider.id,
      _reason: rejectionReason
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Rejected", description: `${provider.clinic_name} has been rejected` });
      setShowRejectModal(false);
      navigate("/admin/applications");
    }
    setIsProcessing(false);
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-white/60">Provider not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/admin/applications")}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Applications
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl font-medium text-white mb-2">
              {provider.clinic_name}
            </h1>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[provider.status]}`}>
                {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
              </span>
              <span className="text-white/50 text-sm">
                Applied {format(new Date(provider.created_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>

          {provider.status === 'pending' && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowRejectModal(true)}
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isProcessing}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Approve
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Contact Info */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-medium text-lg mb-4">Contact Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white/50 text-xs">Email</p>
                <p className="text-white">{provider.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white/50 text-xs">Phone</p>
                <p className="text-white">{provider.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white/50 text-xs">Location</p>
                <p className="text-white">{provider.address}, {provider.city}</p>
              </div>
            </div>
            {provider.website && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-[#d4af37]" />
                </div>
                <div>
                  <p className="text-white/50 text-xs">Website</p>
                  <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-[#d4af37] hover:underline">
                    {provider.website}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Practice Info */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-medium text-lg mb-4">Practice Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white/70" />
              </div>
              <div>
                <p className="text-white/50 text-xs">Practice Type</p>
                <p className="text-white">{provider.practice_type === 'solo' ? 'Solo Practitioner' : 'Multi-Staff Clinic'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-white/70" />
              </div>
              <div>
                <p className="text-white/50 text-xs">Primary Specialty</p>
                <p className="text-white">{provider.primary_specialty}</p>
              </div>
            </div>
            {provider.years_in_practice && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white/70" />
                </div>
                <div>
                  <p className="text-white/50 text-xs">Experience</p>
                  <p className="text-white">{provider.years_in_practice}</p>
                </div>
              </div>
            )}
          </div>

          {provider.secondary_specialties && provider.secondary_specialties.length > 0 && (
            <div className="mt-4">
              <p className="text-white/50 text-xs mb-2">Secondary Specialties</p>
              <div className="flex flex-wrap gap-2">
                {provider.secondary_specialties.map((spec, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-sm">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bio & Credentials */}
        {(provider.bio || provider.credentials) && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-medium text-lg mb-4">About</h2>
            
            {provider.bio && (
              <div className="mb-4">
                <p className="text-white/50 text-xs mb-2">Bio</p>
                <p className="text-white/80">{provider.bio}</p>
              </div>
            )}

            {provider.credentials && (
              <div>
                <p className="text-white/50 text-xs mb-2">Credentials & Certifications</p>
                <p className="text-white/80">{provider.credentials}</p>
              </div>
            )}
          </div>
        )}

        {/* Rejection Reason (if rejected) */}
        {provider.status === 'rejected' && provider.rejection_reason && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
            <h2 className="text-red-400 font-medium text-lg mb-2">Rejection Reason</h2>
            <p className="text-white/80">{provider.rejection_reason}</p>
          </div>
        )}

        {/* Approval Date (if approved) */}
        {provider.status === 'approved' && provider.approved_at && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              <div>
                <p className="text-emerald-400 font-medium">Approved</p>
                <p className="text-white/60 text-sm">
                  on {format(new Date(provider.approved_at), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="bg-[#0f0f1a] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Reject Application</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-white/60 mb-4">
              Please provide a reason for rejecting <strong>{provider.clinic_name}</strong>'s application.
            </p>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="bg-white/5 border-white/20 text-white min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectModal(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={!rejectionReason.trim() || isProcessing}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : null}
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminApplicationDetail;
