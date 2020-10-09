import React, { useState } from 'react'

// Import component files
import IconUploader from './index'
import docs from './README.md'
import { withKnobs } from '@storybook/addon-knobs'

const wrapper: React.FC = (storyFn: any) => <div style={{ height: '600px', position: 'relative' }}>{storyFn()}</div>

export default {
  title: 'local/GameAdmin/IconUploader',
  component: IconUploader,
  decorators: [withKnobs, wrapper],
  parameters: {
    readme: {
      // Show readme before story
      content: docs
    }
  }
}

export const Default: React.FC = () => {
  const [src, setSrc] = useState<string>('')
  const handleChange = (newSrc: string): void => {
    console.log(newSrc)
    setSrc(newSrc)
  }
  return <IconUploader onChange={handleChange} limit={20000} icon={src} background={'red'}>change icon</IconUploader>
}

// @ts-ignore TS belives the 'story' property doesn't exist but it does.
Default.story = {
  parameters: {
    options: {
      // This story requires addons but other stories in this component do not
      showPanel: true
    }
  }
}