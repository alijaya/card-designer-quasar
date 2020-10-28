<template>
  <q-layout view="hHh LpR lFf">
    <q-header>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-btn flat @click="createNew">New</q-btn>
        <q-btn flat @click="save">Save</q-btn>
        <q-btn flat @click="load">Load</q-btn>

        <q-toolbar-title>
          Card Designer
        </q-toolbar-title>

        <div>by <q-btn type="a" href="https://alijaya.my.id/" flat >Ali Jaya Meilio Lie</q-btn></div>

        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="rightDrawerOpen = !rightDrawerOpen"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      side="left"
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-1"
    >
      <q-splitter horizontal v-model="leftDrawerSplitter" class="fit">
        <template #before>
          <TheTemplateListPanel class="fit" />
        </template>

        <template #after>
          <TheTreeViewPanel class="fit" />
        </template>
      </q-splitter>
    </q-drawer>

    <q-drawer
      side="right"
      v-model="rightDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-1"
    >
      <ThePropertyPanel class="fit" />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import Vue from 'vue'
import TheTemplateListPanel from 'components/panel/TheTemplateListPanel'
import TheTreeViewPanel from 'components/panel/TheTreeViewPanel'
import ThePropertyPanel from 'components/panel/ThePropertyPanel'

import FileSaver from 'file-saver'
import loadAs from 'src/utils/loadAs'

export default {
  name: 'MainLayout',
  components: {
    TheTemplateListPanel,
    TheTreeViewPanel,
    ThePropertyPanel
  },
  data () {
    return {
      leftDrawerOpen: false,
      leftDrawerSplitter: 50,
      rightDrawerOpen: false,
    }
  },
  computed: {
  },
  methods: {
    createNew () {
      this.$global.createNew()
    },
    save () {
      const blob = new Blob([JSON.stringify(this.$global.getSaveObject(), null, 2)], {type: "application/json;charset=utf-8"})
      FileSaver.saveAs(blob, `${this.$global.fileName}.json`)
    },
    async load () {
      const obj = JSON.parse(await loadAs.Text('application/json', false))
      this.$global.setLoadObject(obj)
    }
  },
  mounted () {
  }
}
</script>
