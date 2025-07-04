'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomCheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CustomCheckboxProps
>(({ className, indeterminate = false, ...props }, ref) => {
  const internalRef = React.useRef<HTMLButtonElement>(null);

  // Combine internal ref and external ref
  React.useImperativeHandle(ref, () => internalRef.current!);

  React.useEffect(() => {
    const input = internalRef.current?.querySelector(
      'input[type="checkbox"]'
    ) as HTMLInputElement | null;
  
    if (input) {
      input.indeterminate = indeterminate;
    }
  }, [indeterminate]);
  
  return (
    <CheckboxPrimitive.Root
      ref={internalRef}
      className={cn(
        'peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <Check className="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
Checkbox.displayName = 'Checkbox';

export { Checkbox };
