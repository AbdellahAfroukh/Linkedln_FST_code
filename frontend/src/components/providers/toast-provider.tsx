import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      duration={4000}
      closeButton
      expand={true}
    />
  );
}
