import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { D20Die3D } from './D20Die3D';
import { ClickToRollD20 } from './ClickToRollD20';

const meta: Meta<typeof D20Die3D> = {
  title: 'Components/D20Roll/Submodules/D20Die3D',
  component: D20Die3D,
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
type Story = StoryObj<typeof D20Die3D>;

export const Idle: Story = {
  args: {
    style: {
      rotateY: '0deg',
      rotateX: '0deg',
      rotateZ: '0deg',
      scale: 1,
    },
    isRolling: false,
    displayValue: '—',
    isCritical: false,
    isFumble: false,
  },
};

export const Rolling: Story = {
  args: {
    style: {
      rotateY: '45deg',
      rotateX: '22deg',
      rotateZ: '12deg',
      scale: 1.2,
    },
    isRolling: true,
    displayValue: '14',
    isCritical: false,
    isFumble: false,
  },
};

export const Nat20: Story = {
  args: {
    style: {
      rotateY: '0deg',
      rotateX: '0deg',
      rotateZ: '0deg',
      scale: 1,
    },
    isRolling: false,
    displayValue: '20',
    isCritical: true,
    isFumble: false,
  },
};

export const Nat1: Story = {
  args: {
    style: {
      rotateY: '0deg',
      rotateX: '0deg',
      rotateZ: '0deg',
      scale: 1,
    },
    isRolling: false,
    displayValue: '1',
    isCritical: false,
    isFumble: true,
  },
};

export const ClickToRoll: Story = {
  render: () => <ClickToRollD20 />,
  parameters: {
    backgrounds: { default: 'transparent' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const die = canvas.getByRole('button', { name: /roll d20/i });

    await expect(die).toBeEnabled();
    await userEvent.click(die);
    await expect(die).toBeDisabled();

    await waitFor(async () => {
      await expect(die).toBeEnabled();
    }, { timeout: 2000 });
  },
};
