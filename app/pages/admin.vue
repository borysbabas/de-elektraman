<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/vue/24/solid'
import type { Portfolio, PortfolioProject } from '#shared/types/portfolio'

definePageMeta({ layout: false })

useSeoMeta({
  title: 'Portfolio beheren | De Elektraman',
  robots: 'noindex, nofollow'
})

const statusCode = (error: unknown) => (error as { statusCode?: number } | null)?.statusCode

const { data: session, error: sessionError, refresh: refreshSession } = await useFetch('/api/admin/session')
const notConfigured = computed(() => statusCode(sessionError.value) === 503)

/* Sign in */
const password = ref('')
const signingIn = ref(false)
const loginError = ref('')

const signIn = async () => {
  signingIn.value = true
  loginError.value = ''
  try {
    await $fetch('/api/admin/login', { method: 'POST', body: { password: password.value } })
    password.value = ''
    await refreshSession()
    // After a session expired mid-edit, keep the unsaved draft instead of reloading over it
    if (!draft.value) await load()
  } catch (error) {
    loginError.value = statusCode(error) === 401 ? 'Onjuist wachtwoord.' : 'Inloggen is mislukt. Probeer het opnieuw.'
  } finally {
    signingIn.value = false
  }
}

const signOut = async () => {
  if (dirty.value && !confirm('Je niet-opgeslagen wijzigingen gaan verloren. Toch uitloggen?')) return
  await $fetch('/api/admin/logout', { method: 'POST' })
  draft.value = null
  await refreshSession()
}

/* Editing: everything happens on a local draft that is saved in one go */
const draft = ref<Portfolio | null>(null)
const etag = ref<string | null>(null)
const savedJson = ref('')
const saving = ref(false)
const message = ref<{ kind: 'saved' | 'error'; text: string } | null>(null)
const uploads = reactive<Record<string, number>>({})

const dirty = computed(() => !!draft.value && JSON.stringify(draft.value) !== savedJson.value)
const uploading = computed(() => Object.values(uploads).some(count => count > 0))

const load = async () => {
  const result = await $fetch<{ portfolio: Portfolio; etag: string | null }>('/api/admin/portfolio')
  draft.value = result.portfolio
  etag.value = result.etag
  savedJson.value = JSON.stringify(result.portfolio)
  message.value = null
}

const discard = () => {
  draft.value = JSON.parse(savedJson.value)
  message.value = null
}

const problems = computed(() => (draft.value?.projects ?? []).flatMap((project, index) => {
  const name = project.title.trim() || `Project ${index + 1}`
  return [
    ...(project.title.trim() ? [] : [`${name} heeft nog geen titel.`]),
    ...(project.images.length ? [] : [`${name} heeft nog geen foto's.`])
  ]
}))

const save = async () => {
  if (!draft.value || problems.value.length) return
  saving.value = true
  message.value = null
  try {
    const result = await $fetch<{ etag: string }>('/api/admin/portfolio', {
      method: 'PUT',
      body: { portfolio: draft.value, etag: etag.value }
    })
    etag.value = result.etag
    savedJson.value = JSON.stringify(draft.value)
    message.value = { kind: 'saved', text: 'Opgeslagen. De portfoliopagina is bijgewerkt.' }
  } catch (error) {
    const code = statusCode(error)
    if (code === 401) await refreshSession()
    message.value = {
      kind: 'error',
      text: code === 409
        ? 'Er is intussen op een ander apparaat opgeslagen. Herlaad de pagina; wijzigingen die hier nog niet zijn opgeslagen gaan dan verloren.'
        : code === 401 ? 'Je bent uitgelogd. Log opnieuw in en sla daarna op.' : 'Opslaan is mislukt. Probeer het opnieuw.'
    }
  } finally {
    saving.value = false
  }
}

const statusText = computed(() => {
  if (saving.value) return 'Opslaan…'
  if (uploading.value) return 'Foto\'s worden geüpload…'
  if (message.value?.kind === 'error') return message.value.text
  if (dirty.value && problems.value.length) {
    return problems.value.length > 1 ? `${problems.value[0]} (en nog ${problems.value.length - 1})` : problems.value[0]
  }
  if (dirty.value) return 'Je hebt wijzigingen die nog niet zijn opgeslagen.'
  return message.value?.text ?? 'Alles is opgeslagen.'
})

function moveItem<T>(list: T[], index: number, delta: number) {
  const [item] = list.splice(index, 1)
  list.splice(index + delta, 0, item as T)
}

