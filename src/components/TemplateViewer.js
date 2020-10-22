import safeEval from 'src/utils/safeEval'

export default {
  name: 'TemplateViewer',
  props: {
    template: Object,
  },
  render (h) {
    const class = 
    h('div', {
      class: this.template.class.
    })
  }
}