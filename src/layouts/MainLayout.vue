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
      <!-- <ThePropertyPanel class="fit" /> -->
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
// import ThePropertyPanel from 'components/panel/ThePropertyPanel'

export default {
  name: 'MainLayout',
  components: {
    TheTemplateListPanel,
    TheTreeViewPanel,
    // ThePropertyPanel
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
  },
  mounted () {
  }
}
</script>
