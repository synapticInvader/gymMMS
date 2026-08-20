import { AppSidebar } from "@/components/layout/Sidebar";
import { BrandingPreviewSync } from "@/components/layout/BrandingPreviewSync";
import { Topbar } from "@/components/layout/Topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <BrandingPreviewSync />
      <AppSidebar />
      <SidebarInset>
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
