import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { FxChipRow } from './FxChipRow';
import { FX_COLORS, FX_EFFECT_IDS, type FxColorId, type FxEffectId } from '../types';

/** Pinned to a concrete id type; the component itself is generic over `Id`. */
const ColourRow = FxChipRow<FxColorId>;

const meta: Meta<typeof ColourRow> = {
  title: 'Components/TextFx/Submodules/FxChipRow',
  component: ColourRow,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#09090b' }],
    },
  },
  tags: ['autodocs'],
  argTypes: { onSelect: { action: 'selected' } },
  decorators: [
    (Story) => (
      <div className="w-[420px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ColourRow>;

export const ColourVariant: Story = {
  args: {
    label: 'Colour',
    variant: 'gobby',
    options: FX_COLORS.map((c) => c.id),
    value: 'rainbow',
    // An explicit spy: `argTypes` actions log, but are not assertable mocks.
    onSelect: fn(),
  },
  play: async ({ canvasElement, step, args }) => {
    const canvas = within(canvasElement);

    await step('the group is labelled and the selection is exposed', async () => {
      await expect(canvas.getByRole('group', { name: 'Colour' })).toBeInTheDocument();
      await expect(
        canvas.getByRole('button', { name: /^rainbow$/i }),
      ).toHaveAttribute('aria-pressed', 'true');
      await expect(canvas.getByRole('button', { name: /^red$/i })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
    });

    await step('clicking a chip reports the selection', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /^purple$/i }));
      await expect(args.onSelect).toHaveBeenCalledWith('purple');
    });
  },
};

export const EffectVariant: StoryObj<typeof FxChipRow<FxEffectId>> = {
  args: {
    label: 'Effect',
    variant: 'rng',
    options: FX_EFFECT_IDS,
    value: 'wave',
  },
};

export const Interactive: Story = {
  render: function InteractiveRow() {
    const [value, setValue] = useState<FxColorId>('cyan');
    return (
      <FxChipRow
        label="Colour"
        variant="gobby"
        options={FX_COLORS.map((c) => c.id)}
        value={value}
        onSelect={setValue}
      />
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('selection moves between chips', async () => {
      await expect(canvas.getByRole('button', { name: /^cyan$/i })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await userEvent.click(canvas.getByRole('button', { name: /^brown$/i }));
      await expect(canvas.getByRole('button', { name: /^brown$/i })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await expect(canvas.getByRole('button', { name: /^cyan$/i })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
    });
  },
};
