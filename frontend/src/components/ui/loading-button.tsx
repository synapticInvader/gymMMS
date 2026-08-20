import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { ComponentProps } from "react";

export function LoadingButton({
  loading,
  disabled,
  children,
  ...props
}: ComponentProps<typeof Button> & { loading?: boolean }) {
  return (
    <Button disabled={loading || disabled} {...props}>
      {loading && <Spinner />}
      {children}
    </Button>
  );
}
