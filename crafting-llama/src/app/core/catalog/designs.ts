import { Design } from './design.types';

export const MOCK_DESIGNS: Design[] = [
  {
    id: 'birth-month-bouquet',
    tags: ["floral", "baby"],
    name: 'Birth Month Flower Bouquet',
    description: 'A custom bouquet made to represent the loved ones in your family.',
    priceFrom: 28,
    heroImage: 'assets/images/placeholder/bouquet.png',
    fields: [
      {
        key: 'flowerCount',
        label: 'Number of flowers in bouquet',
        type: 'dropdown',
        required: true,
        defaultValue: '1',
        options: Array.from({ length: 8 }, (_, i) => ({
          label: `${i + 1}`,
          value: `${i + 1}`
        }))
      },
      {
        key: 'monthOrder',
        label: 'List months in order (left to right)',
        type: 'text',
        placeholder: 'Ex: March, October, Forget Me Not, January',
        required: true,
        defaultValue: ''
      },
      {
        key: 'colorScheme',
        label: 'Flower Color Scheme',
        type: 'text',
        placeholder: 'Ex: March-yellow, October-orange...',
        required: false,
        defaultValue: ''
      },
      {
        key: 'bowColor',
        label: 'Bow Color',
        type: 'color',
        required: false,
        defaultValue: '#ffc0cb',
        options: [
          { label: 'Rose Pink', value: '#ffc0cb' },
          { label: 'Sage Green', value: '#a8c1a1' },
          { label: 'Sky Blue', value: '#87ceeb' },
          { label: 'Soft Yellow', value: '#fffacd' }
        ]
      }
    ]
  },
  {
    id: 'boho-bird',
    tags: ["animals", "baby"],
    name: 'Boho Bird',
    description: 'A cute boho style bird with flower or sun design options.',
    priceFrom: 22,
    heroImage: 'assets/images/placeholder/boho-bird.png',
    fields: [],
    variants: [
      {
        id: 'flower',
        name: 'Flower Design',
        price: 22,
        heroImage: 'assets/images/placeholder/bird-flower.png',
        fields: [
          {
            key: 'colorScheme',
            label: 'Color Scheme (5 colors)',
            type: 'color',
            required: false,
            defaultValue: '#ffe4e1',
            options: [
              { label: 'Pastel', value: '#ffe4e1' },
              { label: 'Muted', value: '#b0a89f' },
              { label: 'Bright', value: '#ff6f61' },
              { label: 'Earth Tones', value: '#8d6e63' },
              { label: 'Cool Blues', value: '#81d4fa' }
            ]
          },
          {
            key: 'notes',
            label: 'Additional comments',
            type: 'textarea',
            required: false,
            defaultValue: ''
          }
        ]
      },
      {
        id: 'sun',
        name: 'Sun Design',
        price: 22,
        heroImage: 'assets/images/placeholder/bird-sun.png',
        fields: [
          {
            key: 'colorScheme',
            label: 'Color Scheme (5 colors)',
            type: 'color',
            required: false,
            defaultValue: '#fdd835',
            options: [
              { label: 'Sunburst', value: '#fdd835' },
              { label: 'Warm Sunset', value: '#f06292' },
              { label: 'Amber', value: '#ffb300' },
              { label: 'Terracotta', value: '#e07a5f' },
              { label: 'Goldenrod', value: '#f9a825' }
            ]
          },
          {
            key: 'notes',
            label: 'Additional comments',
            type: 'textarea',
            required: false,
            defaultValue: ''
          }
        ]
      }
    ]
  },
  {
    id: 'spider',
    tags: ["animals"],
    name: 'Spider',
    description: 'A minimalist spider design available on various items.',
    priceFrom: 18,
    heroImage: 'assets/images/placeholder/spider.png',
    fields: [
      {
        key: 'notes',
        label: 'Additional comments',
        type: 'textarea',
        required: false,
        defaultValue: ''
      }
    ]
  },
  {
    id: 'custom-name-hoop',
    tags: ["writing", "baby"],
    name: 'Custom Name Hoop',
    description: 'A perfect name hoop for baby announcements or nursery decor.',
    priceFrom: 15,
    heroImage: 'assets/images/placeholder/name-hoop.png',
    fields: [
      {
        key: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        defaultValue: ''
      },
      {
        key: 'font',
        label: 'Font',
        type: 'dropdown',
        required: false,
        defaultValue: 'font1',
        options: [
          { label: 'Font 1', value: 'font1' },
          { label: 'Font 2', value: 'font2' },
          { label: 'Font 3', value: 'font3' }
        ]
      },
      {
        key: 'details',
        label: 'Additional details (colors, images, etc.)',
        type: 'textarea',
        required: false,
        defaultValue: ''
      },
      {
        key: 'inspirationImage',
        label: 'Upload inspiration image',
        type: 'file',
        required: false,
        defaultValue: ''
      }
    ]
  },
  {
    id: 'custom-name-bib',
    tags: ["writing", "baby"],
    name: 'Custom Name Bib',
    description: 'Custom muslin bib with your baby’s name.',
    priceFrom: 15,
    heroImage: 'assets/images/placeholder/name-bib.png',
    fields: [
      {
        key: 'bibColor',
        label: 'Color of muslin bib',
        type: 'dropdown',
        required: true,
        defaultValue: 'Dark Blue',
        options: [
          'Dark Blue', 'Light Blue', 'Dark Gray', 'Light Gray',
          'Dark Green', 'Creamy White', 'White', 'Dark Orange',
          'Light Dusty Rose Pink', 'Tan', 'Brown', 'Light Pink',
          'Salmon Pink', 'Yellow'
        ].map(c => ({ label: c, value: c }))
      },
      {
        key: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        defaultValue: ''
      },
      {
        key: 'font',
        label: 'Font',
        type: 'dropdown',
        required: false,
        defaultValue: 'font1',
        options: [
          { label: 'Font 1', value: 'font1' },
          { label: 'Font 2', value: 'font2' }
        ]
      },
      {
        key: 'threadColor',
        label: 'Thread Color',
        type: 'color',
        required: false,
        defaultValue: '#4a4a4a',
        options: [
          { label: 'Charcoal Gray', value: '#4a4a4a' },
          { label: 'Golden Yellow', value: '#fbc02d' },
          { label: 'Mint Green', value: '#a5d6a7' },
          { label: 'Soft Blue', value: '#90caf9' },
          { label: 'Petal Pink', value: '#f8bbd0' }
        ]
      }
    ]
  }
];
