"use client"

import { useState } from "react"
import { MessageSquarePlus } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ContactForm } from "@/components/contact/contact-form"

export function FloatingContactButton() {
  const t = useTranslations("contact")
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg md:bottom-8 md:right-8 h-12 w-12 p-0 md:h-auto md:w-auto md:px-4 md:py-2"
        >
          <MessageSquarePlus className="h-6 w-6 md:mr-2 md:h-5 md:w-5" />
          <span className="hidden md:inline">{t("floatingLabel")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("subtitle")}
          </DialogDescription>
        </DialogHeader>
        <ContactForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
