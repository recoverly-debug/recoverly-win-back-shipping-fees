import { User, Mail, Building } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const ProfileTab = () => (
  <div className="space-y-6">
    <div className="rounded-lg border border-border bg-card p-6 space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>

      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-coral/20 flex items-center justify-center">
          <User className="h-7 w-7 text-foreground" />
        </div>
        <div>
          <p className="font-medium text-foreground">Alex Johnson</p>
          <p className="text-sm text-muted-foreground">alex@mystore.com</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="label-caps">First Name</Label>
          <Input defaultValue="Alex" className="bg-background border-border" />
        </div>
        <div className="space-y-2">
          <Label className="label-caps">Last Name</Label>
          <Input defaultValue="Johnson" className="bg-background border-border" />
        </div>
        <div className="space-y-2">
          <Label className="label-caps">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input defaultValue="alex@mystore.com" className="pl-9 bg-background border-border" />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="label-caps">Company</Label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input defaultValue="Alex's Apparel" className="pl-9 bg-background border-border" />
          </div>
        </div>
      </div>

      <Button className="glow-hover">Save Changes</Button>
    </div>

    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Password</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="label-caps">Current Password</Label>
          <Input type="password" placeholder="••••••••" className="bg-background border-border" />
        </div>
        <div className="space-y-2">
          <Label className="label-caps">New Password</Label>
          <Input type="password" placeholder="••••••••" className="bg-background border-border" />
        </div>
      </div>
      <Button variant="outline">Update Password</Button>
    </div>
  </div>
);

export default ProfileTab;
