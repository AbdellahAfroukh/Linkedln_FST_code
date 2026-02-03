import * as React from "react";

const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={`overflow-hidden ${className}`} {...props}>
    <div className="overflow-auto">{children}</div>
  </div>
));
ScrollArea.displayName = "ScrollArea";

export { ScrollArea };
