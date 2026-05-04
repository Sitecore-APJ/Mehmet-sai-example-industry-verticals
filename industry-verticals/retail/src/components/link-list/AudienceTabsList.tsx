'use client';

import { Link as ContentSdkLink, LinkField } from '@sitecore-content-sdk/nextjs';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

const PLACEHOLDER_ORIGIN = 'https://placeholder.local';

function linkPath(href: string | undefined): string {
  if (!href) return '';
  try {
    const u = new URL(href, PLACEHOLDER_ORIGIN);
    return u.pathname.replace(/\/$/, '') || '/';
  } catch {
    const path = href.split('?')[0]?.split('#')[0] ?? '';
    if (path.startsWith('/')) {
      return path.replace(/\/$/, '') || '/';
    }
    return '';
  }
}

/** Align `/en/...` with CMS links that omit the locale (`/...`). */
function stripLocalePrefix(path: string): string {
  const trimmed = path.replace(/\/$/, '') || '/';
  const without = trimmed.replace(/^\/[a-z]{2}(?:-[a-zA-Z0-9]+)?(?=\/|$)/i, '');
  const next = without === '' ? '/' : without.startsWith('/') ? without : `/${without}`;
  return next.replace(/\/$/, '') || '/';
}

function normalizedMatchPath(path: string): string {
  return stripLocalePrefix(path).toLowerCase();
}

/**
 * Pick the tab whose href matches the current URL (exact or longest prefix),
 * after normalizing locale so `/en/Landing-Pages/Advisers` matches `/Landing-Pages/Advisers`.
 */
function activeAudienceTabIndex(items: LinkField[], pathname: string): number {
  const cp = normalizedMatchPath(pathname || '/');
  let bestIdx = -1;
  let bestLen = -1;

  items.forEach((field, index) => {
    const href = field?.value?.href;
    if (!href) return;
    const hp = normalizedMatchPath(linkPath(href));
    if (!hp) return;

    const exact = hp === cp;
    const prefixChild = hp !== '/' && cp.startsWith(`${hp}/`);
    if (!exact && !prefixChild) return;

    if (hp.length > bestLen) {
      bestLen = hp.length;
      bestIdx = index;
    }
  });

  return bestIdx >= 0 ? bestIdx : 0;
}

export function AudienceTabsList({ items }: { items: LinkField[] }) {
  const pathname = usePathname() ?? '/';

  const activeIndex = useMemo(
    () => activeAudienceTabIndex(items, pathname),
    [items, pathname]
  );

  return (
    <ul className="link-list__audience-tabs-list">
      {items.map((field, index) => {
        const key = `${index}-${field?.value?.id ?? field?.value?.href ?? index}`;
        const isActive = index === activeIndex;
        const classNames = [
          'link-list__audience-tabs-item',
          `item${index}`,
          index % 2 === 0 ? 'odd' : 'even',
          index === 0 ? 'first' : '',
          index === items.length - 1 ? 'last' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <li key={key} className={classNames}>
            <div className="field-link">
              <ContentSdkLink
                field={field}
                className={clsx(
                  'link-list__audience-tab-anchor',
                  isActive && 'link-list__audience-tab-anchor--active'
                )}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
