<script lang="ts" setup>
const companyInfo = useCompanyInfo()

useSeoMeta({
  title: 'Privacyverklaring | De Elektraman',
  description: 'Lees hoe De Elektraman omgaat met persoonsgegevens en welke rechten u heeft volgens onze privacyverklaring.',
  ogTitle: 'Privacyverklaring | De Elektraman',
  ogDescription: 'Lees hoe De Elektraman omgaat met persoonsgegevens en welke rechten u heeft volgens onze privacyverklaring.',
  twitterCard: 'summary'
})
</script>
<template>
  <div>
    <PageHero
      :compact="true"
      description="Wij gaan zorgvuldig om met uw persoonsgegevens en gebruiken deze alleen voor dienstverlening en contact."
      title="Privacyverklaring"
    />

    <section class="py-12 px-4 md:px-6 bg-white">
      <div class="container mx-auto max-w-4xl">
        <div class="bg-gray-50 border border-border rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-sm space-y-8">
          <div>
            <h2 class="text-xl md:text-2xl font-bold text-secondary mb-3">Wie wij zijn</h2>
            <p class="text-gray-700 leading-relaxed">
              De Elektraman is verantwoordelijk voor de verwerking van persoonsgegevens zoals weergegeven in deze
              privacyverklaring.
            </p>
          </div>

          <div>
            <h2 class="text-xl md:text-2xl font-bold text-secondary mb-3">Welke gegevens wij verwerken</h2>
            <ul class="list-disc pl-5 text-gray-700 space-y-2 leading-relaxed">
              <li>Naam en contactgegevens (zoals e-mailadres en telefoonnummer)</li>
              <li>Inhoud van uw bericht of aanvraag</li>
              <li>Eventuele aanvullende informatie die u zelf met ons deelt</li>
            </ul>
          </div>

          <div>
            <h2 class="text-xl md:text-2xl font-bold text-secondary mb-3">Waarom wij deze gegevens gebruiken</h2>
            <ul class="list-disc pl-5 text-gray-700 space-y-2 leading-relaxed">
              <li>Om contact met u op te nemen over uw aanvraag</li>
              <li>Om een offerte op te stellen of werkzaamheden uit te voeren</li>
              <li>Om te voldoen aan wettelijke verplichtingen</li>
            </ul>
          </div>

          <div>
            <h2 class="text-xl md:text-2xl font-bold text-secondary mb-3">Bewaartermijn</h2>
            <p class="text-gray-700 leading-relaxed">
              Wij bewaren persoonsgegevens niet langer dan noodzakelijk is voor het doel waarvoor deze zijn verzameld,
              tenzij een wettelijke bewaartermijn van toepassing is.
            </p>
          </div>

          <div>
            <h2 class="text-xl md:text-2xl font-bold text-secondary mb-3">Uw rechten</h2>
            <p class="text-gray-700 leading-relaxed">
              U heeft het recht op inzage, correctie of verwijdering van uw persoonsgegevens. Daarnaast kunt u bezwaar
              maken tegen de verwerking of een verzoek doen om gegevensoverdracht.
            </p>
          </div>

          <div>
            <h2 class="text-xl md:text-2xl font-bold text-secondary mb-3">Contact</h2>
            <p class="text-gray-700 leading-relaxed">
              Heeft u vragen over deze privacyverklaring? Neem contact met ons op via
              <a
                :href="`mailto:${companyInfo.email}`"
                class="text-primary font-semibold hover:underline"
              >{{ companyInfo.email }}</a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
