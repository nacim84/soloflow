import { useTranslations } from "next-intl";
import { ContactForm } from "@/components/contact/contact-form";

export default function ContactPage() {
  const t = useTranslations("contact");

  return (
    <div className="container flex items-center justify-center py-20">
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
  );
}
