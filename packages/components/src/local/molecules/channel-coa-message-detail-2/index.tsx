import React, { useEffect, useState } from 'react'
import moment from 'moment'
/* Import Types */
import Props, { DialogModalStatus } from './types/props'

/* Import Stylesheet */
import styles from './styles.module.scss'

/* Import Components */
import Textarea from '../../atoms/textarea'
import Button from '../../atoms/button'
import DialogModal from '../../atoms/dialog'
import SplitButton from '../../atoms/split-button'

/* Import Icons */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserSecret } from '@fortawesome/free-solid-svg-icons'

import { CollaborativeMessageStates2, CollaborativePermission, expiredStorage } from '@serge/config'
import JsonEditor from '../json-editor'
import { FeedbackItem, ForceRole, MessageCustom } from '@serge/custom-types'
import Collapsible from '../../helper-elements/collapsible'
import { Action, actionsFor, ActionTable, ASSIGN_MESSAGE, CLAIM_MESSAGE, createActionTable, SAVE_MESSAGE, SUBMIT_FOR_REVIEW } from './helpers/actions-for'
import { ClaimFunc, CoreFunc, SubmitFunc } from './helpers/handlers'

const labelFactory = (id: string, label: string): React.ReactNode => (
  <label htmlFor={id}><FontAwesomeIcon size='1x' icon={faUserSecret} /> {label}</label>
)

/** for the specified channel, provide a list of people who
 * can have documents assigned to them
 */
const getCandidates = (assignees: ForceRole[]): string[] => {
  return assignees.map((assignee: ForceRole) =>
    `${assignee.forceName} - ${assignee.roleName}`
  )
}

/** from the provided force & role, produce a ForceRole object */
const roleFromName = (selection: string, assignees: ForceRole[]): ForceRole => {
  // unpack the fields
  const fields = selection.split(' - ')
  const force = fields[0]
  const rolename = fields[1]
  const match = assignees.find((role: ForceRole) => {
    return role.forceName === force && role.roleName === rolename
  })
  if (match) {
    return match
  }
  throw new Error('Failed to find role for force:' + force + ' role:' + rolename)
}

const getOpenModalStatus = (key: string): DialogModalStatus => {
  return JSON.parse(expiredStorage.getItem(key) || '{}')
}

const formatFeedback = (feedback: FeedbackItem): string => {
  return moment(feedback.date).format('YYYY-MM-DD HH:mm') +
    ' [' + feedback.fromForce + '-' + feedback.fromName + '] ' +
    feedback.feedback
}

const CollapsedFeedbackList = ({ onExpand, collapsed, feedback }: any): React.ReactElement => {
  const multipleFeedback = feedback.length > 1
  const handleOnExpand = (): void => {
    multipleFeedback && onExpand(!collapsed)
  }

  const renderReadIcon = (): React.ReactNode => {
    return <>
      {multipleFeedback && (collapsed ? '+' : '-')}
    </>
  }
  return (
    <div className={styles['feedback-header']} onClick={handleOnExpand}>
      <span className={styles['feedback-icon']}>{renderReadIcon()}</span>
      {formatFeedback(feedback[feedback.length - 1])}
    </div>
  )
}

const ExpandedFeedbackList = ({ collapsed, feedback }: any): React.ReactElement => {
  // put in reverse chronological order
  const descending = feedback.slice().reverse()
  return (
    <div className={styles['feedback-content']}>
      {!collapsed && descending.map((item: FeedbackItem, key: number) => {
        if (key > 0) return (<div key={key}>{formatFeedback(item)}</div>)
        else return null
      })}
    </div>
  )
}

