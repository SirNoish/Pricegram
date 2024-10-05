'use strict';
const { Scenes } = require('telegraf');
const extractDomain = require('extract-domain');
const logger = require('../../logger')('bot');
const { Product } = require('../../models');
const http = require('../../helpers/http');
const validator = require('../../helpers/validator');
const AmazonProductPage = require('../../amazon/amazon-product-page');

const steps = [
  async ctx => {
    await ctx.reply('¿Cuál es el nombre del producto?');

    ctx.wizard.next();
  },
  async ctx => {
    const name = ctx.update.message.text;
    const user = ctx.update.message.from.id;
    const exists = await Product.exists({ name: name, user: user });

    if (exists) {
      return await ctx.reply(
        'Ya tienes un producto con el mismo nombre. Selecciona otro o usa /exit para salir.'
      );
    }

    await ctx.reply('Inserta la url o comparte el articulo con Pricegram desde la app de Amazon');

    ctx.wizard.state.name = name;
    ctx.wizard.next();
  },
  async ctx => {
    const message = ctx.update.message.text;
    const urls = message.match(/\bhttps?:\/\/\S+/gi);

    if (!urls) {
      return await ctx.reply('URL no valida, usa otra dirección o usa /exit para salir.');
    }

    const url = urls[0];
    const domain = extractDomain(url);

    if (!validator.isUrl(url) || !domain.startsWith('amazon.')) {
      return await ctx.reply('Esto no es un producto de Amazon, usa otra dirección o usa /exit para salir.');
    }

    await ctx.reply('Obteniendo información del producto...');

    const html = await http.get(url);
    const productPage = new AmazonProductPage(html);

    const product = new Product({
      name: ctx.wizard.state.name,
      url: url,
      user: ctx.update.message.from.id,
      price: productPage.price,
      currency: productPage.currency,
      availability: productPage.availability,
      lastCheck: Math.floor(Date.now() / 1000)
    });

    await product.save();

    logger.info(`Product added: ${product.name} (${product.id}) - ${product.price} - ${product.availability}`);

    await ctx.reply('Tu producto está en seguimiento 🎉');
    await ctx.scene.leave();
  }
];

const scene = new Scenes.WizardScene('add-product', ...steps);

scene.command('exit', async ctx => {
  await ctx.scene.leave();
  await ctx.reply('Acción cancelada.');
});

module.exports = scene;
