export interface ContactEntry {
  name: string;
  href: string;
  faIcon: string;
}

export const contacts: ContactEntry[] = [
  { name: "Twitter", href: "https://x.com/maybeYonas", faIcon: "fa-brands fa-x-twitter" },
  { name: "GitHub", href: "https://github.com/darvinrio", faIcon: "fa-brands fa-github" },
  { name: "LinkedIn", href: "https://linkedin.com/in/darvinrio", faIcon: "fa-brands fa-linkedin" },
  { name: "Telegram", href: "https://t.me/maybeyonas", faIcon: "fa-brands fa-telegram" },
];
