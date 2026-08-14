/**
 * Single source of truth for property listings.
 * Swap this static array for a fetch to a CMS/API later — every component
 * downstream only depends on the `Property` shape, not on where it came from.
 */

export interface Property {
  slug: string
  name: string
  location: string
  priceFrom: number
  currency: string
  areaM2: number
  bedrooms: number
  bathrooms: number
  /** Short editorial line, not marketing copy. */
  description: string
  /** First image is used as the hero frame in the showcase. */
  images: string[]
  year: number
}

export const properties: Property[] = [
  {
    slug: 'altiplano-house',
    name: 'Altiplano House',
    location: 'Valle de Bravo, MX',
    priceFrom: 480000,
    currency: 'USD',
    areaM2: 320,
    bedrooms: 4,
    bathrooms: 3,
    description:
      'Una casa que negocia con la pendiente del terreno en vez de someterla. Muros de piedra local y grandes paños de vidrio hacia el bosque.',
    images: ['/properties/altiplano-house-01.webp', '/properties/altiplano-house-02.webp'],
    year: 2025
  },
  {
    slug: 'linea-blanca',
    name: 'Línea Blanca',
    location: 'Punta Mita, MX',
    priceFrom: 720000,
    currency: 'USD',
    areaM2: 410,
    bedrooms: 5,
    bathrooms: 4,
    description:
      'Volúmenes horizontales y patios internos que capturan la brisa. Una casa pensada para desaparecer entre la vegetación.',
    images: ['/properties/linea-blanca-01.webp', '/properties/linea-blanca-02.webp'],
    year: 2024
  },
  {
    slug: 'cantera-41',
    name: 'Cantera 41',
    location: 'San Miguel de Allende, MX',
    priceFrom: 395000,
    currency: 'USD',
    areaM2: 265,
    bedrooms: 3,
    bathrooms: 3,
    description:
      'Un ejercicio de materialidad: cantera local, madera envejecida y concreto pulido conviviendo sin jerarquía.',
    images: ['/properties/cantera-41-01.webp', '/properties/cantera-41-02.webp'],
    year: 2024
  }
]

export function formatPrice(value: number, currency: string) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(value)
}
