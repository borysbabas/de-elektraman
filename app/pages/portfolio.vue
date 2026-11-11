<script lang="ts" setup>
import type { ComponentPublicInstance } from 'vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { animate } from 'motion'
import { ArrowsPointingOutIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/vue/24/solid'
import type { Portfolio, PortfolioProject } from '#shared/types/portfolio'

useSeoMeta({
  title: 'Portfolio | De Elektraman',
  description: 'Bekijk een selectie van onze afgeronde projecten in elektra, laadpalen, batterijen, verdeelinrichting en zonne-energie.',
  ogTitle: 'Portfolio | De Elektraman',
  ogDescription: 'Bekijk een selectie van onze afgeronde projecten in elektra, laadpalen, batterijen, verdeelinrichting en zonne-energie.',
  twitterCard: 'summary'
})

type Project = PortfolioProject

// Projects are managed by the client in /admin
const { data: portfolio } = await useFetch<Portfolio>('/api/portfolio', {
  default: () => ({ categories: [], projects: [] })
})
const projects = computed(() => portfolio.value.projects)
const categories = computed(() => ['Alles', ...portfolio.value.categories])
const selectedCategory = ref('Alles')
const selectedProject = ref<Project | null>(null)
const selectedProjectIndex = ref<number>(-1)
const selectedImageIndex = ref<number>(0)

const filteredProjects = computed(() => {
  if (selectedCategory.value === 'Alles') {
    return projects.value
  }
  return projects.value.filter(p => p.category === selectedCategory.value)
})

// Tall cards follow the position in the full list, so a card keeps its size when the filter changes
const isTall = (project: Project) => [0, 4].includes(projects.value.indexOf(project) % 7)

// Apple's momentum projection: where a flick would come to rest
const projectMomentum = (velocity: number, decelerationRate = 0.998) =>
  (velocity / 1000) * decelerationRate / (1 - decelerationRate)

const rubberband = (overshoot: number, dimension: number, constant = 0.55) =>
  (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot))

/* Modal photos: preload the exact file the modal will request, so nothing animates in empty */
const $img = useImage()
const modalPhoto = (src: string) => $img.getSizes(src, { sizes: '100vw lg:1280px', modifiers: { format: 'webp' } })
const photoCache = new Map<string, Promise<void>>()

const preloadPhoto = (src: string) => {
  let loaded = photoCache.get(src)
  if (!loaded) {
    const { srcset, sizes, src: fallback } = modalPhoto(src)
    const img = new Image()
    if (sizes) img.sizes = sizes
    img.srcset = srcset
    img.src = fallback ?? src
    loaded = img.decode().catch(() => {})
    photoCache.set(src, loaded)
  }
  return loaded
}

// True once the photo is decoded, false if that takes longer than a tap should wait
const photoReady = (src: string, timeout = 300) => Promise.race([
  preloadPhoto(src).then(() => true),
  new Promise<boolean>(resolve => setTimeout(() => resolve(false), timeout))
])

const warmUp = (item: Project) => void preloadPhoto(item.images[0]!)

/* Filter: one pill slides to the selected category */
const filterRow = ref<HTMLElement | null>(null)
const filterSentinel = ref<HTMLElement | null>(null)
const navbarMerged = useState('navbar-merged', () => false)
let stuckObserver: IntersectionObserver | undefined
const pill = ref<{ x: number; y: number; w: number; h: number } | null>(null)
const pillAnimated = ref(false)
let resizeObserver: ResizeObserver | undefined

const measurePill = () => {
  const button = filterRow.value?.querySelectorAll('button')[categories.value.indexOf(selectedCategory.value)]
  if (button) {
    pill.value = { x: button.offsetLeft, y: button.offsetTop, w: button.offsetWidth, h: button.offsetHeight }
  }
}

const selectCategory = (category: string) => {
  selectedCategory.value = category
  measurePill()
}

/* Modal */
const cardRefs = new Map<string, HTMLElement>()
const setCardRef = (id: string, el: Element | ComponentPublicInstance | null) => {
  if (el) cardRefs.set(id, el as HTMLElement)
  else cardRefs.delete(id)
}

const track = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const backdrop = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
const morphing = ref(false)

