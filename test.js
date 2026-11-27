const assert = require('node:assert/strict');
const { parseExpense } = require('./app.js');

assert.deepEqual(parseExpense(' Чай ', '12,30', ' Еда '), { title: 'Чай', category: 'Еда', cents: 1230 });
assert.equal(parseExpense(' ', '1', 'Еда'), null);
assert.equal(parseExpense('Чай', '1', ' '), null);
for (const amount of ['0', '-1', 'abc', '1.001', '1e5', '9007199254740992']) {
  assert.equal(parseExpense('Чай', amount, 'Еда'), null, amount);
}
assert.equal(parseExpense('a', '0.1', 'b').cents + parseExpense('a', '0.2', 'b').cents, 30);
console.log('Проверки пройдены');
