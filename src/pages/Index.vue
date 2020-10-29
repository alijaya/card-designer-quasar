<template>
  <q-page class="flex flex-center">
    <shadow-style ref="viewer" :internalStyle="$global.projectNode.styleSheet" style="user-select:none">
      <template-viewer :template="$global.selectedTemplate" />
    </shadow-style>
  </q-page>
</template>

<script>
import ShadowStyle from 'components/ShadowStyle'
import TemplateViewer from 'components/TemplateViewer'

export default {
  name: 'PageIndex',
  components: {
    ShadowStyle,
    TemplateViewer,
  },

  mounted () {
    this.$global.viewer = this.$refs.viewer
  }
}
</script>