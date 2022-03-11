import { AdminTabs } from '@serge/config'
import React from 'react'
import AdminContent from '../../atoms/admin-content'
import AdminLayout from '../../organisms/admin-layout'
import SettingChannels from '../../organisms/setting-channels'
import SettingForces from '../../organisms/setting-forces'
import SettingOverview from '../../organisms/setting-overview'
import SettingPlatformTypes from '../../organisms/setting-platform-types'
import Props from './types/props'

/* Render component */
export const GameSetup: React.FC<Props> = ({
  overview,
  platformTypes,
  forces,
  channels,
  onTabChange,
  onPressBack,
  wargame,
  tabs = [],
  wargameChanged,
  activeTab = '',
  onOverviewChange,
  onPlatformTypesChange,
  onDeletePlatformType,
  onForcesChange,
  onCreateForce,
  onDeleteForce,
  onSidebarForcesClick,
  selectedForce,
  onChannelsChange,
  onSidebarChannelsClick,
  onCreateChannel,
  onDeleteChannel,
  onDuplicateChannel,
  selectedChannel,
  onSave,
  messageTemplates,
  onSaveGameTitle,
  onWargameInitiate,
  iconUploadUrl,
  onDeleteGameControl
}: Props) => {
  const currentActiveTab = wargame?.currentTab || activeTab

  return (
    <AdminLayout onSave={onSaveGameTitle} wargame={wargame} activeTab={currentActiveTab} onPressBack={onPressBack} tabs={tabs} onTabChange={onTabChange} wargameChanged={wargameChanged}>
      <AdminContent>
        {
          currentActiveTab === AdminTabs.Overview && (
            <SettingOverview
              overview={overview}
              onChange={onOverviewChange}
              onSave={onSave}
              initiateWargame={onWargameInitiate}
              wargameInitiated={!!wargame.wargameInitiated}
            />
          )
        }
        {
          currentActiveTab === AdminTabs.PlatformTypes && (
            <SettingPlatformTypes
              iconUploadUrl={iconUploadUrl}
              platformType={platformTypes}
              onChange={onPlatformTypesChange}
              onSave={onSave}
              onDelete={onDeletePlatformType}
            />
          )
        }
        {
          currentActiveTab === AdminTabs.Forces && (
            <SettingForces
              iconUploadUrl={iconUploadUrl}
              forces={forces}
              onChange={onForcesChange}
              onSave={onSave}
              onSidebarClick={onSidebarForcesClick}
              onCreate={onCreateForce}
              onDelete={onDeleteForce}
              selectedForce={selectedForce}
              platformTypes={platformTypes?.platformTypes}
              onDeleteGameControl={onDeleteGameControl}
            />
          )
        }
        {
          currentActiveTab === AdminTabs.Channels && (
            <SettingChannels
              channels={channels}
              onChange={onChannelsChange}
              onSave={onSave}
              onSidebarClick={onSidebarChannelsClick}
              onCreate={onCreateChannel}
              onDelete={onDeleteChannel}
              onDuplicate={onDuplicateChannel}
              forces={forces}
              selectedChannel={selectedChannel}
              messageTemplates={messageTemplates}
            />
          )
        }
      </AdminContent>
    </AdminLayout>
  )
}

export default GameSetup
