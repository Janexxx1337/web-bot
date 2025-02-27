export const botUtils = {
    // Get pizza price based on type and size
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

    // Process message text to handle keywords
    processUserInput(input) {
        const text = input.toLowerCase();

        if (text.includes('привет') || text.includes('здравствуйте') || text.includes('добрый день')) {
            return 'start';
        } else if (text.includes('возможности') || text.includes('что умеет') || text.includes('что может')) {
            return 'features';
        } else if (text.includes('пример') || text.includes('кейс') || text.includes('использование')) {
            return 'examples';
        } else if (text.includes('цена') || text.includes('стоимость') || text.includes('сколько стоит')) {
            return 'pricing';
        } else if (text.includes('контакт') || text.includes('связь') || text.includes('заказать') ||
            text.includes('телеграм') || text.includes('telegram')) {
            return 'contact';
        } else if (text.includes('заказ') && text.includes('пицц')) {
            return 'demo_order_pizza';
        } else if (text.includes('меню')) {
            return 'demo_menu';
        } else if (text.includes('статус') || (text.includes('где') && text.includes('заказ'))) {
            return 'demo_order_status';
        } else if (text.includes('главное меню') || text.includes('вернуться') || text.includes('начало')) {
            return 'start';
        }

        return null;
    }
};
