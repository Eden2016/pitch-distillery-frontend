<template>
  <div class="home">
    <header>
      <div class="header-left">
      <img src="/static/img/Shareablee_Logo.svg">
      </div>
      <div class="header-right">
        <div id="main-content-header" class="pitch-builder-tool-header active">
          <p class="big-font" @click="showMainContent('content')">Pitch Distillery</p>
        </div>
        <div id="list-content-header" class="lists-header">
          <p class="big-font" @click="showMainContent('list')">My Lists<span v-show="myLists && myLists.length" class="uk-badge sharedListBadge">{{myLists.length}}</span></p>
        </div>
        <div class="user-header">
          <p class="medium-font">
            {{this.user.firstName + ' ' + this.user.lastName}}
            <span @click="signOut()">
              <img src="/static/img/Log-out-icon.svg"/>
            </span>
          </p>
        </div>
    </div>
    </header>
    <div class="left-panel">
      <div class="left-panel-container">
        <form role="form" class="form-horizontal">
          <div>
            <p class="big-font">Compare Affinity</p>
          </div>
          <div>
              <p class="medium-font">Properties</p>
              <div id="multiselect-properties">
                <multiselect
                  class="multiselect-x"
                  v-model="propertyValues"
                  placeholder="Enter Property Name"
                  label="name"
                  track-by="name"
                  :options="propertiesOptions"
                  :multiple="true"
                  :clear-on-select="true"
                  :close-on-select="false"
                  :hide-selected="true"
                  :show-labels="false"
                  :block-keys="['Tab']"
                  :loading="isPropertyLoading"
                  @search-change="getProperties"
                  @select="focusMultiselect('multiselect-properties')">
                  <span slot="noResult">No properties found</span>
                </multiselect>
              </div>
              <button v-show="propertyValues && propertyValues.length" class="uk-width-1-1 add-list-button" type="button" @click="showListModal" tabindex="">Save to my lists</button>
          </div>
          <div>
            <p class="medium-font">My lists</p>
            <div id="multiselect-lists">
                <multiselect
                  class="multiselect-x"
                  v-model="myListValues"
                  placeholder="Enter List Name"
                  label="name"
                  track-by="name"
                  :options="myLists"
                  :multiple="true"
                  :close-on-select="true"
                  :clear-on-select="true"
                  :hide-selected="true"
                  :show-labels="false"
                  :block-keys="['Tab']"
                  @select="focusMultiselect('multiselect-lists')">
                  <span slot="noResult">No lists found</span>
                </multiselect>
              </div>
          </div>
          <div>
            <p class="medium-font">With Target</p>
            <div id="multiselect-targets">
                <multiselect
                  v-model="targetValue"
                  track-by="name"
                  label="name"
                  placeholder="Enter Property Name"
                  :options="targetOptions"
                  :allow-empty="true"
                  :loading="isTargetLoading"
                  :show-labels="false"
                  :block-keys="['Tab']"
                  @search-change="getTargets">
                  <span slot="noResult">No properties found</span>
                </multiselect>
              </div>
          </div>
          <div class="chart-dates">
            <p class="medium-font">From</p>
            <multiselect
              v-model="startDate"
              placeholder="Choose Start Date"
              :options="availableMonths"
              :show-labels="false"
              :allow-empty="false"
              :block-keys="['Tab']">
            </multiselect>
            <p class="medium-font">To</p>
            <multiselect
              v-model="endDate"
              placeholder="Choose End Date"
              :options="availableMonths"
              :show-labels="false"
              :allow-empty="false"
              :block-keys="['Tab']">
            </multiselect>
          </div>
          <div>
            <button class="medium-font uk-width-1-1 uk-button button-action uk-button-primary" type="button" @click="compareAffinity()">Run</button>
            <button class="medium-font uk-width-1-1 uk-button uk-button-default" style="color: white; margin-bottom: 10px" type="button" @click="clear()">Clear All</button>
          </div>
        </form>
      </div>
    </div>
    <input type="checkbox" id="create-list-button" v-model="createListModalVisible" style="display: none">
    <div id="create-list-modal" class="modal" v-show="createListModalVisible">
      <label class="modal-shade" for="create-list-button">
      </label>
      <div class="modal-body">
        <div class="uk-modal-header">
          <input id="create-list-title" class="uk-input uk-form-blank" type="text" v-model="newListName" placeholder="Name your list">
        </div>
        <div class="uk-modal-body">
          <div>Share with:</div>
          <input class="uk-input" v-model.trim="newListEmails" type="text" placeholder="John.doe@gmail.com,Jane.doe@gmail.com">
          <div style="margin-top:10px">List:</div>
          <span v-for="item in propertyValues" class="uk-badge">{{item.name}}</span>
        </div>
        <div class="uk-modal-footer">
          <div style="float:right">
            <button class="uk-button uk-button-default" @click="createListModalVisible = false">Cancel</button>
            <button class="uk-button button-action uk-button-primary" @click="createSharedList()">Save</button>
          </div>
        </div>
      </div>
    </div>
    <div v-show="showListData" class="list-content">
      <div class="main-list-container">
        <div class="list-container">
          <div class="list-header">
            My lists
          </div>
          <div>
            <table class="uk-table uk-table-striped uk-table-small uk-table-hover grid-content">
              <thead>
              <tr>
                <th>
                  <p class="medium-font">
                    Name
                  </p>
                </th>
                <th>
                  <p class="medium-font">
                    Created By
                  </p>
                </th>
                <th>
                  <p class="medium-font">
                    Updated Date
                  </p>
                </th>
                <th>
                  <p class="medium-font">
                    Edit
                  </p>
                </th>
                <th>
                  <p class="medium-font">
                    Remove
                  </p>
                </th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(list, index) in myLists">
                <td>
                  {{list.name}}
                </td>
                <td>
                  {{list.createdByName}}
                </td>
                <td>
                  {{list.changed | formatDate}}
                </td>
                <td>
                  <a @click="showEditListModal(list)">
                    <svg height="24"
                         width="24"
                         version="1.1"
                         viewBox="0 0 24 24"
                         xmlns="http://www.w3.org/2000/svg"
                         xmlns:xlink="http://www.w3.org/1999/xlink">
                      <path d="M19.71,8.04L17.37,10.37L13.62,6.62L15.96,4.29C16.35,3.9 17,3.9 17.37,4.29L19.71,6.63C20.1,7 20.1,7.65 19.71,8.04M3,17.25L13.06,7.18L16.81,10.93L6.75,21H3V17.25M16.62,5.04L15.08,6.58L17.42,8.92L18.96,7.38L16.62,5.04M15.36,11L13,8.64L4,17.66V20H6.34L15.36,11Z"/>
                    </svg>
                  </a>
                </td>
                <td>
                  <a class="trash-can" v-show="user.email === list.createdByEmail" @click="showDeleteListModal(list)">
                    <svg height="24"
                         width="24"
                         version="1.1"
                         viewBox="0 0 24 24"
                         xmlns="http://www.w3.org/2000/svg"
                         xmlns:xlink="http://www.w3.org/1999/xlink">
                      <path d="M18,19C18,20.66 16.66,22 15,22H8C6.34,22 5,20.66 5,19V7H4V4H8.5L9.5,3H13.5L14.5,4H19V7H18V19M6,7V19C6,20.1 6.9,21 8,21H15C16.1,21 17,20.1 17,19V7H6M18,6V5H14L13,4H10L9,5H5V6H18M8,9H9V19H8V9M14,9H15V19H14V9Z"/>
                    </svg>
                  </a>
                  <a v-show="user.email !== list.createdByEmail" class="uk-icon-link remove-link" uk-icon="icon: minus" @click="showRemoveListModal(list)"></a>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
          <input type="checkbox" id="modal-edit-list" v-model="editListModalVisible" style="display: none">
          <div class="modal" v-show="editListModalVisible">
            <label class="modal-shade" for="modal-edit-list">
            </label>
            <div class="modal-body">
              <div class="uk-modal-header">
                <input id="edit-list-title" class="uk-input uk-form-blank" type="text" v-model="currentList.name" placeholder="Name your list">
              </div>
              <div class="uk-modal-body">
                <div>Share with:</div>
                <input class="uk-input" v-model.trim="currentList.stringEmails" type="text" placeholder="John.doe@gmail.com,Jane.doe@gmail.com">
                <div class="edit-list-modal">
                  Edit my list
                  <multiselect
                    class="multiselect-x"
                    v-model="currentList.entities"
                    :options="editListPropertiesOptions"
                    :multiple="true"
                    :close-on-select="true"
                    :clear-on-select="true"
                    :hide-selected="true"
                    placeholder="Pick some"
                    label="name"
                    track-by="name"
                    @search-change="getEditListProperties"
                    :show-labels="false"
                    :block-keys="['Tab']">
                    <span slot="noResult">No properties found</span>
                  </multiselect>
                </div>
              </div>
              <div class="uk-modal-footer">
                <div style="float:right">
                  <button class="uk-button uk-button-default" @click="editListModalVisible = false">Cancel</button>
                  <button class="uk-button button-action uk-button-primary" @click="updateSharedList(currentList)">Update</button>
                </div>
              </div>
            </div>
          </div>
          <input type="checkbox" id="modal-remove-list" v-model="removeListModalVisible" style="display: none">
          <div class="modal" v-show="removeListModalVisible">
            <label class="modal-shade" for="modal-remove-list">
            </label>
            <div class="modal-body">
              <div class="uk-modal-header">
                Remove list: {{currentList.name}}
              </div>
              <div class="uk-modal-body">
                Are you sure you want to remove this list from your lists? Others will still be able to use it.
              </div>
              <div class="uk-modal-footer">
                <div style="float:right">
                  <button class="uk-button uk-button-default" @click="removeListModalVisible = false">Cancel</button>
                  <button class="uk-button uk-button-danger" @click="removeSharedList(currentList)">Remove</button>
                </div>
              </div>
            </div>
          </div>
          <input type="checkbox" id="modal-delete-list" v-model="deleteListModalVisible" style="display: none">
          <div class="modal" v-show="deleteListModalVisible">
            <label class="modal-shade" for="modal-delete-list">
            </label>
            <div class="modal-body">
              <div class="uk-modal-header">
                Delete list: {{currentList.name}}
              </div>
              <div class="uk-modal-body">
                Are you sure you want to delete this list from your lists? Anyone you have shared it with will no longer be able to use it.
              </div>
              <div class="uk-modal-footer">
                <div style="float:right">
                  <button class="uk-button uk-button-default" @click="deleteListModalVisible = false">Cancel</button>
                  <button class="uk-button uk-button-danger" @click="deleteSharedList(currentList)">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-show="showSpinner" class="spinner">
      <div uk-spinner />
    </div>
    <div v-show="showContentData">
      <ContentPanel :target-object="targetValue" :data="tableData" :affinity-data="affinityGlobalData" :start-date="startDate" :end-date="endDate"></ContentPanel>
    </div>
  </div>
