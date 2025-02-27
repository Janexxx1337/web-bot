<template>
  <div class="mb-4 flex justify-end">
    <div class="p-3 rounded-lg max-w-xs md:max-w-md bg-blue-500 text-white rounded-br-none">
      {{ text }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserMessage',
  props: {
    text: {
      type: String,
      required: true
    }
  }
}
</script>