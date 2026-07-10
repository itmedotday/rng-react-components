import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { TextFxConsole } from './TextFxConsole';

const meta: Meta<typeof TextFxConsole> = {
  title: 'Components/TextFxConsole',
  component: TextFxConsole,
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
type Story = StoryObj<typeof TextFxConsole>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('the header is hidden unless asked for', async () => {
      await expect(canvas.queryByRole('heading')).not.toBeInTheDocument();
      await expect(canvas.getByLabelText('Message')).toBeInTheDocument();
    });
  },
};

export const WithHeader: Story = {
  args: { showHeader: true },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('renders the default header copy', async () => {
      await expect(canvas.getByText('Text FX')).toBeInTheDocument();
      await expect(
        canvas.getByRole('heading', { name: 'Goblin text renderer' }),
      ).toBeInTheDocument();
      await expect(canvas.getByText(/RuneScape-style chat colours/)).toBeInTheDocument();
    });
  },
};

export const CustomHeader: Story = {
  args: {
    showHeader: true,
    eyebrow: 'Chat FX',
    title: 'Message styler',
    description: 'Pick a colour and an effect.',
    defaultValue: 'Hello!',
    defaultColor: 'cyan',
    defaultEffect: 'shake',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('header copy is overridable', async () => {
      await expect(canvas.getByText('Chat FX')).toBeInTheDocument();
      await expect(
        canvas.getByRole('heading', { name: 'Message styler' }),
      ).toBeInTheDocument();
      await expect(canvas.getByText('Pick a colour and an effect.')).toBeInTheDocument();
    });

    await step('TextFx props pass through the console', async () => {
      await expect(canvas.getByLabelText('Message')).toHaveValue('Hello!');
      await expect(canvasElement.querySelector('code')).toHaveTextContent(
        'shake:cyan:Hello!',
      );
    });
  },
};
