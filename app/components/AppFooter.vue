<template>
  <footer class="bg-gray-50 border-t border-gray-100">
    <div class="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <!-- Footer Content -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-12">
        <!-- Brand -->
        <div class="sm:col-span-2 md:col-span-1">
          <div class="flex items-center gap-2 mb-3 md:mb-4">
            <NuxtImg
              :alt="`${companyInfo.appName} Logo`"
              class="w-10 h-10 md:w-12 md:h-12 object-contain"
              format="webp"
              height="48"
              loading="lazy"
              src="/logo.png"
              width="48"
            />
            <span class="font-display text-base md:text-lg font-bold text-gray-900">{{ companyInfo.appName }}</span>
          </div>
          <p class="text-gray-600 text-xs md:text-sm">{{ companyInfo.description }}</p>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="font-bold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">Snelle links</h4>
          <ul class="space-y-2 text-xs md:text-sm">
            <li>
              <NuxtLink class="text-gray-600 hover:text-primary transition-colors" to="/">Home</NuxtLink>
            </li>
            <li>
              <NuxtLink class="text-gray-600 hover:text-primary transition-colors" to="/services">Diensten</NuxtLink>
            </li>
            <li>
              <NuxtLink class="text-gray-600 hover:text-primary transition-colors" to="/portfolio">Portfolio
              </NuxtLink>
            </li>
            <li>
              <NuxtLink class="text-gray-600 hover:text-primary transition-colors" to="/contact">Contact</NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div>
          <h4 class="font-bold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">Contact</h4>
          <ul class="space-y-2 text-xs md:text-sm text-gray-600">
            <li>E-mail: <a
              :href="`mailto:${companyInfo.email}`"
              class="hover:text-primary transition-colors break-all">{{ companyInfo.email }}</a>
            </li>
            <li>Telefoon: <a
              :href="`tel:${companyInfo.phone}`"
              class="hover:text-primary transition-colors">{{ companyInfo.phoneDisplay }}</a></li>
            <li>Altijd beschikbaar voor spoedeisende gevallen</li>
          </ul>
        </div>

        <!-- Legal -->
        <div>
          <h4 class="font-bold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">Juridisch</h4>
          <ul class="space-y-2 text-xs md:text-sm">
            <li>
              <NuxtLink class="text-gray-600 hover:text-primary transition-colors" to="/privacy">Privacybeleid
              </NuxtLink>
            </li>
            <li>
              <NuxtLink class="text-gray-600 hover:text-primary transition-colors" to="/terms">Servicevoorwaarden
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Certifications -->
      <div class="border-t border-gray-200 pt-6 md:pt-8 mb-6 md:mb-8">
        <div class="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
          <p class="text-xs md:text-sm font-semibold text-gray-700">Gecertificeerd</p>
          <div
            v-if="visibleCertificateLogos.length"
            class="flex flex-wrap items-center justify-center md:justify-end gap-4 md:gap-6">
            <img
              v-for="logo in visibleCertificateLogos"
              :key="logo.key"
              :alt="logo.alt"
              :src="logo.src"
              class="h-8 md:h-10 w-auto object-contain"
              loading="lazy"
              @error="hideCertificateLogo(logo.key)"
            >
          </div>
          <p v-else class="text-xs md:text-sm text-gray-600">InstallQ en VCA</p>
        </div>
      </div>

      <!-- Bottom Footer -->
      <div
        class="border-t border-gray-200 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center text-xs md:text-sm text-gray-600 gap-4">
        <p class="text-center md:text-left">© {{ currentYear }} {{ companyInfo.appName }} — Alle rechten
          voorbehouden.</p>
        <div class="flex gap-4 md:gap-6">
          <a :href="companyInfo.social.instagram" class="hover:text-primary transition-colors">Instagram</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

const currentYear = new Date().getFullYear()
const companyInfo = useCompanyInfo()

const certificateLogos = [
  { key: 'installq', src: '/certifications/installq-logo.png', alt: 'InstallQ certificering logo' },
  { key: 'vca', src: '/certifications/vca-logo.png', alt: 'VCA certificering logo' }
] as const

const hiddenCertificateLogoKeys = ref<string[]>([])

const visibleCertificateLogos = computed(() => {
  return certificateLogos.filter(logo => !hiddenCertificateLogoKeys.value.includes(logo.key))
})

const hideCertificateLogo = (logoKey: string) => {
  if (hiddenCertificateLogoKeys.value.includes(logoKey)) return
  hiddenCertificateLogoKeys.value.push(logoKey)
}
</script>