<script lang="ts" setup>
const companyInfo = useCompanyInfo()
const termsPdfPath = '/Algemene%20voorwaarden%20De%20Elektraman.pdf'

useSeoMeta({
  title: 'Servicevoorwaarden | De Elektraman',
  description: 'Bekijk of download de servicevoorwaarden van De Elektraman met afspraken over offertes, uitvoering, betaling en garantie.',
  ogTitle: 'Servicevoorwaarden | De Elektraman',
  ogDescription: 'Bekijk of download de servicevoorwaarden van De Elektraman met afspraken over offertes, uitvoering, betaling en garantie.',
  twitterCard: 'summary'
})
</script>
<template>
  <div>
    <PageHero
      :compact="true"
      description="Bekijk of download onze servicevoorwaarden voor alle afspraken rondom offertes en uitvoering."
      title="Servicevoorwaarden"
    />

    <section class="py-12 px-4 md:px-6 bg-white">
      <div class="container mx-auto max-w-4xl">
        <div class="bg-gray-50 border border-border rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-sm space-y-8">
          <div>
            <h2 class="text-xl md:text-2xl font-bold text-secondary mb-3">Algemene voorwaarden</h2>
            <p class="text-gray-700 leading-relaxed">
              Onze algemene servicevoorwaarden zijn beschikbaar als PDF. Hierin staan onder andere afspraken over
              offertes, uitvoering, betaling, aansprakelijkheid en garantie.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 sm:items-center">
            <a
              :href="termsPdfPath"
              class="inline-flex items-center justify-center rounded-xl px-6 py-3 bg-primary text-white font-bold hover:bg-primary-dark transition-colors"
              download
            >
              Download servicevoorwaarden
            </a>
            <a
              :href="termsPdfPath"
              class="inline-flex items-center justify-center rounded-xl px-6 py-3 border border-border text-secondary font-semibold hover:bg-white transition-colors"
              rel="noopener noreferrer"
              target="_blank"
            >
              Open in nieuw tabblad
            </a>
          </div>

          <p class="text-sm text-gray-600">
            Kunt u het bestand niet openen? Neem contact op via
            <a
              :href="`mailto:${companyInfo.email}`"
              class="text-primary font-semibold hover:underline"
            >{{ companyInfo.email }}</a>
            dan sturen wij het document per e-mail.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>