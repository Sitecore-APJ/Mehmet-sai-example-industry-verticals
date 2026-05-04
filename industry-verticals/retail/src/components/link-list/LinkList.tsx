import React from 'react';
import { Link as ContentSdkLink, Text, LinkField, TextField } from '@sitecore-content-sdk/nextjs';
import {
  BadgeCheck,
  ChevronRight,
  List,
  PieChart,
  Sparkles,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import clsx from 'clsx';
import { ComponentProps } from 'lib/component-props';
import { AudienceTabsList } from './AudienceTabsList';

const QUICK_BAR_ICONS: LucideIcon[] = [Sparkles, Wallet, PieChart, BadgeCheck, List];

function QuickBarIcon({ index }: { index: number }) {
  const Icon = QUICK_BAR_ICONS[index % QUICK_BAR_ICONS.length];
  return (
    <Icon className="link-list__quick-bar-icon size-5 shrink-0" strokeWidth={1.5} aria-hidden />
  );
}

interface LinkListProps extends ComponentProps {
  fields: {
    /**
     * The Integrated graphQL query result. This illustrates the way to access the datasource children.
     */
    data: {
      datasource: {
        children: {
          results: Array<{
            field: {
              link: LinkField;
            };
          }>;
        };
        field: {
          title: TextField;
        };
      };
    };
  };
}

const LinkListItem = ({
  index,
  total,
  field,
  variant,
}: {
  index: number;
  total: number;
  field: LinkField;
  variant: 'default' | 'quick-bar';
}) => {
  const classNames = [
    `item${index}`,
    index % 2 === 0 ? 'odd' : 'even',
    index === 0 ? 'first' : '',
    index === total - 1 ? 'last' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const label =
    field?.value?.text?.trim() ||
    field?.value?.displayName?.trim() ||
    field?.value?.anchor?.trim() ||
    '';

  if (variant === 'quick-bar') {
    return (
      <li className={classNames}>
        <div className="field-link">
          <ContentSdkLink field={field} className="link-list__quick-bar-anchor">
            <QuickBarIcon index={index} />
            <span className="link-list__quick-bar-label">{label}</span>
            <ChevronRight
              className="link-list__quick-bar-chevron size-4 shrink-0"
              strokeWidth={2}
              aria-hidden
            />
          </ContentSdkLink>
        </div>
      </li>
    );
  }

  return (
    <li className={classNames}>
      <div className="field-link">
        <ContentSdkLink field={field} />
      </div>
    </li>
  );
};

export const Default = ({ params, fields }: LinkListProps) => {
  const datasource = fields?.data?.datasource;
  const renderingId = params.RenderingIdentifier ?? '';
  const isQuickBar = renderingId === 'linklist1';
  const isAudienceTabs = renderingId.toLowerCase() === 'linklist2';
  const styles = clsx(
    'component link-list',
    params.styles,
    isQuickBar && 'link-list--quick-bar',
    isAudienceTabs && 'link-list--audience-tabs'
  );
  const id = params.RenderingIdentifier;

  const renderContent = () => {
    if (!datasource) {
      return <h3>Link List</h3>;
    }

    const filtered = datasource.children.results.filter((element) => element?.field?.link);
    const variant = isQuickBar ? 'quick-bar' : 'default';

    if (isAudienceTabs) {
      const links = filtered.map((el) => el.field.link);
      return (
        <>
          <Text tag="h3" field={datasource.field?.title} />
          <AudienceTabsList items={links} />
        </>
      );
    }

    const links = filtered.map((element, index) => (
      <LinkListItem
        key={`${index}-${element.field?.link?.value?.id ?? element.field?.link?.value?.href ?? index}`}
        index={index}
        total={filtered.length}
        field={element.field.link}
        variant={variant}
      />
    ));

    return (
      <>
        <Text tag="h3" field={datasource.field?.title} />
        <ul>{links}</ul>
      </>
    );
  };

  return (
    <div className={styles} id={id}>
      <div className="component-content">{renderContent()}</div>
    </div>
  );
};
