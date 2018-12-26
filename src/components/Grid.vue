<template name="grid">
  <div class="table-container">
    <div class="table-header grid-header">
      <p v-if="targetObject.name" class="big-font grid-title">Affinity Index for {{targetObject ? targetObject.name : ''}} showing {{data.length}} of {{totalItemCount}} items</p>
      <div class="grid-export-link">
        <a @click="exportCsv()">Export as CSV</a>
        <div class="export-link-separator"></div>
        <a @click="exportXls()">Export as XLS</a>
      </div>
    </div>
    <div class="table-content">
      <div class="content-table">
        <div class="content-body">
          <div class="grid-content uk-overflow-auto">
            <table id="grid-data" class="uk-table uk-table-striped uk-table-small grid-content">
              <thead>
              <tr>
                <th v-for="column in columns"
                    @click="sortBy(column.fieldName)"
                    :class="{ active: sortKey == column.fieldName }">
                  <p v-bind:style="{'text-align' : column.align}">
                    {{ column.name }}
                    <span v-if="column.name === 'Affinity Index'"  class="help"><img src="/static/img/Tooltip-icon.svg"/></span>
                    <span v-if="column.name === 'Affinity Index'" class="tooltip">Average affinity score across all the selected properties, normalized to 100</span>
                    <span class="arrow" :class="sortOrder > 0 && sortKey == column.fieldName ? 'asc' : 'dsc'"></span>
                  </p>
                </th>
              </tr>
              </thead>
              <tbody class="table-hover">
              <tr v-for="entry in sortedData">
                <td v-for="column in columns" v-bind:style="{'text-align' : column.align}">
                  {{entry[column.fieldName] | numberToString}}
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import _ from 'lodash'
  var Blob = require('blob')
  var XLSX = require('xlsx')
  var XLSX_STYLE = require('xlsx-style')
  var FileSaver = require('file-saver')

  const FILENAME = 'PD_Export'

  export default {
    name: 'grid',
    props: {
      data: Array,
      targetObject: Object,
      columns: Array,
      totalItemCount: Number,
      startDate: String,
      endDate: String,
      filterFields: Array,
      filterValues: Object
    },
    data () {
      return {
        sortKey: 'latest_fans',
        sortOrder: -1
      }
    },
    computed: {
      sortedData: function () {
        var self = this
        var result = JSON.parse(JSON.stringify(self.data))

        if (self.sortKey) {
          result = result.sort(function (a, b) {
            var value1 = a[self.sortKey]
            var value2 = b[self.sortKey]
            return (value1 === value2 ? 0 : value1 > value2 ? 1 : -1) * self.sortOrder
          })
        }

        _.each(result, function (row) {
          if (!row.normalized_affinity) {
            row.normalized_affinity = 'N/A'
          }
        })
        return result
      }
    },
    filters: {
      numberToString: function (number) {
        if (typeof number === 'number' && number % 1 === 0) {
          return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        }
        return number
      }
    },
    methods: {
      sortBy: function (key) {
        if (this.sortKey === key) {
          this.sortOrder = this.sortOrder * -1
        } else {
          this.sortKey = key
          this.sortOrder = -1
        }
      },
      exportXls: function () {
        let self = this
        let data = []

        // Populate info data
        let field = ['Target Property', self.targetObject.name]
        data.push(field)

        field = ['Compared Properties', this.getComparedPropertiesString()]
        data.push(field)

        // Date Range
        field = ['Date Range', this.getDateRangeString()]
        data.push(field)

        // Filters Applied
        field = ['Filters Applied', this.getFiltersAppliedString()]
        data.push(field)

        let infoCellAddresses = []
        for (let i = 0; i < data.length; i++) {
          infoCellAddresses.push('A' + (i + 1))
        }

        // add empty lines between info and data
        data.push([])
        data.push([])

        // titles for data header cells
        let columnNames = [
          'Name',
          'Affinity Index',
          'Fans',
          'Unique Engaged Audience',
          'Actions',
          'Actions per post',
          'Posts',
          'Video Views',
          'Video Actions']

//        TODO maybe rename normalized_affinity to affinity_index in backend?
        // object property names corresponding to data header cells titles
        let propertyNames = [
          'name',
          'normalized_affinity',
          'latest_fans',
          'unique_engaged_audience',
          'total_actions',
          'actions_per_post',
          'post_count',
          'native_video_views',
          'video_likes']

        // add grid headers
        data.push(columnNames)
        let dataHeaderRowIndex = data.length

        // determine column widths, add a starting value of 18 which is the widest of info columns 'Compared Properties'
        let columnWidths = [18]
        let wsCols = []

        for (let i = 0; i < columnNames.length; i++) {
          if (!columnWidths[i] || (columnWidths[i] < columnNames[i].length)) {
            columnWidths[i] = columnNames[i].length
          }
        }
        // add grid data
        _.each(self.sortedData, (row) => {
          let dataRow = []

          for (let i = 0; i < propertyNames.length; i++) {
            let cellData = row[propertyNames[i]]
            dataRow.push(cellData)

            if (!columnWidths[i] || (columnWidths[i] < cellData.toString().length)) {
              columnWidths[i] = cellData.toString().length
            }

            wsCols[i] = {wch: columnWidths[i] + 2}
          }
          data.push(dataRow)
        })

        let ws = XLSX.utils.aoa_to_sheet(data)

        _.each(Object.keys(ws), (key) => {
          console.log(key)
        })

        // Apply styling for all items in first row and left columns for comparison info
        let headerCellAddresses = _.filter(Object.keys(ws), (key) => {
          // We only want the keys for the first row's cells
          return !key.includes('!') && key.replace(/\D+/g, '') === dataHeaderRowIndex.toString()
        })

        // add bold style to info left columns and first data header title cell
        let boldStyle = {
          'font': {
            'bold': true
          }
        }

        _.each(infoCellAddresses, (address) => {
          ws[address].s = boldStyle
        })

        ws[headerCellAddresses[0]].s = {
          'font': {
            'bold': true,
            'underline': true
          }
        }

        // add bold style with right to the rest of data header title cells,
        // must be done separately to avoid style overwriting
        let boldAlignRightStyle = {
          'font': {
            'bold': true,
            'underline': true
          },
          'alignment': {
            'horizontal': 'right'
          }
        }

        for (let i = 1; i < headerCellAddresses.length; i++) {
          ws[headerCellAddresses[i]].s = boldAlignRightStyle
        }

        // assign column widths to sheet
        ws['!cols'] = wsCols

        /* blank workbook constructor */
        let wb = XLSX.utils.book_new()
        /* add worksheet to workbook */
        XLSX.utils.book_append_sheet(wb, ws, 'ComparisonData')

        // Write Options
        let writeOptions = {bookType: 'xlsx', bookSST: false, type: 'binary'}
        // Use xlsx-style to write object, to have styling written as well
        let wbOut = XLSX_STYLE.write(wb, writeOptions)

        // Save File
        FileSaver.saveAs(new Blob([this.stringToArrayBuffer(wbOut)], {type: 'application/octet-strea'}), FILENAME + '.xlsx')
      },
      stringToArrayBuffer: function (stringToConvert) {
        let buf = new ArrayBuffer(stringToConvert.length)
        let view = new Uint8Array(buf)
        for (let i = 0; i !== stringToConvert.length; ++i) {
          view[i] = stringToConvert.charCodeAt(i) & 0xFF
        }
        return buf
      },
      getComparedPropertiesString: function () {
        let valuesToAdd = []
        let self = this
        _.each(self.data, function (item) {
          valuesToAdd.push(item.name)
        })

        return valuesToAdd.join(', ')
      },
      getDateRangeString: function () {
        if (this.startDate !== this.endDate) {
          return [this.startDate, this.endDate].join(' ')
        } else {
          return this.startDate
        }
      },
      getFiltersAppliedString: function () {
        let valuesToAdd = []
        let self = this
        _.each(self.filterFields, function (filter) {
          let filterString = ''
          let filterValues = self.filterValues[filter.fieldName]
          if (filterValues) {
            if (filterValues[0] !== 0) {
              filterString += filterValues[0] + ' < '
            }
            filterString += filter.name
            if (filterValues[1]) {
              filterString += ' < ' + filterValues[1]
            }
          }
          valuesToAdd.push(filterString)
        })
        return valuesToAdd.join(', ')
      },
      exportCsv: function () {
        let self = this
        let csvRows = []

        // Target Property
        let field = ['Target Property', self.targetObject.name]
        csvRows.push(field.join(','))

        // Compared Properties
        field = ['Compared Properties', '"' + this.getComparedPropertiesString() + '"']
        csvRows.push(field.join(','))

        // Date Range
        field = ['Date Range', '"' + this.getDateRangeString() + '"']
        csvRows.push(field.join(','))

        // Filters Applied
        field = ['Filters Applied', '"' + this.getFiltersAppliedString() + '"']
        csvRows.push(field.join(','))

        // Add empty line before table
        csvRows.push('\n')

        // Grid column names
        let valuesToAdd = []
        _.each(self.columns, function (col) {
          valuesToAdd.push(col.name)
        })
        csvRows.push(valuesToAdd.join(','))

        // Grid column values
        _.each(self.sortedData, function (row) {
          let valuesToAdd = []
          _.each(self.columns, function (col) {
            valuesToAdd.push(row[col.fieldName])
          })
          csvRows.push(valuesToAdd.join(','))
        })

        // Generate CSV string
        let csvString = csvRows.join('\n')
        let a = document.createElement('a')
        a.href = 'data:attachment/csv,' + encodeURIComponent(csvString)
        a.target = '_blank'
        a.download = FILENAME + '.csv'

        document.body.appendChild(a)
        a.click()
      }
    }
  }
