import { faBan, faSearchMinus, faSearchPlus, faSkull } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import MaterialTable, { Action, Column, EditCellColumnDef, MTableBody, MTableBodyRow } from '@material-table/core'
import { SUPPORT_PANEL_LAYOUT } from 'src/config'
import cx from 'classnames'
import { isEqual, uniq } from 'lodash'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { needToUpdate } from '../planning-messages-list/helpers/genData'
import { OrderRow } from '../planning-messages-list/types/props'
import { SupportPanelContext } from '../support-panel'
import { TAB_MY_FORCE, TAB_OPP_FOR } from '../support-panel/constants'
import { getFilterApplied, getIsFilterState } from '../support-panel/helpers/caching-utils'
import { materialIcons } from '../support-panel/helpers/material-icons'
import { getColumns } from './helpers/collate-assets'
import CustomFilterRow from './helpers/custom-filter-row'
import styles from './styles.module.scss'
import PropTypes, { AssetRow } from './types/props'

export const PlanningAssets: React.FC<PropTypes> = ({
  assets, forces, playerForce, opFor, platformStyles,
  onSelectionChange, onVisibleRowsChange, onVisibleColumnsChange
}: PropTypes) => {
  const [initialised, setInitialised] = useState<boolean>(false)
  const [rows, setRows] = useState<AssetRow[]>([])
  const [columns, setColumns] = useState<Column<any>[]>([])

  const [showColumnFilters, setFilter] = useState<boolean>(true)
  const [showDead, setShowDead] = useState<boolean>(false)
  const preventScroll = useRef<boolean>(false)
  const { selectedAssets, assetsCache, onSupportPanelLayoutChange, getSupportPanelState } = useContext(SupportPanelContext)

  const [visibleRows, setVisibleRows] = useState<AssetRow[]>([])
  const [visibleRowsCache, setVisibleRowsCache] = useState<string[]>([])

  const [selectedAssetsInThisTable, setSelectedAssetsInThisTable] = useState<boolean>(false)
  const [toolbarActions, setToolbarActions] = useState<Action<AssetRow>[]>([])

  const currentColumnsData = useRef<Column<OrderRow>[]>([])

  // reference to table, we use it to clear the selection
  const tableRef = useRef<typeof MaterialTable | undefined>(null)

  const panelState = useMemo(() => getSupportPanelState(), [])

  useEffect(() => {
    const key = opFor ? TAB_OPP_FOR : TAB_MY_FORCE
    const isFilterState = getIsFilterState(panelState)
    if (isFilterState[key] && isFilterState[key] !== showColumnFilters) {
      setTimeout(() => {
        setFilter(isFilterState[key])
      })
    }
  }, [])

  useEffect(() => {
    const res: Action<AssetRow>[] =
      [
        {
          icon: () => <FontAwesomeIcon title='Clear selection' icon={faBan} />,
          iconProps: { color: 'action' },
          tooltip: 'Clear seleced assets',
          isFreeAction: false,
          disabled: !selectedAssetsInThisTable,
          onClick: (): void => clearSelectedAssets()
        },
        {
          icon: () => <FontAwesomeIcon title='Clear selection' icon={faBan} />,
          iconProps: { color: 'action' },
          tooltip: 'Clear seleced assets',
          isFreeAction: true,
          disabled: false,
          onClick: (): void => clearSelectedAssets()
        },
        {
          icon: () => <FontAwesomeIcon title='Show dead asset' icon={faSkull} className={cx({ [styles.selected]: showDead })} />,
          iconProps: showDead ? { color: 'action' } : { color: 'disabled' },
          tooltip: !showDead ? 'Show dead assets' : 'Hide dead assets',
          isFreeAction: true,
          onClick: (): void => setShowDead(!showDead)
        },
        {
          icon: () => <FontAwesomeIcon title='Show filter controls' icon={showColumnFilters ? faSearchMinus : faSearchPlus} className={cx({ [styles.selected]: showColumnFilters })} />,
          iconProps: showColumnFilters ? { color: 'action' } : { color: 'disabled' },
          tooltip: !showColumnFilters ? 'Show filter controls' : 'Hide filter controls',
          isFreeAction: true,
          onClick: (): void => {
            setFilter(!showColumnFilters)
            const key = opFor ? TAB_OPP_FOR : TAB_MY_FORCE
            const isFilterState = getIsFilterState(panelState)
            isFilterState[key] = !showColumnFilters
            onSupportPanelLayoutChange(SUPPORT_PANEL_LAYOUT.IS_FILTER, JSON.stringify(isFilterState))
            // reset filters applied when toggle off filter state
            if (showColumnFilters) {
              const filtersApplied = getFilterApplied(panelState)
              delete filtersApplied[key]
              onSupportPanelLayoutChange(SUPPORT_PANEL_LAYOUT.FILTER_APPLIED, JSON.stringify(filtersApplied))
            }
          }
        }
      ]

    setToolbarActions(res)
  }, [showColumnFilters, showDead, selectedAssetsInThisTable, opFor])

  useEffect(() => {
    // we're getting too many visibleRows updates, plus
    // the content of visible rows will change if
    // set of ids
    const visibleRowIds = visibleRows.map((item) => item.id)
    if (!isEqual(visibleRowIds, visibleRowsCache)) {
      console.log('update visible rows', visibleRowIds.length)
      // fire the change
      setVisibleRowsCache(visibleRowIds)
      // fire the change
      onVisibleRowsChange && onVisibleRowsChange(visibleRows)

      // also update the filters
      // BIG PICTURE: for columns that have a filter, we will ensure it contains the full set of possible values for
      // that column, so the user can expand the selection.  But, if the column does not have a filter applied,
      // then restrict it to current values in the dataset.
      console.time('LLOG_UpdateAssetSearchFields')
      const allColumns = getColumns(opFor, forces, playerForce.uniqid, platformStyles, assetsCache)
      console.timeEnd('LLOG_UpdateAssetSearchFields')
      // const cached = cachedColumns
      // // see if any filters have been relaxed. If they have, we need to relax the filters in other columns
      // const relaxedColumns = columns.filter((column) => {
      //   const currentColDef = column as EditCellColumnDef
      //   const currentFilter = currentColDef.tableData.filterValue
      //   const currentFiltersApplied = Array.isArray(currentFilter) ? (currentFilter as string[]).length : undefined
      //   const cachedColumn = cached.find((item) => item.field === column.field)
      //   if (cachedColumn) {
      //     const cachedColDef = cachedColumn as EditCellColumnDef
      //     const cachedFilter = cachedColDef.tableData.filterValue
      //     const cachedFiltersApplied = Array.isArray(cachedFilter) ? (cachedFilter as string[]).length : undefined
      //     console.log('column', column.field, currentFilter, currentFiltersApplied, cachedFiltersApplied)
      //     if (currentFiltersApplied !== undefined && cachedFiltersApplied !== undefined) {
      //       return cachedFiltersApplied > currentFiltersApplied
      //     }
      //   }
      //   return false
      // })
      // const relaxedColumnIDs = relaxedColumns.map((item) => item.field)
      // console.log('relaxed filters', relaxedColumnIDs)

      // log current table lookups and filters
      // console.table(columns.map((column) => {
      //   const colDef = column as EditCellColumnDef
      //   return {
      //     id: column.field,
      //     lookup: column.lookup ? Object.keys(column.lookup as {}).length : 'n/a',
      //     filter: colDef.tableData.filterValue
      //   }
      // }))

      columns.forEach((column) => {
        const safeCol = allColumns.find((item) => item.field === column.field)
        if (safeCol) {
          // is filter applied?
          const colDef = column as EditCellColumnDef
          if (column.lookup) {
            const filter = colDef.tableData.filterValue
            const filterApplied = Array.isArray(filter) && (filter as string[]).length > 0
            // this is a lookup column, sort out the values
            if (filterApplied) {
              // leave it as - is
              // // only relax it if it is not one of the ones that got relaxed
              // if (!relaxedColumnIDs.includes(column.field)) {
              //   // ok, this column should have the full list, so it can be extended
              //   console.log('restoring', column.field, relaxedColumnIDs, safeCol.lookup)
              //   column.lookup = safeCol.lookup
              // }
            } else {
              // ok, no filter is applied
              const colId = colDef.field as string
              // ok, filter this column according to current rows
              const vals = visibleRows.map((row: AssetRow) => row[colId])
              if (vals.length) {
                const uniqueVals = uniq(vals)
                if (safeCol.lookup) {
                  const newDict = {}
                  Object.keys(safeCol.lookup).forEach((value) => {
                    if (safeCol.lookup) {
                      if (uniqueVals.includes(value)) {
                        newDict[value] = safeCol.lookup[value]
                      }
                    }
                  })
                  // trim lookup
                  column.lookup = newDict
                }
              }
            }
          }
        }
      })
      setColumns(columns)
    }
  }, [visibleRows])

  useEffect(() => {
    const columns = getColumns(opFor, forces, playerForce.uniqid, platformStyles, assetsCache)
    const needUpdate = needToUpdate(currentColumnsData.current, columns)
    if (!columns.length || !showColumnFilters || needUpdate) {
      const cachedColumns = panelState[SUPPORT_PANEL_LAYOUT.VISIBLE_COLUMNS]
      if (cachedColumns) {
        const parsedCols: { [x: string]: { field: string, hidden: string }[] } = JSON.parse(cachedColumns)
        const key = opFor ? TAB_OPP_FOR : TAB_MY_FORCE;
        (parsedCols[key] || []).map(mapCol => {
          columns.some(col => {
            if (col.field === mapCol.field) {
              col.hidden = Boolean(mapCol.hidden)
              return true
            }
            return false
          })
        })
      }
      currentColumnsData.current = columns
      setColumns(columns)
    }
  }, [playerForce, forces, showColumnFilters])

  useEffect(() => {
    if (!showColumnFilters || !initialised) {
      const assetsOfInterest = showDead ? assets : assets.filter((asset) => (asset.health && asset.health > 0) || (asset.health === undefined))
      setInitialised(false)
      setRows(assetsOfInterest)
    }
  }, [assets, showColumnFilters, showDead, initialised])

  useEffect(() => {
    if (selectedAssets.length) {
      // if it's not all assets, scroll to the last one
      if (selectedAssets.length !== visibleRows.length) {
        const lastSelectedAssetId = selectedAssets[selectedAssets.length - 1]
        const elmRow = document.getElementById(lastSelectedAssetId)
        if (elmRow && !preventScroll.current) {
          const smoothScroll: ScrollIntoViewOptions = { block: 'start', behavior: 'smooth' }
          elmRow.scrollIntoView(smoothScroll)
        }
      }
      const assetsInSelection = assets.some((row) => selectedAssets.includes(row.id))
      // see if any of the selected assets in in this table
      setSelectedAssetsInThisTable(assetsInSelection)
    } else {
      setSelectedAssetsInThisTable(false)
    }
    preventScroll.current = false
  }, [selectedAssets, assets])

  const onSelectionChangeLocal = (rows: AssetRow[]) => {
    preventScroll.current = !!rows.length
    onSelectionChange && onSelectionChange(rows)
  }

  const clearSelectedAssets = (): void => {
    // clear the table selection - this will also fire the
    // selection handler in the parent
    if (tableRef.current) {
      const table = tableRef.current as any
      table.onAllSelected(false)
    }
  }

  const TableData = useMemo(() => {
    return <MaterialTable
      title={opFor ? 'Other force assets' : 'Own force Assets'}
      tableRef={tableRef}
      columns={columns}
      data={rows}
      actions={toolbarActions}
      icons={materialIcons as any}
      options={{
        paging: true,
        pageSize: 100,
        pageSizeOptions: [20, 50, 100, 200, 500],
        filtering: showColumnFilters,
        selection: true,
        emptyRowsWhenPaging: false,
        rowStyle: { fontSize: '80%' },
        columnsButton: true
      }}
      onSelectionChange={onSelectionChangeLocal}
      components={{
        Body: (props): React.ReactElement => {
          if (props.columns.length) {
            setTimeout(() => {
              setVisibleRows(props.data)
              onVisibleColumnsChange && onVisibleColumnsChange(props.columns)
            })
          }
          return (<MTableBody
            {...props}
          />)
        },
        Row: props => <MTableBodyRow id={props.data.id} {...props} />,
        FilterRow: props => <CustomFilterRow
          {...props}
          cacheKey={opFor ? TAB_OPP_FOR : TAB_MY_FORCE}
          onSupportPanelLayoutChange={onSupportPanelLayoutChange}
          getSupportPanelState={getSupportPanelState}
        />
      }}
    />
  }, [rows, showColumnFilters, columns, toolbarActions])

  return TableData
}

export default PlanningAssets
