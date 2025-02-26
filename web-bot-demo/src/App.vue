<template>
  <div class="flex flex-col h-screen max-h-screen bg-gray-100">
    <!-- Шапка бота -->
    <div class="bg-blue-600 text-white p-4 shadow-md">
      <h1 class="text-xl font-bold">Демо-бот разработчика</h1>
      <p class="text-sm">Примеры возможностей для вашего бизнеса</p>
    </div>

    <!-- Контейнер сообщений -->
    <div class="flex-grow overflow-y-auto p-4" ref="messagesContainer">
      <div v-for="(msg, index) in messages" :key="index"
           :class="`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`">
        <div
            :class="`p-3 rounded-lg max-w-xs md:max-w-md ${
            msg.sender === 'user'
              ? 'bg-blue-500 text-white rounded-br-none'
              : 'bg-white shadow rounded-bl-none'
          }`"
            v-html="formatMessage(msg.text)">
        </div>
      </div>

      <!-- Индикатор печати -->
      <div v-if="loading" class="flex items-center my-2">
        <div class="w-2 h-2 bg-gray-400 rounded-full mr-1 animate-bounce"></div>
        <div class="w-2 h-2 bg-gray-400 rounded-full mr-1 animate-bounce" style="animation-delay: 0.2s"></div>
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
      </div>

      <!-- Форма для заполнения данных клиента -->
      <div v-if="formActive && !loading" class="my-4 p-4 bg-white rounded-lg shadow">
        <div class="mb-3 font-medium text-gray-700">
          {{ formQuestions[currentQuestion].question }}
        </div>

        <div v-if="formQuestions[currentQuestion].type === 'select'" class="flex flex-col gap-2">
          <button
              v-for="(option, idx) in formQuestions[currentQuestion].options"
              :key="idx"
              @click="handleFormSubmit(option)"
              class="bg-blue-50 hover:bg-blue-100 text-blue-700 text-left px-4 py-2 rounded border border-blue-200 transition-colors"
          >
            {{ option }}
          </button>
        </div>
        <div v-else class="flex">
          <input
              :type="formQuestions[currentQuestion].type"
              :placeholder="formQuestions[currentQuestion].placeholder"
              class="flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
              v-model="formInputValue"
              @keypress.enter="formInputValue.trim() && handleFormSubmit(formInputValue)"
          />
          <button
              @click="formInputValue.trim() && handleFormSubmit(formInputValue)"
              class="bg-blue-600 text-white p-2 rounded-r hover:bg-blue-700 transition-colors"
          >
            Отправить
          </button>
        </div>
      </div>

      <!-- Конфетти при успешной отправке формы -->
      <div v-if="showConfetti" class="fixed inset-0 pointer-events-none">
        <div
            v-for="i in 50"
            :key="i"
            class="absolute w-2 h-2 rounded-full"
            :style="{
            backgroundColor: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'][i % 6],
            left: `${Math.random() * 100}%`,
            top: '-10px',
            opacity: Math.random(),
            animation: `confetti ${1.5 + Math.random() * 2}s linear forwards`,
            animationDelay: `${Math.random() * 0.5}s`
          }"
        ></div>
      </div>

      <!-- Кнопки быстрых ответов -->
      <div v-if="showOptions" class="my-4">
        <div class="flex flex-wrap gap-2">
          <button
              v-for="(option, idx) in currentOptions"
              :key="idx"
              @click="handleOptionClick(option)"
              class="bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold py-2 px-4 rounded-full text-sm transition-colors"
          >
            {{ option }}
          </button>
        </div>
      </div>
    </div>

    <!-- Форма отправки сообщения -->
    <form v-if="!formActive" @submit.prevent="handleSubmit" class="p-4 bg-white border-t">
      <div class="flex">
        <input
            type="text"
            v-model="input"
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
  </div>
</template>

<script>
export default {
  name: 'WebBotPrototype',
  data() {
    return {
      messages: [],
      input: '',
      formInputValue: '',
      loading: false,
      showOptions: false,
      formActive: false,
      showConfetti: false,
      currentQuestion: 0,
      formData: {
        name: '',
        phone: '',
        email: '',
        projectType: '',
        budget: '',
      },
      botAnswers: {
        greeting: {
          text: 'Привет! 👋 Я демо-бот разработчика ботов. Могу показать вам, какие возможности будут доступны в вашем персональном боте. Что вас интересует?',
          options: ['Возможности ботов', 'Примеры использования', 'Стоимость разработки', 'Связаться с разработчиком']
        },
        features: {
          text: '🤖 Боты могут выполнять множество задач:\n\n✅ Автоматизировать общение с клиентами\n✅ Принимать заказы и бронирования\n✅ Проводить опросы и квизы\n✅ Интегрироваться с CRM-системами\n✅ Отправлять уведомления\n✅ Принимать оплаты\n\nХотите увидеть интерактивную демонстрацию?',
          options: ['Показать демонстрацию', 'Примеры использования', 'Вернуться в меню']
        },
        demonstration: {
          text: '🎬 **Интерактивная демонстрация**\n\nПредставьте, что вы владелец пиццерии. Вот как может выглядеть работа с ботом для ваших клиентов:',
          options: ['Заказать пиццу', 'Посмотреть меню', 'Статус заказа', 'Вернуться к возможностям']
        },
        demo_order: {
          text: '🍕 Отлично! Какую пиццу вы хотели бы заказать?',
          options: ['Пепперони', 'Маргарита', 'Четыре сыра', 'Гавайская']
        },
        demo_pizza_selected: {
          text: '👍 Вы выбрали **[PIZZA]**! Отличный выбор.\n\nРазмер пиццы?',
          options: ['Маленькая (25см)', 'Средняя (30см)', 'Большая (35см)']
        },
        demo_size_selected: {
          text: '✅ Заказ оформлен!\n\n**Ваш заказ:**\nПицца: [PIZZA]\nРазмер: [SIZE]\nСтоимость: [PRICE]₽\nДоставка: 30-45 минут\n\nВаш заказ №12345 принят в работу.\n\nТаким образом, бот может провести клиента через весь процесс заказа. Это только пример - возможности ботов практически безграничны!',
          options: ['Другие возможности', 'Связаться с разработчиком', 'Вернуться в меню']
        },
        examples: {
          text: '📱 **Примеры использования ботов:**\n\n🛍️ **Интернет-магазин**: каталог товаров, прием заказов, оплата.\n\n🏨 **Сфера услуг**: управление бронированиями, напоминания.\n\n🔍 **Поддержка клиентов**: ответы на частые вопросы 24/7.\n\n💼 **Бизнес-процессы**: заявки, согласования, отчеты.\n\n📊 **Маркетинг**: опросы, квизы, акции, лояльность.\n\nЧто вас больше интересует?',
          options: ['Узнать стоимость', 'Заказать разработку', 'Вернуться в меню']
        },
        pricing: {
          text: '💰 **Стоимость разработки бота**\n\n⭐ **Базовый бот**: от 30,000₽\nПростой функционал с базовыми командами\n\n⭐⭐ **Стандартный бот**: от 60,000₽\nРасширенный функционал с интеграциями\n\n⭐⭐⭐ **Продвинутый бот**: от 120,000₽\nСложные интеграции, ИИ и аналитика\n\nКаждый проект уникален, и мы всегда готовы обсудить индивидуальные потребности вашего бизнеса.',
          options: ['Заказать разработку', 'Получить консультацию', 'Вернуться в меню']
        },
        contact: {
          text: '📝 **Заполните форму заявки**\n\nПожалуйста, ответьте на несколько вопросов, чтобы я мог лучше понять ваш проект.',
          options: []
        }
      },
      formQuestions: [
        { question: 'Как вас зовут?', field: 'name', type: 'text', placeholder: 'Введите ваше имя' },
        { question: 'Укажите контактный телефон', field: 'phone', type: 'tel', placeholder: '+7 (___) ___-__-__' },
        { question: 'Введите ваш email', field: 'email', type: 'email', placeholder: 'example@mail.com' },
        {
          question: 'Какой тип бота вас интересует?',
          field: 'projectType',
          type: 'select',
          options: [
            'Бот для продаж/магазин',
            'Бот-помощник/онбординг',
            'Бот для поддержки клиентов',
            'Бот для опросов/квизов',
            'Другое (укажу в сообщении)'
          ]
        },
        {
          question: 'Ориентировочный бюджет проекта',
          field: 'budget',
          type: 'select',
          options: [
            'До 30 000 ₽',
            '30 000 - 60 000 ₽',
            '60 000 - 120 000 ₽',
            'Более 120 000 ₽',
            'Не определился'
          ]
        }
      ],
      selectedPizza: '',
    }
  },
  computed: {
    currentOptions() {
      const step = this.getActiveStep();
      if (this.botAnswers[step] && this.botAnswers[step].options) {
        return this.botAnswers[step].options;
      }
      return [];
    }
  },
  methods: {
    // Форматирование текста сообщения (обработка простых markdown-подобных элементов)
    formatMessage(text) {
      if (!text) return '';

      // Обработка жирного текста
      let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      // Обработка переносов строк
      formattedText = formattedText.replace(/\n/g, '<br />');

      return formattedText;
    },

    // Добавление сообщения бота с задержкой
    addBotMessage(message, options = null, delay = 1000) {
      this.loading = true;
      setTimeout(() => {
        this.messages.push({ text: message, sender: 'bot' });
        this.loading = false;
        if (options && options.length > 0) {
          setTimeout(() => this.showOptions = true, 300);
        }
      }, delay);
    },

    // Получение текущего шага диалога
    getActiveStep() {
      if (this.messages.length === 0) return 'greeting';

      const lastBotMessage = [...this.messages].reverse().find(msg => msg.sender === 'bot');
      if (!lastBotMessage) return 'greeting';

      // Определяем текущий шаг по содержимому последнего сообщения бота
      if (lastBotMessage.text.includes('Какую пиццу вы хотели бы заказать')) {
        return 'demo_order';
      } else if (lastBotMessage.text.includes('Размер пиццы')) {
        return 'demo_pizza_selected';
      }

      // По умолчанию возвращаем greeting
      return 'greeting';
    },

    // Обработка демонстрационного заказа пиццы
    handleDemoOrder(option, step) {
      if (step === 'demo_order') {
        const pizza = option;
        this.messages.push({ text: option, sender: 'user' });
        this.showOptions = false;
        this.selectedPizza = pizza;

        setTimeout(() => {
          const message = this.botAnswers.demo_pizza_selected.text.replace('[PIZZA]', pizza);
          this.addBotMessage(message, this.botAnswers.demo_pizza_selected.options, 800);
        }, 500);
      }
      else if (step === 'demo_pizza_selected') {
        const size = option;
        const pizza = this.selectedPizza || 'Пепперони';
        const price = this.getPizzaPrice(pizza, size);

        this.messages.push({ text: option, sender: 'user' });
        this.showOptions = false;

        setTimeout(() => {
          let message = this.botAnswers.demo_size_selected.text
              .replace('[PIZZA]', pizza)
              .replace('[SIZE]', size)
              .replace('[PRICE]', price);

          this.addBotMessage(message, this.botAnswers.demo_size_selected.options, 1200);
        }, 500);
      }
    },

    // Генерация цены для демо заказа пиццы
    getPizzaPrice(pizza, size) {
      const basePrices = {
        'Пепперони': 400,
        'Маргарита': 350,
        'Четыре сыра': 450,
        'Гавайская': 420
      };

      const sizeMultipliers = {
        'Маленькая (25см)': 1,
        'Средняя (30см)': 1.5,
        'Большая (35см)': 2
      };

      const basePrice = basePrices[pizza] || 400;
      const multiplier = sizeMultipliers[size] || 1;

      return Math.floor(basePrice * multiplier);
    },

    // Обработка клика по кнопке опции
    handleOptionClick(option, customStep = null) {
      const step = customStep || this.getActiveStep();

      // Обработка демо-заказа
      if (step === 'demo_order' || step === 'demo_pizza_selected') {
        this.handleDemoOrder(option, step);
        return;
      }

      this.messages.push({ text: option, sender: 'user' });
      this.showOptions = false;

      setTimeout(() => {
        if (option === 'Возможности ботов' || option.includes('возможности')) {
          this.addBotMessage(this.botAnswers.features.text, this.botAnswers.features.options);
        }
        else if (option === 'Показать демонстрацию' || option.includes('демонстрацию')) {
          this.addBotMessage(this.botAnswers.demonstration.text, this.botAnswers.demonstration.options);
        }
        else if (option === 'Заказать пиццу') {
          this.addBotMessage(this.botAnswers.demo_order.text, this.botAnswers.demo_order.options);
        }
        else if (option === 'Примеры использования' || option.includes('примеры')) {
          this.addBotMessage(this.botAnswers.examples.text, this.botAnswers.examples.options);
        }
        else if (option === 'Стоимость разработки' || option.includes('стоимость') || option === 'Узнать стоимость') {
          this.addBotMessage(this.botAnswers.pricing.text, this.botAnswers.pricing.options);
        }
        else if (option === 'Связаться с разработчиком' || option.includes('связаться') || option === 'Заказать разработку' || option === 'Получить консультацию') {
          this.addBotMessage(this.botAnswers.contact.text);
          this.formActive = true;
          this.currentQuestion = 0;
        }
        else if (option === 'Вернуться в меню' || option === 'Другие возможности') {
          this.addBotMessage(this.botAnswers.greeting.text, this.botAnswers.greeting.options);
        }
        else if (option === 'Вернуться к возможностям') {
          this.addBotMessage(this.botAnswers.features.text, this.botAnswers.features.options);
        }
        else {
          this.addBotMessage('Извините, не совсем понял ваш запрос. Выберите один из вариантов.', this.botAnswers.greeting.options);
        }
      }, 500);
    },

    // Обработка отправки формы с заявкой
    handleFormSubmit(value) {
      // Обновляем данные формы
      this.formData[this.formQuestions[this.currentQuestion].field] = value;
      this.formInputValue = '';

      // Добавляем сообщение пользователя
      this.messages.push({ text: value, sender: 'user' });

      // Если это последний вопрос, отправляем форму
      if (this.currentQuestion === this.formQuestions.length - 1) {
        // Показываем загрузку
        this.loading = true;
        setTimeout(() => {
          // Добавляем сообщение об успешной отправке
          this.messages.push({
            text: `✅ **Спасибо за ваше обращение!**\n\nВаша заявка успешно отправлена. Я свяжусь с вами в ближайшее время для обсуждения деталей проекта.\n\nДанные вашей заявки:\n- **Имя**: ${this.formData.name}\n- **Телефон**: ${this.formData.phone}\n- **Email**: ${this.formData.email}\n- **Тип проекта**: ${this.formData.projectType}\n- **Бюджет**: ${this.formData.budget}`,
            sender: 'bot'
          });
          this.loading = false;
          this.formActive = false;

          // Показываем кнопки и конфетти
          setTimeout(() => {
            this.showOptions = true;
            this.showConfetti = true;
            setTimeout(() => this.showConfetti = false, 3000);
          }, 500);

        }, 1500);
        return;
      }

      // Переходим к следующему вопросу
      this.currentQuestion++;

      // Добавляем следующий вопрос от бота
      setTimeout(() => {
        this.addBotMessage(this.formQuestions[this.currentQuestion].question, []);
      }, 800);
    },

    // Обработка отправки сообщения пользователем
    handleSubmit() {
      if (this.input.trim() === '') return;

      this.messages.push({ text: this.input, sender: 'user' });
      const userInput = this.input;
      this.input = '';
      this.showOptions = false;

      // Простая логика для ответов на текстовые сообщения
      setTimeout(() => {
        if (userInput.toLowerCase().includes('привет')) {
          this.addBotMessage(this.botAnswers.greeting.text, this.botAnswers.greeting.options);
        } else if (
            userInput.toLowerCase().includes('возможности') ||
            userInput.toLowerCase().includes('что умеешь')
        ) {
          this.addBotMessage(this.botAnswers.features.text, this.botAnswers.features.options);
        } else if (
            userInput.toLowerCase().includes('пример') ||
            userInput.toLowerCase().includes('кейс')
        ) {
          this.addBotMessage(this.botAnswers.examples.text, this.botAnswers.examples.options);
        } else if (
            userInput.toLowerCase().includes('цена') ||
            userInput.toLowerCase().includes('стоимость') ||
            userInput.toLowerCase().includes('сколько стоит')
        ) {
          this.addBotMessage(this.botAnswers.pricing.text, this.botAnswers.pricing.options);
        } else if (
            userInput.toLowerCase().includes('контакт') ||
            userInput.toLowerCase().includes('связь') ||
            userInput.toLowerCase().includes('заказать')
        ) {
          this.addBotMessage(this.botAnswers.contact.text);
          this.formActive = true;
          this.currentQuestion = 0;
        } else {
          this.addBotMessage('Извините, я не совсем понял ваш запрос. Выберите один из вариантов ниже:', this.botAnswers.greeting.options);
        }
      }, 500);
    },

    // Прокрутка контейнера сообщений
    scrollToBottom() {
      if (this.$refs.messagesContainer) {
        this.$nextTick(() => {
          this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
        });
      }
    }
  },
  watch: {
    // Следим за изменениями в сообщениях для автопрокрутки
    messages() {
      this.scrollToBottom();
    },
    showOptions() {
      this.scrollToBottom();
    },
    formActive() {
      this.scrollToBottom();
    }
  },
  mounted() {
    // Приветственное сообщение при загрузке компонента
    setTimeout(() => {
      this.addBotMessage(this.botAnswers.greeting.text, this.botAnswers.greeting.options);
    }, 1000);
  }
}
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