"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Loader2, Bug, Lightbulb, Sparkles, HelpCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { contactSchema, ContactFormValues } from "@/lib/validations/contact"
import { useServerSession } from "@/components/session-provider"
import { cn } from "@/lib/utils"

interface ContactFormProps {
  onSuccess?: () => void
  className?: string
}

export function ContactForm({ onSuccess, className }: ContactFormProps) {
  const t = useTranslations("contact")
  const { user } = useServerSession()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      subject: "other",
      message: "",
    },
  })

  async function onSubmit(data: ContactFormValues) {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      toast.success(t("form.success"))
      reset()
      onSuccess?.()
    } catch (error) {
      toast.error(t("form.error"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("grid gap-4", className)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">{t("form.name")}</Label>
          <Input
            id="name"
            placeholder={t("form.namePlaceholder")}
            className="h-11 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">{t("form.email")}</Label>
          <Input
            id="email"
            placeholder={t("form.emailPlaceholder")}
            className="h-11 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="subject">{t("form.subject")}</Label>
        <Controller
          control={control}
          name="subject"
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger id="subject" className="h-11 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
                <SelectValue placeholder={t("form.subjectPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">
                  <div className="flex items-center gap-2">
                    <Bug className="h-4 w-4 text-red-500" />
                    <span>{t("subjects.bug")}</span>
                  </div>
                </SelectItem>
                <SelectItem value="feature">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-blue-500" />
                    <span>{t("subjects.feature")}</span>
                  </div>
                </SelectItem>
                <SelectItem value="improvement">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>{t("subjects.improvement")}</span>
                  </div>
                </SelectItem>
                <SelectItem value="other">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-zinc-500" />
                    <span>{t("subjects.other")}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.subject && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.subject.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="message">{t("form.message")}</Label>
        <Textarea
          id="message"
          placeholder={t("form.messagePlaceholder")}
          className="min-h-[120px] bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
          {...register("message")}
        />
        {errors.message && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.message.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full h-11 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all font-semibold"
        disabled={isSubmitting}
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSubmitting ? t("form.submitting") : t("form.submit")}
      </Button>
    </form>
  )
}
