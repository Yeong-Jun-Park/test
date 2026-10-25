import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://Yeong-Jun-Park.github.io',
  base: '/test',
  trailingSlash: 'always',

  integrations: [
    starlight({
      title: 'FuNPrep',
      description:
        'Documentation for multimodal neuroimaging preprocessing with FuNPrep.',

      customCss: ['./src/styles/custom.css'],

      sidebar: [
        {
          label: 'Start here',
          items: [
            { label: 'Overview', slug: 'overview' },
            {
              label: 'Installation',
              slug: 'getting-started/installation',
            },
            {
              label: 'Input preparation',
              slug: 'getting-started/input-preparation',
            },
            {
              label: 'Quick start',
              slug: 'getting-started/quick-start',
            },
          ],
        },
        {
          label: 'Processing',
          items: [
            { label: 'Workflows', slug: 'workflows' },
            { label: 'Structural MRI', slug: 'workflows/structural' },
            { label: 'Diffusion MRI', slug: 'workflows/diffusion' },
            { label: 'Functional MRI', slug: 'workflows/functional' },
            { label: 'Microstructure', slug: 'workflows/microstructure' },
          ],
        },
        {
          label: 'Reference',
          items: [
            {
              label: 'Command reference',
              slug: 'reference/command-reference',
            },
            { label: 'Outputs', slug: 'reference/outputs' },
            {
              label: 'Troubleshooting',
              slug: 'reference/troubleshooting',
            },
          ],
        },
      ],
    }),
  ],
});