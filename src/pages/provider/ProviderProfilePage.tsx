import { useState, useEffect } from "react";
import { useProviderAuth } from "@/hooks/useProviderAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Building2, MapPin, Phone, Globe, Save } from "lucide-react";

const specialties = [
  "Botox & Fillers",
  "Laser Treatments",
  "Skin Rejuvenation",
  "Hair Restoration",
  "Body Contouring",
  "Comprehensive Aesthetics",
  "Other"
];

const yearsOptions = ["1-2 years", "3-5 years", "6-10 years", "10-15 years", "15+ years"];

const ProviderProfilePage = () => {
  const { providerProfile, refreshProviderProfile } = useProviderAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    clinic_name: '',
    primary_specialty: '',
    secondary_specialties: [] as string[],
    address: '',
    city: '',
    phone: '',
    website: '',
    bio: '',
    years_in_practice: '',
    credentials: ''
  });

  useEffect(() => {
    if (providerProfile) {
      setFormData({
        clinic_name: providerProfile.clinic_name || '',
        primary_specialty: providerProfile.primary_specialty || '',
        secondary_specialties: providerProfile.secondary_specialties || [],
        address: providerProfile.address || '',
        city: providerProfile.city || '',
        phone: providerProfile.phone || '',
        website: providerProfile.website || '',
        bio: providerProfile.bio || '',
        years_in_practice: providerProfile.years_in_practice || '',
        credentials: providerProfile.credentials || ''
      });
    }
  }, [providerProfile]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSecondarySpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      secondary_specialties: prev.secondary_specialties.includes(specialty)
        ? prev.secondary_specialties.filter(s => s !== specialty)
        : [...prev.secondary_specialties, specialty]
    }));
  };

  const handleSave = async () => {
    if (!providerProfile) return;

    setIsLoading(true);
    const { error } = await supabase
      .from("provider_profiles")
      .update(formData)
      .eq("id", providerProfile.id);

    setIsLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Your profile has been updated" });
      refreshProviderProfile();
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-2xl lg:text-3xl font-medium text-white mb-2">
          My Clinic Profile
        </h1>
        <p className="text-white/60">
          Update your clinic information visible to clients
        </p>
      </div>

      <div className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#d4af37]" />
            </div>
            <h2 className="text-white font-medium text-lg">Basic Information</h2>
          </div>

          <div className="grid gap-5">
            <div className="space-y-2">
              <Label className="text-white/80">Clinic / Practice Name</Label>
              <Input
                value={formData.clinic_name}
                onChange={(e) => updateField("clinic_name", e.target.value)}
                className="bg-white/5 border-white/20 text-white focus:border-[#d4af37]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/80">Primary Specialty</Label>
              <Select value={formData.primary_specialty} onValueChange={(v) => updateField("primary_specialty", v)}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-[#d4af37]">
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-white/20">
                  {specialties.map(s => (
                    <SelectItem key={s} value={s} className="text-white hover:bg-white/10">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white/80">Secondary Specialties</Label>
              <div className="flex flex-wrap gap-2">
                {specialties.filter(s => s !== formData.primary_specialty).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSecondarySpecialty(s)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      formData.secondary_specialties.includes(s)
                        ? 'bg-[#d4af37] text-[#1a1a2e]'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Location & Contact */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-white font-medium text-lg">Location & Contact</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-white/80">Street Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => updateField("address", e.target.value)}
                className="bg-white/5 border-white/20 text-white focus:border-[#d4af37]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/80">City</Label>
              <Input
                value={formData.city}
                onChange={(e) => updateField("city", e.target.value)}
                className="bg-white/5 border-white/20 text-white focus:border-[#d4af37]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/80">Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="bg-white/5 border-white/20 text-white focus:border-[#d4af37]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/80">Website</Label>
              <Input
                value={formData.website}
                onChange={(e) => updateField("website", e.target.value)}
                className="bg-white/5 border-white/20 text-white focus:border-[#d4af37]"
                placeholder="https://"
              />
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-medium text-lg mb-6">About Your Practice</h2>

          <div className="grid gap-5">
            <div className="space-y-2">
              <Label className="text-white/80">Bio</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => updateField("bio", e.target.value.slice(0, 500))}
                className="bg-white/5 border-white/20 text-white focus:border-[#d4af37] min-h-[120px]"
                placeholder="Tell clients about your practice..."
              />
              <p className="text-white/40 text-xs text-right">{formData.bio.length}/500</p>
            </div>

            <div className="space-y-2">
              <Label className="text-white/80">Years in Practice</Label>
              <Select value={formData.years_in_practice} onValueChange={(v) => updateField("years_in_practice", v)}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-[#d4af37]">
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-white/20">
                  {yearsOptions.map(y => (
                    <SelectItem key={y} value={y} className="text-white hover:bg-white/10">{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white/80">Credentials & Certifications</Label>
              <Textarea
                value={formData.credentials}
                onChange={(e) => updateField("credentials", e.target.value)}
                className="bg-white/5 border-white/20 text-white focus:border-[#d4af37]"
                placeholder="Board certifications, training, etc."
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-[#1a1a2e] min-w-[150px]"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-[#1a1a2e] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfilePage;
