import React, { useEffect } from "react";
import { Product } from "../types";

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  product?: Product | null;
  image?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonicalUrl,
  product,
  image
}) => {
  useEffect(() => {
    const siteTitle = product
      ? `${product.name} | Nangsal Apparel`
      : title
      ? `${title} | Nangsal Apparel`
      : "Nangsal Apparel | Luxury Streetwear & Essentials";

    const metaDescription = product
      ? `Buy ${product.name} online at Nangsal Apparel. Price: Rs. ${product.price}. Premium heavy-weight luxury streetwear.`
      : description || "Nangsal Apparel - Luxury Streetwear & Limited Drop Essentials. Discover our exclusive releases and heavy-weight cottons.";

    const pageUrl = canonicalUrl || (product ? `https://nangsalapparel.com/product/${product.id}` : "https://nangsalapparel.com/");
    const ogImage = product?.images?.[0] || image || "https://i.ibb.co/HphLbYyj/nangsal-logo-white-bg.png";

    // Update document title
    document.title = siteTitle;

    // Helper function to update meta tags
    const updateMeta = (selector: string, attribute: string, value: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        const match = selector.match(/\[(name|property)="([^"]+)"\]/);
        if (match) {
          element.setAttribute(match[1], match[2]);
        }
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };

    // Helper function to update link tags
    const updateLink = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", rel);
        document.head.appendChild(link);
      }
      link.setAttribute("href", href);
    };

    // Standard Meta Tags
    updateMeta('meta[name="description"]', 'content', metaDescription);

    // Open Graph Tags
    updateMeta('meta[property="og:title"]', 'content', siteTitle);
    updateMeta('meta[property="og:description"]', 'content', metaDescription);
    updateMeta('meta[property="og:url"]', 'content', pageUrl);
    updateMeta('meta[property="og:image"]', 'content', ogImage);

    // Twitter Tags
    updateMeta('meta[property="twitter:title"]', 'content', siteTitle);
    updateMeta('meta[property="twitter:description"]', 'content', metaDescription);
    updateMeta('meta[property="twitter:url"]', 'content', pageUrl);
    updateMeta('meta[property="twitter:image"]', 'content', ogImage);

    // Canonical Link
    updateLink('canonical', pageUrl);

    // Inject dynamic JSON-LD Structured Data
    const existingScript = document.getElementById("json-ld-structured-data");
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.id = "json-ld-structured-data";
    script.type = "application/ld+json";

    if (product) {
      const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.images || [ogImage],
        "description": metaDescription,
        "sku": product.id,
        "offers": {
          "@type": "Offer",
          "url": pageUrl,
          "priceCurrency": "NPR",
          "price": product.price,
          "availability": product.isSoldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
          "itemCondition": "https://schema.org/NewCondition"
        },
        "brand": {
          "@type": "Brand",
          "name": "Nangsal Apparel"
        }
      };
      script.text = JSON.stringify(productSchema);
    } else {
      const storeSchema = {
        "@context": "https://schema.org",
        "@type": "ClothingStore",
        "name": "Nangsal Apparel",
        "url": "https://nangsalapparel.com/",
        "logo": "https://i.ibb.co/HphLbYyj/nangsal-logo-white-bg.png",
        "image": ogImage,
        "description": metaDescription
      };
      script.text = JSON.stringify(storeSchema);
    }

    document.head.appendChild(script);

    return () => {
      // Optional cleanup if component unmounts
    };
  }, [title, description, canonicalUrl, product, image]);

  return null;
};
