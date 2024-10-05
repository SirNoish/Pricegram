'use strict';
const { Telegraf, Scenes } = require('telegraf');
const LocalSession = require('telegraf-session-local');
const scenes = require('./scenes');
const commands = require('./commands');
const actions = require('./actions');
const errorHandler = require('./error-handler');

const stage = new Scenes.Stage(Object.values(scenes));
const session = new LocalSession();

const welcomeMessage = '*Bienvenido a Pricegram*\n\n' +
  'Comience a ahorrar dinero rastreando los productos de Amazon y reciba ' +
  'alertas de precio y disponibilidad según sus preferencias.\n' +
  '_Comandos_\n\n' +
  '/track - Añade un nuevo producto al seguimiento\n' +
  '/list - Gestiona tu lista de productos';

class Bot extends Telegraf {
  constructor(token, options) {
    super(token, options);

    this.use(session.middleware());
    this.use(stage.middleware());

    this.catch(errorHandler);

    this.start(ctx => ctx.replyWithMarkdown(welcomeMessage));

    this.command('track', commands.track);
    this.command('list', commands.list);

    this.action('!list', actions.list);
    this.action(/^!menu=(\w+)$/, actions.menu);
    this.action(/^!remove\?id=(\w+)$/, actions.remove);
    this.action(/^!availability\?id=(\w+)&value=(\w+)$/, actions.availability);
    this.action(/^!price\?id=(\w+)$/, actions.price);
  }

  sendMessage(user, message) {
    // eslint-disable-next-line
    this.telegram.sendMessage(user, message, { parse_mode: 'Markdown', disable_web_page_preview: true });
  }
}

module.exports = Bot;
