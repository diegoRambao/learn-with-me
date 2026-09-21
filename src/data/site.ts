export type SocialLink = Readonly<{
  network: string;
  label: string;
  url: string;
}>;

export const siteConfig = {
  socialLinks: [
    {
      network: "youtube",
      label: "Youtube",
      url: "https://www.youtube.com/@diegorambao",
    },

    {
      network: "github",
      label: "Github",
      url: "https://github.com/diegoRambao",
    },
    {
      network: "instagram",
      label: "Instagram",
      url: "https://www.instagram.com/diegorambao/",
    },
  ],
} as const satisfies Readonly<{ socialLinks: ReadonlyArray<SocialLink> }>;