// Gesture state lives outside Vue so dragging never re-renders the page
let slidePos = 0
let dismissY = 0
let slideAnimation: ReturnType<typeof animate> | undefined
let dismissAnimation: ReturnType<typeof animate> | undefined

const renderSlide = () => {
  if (track.value) track.value.style.transform = `translate3d(${-slidePos * 100}%, 0, 0)`
}

const renderDismiss = () => {
  if (panel.value) panel.value.style.transform = dismissY ? `translate3d(0, ${dismissY}px, 0)` : ''
  if (backdrop.value) backdrop.value.style.opacity = String(1 - Math.min(Math.max(dismissY, 0) / 400, 1) * 0.6)
}

const slideTo = (index: number, velocity = 0) => {
  selectedImageIndex.value = index
  slideAnimation?.stop()
  if (prefersReducedMotion()) {
    slidePos = index
    renderSlide()
    return
  }
  slideAnimation = animate(slidePos, index, {
    type: 'spring',
    visualDuration: 0.4,
    // Overshoot only when a flick carried momentum into the snap
    bounce: Math.abs(velocity) > 0.5 ? 0.15 : 0,
    velocity,
    onUpdate: (value) => {
      slidePos = value
      renderSlide()
    }
  })
}

const settleDismiss = (velocity = 0) => {
  dismissAnimation?.stop()
  dismissAnimation = animate(dismissY, 0, {
    type: 'spring',
    visualDuration: 0.35,
    bounce: 0,
    velocity,
    onUpdate: (value) => {
      dismissY = value
      renderDismiss()
    }
  })
}

const nextImage = () => {
  if (selectedProject.value && selectedImageIndex.value < selectedProject.value.images.length - 1) {
    slideTo(selectedImageIndex.value + 1)
  }
}

const prevImage = () => {
  if (selectedImageIndex.value > 0) {
    slideTo(selectedImageIndex.value - 1)
  }
}

let switchToken = 0
const showProject = async (index: number) => {
  const next = filteredProjects.value[index]
  if (!next) return
  const token = ++switchToken
  await photoReady(next.images[0]!)
  if (token !== switchToken) return
  slideAnimation?.stop()
  slidePos = 0
  selectedProject.value = next
  selectedProjectIndex.value = index
  selectedImageIndex.value = 0
}

const resetModal = () => {
  slideAnimation?.stop()
  dismissAnimation?.stop()
  selectedProject.value = null
  selectedProjectIndex.value = -1
  selectedImageIndex.value = 0
}

const activePhoto = () => track.value?.children[selectedImageIndex.value] as HTMLElement | undefined
const cardPhoto = (id: string) => cardRefs.get(id)?.querySelector('img') ?? undefined

// Morph a photo between card and modal with the View Transitions API; browsers without it get the CSS fade
const morph = (from: HTMLElement | undefined, update: () => void, to: () => HTMLElement | undefined) => {
  if (!from || !('startViewTransition' in document) || prefersReducedMotion()) {
    update()
    return Promise.resolve()
  }
  morphing.value = true
  from.style.setProperty('view-transition-name', 'project-photo')
  let target: HTMLElement | undefined
  const transition = document.startViewTransition(async () => {
    from.style.removeProperty('view-transition-name')
    update()
    await nextTick()
    target = to()
    target?.style.setProperty('view-transition-name', 'project-photo')
  })
  return transition.finished.finally(() => {
    target?.style.removeProperty('view-transition-name')
    morphing.value = false
  })
}

let opening = false
const openModal = async (selected: Project) => {
  if (opening) return
  opening = true
  // Morph only into a photo that is ready; otherwise fall back to the fade
  const ready = await photoReady(selected.images[0]!)
  opening = false
  void morph(ready ? cardPhoto(selected.id) : undefined, () => {
    slidePos = 0
    dismissY = 0
    selectedProject.value = selected
    selectedProjectIndex.value = filteredProjects.value.findIndex(p => p.id === selected.id)
    selectedImageIndex.value = 0
  }, activePhoto)
}

