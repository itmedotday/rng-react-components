import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { FxPreview } from './FxPreview';

const meta: Meta<typeof FxPreview> = {
  title: 'Components/TextFx/Submodules/FxPreview',
  component: FxPreview,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#09090b' }],
    },
  },
  tags: ['autodocs'],
  args: { text: 'Nat 20!', color: 'rainbow', effect: 'wave' },
  decorators: [
    (Story) => (
      <div className="fx-stage flex min-h-[150px] w-[420px] items-center justify-center px-5 py-11 text-[44px] leading-tight text-white">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FxPreview>;

/** `kind: 'char'` — one staggered animation per character. */
export const CharEffect: Story = {
  args: { effect: 'wave3', color: 'green' },
};

/** `kind: 'inner'` — one animation on the span wrapping all characters. */
export const InnerEffect: Story = {
  args: { effect: 'glow', color: 'cyan' },
};

/** `kind: 'wrap'` — one animation on the outermost span. */
export const WrapEffect: Story = {
  args: { effect: 'scroll', color: 'yellow' },
};

/** `kind: 'static'` — a transform, no animation. */
export const StaticEffect: Story = {
  args: { effect: 'mirror', color: 'red' },
};

/** `kind: 'none'` — plain text in a solid colour. */
export const NoEffect: Story = {
  args: { effect: 'none', color: 'white' },
};

export const Inverted: Story = {
  args: { effect: 'none', color: 'inverted' },
};

export const EmptyText: Story = {
  args: { text: '', effect: 'none', color: 'white' },
  play: async ({ canvasElement }) => {
    const chars = canvasElement.querySelectorAll(
      '[data-testid="fx-preview"] span span',
    );
    // A single space keeps the stage from collapsing.
    await expect(chars).toHaveLength(1);
    await expect(chars[0]).toHaveTextContent('');
  },
};
