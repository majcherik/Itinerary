import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"

const Command = React.forwardRef<any, any>(({ className, ...props }, ref) => {
    return (
        // @ts-ignore
        <CommandPrimitive
            ref={ref}
            className={cn(
                "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
                className
            )}
            {...props}
        />
    );
})
Command.displayName = CommandPrimitive.displayName

const CommandInput = React.forwardRef<any, any>(({ className, ...props }, ref) => {
    return (
        <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            {/* @ts-ignore */}
            <CommandPrimitive.Input
                ref={ref}
                className={cn(
                    "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                {...props}
            />
        </div>
    );
})
CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = React.forwardRef<any, any>(({ className, ...props }, ref) => {
    return (
        // @ts-ignore
        <CommandPrimitive.List
            ref={ref}
            className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
            {...props}
        />
    );
})
CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = React.forwardRef<any, any>((props, ref) => {
    return (
        // @ts-ignore
        <CommandPrimitive.Empty
            ref={ref}
            className="py-6 text-center text-sm"
            {...props}
        />
    );
})
CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup = React.forwardRef<any, any>(({ className, ...props }, ref) => {
    return (
        // @ts-ignore
        <CommandPrimitive.Group
            ref={ref}
            className={cn(
                "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
                className
            )}
            {...props}
        />
    );
})
CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandSeparator = React.forwardRef<any, any>(({ className, ...props }, ref) => {
    return (
        // @ts-ignore
        <CommandPrimitive.Separator
            ref={ref}
            className={cn("-mx-1 h-px bg-border", className)}
            {...props}
        />
    );
})
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

const CommandItem = React.forwardRef<any, any>(({ className, ...props }, ref) => {
    return (
        // @ts-ignore
        <CommandPrimitive.Item
            ref={ref}
            className={cn(
                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                className
            )}
            {...props}
        />
    );
})
CommandItem.displayName = CommandPrimitive.Item.displayName

const CommandShortcut = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
    return (
        <span
            className={cn(
                "ml-auto text-xs tracking-widest text-muted-foreground",
                className
            )}
            {...props}
        />
    )
}
CommandShortcut.displayName = "CommandShortcut"

export {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandShortcut,
    CommandSeparator,
}
