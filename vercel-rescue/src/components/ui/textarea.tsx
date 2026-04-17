"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-oxfordGrey-200 bg-oxfordGrey-50 px-3 py-2 text-sm text-oxfordGrey-900 ring-offset-white placeholder:text-oxfordGrey-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-utsGreen-800 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
