import adapter from "@sveltejs/adapter-auto"
import preprocess from "svelte-preprocess"

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    preprocess({
      postcss: true,
    }),
  ],

  kit: {
    adapter: adapter(),
    prerender: {
      default: true, // Prerender by default (https://kit.svelte.dev/docs/page-options#prerender)
    },
  },
}

export default config
