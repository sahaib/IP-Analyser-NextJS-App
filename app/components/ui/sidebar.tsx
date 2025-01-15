import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

interface SidebarGroupLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, SidebarGroupLabelProps>((props, ref) => {
  const { className, asChild = false, children, ...rest } = props
  const Comp = asChild ? Slot : "div"

  const commonProps = {
    ref,
    "data-sidebar": "group-label",
    className: cn(
      "duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
      "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
      className
    ),
    ...rest
  }

  return React.createElement(Comp, commonProps, children)
})

SidebarGroupLabel.displayName = "SidebarGroupLabel"

export { SidebarGroupLabel } 