"use client"

import { useState } from "react"
import { Toaster as Sonner } from "sonner"

export function Toaster() {
  const [position] = useState<"top-right" | "bottom-right">("top-right")

  return (
    <Sonner
      position={position}
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
    />
  )
}
