import * as React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEO: React.FC<SEOProps> = ({ 
  title = "Takwira.com | Réserve ton terrain de foot en Tunisie", 
  description = "La plateforme n°1 en Tunisie pour réserver des terrains de football, rejoindre des matchs ouverts et participer à des tournois.",
  image = "https://takwira.com/og-image.jpg",
  url = "https://takwira.com",
  type = "website"
}) => {
  const siteTitle = title.includes("Takwira") ? title : `${title} | Takwira.com`;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
};
