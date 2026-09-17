type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

const videoIdPattern = /^[A-Za-z0-9_-]{11}$/;
const youtubeHosts = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com']);

const videoIdFromUrl = (href: string): string | null => {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.searchParams.has('list')) return null;

  let videoId: string | null = null;
  if (url.hostname === 'youtu.be' && url.pathname.split('/').filter(Boolean).length === 1) {
    videoId = url.pathname.slice(1);
  } else if (youtubeHosts.has(url.hostname)) {
    const segments = url.pathname.split('/').filter(Boolean);
    if (url.pathname === '/watch') videoId = url.searchParams.get('v');
    if (segments.length === 2 && ['shorts', 'embed'].includes(segments[0])) videoId = segments[1];
  }
  return videoId && videoIdPattern.test(videoId) ? videoId : null;
};

const embeddedVideo = (videoId: string): HastNode => {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  return {
    type: 'element',
    tagName: 'figure',
    properties: { className: ['youtube-embed'] },
    children: [
      {
        type: 'element',
        tagName: 'div',
        properties: { className: ['youtube-embed-frame'] },
        children: [{
          type: 'element',
          tagName: 'iframe',
          properties: {
            src: `https://www.youtube-nocookie.com/embed/${videoId}`,
            title: 'Video complementario de YouTube',
            loading: 'lazy',
            allow: 'accelerometer; encrypted-media; gyroscope; picture-in-picture',
            allowFullScreen: true,
          },
          children: [],
        }],
      },
      {
        type: 'element',
        tagName: 'figcaption',
        properties: {},
        children: [
          { type: 'text', value: 'Si el reproductor no está disponible, ' },
          {
            type: 'element',
            tagName: 'a',
            properties: { href: watchUrl, target: '_blank', rel: ['noopener', 'noreferrer'] },
            children: [{ type: 'text', value: 'abre el video directamente en YouTube' }],
          },
          { type: 'text', value: '.' },
        ],
      },
    ],
  };
};

const standaloneVideoId = (node: HastNode): string | null => {
  if (node.tagName !== 'p' || node.children?.length !== 1) return null;
  const link = node.children[0];
  if (link.tagName !== 'a' || link.children?.length !== 1 || link.children[0].type !== 'text') return null;
  const href = link.properties?.href;
  if (typeof href !== 'string' || link.children[0].value !== href) return null;
  return videoIdFromUrl(href);
};

export default function rehypeYouTubeEmbeds(): (tree: HastNode) => void {
  return (tree) => {
    if (!Array.isArray(tree.children)) return;
    tree.children = tree.children.map((node) => {
      const videoId = standaloneVideoId(node);
      return videoId ? embeddedVideo(videoId) : node;
    });
  };
}
