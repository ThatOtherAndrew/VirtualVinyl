import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // https://svelte.dev/docs/kit/integrations
    preprocess: vitePreprocess(),

    kit: {
        // https://svelte.dev/docs/kit/adapters
        adapter: adapter(),

        // https://svelte.dev/docs/kit/adapter-static#GitHub-Pages
        paths: {
            base: process.argv.includes('dev') ? '' : process.env.BASE_PATH,
        },
    },
};

export default config;
