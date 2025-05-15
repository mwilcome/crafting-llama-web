import { Design } from './design.types';

export const MOCK_DESIGNS: Design[] = [
  {
    id: 'fall-theme',
    name: 'Autumn Harvest',
    description: 'A cozy fall-themed design with pumpkins, rustic tones, and warm embroidery.',
    heroImage: '/assets/images/designs/fall.jpg',
    variants: [
      {
        id: 'fall-classic',
        name: 'Classic Fall',
        price: 18,
        heroImage: '/assets/images/variants/fall-classic.jpg',
        fields: [
          { key: 'name', name: 'name', label: 'Name', type: 'text', required: true },
          {
            key: 'style',
            name: 'style',
            label: 'Style',
            type: 'dropdown',
            required: true,
            options: [
              { label: 'Pumpkin', value: 'pumpkin' },
              { label: 'Leaves', value: 'leaves' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'floral-bouquet',
    name: 'Floral Bouquet',
    description: 'Delicate embroidered flowers with soft pastel thread choices.',
    heroImage: '/assets/images/designs/floral.jpg',
    variants: [
      {
        id: 'floral-spring',
        name: 'Spring Pastels',
        price: 32,
        heroImage: '/assets/images/variants/floral-spring.jpg',
        fields: [
          {
            key: 'message',
            name: 'message',
            label: 'Message',
            type: 'textarea',
            placeholder: 'Optional note',
            required: true,
          },
          { key: 'color', name: 'color', label: 'Thread Color', type: 'color' },
          {
            key: 'font',
            name: 'font',
            label: 'Font Style',
            type: 'dropdown',
            required: true,
            options: [
              { label: 'Script', value: 'script' },
              { label: 'Print', value: 'print' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'night-sky',
    name: 'Starry Night',
    description: 'Dreamy nighttime-inspired design with deep navy and gold tones.',
    heroImage: '/assets/images/designs/starry.jpg',
    variants: [
      {
        id: 'starry-default',
        name: 'Celestial Stars',
        price: 20,
        heroImage: '/assets/images/variants/starry-default.jpg',
        fields: [
          { key: 'name', name: 'name', label: 'Name', type: 'text', required: true },
          {
            key: 'pattern',
            name: 'pattern',
            label: 'Pattern',
            type: 'dropdown',
            options: [
              { label: 'Stars', value: 'stars' },
              { label: 'Moon', value: 'moon' },
              { label: 'Constellations', value: 'constellations' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'bird',
    name: 'Songbird',
    description: 'A sweet little stitched bird with seasonal options and personalization.',
    heroImage: '/assets/images/designs/bird.jpg',
    variants: [
      {
        id: 'bird-autumn',
        name: 'Autumn Bird',
        price: 22,
        heroImage: '/assets/images/variants/bird-autumn.jpg',
        fields: [
          {
            key: 'theme',
            name: 'theme',
            label: 'Theme',
            type: 'dropdown',
            options: [
              { label: 'Maple Leaf', value: 'maple' },
              { label: 'Oak Leaf', value: 'oak' },
            ],
          },
          {
            key: 'pose',
            name: 'pose',
            label: 'Bird Pose',
            type: 'radio',
            options: [
              { label: 'Sitting', value: 'sitting' },
              { label: 'Flying', value: 'flying' },
            ],
          },
          {
            key: 'quantity',
            name: 'quantity',
            label: 'Quantity',
            type: 'number',
            defaultValue: '1',
          },
        ],
      },
    ],
  },
  {
    id: 'spooky-web',
    name: 'Spooky Web',
    description: 'Halloween-themed spider web embroidery for spooky vibes.',
    heroImage: '/assets/images/designs/spooky.jpg',
    variants: [
      {
        id: 'web-glow',
        name: 'Glow in the Dark',
        price: 22,
        heroImage: '/assets/images/variants/web-glow.jpg',
        fields: [
          {
            key: 'effect',
            name: 'effect',
            label: 'Effect',
            type: 'dropdown',
            options: [
              { label: 'Glow', value: 'glow' },
              { label: 'Matte', value: 'matte' },
            ],
          },
          {
            key: 'spiderCount',
            name: 'spiderCount',
            label: 'Number of Spiders',
            type: 'number',
            defaultValue: '2',
          },
        ],
      },
    ],
  },
];
