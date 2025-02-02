import cx from 'classnames'
import orderBy from 'lodash/orderBy'
import moment from 'moment'
import React, { ReactElement } from 'react'
import { Column, Row } from '../../../Components/local/react-table/types/props'
import styles from '../styles.module.scss'
import { PlayerLogModal } from '../types/props'

type PlayerLogDataTable = {
  columns: Column[]
  rows: Row[]
  customStyles: any
}
type ColumnListItem = {
  label: string
  field: string
}
export const genPlayerLogDataTable = (rows: PlayerLogModal[]): PlayerLogDataTable => {
  const sortCol = (str1: string | React.ReactElement, str2: string | React.ReactElement): number => {
    if (!str1 || !str2) {
      return 1
    }
    if (typeof str1 === 'string' && typeof str2 === 'string') {
      return str1 > str2 ? 1 : -1
    }
    const a = (str1 as unknown as ReactElement).props.children
    const b = (str2 as unknown as ReactElement).props.children
    return a > b ? 1 : -1
  }

  const sortedRows = orderBy(rows, 'lastMessage', 'desc')

  const cellRender = (row: Row, col: ColumnListItem): string | React.ReactElement => {
    switch (col.field) {
      case 'forceName':
        return (
          <span className={styles['custom-cell']}>
            <div className={styles['role-icon']} style={{ backgroundColor: row.forceColor }} />
            {row[col.field]}
          </span>
        )

      case 'lastActive':
        return (
          <span className={styles['custom-cell']}>
            <div className={cx({ [styles['role-icon']]: true, [styles.active]: row.active, [styles.inactive]: !row.active })} />
            {row[col.field] ? moment(row[col.field]).fromNow() : 'N/A'}
          </span>
        )
      case 'lastMessage':
        return row[col.field] ? moment(row[col.field]).fromNow() : 'N/A'

      default:
        return row[col.field]
    }
  }

  const columnsList: ColumnListItem[] = [
    { label: 'Force', field: 'forceName' },
    { label: 'Role', field: 'roleName' },
    { label: 'Last activity', field: 'lastActivity' },
    { label: 'Active at', field: 'lastActive' },
    { label: 'Last Msg', field: 'message' },
    { label: 'Sent at', field: 'lastMessage' }
  ]

  const columns = columnsList.map(col => {
    return {
      name: col.label,
      field: col.field,
      selector: (row: Row): string | React.ReactElement => cellRender(row, col),
      sortable: true,
      sortFunction: (rowA: Row, rowB: Row): number => sortCol(rowA[col.field], rowB[col.field]),
      colFilter: ['forceName', 'roleName', 'message', 'lastActivity'].includes(col.field),
      width: ['lastActive', 'lastActivity'].includes(col.field) ? '250px' : '150px'
    }
  })

  const customStyles = {
    headRow: {
      style: {
        borderTopStyle: 'solid',
        borderTopWidth: '1px',
        borderTopColor: '#3ef1ea',
        fontWeight: 'bold',
        fontSize: 'initial',
        backgroundColor: '#012858',
        color: 'white'
      }
    },
    headCells: {
      style: {
        borderLeftStyle: 'solid',
        borderLeftWidth: '1px',
        borderRightColor: 'white'
      }
    }
  }

  return {
    columns,
    rows: sortedRows,
    customStyles
  }
}
