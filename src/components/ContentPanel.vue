<template>
  <div>
    <div class="slider-header">
      <div class="show-slider-panel">
        <a @click="showSliders=!showSliders">
          <span>More Filters</span>
          <span uk-icon="icon: triangle-down; ratio: 1.5" v-show="showSliders === false"/>
          <span uk-icon="icon: triangle-up; ratio: 1.5" v-show="showSliders === true"/>
          <span v-show="filteredData.length > maxPropertiesInBubbleChart">
            There are too many properties to show bubble chart, please apply some filters
          </span>
        </a>
      </div>
      <div class="medium-font" v-if="showSliders" ref="moreFilters">
        <div class="slider-container">
          <div>
              Gender:&nbsp;
              <div class="gender-option">
                <label for="radio-total">Total</label>
                <div class="radio-container">
                  <input type="radio" id="radio-total" value="total" v-model="gender">
                  <div class="radio-mask"></div>
                </div>
              </div>
              <div class="gender-option">
                <label for="radio-male">Male</label>
                <div class="radio-container">
                  <input type="radio" id="radio-male" value="male" v-model="gender">
                  <div class="radio-mask"></div>
                </div>
              </div>
              <div class="gender-option">
                <label for="radio-female">Female</label>
                <div class="radio-container">
                  <input type="radio" id="radio-female" value="female" v-model="gender">
                  <div class="radio-mask"></div>
                </div>
              </div>
            <span class="country-select">
              Country:&nbsp;
              <multiselect v-model="country" track-by="value" label="name" placeholder="Choose Country" :options="countryOptions" :show-labels="false">
              </multiselect>
            </span>
          </div>
          <div v-for="field in filterFields" class="slider">
            <span class="slider-label">{{field.name}}</span>
            <vue-slider ref="slider" v-model="filterValues[field.fieldName]" width="72%" :max="maxFilterValues[field.fieldName]" :real-time="true" :formatter="formatSlider" tooltipDir="bottom"></vue-slider>
            <span class="slider-remove"><a @click="removeFilter(field.fieldName)">Remove</a></span>
          </div>
        </div>
        <div class="uk-inline">
          <button id="add-filter-btn" class="uk-button uk-button-default" type="button">Add Filter</button>
          <div uk-dropdown="pos: right-top">
            <div v-for="field in possibleFilterFields" class="addFilterField">
              <span><a @click="addFilter(field.fieldName)">{{field.name}}</a></span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="main-container">
      <div class="main-container-row">
        <div class="container-cell">
          <div class="chart-container" id="bubbleChart" v-if="filteredData.length <= maxPropertiesInBubbleChart">
            <div class="chart-header">
              <div class="chart-title">
                Comparison Chart for {{targetObject ? targetObject.name : ''}}
              </div>
              <div class="chart-logo"></div>
            </div>
            <div class="chart-content">
              <BubbleChart :data="filteredData" :start-date="startDate" :end-date="endDate"></BubbleChart>
            </div>
          </div>
        </div>
      </div>
      <div class="main-container-row">
        <Grid :data="filteredData" :target-object="targetObject" :columns="gridColumns" :total-item-count="data.length" :start-date="startDate" :end-date="endDate" :filter-fields="filterFields" :filter-values="filterValues"></Grid>
      </div>
    </div>
  </div>
</template>

