import type { IconMap, SocialLink } from '@/types'

export const SITE = {
  title: '1svg',
  description:
    '1svg is a minimalistic and unstyled blog template — built with Astro, Tailwind and shadcn/ui.',
  href: 'https://1svg.vercel.app',
  author: '1svg',
  locale: 'en-US',
}

export const NAV_LINKS: SocialLink[] = [
  {
    href: '/workshop',
    label: 'workshop',
  },
  {
    href: '/about',
    label: 'about',
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
