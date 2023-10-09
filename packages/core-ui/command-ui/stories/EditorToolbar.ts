import type { Meta, StoryObj } from '@storybook/react';

import { EditorToolbar } from '@hive-command/editor-toolbar';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof EditorToolbar> = {
  title: 'Editor Toolbar',
  component: EditorToolbar,
//   parameters: {
//     // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
//     layout: 'centered',
//   },
//   // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
//   tags: ['autodocs'],
//   // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
//   argTypes: {
//     backgroundColor: { control: 'color' },
//   },
};

export default meta;
type Story = StoryObj<typeof EditorToolbar>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary: Story = {
  args: {
    // primary: true,
    // label: 'Button',
  },
};
