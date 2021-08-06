import FlexLayout, { TabNode, TabSetNode } from 'flexlayout-react'
import { PlayerUi } from '@serge/custom-types'
import _ from 'lodash'
import findChannelByName from './findChannelByName'

const tabRender = (state: PlayerUi): (node: TabNode) => void => {
  return (node: TabNode): void => {
    setTimeout(() => {
      const tabSetNode = node.getParent() as TabSetNode
      const nodeClassName = node.getClassName() || ''
      if (!tabSetNode.isMaximized() && node.getModel().getMaximizedTabset()) {
          if (nodeClassName !== 'hide-node') {
            node.getModel().doAction(FlexLayout.Actions.updateNodeAttributes(node.getId(), { className: 'hide-node' }))
          }
      } else {
        if (nodeClassName === 'hide-node') {
          node.getModel().doAction(FlexLayout.Actions.updateNodeAttributes(node.getId(), { className: '' }))
        }
      }
    })

    let channel: any;

    const addMenuItemMsgCount = (className: string) => {
      if (!className) return
      const overflowBtn = document.getElementsByClassName('flexlayout__tab_button_overflow')
      if (overflowBtn.length) {
        overflowBtn[0].addEventListener('click', () => {
          setTimeout(() => {
            const menuItems = document.getElementsByClassName('flexlayout__popup_menu_item')
            Array.from(menuItems).forEach((menuItem: Element) => {
              if (menuItem.textContent === node.getName()) {
                menuItem.classList.add(className)
              }
            })
          });
        })
      }
    }

    const setUnreadClassName = (className: string): void => {
      const nodeClassName = node.getClassName() || ''
      if (nodeClassName !== className && nodeClassName !== 'hide-node') {
        node.getModel().doAction(FlexLayout.Actions.updateNodeAttributes(node.getId(), { className }))
      }
    };

    if (!_.isEmpty(state.channels)) {
      const matchedChannel = findChannelByName(state.channels, node.getName())
      channel = matchedChannel && matchedChannel.length > 1 ? matchedChannel[1] : undefined

      if (channel !== undefined) {
        const className = !channel.unreadMessageCount ?
          '' : channel.unreadMessageCount < 9 ?
            `unread-${channel.unreadMessageCount}` : 'unread-9plus'
        setTimeout(() => {
          setUnreadClassName(className)
          addMenuItemMsgCount(className)
        })
      }
    }
  }
}
export default tabRender
