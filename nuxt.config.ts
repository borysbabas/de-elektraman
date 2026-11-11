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
        // Portfolio admin: a long random password, and a 32+ character secret that encrypts the session cookie
        adminPassword: '',
        sessionPassword: '',
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

    // Portfolio photos uploaded through the admin live in Supabase Storage
    image: {
        domains: process.env.SUPABASE_URL ? [new URL(process.env.SUPABASE_URL).hostname] : [],
    },

    vite: {
        plugins: [
            tailwindcss(),
        ],
    },
})