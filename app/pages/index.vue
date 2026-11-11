<script lang="ts" setup>
import { BoltIcon, ExclamationTriangleIcon, WrenchScrewdriverIcon } from '@heroicons/vue/24/solid'

const companyInfo = useCompanyInfo()

useSeoMeta({
  title: 'De Elektraman | Efficiente en professionele elektrische diensten',
  description: 'Professionele elektrische diensten voor woning en bedrijf, van installatie en onderhoud tot 24/7 storingsdienst.',
  ogTitle: 'De Elektraman | Efficiente en professionele elektrische diensten',
  ogDescription: 'Professionele elektrische diensten voor woning en bedrijf, van installatie en onderhoud tot 24/7 storingsdienst.',
  twitterCard: 'summary'
})
</script>
<template>
  <div>
    <!-- Hero Section -->
    <PageHero
      :primary-button="{ text: 'Vandaag aan de slag', to: '/contact' }"
      :secondary-button="{ text: 'Bekijk ons werk', to: '/portfolio' }"
      :show-image="true"
      description="Van installaties en onderhoud tot spoedeisende reparaties, De Elektraman levert deskundige elektrische diensten met precisie, betrouwbaarheid en professionaliteit."
      title="Professionele elektrische diensten die u kunt vertrouwen"
    >
      <a
        :href="`tel:${companyInfo.emergencyPhone}`"
        class="press inline-flex items-center gap-3 font-semibold text-red hover:text-red-dark"
      >
        <span class="relative flex size-2.5">
          <span class="absolute inset-0 rounded-full bg-red opacity-75 motion-safe:animate-ping" />
          <span class="relative size-2.5 rounded-full bg-red" />
        </span>
        Storing? Bel {{ companyInfo.hours.emergency }}: {{ companyInfo.emergencyPhoneDisplay }}
      </a>
    </PageHero>

    <!-- Trust Indicators -->
    <section class="bg-gray-50 py-12 md:py-16 px-6">
      <div class="container mx-auto">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
          <div class="text-center">
            <div class="font-display text-3xl md:text-4xl font-bold mb-2 text-primary">{{ companyInfo.happyClients }}+</div>
            <p class="text-sm md:text-base text-gray-700">Tevreden klanten</p>
          </div>
          <div class="text-center">
            <div class="font-display text-3xl md:text-4xl font-bold mb-2 text-primary">{{ companyInfo.yearsExperience }}+</div>
            <p class="text-sm md:text-base text-gray-700">Jaar ervaring</p>
          </div>
          <div class="text-center">
            <div class="font-display text-3xl md:text-4xl font-bold mb-2 text-primary">{{ companyInfo.hours.emergency }}</div>
            <p class="text-sm md:text-base text-gray-700">Storingsdienst</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section class="py-12 md:py-20 px-6">
      <div class="container mx-auto">
        <SectionHeader
          description="Volledige elektrische oplossingen afgestemd op uw residentiële, commerciële of industriële behoeften"
          title="Onze diensten"
        />

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <ServiceCard
            :icon="BoltIcon"
            description="Professionele installatie van elektrische systemen, verlichting, bedrading en moderne smart home-oplossingen."
            title="Installaties"
          />

          <ServiceCard
            :icon="WrenchScrewdriverIcon"
            description="Regelmatig onderhoud, veiligheidscontroles en preventieve diensten om uw systemen soepel te laten werken."
            title="Onderhoud"
          />

          <ServiceCard
            :icon="ExclamationTriangleIcon"
            description="24/7 storingsdienst voor dringende elektrische problemen. We zijn er altijd voor u wanneer u ons nodig hebt."
            title="Storingsdienst"
          />
        </div>
      </div>
    </section>

    <!-- Why Choose Us -->
    <section class="py-12 md:py-20 px-6">
      <div class="container mx-auto">
        <SectionHeader
          description="We combineren jarenlange ervaring met moderne technieken om uitzonderlijke elektrische diensten te leveren"
          title="Waarom De Elektraman kiezen?"
        />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <FeatureItem
            description="Al onze elektriciens zijn volledig erkend, gecertificeerd en verzekerd voor uw gemoedsrust."
            title="Erkend & verzekerd"
          />

          <FeatureItem
            description="We arriveren snel om uw elektrische problemen efficiënt in te schatten en op te lossen."
            title="Snelle responstijd"
          />

          <FeatureItem
            description="Geen verborgen kosten. We geven van tevoren gedetailleerde offertes zodat u precies weet wat te verwachten."
            title="Transparante prijsstelling"
          />

          <FeatureItem
            description="Groeiend netwerk van tevreden klanten in residentiële en commerciële projecten."
            title="Sterke basis opgebouwd"
          />
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <CallToAction
      :dark-mode="true"
      button-link="/contact"
      button-text="Offerte aanvragen"
      description="Neem vandaag contact op met De Elektraman voor een gratis adviesgesprek en ontdek waarom bedrijven en huiseigenaren ons vertrouwen."
      title="Klaar om te beginnen?"
    />
  </div>
</template>
