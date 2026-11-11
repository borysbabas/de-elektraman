<script lang="ts" setup>
interface Props {
  title: string
  description: string
  primaryButton?: { text: string; to: string } | null
  secondaryButton?: { text: string; to: string } | null
  showImage?: boolean
  compact?: boolean
}

withDefaults(defineProps<Props>(), {
  primaryButton: null,
  secondaryButton: null,
  showImage: false,
  compact: false
})
</script>

<template>
  <section
    :class="[
    'relative overflow-hidden px-6',
    compact ? 'py-16 md:py-24' : 'py-20'
  ]">
    <div class="container mx-auto">
      <div
        :class="[
        'gap-12 items-center',
        showImage ? 'grid md:grid-cols-2' : 'max-w-3xl'
      ]">
        <!-- Left Content -->
        <div class="space-y-6">
          <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] text-secondary">
            {{ title }}
          </h1>
          <p
            :class="[
            'text-base sm:text-lg md:text-xl leading-relaxed max-w-prose',
            compact ? 'text-gray-700' : 'text-gray-600'
          ]">
            {{ description }}
          </p>
          <div v-if="primaryButton || secondaryButton" class="flex flex-col sm:flex-row gap-4 pt-4">
            <NuxtLink
              v-if="primaryButton"
              :to="primaryButton.to"
              class="press px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark shadow-lg text-center"
            >
              {{ primaryButton.text }}
            </NuxtLink>
            <NuxtLink
              v-if="secondaryButton"
              :to="secondaryButton.to"
              class="press px-8 py-4 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary-light text-center"
            >
              {{ secondaryButton.text }}
            </NuxtLink>
          </div>
          <slot />
        </div>

        <!-- Right Content -->
        <div v-if="showImage" class="relative flex items-center justify-end">
          <div class="relative w-full aspect-4/3 md:aspect-5/6 overflow-hidden rounded-2xl">
            <NuxtImg
              alt="De Elektraman aan het werk bij een batterijopslag"
              class="h-full w-full object-cover object-[center_30%] md:object-right md:[mask-image:linear-gradient(to_left,#000_60%,transparent)]"
              fetchpriority="high"
              format="webp"
              preload
              sizes="100vw md:50vw xl:640px"
              src="/sandro.jpeg"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
