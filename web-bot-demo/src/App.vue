<template>
  <div class="flex flex-col h-screen max-h-screen bg-gray-100">
    <!-- Bot header -->
    <div class="bg-blue-600 text-white p-4 shadow-md">
      <h1 class="text-xl font-bold">Демо-бот разработчика</h1>
      <p class="text-sm">Примеры возможностей для вашего бизнеса</p>
    </div>

    <!-- Messages container -->
    <div class="flex-grow overflow-y-auto p-4" ref="messagesContainerRef">
      <!-- Message components -->
      <template v-for="(msg, index) in messages" :key="index">
        <user-message v-if="msg.sender === 'user'" :text="msg.text" />
        <bot-message v-else :text="msg.text" />
      </template>

      <!-- Typing indicator -->
      <typing-indicator v-if="loading" />

      <!-- Quick reply options -->
      <quick-reply-options
          v-if="showOptions"
          :options="currentOptions"
          @option-click="handleOptionClick"
      />
    </div>

    <!-- Message input -->
    <message-input @message-send="handleUserMessage" />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import BotMessage from './components/BotMessage.vue';
import UserMessage from './components/UserMessage.vue';
import TypingIndicator from './components/TypingIndicator.vue';
import QuickReplyOptions from './components/QuickReplyOptions.vue';
import MessageInput from './components/MessageInput.vue';
import botStates from './botStates.js';
import { botUtils } from './utilities.js';

// Состояние компонента
const messages = ref([]);
const loading = ref(false);
const showOptions = ref(false);
const currentState = ref('start');
const selectedPizza = ref('');
const selectedSize = ref('');
const telegramUsername = ref('@janexxx1337');
const states = ref(botStates);
const messagesContainerRef = ref(null);

// Вычисляемые свойства
const currentOptions = computed(() => {
  const currentStateObj = states.value[currentState.value];
  if (currentStateObj && currentStateObj.options) {
    return currentStateObj.options.map(option => option.text);
  }
  return [];
});

// Методы
const addBotMessage = (message, options = null, delay = 1000) => {
  loading.value = true;
  setTimeout(() => {
    messages.value.push({ text: message, sender: 'bot' });
    loading.value = false;
    if (options && options.length > 0) {
      setTimeout(() => showOptions.value = true, 300);
    }
  }, delay);
};

const goToState = (stateName, data = null) => {
  if (!states.value[stateName]) {
    console.error('Unknown state:', stateName);
    return;
  }

  currentState.value = stateName;
  showOptions.value = false;

  let message = states.value[stateName].message;

  // Замена переменных в сообщении
  if (stateName === 'demo_select_size' && selectedPizza.value) {
    message = message.replace('[PIZZA]', selectedPizza.value);
  }
  else if (stateName === 'demo_order_complete') {
    const pizza = selectedPizza.value || 'Пепперони';
    const size = selectedSize.value || 'Средняя (30см)';
    const price = botUtils.getPizzaPrice(pizza, size);

    message = message
        .replace('[PIZZA]', pizza)
        .replace('[SIZE]', size)
        .replace('[PRICE]', price);
  }
  else if (stateName === 'contact') {
    message = message.replace('[TELEGRAM]', telegramUsername.value);
  }

  addBotMessage(message, states.value[stateName].options);
};

const handleOptionClick = (optionText) => {
  // Добавить сообщение пользователя
  messages.value.push({ text: optionText, sender: 'user' });
  showOptions.value = false;

  // Найти соответствующий объект опции
  const currentStateObj = states.value[currentState.value];
  const selectedOption = currentStateObj.options.find(option => option.text === optionText);

  if (!selectedOption) {
    console.error('Option not found:', optionText);
    return;
  }

  // Сохранить данные, если они есть
  if (selectedOption.data) {
    if (currentState.value === 'demo_order_pizza') {
      selectedPizza.value = selectedOption.data;
    } else if (currentState.value === 'demo_select_size') {
      selectedSize.value = selectedOption.data;
    }
  }

  // Перейти к следующему состоянию
  setTimeout(() => {
    goToState(selectedOption.next);
  }, 500);
};

const handleUserMessage = (message) => {
  messages.value.push({ text: message, sender: 'user' });
  showOptions.value = false;

  setTimeout(() => {
    const nextState = botUtils.processUserInput(message);

    if (nextState) {
      goToState(nextState);
    } else if (message.toLowerCase().includes('да') && currentState.value === 'features') {
      goToState('demo_intro');
    } else {
      addBotMessage('Извините, я не совсем понял ваш запрос. Выберите один из вариантов ниже:', currentOptions.value);
    }
  }, 500);
};

const scrollToBottom = () => {
  if (messagesContainerRef.value) {
    nextTick(() => {
      messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight;
    });
  }
};

// Обработчики событий
watch(messages, () => {
  scrollToBottom();
});

watch(showOptions, () => {
  scrollToBottom();
});

// Монтирование компонента
onMounted(() => {
  // Показать приветственное сообщение при загрузке компонента
  setTimeout(() => {
    goToState('start');
  }, 1000);
});
</script>

<style lang="scss" scoped>
@keyframes confetti {
  0% {
    transform: translateY(0) rotate(0);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}
</style>