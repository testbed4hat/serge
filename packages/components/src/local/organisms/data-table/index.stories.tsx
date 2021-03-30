import React from 'react'

// Import component files
import DataTable from './index'
import DataTableProps from './types/props'
import docs from './README.md'
import { Story } from '@storybook/react/types-6-0'
import Badge from '../../atoms/badge'
import RfiForm from '../../molecules/rfi-form'
import { MessageCustom } from '@serge/custom-types/message'
import { GameMessagesMockRFI } from '@serge/mocks'
import { mostRecentOnly } from '@serge/helpers'

export default {
  title: 'local/organisms/DataTable',
  component: DataTable,
  decorators: [],
  parameters: {
    readme: {
      // Show readme before story
      content: docs
    }
  }
}

const Template: Story<DataTableProps> = args => {
  return (
    <DataTable {...args} />
  )
}

// deepscan-disable-next-line USELESS_ARROW_FUNC_BIND
export const Default = Template.bind({})
Default.args = {
  columns: ['First column', 'Second column', 'Third column'],
  data: [
    ['Row 1 Cell 1', 'Row 1 Cell 2', 'Row 1 Cell 3'],
    ['Row 2 Cell 1', 'Row 2 Cell 2', 'Row 2 Cell 3']
  ]
}

// deepscan-disable-next-line USELESS_ARROW_FUNC_BIND
export const WithFilter = Template.bind({})
WithFilter.args = {
  columns: [
    'First column',
    {
      filters: [
        'Completed',
        'In Progress'
      ],
      label: 'Status'
    },
    'Third column'
  ],
  data: [
    ['Row 1 Cell 1', 'Completed', 'Row 1 Cell 3'],
    ['Row 2 Cell 1', 'Not Completed', 'Row 2 Cell 3'],
    ['Row 2 Cell 1', 'Not Completed', 'Row 2 Cell 3'],
    ['Row 2 Cell 1', 'Completed', 'Row 2 Cell 3'],
    ['Row 2 Cell 1', 'In Progress', 'Row 2 Cell 3'],
    ['Row 2 Cell 1', 'Not Completed', 'Row 2 Cell 3']
  ]
}

// deepscan-disable-next-line USELESS_ARROW_FUNC_BIND
const rfiMessages = GameMessagesMockRFI
  .filter(message => (message as MessageCustom).details.messageType === 'RFI')
  // sample data includes multiple versions of RFI messages, ensure we're only
// looking at newest
const newest = mostRecentOnly(rfiMessages)

const rfiData = newest.map((message: any) => {
  const messageItem = (message as MessageCustom)
  return [
    messageItem._id,
    messageItem.details.channel,
    messageItem.details.from.role,
    messageItem.details.from.forceColor,
    messageItem.message.title,
      messageItem.details.collaboration?.status,
      messageItem.details.collaboration?.owner
  ]
})

const uniqueFieldValues = (messages: any[], col: number) => {
  // find items with unique items in set column
  const uniqueValues =  messages.filter((elem, index) => rfiData.findIndex(obj => obj[col] === elem[col]) === index);
  // produce array with just field of interest
  const values = uniqueValues.map((item: any) => item && item[col])
  // swap undefined for string
  return values.map((item: any) => item === undefined ? '[Undefined]' : item)
}

export const Implementation = Template.bind({})
Implementation.args = {
  columns: [
    'ID',
    {
      filters: uniqueFieldValues(rfiData, 1),
      label: 'Channel'
    },
    {
      filters: uniqueFieldValues(rfiData, 2),
      label: 'From'
    },
    'Title',
    {
      filters: [
        'Unallocated',
        'In Progress',
        'Pending Review',
        'Released'
      ],
      label: 'Status'
    },
    {
      filters: uniqueFieldValues(rfiData, 6),
      label: 'Owner'
    }
  ],
  data: rfiData.map((row, rowIndex): any => {
    const [id, channel, role, forceColor, content, status, owner] = row
    const statusColors = {
      Unallocated: '#B10303',
      'In progress': '#E7740A',
      'Pending review': '#434343',
      Released: '#007219'
    }
    return {
      collapsible: (
        <RfiForm onSubmit={console.log} onReject={console.log} message={(rfiMessages[rowIndex] as MessageCustom)} />
      ),
      cells: [
        id,
        channel,
        {
          component: <Badge customBackgroundColor={forceColor} label={role}/>,
          label: role
        },
        content,
        {
          component: <Badge customBackgroundColor={status ? statusColors[status] : '#434343'} customSize="large" label={status}/>,
          label: status
        },
        {
          component: owner ? <Badge customBackgroundColor="#434343" label={owner}/> : null,
          label: owner
        }
      ]
    }
  })
}
