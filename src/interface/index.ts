import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './interface.vue';

export default defineInterface({
  id: 'iconify-picker',
  name: 'Iconify Picker',
  icon: 'emoji_emotions',
  description: 'Pick icons from Iconify API',
  component: InterfaceComponent,
  options: [
    {
      field: 'defaultCollection',
      name: 'Default Icon Collection',
      type: 'string',
      meta: {
        interface: 'input',
        width: 'full',
        options: {
          placeholder: 'mdi (Material Design Icons)',
        },
      },
      schema: {
        default_value: 'mdi',
      },
    },
    {
      field: 'collections',
      name: 'Allowed Collections',
      type: 'json',
      meta: {
        interface: 'tags',
        width: 'full',
        options: {
          placeholder: 'Leave empty for all collections',
        },
      },
    },
    {
      field: 'iconSize',
      name: 'Preview Icon Size',
      type: 'integer',
      meta: {
        interface: 'input',
        width: 'half',
      },
      schema: {
        default_value: 24,
      },
    },
  ],
  types: ['string'],
});
