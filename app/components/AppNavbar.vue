<template>
  <header
    :class="[
      'material sticky top-0 z-50 border-b transition-colors duration-200',
      scrolled || mobileMenuOpen ? 'border-gray-200/70' : 'border-transparent'
    ]">
    <nav class="container mx-auto flex items-center justify-between py-5 px-6">
      <!-- Logo -->
      <NuxtLink class="flex items-center gap-2 group" to="/">
        <NuxtImg
          :alt="`${companyInfo.appName} Logo`"
          class="w-12 h-12 object-contain"
          format="webp"
          height="48"
          src="/logo.png"
          width="48"
        />
        <span
          class="font-display text-xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-200 tracking-tight">{{
            companyInfo.appName
          }}</span>
      </NuxtLink>

      <!-- Desktop Navigation Links -->
      <ul class="hidden md:flex gap-8 font-medium text-gray-700">
        <li v-for="link in links" :key="link.to">
          <NuxtLink
            :to="link.to"
            class="relative hover:text-primary aria-[current=page]:text-primary transition-colors duration-200 group">
            {{ link.label }}
            <span
              class="absolute -bottom-0.5 left-0 w-full h-0.5 bg-primary origin-left scale-x-0 group-hover:scale-x-100 group-aria-[current=page]:scale-x-100 transition-transform duration-200 ease-out" />
          </NuxtLink>
        </li>
      </ul>

      <!-- Desktop CTA Button -->
      <NuxtLink
        class="press hidden md:inline-block px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark shadow-sm"
        to="/contact"
      >
        Offerte aanvragen
      </NuxtLink>

      <!-- Mobile Menu Button: three bars morph into an X -->
      <button
        :aria-expanded="mobileMenuOpen"
        :aria-label="mobileMenuOpen ? 'Sluit menu' : 'Open menu'"
        class="press md:hidden p-2 text-gray-700 hover:text-primary"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <span aria-hidden="true" class="flex h-6 w-6 flex-col items-center justify-center gap-1.5">
          <span
            :class="['block h-0.5 w-5 rounded-full bg-current transition-transform duration-200 ease-out', mobileMenuOpen && 'translate-y-2 rotate-45']" />
          <span
            :class="['block h-0.5 w-5 rounded-full bg-current transition-opacity duration-150', mobileMenuOpen && 'opacity-0']" />
          <span
            :class="['block h-0.5 w-5 rounded-full bg-current transition-transform duration-200 ease-out', mobileMenuOpen && '-translate-y-2 -rotate-45']" />
        </span>
      </button>
    </nav>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition-[opacity,translate] duration-250 ease-fluid"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition-[opacity,translate] duration-150 ease-in"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="mobileMenuOpen"
        class="md:hidden border-t border-gray-100"
      >
        <ul class="container mx-auto px-6 py-4 space-y-4">
          <li v-for="link in links" :key="link.to">
            <NuxtLink
              :to="link.to"
              class="block py-2 text-gray-700 hover:text-primary aria-[current=page]:text-primary font-medium transition-colors duration-200"
              @click="mobileMenuOpen = false"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
          <li class="pt-2">
            <NuxtLink
              class="press block w-full px-6 py-3 bg-primary text-white text-center font-medium rounded-lg hover:bg-primary-dark shadow-sm"
              to="/contact"
              @click="mobileMenuOpen = false"
            >
              Offerte aanvragen
            </NuxtLink>
          </li>
        </ul>
      </div>
    </Transition>
  </header>
</template>

<script lang="ts" setup>
const companyInfo = useCompanyInfo()
const mobileMenuOpen = ref(false)
const scrolled = ref(false)

const links = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Diensten' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/contact', label: 'Contact' }
]

const handleScroll = () => {
  scrolled.value = window.scrollY > 4
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Close mobile menu when route changes
const route = useRoute()
watch(() => route.path, () => {
  mobileMenuOpen.value = false
})
</script>
