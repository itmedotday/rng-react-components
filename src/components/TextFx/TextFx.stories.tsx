import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { TextFx } from './TextFx';
import type { FxColorId, FxEffectId } from './types';

const meta: Meta<typeof TextFx> = {
  title: 'Components/TextFx',
  component: TextFx,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#09090b' }],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onChange: { action: 'message changed' },
    onColorChange: { action: 'colour changed' },
    onEffectChange: { action: 'effect changed' },
    onCopy: { action: 'copied' },
  },
};

export default meta;
type Story = StoryObj<typeof TextFx>;

const chip = (canvas: ReturnType<typeof within>, name: string) =>
  canvas.getByRole('button', { name: new RegExp(`^${name}$`, 'i') });

const codeTag = (canvasElement: HTMLElement) => {
  const el = canvasElement.querySelector('code');
  if (!el) throw new Error('code tag not found');
  return el;
};

const previewChars = (canvasElement: HTMLElement) =>
  Array.from(
    canvasElement.querySelectorAll<HTMLElement>('[data-testid="fx-preview"] span span'),
  );

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('renders the default message, colour and effect', async () => {
      await expect(canvas.getByLabelText('Message')).toHaveValue('Nat 20!');
      await expect(codeTag(canvasElement)).toHaveTextContent('wave:rainbow:Nat 20!');
      await expect(chip(canvas, 'rainbow')).toHaveAttribute('aria-pressed', 'true');
      await expect(chip(canvas, 'wave')).toHaveAttribute('aria-pressed', 'true');
    });

    await step('renders one span per character', async () => {
      await expect(previewChars(canvasElement)).toHaveLength('Nat 20!'.length);
    });
  },
};

export const Typing: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Message');

    await step('typing updates the preview and the code tag', async () => {
      await userEvent.clear(input);
      await userEvent.type(input, 'Crit!');
      await expect(input).toHaveValue('Crit!');
      await expect(codeTag(canvasElement)).toHaveTextContent('wave:rainbow:Crit!');
      await expect(previewChars(canvasElement)).toHaveLength(5);
    });

    await step('input is capped at maxLength', async () => {
      await userEvent.clear(input);
      await userEvent.type(input, 'x'.repeat(30));
      await expect((input as HTMLInputElement).value).toHaveLength(24);
    });
  },
};

export const ClearedMessageKeepsStageHeight: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('an empty message still renders one (space) character', async () => {
      await userEvent.clear(canvas.getByLabelText('Message'));
      await expect(codeTag(canvasElement)).toHaveTextContent('wave:rainbow:');
      await expect(previewChars(canvasElement)).toHaveLength(1);
    });
  },
};

export const ColourSelection: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('selecting a colour moves aria-pressed and updates the tag', async () => {
      await userEvent.click(chip(canvas, 'blue'));
      await expect(chip(canvas, 'blue')).toHaveAttribute('aria-pressed', 'true');
      await expect(chip(canvas, 'rainbow')).toHaveAttribute('aria-pressed', 'false');
      await expect(codeTag(canvasElement)).toHaveTextContent('wave:blue:Nat 20!');
    });

    await step('solid colours paint the characters directly', async () => {
      const [first] = previewChars(canvasElement);
      await expect(first).toHaveStyle({ color: 'rgb(63, 111, 214)' });
    });
  },
};

export const EffectSelection: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('selecting an effect moves aria-pressed and updates the tag', async () => {
      await userEvent.click(chip(canvas, 'shake'));
      await expect(chip(canvas, 'shake')).toHaveAttribute('aria-pressed', 'true');
      await expect(chip(canvas, 'wave')).toHaveAttribute('aria-pressed', 'false');
      await expect(codeTag(canvasElement)).toHaveTextContent('shake:rainbow:Nat 20!');
    });

    // The browser reserializes the `animation` shorthand, so assert on the
    // parsed longhands rather than on the string we happened to write.
    await step('per-character animation is staggered by index', async () => {
      const chars = previewChars(canvasElement);
      await expect(chars[0].style.animationName).toContain('fxShake');
      await expect(chars[0].style.animationDelay.split(',')[0].trim()).toBe('0s');
      await expect(chars[1].style.animationDelay.split(',')[0].trim()).toBe('0.03s');
      await expect(chars[2].style.animationDelay.split(',')[0].trim()).toBe('0.06s');
    });
  },
};

