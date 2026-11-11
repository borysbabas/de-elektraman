<script lang="ts" setup>
import { BoltIcon, CheckBadgeIcon, ClockIcon, EnvelopeIcon, MapPinIcon, PhoneIcon } from '@heroicons/vue/24/solid'
import { nextTick, onMounted, ref, watch } from 'vue'

const companyInfo = useCompanyInfo()
const route = useRoute()

useSeoMeta({
  title: 'Contact | De Elektraman',
  description: 'Neem contact op met De Elektraman voor advies, storingsdienst of een vrijblijvende offerte voor uw elektrische project.',
  ogTitle: 'Contact | De Elektraman',
  ogDescription: 'Neem contact op met De Elektraman voor advies, storingsdienst of een vrijblijvende offerte voor uw elektrische project.',
  twitterCard: 'summary'
})

const nameInput = ref<HTMLInputElement | null>(null)
const isSubmitting = ref(false)
const submitError = ref('')
const submitSuccess = ref('')

const formData = ref({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  serviceType: 'Algemene Vraag'
})

const serviceTypes = [
  'Algemene Vraag',
  'Residentiële Installatie',
  'Commercieel Project',
  'Onderhoud & Inspectie',
  'Storingsdienst',
  'Offerte Aanvraag'
]

const phonePattern = /^[0-9+() -]{8,20}$/

const mapCategoryToServiceType = (categoryValue: string | null | Array<string | null> | undefined) => {
  const rawValue = Array.isArray(categoryValue) ? categoryValue[0] : categoryValue
  if (!rawValue) return null

  const normalized = rawValue.trim().toLowerCase()
  const categoryMap: Record<string, string> = {
    residentieel: 'Residentiële Installatie',
    commercieel: 'Commercieel Project',
    onderhoud: 'Onderhoud & Inspectie'
  }

  return categoryMap[normalized] ?? null
}

const applyRouteFormState = async () => {
  const mappedServiceType = mapCategoryToServiceType(route.query.category)
  if (mappedServiceType) {
    formData.value.serviceType = mappedServiceType
  }

  if (route.hash === '#contact-form' || mappedServiceType) {
    await nextTick()
    nameInput.value?.focus()
  }
}

onMounted(() => {
  void applyRouteFormState()
})

watch(() => [route.hash, route.query.category], () => {
  void applyRouteFormState()
})

