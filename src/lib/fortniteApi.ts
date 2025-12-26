import axios from 'axios';
import { FortniteItem } from "../types";
import { apiService } from '../services/api.service';
import { API_ENDPOINTS, buildBackendUrl } from '../config/api.config';

// Mantener FORTNITE_SHOP_ENDPOINT para usar con axios si es necesario
// pero ahora usa la configuración centralizada
const FORTNITE_SHOP_ENDPOINT = buildBackendUrl(API_ENDPOINTS.FORTNITE.SHOP);

// Rarity mapping from API to our app
const rarityMap: Record<string, string> = {
  'common': 'common',
  'uncommon': 'uncommon',
  'rare': 'rare',
  'epic': 'epic',
  'legendary': 'legendary',
  'marvel': 'legendary',
  'dc': 'legendary',
  'icon': 'legendary',
  'starwars': 'legendary',
  'gaminglegends': 'legendary'
};

// Type mapping
const typeMap: Record<string, string> = {
  'outfit': 'Outfit',
  'backpack': 'Back Bling',
  'pickaxe': 'Pickaxe',
  'glider': 'Glider',
  'emote': 'Emote',
  'wrap': 'Wrap',
  'music': 'Music',
  'sparks_song': 'Music',
  'loadingscreen': 'Loading Screen',
  'bundle': 'Bundle',
  'picos': 'Pickaxe',
  'gesto': 'Emote',
  'traje': 'Outfit',
  'música': 'Music'
};

export interface FortniteShopSections {
  featured: FortniteItem[];
  daily: FortniteItem[];
  special: FortniteItem[];
  bundles: FortniteItem[];
  bundleEntries: any[]; // Raw bundle entries with full data
  all: FortniteItem[];
}

export const getFortniteShop = async (): Promise<FortniteShopSections> => {
  try {
    // Usar apiService centralizado en lugar de axios directo
    const shopData = await apiService.get<any>(
      API_ENDPOINTS.FORTNITE.SHOP,
      { skipAuth: true }
    );
    const featured: FortniteItem[] = [];
    const daily: FortniteItem[] = [];
    const special: FortniteItem[] = [];
    const bundles: FortniteItem[] = [];
    const bundleEntries: any[] = [];
    const all: FortniteItem[] = [];

    // Process all entries and categorize by section/layout
    if (shopData.entries && Array.isArray(shopData.entries)) {
      // Group by unique layouts first to understand structure
      const layoutGroups: Record<string, any[]> = {};
      
      shopData.entries.forEach((entry: any) => {
        const layoutName = entry.layout?.name || 'Unknown';
        if (!layoutGroups[layoutName]) {
          layoutGroups[layoutName] = [];
        }
        layoutGroups[layoutName].push(entry);
      });

      // Process all entries
      shopData.entries.forEach((entry: any) => {
        const transformed = transformNewItem(entry);
        all.push(transformed);

        const layoutName = entry.layout?.name?.toLowerCase() || '';
        const sectionIndex = entry.layout?.index || 0;
        
        // Detect real bundles (have bundle object OR "Bundle" in devName AND not just items with accessories)
        const isRealBundle = entry.bundle || (entry.devName?.includes('Bundle') && entry.brItems?.length === 0);
        
        // Separate bundles
        if (isRealBundle) {
          bundles.push(transformed);
          bundleEntries.push(entry); // Keep raw entry for bundle display
        }
        
        // Categorize based on layout name and index
        if (sectionIndex <= 5 || layoutName.includes('featured') || layoutName.includes('battle')) {
          featured.push(transformed);
        } else if (layoutName.includes('jam') || layoutName.includes('track') || layoutName.includes('music')) {
          special.push(transformed);
        } else {
          daily.push(transformed);
        }
      });
    }

    console.log(`Loaded Fortnite shop - Featured: ${featured.length}, Daily: ${daily.length}, Special: ${special.length}, Bundles: ${bundles.length}, Total: ${all.length}`);
    
    return { featured, daily, special, bundles, bundleEntries, all };

  } catch (error) {
    console.error('Error fetching Fortnite shop:', error);
    
    // Return mock data as fallback
    console.warn('Using fallback mock data');
    const mockItems = getMockData();
    return {
      featured: mockItems.slice(0, 3),
      daily: mockItems.slice(3, 6),
      special: [],
      bundles: [],
      bundleEntries: [],
      all: mockItems
    };
  }
};

