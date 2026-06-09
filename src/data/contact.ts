export interface ContactEntry {
  name: string;
  href: string;
  faIcon: string;
  brandColor: string;
}

export const contacts: ContactEntry[] = [
  {
    name: "Twitter",
    href: "https://x.com/maybeYonas",
    faIcon: "fa-brands fa-x-twitter",
    brandColor: "#000000",
  },
  {
    name: "GitHub",
    href: "https://github.com/darvinrio",
    faIcon: "fa-brands fa-github",
    brandColor: "#333333",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/darvinrio",
    faIcon: "fa-brands fa-linkedin",
    brandColor: "#346ABF",
  },
  {
    name: "Telegram",
    href: "https://t.me/maybeyonas",
    faIcon: "fa-brands fa-telegram",
    brandColor: "#6AA7E6",
  },
];
