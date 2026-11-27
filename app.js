'use strict';

function parseExpense(title, amount, category) {
  title = title.trim();
  category = category.trim();
  const match = /^(\d+)(?:[.,](\d{1,2}))?$/.exec(amount.trim());
  if (!title || !category || !match) return null;
  const cents = Number(match[1]) * 100 + Number((match[2] || '').padEnd(2, '0'));
  if (!Number.isSafeInteger(cents) || cents <= 0) return null;
  return { title, category, cents };
}

if (typeof module !== 'undefined') module.exports = { parseExpense };

if (typeof document !== 'undefined') {
  const form = document.querySelector('#expense-form');
  const list = document.querySelector('#expenses');
  const total = document.querySelector('#total');
  const message = document.querySelector('#message');
  const key = 'personal-expenses';
  let expenses = [];
  let storageAvailable = true;

  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || !parsed.every(item => item && typeof item.title === 'string' && typeof item.category === 'string' && Number.isSafeInteger(item.cents) && item.cents > 0) || !Number.isSafeInteger(parsed.reduce((sum, item) => sum + item.cents, 0))) throw new Error('Invalid data');
      expenses = parsed;
    }
  } catch {
    storageAvailable = false;
    message.textContent = 'Не удалось загрузить сохранённые расходы. Добавление отключено, чтобы не перезаписать данные.';
    form.querySelector('button').disabled = true;
  }

  const format = cents => `${Math.floor(cents / 100).toLocaleString('ru-RU')},${String(cents % 100).padStart(2, '0')} ₽`;
  function render() {
    list.replaceChildren();
    for (const expense of expenses) {
      const item = document.createElement('li');
      item.textContent = `${expense.title} — ${expense.category}: ${format(expense.cents)}`;
      list.append(item);
    }
    total.textContent = format(expenses.reduce((sum, expense) => sum + expense.cents, 0));
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!storageAvailable) return;
    const expense = parseExpense(form.elements.title.value, form.elements.amount.value, form.elements.category.value);
    if (!expense) {
      message.textContent = 'Укажите название, категорию и положительную сумму с не более чем двумя знаками после запятой.';
      return;
    }
    if (!Number.isSafeInteger(expenses.reduce((sum, item) => sum + item.cents, expense.cents))) {
      message.textContent = 'Общая сумма слишком велика.';
      return;
    }
    const updated = [...expenses, expense];
    try {
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {
      message.textContent = 'Не удалось сохранить расход. Проверьте настройки или свободное место и попробуйте снова.';
      return;
    }
    expenses = updated;
    message.textContent = '';
    form.reset();
    render();
  });
  render();
}