/* Categories */
const newCategory = ref('')
const usage = (name: string) => draft.value?.projects.filter(p => p.category === name).length ?? 0
const exists = (name: string) => !!draft.value?.categories.some(c => c.toLowerCase() === name.toLowerCase())

const addCategory = () => {
  const name = newCategory.value.trim()
  if (!draft.value || !name || exists(name)) return
  draft.value.categories.push(name)
  newCategory.value = ''
}

const renameCategory = (index: number, event: Event) => {
  const input = event.target as HTMLInputElement
  const previous = draft.value?.categories[index]
  const name = input.value.trim()
  if (!draft.value || previous === undefined) return
  if (!name || (name.toLowerCase() !== previous.toLowerCase() && exists(name))) {
    input.value = previous
    return
  }
  draft.value.categories[index] = name
  draft.value.projects.forEach((project) => {
    if (project.category === previous) project.category = name
  })
}

/* Projects */
const addProject = () => {
  draft.value?.projects.unshift({
    id: crypto.randomUUID(),
    title: '',
    category: draft.value.categories[0] ?? '',
    images: []
  })
}

/* Photos: phone photos are often 10-20 MB, so they are shrunk in the browser before uploading */
const MAX_EDGE = 2400
const MAX_BYTES = 3.5 * 1024 * 1024

// Re-encoding to JPEG also strips EXIF data such as the GPS location of the customer's home
const shrinkPhoto = async (file: File): Promise<Blob> => {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    for (const edge of [MAX_EDGE, 1800, 1200]) {
      const scale = Math.min(1, edge / Math.max(img.naturalWidth, img.naturalHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.naturalWidth * scale)
      canvas.height = Math.round(img.naturalHeight * scale)
      const context = canvas.getContext('2d')!
      context.fillStyle = '#fff' // JPEG has no transparency; avoid black backgrounds on PNGs
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(img, 0, 0, canvas.width, canvas.height)
      for (const quality of [0.85, 0.75, 0.65]) {
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality))
        if (blob && blob.size <= MAX_BYTES) return blob
      }
    }
    throw new Error('Photo stays too large')
  } finally {
    URL.revokeObjectURL(url)
  }
}

const addPhotos = async (project: PortfolioProject, event: Event) => {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''
  message.value = null
  // One at a time keeps memory low on phones
  for (const file of files) {
    uploads[project.id] = (uploads[project.id] ?? 0) + 1
    try {
      const jpeg = await shrinkPhoto(file).catch(() => {
        throw new Error(`${file.name} kan niet worden gelezen. Gebruik een JPG- of PNG-foto (HEIC werkt alleen in Safari).`)
      })
      const { url } = await $fetch<{ url: string }>('/api/admin/photos', {
        method: 'POST',
        body: jpeg,
        headers: { 'content-type': 'image/jpeg' }
      })
      project.images.push(url)
    } catch (error) {
      const code = statusCode(error)
      if (code === 401) await refreshSession()
      message.value = {
        kind: 'error',
        text: error instanceof Error && !code ? error.message : code === 401 ? 'Je bent uitgelogd. Log opnieuw in.' : `${file.name} kon niet worden geüpload. Probeer het opnieuw.`
      }
    } finally {
      uploads[project.id] = (uploads[project.id] ?? 1) - 1
    }
  }
}

/* Don't lose work by leaving */
const warnBeforeUnload = (event: BeforeUnloadEvent) => {
  if (dirty.value || uploading.value) event.preventDefault()
}

onBeforeRouteLeave(() => !dirty.value || confirm('Je niet-opgeslagen wijzigingen gaan verloren. Toch verlaten?'))

onMounted(async () => {
  window.addEventListener('beforeunload', warnBeforeUnload)
  if (session.value?.signedIn) await load()
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', warnBeforeUnload)
})