const handleSubmit = async () => {
  submitError.value = ''
  submitSuccess.value = ''

  const payload = {
    name: formData.value.name.trim(),
    email: formData.value.email.trim(),
    phone: formData.value.phone.trim(),
    subject: formData.value.subject.trim(),
    message: formData.value.message.trim(),
    serviceType: formData.value.serviceType
  }

  if (!payload.name || !payload.email || !payload.phone || !payload.subject || !payload.message || !payload.serviceType) {
    submitError.value = 'Vul alle verplichte velden in.'
    return
  }

  if (!phonePattern.test(payload.phone)) {
    submitError.value = 'Vul een geldig telefoonnummer in.'
    return
  }

  if (payload.message.length < 10) {
    submitError.value = 'Uw bericht moet minimaal 10 tekens bevatten.'
    return
  }

  isSubmitting.value = true

  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: payload
    })

    submitSuccess.value = 'Bedankt! Uw bericht is verzonden. We nemen snel contact met u op.'
    formData.value = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      serviceType: 'Algemene Vraag'
    }
  } catch {
    submitError.value = 'Verzenden is mislukt. Probeer het opnieuw of bel ons direct.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <!-- Hero Section -->
    <PageHero
      description="Onze experts staan klaar om uw vragen te beantwoorden en een gratis offerte op te stellen."
      title="Laten we uw project bespreken"
    />

    <!-- Contact Methods - Cards -->
    <section class="py-12 md:py-20 px-4 md:px-6 bg-gray-50">
      <div class="container mx-auto max-w-6xl">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <ContactCard
            :contact-link="`tel:${companyInfo.phone}`"
            :contact-text="companyInfo.phoneDisplay"
            :description="`Ma - Vr: ${companyInfo.hours.weekdays}`"
            :icon="PhoneIcon"
            subtitle="Praat met een expert"
            title="Bel ons direct"
          />

          <ContactCard
            :contact-link="`mailto:${companyInfo.email}`"
            :contact-text="companyInfo.email"
            :description="`Ma - Vr: ${companyInfo.hours.weekdays}`"
            :icon="EnvelopeIcon"
            subtitle="We reageren snel"
            title="Stuur een e-mail"
          />

          <ContactCard
            :contact-link="`tel:${companyInfo.emergencyPhone}`"
            :contact-text="companyInfo.emergencyPhoneDisplay"
            :icon="ClockIcon"
            :is-emergency="true"
            description="Voor spoedeisende situaties"
            subtitle="Altijd bereikbaar"
            title="24/7 Noodhulp"
          />
        </div>
      </div>
    </section>

    <!-- Main Content - Form & Info -->
    <section class="py-12 md:py-20 px-4 md:px-6 bg-white">
      <div class="container mx-auto max-w-7xl">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">

          <!-- Left - Contact Form -->
          <div
            id="contact-form"
            class="bg-gray-50 rounded-2xl md:rounded-3xl shadow-lg p-6 md:p-8 lg:p-12 border border-border scroll-mt-28 md:scroll-mt-32">
            <div class="mb-6 md:mb-8">
              <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-secondary mb-3">Stuur een bericht</h2>
              <p class="text-gray-700 text-base md:text-lg">
                Vul onderstaand formulier in of bel ons direct. We nemen zo snel mogelijk contact met u op.
              </p>
            </div>

            <form class="space-y-5 md:space-y-6" @submit.prevent="handleSubmit">
              <!-- Name -->
              <div>
                <label class="block text-sm font-bold text-gray-800 mb-2" for="name">
                  Volledige naam *
                </label>
                <input
                  id="name"
                  ref="nameInput"
                  v-model="formData.name"
                  class="w-full px-4 py-3 md:py-4 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-[border-color,box-shadow] text-base md:text-lg bg-white"
                  placeholder="Jan de Vries"
                  required
                  type="text"
                >
              </div>

              <!-- Email & Phone -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <div>
                  <label class="block text-sm font-bold text-gray-800 mb-2" for="email">
                    E-mailadres *
                  </label>
                  <input
                    id="email"
                    v-model="formData.email"
                    class="w-full px-4 py-3 md:py-4 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-[border-color,box-shadow] text-base md:text-lg bg-white"
                    placeholder="jan@voorbeeld.nl"
                    required
                    type="email"
                  >
                </div>
                <div>
                  <label class="block text-sm font-bold text-gray-800 mb-2" for="phone">
                    Telefoonnummer *
                  </label>
                  <input
                    id="phone"
                    v-model="formData.phone"
                    class="w-full px-4 py-3 md:py-4 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-[border-color,box-shadow] text-base md:text-lg bg-white"
                    minlength="8"
                    pattern="[0-9+() -]{8,20}"
                    placeholder="06 1234 5678"
                    required
                    type="tel"
                  >
                </div>
              </div>

              <!-- Service Type -->
              <div>
                <label class="block text-sm font-bold text-gray-800 mb-2" for="serviceType">
                  Type dienst *
                </label>
                <select
                  id="serviceType"
                  v-model="formData.serviceType"
                  class="w-full px-4 py-3 md:py-4 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-[border-color,box-shadow] bg-white text-base md:text-lg"
                  required
                >
                  <option v-for="type in serviceTypes" :key="type" :value="type">
                    {{ type }}
                  </option>
                </select>
              </div>

              <!-- Subject -->
              <div>
                <label class="block text-sm font-bold text-gray-800 mb-2" for="subject">
                  Onderwerp *
                </label>
                <input
                  id="subject"
                  v-model="formData.subject"
                  class="w-full px-4 py-3 md:py-4 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-[border-color,box-shadow] text-base md:text-lg bg-white"
                  placeholder="Waar kunnen we u mee helpen?"
                  required
                  type="text"
                >
              </div>

              <!-- Message -->
              <div>
                <label class="block text-sm font-bold text-gray-800 mb-2" for="message">
                  Uw bericht *
                </label>
                <textarea
                  id="message"
                  v-model="formData.message"
                  class="w-full px-4 py-3 md:py-4 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-[border-color,box-shadow] resize-none text-base md:text-lg bg-white"
                  placeholder="Vertel ons meer over uw project, tijdlijn, budget en eventuele specifieke wensen..."
                  required
                  rows="6"
                />
              </div>

              <!-- Submit Button -->
              <button
                :disabled="isSubmitting"
                class="w-full px-6 md:px-8 py-4 md:py-5 bg-primary text-white text-base md:text-lg font-bold press rounded-xl cursor-pointer hover:bg-primary-dark hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-primary"
                type="submit"
              >
                <span>{{ isSubmitting ? 'Verzenden...' : 'Verstuur bericht' }}</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M14 5l7 7m0 0l-7 7m7-7H3" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" />
                </svg>
              </button>

              <div aria-live="polite">
                <Transition
                  enter-active-class="transition-[opacity,translate] duration-200 ease-out"
                  enter-from-class="opacity-0 -translate-y-1"
                  mode="out-in"
                >
                  <p v-if="submitSuccess" key="success" class="text-sm text-green-700 text-center font-semibold">
                    {{ submitSuccess }}
                  </p>
                  <p v-else-if="submitError" :key="submitError" class="text-sm text-red text-center font-semibold">
                    {{ submitError }}
                  </p>
                </Transition>
              </div>

              <p class="text-sm text-gray-600 text-center">
                Door dit formulier te verzenden, neemt u contact op via e-mail of telefoon.
              </p>
            </form>
          </div>

          <!-- Right - Why Choose Us & Additional Info -->
          <div class="space-y-6 md:space-y-8">

            <!-- Why Contact Us -->
            <div class="bg-primary rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 text-white shadow-lg">
              <h3 class="text-2xl md:text-3xl font-bold mb-6">Waarom De Elektraman?</h3>
              <div class="space-y-6">
                <div class="flex gap-4 text-white">
                  <div class="shrink-0">
                    <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                      <CheckBadgeIcon class="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 class="text-xl font-bold mb-2 text-white">Gecertificeerd & verzekerd</h4>
                    <p class="text-white/90">Alle werkzaamheden worden uitgevoerd volgens de hoogste
                      veiligheidsnormen.</p>
                  </div>
                </div>

                <div class="flex gap-4 text-white">
                  <div class="shrink-0">
                    <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                      <BoltIcon class="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 class="text-xl font-bold mb-2 text-white">Snelle service</h4>
                    <p class="text-white/90">Binnen 24 uur reactie en spoedservice voor noodgevallen beschikbaar.</p>
                  </div>
                </div>

                <div class="flex gap-4 text-white">
                  <div class="shrink-0">
                    <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                      <MapPinIcon class="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 class="text-xl font-bold mb-2 text-white">Landelijk actief</h4>
                    <p class="text-white/90">We bedienen klanten door heel Nederland met dezelfde hoge kwaliteit.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Emergency Card -->
            <div class="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg border-2 border-red">
              <div class="flex items-center gap-2 mb-4">
                <span class="relative flex size-3">
                  <span class="absolute inset-0 rounded-full bg-red opacity-75 motion-safe:animate-ping" />
                  <span class="relative size-3 rounded-full bg-red" />
                </span>
                <span class="text-sm font-bold text-red">Noodgeval</span>
              </div>

              <h3 class="text-xl md:text-2xl font-bold mb-3 text-secondary">24/7 Storingsdienst</h3>

              <p class="text-gray-700 text-sm md:text-base mb-6 leading-relaxed">
                Elektrische storing of noodsituatie? Bel direct onze spoedlijn voor onmiddellijke hulp.
              </p>

              <a
                :href="`tel:${companyInfo.emergencyPhone}`"
                class="press inline-flex items-center justify-center gap-2 w-full px-4 md:px-6 py-3 md:py-4 bg-red text-white text-sm md:text-base font-bold rounded-xl hover:bg-red-dark shadow-md hover:shadow-lg"
              >
                <PhoneIcon class="w-5 h-5" />
                <span>Bel nu: {{ companyInfo.emergencyPhoneDisplay }}</span>
              </a>
            </div>

            <!-- Service Hours -->
            <div class="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg border border-border">
              <h3 class="text-xl md:text-2xl font-bold text-secondary mb-6">Openingstijden</h3>
              <div class="space-y-4">
                <div class="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span class="font-semibold text-gray-700">Maandag - Vrijdag</span>
                  <span class="text-gray-600">{{ companyInfo.hours.weekdays }}</span>
                </div>
                <div class="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span class="font-semibold text-gray-700">Zaterdag - Zondag</span>
                  <span class="text-gray-600">{{ companyInfo.hours.weekend }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="font-semibold text-red">Spoeddienst</span>
                  <span class="font-bold text-red">{{ companyInfo.hours.emergency }}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>

    <!-- Process -->
    <ProcessSection
      :steps="[
        { number: 1, title: 'Contact', description: 'U neemt contact op via telefoon, e-mail of formulier' },
        { number: 2, title: 'Intake', description: 'We bespreken uw wensen en plannen een afspraak' },
        { number: 3, title: 'Offerte', description: 'U ontvangt een transparante en gedetailleerde offerte' },
        { number: 4, title: 'Uitvoering', description: 'We starten met uw project op de afgesproken datum' }
      ]"
      description="Ons proces is transparant en efficiënt"
      title="Wat u kunt verwachten"
    />

    <!-- Final CTA -->
    <CallToAction
      :button-link="`tel:${companyInfo.phone}`"
      button-text="Bel direct"
      description="Neem vandaag nog contact op en ontvang binnen 24 uur een vrijblijvende offerte."
      title="Laten we beginnen"
    />
  </div>
</template>
