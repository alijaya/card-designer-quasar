<template>
  <q-page class="flex flex-center">
    <div class="cursor-pointer" style="width: 100px">
      {{ label }}
      <q-popup-edit v-model="label">
        <q-input v-model="label" dense autofocus />
      </q-popup-edit>
    </div>
  </q-page>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'

export default {
  name: 'PageIndex',
  // data () {
  //   return {
  //     label: 'test'
  //   }
  // },
  computed: {
    ...mapGetters('templates', {
      label: 'readSelectedName'
    })
  }
}
</script>
