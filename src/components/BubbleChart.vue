<template>
  <div class="bubble-container">
    <div style="position: absolute; top: 0; width: 100%; height: 50%; border-bottom: 1px solid grey" />
    <div style="position: absolute; left: 0; height: 100%; width: 50%; border-right: 1px solid grey" />
    <div style="position: absolute; left: 50%; top: 0; padding: 7px; font-family: Book, Sans-Serif">Most Engagement</div>
    <div style="position: absolute; bottom: 50%; right: 0; padding: 7px; font-family: Book, Sans-Serif">Most Affinity</div>
    <div v-for="bubble in bubbles">
      <div v-bind:style="bubble.style" class="bubble">
        <div class="uk-inline">
          <div class="bubble-inside" v-bind:style="bubble.insideStyle">
            <img :src="bubble.imageUrl" style="border-radius: 100%">
            <div class="bubble-name">{{bubble.name}}</div>
          </div>
          <div uk-dropdown delay-hide="0" v-html="bubble.tooltip"></div>
        </div>
      </div>
    </div>
    <div id="source-label">{{sourceText}}</div>
    <div id="exportImageLink" class="download-image" @click="exportImage()">
      <img src="/static/img/Download-icon.svg"/>
    </div>
  </div>
</template>
<script>
  import config from '../config'
  import _ from 'lodash'
  import html2canvas from 'html2canvas'

  export default {
    props: {
      data: Array,
      startDate: String,
      endDate: String
    },
    data () {
      return {
        newData: Array
      }
    },
    computed: {
      bubbles () {
        if (this.data && this.data.length > 0) {
          this.newData = _.clone(this.data)
          this.newData = _.reject(this.newData, function (item) {
            return item.affinity == null
          })
        } else {
          this.newData = []
        }

        let maxEngagedAudience = _.chain(this.newData).map('unique_engaged_audience').max().value()
        let minEngagedAudience = _.chain(this.newData).map('unique_engaged_audience').min().value()
        let maxActions = _.chain(this.newData).map('total_actions').max().value()
        let minActions = _.chain(this.newData).map('total_actions').min().value()
        let maxAffinity = _.chain(this.newData).map('normalized_affinity').max().value()
        let minAffinity = _.chain(this.newData).map('normalized_affinity').min().value()

        if (!maxEngagedAudience || !minEngagedAudience || !maxAffinity || !maxActions || !minActions) {
          return
        }

        let padding = 8
        let minSize = 75
        let maxSize = 160
        let width = 1000 - padding
        let height = 400 - padding

        let bubbleContainer = document.getElementsByClassName('bubble-container')[0]

        if (bubbleContainer && bubbleContainer.clientHeight && bubbleContainer.clientWidth) {
          width = bubbleContainer.clientWidth - padding
          height = bubbleContainer.clientHeight - padding
        }

        function calculateDistributionValue (value, min, max) {
          if ((isNaN(value) || isNaN(min) || isNaN(max)) || (Math.sqrt(max) - Math.sqrt(min) === 0)) {
            return 1
          }

          return (Math.sqrt(value) - Math.sqrt(min)) / (Math.sqrt(max) - Math.sqrt(min))
        }

        function calculatePosition (distributionValue, dimension, bubbleSize) {
          let position = distributionValue * dimension

          // bottom half of bubble chart and bubble overflows
          if ((position + bubbleSize) >= dimension) {
            position = dimension - bubbleSize
          }

          // upper half of bubble chart and bubble overflows
          if ((position - bubbleSize) < 0) {
            position = padding
          }

          return position
        }
        // Define empty array for All Bubbles Positions
        let allBubblePositions = []
        return _.map(this.newData, mapToBubble)

        function mapToBubble (row) {
          let size = Math.round(minSize + (row.unique_engaged_audience / maxEngagedAudience) * (maxSize - minSize))
          let imageUrl = 'https://res.cloudinary.com/demo/image/facebook/c_thumb,g_face,h_' + size + ',w_' + size + '/' + row.facebook_id + '.png'

          // substract from 1 because we want the max to be at 0, on top
          let actionsDistributedValue = 1 - calculateDistributionValue(row.total_actions, minActions, maxActions)
          let topPosition = Math.round(calculatePosition(actionsDistributedValue, height, size))

          let affinityDistributedValue = calculateDistributionValue(row.normalized_affinity, minAffinity, maxAffinity)
          let leftPosition = Math.round(calculatePosition(affinityDistributedValue, width, size))

          // Get bubble position item
          let bubblePositionItem = {
            leftPosition: leftPosition,
            topPosition: topPosition
          }

          // Push item to Array
          allBubblePositions.push(bubblePositionItem)
          let allBubblePositionsInThisLine = []
          allBubblePositionsInThisLine = _.filter(allBubblePositions, function (item) {
            return item.topPosition === bubblePositionItem.topPosition
          })

          allBubblePositionsInThisLine = _.sortBy(allBubblePositionsInThisLine, 'leftPosition')

          // Check this position exist in our all bubble positions
          let allBubblePositionsInThisLineLenght = allBubblePositionsInThisLine.length
          if (allBubblePositionsInThisLineLenght > 1) {
            for (let i = 0; i < allBubblePositionsInThisLineLenght; i++) {
              let itemIndexMin = i + 1
              if (allBubblePositionsInThisLine && allBubblePositionsInThisLine[itemIndexMin] && allBubblePositionsInThisLine[itemIndexMin].leftPosition && Math.abs(allBubblePositionsInThisLine[i].leftPosition - allBubblePositionsInThisLine[itemIndexMin].leftPosition) < 70) {
                if (leftPosition + (2 * size) < width) {
                  leftPosition += size
                  allBubblePositionsInThisLine[i].leftPosition += size
                } else {
                  leftPosition -= size
                  allBubblePositionsInThisLine[i].leftPosition -= size
                }
              }
            }
          }

          let bubble = {
            imageUrl: imageUrl,
            affinity: row.normalized_affinity,
            name: row.name,
            maxAffinity: maxAffinity,
            tooltip: 'Name: ' + row.name +
                      '<br>' +
                      'Affinity Index: ' + row.normalized_affinity +
                      '<br>' +
                      'Engagement: ' + row.total_actions.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
                      '<br>' +
                      'Unique Engaged Audience: ' + row.unique_engaged_audience.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            style: {
              position: 'absolute',
              left: leftPosition + 'px',
              top: topPosition + 'px'
            },
            insideStyle: {
              'border-radius': '100%',
              'font-family': 'sans-serif !important',
              'border': '1px solid black !important',
              'overflow': 'hidden'
            }
          }

          return bubble
        }
      },
      sourceText () {
        let sourceLabelText = 'Source: Shareablee '

        if (this.startDate !== this.endDate) {
          sourceLabelText += this.startDate + ' - ' + this.endDate
        } else {
          sourceLabelText += this.startDate
        }

        return sourceLabelText
      }
    },
    methods: {
      exportImage () {
        // Scroll bubblecontainer into view and get its dimensions
        let bubbleContainer = document.getElementById('bubbleChart')
        bubbleContainer.scrollIntoView()
        let w = bubbleContainer.clientWidth * 2
        let h = bubbleContainer.clientHeight * 2

        // Create canvas for bubble chart
        let canvas = document.createElement('canvas')
        canvas.width = w * 2
        canvas.height = h * 2
        canvas.style.width = w + 'px'
        canvas.style.height = h + 'px'

        let context = canvas.getContext('2d')
        context.scale(2, 2)

        // Create canvas for Shareablee logo image
        let logoCanvas = document.createElement('canvas')
        let chartLogo = document.getElementsByClassName('chart-logo')[0]
        let locoContext = logoCanvas.getContext('2d')

        // Once image is loaded, append it to DOM and convert html2canvas. After conversion remove from DOM
        let image = document.createElement('img')
        image.onload = function () {
          locoContext.drawImage(image, 0, 0)
          chartLogo.appendChild(logoCanvas)

          // Hide the export label
          let exportImageLink = document.getElementById('exportImageLink')
          exportImageLink.style.visibility = 'hidden'

          // Show the source label
          let sourceLabel = document.getElementById('source-label')
          sourceLabel.style.visibility = 'visible'

          // Change the header color and backgroundColor to make the logo visible
          let bubbleChart = document.getElementById('bubbleChart')
          bubbleChart.style.backgroundColor = '#348CCF'

          // Change the header text color to make it visible over the new header backgroundColor
          let chartTitle = document.getElementsByClassName('chart-title')[0]
          chartTitle.style.color = 'white'

          // html2canvas options
          let options = {
            proxy: config.affinityApiUrl + '/api/image-proxy',
            canvas: canvas
          }

          html2canvas(bubbleContainer, options).then(function (canvas) {
            let a = document.createElement('a')
            a.href = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
            a.download = 'Shareablee Bubble Chart.png'
            a.style.display = 'none'
            document.body.appendChild(a)
            a.click()
          })

          // Remove the logo canvas from the DOM
          chartLogo.removeChild(chartLogo.children[0])

          // Show the export label
          exportImageLink.style.visibility = 'visible'

          // Hide the source label
          sourceLabel.style.visibility = 'hidden'

          // Reset the header color
          chartTitle.style.color = '#666666'

          // Reset the header backgroundColor
          bubbleChart.style.backgroundColor = 'white'
        }
        image.src = '/static/img/Shareablee_Logo.svg'
      }
    }
  }
