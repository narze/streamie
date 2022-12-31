import { sveltekit } from "@sveltejs/kit/vite"
import { UserConfig } from "vite"

const config: UserConfig = {
  plugins: [sveltekit()],
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..'],
    },
  },
}

export default config
