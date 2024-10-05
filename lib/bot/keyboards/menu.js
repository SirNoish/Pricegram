'use strict';
const { Markup } = require('telegraf');

module.exports = product => {
  const availabilityAlerts = product.preferences.availabilityAlerts;
  const targetPrice = product.preferences.targetPrice;
  const currency = product.currency || '';

  const items = [
    {
      text: '💰  Precio deseado ' + (targetPrice ? '(' + currency + (currency ? ' ' : '') + targetPrice + ')' : ''),
      callbackData: '!price?id=' + product.id
    },
    {
      text: '🧭  Alerta de producto disponible: ' + (availabilityAlerts ? 'SI' : 'NO'),
      callbackData: '!availability?id=' + product.id + '&value=' + !availabilityAlerts
    },
    {
      text: '🗑  Borrar',
      callbackData: '!remove?id=' + product.id
    },
    {
      text: '      <<  Volver a la lista de productos      ',
      callbackData: '!list'
    }
  ];

  return Markup.inlineKeyboard([...items.map(e => [Markup.button.callback(e.text, e.callbackData)])]);
};
