import { useEffect } from 'react';

const SITE_URL = 'https://eclipse-tattoos-and-piercings.lovable.app';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

interface PageSeoOptions {
  title: string;
  description: string;
  path: string;
  image?: string;
  /** JSON-LD objects scoped to this route */
  jsonLd?: Record<string, unknown>[];
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function usePageSeo({ title, description, path, image, jsonLd }: PageSeoOptions) {
  const ldKey = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    const url = `${SITE_URL}${path}`;
    const ogImage = image ?? DEFAULT_OG_IMAGE;

    document.title = title;
    setMeta('name', 'description', description);
    setLink('canonical', url);

    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:image', ogImage);

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', ogImage);

    const scripts: HTMLScriptElement[] = [];
    const blocks: Record<string, unknown>[] = ldKey ? JSON.parse(ldKey) : [];
    blocks.forEach((block) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.routeSchema = 'true';
      script.text = JSON.stringify(block);
      document.head.appendChild(script);
      scripts.push(script);
    });

    return () => {
      scripts.forEach((script) => script.remove());
    };
  }, [title, description, path, image, ldKey]);
}

export { SITE_URL };
