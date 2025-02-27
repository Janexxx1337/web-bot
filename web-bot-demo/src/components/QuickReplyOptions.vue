<template>
  <div class="my-4">
    <div class="flex flex-wrap gap-2">
      <button
          v-for="(option, idx) in options"
          :key="idx"
          @click="$emit('option-click', option)"
          class="bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold py-2 px-4 rounded-full text-sm transition-colors"
      >
        {{ option }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuickReplyOptions',
  props: {
    options: {
      type: Array,
      required: true
    }
  }
}
</script>