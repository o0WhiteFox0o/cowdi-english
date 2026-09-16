/**
 * useSEO — Dynamic SEO meta tag management for Cowdi English SPA
 *
 * Cập nhật <title>, <meta name="description">, Open Graph tags,
 * Twitter Card tags, và canonical URL theo từng route/page.
 *
 * Không cần SSR. Google Bot (Chromium-based) sẽ execute JS và đọc được.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BASE_URL = 'https://cowdi.net';
const DEFAULT_IMAGE = `${BASE_URL}/pwa-512x512.png`;
const SITE_NAME = 'Cowdi English';

/**
 * Helper: tạo hoặc update một thẻ <meta> trong <head>
 */
function setMeta(selector, attribute, value) {
  if (!value) return;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    // Phân tích selector để set đúng attribute
    if (selector.includes('property=')) {
      el.setAttribute('property', selector.match(/property="([^"]+)"/)[1]);
    } else if (selector.includes('name=')) {
      el.setAttribute('name', selector.match(/name="([^"]+)"/)[1]);
    }
    document.head.appendChild(el);
  }
  el.setAttribute(attribute, value);
}

/**
 * Helper: tạo hoặc update canonical link
 */
function setCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * useSEO hook
 *
 * @param {Object} options
 * @param {string} [options.title]           - Tiêu đề trang (bỏ qua suffix site name nếu đã có)
 * @param {string} [options.description]     - Meta description (tối đa 160 ký tự)
 * @param {string} [options.ogImage]         - URL ảnh Open Graph
 * @param {string} [options.ogType]          - OG type: 'website' | 'article' (default: 'website')
 * @param {string} [options.canonicalPath]   - Path tùy chỉnh cho canonical (default: location.pathname)
 * @param {boolean} [options.noindex]        - Nếu true, set robots=noindex (VD: /admin, /auth-callback)
 * @param {string} [options.keywords]        - Meta keywords
 */
export function useSEO({
  title,
  description,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  canonicalPath,
  noindex = false,
  keywords,
} = {}) {
  const location = useLocation();

  useEffect(() => {
    const path = canonicalPath ?? location.pathname;
    const canonicalUrl = `${BASE_URL}${path}`;
    const pageUrl = `${BASE_URL}${location.pathname}${location.search}`;

    // ── <title> ────────────────────────────────────────────────────────
    if (title) {
      document.title = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;
    }

    // ── Meta description ────────────────────────────────────────────────
    if (description) {
      setMeta('meta[name="description"]', 'content', description);
    }

    // ── Keywords ────────────────────────────────────────────────────────
    if (keywords) {
      setMeta('meta[name="keywords"]', 'content', keywords);
    }

    // ── Robots ──────────────────────────────────────────────────────────
    setMeta('meta[name="robots"]', 'content', noindex ? 'noindex, nofollow' : 'index, follow');

    // ── Canonical ───────────────────────────────────────────────────────
    setCanonical(canonicalUrl);

    // ── Open Graph ──────────────────────────────────────────────────────
    setMeta('meta[property="og:title"]',       'content', title || document.title);
    setMeta('meta[property="og:description"]', 'content', description || '');
    setMeta('meta[property="og:image"]',       'content', ogImage);
    setMeta('meta[property="og:url"]',         'content', pageUrl);
    setMeta('meta[property="og:type"]',        'content', ogType);
    setMeta('meta[property="og:site_name"]',   'content', SITE_NAME);
    setMeta('meta[property="og:locale"]',      'content', 'vi_VN');

    // ── Twitter Card ────────────────────────────────────────────────────
    setMeta('meta[name="twitter:card"]',        'content', 'summary_large_image');
    setMeta('meta[name="twitter:title"]',       'content', title || document.title);
    setMeta('meta[name="twitter:description"]', 'content', description || '');
    setMeta('meta[name="twitter:image"]',       'content', ogImage);

  }, [title, description, ogImage, ogType, canonicalPath, noindex, keywords, location]);
}

/**
 * usePageSEO — Shorthand: nhận trực tiếp key từ SEO_CONFIGS
 *
 * Usage:
 *   import { usePageSEO } from '../hooks/useSEO';
 *   import { SEO_CONFIGS } from '../data/seo-config';
 *   // Trong component:
 *   usePageSEO(SEO_CONFIGS['/lessons']);
 */
export function usePageSEO(config) {
  useSEO(config ?? {});
}

export default useSEO;
