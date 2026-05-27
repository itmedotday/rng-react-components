import type { Meta, StoryObj } from '@storybook/react-vite';
import { RngWheelRules } from './RngWheelRules';

const meta: Meta<typeof RngWheelRules> = {
  title: 'Components/RngWheel/Submodules/RngWheelRules',
  component: RngWheelRules,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#09090b' },
      ],
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RngWheelRules>;

export const Default: Story = {};
