import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { FxCodeTag } from './FxCodeTag';

const meta: Meta<typeof FxCodeTag> = {
  title: 'Components/TextFx/Submodules/FxCodeTag',
  component: FxCodeTag,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#09090b' }],
    },
  },
  tags: ['autodocs'],
  args: { value: 'wave:rainbow:Nat 20!' },
  argTypes: { onCopy: { action: 'copied' } },
  decorators: [
    (Story) => (
      <div className="w-[420px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FxCodeTag>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelector('code')).toHaveTextContent(
      'wave:rainbow:Nat 20!',
    );
    await expect(canvas.getByRole('button', { name: /^copy$/i })).toBeInTheDocument();
  },
};

export const LongValueTruncates: Story = {
  args: { value: 'shake2:inverted:a-very-long-message-that-overflows' },
};

export const Copies: Story = {
  // An explicit spy: `argTypes` actions log, but are not assertable mocks.
  args: { copyResetMs: 300, onCopy: fn() },
  play: async ({ canvasElement, step, args }) => {
    const canvas = within(canvasElement);

    await step('clicking copy confirms and fires onCopy', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /copy/i }));
      await waitFor(() =>
        expect(canvas.getByRole('button', { name: /copied/i })).toBeInTheDocument(),
      );
      await expect(args.onCopy).toHaveBeenCalledWith('wave:rainbow:Nat 20!');
    });

    await step('the confirmation reverts after copyResetMs', async () => {
      await waitFor(() =>
        expect(canvas.getByRole('button', { name: /^copy$/i })).toBeInTheDocument(),
      );
    });
  },
};
