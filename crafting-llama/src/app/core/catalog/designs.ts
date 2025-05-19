import { Design } from './design.types';

export const MOCK_DESIGNS: Design[] = [
  {
    id: 'boho-bird',
    name: 'Boho Bird',
    description: 'A sweet little stitched bird with seasonal options.',
    heroImage: 'assets/placeholder/boho-bird.png',
    variants: [
      {
        id: 'flower',
        name: 'Bird with Flower',
        price: 18,
        heroImage: 'assets/placeholder/bird-flower.png',
        fields: [
          {
            key: 'threadColor',
            name: 'threadColor',
            label: 'Thread Color',
            type: 'dropdown',
            required: true,
            options: [
              { label: 'Rust', value: 'rust' },
              { label: 'Cream', value: 'cream' },
              { label: 'Olive', value: 'olive' }
            ]
          },
          {
            key: 'addName',
            name: 'addName',
            label: 'Add a Name?',
            type: 'radio',
            options: [
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' }
            ]
          }
        ]
      },
      {
        id: 'sun',
        name: 'Bird with Sun',
        price: 20,
        heroImage: 'assets/placeholder/bird-sun.png',
        fields: [
          {
            key: 'season',
            name: 'season',
            label: 'Seasonal Theme',
            type: 'dropdown',
            required: true,
            options: [
              { label: 'Summer', value: 'summer' },
              { label: 'Fall', value: 'fall' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'bouquet',
    name: 'Floral Bouquet',
    description: 'Delicate embroidered flowers with soft pastel thread.',
    heroImage: 'assets/placeholder/bouquet.png',
    variants: [
      {
        id: 'bouquet-basic',
        name: 'Standard Bouquet',
        price: 22,
        heroImage: 'assets/placeholder/bouquet.png',
        fields: [
          {
            key: 'message',
            name: 'message',
            label: 'Short Message',
            type: 'textarea',
            placeholder: 'Type a short message...',
            required: true
          },
          {
            key: 'colors',
            name: 'colors',
            label: 'Flower Colors',
            type: 'color'
          }
        ]
      }
    ]
  },
  {
    id: 'name-bib',
    name: 'Name Bib',
    description: 'Simple baby bib with embroidered name and custom thread.',
    heroImage: 'assets/placeholder/name-bib.png',
    variants: [
      {
        id: 'classic',
        name: 'Classic',
        price: 16,
        heroImage: 'assets/placeholder/name-bib.png',
        fields: [
          {
            key: 'name',
            name: 'name',
            label: 'Child’s Name',
            type: 'text',
            required: true
          },
          {
            key: 'threadColor',
            name: 'threadColor',
            label: 'Thread Color',
            type: 'dropdown',
            options: [
              { label: 'Sky Blue', value: 'sky-blue' },
              { label: 'Lilac', value: 'lilac' },
              { label: 'Pumpkin', value: 'pumpkin' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'name-hoop',
    name: 'Name Hoop',
    description: 'Personalized hoop with child’s name and decorative touches.',
    heroImage: 'assets/placeholder/name-hoop.png',
    variants: [
      {
        id: 'woodland',
        name: 'Woodland Theme',
        price: 25,
        heroImage: 'assets/placeholder/name-hoop.png',
        fields: [
          {
            key: 'name',
            name: 'name',
            label: 'Child’s Name',
            type: 'text',
            required: true
          },
          {
            key: 'accent',
            name: 'accent',
            label: 'Accent Style',
            type: 'dropdown',
            options: [
              { label: 'Leaves', value: 'leaves' },
              { label: 'Mushrooms', value: 'mushrooms' },
              { label: 'Berries', value: 'berries' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'spooky-spider',
    name: 'Spooky Spider',
    description: 'Halloween-themed spider web embroidery for spooky vibes.',
    heroImage: 'assets/placeholder/spider.png',
    variants: [
      {
        id: 'standard',
        name: 'Standard Web',
        price: 17,
        heroImage: 'assets/placeholder/spider.png',
        fields: [
          {
            key: 'webStyle',
            name: 'webStyle',
            label: 'Web Style',
            type: 'dropdown',
            options: [
              { label: 'Classic', value: 'classic' },
              { label: 'Angular', value: 'angular' }
            ]
          },
          {
            key: 'includeSpider',
            name: 'includeSpider',
            label: 'Include Spider?',
            type: 'radio',
            options: [
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' }
            ]
          }
        ]
      }
    ]
  }
];
