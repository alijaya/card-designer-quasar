<template>
  <q-dialog :value="value" @input="$emit('input', $event)">
    <q-card v-contextmenu="getOptionCM(null)">
      <q-card-section class="row items-center">
        <div class="text-h6">Select Config</div>
        <q-space />
        <q-btn
          icon="add"
          flat
          round
          size="sm"
          color="primary"
          @click="onCreateOption"
        />
      </q-card-section>
      <q-card-section v-if="selectProp">
        <draggable
          v-model="selectProp.options"
          :animation="100"
          handle=".handle"
        >
          <PropExpr
            v-for="(item, index) in selectProp.options"
            :key="index"
            v-contextmenu="getOptionCM(item)"
            handle-class="handle"
            :label="item.label"
            v-model="item.value"
          />
        </draggable>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { remove } from "src/utils";
import draggable from "vuedraggable";
import PropExpr from "components/PropExpr";

export default {
  name: "SelectConfigDialog",
  components: {
    draggable,
    PropExpr
  },
  props: {
    selectProp: Object,
    value: Boolean
  },
  methods: {
    getOptionCM(option) {
      return {
        context: option,
        menu: [
          { label: "New Option", handler: this.onCreateOption },
          { separator: true },
          {
            label: "Rename",
            handler: this.onUpdateOptionName,
            disable: option == null
          },
          {
            label: "Delete",
            handler: this.onDeleteOption,
            class: "text-negative",
            disable: option == null
          }
        ]
      };
    },

    onCreateOption(evt) {
      this.$openPopupEdit(evt, {
        initialValue: "",
        onSave: value => {
          this.selectProp.options.push({ label: value, value: "" });
        },
        floating: true
      });
    },

    onUpdateOptionName(evt, el, option) {
      this.$openPopupEdit(null, {
        el: el,
        initialValue: option.label,
        onSave: value => {
          option.label = value;
        }
      });
    },

    onDeleteOption(evt, el, option) {
      remove(this.selectProp.options, option);
    }
  }
};
</script>
