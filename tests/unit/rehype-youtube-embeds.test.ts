import { describe, expect, it } from 'vitest';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import rehypeYouTubeEmbeds from '../../src/lib/rehype-youtube-embeds';

const render = async (markdown: string): Promise<string> => {
  const processor = await createMarkdownProcessor({ gfm: true, rehypePlugins: [rehypeYouTubeEmbeds] });
  const result = await processor.render(markdown);
  return result.code;
};

describe('rehypeYouTubeEmbeds', () => {
  it.each([
    'http://www.youtube.com/watch?v=M7lc1UVf-VE',
    'https://youtu.be/M7lc1UVf-VE',
    'https://m.youtube.com/shorts/M7lc1UVf-VE',
    'https://youtube.com/embed/M7lc1UVf-VE',
  ])('embeds a supported standalone URL: %s', async (url) => {
    const html = await render(url);
    expect(html).toContain('class="youtube-embed"');
    expect(html).toContain('src="https://www.youtube-nocookie.com/embed/M7lc1UVf-VE"');
    expect(html).toContain('href="https://www.youtube.com/watch?v=M7lc1UVf-VE"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('allowfullscreen');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('keeps consecutive videos in source order', async () => {
    const html = await render('https://youtu.be/M7lc1UVf-VE\n\nhttps://youtu.be/u8Mgv2ztXsg');
    expect(html.match(/class="youtube-embed"/g)).toHaveLength(2);
    expect(html.indexOf('M7lc1UVf-VE')).toBeLessThan(html.indexOf('u8Mgv2ztXsg'));
  });

  it.each([
    'Texto https://youtu.be/M7lc1UVf-VE',
    '[Video](https://youtu.be/M7lc1UVf-VE)',
    '- https://youtu.be/M7lc1UVf-VE',
    '> https://youtu.be/M7lc1UVf-VE',
    'https://www.youtube.com/channel/M7lc1UVf-VE',
    'https://www.youtube.com/watch?v=M7lc1UVf-VE&list=PL123',
    'https://youtube.example/watch?v=M7lc1UVf-VE',
    'https://youtu.be/short',
    'https://youtu.be/M7lc1UVf-VE/extra',
  ])('does not embed an unsupported context or URL: %s', async (markdown) => {
    expect(await render(markdown)).not.toContain('class="youtube-embed"');
  });
});
