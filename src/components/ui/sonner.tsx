"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-brand-600 group-[.toaster]:text-white group-[.toaster]:border-brand-500 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl",
          description: "group-[.toast]:text-white/80",
          actionButton:
            "group-[.toast]:bg-white group-[.toast]:text-brand-600",
          cancelButton:
            "group-[.toast]:bg-white/10 group-[.toast]:text-white",
          success: "group-[.toaster]:bg-brand-600 group-[.toaster]:border-brand-500",
          error: "group-[.toaster]:bg-red-600 group-[.toaster]:border-red-500",
          warning: "group-[.toaster]:bg-amber-500 group-[.toaster]:border-amber-400",
          info: "group-[.toaster]:bg-brand-600 group-[.toaster]:border-brand-500",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
