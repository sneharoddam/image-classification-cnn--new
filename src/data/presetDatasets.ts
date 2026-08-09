import { CustomDataset } from '../types';

export const PRESET_DATASETS: CustomDataset[] = [
  {
    id: 'preset-wildlife',
    name: 'Nature & Fauna Species',
    description: 'Custom dataset for identifying wild animals, birds, reptiles, and aquatic species.',
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-01-15T00:00:00.000Z',
    isPreset: true,
    categories: [
      {
        id: 'cat-mammals',
        name: 'Mammals & Felines',
        description: 'Large and small mammals including big cats, wolves, bears, and domestic pets.',
        color: '#3B82F6', // Blue
        samples: [
          {
            id: 's-1',
            url: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=600&q=80',
            caption: 'Lion resting in savanna',
            addedAt: '2026-01-15T00:00:00.000Z'
          },
          {
            id: 's-2',
            url: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=600&q=80',
            caption: 'Tiger prowling through forest',
            addedAt: '2026-01-15T00:00:00.000Z'
          }
        ]
      },
      {
        id: 'cat-birds',
        name: 'Avian & Birds',
        description: 'Wild birds, waterfowl, raptors, and tropical colorful avian species.',
        color: '#10B981', // Green
        samples: [
          {
            id: 's-3',
            url: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=600&q=80',
            caption: 'Tropical parrot on branch',
            addedAt: '2026-01-15T00:00:00.000Z'
          },
          {
            id: 's-4',
            url: 'https://images.unsplash.com/photo-1611689342806-0863700ce1e4?auto=format&fit=crop&w=600&q=80',
            caption: 'Eagle in flight',
            addedAt: '2026-01-15T00:00:00.000Z'
          }
        ]
      },
      {
        id: 'cat-aquatic',
        name: 'Marine & Aquatic Life',
        description: 'Fishes, sea turtles, corals, cetaceans, and marine organisms.',
        color: '#06B6D4', // Cyan
        samples: [
          {
            id: 's-5',
            url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
            caption: 'Sea turtle swimming in reef',
            addedAt: '2026-01-15T00:00:00.000Z'
          }
        ]
      },
      {
        id: 'cat-insects',
        name: 'Insects & Microfauna',
        description: 'Butterflies, beetles, bees, dragonflies, and arthropods.',
        color: '#F59E0B', // Amber
        samples: [
          {
            id: 's-6',
            url: 'https://images.unsplash.com/photo-1550853024-fa0f0e64b13c?auto=format&fit=crop&w=600&q=80',
            caption: 'Monarch butterfly on flower',
            addedAt: '2026-01-15T00:00:00.000Z'
          }
        ]
      }
    ]
  },
  {
    id: 'preset-architecture',
    name: 'Architectural Styles',
    description: 'Dataset for classifying architectural structural styles and building eras.',
    createdAt: '2026-01-20T00:00:00.000Z',
    updatedAt: '2026-01-20T00:00:00.000Z',
    isPreset: true,
    categories: [
      {
        id: 'cat-gothic',
        name: 'Gothic & Classical Revival',
        description: 'Pointed arches, ribbed vaults, stone spires, and elaborate masonry.',
        color: '#8B5CF6', // Purple
        samples: [
          {
            id: 's-7',
            url: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&w=600&q=80',
            caption: 'Cathedral spire with stone arches',
            addedAt: '2026-01-20T00:00:00.000Z'
          }
        ]
      },
      {
        id: 'cat-modernist',
        name: 'Modernist & Skyscraper',
        description: 'Glass facades, steel beams, geometric minimalism, and clean linear silhouettes.',
        color: '#EC4899', // Pink
        samples: [
          {
            id: 's-8',
            url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
            caption: 'Glass commercial high-rise tower',
            addedAt: '2026-01-20T00:00:00.000Z'
          }
        ]
      },
      {
        id: 'cat-vernacular',
        name: 'Traditional Vernacular & Timber',
        description: 'Wooden structures, sloped tiled roofs, cobble walls, and historic dwellings.',
        color: '#D97706', // Ochre
        samples: [
          {
            id: 's-9',
            url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
            caption: 'Charming timber framed cottage',
            addedAt: '2026-01-20T00:00:00.000Z'
          }
        ]
      }
    ]
  },
  {
    id: 'preset-qc',
    name: 'Product Quality Control',
    description: 'Industrial defect detection dataset for manufactured components and packaging.',
    createdAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-02-01T00:00:00.000Z',
    isPreset: true,
    categories: [
      {
        id: 'cat-pristine',
        name: 'Pristine / Grade A',
        description: 'Flawless product condition, clean surfaces, uniform geometry, zero defect.',
        color: '#10B981',
        samples: []
      },
      {
        id: 'cat-scratched',
        name: 'Surface Scratch / Abrasion',
        description: 'Visible surface scratches, scuffs, paint peels, or friction marks.',
        color: '#F59E0B',
        samples: []
      },
      {
        id: 'cat-dented',
        name: 'Structural Dent / Deformity',
        description: 'Physical warping, bent edges, impact dents, or crushed packaging corners.',
        color: '#EF4444',
        samples: []
      }
    ]
  }
];