const inputClass = 'w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-[border-color,box-shadow] text-base bg-white'
const iconButtonClass = 'press p-2 rounded-lg text-gray-500 hover:text-secondary hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="border-b border-border bg-white">
      <div class="container mx-auto max-w-5xl px-4 md:px-6 py-4 flex items-center justify-between gap-4">
        <NuxtLink class="font-display font-bold text-secondary hover:text-primary transition-colors" to="/portfolio">
          De Elektraman
        </NuxtLink>
        <button
          v-if="session?.signedIn"
          class="press text-sm font-semibold text-gray-600 hover:text-secondary"
          type="button"
          @click="signOut"
        >
          Uitloggen
        </button>
      </div>
    </header>

    <main class="container mx-auto max-w-5xl px-4 md:px-6 pt-10 md:pt-14 pb-36">
      <h1 class="text-3xl md:text-4xl font-bold text-secondary mb-3">Portfolio beheren</h1>

      <p v-if="notConfigured" class="text-gray-700">
        Het beheer is nog niet ingesteld. Neem contact op met de bouwer van de website.
      </p>

      <!-- Sign in -->
      <form v-else-if="!session?.signedIn" class="max-w-sm mt-8 space-y-4" @submit.prevent="signIn">
        <div>
          <label class="block text-sm font-bold text-gray-800 mb-2" for="password">Wachtwoord</label>
          <input id="password" v-model="password" :class="inputClass" autocomplete="current-password" required type="password">
        </div>
        <button
          :disabled="signingIn"
          class="press w-full px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark disabled:opacity-60"
          type="submit"
        >
          {{ signingIn ? 'Inloggen…' : 'Inloggen' }}
        </button>
        <p v-if="loginError" class="text-sm font-semibold text-red" role="alert">{{ loginError }}</p>
      </form>

      <p v-else-if="!draft" class="text-gray-600">Portfolio laden…</p>

      <template v-else>
        <p class="text-gray-600 mb-12">Wijzigingen zijn pas zichtbaar op de site nadat je ze opslaat.</p>

        <!-- Categories -->
        <section class="mb-14">
          <h2 class="text-xl md:text-2xl font-bold text-secondary mb-1">Categorieën</h2>
          <p class="text-sm text-gray-600 mb-4">
            Dit zijn de filters op de portfoliopagina. Een categorie die nog bij een project hoort, kun je niet verwijderen.
          </p>
          <ul class="space-y-2 max-w-xl">
            <li v-for="(category, index) in draft.categories" :key="index" class="flex items-center gap-2">
              <input
                :aria-label="`Naam van categorie ${index + 1}`"
                :class="inputClass"
                :value="category"
                maxlength="40"
                @change="renameCategory(index, $event)"
              >
              <span class="shrink-0 w-24 text-sm text-gray-500 tabular-nums">
                {{ usage(category) }} {{ usage(category) === 1 ? 'project' : 'projecten' }}
              </span>
              <button
                :aria-label="`Categorie ${category} verwijderen`"
                :class="iconButtonClass"
                :disabled="usage(category) > 0 || draft.categories.length === 1"
                type="button"
                @click="draft.categories.splice(index, 1)"
              >
                <TrashIcon class="w-5 h-5" />
              </button>
            </li>
          </ul>
          <form class="flex gap-2 mt-3 max-w-xl" @submit.prevent="addCategory">
            <input v-model="newCategory" :class="inputClass" aria-label="Nieuwe categorie" maxlength="40" placeholder="Nieuwe categorie">
            <button
              class="press shrink-0 px-4 py-2 rounded-lg border-2 border-primary text-primary font-semibold hover:bg-primary-light"
              type="submit"
            >
              Toevoegen
            </button>
          </form>
        </section>

        <!-- Projects -->
        <section>
          <div class="flex flex-wrap items-center justify-between gap-4 mb-2">
            <h2 class="text-xl md:text-2xl font-bold text-secondary">Projecten</h2>
            <button
              class="press inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark"
              type="button"
              @click="addProject"
            >
              <PlusIcon class="w-5 h-5" />
              Nieuw project
            </button>
          </div>
          <p class="text-sm text-gray-600 mb-6">
            De eerste foto is de omslagfoto. Foto's worden voor het uploaden automatisch verkleind.
          </p>

          <p v-if="!draft.projects.length" class="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center text-gray-600">
            Nog geen projecten. Voeg je eerste project toe met de knop hierboven.
          </p>

          <TransitionGroup class="space-y-6" move-class="transition-transform duration-300 ease-fluid" tag="ul">
            <li
              v-for="(project, index) in draft.projects"
              :key="project.id"
              class="rounded-xl border border-border bg-white p-4 md:p-6"
            >
              <div class="flex flex-col md:flex-row gap-3 md:items-end mb-4">
                <div class="flex-1">
                  <label :for="`title-${project.id}`" class="block text-sm font-bold text-gray-800 mb-1">Titel</label>
                  <input
                    :id="`title-${project.id}`"
                    v-model="project.title"
                    :class="inputClass"
                    maxlength="120"
                    placeholder="Bijv. Thuisbatterij geplaatst"
                  >
                </div>
                <div class="md:w-56">
                  <label :for="`category-${project.id}`" class="block text-sm font-bold text-gray-800 mb-1">Categorie</label>
                  <select :id="`category-${project.id}`" v-model="project.category" :class="inputClass">
                    <option v-for="category in draft.categories" :key="category" :value="category">{{ category }}</option>
                  </select>
                </div>
                <div class="flex gap-1">
                  <button
                    :class="iconButtonClass"
                    :disabled="index === 0"
                    aria-label="Project omhoog"
                    type="button"
                    @click="moveItem(draft.projects, index, -1)"
                  >
                    <ArrowUpIcon class="w-5 h-5" />
                  </button>
                  <button
                    :class="iconButtonClass"
                    :disabled="index === draft.projects.length - 1"
                    aria-label="Project omlaag"
                    type="button"
                    @click="moveItem(draft.projects, index, 1)"
                  >
                    <ArrowDownIcon class="w-5 h-5" />
                  </button>
                  <button
                    :class="[iconButtonClass, 'hover:text-red']"
                    aria-label="Project verwijderen"
                    type="button"
                    @click="draft.projects.splice(index, 1)"
                  >
                    <TrashIcon class="w-5 h-5" />
                  </button>
                </div>
              </div>

              <TransitionGroup
                class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2"
                move-class="transition-transform duration-300 ease-fluid"
                tag="ul"
              >
                <li
                  v-for="(src, photoIndex) in project.images"
                  :key="src"
                  class="relative aspect-square overflow-hidden rounded-lg bg-gray-100"
                >
                  <NuxtImg
                    :src="src"
                    alt=""
                    class="h-full w-full object-cover"
                    fit="cover"
                    format="webp"
                    height="240"
                    loading="lazy"
                    width="240"
                  />
                  <span
                    v-if="photoIndex === 0"
                    class="absolute left-1 top-1 rounded bg-secondary/85 px-1.5 py-0.5 text-xs font-semibold text-white"
                  >
                    Omslag
                  </span>
                  <div class="absolute inset-x-0 bottom-0 flex justify-between bg-linear-to-t from-secondary/85 to-transparent p-1 text-white">
                    <button
                      :disabled="photoIndex === 0"
                      aria-label="Foto naar voren"
                      class="press p-2 rounded-md hover:bg-white/20 disabled:opacity-0"
                      type="button"
                      @click="moveItem(project.images, photoIndex, -1)"
                    >
                      <ArrowLeftIcon class="w-5 h-5" />
                    </button>
                    <button
                      aria-label="Foto verwijderen"
                      class="press p-2 rounded-md hover:bg-white/20"
                      type="button"
                      @click="project.images.splice(photoIndex, 1)"
                    >
                      <XMarkIcon class="w-5 h-5" />
                    </button>
                    <button
                      :disabled="photoIndex === project.images.length - 1"
                      aria-label="Foto naar achteren"
                      class="press p-2 rounded-md hover:bg-white/20 disabled:opacity-0"
                      type="button"
                      @click="moveItem(project.images, photoIndex, 1)"
                    >
                      <ArrowRightIcon class="w-5 h-5" />
                    </button>
                  </div>
                </li>
                <li key="add">
                  <label
                    class="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 p-2 text-center text-sm font-semibold text-gray-600 transition-colors hover:border-primary hover:text-primary focus-within:border-primary focus-within:text-primary"
                  >
                    <PhotoIcon class="w-6 h-6" />
                    <span>{{ uploads[project.id] ? `Uploaden… (${uploads[project.id]})` : 'Foto\'s toevoegen' }}</span>
                    <input accept="image/*" class="sr-only" multiple type="file" @change="addPhotos(project, $event)">
                  </label>
                </li>
              </TransitionGroup>
            </li>
          </TransitionGroup>
        </section>
      </template>
    </main>

    <!-- Save bar -->
    <div v-if="draft && session?.signedIn" class="material fixed inset-x-0 bottom-0 z-40 border-t border-border">
      <div class="container mx-auto max-w-5xl px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <p
          :class="['text-sm', message?.kind === 'error' ? 'font-semibold text-red' : 'text-gray-700']"
          aria-live="polite"
          role="status"
        >
          {{ statusText }}
        </p>
        <div class="flex gap-2">
          <button
            v-if="dirty"
            :disabled="saving"
            class="press px-4 py-2.5 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60"
            type="button"
            @click="discard"
          >
            Ongedaan maken
          </button>
          <button
            :disabled="!dirty || saving || uploading || problems.length > 0"
            class="press px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark disabled:opacity-50"
            type="button"
            @click="save"
          >
            Wijzigingen opslaan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
