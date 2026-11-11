<script lang="ts" setup>
import type { Component } from 'vue'

interface Props {
  icon: Component
  title: string
  subtitle: string
  contactText: string
  contactLink: string
  description: string
  available?: boolean
  isEmergency?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  available: true,
  isEmergency: false
})

const { isOpen, isEmergencyAvailable, nextOpeningTime } = useBusinessHours()

// Determine if this contact method is currently available
const isAvailable = computed(() => {
  if (props.isEmergency) {
    return isEmergencyAvailable.value
  }
  return isOpen.value
})

const availabilityText = computed(() => {
  if (props.isEmergency) {
    return isEmergencyAvailable.value ? 'Altijd bereikbaar' : 'Noodlijn'
  }
  return isOpen.value ? 'Nu beschikbaar' : `Beschikbaar ${nextOpeningTime.value}`
})
</script>

<template>
  <div
    class="p-6 md:p-8 rounded-xl border border-border text-center">
    <div
      class="w-12 h-12 md:w-14 md:h-14 bg-primary-light rounded-lg flex items-center justify-center mb-4 md:mb-6 mx-auto">
      <component :is="icon" class="w-6 h-6 md:w-8 md:h-8 text-primary" />
    </div>

    <h3 class="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-secondary">{{ title }}</h3>

    <p class="leading-relaxed text-gray-600 mb-3 md:mb-4 text-xs md:text-sm">
      {{ subtitle }}
    </p>

    <a
      :href="contactLink"
      class="block text-base md:text-lg font-semibold text-primary hover:text-primary-dark transition-colors mb-2"
    >
      {{ contactText }}
    </a>

    <p class="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
      {{ description }}
    </p>

    <div class="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100">
      <span
        v-if="isAvailable"
        class="inline-flex items-center gap-1 text-xs font-semibold text-primary"
      >
        <span class="relative flex size-2">
          <span class="absolute inset-0 rounded-full bg-primary opacity-75 motion-safe:animate-ping" />
          <span class="relative size-2 rounded-full bg-primary" />
        </span>
        {{ availabilityText }}
      </span>
      <span
        v-else
        class="inline-flex items-center gap-1 text-xs font-semibold text-gray-500"
      >
        <span class="w-2 h-2 bg-gray-400 rounded-full" />
        {{ availabilityText }}
      </span>
    </div>
  </div>
</template>
