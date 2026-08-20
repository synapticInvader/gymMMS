import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

/** UI-only preview of upcoming Branding features — intentionally non-functional. */
export function AdvancedBrandingStub() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Logo &amp; Custom Domain
          <Lock className="size-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="logo-upload">Logo</FieldLabel>
            <Input id="logo-upload" type="file" disabled />
          </Field>
          <Field>
            <FieldLabel htmlFor="custom-domain">Custom Domain</FieldLabel>
            <div className="flex gap-2">
              <Input id="custom-domain" placeholder="app.yourgym.com" disabled />
              <Button disabled variant="outline">
                Connect
              </Button>
            </div>
          </Field>
          <p className="text-xs text-muted-foreground">Coming soon.</p>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
