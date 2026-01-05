import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProviderAuth } from "@/hooks/useProviderAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Users, Mail, Phone, Edit, Trash2 } from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  specialties: string[];
  avatar_url: string | null;
  is_active: boolean;
}

const ROLE_OPTIONS = [
  { value: "practitioner", label: "Practitioner" },
  { value: "nurse", label: "Nurse" },
  { value: "aesthetician", label: "Aesthetician" },
  { value: "receptionist", label: "Receptionist" },
  { value: "manager", label: "Manager" },
];

const SPECIALTY_OPTIONS = [
  "Botox & Fillers",
  "Laser Treatments",
  "Chemical Peels",
  "Microneedling",
  "Body Contouring",
  "Skincare",
  "PRP Therapy",
  "Thread Lifts",
];

const ProviderStaffPage = () => {
  const { providerProfile } = useProviderAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "practitioner",
    specialties: [] as string[],
  });

  const { data: staffMembers, isLoading } = useQuery({
    queryKey: ["staff-members", providerProfile?.id],
    queryFn: async () => {
      if (!providerProfile?.id) return [];
      const { data, error } = await supabase
        .from("staff_members")
        .select("*")
        .eq("provider_id", providerProfile.id)
        .order("name");
      if (error) throw error;
      return data as StaffMember[];
    },
    enabled: !!providerProfile?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("staff_members").insert({
        provider_id: providerProfile!.id,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        role: data.role,
        specialties: data.specialties,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-members"] });
      toast.success("Staff member added successfully");
      resetForm();
    },
    onError: () => toast.error("Failed to add staff member"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("staff_members")
        .update({
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          role: data.role,
          specialties: data.specialties,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-members"] });
      toast.success("Staff member updated");
      resetForm();
    },
    onError: () => toast.error("Failed to update staff member"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("staff_members")
        .update({ is_active: isActive })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-members"] });
      toast.success("Staff status updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("staff_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-members"] });
      toast.success("Staff member removed");
    },
    onError: () => toast.error("Failed to remove staff member"),
  });

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", role: "practitioner", specialties: [] });
    setEditingStaff(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (staff: StaffMember) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email || "",
      phone: staff.phone || "",
      role: staff.role,
      specialties: staff.specialties || [],
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (editingStaff) {
      updateMutation.mutate({ id: editingStaff.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const toggleSpecialty = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  if (providerProfile?.practice_type !== "multi_staff") {
    return (
      <div className="p-6">
        <Card className="bg-[#1a1a2e]/50 border-white/10">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Solo Practice</h2>
            <p className="text-white/60">
              Staff management is available for multi-staff clinics only.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Staff Management</h1>
          <p className="text-white/60">Manage your clinic's team members</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsDialogOpen(open); }}>
          <DialogTrigger asChild>
            <Button className="bg-[#d4af37] hover:bg-[#c4a030] text-black">
              <Plus className="w-4 h-4 mr-2" /> Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>{editingStaff ? "Edit Staff Member" : "Add Staff Member"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10">
                    {ROLE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-white">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Specialties</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {SPECIALTY_OPTIONS.map((specialty) => (
                    <Badge
                      key={specialty}
                      variant={formData.specialties.includes(specialty) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        formData.specialties.includes(specialty)
                          ? "bg-[#d4af37] text-black hover:bg-[#c4a030]"
                          : "border-white/20 text-white/60 hover:border-white/40"
                      }`}
                      onClick={() => toggleSpecialty(specialty)}
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full bg-[#d4af37] hover:bg-[#c4a030] text-black"
              >
                {editingStaff ? "Update" : "Add"} Staff Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin" />
        </div>
      ) : !staffMembers?.length ? (
        <Card className="bg-[#1a1a2e]/50 border-white/10">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Staff Members</h2>
            <p className="text-white/60 mb-4">Add your first team member to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {staffMembers.map((staff) => (
            <Card key={staff.id} className={`bg-[#1a1a2e]/50 border-white/10 ${!staff.is_active && "opacity-60"}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#d4af37]/20 flex items-center justify-center">
                      <span className="text-[#d4af37] text-lg font-semibold">
                        {staff.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{staff.name}</CardTitle>
                      <Badge variant="outline" className="border-white/20 text-white/60 text-xs mt-1">
                        {ROLE_OPTIONS.find((r) => r.value === staff.role)?.label || staff.role}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={staff.is_active}
                      onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: staff.id, isActive: checked })}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {staff.email && (
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Mail className="w-4 h-4" />
                    {staff.email}
                  </div>
                )}
                {staff.phone && (
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Phone className="w-4 h-4" />
                    {staff.phone}
                  </div>
                )}
                {staff.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {staff.specialties.map((s) => (
                      <Badge key={s} className="bg-white/10 text-white/80 text-xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-white/10 text-white hover:bg-white/10"
                    onClick={() => handleEdit(staff)}
                  >
                    <Edit className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={() => deleteMutation.mutate(staff.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderStaffPage;