</template>
<script>
  import config from '../config'
  import router from '../router'
  import Multiselect from 'vue-multiselect'
  require('vue-multiselect/dist/vue-multiselect.min.css')
  import ContentPanel from './ContentPanel'
  import _ from 'lodash'
  import moment from 'moment'
  import uiKit from 'uikit'

  export default {
    name: 'home-page',
    components: {Multiselect, ContentPanel},
    data () {
      return {
        signinError: false,
        newListName: '',
        newListEmails: '',
        email: '',
        password: '',
        propertyValues: [],
        myListValues: [],
        targetValue: {},
        genreValue: 'total',
        territoryValue: {},
        propertiesOptions: [],
        myLists: [],
        targetOptions: [],
        isCollapsed: false,
        isPropertyLoading: false,
        propertyTimeout: null,
        isTargetLoading: false,
        targetTimeout: null,
        tableData: [],
        affinityGlobalData: {},
        startDate: undefined,
        endDate: undefined,
        maxDate: undefined,
        showOptions: false,
        createListModalVisible: false,
        showListData: false,
        showContentData: true,
        showSpinner: false,
        currentList: {},
        editListModalVisible: false,
        removeListModalVisible: false,
        deleteListModalVisible: false,
        editListPropertiesOptions: [],
        availableMonths: []
      }
    },
    computed: {
      user () {
        return JSON.parse(window.localStorage.user)
      },
      showSignout () {
        return this.user
      }
    },
    methods: {
      showListModal () {
        this.createListModalVisible = true
        this.focusModalTitle('create-list-title')
      },
      focusModalTitle (modalTitleId) {
        window.setTimeout(function () {
          document.getElementById(modalTitleId).focus()
        }, 0)
      },
      focusMultiselect (elementId) {
        window.setTimeout(function () {
          let multiselect = document.getElementById(elementId)
          let multiselectInput = multiselect.getElementsByClassName('multiselect__input')
          if (multiselectInput[0]) {
            multiselectInput[0].focus()
            multiselectInput[0].scrollIntoView()
          }
        }, 0)
      },
      getUserLists () {
        this.$http.get(config.affinityApiUrl + '/api/user/get-lists?email=' + this.user.email, {credentials: true}).then((response) => {
          this.myLists = response.body
        }, (response) => {
          var data = JSON.stringify(response.body)
          console.error('DATA', data)

          if (data === '"You do not have permission to view this directory or page."' || response.status === 401) {
            window.localStorage.removeItem('user')
            router.push({path: 'login'})
          }
        })
      },
      getAvailableMonths () {
        this.$http.get(config.affinityApiUrl + '/api/affinity/get-available-months', {credentials: true}).then((response) => {
          this.availableMonths = _.map(response.body, function (month) {
            var momentMonth = moment(month + '-01')
            return momentMonth.format('MMM YYYY')
          })
          this.startDate = this.availableMonths[0]
          this.endDate = this.availableMonths[0]
          this.maxDate = this.availableMonths[0]
        }, (response) => {
          var data = JSON.stringify(response.body)
          console.error('DATA', data)

          if (data === '"You do not have permission to view this directory or page."' || response.status === 401) {
            window.localStorage.removeItem('user')
            router.push({path: 'login'})
          }
        })
      },
      signOut () {
        this.$http.get(config.apiUrl + '/api/logout', {credentials: true}).then((response) => {
          window.localStorage.removeItem('user')
          router.push({path: 'login'})
        }, (response) => {
          var data = JSON.stringify(response.body)
          console.error('Error signout ' + data)
        })
      },
      getProperties (query) {
        var self = this
        clearTimeout(self.propertyTimeout)
        self.isPropertyLoading = true

        self.propertyTimeout = setTimeout(function () {
          self.$http.get(config.apiUrl + '/api/entity-typeahead/properties-and-categories?searchText=' + query, {credentials: true}).then((response) => {
            self.isPropertyLoading = false
//            TODO when backend is deployed all response.body.items should be changed to response.body
            self.propertiesOptions = _.map(response.body.items, function (item) {
              if (item && item.category_id) {
                item.name = item.name + ' ' + ' (category)'
              } else if (item && item.property_id) {
                item.name = item.name + ' ' + ' (property)'
              }
              return item
            })
          }, (response) => {
            var data = JSON.stringify(response.body)
            self.isPropertyLoading = false
            console.error('DATA', data)

            if (data === '"You do not have permission to view this directory or page."' || response.status === 401) {
              window.localStorage.removeItem('user')
              router.push({path: 'login'})
            }
          })
        }, 500)
      },
      getTargets (query) {
        var self = this
        clearTimeout(self.targetTimeout)
        self.isTargetLoading = true

        self.targetTimeout = setTimeout(function () {
          self.$http.get(config.apiUrl + '/api/entity-typeahead/properties?searchText=' + query, {credentials: true}).then((response) => {
            self.isTargetLoading = false
            self.targetOptions = response.body.items
          }, (response) => {
            var data = JSON.stringify(response.body)
            self.isTargetLoading = false

            if (data === '"You do not have permission to view this directory or page."' || response.status === 401) {
              window.localStorage.removeItem('user')
              router.push({path: 'login'})
            }
            console.error(data)
          })
        }, 500)
      },
      compareAffinity () {
        var self = this
        var comparisonIds = self.propertyValues

        if (self.myListValues && self.myListValues.length) {
          var listValues = []
          self.myListValues.forEach(function (listValue) {
            listValue.entities.forEach(function (entity) {
              listValues.push(entity)
            })
          })
          comparisonIds = comparisonIds.concat(listValues)
        }

        if (comparisonIds.length === 0) {
          uiKit.notification({
            message: 'You need to select some properties or lists to compare',
            status: 'danger',
            pos: 'top-left',
            timeout: 5000
          })
          return
        }

        if (!self.targetValue.property_id && !self.targetValue.category_id) {
          uiKit.notification({
            message: 'You need to select a target',
            status: 'danger',
            pos: 'top-left',
            timeout: 5000
          })
          return
        }

        var params = {
          entityId: self.targetValue.property_id ? self.targetValue.property_id : self.targetValue.category_id,
          comparisonIds: comparisonIds
        }

        if (self.startDate && self.endDate) {
          var startDate = moment('01 ' + self.startDate + ' 00:00:00 UT')
          var endDate = moment('01 ' + self.endDate + ' 00:00:00 UT').add(1, 'months').add(-1, 'days')

          if (startDate.isAfter(endDate)) {
            uiKit.notification({
              message: 'Start is after end date. Please select a valid date range',
              status: 'danger',
              pos: 'top-left',
              timeout: 5000
            })
            return
          } else {
            params.startDate = startDate.toDate()
            params.endDate = endDate.toDate()
          }
        }

        self.showSpinner = true
        self.tableData = []

        self.$http.post(config.affinityApiUrl + '/api/affinity/comparison', params, {credentials: true}).then((response) => {
          self.showSpinner = false
          var data = response.body

          if (data.errorMessage) {
            uiKit.notification({
              message: data.errorMessage,
              status: 'danger',
              pos: 'top-left',
              timeout: 5000
            })
            return
          }

          _.each(_.keys(data), function (key) {
            if (key !== 'result') {
              self.affinityGlobalData[key] = data[key]
            }
          })

          _.each(data.result, function (row) {
            if (row.post_count) {
              row.actions_per_post = Math.round(row.total_actions / row.post_count)
            } else {
              row.actions_per_post = 'N/A'
            }
          })

          self.tableData = data.result
          this.showMainContent('content')
        }, (response) => {
          self.showSpinner = false
          var data = JSON.stringify(response.body)
          if (data === '"You do not have permission to view this directory or page."' || response.status === 401) {
            window.localStorage.removeItem('user')
            router.push({path: 'login'})
            return
          }

          let errorMessage = 'An error occurred'

          uiKit.notification({
            message: errorMessage,
            status: 'danger',
            pos: 'top-left',
            timeout: 5000
          })
        })
      },
      clear () {
        this.startDate = this.maxDate
        this.endDate = this.maxDate
        this.targetValue = {}
        this.propertyValues = []
        this.myListValues = []
      },
      createSharedList () {
        var self = this
        if (!self.newListName && !self.newListEmails && !self.propertyValues) {
          return
        }

        var params = {
          listName: self.newListName,
          createdByName: self.user.firstName + ' ' + self.user.lastName,
          createdByEmail: self.user.email,
          userEmails: self.splitEmailsForList(self.newListEmails),
          entities: self.propertyValues
        }

        self.$http.post(config.affinityApiUrl + '/api/user/lists', params, {credentials: true}).then((response) => {
          var data = response.body
          self.myLists = self.myLists && self.myLists.length ? self.myLists : []
          self.myLists = self.myLists.concat(data)
          self.createListModalVisible = false
          self.newListName = ''
          self.newListEmails = ''
        }, (response) => {
          var data = JSON.stringify(response.body)

          if (data === '"You do not have permission to view this directory or page."' || response.status === 401) {
            window.localStorage.removeItem('user')
            router.push({path: 'login'})
            return
          }
        })
      },
      splitEmailsForList (emailString) {
        if (!emailString) {
          return []
        }

        return emailString.replace(/\s/g, '').split(',')
      },
      showMainContent (value) {
        if (value === 'list') {
          if (!this.myLists || this.myLists.length === 0) {
            return
          }

          window.$('#list-content-header').addClass('active')
          window.$('#main-content-header').removeClass('active')
          this.showListData = true
          this.showContentData = false
          return
        }

        if (value === 'content') {
          window.$('#main-content-header').addClass('active')
          window.$('#list-content-header').removeClass('active')
          this.showListData = false
          this.showContentData = true
          return
        }
      },
      getEditListProperties (query) {
        var self = this
        clearTimeout(self.propertyTimeout)

        self.propertyTimeout = setTimeout(function () {
          self.$http.get(config.apiUrl + '/api/entity-typeahead/properties-and-categories?searchText=' + query, {credentials: true}).then((response) => {
            self.editListPropertiesOptions = response.body.items
          }, (response) => {
            var data = JSON.stringify(response.body)

            if (data === '"You do not have permission to view this directory or page."' || response.status === 401) {
              window.localStorage.removeItem('user')
              router.push({path: 'login'})
            }
          })
        }, 500)
      },
      showRemoveListModal (list) {
        this.currentList = _.cloneDeep(list)
        this.currentList.stringEmails = this.currentList.emails.join(',')
        this.removeListModalVisible = true
      },
      showDeleteListModal (list) {
        this.currentList = _.cloneDeep(list)
        this.deleteListModalVisible = true
      },
      showEditListModal (list) {
        this.currentList = _.cloneDeep(list)
        this.currentList.stringEmails = this.currentList.emails.join(',')
        this.editListModalVisible = true
        this.focusModalTitle('edit-list-title')
      },
      updateSharedList (list) {
        var self = this
        if ((!list.name || list.name.length === 0) && !list.stringEmails && !list.entities) {
          return
        }

        var params = {
          listName: list.name,
          userEmails: self.splitEmailsForList(list.stringEmails),
          entities: list.entities
        }

        self.showSpinner = true

        self.$http.put(config.affinityApiUrl + '/api/user/lists/' + list._id, params, {credentials: true}).then((response) => {
          var data = response.body
          list = data
          self.editListModalVisible = false
          self.showSpinner = false
          self.getUserLists()
        }, (response) => {
          self.editListModalVisible = false
          self.showSpinner = false
          var data = JSON.stringify(response.body)

          if (data === '"You do not have permission to view this directory or page."' || response.status === 401) {
            window.localStorage.removeItem('user')
            router.push({path: 'login'})
            return
          }
        })
      },
      removeSharedList (list) {
        var self = this
        var userEmails = self.splitEmailsForList(list.stringEmails)
        userEmails = _.without(userEmails, self.user.email)

        var params = {
          listName: list.name,
          userEmails: userEmails,
          entities: list.entities
        }

        console.log('Update to remove email')
        self.$http.put(config.affinityApiUrl + '/api/user/lists/' + list._id, params, {credentials: true}).then((response) => {
          self.removeListModalVisible = false
          self.getUserLists()
        }, (response) => {
          var data = JSON.stringify(response.body)

          if (data === '"You do not have permission to view this directory or page."' || response.status === 401) {
            window.localStorage.removeItem('user')
            router.push({path: 'login'})
            return
          }
        })
      },
      deleteSharedList (list) {
        var self = this
        console.log('Delete list entirely')
        self.$http.post(config.affinityApiUrl + '/api/user/lists/' + list._id + '/delete', {credentials: true}).then((response) => {
          self.deleteListModalVisible = false
          self.getUserLists()
        }, (response) => {
          console.log('Got something else')
          console.log(response.body)
          var data = JSON.stringify(response.body)

          if (data === '"You do not have permission to view this directory or page."' || response.status === 401) {
            window.localStorage.removeItem('user')
            router.push({path: 'login'})
            return
          }
        })
      }
    },
    filters: {
      formatDate: function (value) {
        if (value) {
          return moment(String(value)).format('DD MMM YYYY')
        }
      }
    },
    mounted () {
      this.getUserLists()
      this.getAvailableMonths()
    }
  }
