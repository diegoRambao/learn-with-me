export type MarkdownCommand =
  | 'heading'
  | 'bold'
  | 'italic'
  | 'unordered-list'
  | 'ordered-list'
  | 'link'
  | 'inline-code'
  | 'code-block'
  | 'image'
  | 'video';

export type MarkdownEdit = Readonly<{
  value: string;
  selectionStart: number;
  selectionEnd: number;
}>;

const replaceSelection = (
  value: string,
  selectionStart: number,
  selectionEnd: number,
  replacement: string,
  selectedOffset = 0,
  selectedLength = replacement.length,
): MarkdownEdit => ({
  value: `${value.slice(0, selectionStart)}${replacement}${value.slice(selectionEnd)}`,
  selectionStart: selectionStart + selectedOffset,
  selectionEnd: selectionStart + selectedOffset + selectedLength,
});

const prefixLines = (selected: string, prefix: (index: number) => string): string =>
  selected.split('\n').map((line, index) => `${prefix(index)}${line}`).join('\n');

export const applyMarkdownCommand = (
  value: string,
  selectionStart: number,
  selectionEnd: number,
  command: MarkdownCommand,
  detail = '',
): MarkdownEdit => {
  const selected = value.slice(selectionStart, selectionEnd);
  const fallback = selected || ({
    heading: 'Título', bold: 'texto', italic: 'texto', 'unordered-list': 'elemento', 'ordered-list': 'elemento',
    link: 'texto del enlace', 'inline-code': 'código', 'code-block': 'código', image: 'Texto alternativo', video: '',
  } satisfies Record<MarkdownCommand, string>)[command];

  if (command === 'heading') return replaceSelection(value, selectionStart, selectionEnd, `## ${fallback}`, 3, fallback.length);
  if (command === 'bold') return replaceSelection(value, selectionStart, selectionEnd, `**${fallback}**`, 2, fallback.length);
  if (command === 'italic') return replaceSelection(value, selectionStart, selectionEnd, `*${fallback}*`, 1, fallback.length);
  if (command === 'unordered-list') return replaceSelection(value, selectionStart, selectionEnd, prefixLines(fallback, () => '- '));
  if (command === 'ordered-list') return replaceSelection(value, selectionStart, selectionEnd, prefixLines(fallback, (index) => `${index + 1}. `));
  if (command === 'link') return replaceSelection(value, selectionStart, selectionEnd, `[${fallback}](${detail || 'https://'})`, 1, fallback.length);
  if (command === 'inline-code') return replaceSelection(value, selectionStart, selectionEnd, `\`${fallback}\``, 1, fallback.length);
  if (command === 'code-block') return replaceSelection(value, selectionStart, selectionEnd, `\`\`\`\n${fallback}\n\`\`\``, 4, fallback.length);
  if (command === 'image') return replaceSelection(value, selectionStart, selectionEnd, `![${fallback}](${detail || 'assets/imagen.png'})`, 2, fallback.length);
  return replaceSelection(value, selectionStart, selectionEnd, `${detail || 'https://youtu.be/M7lc1UVf-VE'}\n`);
};
