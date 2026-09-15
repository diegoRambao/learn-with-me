import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  markdown: {
    processor: unified({ gfm: true }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
