import { HeroBlock } from "./blocks/HeroBlock";
import { CollectionBlock } from "./blocks/CollectionBlock";
import { TextBlock } from "./blocks/TextBlock";
import { ProductGridBlock } from "./blocks/ProductGridBlock";
import { TestimonialBlock } from "./blocks/TestimonialBlock";
import type { StorefrontSection } from "../lib/storefront";
import type { Lang, Product } from "../types";

interface BlockRendererProps {
  section: StorefrontSection;
  lang: Lang;
  products?: Product[];
}

const BLOCK_MAP: Record<
  string,
  React.ComponentType<BlockRendererProps>
> = {
  hero:                HeroBlock,
  collection_banner:   CollectionBlock,
  text_block:          TextBlock,
  product_grid:        ProductGridBlock,
  testimonial_strip:   TestimonialBlock,
};

import React from "react";

/**
 * BlockRenderer — maps a StorefrontSection's `type` to the corresponding
 * React block component. Unknown types are silently skipped.
 */
export default function BlockRenderer({ section, lang, products }: BlockRendererProps) {
  const Block = BLOCK_MAP[section.type];
  if (!Block) return null;
  return <Block section={section} lang={lang} products={products} />;
}
