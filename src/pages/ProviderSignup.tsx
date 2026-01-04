import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Upload, Building2, User, MapPin, FileText } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().trim().email({ message: "Invalid email address" });
const passwordSchema = z.string().min(8, { message: "Password must be at least 8 characters" });

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

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  clinicName: string;
  practiceType: 'solo' | 'multi_staff' | '';
  primarySpecialty: string;
  secondarySpecialties: string[];
  address: string;
  city: string;
  phone: string;
  website: string;
  bio: string;
  yearsInPractice: string;
  credentials: string;
  agreeToTerms: boolean;
}

const ProviderSignup = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    clinicName: "",
    practiceType: "",
    primarySpecialty: "",
    secondarySpecialties: [],
    address: "",
    city: "",
    phone: "",
    website: "",
    bio: "",
    yearsInPractice: "",
    credentials: "",
    agreeToTerms: false
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const toggleSecondarySpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      secondarySpecialties: prev.secondarySpecialties.includes(specialty)
        ? prev.secondarySpecialties.filter(s => s !== specialty)
        : [...prev.secondarySpecialties, specialty]
    }));
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      const emailResult = emailSchema.safeParse(formData.email);
      if (!emailResult.success) {
        newErrors.email = emailResult.error.errors[0].message;
      }
      const passwordResult = passwordSchema.safeParse(formData.password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (stepNumber === 2) {
      if (!formData.clinicName.trim()) newErrors.clinicName = "Clinic name is required";
      if (!formData.practiceType) newErrors.practiceType = "Practice type is required";
      if (!formData.primarySpecialty) newErrors.primarySpecialty = "Primary specialty is required";
    }

    if (stepNumber === 3) {
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the Terms of Service and Provider Agreement",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/provider-pending`
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create account");

      // Update user role to provider
      const { error: roleError } = await supabase
        .from("user_roles")
        .update({ role: 'provider' })
        .eq("user_id", authData.user.id);

      if (roleError) {
        // If update fails, try insert
        await supabase
          .from("user_roles")
          .insert({ user_id: authData.user.id, role: 'provider' });
      }

      // Create provider profile
      const { error: profileError } = await supabase
        .from("provider_profiles")
        .insert({
          user_id: authData.user.id,
          clinic_name: formData.clinicName,
          practice_type: formData.practiceType,
          primary_specialty: formData.primarySpecialty,
          secondary_specialties: formData.secondarySpecialties,
          address: formData.address,
          city: formData.city,
          phone: formData.phone,
          website: formData.website || null,
          bio: formData.bio || null,
          years_in_practice: formData.yearsInPractice || null,
          credentials: formData.credentials || null
        });

      if (profileError) throw profileError;

      toast({
        title: "Application Submitted!",
        description: "We'll review your application within 24-48 hours."
      });

      navigate("/provider-pending");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stepIndicators = [
    { num: 1, icon: User, label: "Account" },
    { num: 2, icon: Building2, label: "Practice" },
    { num: 3, icon: MapPin, label: "Location" },
    { num: 4, icon: FileText, label: "Profile" }
  ];

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-serif text-xl font-medium tracking-tight text-white">
            Dermica<span className="text-[#d4af37]">IQ</span>
          </Link>
          <Link to="/signin" className="text-white/60 hover:text-white text-sm transition-colors">
            Already a provider? Sign In
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-[600px]">
          {/* Hero */}
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-medium text-white mb-3">
              Join Our Provider Network
            </h1>
            <p className="text-white/60">
              Connect with clients seeking premium aesthetic services
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8 px-4">
            {stepIndicators.map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className={`flex flex-col items-center`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    step >= s.num 
                      ? 'bg-[#d4af37] text-[#1a1a2e]' 
                      : 'bg-white/10 text-white/40'
                  }`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs mt-2 ${step >= s.num ? 'text-white' : 'text-white/40'}`}>
                    {s.label}
                  </span>
                </div>
                {i < stepIndicators.length - 1 && (
                  <div className={`w-12 md:w-20 h-0.5 mx-2 mt-[-20px] ${
                    step > s.num ? 'bg-[#d4af37]' : 'bg-white/10'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Form Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Account Basics */}
              {step === 1 && (
                <div className="space-y-5">
                  <h2 className="font-serif text-xl text-white mb-6">Account Basics</h2>
                  
                  <div className="space-y-2">
                    <Label className="text-white/80">Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#d4af37]"
                      placeholder="clinic@example.com"
                    />
                    {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80">Password</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#d4af37]"
                      placeholder="Min. 8 characters"
                    />
                    {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80">Confirm Password</Label>
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateField("confirmPassword", e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#d4af37]"
                      placeholder="Confirm your password"
                    />
                    {errors.confirmPassword && <p className="text-red-400 text-sm">{errors.confirmPassword}</p>}
                  </div>
                </div>
              )}

              {/* Step 2: Practice Information */}
              {step === 2 && (
                <div className="space-y-5">
                  <h2 className="font-serif text-xl text-white mb-6">Practice Information</h2>
                  
                  <div className="space-y-2">
                    <Label className="text-white/80">Clinic / Practice Name</Label>
                    <Input
                      value={formData.clinicName}
                      onChange={(e) => updateField("clinicName", e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#d4af37]"
                      placeholder="Your clinic name"
                    />
                    {errors.clinicName && <p className="text-red-400 text-sm">{errors.clinicName}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-white/80">Practice Type</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { value: 'solo', label: 'Solo Practitioner', desc: 'I work alone' },
                        { value: 'multi_staff', label: 'Multi-Staff Clinic', desc: 'Multiple practitioners/staff' }
                      ].map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => updateField("practiceType", type.value)}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            formData.practiceType === type.value
                              ? 'border-[#d4af37] bg-[#d4af37]/10'
                              : 'border-white/20 bg-white/5 hover:border-white/40'
                          }`}
                        >
                          <p className="text-white font-medium">{type.label}</p>
                          <p className="text-white/50 text-sm">{type.desc}</p>
                        </button>
                      ))}
                    </div>
                    {errors.practiceType && <p className="text-red-400 text-sm">{errors.practiceType}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80">Primary Specialty</Label>
                    <Select value={formData.primarySpecialty} onValueChange={(v) => updateField("primarySpecialty", v)}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-[#d4af37]">
                        <SelectValue placeholder="Select your primary specialty" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a2e] border-white/20">
                        {specialties.map(s => (
                          <SelectItem key={s} value={s} className="text-white hover:bg-white/10">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.primarySpecialty && <p className="text-red-400 text-sm">{errors.primarySpecialty}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80">Secondary Specialties (optional)</Label>
                    <div className="flex flex-wrap gap-2">
                      {specialties.filter(s => s !== formData.primarySpecialty).map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSecondarySpecialty(s)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                            formData.secondarySpecialties.includes(s)
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
              )}

              {/* Step 3: Location & Contact */}
              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="font-serif text-xl text-white mb-6">Location & Contact</h2>
                  
                  <div className="space-y-2">
                    <Label className="text-white/80">Street Address</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#d4af37]"
                      placeholder="123 Clinic Street"
                    />
                    {errors.address && <p className="text-red-400 text-sm">{errors.address}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80">City</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#d4af37]"
                      placeholder="Los Angeles"
                    />
                    {errors.city && <p className="text-red-400 text-sm">{errors.city}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80">Phone Number</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#d4af37]"
                      placeholder="(555) 123-4567"
                    />
                    {errors.phone && <p className="text-red-400 text-sm">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80">Website (optional)</Label>
                    <Input
                      value={formData.website}
                      onChange={(e) => updateField("website", e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#d4af37]"
                      placeholder="https://yourclinic.com"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Profile */}
              {step === 4 && (
                <div className="space-y-5">
                  <h2 className="font-serif text-xl text-white mb-6">Profile (Optional)</h2>
                  
                  <div className="space-y-2">
                    <Label className="text-white/80">Profile Photo</Label>
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-[#d4af37]/50 transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 text-white/40 mx-auto mb-2" />
                      <p className="text-white/60 text-sm">Drag and drop or click to upload</p>
                      <p className="text-white/40 text-xs mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80">Bio / About Practice</Label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => updateField("bio", e.target.value.slice(0, 500))}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#d4af37] min-h-[100px]"
                      placeholder="Tell clients about your practice and approach..."
                    />
                    <p className="text-white/40 text-xs text-right">{formData.bio.length}/500</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80">Years in Practice</Label>
                    <Select value={formData.yearsInPractice} onValueChange={(v) => updateField("yearsInPractice", v)}>
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
                    <Label className="text-white/80">Credentials / Certifications</Label>
                    <Textarea
                      value={formData.credentials}
                      onChange={(e) => updateField("credentials", e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#d4af37]"
                      placeholder="Board certifications, training, etc."
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => updateField("agreeToTerms", checked)}
                        className="border-white/40 data-[state=checked]:bg-[#d4af37] data-[state=checked]:border-[#d4af37]"
                      />
                      <label htmlFor="terms" className="text-white/70 text-sm leading-relaxed">
                        I agree to the <a href="#" className="text-[#d4af37] hover:underline">Terms of Service</a> and{" "}
                        <a href="#" className="text-[#d4af37] hover:underline">Provider Agreement</a>
                      </label>
                    </div>
                    <p className="text-white/50 text-sm bg-white/5 p-3 rounded-lg">
                      Your application will be reviewed within 24-48 hours. You will receive an email once approved.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={prevStep}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-[#1a1a2e] font-medium hover:opacity-90"
                  >
                    Continue <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-[#1a1a2e] font-medium hover:opacity-90 min-w-[160px]"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-[#1a1a2e] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProviderSignup;