const closeModal = () => {
  const current = selectedProject.value
  if (!current) return
  const card = cardRefs.get(current.id)
  const photo = cardPhoto(current.id)
  const rect = photo?.getBoundingClientRect()
  const cardVisible = rect && rect.bottom > 0 && rect.top < window.innerHeight
  // The card shows the first photo; morphing any other photo into it would cross-fade two pictures
  const morphFrom = selectedImageIndex.value === 0 ? activePhoto() : undefined
  void morph(morphFrom, resetModal, () => (cardVisible ? photo : undefined))
    .then(async () => {
      await nextTick() // the page stops being inert on the next render
      card?.focus({ preventScroll: true })
    })
}

/* Swipe between photos, drag down to dismiss */
let drag: {
  id: number
  x: number
  y: number
  startPos: number
  startY: number
  axis: 'x' | 'y' | null
  samples: { t: number; x: number; y: number }[]
} | null = null

const onPointerDown = (e: PointerEvent) => {
  if (e.button !== 0 || (e.target as Element).closest('button')) return
  // Grab mid-flight: slidePos and dismissY already hold the on-screen values
  slideAnimation?.stop()
  dismissAnimation?.stop()
  drag = {
    id: e.pointerId,
    x: e.clientX,
    y: e.clientY,
    startPos: slidePos,
    startY: dismissY,
    axis: null,
    samples: [{ t: e.timeStamp, x: e.clientX, y: e.clientY }]
  }
  const area = e.currentTarget as HTMLElement
  area.setPointerCapture(e.pointerId)
}

const onPointerMove = (e: PointerEvent) => {
  if (!drag || e.pointerId !== drag.id || !selectedProject.value) return
  const dx = e.clientX - drag.x
  const dy = e.clientY - drag.y
  if (!drag.axis) {
    if (Math.hypot(dx, dy) < 10) return
    drag.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
  }
  drag.samples.push({ t: e.timeStamp, x: e.clientX, y: e.clientY })
  drag.samples = drag.samples.filter(s => e.timeStamp - s.t < 100)

  if (drag.axis === 'x') {
    const width = track.value?.clientWidth || 1
    const last = selectedProject.value.images.length - 1
    let pos = drag.startPos - dx / width
    if (pos < 0) pos = -rubberband(-pos * width, width) / width
    else if (pos > last) pos = last + rubberband((pos - last) * width, width) / width
    slidePos = pos
    renderSlide()
  } else {
    const y = drag.startY + dy
    dismissY = y < 0 ? -rubberband(-y, window.innerHeight) : y
    renderDismiss()
  }
}

const onPointerUp = (e: PointerEvent) => {
  if (!drag || e.pointerId !== drag.id || !selectedProject.value) return
  const { axis, startPos } = drag
  const samples = [...drag.samples, { t: e.timeStamp, x: e.clientX, y: e.clientY }].filter(s => e.timeStamp - s.t < 100)
  drag = null

  const first = samples[0]!
  const last = samples[samples.length - 1]!
  const dt = (last.t - first.t) / 1000
  const vx = dt > 0 ? (last.x - first.x) / dt : 0
  const vy = dt > 0 ? (last.y - first.y) / dt : 0

  if (axis === 'y') {
    if (dismissY + projectMomentum(vy) > window.innerHeight * 0.25) closeModal()
    else settleDismiss(vy)
    return
  }

  if (axis === 'x') {
    const width = track.value?.clientWidth || 1
    const lastIndex = selectedProject.value.images.length - 1
    const startIndex = Math.round(startPos)
    const projected = Math.round(slidePos - projectMomentum(vx) / width)
    const target = Math.min(Math.max(projected, startIndex - 1, 0), startIndex + 1, lastIndex)
    slideTo(target, -vx / width)
    return
  }

  // A tap: let anything that was interrupted finish where it was heading
  slideTo(selectedImageIndex.value)
  if (dismissY) settleDismiss()
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeModal()
  else if (e.key === 'ArrowRight') nextImage()
  else if (e.key === 'ArrowLeft') prevImage()
}

// While open: lock page scroll, make the page behind inert, move focus into the dialog
const setPageLocked = (locked: boolean) => {
  document.documentElement.style.overflow = locked ? 'hidden' : ''
  document.getElementById('__nuxt')?.toggleAttribute('inert', locked)
  if (locked) window.addEventListener('keydown', onKeydown)
  else window.removeEventListener('keydown', onKeydown)
}

