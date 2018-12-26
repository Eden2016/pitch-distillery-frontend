<template>
  <div>
    <h2 class="uk-text-large uk-text-center">Login</h2>
    <form class="uk-form uk-form-stacked login-form">
      <div v-if="signinError" class="uk-alert-danger" uk-alert>
        <a class="uk-alert-close" uk-close></a>
        <p>{{alertMessage}}</p>
      </div>
      <div>
        <label class="uk-text-center">Email</label>
        <input class="uk-input" type="text" name="email" v-model="email">
      </div>
      <div>
        <label class="uk-text-center">Password</label>
        <input class="uk-input" type="password" name="password" v-model="password" v-on:keyup.enter="signIn">
      </div>
      <div>
        <button class="uk-button uk-width-1-1 uk-button-primary" type="button" @click="signIn()">Login</button>
      </div>
    </form>
    <div v-show="showSpinner" class="spinner">
      <div uk-spinner />
    </div>
  </div>
</template>

<script>
import router from '../router'
import config from '../config'

export default {
  name: 'login',
  data () {
    return {
      signinError: false,
      email: '',
      password: '',
      showSpinner: false
    }
  },
  computed: {
    user () {
      return this.$store.state.auth.user
    }
  },
  methods: {
    signIn () {
      var self = this

      var credentials = {
        email: this.email,
        password: this.password
      }
      self.showSpinner = true

      this.$http.post(config.apiUrl + '/api/login', credentials, {credentials: true}).then((response) => {
        self.showSpinner = false
        var data = JSON.stringify(response.body)
        if (data) {
          window.localStorage.setItem('user', data)
          router.push({ path: '/' })
        }
      }, (response) => {
        self.showSpinner = false
        if (response.body.error) {
          this.signinError = true
          this.alertMessage = response.body.error
          setTimeout(() => {
            this.signinError = false
          }, 3500)
        }
      })
    }
  }
}
</script>

<style lang="sass" scoped>
  .login-form
    width: 300px
    margin: auto

  .uk-alert-danger  
    background-color: #D63232
    color: #faeaea
    border-radius: 5px  
</style>
