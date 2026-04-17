"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-oxfordGrey-200 bg-oxfordGrey-50 px-3 py-2 text-sm text-oxfordGrey-900 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-oxfordGrey-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-utsGreen-800 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
