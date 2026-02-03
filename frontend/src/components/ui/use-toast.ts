import { toast as sonnerToast } from 'sonner';

export function useToast() {
  return {
    toast: ({
      title,
      description,
      variant,
    }: {
      title: string;
      description?: string;
      variant?: 'default' | 'destructive';
    }) => {
      if (variant === 'destructive') {
        sonnerToast.error(description || title);
      } else {
        sonnerToast.success(description || title);
      }
    },
  };
}
