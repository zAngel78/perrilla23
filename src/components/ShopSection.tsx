import React from 'react';
import { FortniteItem } from '../types';
import { FortniteItemCard } from './FortniteItemCard';
import { BundleCard } from './BundleCard';

interface ShopSectionProps {
  title: string;
  items: FortniteItem[];
  bundleEntries?: any[];
  isBundle?: boolean;
}

export const ShopSection: React.FC<ShopSectionProps> = ({ title, items, bundleEntries, isBundle = false }) => {
  if (items.length === 0 && (!bundleEntries || bundleEntries.length === 0)) return null;

  // Deduplicate bundles - keep the one with the best image/data
  let uniqueBundles = bundleEntries || [];
  if (bundleEntries && bundleEntries.length > 0) {
    const bundleMap = new Map<string, any>();

    bundleEntries.forEach((entry, index) => {
      // Create a unique key based on bundle name
      const bundleName = entry.bundle?.name || entry.offerId || `bundle-${index}`;

      const existing = bundleMap.get(bundleName);

      if (!existing) {
        // First time seeing this bundle name
        bundleMap.set(bundleName, entry);
      } else {
        // Duplicate found - keep the better one
        const existingHasImage = !!existing.bundle?.image;
        const newHasImage = !!entry.bundle?.image;
        const existingItemCount = existing.bundle?.items?.length || 0;
        const newItemCount = entry.bundle?.items?.length || 0;

        // Priority 1: Has bundle image
        // Priority 2: Has more items
        if (!existingHasImage && newHasImage) {
          bundleMap.set(bundleName, entry);
        } else if (existingHasImage === newHasImage && newItemCount > existingItemCount) {
          bundleMap.set(bundleName, entry);
        }
      }
    });

    uniqueBundles = Array.from(bundleMap.values());
  }

  // Extract individual items from bundles
  const individualBundleItems: any[] = [];
  const bundleItemIds = new Set<string>(); // Track IDs of items already in bundles

  if (uniqueBundles && uniqueBundles.length > 0) {
    uniqueBundles.forEach((bundleEntry) => {
      if (bundleEntry.bundle?.items && Array.isArray(bundleEntry.bundle.items)) {
        bundleEntry.bundle.items.forEach((item: any) => {
          const itemId = item.id || `${bundleEntry.offerId}-${item.name}`;
          bundleItemIds.add(itemId); // Track this item ID

          individualBundleItems.push({
            id: itemId,
            name: item.name,
            description: item.description || '',
            type: item.type?.displayValue || item.type?.value || 'Item',
            rarity: item.rarity?.value?.toLowerCase() || 'common',
            price: 0, // Individual items don't have separate prices
            image: item.images?.icon || item.images?.featured || item.images?.smallIcon || ''
          });
        });
      }
    });
  }

  // Get bundle names to check for duplicates
  const bundleNames = new Set<string>();
  uniqueBundles.forEach(bundle => {
    if (bundle.bundle?.name) {
      bundleNames.add(bundle.bundle.name);
    }
  });

  // Filter out items that are already in bundles (to avoid duplicates)
  const regularItems = items.filter(item => {
    // Exclude if it's a bundle itself
    if (uniqueBundles?.some(b => b.offerId === item.id)) return false;

    // Exclude if this item is already extracted from a bundle
    if (bundleItemIds.has(item.id)) return false;

    // Exclude if this item has the same name as a bundle
    if (bundleNames.has(item.name)) {
      return false;
    }

    return true;
  });

  // Calculate total count (bundles + individual items from bundles + regular items)
  const totalCount = (uniqueBundles?.length || 0) + individualBundleItems.length + regularItems.length;

  return (
    <div className="mb-8 sm:mb-10 lg:mb-12">
      {/* Section Header */}
      <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 px-2 sm:px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
          {title} <span className="text-brand-green text-lg sm:text-xl md:text-2xl lg:text-3xl">({totalCount})</span>
        </h2>
      </div>

      {/* Grid Container */}
      <div className="px-2 sm:px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Render bundles first */}
          {uniqueBundles && uniqueBundles.map((entry, idx) => (
            <BundleCard key={entry.offerId || idx} bundle={entry} index={idx} />
          ))}

          {/* Render individual items from bundles */}
          {individualBundleItems.map((item, idx) => (
            <FortniteItemCard key={item.id || idx} item={item} index={(uniqueBundles?.length || 0) + idx} />
          ))}

          {/* Render regular items (excluding bundles and items already in bundles) */}
          {regularItems.map((item, idx) => (
            <FortniteItemCard key={item.id} item={item} index={(uniqueBundles?.length || 0) + individualBundleItems.length + idx} />
          ))}
        </div>
      </div>
    </div>
  );
};
