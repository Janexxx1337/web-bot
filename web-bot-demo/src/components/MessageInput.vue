<template>
  <form @submit.prevent="submit" class="p-4 bg-white border-t">
    <div class="flex">
      <input
          type="text"
          v-model="inputText"
          placeholder="Напишите сообщение..."
          class="flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
          type="submit"
          class="bg-blue-600 text-white p-2 rounded-r hover:bg-blue-700 transition-colors"
      >
        Отправить
      </button>
    </div>
  </form>
</template>

<script>
export default {
  name: 'MessageInput',
  data() {
    return {
      inputText: ''
    }
  },
  methods: {
    submit() {
      if (this.inputText.trim() === '') return;
      this.$emit('message-send', this.inputText);
      this.inputText = '';
    }
  }
}
</script>