</script>
<style lang="sass">
  @font-face
    font-family: "Book"
    src: url(/static/fonts/GothamRndSSm-Book.otf) format("opentype")

  .bubble-container
    width: 100%
    height: 55vh
    margin: auto
    margin-bottom: 60px
    position: relative
    background-color: white
    font-family: Book
    border-bottom-left-radius: 5px
    border-bottom-right-radius: 5px

  .bubble-container .bubble-inside
    transition: transform ease 0.2s

  .bubble-container .bubble-inside:hover
    transform: scale(1.05)

  .bubble:hover
    z-index: 20

  .bubble-name
    width: 80%
    height: 1.2em
    line-height: 1.2em
    text-overflow: ellipsis
    white-space: nowrap
    left: 10%
    bottom: 25%
    overflow: hidden
    background: rgba(0,0,0,0.6)
    color: white
    text-align: center
    position: absolute

  .uk-dropdown
    white-space: nowrap
    border-radius: 5px
    box-shadow: 0px 0px 4px rgba(66, 4, 4, 0.2)

  .download-image
    position: absolute
    z-index: 40
    bottom: 14px
    right: 14px
    width: 45px
    height: 45px

  .download-image img
    margin: auto
    display: block
    width: 100%
    cursor: pointer

  #source-label
    visibility: hidden
    position: absolute
    bottom: 14px
    left: 14px
    font-family: Book, Sans-Serif !important
    color: #666666

</style>