export const EffectNoneOmitsPrefix: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('the "none" effect drops the effect segment from the tag', async () => {
      await userEvent.click(chip(canvas, 'none'));
      await expect(codeTag(canvasElement)).toHaveTextContent('rainbow:Nat 20!');
      await expect(codeTag(canvasElement).textContent).not.toContain('none:');
    });
  },
};

export const Copy: Story = {
  // An explicit spy: `argTypes` actions log, but are not assertable mocks.
  args: { onCopy: fn() },
  play: async ({ canvasElement, step, args }) => {
    const canvas = within(canvasElement);

    await step('the copy button confirms, then reverts', async () => {
      const button = canvas.getByRole('button', { name: /copy/i });
      await userEvent.click(button);

      await waitFor(() =>
        expect(canvas.getByRole('button', { name: /copied/i })).toBeInTheDocument(),
      );
      await expect(args.onCopy).toHaveBeenCalledWith('wave:rainbow:Nat 20!');

      await waitFor(
        () => expect(canvas.getByRole('button', { name: /^copy$/i })).toBeInTheDocument(),
        { timeout: 3000 },
      );
    });
  },
};

export const Rainbow: Story = {
  args: { defaultColor: 'rainbow', defaultEffect: 'none' },
  play: async ({ canvasElement, step }) => {
    await step('each character cycles hue on its own delay', async () => {
      const chars = previewChars(canvasElement);
      await expect(chars[0].style.animationName).toContain('fxRainbow');
      await expect(chars[1].style.animationDelay).toBe('0.09s');
      // Hue comes from the keyframes, so no static colour is set.
      await expect(chars[0].style.color).toBe('');
    });
  },
};

export const Inverted: Story = {
  args: { defaultColor: 'inverted', defaultEffect: 'none' },
  play: async ({ canvasElement, step }) => {
    await step('characters are outlined rather than filled', async () => {
      const [first] = previewChars(canvasElement);
      await expect(first.style.color).toBe('transparent');
      // The browser normalises the hex to rgb().
      await expect(first.style.webkitTextStroke).toBe('1px rgb(216, 205, 180)');
    });
  },
};

export const Glow: Story = {
  args: { defaultColor: 'green', defaultEffect: 'glow' },
  play: async ({ canvasElement, step }) => {
    await step('the glow colour tracks the selected palette colour', async () => {
      const inner = canvasElement.querySelector<HTMLElement>(
        '[data-testid="fx-preview"] > span',
      );
      await expect(inner?.style.animationName).toContain('fxGlow');
      await expect(inner?.style.getPropertyValue('--glow')).toBe('#46a832');
    });
  },
};

export const Mirror: Story = {
  args: { defaultEffect: 'mirror' },
  play: async ({ canvasElement, step }) => {
    await step('mirror is a static transform, not an animation', async () => {
      const wrap = canvasElement.querySelector<HTMLElement>('[data-testid="fx-preview"]');
      await expect(wrap?.style.transform).toBe('scaleX(-1)');
      await expect(wrap?.style.animationName).toBe('');
    });
  },
};

export const Controlled: Story = {
  render: function ControlledTextFx() {
    const [value, setValue] = useState('Owned');
    const [color, setColor] = useState<FxColorId>('green');
    const [effect, setEffect] = useState<FxEffectId>('glow');
    return (
      <TextFx
        value={value}
        onChange={setValue}
        color={color}
        onColorChange={setColor}
        effect={effect}
        onEffectChange={setEffect}
      />
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('parent state drives the initial render', async () => {
      await expect(canvas.getByLabelText('Message')).toHaveValue('Owned');
      await expect(codeTag(canvasElement)).toHaveTextContent('glow:green:Owned');
    });

    await step('interaction round-trips through the parent', async () => {
      await userEvent.click(chip(canvas, 'pink'));
      await expect(codeTag(canvasElement)).toHaveTextContent('glow:pink:Owned');

      await userEvent.type(canvas.getByLabelText('Message'), '!');
      await expect(codeTag(canvasElement)).toHaveTextContent('glow:pink:Owned!');
    });
  },
};
