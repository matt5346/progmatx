<template>
  <div id="app" class="app">
    <Menu />
    <Nuxt />
    <Bottom />
  </div>
</template>

<script>
import Menu from '@/components/menu/menu'
import Bottom from '@/components/bottom/bottom'

export default {
  name: 'App',
  components: {
    Menu,
    Bottom
  }
}
</script>

<style lang="scss">
@import '../assets/mixins.scss';
</style>
