import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Portfolio, PortfolioProject } from '#shared/types/portfolio'

const TABLE = 'elektraman_portfolio'
const BUCKET = 'elektraman-portfolio'
// Local dev reads and writes its own copy instead of the live portfolio
const DOC_ID = import.meta.dev ? 'dev' : 'live'
const UPLOAD_PREFIX = import.meta.dev ? 'dev/' : ''

let client: SupabaseClient | undefined

// Server-only client with the secret key: the table has RLS on and no policies, so nothing else can touch it
const supabase = () => {
  if (!client) {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SECRET_KEY
    if (!url || !key) throw createError({ statusCode: 503, statusMessage: 'Supabase is not configured' })
    client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  }
  return client
}

// What the site showed before the admin existed; served until the first save
export const defaultPortfolio: Portfolio = {
  categories: ['Residentieel', 'Commercieel', 'Onderhoud'],
  projects: [
    {
      id: '1',
      images: ['/elektra-aanleg/elektra-aanleg-1.jpeg', '/elektra-aanleg/elektra-aanleg-4.jpeg', '/elektra-aanleg/elektra-aanleg-2.jpeg', '/elektra-aanleg/elektra-aanleg-3.jpeg'],
      title: 'Elektra aanleg',
      category: 'Residentieel'
    },
    {
      id: '2',
      images: ['/groepskast/groepskast-2.jpeg', '/groepskast/groepskast-1.jpeg', '/groepskast/groepskast-3.jpeg', '/groepskast/groepskast-4.jpeg', '/groepskast/groepskast-5.jpeg'],
      title: 'Groepskast vervangen/aanleggen',
      category: 'Residentieel'
    },
    {
      id: '3',
      images: ['/grote-batterijen/grote-batterijen-1.jpeg', '/grote-batterijen/grote-batterijen-2.jpeg', '/grote-batterijen/grote-batterijen-3.jpeg', '/grote-batterijen/grote-batterijen-4.jpeg', '/grote-batterijen/grote-batterijen-5.jpeg', '/grote-batterijen/grote-batterijen-6.jpeg'],
      title: 'Grote batterijen (Vanaf 40.8 kW)',
      category: 'Commercieel'
    },
    {
      id: '4',
      images: ['/grote-laadpalen/grote-laadpalen-4.jpeg', '/grote-laadpalen/grote-laadpalen-2.jpeg', '/grote-laadpalen/grote-laadpalen-3.jpeg', '/grote-laadpalen/grote-laadpalen-1.jpeg'],
      title: 'Grote laadpalen (22 kW - 720 kW)',
      category: 'Commercieel'
    },
    {
      id: '5',
      images: ['/kleine-laadpalen/kleine-laadpalen-1.jpeg', '/kleine-laadpalen/kleine-laadpalen-2.jpeg', '/kleine-laadpalen/kleine-laadpalen-3.jpeg'],
      title: 'Kleine laadpalen (3,7 kW - 22 kW)',
      category: 'Residentieel'
    },
    {
      id: '6',
      images: ['/led-verlichting/led-verlichting.jpeg'],
      title: 'LED-verlichting',
      category: 'Onderhoud'
    },
    {
      id: '7',
      images: ['/storing/storing-1.jpeg', '/storing/storing-2.jpeg', '/storing/storing-3.jpeg'],
      title: 'Storing',
      category: 'Onderhoud'
    },
    {
      id: '8',
      images: ['/thuisbatterijen/thuisbatterijen-4.jpeg', '/thuisbatterijen/thuisbatterijen-2.jpeg', '/thuisbatterijen/thuisbatterijen-1.jpeg', '/thuisbatterijen/thuisbatterijen-3.jpeg'],
      title: 'Thuisbatterijen (Tot 40,8 kW)',
      category: 'Residentieel'
    },
    {
      id: '9',
      images: ['/verdeel-inrichting/verdeel-inrichting-3.jpeg', '/verdeel-inrichting/verdeel-inrichting-2.jpeg', '/verdeel-inrichting/verdeel-inrichting-1.jpeg', '/verdeel-inrichting/verdeel-inrichting-4.jpeg'],
      title: 'Verdeel inrichting',
      category: 'Commercieel'
    },
    {
      id: '10',
      images: ['/verlichting-design/verlichting-design-1.jpeg', '/verlichting-design/verlichting-design-2.jpeg', '/verlichting-design/verlichting-design-3.jpeg', '/verlichting-design/verlichting-design-4.jpeg', '/verlichting-design/verlichting-design-5.jpeg'],
      title: 'Verlichting design',
      category: 'Residentieel'
    },
    {
      id: '11',
      images: ['/zonne-energie/zonne-energie-1.jpeg', '/zonne-energie/zonne-energie-2.jpeg', '/zonne-energie/zonne-energie-3.jpeg', '/zonne-energie/zonne-energie-4.jpeg', '/zonne-energie/zonne-energie-5.jpeg', '/zonne-energie/zonne-energie-6.jpeg'],
      title: 'Zonne-energie',
      category: 'Residentieel'
    }
  ]
}

