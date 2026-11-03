import { mdsvex } from 'mdsvex';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from '@sveltejs/adapter-static';
import { fileURLToPath } from 'node:url';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.svx'],
  preprocess: [vitePreprocess(), mdsvex({ extensions: ['.svx'] })],
  kit: {
    adapter: adapter({ fallback: 'index.html' }),
    alias: { '#lib': fileURLToPath(new URL('./src/lib', import.meta.url)) },
    prerender: { handleHttpError: 'warn' },
  },
};

export default config;
