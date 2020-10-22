<template>
  <q-page class="flex flex-center">
    <shadow-style :internalStyle="style">
      <div class="box" style="background:red">Red</div>
      <div>Yes</div>
    </shadow-style>
  </q-page>
</template>

<script>
import ShadowStyle from 'components/ShadowStyle'

export default {
  name: 'PageIndex',
  components: {
    ShadowStyle,
  },
  data() {
    return {
      style: ".box { border: 5px solid blue; }"
    }
  }
}
</script>