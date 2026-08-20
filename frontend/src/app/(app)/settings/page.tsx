import { BrandingForm } from "@/components/domain/settings/BrandingForm";
import { BranchesSection } from "@/components/domain/settings/BranchesSection";
import { PackagesSection } from "@/components/domain/settings/PackagesSection";
import { AdvancedBrandingStub } from "@/components/domain/settings/AdvancedBrandingStub";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Branding &amp; Settings</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BrandingForm />
        <AdvancedBrandingStub />
        <BranchesSection />
        <PackagesSection />
      </div>
    </div>
  );
}
