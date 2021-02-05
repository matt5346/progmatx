<template>
  <div class="menu">
    <div class="menu__inner">
      <Logo class="menu__logo" />
      <nav class="menu__options">
        <ul class="menu__options-nav">
          <nuxt-link class="menu__options-nav__li" to="/">Home</nuxt-link>
          <nuxt-link class="menu__options-nav__li" to="/music">Music</nuxt-link>
          <nuxt-link class="menu__options-nav__li" to="/samples">Samples</nuxt-link>
          <nuxt-link class="menu__options-nav__li" to="/Contacts">Contacts</nuxt-link>
        </ul>
        <div class="menu__options-socials">
          <a
            href="https://instagram.com"
            target="_blank"
            class="menu__options-socials__link"
          >
            <Instagram
              class="menu__options-socials__svg"
            />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            class="menu__options-socials__link"
          >
            <SoundCloud
              class="menu__options-socials__svg"
            />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            class="menu__options-socials__link"
          >
            <Telegram
              class="menu__options-socials__svg"
            />
          </a>
        </div>
      </nav>
    </div>
  </div>
</template>
<script>
import Logo from '@/static/logo.svg'
import Instagram from '@/static/socials/instagram.svg'
import SoundCloud from '@/static/socials/soundcloud.svg'
import Telegram from '@/static/socials/telegram.svg'

export default {
  name: 'Menu',
  components: {
    Instagram,
    SoundCloud,
    Telegram,
    Logo
  }
}

</script>

<style lang="scss">
@import '@/assets/mixins.scss';
@import "./styles";
</style>
