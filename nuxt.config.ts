import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: {enabled: true},
    css: ['~/assets/css/main.css'],

    modules: [
        '@nuxt/eslint',
        '@nuxt/fonts',
        '@nuxt/icon',
        '@nuxt/image',
        '@vercel/speed-insights/nuxt',
    ],

    runtimeConfig: {
        smtpHost: '',
        smtpPort: 465,
        smtpUser: '',
        smtpPass: '',
        smtpFromName: 'De Elektraman Website',
        contactTo: '',
        public: {
            appName: '',
            websiteName: '',
            companyDescription: '',
            companyEmail: '',
            companyPhone: '',
            companyPhoneDisplay: '',
            companyEmergencyPhone: '',
            companyEmergencyPhoneDisplay: '',
            hoursWeekdays: '',
            hoursWeekend: '',
            hoursSaturday: '',
            hoursSunday: '',
            hoursEmergency: '',
            yearsExperience: '',
            happyClients: '',
            socialLinkedin: '',
            socialFacebook: '',
            socialInstagram: '',
            companyAddress: '',
            companySlogan: '',
        }
    },

    app: {
        // iOS Safari only applies :active (press feedback) when a touchstart handler exists
        head: {bodyAttrs: {ontouchstart: ''}},
        pageTransition: {
            name: 'page',
            mode: 'out-in'
        },
        layoutTransition: {
            name: 'layout',
            mode: 'out-in'
        }
    },

    vite: {
        plugins: [
            tailwindcss(),
        ],
    },
})