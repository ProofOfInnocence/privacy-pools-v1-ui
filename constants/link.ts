type Url = '/fund' | '/transfer' | '/withdraw'
type PageName = 'fund' | 'transfer' | 'withdraw'

type LinksConstant = {
  [k in PageName]: Url
}

type RoutedTab = {
  name: PageName
  link: Url
}

type RoutedTabs = RoutedTab[]
export interface Link {
  url: Url
  title: string
}

export const links: LinksConstant = {
  fund: '/fund',
  transfer: '/transfer',
  withdraw: '/withdraw',
}

export const routedTabs: RoutedTabs = [
  { name: 'fund', link: links.fund },
  { name: 'transfer', link: links.transfer },
  { name: 'withdraw', link: links.withdraw },
]

export const menuLinks = {
  home: '/',
}

// SOCIALS
export const DUNE = 'https://dune.xyz/k06a/TornadoCash-Nova'
export const TWITTER = 'https://twitter.com/TornadoCash'
export const TELEGRAM = 'https://t.me/TornadoOfficial'
export const GITHUB = 'https://git.tornado.ws'
export const TORNADO_CASH_LANDING = 'https://tornado.ws'
