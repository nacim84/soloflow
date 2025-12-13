export function FooterSection() {
  return (
    <footer className="text-center py-8 text-zinc-500 dark:text-zinc-600 text-sm border-t border-zinc-200 dark:border-white/5 bg-white dark:bg-[#09090b]">
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-6 text-xs font-medium">
          <a
            href="#"
            className="hover:text-indigo-600 dark:hover:text-white transition"
          >
            Privacy
          </a>
          <a
            href="#"
            className="hover:text-indigo-600 dark:hover:text-white transition"
          >
            Terms
          </a>
          <a
            href="#"
            className="hover:text-indigo-600 dark:hover:text-white transition"
          >
            Status
          </a>
        </div>
        <p>&copy; {new Date().getFullYear()} Key API Manager. Built for developers.</p>
      </div>
    </footer>
  );
}