<script>
  import Grid from './Grid'
  import BubbleChart from './BubbleChart'
  import Multiselect from 'vue-multiselect'
  require('vue-multiselect/dist/vue-multiselect.min.css')
  import vueSlider from 'vue-slider-component'
  import _ from 'lodash'

  export default {
    name: 'content-panel',
    components: {Multiselect, Grid, BubbleChart, vueSlider},
    props: {
      targetObject: Object,
      data: Array,
      startDate: String,
      endDate: String
    },
    data () {
      return {
        maxPropertiesInBubbleChart: 20,
        countryOptions: [
          {
            name: 'Total',
            value: 'total'
          },
          {
            name: 'United States',
            value: 'US'
          },
          {
            name: 'Australia',
            value: 'AU'
          },
          {
            name: 'Brazil',
            value: 'BR'
          },
          {
            name: 'Canada',
            value: 'CA'
          },
          {
            name: 'Chile',
            value: 'CL'
          },
          {
            name: 'Colombia',
            value: 'CO'
          },
          {
            name: 'France',
            value: 'FR'
          },
          {
            name: 'Germany',
            value: 'DE'
          },
          {
            name: 'India',
            value: 'IN'
          },
          {
            name: 'Indonesia',
            value: 'ID'
          },
          {
            name: 'Italy',
            value: 'IT'
          },
          {
            name: 'Japan',
            value: 'JP'
          },
          {
            name: 'Mexico',
            value: 'MX'
          },
          {
            name: 'Netherlands',
            value: 'NL'
          },
          {
            name: 'Philippines',
            value: 'PH'
          },
          {
            name: 'Poland',
            value: 'PL'
          },
          {
            name: 'Turkey',
            value: 'TR'
          },
          {
            name: 'Spain',
            value: 'ES'
          },
          {
            name: 'United Kingdom',
            value: 'GB'
          }
        ],
        filterFields: [
          {
            name: 'Unique Engaged Audience',
            fieldName: 'unique_engaged_audience'
          },
          {
            name: 'Actions',
            fieldName: 'total_actions'
          }
        ],
        gridColumns: [
          {
            name: 'Name',
            fieldName: 'name',
            canBeFilter: false,
            adjustForCountry: false,
            align: 'left'
          },
          {
            name: 'Affinity Index',
            fieldName: 'normalized_affinity',
            canBeFilter: true,
            adjustForCountry: false,
            align: 'right'
          },
          {
            name: 'Fans',
            fieldName: 'latest_fans',
            canBeFilter: true,
            genderAdjustmentField: 'engagers_percent_male',
            adjustForCountry: true,
            align: 'right'
          },
          {
            name: 'Unique Engaged Audience',
            fieldName: 'unique_engaged_audience',
            canBeFilter: true,
            genderAdjustmentField: 'engagers_percent_male',
            adjustForCountry: true,
            align: 'right'
          },
          {
            name: 'Actions',
            fieldName: 'total_actions',
            canBeFilter: true,
            genderAdjustmentField: 'actions_percent_male',
            adjustForCountry: true,
            align: 'right'
          },
          {
            name: 'Actions per Post',
            fieldName: 'actions_per_post',
            canBeFilter: true,
            genderAdjustmentField: 'actions_percent_male',
            adjustForCountry: true,
            align: 'right'
          },
          {
            name: 'Posts',
            fieldName: 'post_count',
            canBeFilter: true,
            adjustForCountry: false,
            align: 'right'
          },
          {
            name: 'Video Views',
            fieldName: 'native_video_views',
            canBeFilter: true,
            genderAdjustmentField: 'engagers_percent_male',
            adjustForCountry: true,
            align: 'right'
          },
          {
            name: 'Video Actions',
            fieldName: 'video_likes',
            canBeFilter: true,
            genderAdjustmentField: 'actions_percent_male',
            adjustForCountry: true,
            align: 'right'
          }
        ],
        filterValues: {
          'normalized_affinity': [0, 0],
          'unique_engaged_audience': [0, 0],
          'latest_fans': [0, 0],
          'total_actions': [0, 0],
          'actions_per_post': [0, 0],
          'post_count': [0, 0],
          'native_video_views': [0, 0],
          'video_likes': [0, 0]
        },
        showSliders: false,
        gender: 'total',
        country: {
          name: 'Total',
          value: 'total'
        },
        possibleFilterFields: [
          {
            //        TODO if field changes to affinity_index, also change here
            name: 'Affinity Index',
            fieldName: 'normalized_affinity'
          },
          {
            name: 'Fans',
            fieldName: 'latest_fans'
          },
          {
            name: 'Actions per Post',
            fieldName: 'actions_per_post'
          },
          {
            name: 'Posts',
            fieldName: 'post_count'
          },
          {
            name: 'Video Views',
            fieldName: 'native_video_views'
          },
          {
            name: 'Video Actions',
            fieldName: 'video_likes'
          }
        ]
      }
    },
    watch: {
      data: function (data) {
        this.resetFilters()
      },
      gender: function (gender) {
        this.resetFilters()
      },
      country: function (country) {
        this.resetFilters()
      }
    },
    computed: {
      adjustedData () {
        var self = this
        var result = _.cloneDeep(self.data)

        if (self.gender === 'male') {
          _.each(result, function (row) {
            _.each(self.gridColumns, function (column) {
              if (column.genderAdjustmentField) {
                row[column.fieldName] = Math.round(row[column.fieldName] * (row[column.genderAdjustmentField] / 100))
              }
            })
          })
        } else if (self.gender === 'female') {
          _.each(result, function (row) {
            _.each(self.gridColumns, function (column) {
              if (column.genderAdjustmentField) {
                row[column.fieldName] = Math.round(row[column.fieldName] * ((100 - row[column.genderAdjustmentField]) / 100))
              }
            })
          })
        }

        if (self.country && self.country.value && self.country.value !== 'total') {
          _.each(result, function (row) {
            _.each(self.gridColumns, function (column) {
              if (column.adjustForCountry) {
                row[column.fieldName] = Math.round(row[column.fieldName] * (row['fans_by_country_percentage_' + self.country.value] / 100))
              }
            })
          })
        }

        return result
      },
      maxFilterValues () {
        var self = this
        var result = {}
        _.each(self.filterFields, function (filterField) {
          result[filterField.fieldName] = _.chain(self.adjustedData).map(filterField.fieldName).max().value()
        })
        return result
      },
      filteredData () {
        var self = this
        var result = _.cloneDeep(self.adjustedData)

        _.each(self.filterFields, function (filterField) {
          result = _.filter(result, function (row) {
            var filterValue = self.filterValues[filterField.fieldName]
            if (!filterValue || filterValue.length !== 2) {
              return true
            }
            return row[filterField.fieldName] >= filterValue[0] && row[filterField.fieldName] <= filterValue[1]
          })
        })

        return result
      }
    },
    methods: {
      formatSlider (num) {
        if (num >= 1000000) {
          return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
        }
        if (num >= 1000) {
          return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
        }
        return num
      },
      removeFilter (fieldName) {
        _.remove(this.filterFields, function (filterField) {
          return filterField.fieldName === fieldName
        })
        this.filterValues[fieldName] = [0, this.maxFilterValues[fieldName]]
        this.recomputePossibleFilterFields()
      },
      addFilter (fieldName) {
        var self = this
        _.each(self.gridColumns, function (column) {
          if (column.fieldName === fieldName) {
            self.filterFields.push(column)
          }
        })
        if (self.maxFilterValues[fieldName]) {
          self.filterValues[fieldName] = [0, self.maxFilterValues[fieldName]]
        } else {
          self.filterValues[fieldName] = [0, 0]
        }
        self.recomputePossibleFilterFields()
      },
      resetFilters () {
        var self = this
        _.each(self.filterFields, function (filterField) {
          self.filterValues[filterField.fieldName] = [0, self.maxFilterValues[filterField.fieldName]]
        })
      },
      recomputePossibleFilterFields () {
        var self = this
        self.possibleFilterFields = _.filter(self.gridColumns, function (column) {
          var existingFilterField = _.find(self.filterFields, function (filterField) {
            return filterField.fieldName === column.fieldName
          })
          return column.canBeFilter && !existingFilterField
        })
      },
      documentClick (e) {
        let el = this.$refs.moreFilters
        let target = e.target
        if ((el !== target) && el && !el.contains(target)) {
          this.showSliders = false
        }
      }
    },
    created () {
      document.addEventListener('click', this.documentClick)
    }
  }