const injectFeedback = (message: MessageCustom, verb: string, feedback: string, role: ForceRole): MessageCustom => {
  const verbStr = '[' + verb + '] '
  const withFeedback = verbStr + (feedback || '')
  // put message into feedback item
  const feedbackItem: FeedbackItem =
  {
    fromId: role.roleId,
    fromName: role.roleName,
    fromForce: role.forceName,
    date: new Date().toISOString(),
    feedback: withFeedback
  }
  if (message.details.collaboration) {
    if (!message.details.collaboration.feedback) {
      // create empty array, if necessary
      message.details.collaboration.feedback = []
    }
    message.details.collaboration.feedback.push(feedbackItem)
  }
  return message
}

/* Render component */
export const ChannelCoaMessageDetail2: React.FC<Props> = ({ templates, message, state, onChange, isObserver, isUmpire, role, channelColb, permission, assignees = [], collapseMe, gameDate, onRead, isReaded }) => {
  const [answer, setAnswer] = useState<{ [property: string]: any }>((message.details.collaboration && message.details.collaboration.response2) || {})
  const [newMsg, setNewMsg] = useState<{ [property: string]: any }>({})
  const [candidates, setCandidates] = useState<Array<string>>([])
  const [privateMessage, setPrivateMessage] = useState<string>(message.details.privateMessage || '')
  const [actionTable, setActionTable] = useState<ActionTable | undefined>(undefined)

  const dialogOpenStatusKey = `${message._id}-${role.forceId}-${role.roleId}`
  const dialogModalStatus = getOpenModalStatus(dialogOpenStatusKey)

  const [openDialog, setOpenDialog] = useState<boolean>(dialogModalStatus.open || false)
  const [dialogTitle, setDialogTitle] = useState<string>(dialogModalStatus.title || '')
  const [placeHolder, setPlaceHolder] = useState<string>(dialogModalStatus.placeHolder || '')
  const [content, setModalContent] = useState<string>(dialogModalStatus.content || '')

  const [modalHandler, setModalHandler] = useState<{(message: MessageCustom): void} | undefined>()

  const [openModalStatus, setOpenModalStatus] = useState<DialogModalStatus | undefined>(undefined)

  const { collaboration } = message.details

  if (collaboration !== undefined) {
    const isResponse = !!channelColb.responseTemplate
    const canSeeResponse = permission > CollaborativePermission.CannotCollaborate || state === CollaborativeMessageStates2.Released || isObserver

    const docBeingEdited = state === CollaborativeMessageStates2.InProgress
    const roleIsOwner = collaboration.owner && collaboration.owner.roleId === role.roleId
    const formIsEditable = docBeingEdited && roleIsOwner

    /**
     * create the actions table for this user/channel
     */
    useEffect(() => {
      setActionTable(createActionTable(channelColb.approveVerbs, channelColb.requestChangesVerbs, channelColb.releaseVerbs, isResponse))
    }, [channelColb])

    /**
     * sort out the candidates for the task
     */
    useEffect(() => {
      setCandidates(getCandidates(assignees))
    }, [assignees])

    useEffect(() => {
      if (onRead && isReaded === false) onRead()
    }, [])

    useEffect(() => {
      if (openModalStatus) {
        const { open, title, content = '', placeHolder } = openModalStatus
        // store to local storage for using in case the site is reload while modal is opening
        const currentModalStatus = getOpenModalStatus(dialogOpenStatusKey)

        currentModalStatus.open = open
        setOpenDialog(open)

        if (title) {
          currentModalStatus.title = title
          setDialogTitle(title)
        }

        if (placeHolder) {
          currentModalStatus.placeHolder = placeHolder
          setPlaceHolder(placeHolder)
        }

        currentModalStatus.content = content
        setModalContent(content)

        expiredStorage.setItem(dialogOpenStatusKey, JSON.stringify(currentModalStatus))
      }
    }, [openModalStatus])

    const newMessageHandler = (val: { [property: string]: any }): void => {
      setNewMsg(val)
    }

    const responseHandler = (val: { [property: string]: any }): void => {
      setAnswer(val)
    }

    const notHappeningHandler = (_val: { [property: string]: any }): void => {
      // ignore
    }

    /** Submit new message, and collapse panel, if necessary
     */
    const handleChange = (msg: MessageCustom, collapse: boolean): void => {
      // collapse message, if necessary
      collapse && collapseMe && collapseMe()
      // fire update
      onChange && onChange(msg)
    }

    const onModalValueChange = (content: string): void => {
      setOpenModalStatus({
        open: true,
        content
      })
    }

    const onModalClose = (): void => {
      setOpenDialog(false)
      expiredStorage.removeItem(dialogOpenStatusKey)
    }

    const handleEditingSubmit = (role: ForceRole, verb: string, handler: SubmitFunc): void => {
      // different handling depending upon if it's a response that's being sent
      const updatedPart = isResponse ? answer : newMsg
      const changed = handler(role, verb, message, updatedPart, privateMessage)
      const withFeedback = injectFeedback(changed, verb, '', role)
      handleChange(withFeedback, true)
    }

    const onModalSave = (feedback: string): void => {
      const msgWithFeedback = injectFeedback(message, dialogTitle, feedback, role)

      if (modalHandler) {
        modalHandler(msgWithFeedback)
        // clear the modal handler
        setModalHandler(undefined)
      }
      setOpenDialog(false)
      expiredStorage.removeItem(dialogOpenStatusKey)
    }

    const onPrivateMsgChange = (privateMsg: string): void => {
      console.log('new private message', privateMsg)
      setPrivateMessage(privateMsg)
      // the private msg needs to be stored temporarily in the message object to avoid being lost on rerendering
      message.details.privateMessage = privateMsg
    }

    const handleClaim = (selection: string | undefined, assignee: ForceRole | undefined, role: ForceRole, verb: string, handler: ClaimFunc): void => {
      const assigneeVal = selection ? roleFromName(selection, assignees) : assignee as ForceRole
      // get the force role
      // transform message
      const newMsg = handler(assigneeVal, role, verb, message)
      const msgWithFeedback = injectFeedback(newMsg, verb, selection ? ' to ' + selection : '', role)
      // now send it
      handleChange(msgWithFeedback, false)
    }

    const handleVerb = (requiresFeedback: boolean, role: ForceRole, verb: string, handler: CoreFunc): void => {
      if (requiresFeedback) {
        const quickHandler = (messageWithFeedback: MessageCustom): void => {
          if (messageWithFeedback) {
            const newMsg = handler(role, verb, messageWithFeedback)
            // now send it
            handleChange(newMsg, true)
          }
        }
        // note: it took hours to learn about the following use of function in state.
        // the answer came from here: https://medium.com/swlh/how-to-store-a-function-with-the-usestate-hook-in-react-8a88dd4eede1
        setModalHandler(() => quickHandler)
        setOpenModalStatus({
          open: true,
          title: verb,
          placeHolder: `Reason for ${verb}...`
        })
      } else {
        const newMsg = handler(role, verb, message)
        const msgWithFeedback = injectFeedback(newMsg, verb, '', role)
        // now send it
        handleChange(msgWithFeedback, true)
      }
    }

    /** any feedback in the message */
    const feedback = collaboration.feedback

    // create a single feedback block - we use it in either message type
    const feedbackBlock = (permission > CollaborativePermission.CannotCollaborate || isObserver) && feedback && feedback.length > 0 && (
      <div>
        <div className={styles['feedback-title']}>Feedback</div>
        <div className={styles['feedback-item']}>
          <Collapsible
            header={<CollapsedFeedbackList feedback={feedback} />}
            content={<ExpandedFeedbackList feedback={feedback} />}
          />
        </div>
      </div>)

    const haveData = state !== undefined && permission !== undefined

    // special case. If the message is `in-progress`, we only generate actions for `save` or `submit` if this is the owner
    const inProgress = state === CollaborativeMessageStates2.InProgress
    const saveOrSubmit = (permission === CollaborativePermission.CanEdit) || (permission === CollaborativePermission.CanSubmitForReview)
    const isOwner = role.roleId === collaboration.owner?.roleId
    const showActions = inProgress && saveOrSubmit ? isOwner : true

    const actions = (showActions && actionTable && Object.keys(actionTable).length && haveData) ? actionsFor(actionTable, state, permission) : []

    // reverse the actions, so the lowest permission is on the right
    const reverseActions = actions.reverse()
    const actionButtons = reverseActions.map((action: Action) => {
      const verbs = action.verbs
      return verbs.map((verb: string) => {
        switch (verb) {
          case ASSIGN_MESSAGE:
            return <SplitButton label={'Assign'} key={verb} options={[...candidates]} onClick={(item: string): void => handleClaim(item, undefined, role, verb, action.handler as ClaimFunc)} />
          case CLAIM_MESSAGE:
            return <Button key={verb} customVariant="form-action" size="small" type="button" onClick={(): void => handleClaim(undefined, role, role, verb, action.handler as ClaimFunc)}>{verb}</Button>
          case SAVE_MESSAGE:
          case SUBMIT_FOR_REVIEW:
            return <Button key={verb} customVariant="form-action" size="small" type="button" onClick={(): void => handleEditingSubmit(role, verb, action.handler as SubmitFunc)}>{verb}</Button>
          default: {
            const requiresFeedback = !!action.feedback
            // technically the handler could be `core` or `claim`. We know it's `core`, so cast it.
            return <Button key={verb} customVariant="form-action" size="small" type="button" onClick={(): void => handleVerb(requiresFeedback, role, verb, action.handler as CoreFunc)}>{verb}{requiresFeedback && '*'}</Button>
          }
        }
      })
    })

    return (
      <>
        <div className={styles.main}>
          <DialogModal
            title={dialogTitle}
            value={content}
            open={openDialog}
            onClose={onModalClose}
            onSave={onModalSave}
            onValueChange={onModalValueChange}
            placeholder={placeHolder}
          /><div>DEBUG, to be deleted: State:<i>{state}</i> Owner:<i>{collaboration.owner?.roleName || 'unallocated'}</i> Current:<i>{role.roleName}</i></div>
          <>
            <div key='upper' className={styles.actions}>
              {
                actionButtons
              }
            </div>
            {
              feedbackBlock
            }
            {
              isResponse && <JsonEditor
                messageTemplates={templates}
                messageContent={message.message}
                messageId={`${message._id}_${message.message.Reference}`}
                template={channelColb.newMessageTemplate._id}
                storeNewValue={notHappeningHandler}
                disabled={true}
                gameDate={gameDate}
              />
            }
            { isResponse && canSeeResponse && <JsonEditor
              messageTemplates={templates}
              messageId={`${message._id}_${message.message.Reference}`}
              messageContent={collaboration.response2 || {}}
              template={channelColb.responseTemplate?._id || ''}
              storeNewValue={responseHandler}
              disabled={!formIsEditable}
              title={'Response'}
              gameDate={gameDate}
            />
            }
            {!isResponse && <JsonEditor
              messageTemplates={templates}
              template={channelColb.newMessageTemplate._id}
              messageId={`${message._id}_${message.message.Reference}`}
              messageContent={message.message}
              storeNewValue={newMessageHandler}
              disabled={!formIsEditable}
              gameDate={gameDate} />
            }
            { // only show private field for umpire force(s)
              (isUmpire || isObserver) &&
            <Textarea id={`private_message_${message._id}`} value={privateMessage} onChange={(nextValue): void => onPrivateMsgChange(nextValue)}
              disabled={state !== CollaborativeMessageStates2.InProgress || !isUmpire} label='Private Message' labelFactory={labelFactory} />
            }
            <div key='lower' className={styles.actions}>
              {
                actionButtons
              }
            </div>
          </>
        </div>
      </>
    )
  } else {
    return <></>
  }
}

export default ChannelCoaMessageDetail2