import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, userEvent, within, waitFor } from 'storybook/test';

import { Coin3D } from './Coin3D';

import { CoinFlip } from '../CoinFlip';



const meta: Meta<typeof Coin3D> = {

  title: 'Components/CoinFlip/Submodules/Coin3D',

  component: Coin3D,

  parameters: {

    layout: 'centered',

    backgrounds: {

      default: 'dark',

      values: [

        { name: 'dark', value: '#09090b' },

        { name: 'transparent', value: 'transparent' },

      ],

    },

  },

  tags: ['autodocs'],

};



export default meta;

type Story = StoryObj<typeof Coin3D>;



export const Heads: Story = {

  args: {

    style: {

      rotateY: '0deg',

      rotateX: '0deg',

      scale: 1,

    },

    isRolling: false,

  },

};



export const Tails: Story = {

  args: {

    style: {

      rotateY: '180deg',

      rotateX: '0deg',

      scale: 1,

    },

    isRolling: false,

  },

};



export const Spinning: Story = {

  args: {

    style: {

      rotateY: '45deg',

      rotateX: '20deg',

      scale: 1.2,

    },

    isRolling: true,

  },

};



export const ClickToFlip: Story = {

  render: () => <CoinFlip />,

  parameters: {

    backgrounds: { default: 'transparent' },

  },

  play: async ({ canvasElement }) => {

    const canvas = within(canvasElement);

    const coin = canvas.getByRole('button', { name: /flip coin/i });



    await expect(coin).toBeEnabled();

    await userEvent.click(coin);

    await expect(coin).toBeDisabled();



    await waitFor(async () => {

      await expect(coin).toBeEnabled();

    }, { timeout: 2000 });

  },

};


