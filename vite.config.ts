import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { sveltePhosphorOptimize } from 'phosphor-svelte/vite';

export default defineConfig({
    base: '/VirtualVinyl/',

    plugins: [
        tailwindcss(),
        sveltekit(),
        sveltePhosphorOptimize(),
        devtoolsJson(),
    ],
    server: {
        allowedHosts: ['tunnel.thatother.dev'],
    },
});
