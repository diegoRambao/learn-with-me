import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import rehypeYouTubeEmbeds from '../src/lib/rehype-youtube-embeds';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));

export default defineConfig({
  srcDir: './src',
  outDir: '../.content-admin/admin-dist',
  cacheDir: '../.content-admin/astro-cache',
  output: 'server',
  server: { host: '127.0.0.1' },
  devToolbar: { enabled: false },
  markdown: {
    processor: unified({ gfm: true, rehypePlugins: [rehypeYouTubeEmbeds] }),
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@admin': fileURLToPath(new URL('./src', import.meta.url)),
        '@shared': fileURLToPath(new URL('../src', import.meta.url)),
        '@repo': repositoryRoot,
      },
    },
  },
});
