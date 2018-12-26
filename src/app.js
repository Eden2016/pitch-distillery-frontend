// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueResource from 'vue-resource'
import App from './components/App'
import router from './router'
let $ = require('jquery')
import VueAnalytics from 'vue-analytics'

Vue.config.debug = process.env.NODE_ENV !== 'production'

Vue.use(VueResource)

// Vue plugin for Google Analytics
Vue.use(VueAnalytics, {
  id: 'UA-39167061-3',
  router
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App),
  methods: {
    handleBackspaceEvent (event) {
      if (!$(event.target).is('input, textarea') || event.target.value === '') {
        event.preventDefault()
      }
    },
    handleTabEvent (event) {
      // Handle TAB key
      let modals = document.getElementsByClassName('modal')

      for (let i = 0; i < modals.length; i++) {
        // Handle TAB key only when modal is visible
        if (modals[i].style.display !== 'none') {
          let modalBody = modals[i].children[1]

          // If modal has editable content
          if (event.target.className.includes('uk-button-primary')) {
            // If target is the Save button focus on the title input
            let modalHeader = modalBody.firstChild
            let modalHeaderInput = modalHeader.firstChild
            modalHeaderInput.focus()
            event.preventDefault()
          }

          // If modal has only cancel/delete options
          if (event.target.className.includes('uk-button-danger')) {
            let modalFooter = modalBody.lastChild
            let modalFooterInnerDiv = modalFooter.firstChild
            let modalFooterCancelButton = modalFooterInnerDiv.firstChild
            modalFooterCancelButton.focus()
            event.preventDefault()
          }
        }
      }
    }
  },
  mounted: function () {
    let self = this
    window.addEventListener('keydown', function (e) {
      switch (e.which) {
        case 8:
          // Handle backspace to avoid navigating back from page
          self.handleBackspaceEvent(e)
          break
        case 9:
          // Handle Tab to keep focus in active modal's elements
          self.handleTabEvent(e)
          break
      }
    })
  }
})
