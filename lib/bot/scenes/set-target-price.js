'use strict';
const { Scenes } = require('telegraf');
const { Product } = require('../../models');

const steps = [
  async ctx => {
    const productId = ctx.wizard.state.productId;
    const product = await Product.findById(productId);

    await ctx.editMessageText('Introduce el precio deseado para ' + product.name + ' (0 to remove)');

    ctx.wizard.next();
  },
  async ctx => {
    const productId = ctx.wizard.state.productId;
    const targetPrice = ctx.update.message.text;

    const product = await Product.findByIdAndUpdate(productId, { 'preferences.targetPrice': targetPrice });

    if (targetPrice !== '0') {
      const currency = product.currency || '';

      await ctx.reply('El precio deseado para ' + product.name + ' está configurado para ' + targetPrice + currency + '.');
    } else {
      await ctx.reply('El precio deseado para ' + product.name + ' ha sido borrado.');
    }

    await ctx.scene.leave();
  }
];

module.exports = new Scenes.WizardScene('set-target-price', ...steps);
