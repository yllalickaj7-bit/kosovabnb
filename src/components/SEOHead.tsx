import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  jsonLd?: object | object[];
  noindex?: boolean;
}

export const SEOHead = ({
  title,
  description,
  canonical,
  ogImage = "https://kosovabnb.lovable.app/og-image.jpg",
  ogType = "website",
  jsonLd,
  noindex = false,
}: SEOHeadProps) => {
  useEffect(() => {
    // Title
    document.title = title;

    // Helper to set/create meta tags
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", description);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");

    // Open Graph
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:site_name", "KosovaBnB");
    setMeta("property", "og:locale", "sq_AL");

    // Twitter
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage);

    // Canonical
    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) {
      if (!linkCanonical) {
        linkCanonical = document.createElement("link");
        linkCanonical.setAttribute("rel", "canonical");
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute("href", canonical);
    } else if (linkCanonical) {
      linkCanonical.remove();
    }

    // JSON-LD
    const existingScripts = document.querySelectorAll('script[data-seo-jsonld]');
    existingScripts.forEach((s) => s.remove());

    if (jsonLd) {
      const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      schemas.forEach((schema) => {
        const script = document.createElement("script");
        script.setAttribute("type", "application/ld+json");
        script.setAttribute("data-seo-jsonld", "true");
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
      });
    }

    return () => {
      // Cleanup JSON-LD on unmount
      document.querySelectorAll('script[data-seo-jsonld]').forEach((s) => s.remove());
    };
  }, [title, description, canonical, ogImage, ogType, jsonLd, noindex]);

  return null;
};

// Pre-built JSON-LD generators
export const createOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "KosovaBnB",
  url: "https://kosovabnb.lovable.app",
  logo: "https://kosovabnb.lovable.app/favicon.ico",
  description: "Platforma kryesore për rezervimin e vendbanimeve, eksperiencave dhe shërbimeve në Kosovë.",
  address: {
    "@type": "PostalAddress",
    addressCountry: "XK",
    addressLocality: "Prishtinë",
  },
  sameAs: [],
});

export const createWebSiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "KosovaBnB",
  url: "https://kosovabnb.lovable.app",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://kosovabnb.lovable.app/?search={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
});

export const createBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: item.url,
  })),
});

export const createLocalBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "KosovaBnB",
  url: "https://kosovabnb.lovable.app",
  description: "Platforma për vendbanime, eksperienca dhe shërbime turistike në Kosovë.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Prishtinë",
    addressCountry: "XK",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 42.6629,
    longitude: 21.1655,
  },
  priceRange: "€€",
});

export const createProductSchema = (listing: {
  title: string;
  description?: string | null;
  price: number;
  rating: number;
  images_url: string[];
  location: string;
  id: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: listing.title,
  description: listing.description || `Vendbanim në ${listing.location}`,
  image: listing.images_url?.[0],
  url: `https://kosovabnb.lovable.app/listing/${listing.id}`,
  offers: {
    "@type": "Offer",
    price: listing.price,
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
    priceValidUntil: new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: listing.rating,
    bestRating: 5,
    ratingCount: 24,
  },
});