</script>

<style lang="sass">

  body
    margin: 0
    padding: 0

    @font-face
      font-family: "Book"
      src: url(/static/fonts/GothamRndSSm-Book.otf) format("opentype")

    .table-container
      position: relative
      min-height: 250px

    .grid-header
      display: grid
      grid-template-columns: auto auto auto
      grid-template-areas: "grid-title grid-export-link grid-export-link"

    .grid-title
      grid-area: grid-title

    .grid-export-link
      display: inline-block
      grid-area: grid-export-link
      text-align: right
      margin-right: 18px

    .export-link-separator
      width: 2px
      height: 1em
      display: inline-block
      margin-left: 10px
      margin-right: 10px

    .table-header
      min-height: 40px
      padding-top: 20px
      padding-left: 20px
      border-bottom: 1px solid #CCCCCC!important

    .table-header p
      font-family: "Book", sans-serif !important
      color: #666666

    .table-header a
      font-family: "Medium", sans-serif !important

    .medium-font
      font-size: 14px !important

    .small-font
      font-size: 12px !important

    p
      font-family: "Book", sans-serif !important
      color: #FFFFFF

    table
      width: 100%

    .grid-content
      color: #444 !important

    .uk-table th
      color: black !important
      text-transform: initial !important

    .uk-table-small th
      padding: 5px 5px

    .table-container .uk-table-small th p
      font-size: 13px !important
      text-align: center

    .table-container .uk-table-small td
      font-size: 13px !important
      text-align: right

    .uk-table-striped tbody tr:nth-of-type(odd),
    .uk-table-striped>tr:nth-of-type(odd)
      background: rgba(52, 152, 219, 0.1) !important

    th.active
      color: #4d4d4d palette !important

    th.active .arrow
      opacity: 1

    th
      background-color: #3498DB
      min-width: 100px

    th p
      margin: auto

    tr
      border-color: #FFFFFF !important

    tr:hover
      background: rgba(52, 152, 219, 0.3) !important

    .arrow
      display: inline-block
      vertical-align: middle
      width: 0
      height: 0
      margin-left: 5px
      opacity: 1

    .arrow.asc
      border-left: 4px solid transparent
      border-right: 4px solid transparent
      border-bottom: 4px solid #fff

    .arrow.dsc
      border-left: 4px solid transparent
      border-right: 4px solid transparent
      border-top: 4px solid #fff

    .tooltip
      visibility: hidden
      position: absolute
      margin-top: 25px
      margin-left: -105px
      padding: 15px
      background: #FFFFFF
      color: black
      border: 1px solid #3498db
      border-radius: 8px

    .help img
      margin: auto
      display: inline-block
      width: 15px

    .help:hover ~ .tooltip
      visibility: visible
</style>
