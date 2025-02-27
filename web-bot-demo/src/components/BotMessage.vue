<template>
  <div class="mb-4 flex justify-start">
    <div class="p-3 rounded-lg max-w-xs md:max-w-md bg-white shadow rounded-bl-none" v-html="formattedText"></div>
  </div>
</template>

<script>
export default {
  name: 'BotMessage',
  props: {
    text: {
      type: String,
      required: true
    }
  },
  computed: {
    formattedText() {
      if (!this.text) return '';
      // Format bold text
      let formatted = this.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Format line breaks
      formatted = formatted.replace(/\n/g, '<br />');
      return formatted;
    }
  }
}
</script>