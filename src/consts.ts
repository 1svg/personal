import type { IconMap, SocialLink } from '@/types'

export const SITE = {
  title: '1svg',
  description:
    '1svg est un template de blog minimaliste et sans style prédéfini — construit avec Astro, Tailwind et shadcn/ui.',
  href: 'https://1svg.vercel.app',
  author: '1svg',
  locale: 'fr-FR',
}

export const NAV_LINKS: SocialLink[] = [
  {
    href: '/workshop',
    label: 'workshop',
  },
  {
    href: '/about',
    label: 'à propos',
  },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: 'https://github.com/1svg',
    label: 'GitHub',
  },
]

export const ICON_MAP: IconMap = {
  Website: 'lucide:globe',
  GitHub: 'lucide:github',
  Twitter: 'lucide:twitter',
  Email: 'lucide:mail',
  RSS: 'lucide:rss',
  Letterboxd: 'simple-icons:letterboxd',
}
