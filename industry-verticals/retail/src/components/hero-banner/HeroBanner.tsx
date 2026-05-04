import {
  Field,
  ImageField,
  LinkField,
  NextImage as ContentSdkImage,
  Text as ContentSdkText,
  RichText as ContentSdkRichText,
  useSitecore,
  Placeholder,
  Link,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import AccentLine from '@/assets/icons/accent-line/AccentLine';
import { CommonStyles, HeroBannerStyles, LayoutStyles } from '@/types/styleFlags';
import clsx from 'clsx';

/** First sentence white, second lime (CareSuper). Supports newline or `Sentence one. Sentence two.` */
function splitCareSuperHeadline(raw: string | undefined): { first: string; second: string } | null {
  if (!raw?.trim()) return null;
  const trimmed = raw.trim();
  const nl = trimmed.indexOf('\n');
  if (nl !== -1) {
    const first = trimmed.slice(0, nl).trim();
    const second = trimmed.slice(nl + 1).trim();
    if (first && second) return { first, second };
  }
  const m = /^(.+?\.\s+)([\s\S]+)$/.exec(trimmed);
  if (m?.[1]?.trim() && m?.[2]?.trim()) {
    return { first: m[1].trim(), second: m[2].trim() };
  }
  return null;
}

function CareSuperHeroTitle({ field, isEditing }: { field: Field<string>; isEditing: boolean }) {
  if (isEditing) {
    return (
      <ContentSdkText
        field={field}
        tag="span"
        className="hero-banner__caresuper-headline-editor block"
      />
    );
  }
  const split = splitCareSuperHeadline(field?.value);
  if (split) {
    return (
      <>
        <span className="hero-banner__caresuper-headline-line hero-banner__caresuper-headline-line--white block">
          {split.first}
        </span>
        <span className="hero-banner__caresuper-headline-line hero-banner__caresuper-headline-line--lime block">
          {split.second}
        </span>
      </>
    );
  }
  return (
    <ContentSdkText
      field={field}
      tag="span"
      className="hero-banner__caresuper-headline-single block text-white"
    />
  );
}

interface Fields {
  Image: ImageField;
  Video: ImageField;
  Title: Field<string>;
  Description: Field<string>;
  CtaLink: LinkField;
}

interface HeroBannerProps extends ComponentProps {
  fields: Fields;
}

const HeroBannerCommon = ({
  params,
  fields,
  children,
}: HeroBannerProps & {
  children: React.ReactNode;
}) => {
  const { page } = useSitecore();
  const { styles, RenderingIdentifier: id } = params;
  const isPageEditing = page.mode.isEditing;
  const hideGradientOverlay = styles?.includes(HeroBannerStyles.HideGradientOverlay);
  const isCareSuperHero = id === 'herobanner1';
  /** CareSuper hero: avoid `md:object-bottom` on wide screens — it crops the top of portrait subjects. */
  const heroMediaObjectClasses = isCareSuperHero
    ? 'object-cover object-[center_top] md:object-[62%_top] lg:object-[56%_top] xl:object-[52%_top]'
    : 'object-cover md:object-bottom';

  if (!fields) {
    return isPageEditing ? (
      <div
        className={clsx(
          'component hero-banner',
          styles,
          isCareSuperHero && 'hero-banner--caresuper'
        )}
        id={id}
      >
        [HERO BANNER]
      </div>
    ) : (
      <></>
    );
  }

  return (
    <div
      className={clsx(
        'component hero-banner relative flex items-center',
        styles,
        isCareSuperHero && 'hero-banner--caresuper'
      )}
      id={id}
    >
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        {isCareSuperHero && <div className="hero-banner__caresuper-blob" aria-hidden />}
        {!isPageEditing && fields?.Video?.value?.src ? (
          <video
            className={clsx(
              'h-full w-full',
              heroMediaObjectClasses,
              isCareSuperHero && 'relative z-[1]'
            )}
            autoPlay
            muted
            loop
            playsInline
            poster={fields.Image?.value?.src}
          >
            <source src={fields.Video?.value?.src} type="video/webm" />
          </video>
        ) : (
          <ContentSdkImage
            field={fields.Image}
            className={clsx(
              'h-full w-full',
              heroMediaObjectClasses,
              isCareSuperHero && 'relative z-[1]'
            )}
            priority
          />
        )}
        {/* Gradient overlay to fade image/video at bottom */}
        {!hideGradientOverlay && (
          <div
            className={clsx(
              'absolute inset-0 bg-gradient-to-b from-transparent from-85% to-white',
              isCareSuperHero && 'z-[2]'
            )}
          ></div>
        )}
      </div>

      {children}
    </div>
  );
};

export const Default = ({ params, fields, rendering }: HeroBannerProps) => {
  const { page } = useSitecore();
  const styles = params.styles || '';
  const hideAccentLine = styles.includes(CommonStyles.HideAccentLine);
  const withPlaceholder = styles.includes(HeroBannerStyles.WithPlaceholder);
  const reverseLayout = styles.includes(LayoutStyles.Reversed);
  const screenLayer = styles.includes(HeroBannerStyles.ScreenLayer);
  const searchBarPlaceholderKey = `hero-banner-search-bar-${params.DynamicPlaceholderId}`;
  const isCareSuperHero = params.RenderingIdentifier === 'herobanner1';

  return (
    <HeroBannerCommon params={params} fields={fields} rendering={rendering}>
      {/* Content Container */}
      <div className="relative w-full">
        <div className="container mx-auto px-4">
          <div
            className={clsx(
              'flex w-full lg:w-1/2 lg:items-center',
              isCareSuperHero
                ? 'min-h-[320px] py-7 md:min-h-[400px] lg:min-h-[500px] lg:py-10 xl:min-h-[560px] xl:py-11'
                : 'min-h-238 py-10',
              reverseLayout ? 'lg:mr-auto' : 'lg:ml-auto'
            )}
          >
            <div className="max-w-182">
              <div
                className={clsx(
                  { shim: screenLayer },
                  isCareSuperHero && 'hero-banner__caresuper-panel'
                )}
              >
                {/* Title */}
                <h1
                  className={clsx(
                    isCareSuperHero
                      ? 'hero-banner__caresuper-headline text-center font-bold normal-case lg:text-left'
                      : 'text-center text-5xl leading-[110%] font-bold capitalize md:text-7xl md:leading-[130%] lg:text-left xl:text-[80px]'
                  )}
                >
                  {isCareSuperHero ? (
                    <CareSuperHeroTitle field={fields.Title} isEditing={page.mode.isEditing} />
                  ) : (
                    <ContentSdkText field={fields.Title} />
                  )}
                  {!hideAccentLine && !isCareSuperHero && (
                    <AccentLine className="mx-auto !h-5 w-[9ch] lg:mx-0" />
                  )}
                </h1>

                {/* Description */}
                <div
                  className={clsx(
                    'mt-7',
                    isCareSuperHero ? 'hero-banner__caresuper-tagline-wrap' : 'text-xl md:text-2xl'
                  )}
                >
                  <ContentSdkRichText
                    field={fields.Description}
                    className={clsx(
                      'text-center lg:text-left',
                      isCareSuperHero && 'hero-banner__caresuper-tagline'
                    )}
                  />
                </div>

                {/* CTA Link or Placeholder */}
                <div className="mt-6 flex w-full justify-center lg:justify-start">
                  {withPlaceholder ? (
                    <Placeholder name={searchBarPlaceholderKey} rendering={rendering} />
                  ) : (
                    <Link field={fields.CtaLink} className="arrow-btn" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HeroBannerCommon>
  );
};

export const TopContent = ({ params, fields, rendering }: HeroBannerProps) => {
  const { page } = useSitecore();
  const styles = params.styles || '';
  const hideAccentLine = styles.includes(CommonStyles.HideAccentLine);
  const withPlaceholder = styles.includes(HeroBannerStyles.WithPlaceholder);
  const reverseLayout = styles.includes(LayoutStyles.Reversed);
  const screenLayer = styles.includes(HeroBannerStyles.ScreenLayer);
  const searchBarPlaceholderKey = `hero-banner-search-bar-${params.DynamicPlaceholderId}`;
  const isCareSuperHero = params.RenderingIdentifier === 'herobanner1';

  return (
    <HeroBannerCommon params={params} fields={fields} rendering={rendering}>
      {/* Content Container */}
      <div className="relative w-full">
        <div
          className={clsx(
            'container mx-auto flex justify-center px-4',
            isCareSuperHero
              ? 'min-h-[320px] md:min-h-[400px] lg:min-h-[500px] xl:min-h-[560px]'
              : 'min-h-238'
          )}
        >
          <div
            className={clsx(
              'flex flex-col items-center',
              isCareSuperHero ? 'py-8 lg:py-14' : 'py-10 lg:py-44',
              reverseLayout ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={clsx(
                { shim: screenLayer },
                isCareSuperHero && 'hero-banner__caresuper-panel'
              )}
            >
              {/* Title */}
              <h1
                className={clsx(
                  isCareSuperHero
                    ? 'hero-banner__caresuper-headline text-center font-bold normal-case'
                    : 'text-center text-5xl leading-[110%] font-bold capitalize md:text-7xl md:leading-[130%] xl:text-[80px]'
                )}
              >
                {isCareSuperHero ? (
                  <CareSuperHeroTitle field={fields.Title} isEditing={page.mode.isEditing} />
                ) : (
                  <ContentSdkText field={fields.Title} />
                )}
                {!hideAccentLine && !isCareSuperHero && (
                  <AccentLine className="mx-auto !h-5 w-[9ch]" />
                )}
              </h1>

              {/* Description */}
              <div
                className={clsx(
                  'mt-7',
                  isCareSuperHero ? 'hero-banner__caresuper-tagline-wrap' : 'text-xl md:text-2xl'
                )}
              >
                <ContentSdkRichText
                  field={fields.Description}
                  className={clsx(
                    'text-center',
                    isCareSuperHero && 'hero-banner__caresuper-tagline'
                  )}
                />
              </div>

              {/* CTA Link or Placeholder */}
              <div className="mt-6 flex w-full justify-center">
                {withPlaceholder ? (
                  <Placeholder name={searchBarPlaceholderKey} rendering={rendering} />
                ) : (
                  <Link field={fields.CtaLink} className="arrow-btn" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </HeroBannerCommon>
  );
};