</script>

<style lang="sass">
  @font-face
      font-family: "Book"
      src: url(/static/fonts/GothamRndSSm-Book.otf) format("opentype")

  @font-face
      font-family: "Medium"
      src: url(/static/fonts/GothamRndSSm-Medium.otf) format("opentype")

  .big-font
    font-size: 18px !important

  .medium-font
    font-size: 14px !important

  .small-font
    font-size: 12px !important

  .x-small-font
    font-size: 10px !important

  .slider-header
    box-sizing: border-box
    box-shadow: 0px 0px 4px rgba(66, 4, 4, 0.2)
    padding: 20px 50px
    left: 250px
    top: 70px
    position: fixed
    z-index: 10
    width: calc(100% - 250px)
    background: #FFFFFF
    border-bottom: 1px #CCCCCC solid
    font-family: Book, Sans-Serif

  .show-slider-panel a:hover
    text-decoration: none

  .slider-container
    margin-top: 10px
    margin-bottom: 25px
    min-width: 1020px

  .slider
    margin-top: 20px

  .slider-label, .slider-remove
    display: inline-block
    width: 15%
    position: relative
    top: -5px

  .slider-remove
    width: 12%
    text-align: right

  .slider-remove a:hover
    text-decoration: none

  .addFilterLink
    padding: 10px

  .addFilterPanel
    position: absolute
    background: white
    border: solid gray 1px
    border-radius: 3px

  .addFilterPanel a
    color: #666666 !important

  .addFilterPanel a:hover
    color: #cccccc !important
    text-decoration: none

  .addFilterField
    padding: 5px

  a.uk-icon-link, a
    color: #3498DB

  .vue-slider-horizontal, .vue-slider-wrap
    display: inline-block !important

  .vue-slider
    background-color: #e5e9ea !important

  .chart-container, .table-container
    background: #FFFFFF
    border-radius: 5px !important
    box-shadow: 0px 0px 4px rgba(66, 4, 4, 0.2)

  .main-container
    margin-top: 140px
    display: table
    width: unquote("calc(100% - 310px)")
    height: unquote("calc(100% - 70px)")

  .main-container-row
    margin-bottom: 60px
    display: table-row

  .container-cell
      display: table-cell
      vertical-align: middle
      text-align: center

  .chart-header
    position: relative
    min-height: 40px
    padding-top: 20px
    padding-left: 20px
    border-bottom: 1px solid #CCCCCC!important
    font-family: Book, Sans-Serif !important
    color: #666666

  .chart-title
    width: 50%
    text-align: start

  .chart-logo
    position: absolute
    top: 20px
    right: 20px
    width: 131.2px
    height: 17.1px

  .country-select
    display: inline-block
    margin-right: 10px
    margin-left: 45px

  .country-select .multiselect
    display: inline-block
    width: 200px
    top: 15px
    z-index: 40

  ::-webkit-inner-spin-button
    display: none
  ::-webkit-clear-button
    display: none
  ::-webkit-calendar-picker-indicator:hover
    background:none
    cursor: pointer !important
  ::-webkit-calendar-picker-indicator
    color: #3498DB
    background: #FFFFFF

  .chart-header input
    border-radius: 5px !important

  .uk-dropdown
    min-width: 220px
    padding: 15px

  .vue-slider-tooltip
    background-color: #fff !important
    border: none !important
    color: #666 !important
    border-top-color: #fff !important
    border-bottom-color: #fff !important

  .vue-slider-tooltip.vue-slider-tooltip-bottom
    bottom: -3px !important

  .vue-slider-tooltip.vue-slider-tooltip-bottom:before
    opacity: 0

  .slider-container .slider .vue-slider-dot
    background-color: #fff !important
    border: 1px solid #3498DB
    box-shadow: none

  .radio-container input[type=radio]:hover ~.radio-mask::after
    border-color: #3491d4

  .radio-container label:hover ~ .radio-mask::after
    border-color: #3491d4

  .radio-container label:hover ~ .radio-mask::after
    border-color: #3491d4

  .radio-container input[type="radio"]:checked ~.radio-mask::before
    background-color: #3491d4

  .radio-container
    display: inline-block
    position: relative
    width: 16px
    height: 16px
    margin-left: 6px
    top: 3px

  .radio-container input[type="radio"]
    position: absolute
    z-index: 1
    opacity: 0
    margin: auto
    top: 0
    left: 0
    right: 0
    bottom: 0
    cursor: pointer

  .radio-mask::after
    content: ''
    position: absolute
    top: 0
    left: 0
    right: 0
    bottom: 0
    border-radius: 100%
    background-color: transparent
    border: 1px solid
    border-color: #C8C8C8
    transition: border .15s linear
    -webkit-transition: border .15s linear

  .radio-mask::before
    content: ''
    position: absolute
    top: 0
    left: 0
    right: 0
    bottom: 0
    border-radius: 100%
    border-width: 2px
    background-color: transparent
    border-style: solid
    border-color: white
    transition: border .15s linear
    -webkit-transition: border .15s linear

  .gender-option
    display: inline-block
    margin-right: 10px
    margin-left: 15px

  .gender-option label
    color: inherit !important
    font-family: inherit !important
    cursor: pointer
    -webkit-transition: all 0.25s linear

  #add-filter-btn
    top: 5px

</style>
