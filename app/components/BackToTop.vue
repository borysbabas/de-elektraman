<template>
  <Transition name="fade">
    <button
      v-if="showButton"
      aria-label="Terug naar boven"
      class="fixed bottom-8 right-8 z-50 p-4 press bg-primary text-white cursor-pointer rounded-full shadow-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 overflow-hidden"
      title="Terug naar boven"
      @click="scrollToTop"
    >
      <ArrowUpIcon class="h-6 w-6 arrow-up-icon" />
    </button>
  </Transition>
</template>

<script lang="ts" setup>
import { ArrowUpIcon } from '@heroicons/vue/24/solid'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const showButton = ref(false)

const handleScroll = () => {
  showButton.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease-out, translate 200ms var(--ease-fluid);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  translate: 0 10px;
}

/* Arrow up animation */
.arrow-up-icon {
  display: block;
  animation-fill-mode: forwards;
}

button:hover .arrow-up-icon {
  animation: arrowSlideUp 0.5s ease;
}

@keyframes arrowSlideUp {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  49% {
    transform: translateY(-150%);
    opacity: 0;
  }
  50% {
    transform: translateY(150%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
