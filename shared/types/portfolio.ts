export interface PortfolioProject {
  id: string
  title: string
  category: string
  // First photo is the cover
  images: string[]
}

export interface Portfolio {
  categories: string[]
  projects: PortfolioProject[]
}