// Load every photo of the open project for swiping, and the neighbours' first photo for project switching
watch(selectedProjectIndex, (index) => {
  if (index < 0) return
  filteredProjects.value[index]?.images.forEach(src => void preloadPhoto(src))
  for (const neighbour of [filteredProjects.value[index - 1], filteredProjects.value[index + 1]]) {
    if (neighbour) warmUp(neighbour)
  }
})

watch(() => selectedProject.value !== null, (open) => {
  setPageLocked(open)
  if (open) void nextTick(() => closeButton.value?.focus({ preventScroll: true }))
})

onMounted(() => {
  // The bar is pinned once the line above it passes under the 89px navbar
  stuckObserver = new IntersectionObserver(([entry]) => {
    navbarMerged.value = !!entry && !entry.isIntersecting && entry.boundingClientRect.top < 89
  }, { rootMargin: '-89px 0px 0px 0px' })
  if (filterSentinel.value) stuckObserver.observe(filterSentinel.value)

  measurePill()
  requestAnimationFrame(() => {
    pillAnimated.value = true
  })
  // Watch the buttons too: a late web font changes their width without resizing the row
  resizeObserver = new ResizeObserver(measurePill)
  if (filterRow.value) {
    resizeObserver.observe(filterRow.value)
    filterRow.value.querySelectorAll('button').forEach(button => resizeObserver?.observe(button))
  }
})

onBeforeUnmount(() => {
  stuckObserver?.disconnect()
  navbarMerged.value = false
  resizeObserver?.disconnect()
  slideAnimation?.stop()
  dismissAnimation?.stop()
  setPageLocked(false)
})
</script>

