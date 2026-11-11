<script lang="ts" setup>
import {
  BoltIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  WrenchScrewdriverIcon
} from '@heroicons/vue/24/solid'

useSeoMeta({
  title: 'Diensten | De Elektraman',
  description: 'Bekijk onze elektrische diensten: installaties, onderhoud, inspecties, storingsdienst, laadpalen, batterijen en zonne-energie.',
  ogTitle: 'Diensten | De Elektraman',
  ogDescription: 'Bekijk onze elektrische diensten: installaties, onderhoud, inspecties, storingsdienst, laadpalen, batterijen en zonne-energie.',
  twitterCard: 'summary'
})
</script>
<template>
  <div>
    <!-- Hero Section -->
    <PageHero
      :compact="true"
      description="Van residentiële tot industriële projecten, De Elektraman biedt professionele en betrouwbare elektrische diensten."
      title="Volledige elektrische diensten"
    />

    <!-- Primary Services -->
    <section class="py-12 md:py-20 px-6">
      <div class="container mx-auto">
        <SectionHeader
          description="Alles wat u nodig heeft voor betrouwbare elektrische systemen"
          title="Onze kernservices"
        />

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <ServiceCard
            :features="['Nieuwbouw en renovaties', 'Zonne-energie systemen', 'Batterij-opslag systemen', 'Laadpalen']"
            :icon="BoltIcon"
            description="Professionele installatie van elektrische systemen, verlichting, bedrading en moderne smart home-oplossingen."
            title="Installaties"
          />

          <ServiceCard
            :features="['Periodieke controles', 'Veiligheidscertificering', 'Periodieke controle NEN1010 scope 8', 'Veiligheid woning inspectie NEN8025']"
            :icon="WrenchScrewdriverIcon"
            description="Regelmatig onderhoud, veiligheidscontroles en preventieve diensten om uw systemen soepel te laten werken."
            title="Onderhoud & Inspectie"
          />

          <ServiceCard
            :features="['24/7 beschikbaarheid', 'Snelle responstijd', 'Noodreparaties']"
            :icon="ExclamationTriangleIcon"
            description="24/7 storingsdienst voor dringende elektrische problemen. We zijn er altijd voor u wanneer u ons nodig hebt."
            title="Storingsdienst"
          />
        </div>
      </div>
    </section>

    <!-- Specialized Services -->
    <section class="bg-primary-light py-12 md:py-20 px-6">
      <div class="container mx-auto">
        <SectionHeader
          description="Voor verschillende soorten projecten en ruimtes"
          title="Gespecialiseerde diensten"
        />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <SpecializedServiceCard
            :features="['Elektra renovatie/aanleggen', 'Verlichting design', 'Huisautomatisering', 'EV laadstations 3,7kW tot 22kW', 'Energie opslag systeem 5.1 kWh tot 40.8 kWh', 'Zonne-energie systeem', 'Groepenkast vervangen', '1 Fase naar 3 fase', 'Aardpen slaan']"
            :icon="HomeIcon"
            description="Huizen en appartementen voorzien van veilige, moderne elektrische systemen."
            title="Residentieel"
          />

          <SpecializedServiceCard
            :features="['Elektra renovatie/aanleggen', 'LED verlichting', 'Noodstroom voorziening', 'AC & DC EV laadstation 22 kW tot 720kW', 'Energie opslag 40.8kWh tot 512kWh', 'Aardpen slaan', 'Capaciteit vergroting (Netcongestie)', 'Verdeel inrichting']"
            :icon="BuildingOfficeIcon"
            description="Kantoren en winkels met betrouwbare en efficiënte elektriciteit."
            title="Commercieel"
          />
        </div>
      </div>
    </section>

    <!-- Service Process -->
    <ProcessSection
      :steps="[
          { number: 1, title: 'Contact', description: 'Neem contact op via telefoon of formulier' },
          { number: 2, title: 'Beoordeling', description: 'We beoordelen uw behoeften' },
          { number: 3, title: 'Offerte', description: 'Ontvang een duidelijke offerte' },
          { number: 4, title: 'Uitvoering', description: 'We voeren het werk professioneel uit' }
        ]"
      description="Ons transparante en efficiënte proces"
      title="Hoe wij werken"
    />

    <!-- CTA Section -->
    <CallToAction
      button-link="/contact"
      button-text="Vraag een offerte aan"
      description="Neem vandaag contact op voor een gratis adviesgesprek en ontdek hoe wij u kunnen helpen."
      title="Interesse in onze diensten?"
    />
  </div>
</template>
