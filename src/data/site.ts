export type SocialLink = Readonly<{
  network: string;
  label: string;
  url: string;
}>;

export const siteConfig = {
  socialLinks: [],
} as const satisfies Readonly<{ socialLinks: ReadonlyArray<SocialLink> }>;
