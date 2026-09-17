import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import rehypeYouTubeEmbeds from './src/lib/rehype-youtube-embeds';

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  markdown: {
    processor: unified({ gfm: true, rehypePlugins: [rehypeYouTubeEmbeds] }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