// shortcut: the whole portfolio is one JSON document; fine for one editor and a few hundred projects, split into rows beyond that
export const readPortfolio = async (): Promise<{ portfolio: Portfolio; etag: string | null }> => {
  const { data, error } = await supabase().from(TABLE).select('data, updated_at').eq('id', DOC_ID).maybeSingle()
  if (error) throw error
  if (!data) return { portfolio: defaultPortfolio, etag: null }
  return { portfolio: data.data as Portfolio, etag: data.updated_at as string }
}

const conflict = () => createError({ statusCode: 409, statusMessage: 'Portfolio changed since it was loaded' })

// Saving against the updated_at that was loaded makes a stale save fail instead of overwriting a newer one
export const writePortfolio = async (portfolio: Portfolio, etag: string | null) => {
  const row = { data: portfolio, updated_at: new Date().toISOString() }
  const query = etag
    ? supabase().from(TABLE).update(row).eq('id', DOC_ID).eq('updated_at', etag)
    : supabase().from(TABLE).insert({ id: DOC_ID, ...row })
  const { data, error } = await query.select('updated_at')
  if (error?.code === '23505') throw conflict() // someone else saved the first version
  if (error) throw error
  if (!data?.length) throw conflict()
  return data[0]!.updated_at as string
}

const publicPhotoPrefix = () => `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`
// Only the exact names uploadPhoto creates, so a crafted path can never point removal at other files
const isStoredPhoto = (src: string) =>
  !!process.env.SUPABASE_URL && src.startsWith(publicPhotoPrefix())
  && /^(dev\/)?[0-9a-f-]{36}\.jpg$/.test(src.slice(publicPhotoPrefix().length))

export const uploadPhoto = async (jpeg: Buffer) => {
  const path = `${UPLOAD_PREFIX}${crypto.randomUUID()}.jpg`
  const { error } = await supabase().storage.from(BUCKET).upload(path, jpeg, {
    contentType: 'image/jpeg',
    cacheControl: '31536000',
    upsert: false
  })
  if (error) throw error
  return supabase().storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

// Photos that were removed from every project; local /public files are left alone
export const deleteUnusedPhotos = async (before: Portfolio, after: Portfolio) => {
  const kept = new Set(after.projects.flatMap(p => p.images))
  const removed = before.projects.flatMap(p => p.images)
    .filter(src => isStoredPhoto(src) && !kept.has(src))
    .map(src => src.slice(publicPhotoPrefix().length))
  if (!removed.length) return
  const { error } = await supabase().storage.from(BUCKET).remove(removed)
  if (error) throw error
}

const text = (value: unknown, max: number) => {
  const result = typeof value === 'string' ? value.trim() : ''
  return result && result.length <= max ? result : null
}

const invalid = (statusMessage: string) => createError({ statusCode: 400, statusMessage })

// Trust boundary: everything the admin page sends is checked before it is stored
export const parsePortfolio = (input: unknown): Portfolio => {
  const body = input as Partial<Portfolio> | null
  if (!body || !Array.isArray(body.categories) || !Array.isArray(body.projects)) throw invalid('Invalid portfolio')
  if (body.categories.length < 1 || body.categories.length > 20) throw invalid('Use between 1 and 20 categories')
  if (body.projects.length > 300) throw invalid('Too many projects')

  const categories = body.categories.map(c => text(c, 40))
  if (categories.some(c => !c)) throw invalid('Category names must be 1-40 characters')
  if (new Set(categories.map(c => c!.toLowerCase())).size !== categories.length) throw invalid('Category names must be unique')

  const ids = new Set<string>()
  const projects = body.projects.map((raw): PortfolioProject => {
    const project = raw as Partial<PortfolioProject> | null
    const id = text(project?.id, 64)
    const title = text(project?.title, 120)
    const category = text(project?.category, 40)
    if (!id || !/^[\w-]+$/.test(id) || ids.has(id)) throw invalid('Invalid project id')
    ids.add(id)
    if (!title) throw invalid('Every project needs a title of at most 120 characters')
    if (!category || !categories.includes(category)) throw invalid('Every project needs an existing category')
    const images = Array.isArray(project?.images) ? project.images : []
    if (images.length < 1 || images.length > 30) throw invalid('Every project needs 1-30 photos')
    if (!images.every(src => typeof src === 'string' && (isStoredPhoto(src) || /^\/[\w-]+(\/[\w-]+)*\.(jpe?g|png|webp)$/i.test(src)))) {
      throw invalid('Invalid photo')
    }
    return { id, title, category, images }
  })

  return { categories: categories as string[], projects }
}