// Transform new fortnite-api.com entry to our FortniteItem type
function transformNewItem(entry: any): FortniteItem {
  // Get item from brItems (Battle Royale items), tracks (Jam Tracks), or bundle
  const item = entry.brItems?.[0] || entry.items?.[0] || {};
  const bundle = entry.bundle;
  const track = entry.tracks?.[0];
  
  // Get name - prioritize bundle name
  let name = bundle?.name || item.name || track?.title || 'Unknown Item';
  if (!name || name === 'Unknown Item') {
    if (entry.devName) {
      // Parse devName like "[VIRTUAL]1 x Guild for 800 MtxCurrency"
      const match = entry.devName.match(/\d+\s*x\s*([^,]+?)(?:\s+for\s+|\s*,)/i);
      if (match && match[1]) {
        name = match[1].trim();
      }
    }
  }
  
  // Get description
  let description = item.description || '';
  if (bundle) {
    description = bundle.info || `Bundle with ${bundle.items?.length || 0} items`;
  } else if (track) {
    description = `${track.artist} - ${track.releaseYear || 'N/A'}`;
  }
  
  // Get type
  let type = item.type?.displayValue || item.type?.value || 'Item';
  if (bundle) {
    type = 'Bundle';
  } else if (track) {
    type = 'Jam Track';
  }
  
  // Get rarity
  const rarityValue = item.rarity?.value || 'common';
  const rarity = rarityMap[rarityValue.toLowerCase()] || 'common';
  
  // Get price
  const price = entry.finalPrice || 0;
  
  // Get image - multiple fallbacks for maximum coverage
  let image = '';
  
  // Priority 0: Jam Track album art
  if (track?.albumArt) {
    image = track.albumArt;
  }
  // Priority 1: brItems images
  else if (item.images?.icon) {
    image = item.images.icon;
  } else if (item.images?.featured) {
    image = item.images.featured;
  } else if (item.images?.smallIcon) {
    image = item.images.smallIcon;
  }
  // Priority 2: newDisplayAsset renderImages
  else if (entry.newDisplayAsset?.renderImages?.[0]?.image) {
    image = entry.newDisplayAsset.renderImages[0].image;
  }
  // Priority 3: newDisplayAsset materialInstances
  else if (entry.newDisplayAsset?.materialInstances?.[0]?.images?.OfferImage) {
    image = entry.newDisplayAsset.materialInstances[0].images.OfferImage;
  }
  // Priority 4: bundle
  else if (bundle?.image) {
    image = bundle.image;
  }
  
  // Fallback placeholder if no image (should be rare now)
  if (!image) {
    console.warn('⚠️ Item without image:', {
      name: name,
      type: type,
      offerId: entry.offerId,
      devName: entry.devName,
      hasBrItems: !!entry.brItems,
      brItemsLength: entry.brItems?.length || 0,
      hasNewDisplayAsset: !!entry.newDisplayAsset,
      hasRenderImages: !!entry.newDisplayAsset?.renderImages,
      renderImagesLength: entry.newDisplayAsset?.renderImages?.length || 0,
      hasBundle: !!entry.bundle,
      itemImages: item.images ? Object.keys(item.images) : 'none'
    });
    console.log('📦 Full entry:', entry);
    
    const typeColors: Record<string, string> = {
      'outfit': '4A90E2',
      'emote': 'F5C259',
      'pickaxe': '94C11F',
      'glider': 'ED764E',
      'wrap': 'A855F7',
      'bundle': 'EC4899'
    };
    
    const typeKey = type.toLowerCase();
    const color = typeColors[typeKey] || '6B7280';
    image = `https://placehold.co/512x512/${color}/ffffff?text=${encodeURIComponent(type)}`;
  }
  
  return {
    id: item.id || entry.offerId || `item-${Date.now()}-${Math.random()}`,
    name: name,
    description: description,
    type: type,
    rarity: rarity,
    price: price,
    image: image
  };
}

