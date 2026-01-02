import { useTranslations } from "next-intl";
import { ContactForm } from "@/components/contact/contact-form";
import { Mail, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const t = useTranslations("contact");

  return (
    <div className="container relative flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0 py-10">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex rounded-l-2xl overflow-hidden min-h-[600px]">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <MessageSquare className="mr-2 h-6 w-6" />
          SoloFlow Support
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;{t("subtitle")}&rdquo;
            </p>
          </blockquote>
        </div>
        <div className="relative z-20 mt-8 space-y-4">
            <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-zinc-400" />
                <span>support@soloflow.com</span>
            </div>
        </div>
      </div>
      <div className="lg:p-8 flex items-center justify-center w-full">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
