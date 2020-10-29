import safeEval from 'src/utils/safeEval'
import enableCORS from 'src/utils/enableCORS'
import {RepeatIndex, Scope} from 'src/global'

export default {
  name: 'TemplateViewer',
  data() {
    return {
      preparedVDOM: null,
    }
  },
  props: {
    template: Object,
  },

  watch: {
    template: {
      immediate: true,
      deep: true,
      async handler () {
        if (this.template) {
          const children = []
          await this.renderNode(this.$createElement, this.template, children, {})
          this.preparedVDOM = children[0]
        } else {
          this.preparedVDOM = null
        }
      }
    }
  },

  methods: {

    async renderElement (h, node, parentChildren) {
      const children = []
      for (const child of node.children ) await this.renderNode(h, child, children, node[Scope])

      const klass = {}
      const style = {}
      node.class.forEach(item => klass[item.name] = item.value)
      node.style.forEach(item => style[item.name] = item.value)
      parentChildren.push(h(node.element, {
        class: klass,
        style: style,
      }, children))
    },

    async renderText (h, node, parentChildren) {
      const klass = {}
      const style = {}
      node.class.forEach(item => klass[item.name] = item.value)
      node.style.forEach(item => style[item.name] = item.value)
      parentChildren.push(h('span', {
        class: klass,
        style: style,
      }, node.text))
    },

    async renderImage (h, node, parentChildren) {
      const klass = {}
      const style = {}
      node.class.forEach(item => klass[item.name] = item.value)
      node.style.forEach(item => style[item.name] = item.value)
      parentChildren.push(h('img', {
        class: klass,
        style: style,
        attrs: {
          src: enableCORS(node.image),
          crossOrigin: 'anonymous',
          draggable: false
        },
      }))
    },

    async renderTemplate (h, node, parentChildren) {
      const temp = this.$global.getTemplate(node.template)
      if (temp) {
        await this.renderNode(h, temp, parentChildren, {}, node.dataProps, node.class, node.style)
      }
    },

    async renderSwitch (h, node, parentChildren) {
      for (const child of node.children) {
        if (node.switch == child.state) {
          await this.renderNode(h, child, parentChildren, node[Scope])
        }
      }
    },

    async renderContext (h, node, parentChildren) {
      for (const child of node.children) {
        await this.renderNode(h, child, parentChildren, node[Scope])
      }
    },

    async renderNode (h, node, parentChildren, parentScope, overrideProps, overrideClass, overrideStyle) {
      node = {...node} // shallow copy
      node.props = node.props.map(item => ({...item})) // copy
      if (node.class) node.class = node.class.map(item => ({...item})) // copy
      if (node.style) node.style = node.style.map(item => ({...item})) // copy
      if (node.dataProps) node.dataProps = node.dataProps.map(item => ({...item})) // copy

      if (overrideProps) node.props = node.props.concat(overrideProps.map(item => ({...item})))
      if (overrideClass) node.class = node.class.concat(overrideClass.map(item => ({...item})))
      if (overrideStyle) node.style = node.style.concat(overrideStyle.map(item => ({...item})))

      if (!node.type) { // root
        node.type = 'element'
        node.element = 'div'
      }

      await this.$global.evalPropNameExpr(node, 'repeat', parentScope, null) // dry run
      let repeat = node.repeat
      if (typeof repeat == 'number') repeat = [...Array(repeat).keys()]
      if (!Array.isArray(repeat)) repeat = [null]

      for (let index = 0; index < repeat.length; index++) {
        const item = repeat[index]
        node[RepeatIndex] = index // reuse
        await this.$global.evalNode(node, parentScope)
        switch (node.type) {
          case 'element': await this.renderElement(h, node, parentChildren); break
          case 'text': await this.renderText(h, node, parentChildren); break
          case 'image': await this.renderImage(h, node, parentChildren); break
          case 'template': await this.renderTemplate(h, node, parentChildren); break
          case 'switch': await this.renderSwitch(h, node, parentChildren); break
          case 'context': await this.renderContext(h, node, parentChildren); break
        }
      }
    },
  },

  render (h) {
    return this.preparedVDOM
  }
}