// Legacy transform function (keeping for compatibility)
function transformItem(item: any): FortniteItem {
  const rarity = item.rarity?.id || 'common';
  const mainType = item.mainType || item.displayType || 'outfit';
  
  // Get name from different sources
  let name = 'Unknown Item';
  
  if (item.displayName && item.displayName.trim() !== '') {
    name = item.displayName;
  } else if (item.name && item.name.trim() !== '') {
    name = item.name;
  } else if (item.devName) {
    // Parse devName like "[VIRTUAL]1 x Playboi Carti, 1 x Carti Spinner for -1 MtxCurrency"
    // Extract the main item name
    const match = item.devName.match(/\d+\s*x\s*([^,]+)/);
    if (match && match[1]) {
      name = match[1].trim().replace(/\s+for\s+.+$/i, '');
    }
  } else if (item.granted && item.granted.length > 0 && item.granted[0].name) {
    name = item.granted[0].name;
  } else if (item.section?.name) {
    name = `${item.section.name} ${item.displayType || 'Item'}`;
  }
  
  // Get image from different possible sources
  let image = '';
  
  // Priority 1: displayAssets with url
  if (item.displayAssets && item.displayAssets.length > 0 && item.displayAssets[0].url) {
    image = item.displayAssets[0].url;
  } 
  // Priority 2: displayAssets with background
  else if (item.displayAssets && item.displayAssets.length > 0 && item.displayAssets[0].background) {
    image = item.displayAssets[0].background;
  }
  // Priority 3: granted items with icon
  else if (item.granted && item.granted.length > 0 && item.granted[0].images?.icon) {
    image = item.granted[0].images.icon;
  }
  // Priority 4: granted items with background
  else if (item.granted && item.granted.length > 0) {
    const grantedImages = item.granted[0].images;
    image = grantedImages?.featured || grantedImages?.background || grantedImages?.icon_background || '';
  }
  // Priority 5: newDisplayAsset
  else if (item.newDisplayAsset?.materialInstances?.[0]?.images?.Background) {
    image = item.newDisplayAsset.materialInstances[0].images.Background;
  }
  // Priority 6: Direct images property
  else if (item.images?.icon) {
    image = item.images.icon;
  }
  // Priority 7: Use mainId to construct URL
  else if (item.mainId) {
    image = `https://fortnite-api.com/images/cosmetics/br/${item.mainId}/icon.png`;
  }
  
  // If still no image, use a custom placeholder based on type
  if (!image || image === '') {
    const typeColors: Record<string, string> = {
      'outfit': '4A90E2',
      'traje': '4A90E2',
      'emote': 'F5C259',
      'gesto': 'F5C259',
      'pickaxe': '94C11F',
      'picos': '94C11F',
      'glider': 'ED764E',
      'music': 'A855F7',
      'música': 'A855F7',
      'bundle': 'EC4899',
      'lote de objetos': 'EC4899'
    };
    
    const typeKey = (mainType || item.displayType || 'item').toLowerCase();
    const color = typeColors[typeKey] || '6B7280';
    const displayType = item.displayType || 'Item';
    
    // Create a nice placeholder with the item type
    image = `https://placehold.co/512x512/${color}/ffffff?text=${encodeURIComponent(displayType)}`;
  }
  
  return {
    id: item.offerId || item.mainId || `item-${Date.now()}-${Math.random()}`,
    name: name,
    description: item.displayDescription || item.description || '',
    type: typeMap[mainType.toLowerCase()] || item.displayType || mainType,
    rarity: rarityMap[rarity.toLowerCase()] || 'common',
    price: item.price?.finalPrice || item.price?.regularPrice || item.finalPrice || 0,
    image: image
  };
}

// Mock data as fallback
function getMockData(): FortniteItem[] {
  return [
    {
      id: 'fn-1',
      name: 'Aura',
      description: 'Consigue la victoria con estilo.',
      type: 'Outfit',
      rarity: 'uncommon',
      price: 800,
      image: 'https://image.fnbr.co/outfit/5d24f6e3262b6c16751284d6/icon.png'
    },
    {
      id: 'fn-2',
      name: 'Varita Estrellada',
      description: '¡Haz que vean las estrellas!',
      type: 'Pickaxe',
      rarity: 'rare',
      price: 800,
      image: 'https://image.fnbr.co/pickaxe/5d3600e012921b6d9266793e/icon.png'
    },
    {
      id: 'fn-3',
      name: 'Caballero Araña',
      description: 'Tejerán su destino.',
      type: 'Outfit',
      rarity: 'legendary',
      price: 2000,
      image: 'https://image.fnbr.co/outfit/5bbde6b32ff30c253466804e/icon.png'
    },
    {
      id: 'fn-4',
      name: 'Baile de la Victoria',
      description: 'Celébralo a lo grande.',
      type: 'Emote',
      rarity: 'epic',
      price: 500,
      image: 'https://image.fnbr.co/emote/5ab176045f957f27504aa533/icon.png'
    },
    {
      id: 'fn-5',
      name: 'Bombardera Brillante',
      description: 'El futuro se ve brillante.',
      type: 'Outfit',
      rarity: 'rare',
      price: 1200,
      image: 'https://image.fnbr.co/outfit/5ab17e655f957f27504aa543/icon.png'
    },
    {
      id: 'fn-6',
      name: 'Segadora',
      description: 'Cosecha recursos... y almas.',
      type: 'Pickaxe',
      rarity: 'epic',
      price: 800,
      image: 'https://image.fnbr.co/pickaxe/5ab17c955f957f27504aa53e/icon.png'
    }
  ];
}