<template>
  <div>
    <!-- Hero Section -->
    <PageHero
      :compact="true"
      description="Een selectie van onze afgeronde projecten, van woningen tot bedrijfspanden."
      title="Ons portfolio"
    />

    <!-- Category Filter: while pinned, its material reaches up behind the navbar so both read as one bar -->
    <div ref="filterSentinel" aria-hidden="true" class="h-px" />
    <section
      :class="[
        'py-6 md:py-8 px-4 md:px-6 border-b border-border sticky top-[89px] z-40',
        navbarMerged ? `before:content-[''] before:absolute before:inset-x-0 before:-top-[89px] before:bottom-0 before:-z-10 before:material` : 'bg-white'
      ]">
      <div class="container mx-auto">
        <div ref="filterRow" class="relative flex flex-wrap gap-2 md:gap-3 justify-center">
          <span
            v-if="pill"
            :class="['absolute left-0 top-0 rounded-full bg-primary shadow-lg', pillAnimated && 'transition-[translate,width,height] duration-300 ease-fluid']"
            :style="{ translate: `${pill.x}px ${pill.y}px`, width: `${pill.w}px`, height: `${pill.h}px` }"
            aria-hidden="true"
          />
          <button
            v-for="category in categories"
            :key="category"
            :aria-pressed="selectedCategory === category"
            :class="[
                'press relative px-4 md:px-6 py-2 rounded-full font-semibold text-sm md:text-base border-2 cursor-pointer',
                selectedCategory === category
                  ? ['border-transparent text-white', !pill && 'bg-primary']
                  : 'border-border text-secondary hover:border-primary'
              ]"
            type="button"
            @click="selectCategory(category)"
          >
            {{ category }}
          </button>
        </div>
      </div>
    </section>

    <!-- Portfolio Grid -->
    <section class="py-12 md:py-20 px-4 md:px-6">
      <div class="container mx-auto">
        <TransitionGroup
          class="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-flow-dense auto-rows-[12rem] gap-4 md:gap-6"
          name="project-card"
          tag="div"
          @before-leave="pinLeaving"
        >
          <button
            v-for="item in filteredProjects"
            :key="item.id"
            :ref="el => setCardRef(item.id, el)"
            :class="[
                'group relative block w-full overflow-hidden rounded-xl text-left cursor-pointer shadow-sm hover:shadow-2xl transition-[box-shadow,scale] duration-200 ease-out active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                isTall(item) ? 'row-span-3' : 'row-span-2'
              ]"
            type="button"
            @click="openModal(item)"
            @focus="warmUp(item)"
            @pointerdown="warmUp(item)"
            @pointerenter="warmUp(item)"
          >
            <!-- Image -->
            <NuxtImg
              :alt="item.title"
              :src="item.images[0]"
              class="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              format="webp"
              loading="lazy"
              sizes="100vw sm:50vw lg:33vw xl:420px"
            />

            <!-- Scrim: always on so the title reads on any photo; hover deepens it -->
            <div
              class="absolute inset-0 bg-linear-to-t from-secondary/90 via-secondary/25 via-40% to-transparent to-65% opacity-90 group-hover:opacity-100 transition-opacity duration-300"
            />

            <!-- Content -->
            <div
              class="absolute inset-0 flex flex-col justify-end p-6 translate-y-2 group-hover:translate-y-0 group-focus-visible:translate-y-0 transition-transform duration-300 ease-fluid"
            >
              <span class="text-primary-light text-sm font-semibold mb-2">{{ item.category }}</span>
              <h3 class="text-white text-xl md:text-2xl font-bold">{{ item.title }}</h3>
              <span
                class="mt-3 flex items-center text-white opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300">
                <span class="text-sm font-semibold">Bekijk details</span>
                <ArrowsPointingOutIcon class="w-4 h-4 ml-2" />
              </span>
            </div>
          </button>
        </TransitionGroup>

        <!-- No Results -->
        <div v-if="filteredProjects.length === 0" class="text-center py-20">
          <p class="text-xl text-gray-600">Geen projecten gevonden in deze categorie.</p>
        </div>
      </div>
    </section>

    <!-- Modal -->
    <Teleport to="body">
      <Transition
        :css="!morphing"
        enter-active-class="transition-opacity duration-200 ease-out motion-reduce:transition-none"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-150 ease-in motion-reduce:transition-none"
        leave-to-class="opacity-0"
      >
        <div
          v-if="selectedProject"
          aria-labelledby="project-title"
          aria-modal="true"
          class="fixed inset-0 z-[60] flex items-center justify-center p-2 md:p-4"
          role="dialog"
        >
          <div ref="backdrop" class="absolute inset-0 bg-secondary/80 backdrop-blur" @click="closeModal" />

          <Transition
            :css="!morphing"
            appear
            enter-active-class="transition-[opacity,translate,scale] duration-300 ease-fluid motion-reduce:transition-none"
            enter-from-class="opacity-0 translate-y-2 scale-95"
          >
            <div
              ref="panel"
              class="relative w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl max-h-[94vh] lg:max-h-[92vh] overflow-auto rounded-xl md:rounded-2xl bg-white shadow-2xl"
            >
              <!-- Close Button -->
              <button
                ref="closeButton"
                aria-label="Sluiten"
                class="press absolute top-4 right-4 md:top-6 md:right-6 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 shadow-lg"
                type="button"
                @click="closeModal"
              >
                <XMarkIcon class="w-6 h-6 text-secondary" />
              </button>

              <!-- Photos: swipe, or drag down to close -->
              <div
                class="relative w-full h-64 sm:h-80 md:h-96 lg:h-[56vh] xl:h-[60vh] 2xl:h-[64vh] overflow-hidden bg-secondary touch-none select-none"
                @pointercancel="onPointerUp"
                @pointerdown="onPointerDown"
                @pointermove="onPointerMove"
                @pointerup="onPointerUp"
              >
                <!-- Keyed so a new project starts at its first photo -->
                <div :key="selectedProject.id" ref="track" class="flex h-full">
                  <img
                    v-for="(image, i) in selectedProject.images"
                    :key="image"
                    :alt="`${selectedProject.title}, foto ${i + 1}`"
                    class="h-full w-full shrink-0 object-cover"
                    draggable="false"
                    v-bind="modalPhoto(image)"
                  >
                </div>

                <!-- Image Navigation Buttons -->
                <button
                  v-if="selectedProject.images.length > 1 && selectedImageIndex > 0"
                  aria-label="Vorige foto"
                  class="press absolute left-2 md:left-6 bottom-2 md:bottom-6 h-10 md:h-12 w-10 md:w-auto md:px-4 bg-primary/90 hover:bg-primary rounded-full flex items-center justify-center gap-2 shadow-lg text-white text-sm font-semibold"
                  type="button"
                  @click="prevImage"
                >
                  <ChevronLeftIcon class="w-5 h-5 md:w-6 md:h-6" />
                  <span class="hidden md:inline">Vorige foto</span>
                </button>
                <button
                  v-if="selectedProject.images.length > 1 && selectedImageIndex < selectedProject.images.length - 1"
                  aria-label="Volgende foto"
                  class="press absolute right-2 md:right-6 bottom-2 md:bottom-6 h-10 md:h-12 w-10 md:w-auto md:px-4 bg-primary/90 hover:bg-primary rounded-full flex items-center justify-center gap-2 shadow-lg text-white text-sm font-semibold"
                  type="button"
                  @click="nextImage"
                >
                  <span class="hidden md:inline">Volgende foto</span>
                  <ChevronRightIcon class="w-5 h-5 md:w-6 md:h-6" />
                </button>

                <!-- Image Counter -->
                <div
                  v-if="selectedProject.images.length > 1"
                  aria-live="polite"
                  class="absolute bottom-2 md:bottom-6 left-1/2 -translate-x-1/2 bg-secondary/90 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm tabular-nums"
                >
                  {{ selectedImageIndex + 1 }} / {{ selectedProject.images.length }}
                </div>

                <!-- Project Navigation Buttons -->
                <button
                  v-if="selectedProjectIndex > 0"
                  aria-label="Vorig project"
                  class="press hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full items-center justify-center shadow-lg"
                  type="button"
                  @click="showProject(selectedProjectIndex - 1)"
                >
                  <ChevronLeftIcon class="w-6 h-6 text-secondary" />
                </button>
                <button
                  v-if="selectedProjectIndex < filteredProjects.length - 1"
                  aria-label="Volgend project"
                  class="press hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full items-center justify-center shadow-lg"
                  type="button"
                  @click="showProject(selectedProjectIndex + 1)"
                >
                  <ChevronRightIcon class="w-6 h-6 text-secondary" />
                </button>
              </div>

              <!-- Content -->
              <div class="p-6 md:p-8 lg:p-12">
                <div class="flex items-center gap-3 mb-4">
                  <span
                    class="px-3 md:px-4 py-1 bg-primary-light text-primary-dark text-xs md:text-sm font-semibold rounded-full">
                    {{ selectedProject.category }}
                  </span>
                  <span class="text-xs md:text-sm text-gray-500 tabular-nums">
                    {{ selectedProjectIndex + 1 }} / {{ filteredProjects.length }}
                  </span>
                </div>

                <h2 id="project-title" class="text-2xl sm:text-3xl md:text-4xl font-bold text-secondary mb-3 md:mb-4">
                  {{ selectedProject.title }}
                </h2>

                <!-- CTA -->
                <div class="border-t border-border pt-6 md:pt-8 flex justify-center">
                  <NuxtLink
                    :to="{ path: '/contact', hash: '#contact-form', query: { category: selectedProject.category } }"
                    class="press inline-block w-full sm:w-auto text-center px-6 md:px-8 py-3 md:py-4 bg-primary text-white text-sm md:text-base font-semibold rounded-lg hover:bg-primary-dark shadow-lg"
                    @click="resetModal"
                  >
                    Soortgelijk project aanvragen
                  </NuxtLink>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style>
/* Before the enter/leave rules: an item can still carry the move class when it starts leaving, and the leave must win */
.project-card-move {
  transition: transform 400ms var(--ease-fluid);
}

.project-card-enter-active {
  transition: opacity 300ms ease-out, scale 300ms var(--ease-fluid);
}

.project-card-leave-active {
  transition: opacity 150ms ease-in, scale 150ms ease-in;
}

.project-card-enter-from,
.project-card-leave-to {
  opacity: 0;
  scale: 0.95;
}

@media (prefers-reduced-motion: reduce) {
  .project-card-enter-active,
  .project-card-leave-active,
  .project-card-move {
    transition: none;
  }
}
</style>