</script>
<style lang="sass">
  @font-face
      font-family: "Book", "Sans-Serif"
      src: url(/static/fonts/GothamRndSSm-Book.otf) format("opentype")

  @font-face
      font-family: "Medium"
      src: url(/static/fonts/GothamRndSSm-Medium.otf) format("opentype")

  @font-face
      font-family: "Light"
      src: url(/static/fonts/GothamRndSSm-Light.otf) format("opentype")

  button
    margin-top: 10px !important

  .big-font
    font-size: 18px !important

  .medium-font
    font-size: 14px !important

  .small-font
    font-size: 12px !important

  .x-small-font
    font-size: 10px !important

  p
    font-family: "Book", sans-serif !important
    color: #FFFFFF

  label
    font-family: "Book", sans-serif !important
    color: #FFFFFF !important

  header
    position: fixed
    top: 0
    width: 100%
    height: 70px
    background: #FFFFFF
    z-index: 30

  .header-left
    display: inline
    float: left
    width: 250px
    height: 100%
    background: #3498DB
    text-align: center
    font-family: "Medium", sans-serif !important

  .header-left img
    margin: auto
    display: block
    width: 72%
    margin-top: 10%

  .header-right
    display: grid
    margin-left: 250px
    height: 70px
    background: #FFFFFF
    text-align: center
    font-family: "Medium", sans-serif !important
    border-bottom: 1px solid #CCCCCC
    grid-template-columns: 250px 250px auto
    grid-template-areas: "pitch-builder my-lists logout"
    overflow-y: hidden
    overflow-x: hidden

  .header-right:hover
    overflow-x: auto

  .header-right p
    font-family: "Medium", sans-serif !important
    color: #666666

  .pitch-builder-tool-header
    grid-area: pitch-builder
    height: 70px
    box-sizing: border-box

  .pitch-builder-tool-header.active
    border-bottom: 4px #3498DB solid !important

  .pitch-builder-tool-header p
    padding-top: 20px
    cursor: pointer

  .lists-header
    grid-area: my-lists
    height: 70px
    cursor: pointer
    box-sizing: border-box

  .lists-header.active
    border-bottom: 4px #3498DB solid !important

  .lists-header p
    padding-top: 20px

  .user-header
    min-width: 155px
    grid-area: logout
    justify-self: end
    height: 70px
    margin-right: 20px

  .user-header p
    font-family: "Book", sans-serif !important
    padding-top: 20px
    margin-right: 9px
    text-align: end

  .user-header img
    cursor: pointer
    margin: auto
    margin-left: 5px
    display: inline-block
    width: 25px

  form
    width: 210px

  .left-panel
    position: fixed
    top: 70px
    bottom: 0
    left: 0
    z-index: 10
    width: 250px
    height: auto
    background: #16405B
    padding-bottom: 25px
    overflow: hidden

  .left-panel:hover
    overflow: auto

  .left-panel p
    margin-top: 10px
    margin-bottom: 10px


  .left-panel-container
    heigth: 100%
    margin-top: 15px
    margin-left: 15px
    margin-right: 15px

  .main-container
    padding: 30px
    margin-left: 250px
    background: #ECF0F1

  .chart-header
    min-height: 40px
    padding-top: 20px
    padding-left: 20px
    border-bottom: 1px solid #ECF0F1!important

  .chart-header p
    font-family: "Book", sans-serif !important
    color: #666666

  .table-container
    width: 100%
    min-height: 250px
    background: #FFFFFF
    border-radius: 5px !important
    box-shadow: 0px 0px 4px rgb(0, 0, 0.1)

  .table-header
    min-height: 40px
    padding-top: 20px
    padding-left: 20px
    border-bottom: 1px solid #ECF0F1!important

  .table-header p
    font-family: "Book", sans-serif !important
    color: #666666

  multiselect
    margin-bottom: 5px

  .multiselect__tags
    overflow-y: auto
    overflow-x: hidden
    max-height: 100px

  .multiselect .multiselect__tag
    background: #E5E9EA !important
    color: #666666
    max-width: 100%
    overflow: hidden !important
    white-space: normal

  .multiselect__option--highlight
    background: #3498DB !important

  .multiselect__tag-icon:focus
    background: #3498DB !important

  .multiselect__tag-icon:hover
    background: #3498DB !important

  .multiselect__spinner:after
    border-top: #3498DB !important
    border-right-color: transparent
    border-bottom-color: transparent
    border-left-color: transparent

  .multiselect__spinner:before
    border-top-color: #3498DB !important
    border-right-color: transparent
    border-bottom-color: transparent
    border-left-color: transparent

  .uk-button
    border-radius: 5px !important

  .button-primary
    background: #3498DB !important

  .button-action
    background: #2ECC71 !important

  .chart-dates input
    border-radius: 5px

  .chart-dates
    color: white

  .add-list-button
    font-family: "Book", sans-serif !important
    color: #FFFFFF
    font-size: 12px
    border-radius: 5px !important
    background: #3498DB !important
    border-color: #3498DB !important
    border-style: none
    padding: 5px

  .add-list-button:hover
    background: #297FA5 !important

  .add-list-button:focus
    background: #297FA5 !important
    border-style: none

    .add-list-button:focus
    outline: none

  .modal input
    border-radius: 5px !important

  .modal
  .modal-shade
    position: fixed
    top: 0
    left: 0
    right: 0
    bottom: 0
    background: rgba(0,0,0,0.8)
    z-index: 100

  .modal-body
    background-color: white
    position: fixed
    top: 50%
    left: 50%
    min-width: 400px
    z-index: 101
    -webkit-transform: translate(-50%, -50%)
    --webkit-transform: translate(-50%, -50%)
    --moz-transform: translate(-50%, -50%)
    --ms-transform: translate(-50%, -50%)
    transform: translate(-50%, -50%)
    border-radius: 5px !important

  .uk-modal-header
    border-top-left-radius: 5px
    border-top-right-radius: 5px

  .uk-modal-footer
    border-bottom-left-radius: 5px
    border-bottom-right-radius: 5px

  .uk-badge
    margin-right: 5px
    background: #3498DB !important

  .uk-button-primary:focus
    background: #50af80 !important

  .uk-button-primary:hover
    background: #50af80 !important

  .sharedListBadge
    margin-left: 5px

  .spinner
    position: fixed
    top: 0
    left: 0
    right: 0
    bottom: 0
    background: rgba(0,0,0,0.6)
    z-index: 1000

  .spinner > div
    top: 50%
    left: 50%
    position: absolute
    transform: scale(3)
    color: black

  a.uk-icon-link[uk-icon="icon: trash"]
    color: red

  .main-list-container
    padding: 30px
    margin-left: 250px
    margin-top: 70px
    background: #ECF0F1
    height: 100vh

  .list-container
    width: 100%
    min-height: 600px
    margin-bottom: 40px
    background: #FFFFFF
    border-radius: 5px
    box-shadow: 0px 0px 4px rgba(66, 4, 4, 0.2)

  .list-header
    min-height: 40px
    padding-top: 20px
    padding-left: 20px
    border-bottom: 1px solid #CCCCCC!important
    font-family: "Book", sans-serif !important
    color: #666666

  .list-content
    margin-top: 10px

  .list-content li
    margin-left: 10px
    cursor: pointer

  .grid-content th p
    padding-left: 10px

  .grid-content tr a
    padding-left: 10px

  ::-webkit-scrollbar
    width: 10px
    background-color: rgba(0,0,0,0)
    -webkit-border-radius: 100px

  ::-webkit-scrollbar:hover
    background-color: rgba(0, 0, 0, 0.09)

  ::-webkit-scrollbar-thumb:vertical
    background: rgba(0,0,0,0.5)
    -webkit-border-radius: 100px
    background-clip: padding-box
    border: 2px solid rgba(0, 0, 0, 0)
    min-height: 10px

  ::-webkit-scrollbar-thumb:vertical:active
    background: rgba(0,0,0,0.61)
    -webkit-border-radius: 100px

  .trash-can
    fill: red

  .edit-list-modal
    margin-top: 10px

  .edit-list-modal .multiselect__tag
    display: block
    float: left

  .edit-list-modal .multiselect_input
    display: block
    float: left

  .home
    min-width: 1300px
    min-height: 700px
    overflow: auto

  button::-moz-focus-inner
    border: 0

  .multiselect__tag-icon::after
    color: #999 !important

  .multiselect__tag-icon:hover::after
    color: #FFFFFF !important

  .multiselect__tag-icon
    line-height: 19px !important

  .multiselect__option
    white-space: inherit !important

</style>
