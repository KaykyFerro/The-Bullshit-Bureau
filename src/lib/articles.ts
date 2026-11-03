export type Section = 'noticias' | 'artigos' | 'editoriais' | 'opiniao';

export interface PostFrontmatter {
  title: string;
  slug: string;
  subtitle?: string;
  excerpt: string;
  section: Section;
  category: string;
  author: string;
  publishedAt: string | Date;
  status: 'draft' | 'published';
  featured?: boolean;
  cover?: string;
  coverAlt?: string;
}

export interface MarkdownPost {
  frontmatter: PostFrontmatter;
  Content: any;
  file: string;
  compiledContent: () => Promise<string>;
}

const modules = import.meta.glob<MarkdownPost>('../content/noticias/*.md', {
  eager: true
});

const allPosts = Object.entries(modules).map(([file, module]) => ({
  ...module,
  file
}));

export const publishedPosts = allPosts
  .filter(({ frontmatter }) => frontmatter.status === 'published')
  .sort((a, b) => {
    const dateA = a.frontmatter.publishedAt instanceof Date
      ? a.frontmatter.publishedAt.getTime()
      : new Date(a.frontmatter.publishedAt).getTime();
    const dateB = b.frontmatter.publishedAt instanceof Date
      ? b.frontmatter.publishedAt.getTime()
      : new Date(b.frontmatter.publishedAt).getTime();
    return dateB - dateA;
  });

export function postHref(post: MarkdownPost): string {
  return `${import.meta.env.BASE_URL}${post.frontmatter.section}/${post.frontmatter.slug}/`;
}

export function assetPath(path: string): string {
  if (/^(?:[a-z][a-z0-9+.-]*:)?\\/\\//i.test(path) || path.startsWith('data:')) {
    return path;
  }

  return `${import.meta.env.BASE_URL}${path.replace(/^\\/+/, '')}`;
}

export function categorySlug(category: string): string {
  return category
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatDate(value: string | Date): string {
  const date = value instanceof Date
    ? value
    : new Date(`${String(value).slice(0, 10)}T12:00:00`);

  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export const categories = [...new Set(
  publishedPosts.map((post) => post.frontmatter.category).filter(Boolean)
)].sort((a, b) => a.localeCompare(b, 'pt-BR'));
