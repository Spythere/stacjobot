import { Client, Message } from 'discord.js';

const MAX_TIMEOUT_MINUTES = 120,
  MIN_TIMEOUT_MINUTES = 5;

function randomMuteUser(message: Message) {
  const randMinutes = ~~(
    Math.random() * (MAX_TIMEOUT_MINUTES - MIN_TIMEOUT_MINUTES) +
    MIN_TIMEOUT_MINUTES
  );

  message.member
    .timeout(randMinutes * 60 * 1000)
    .then(() => {
      const hours = ~~(randMinutes / 60);
      const minutes = randMinutes % 60;

      message.reply(
        `Gratulacje, <@${message.member.id}>! Dostałeś ${
          hours > 0 ? hours + ' hektar i ' : ''
        }${minutes}m przerwy! <a:rewident:1108083125147406389>`,
      );

      message.react('<a:rewident:1108083125147406389>');
    })
    .catch(() => {
      message.reply(
        'Niestety, obecny reżim nie pozwala na mutowanie oficjeli na wysokich stanowiskach! <a:bagiety:1084565542930751649>',
      );
    });
}

const customCommands = {
  '!dajmute': randomMuteUser,
};

export class CustomCommandHandler {
  constructor(private readonly client: Client) {}

  public handleCommands() {
    this.client.on('messageCreate', async (message) => {
      const isContentCustomCommand = message.content in customCommands;

      if (isContentCustomCommand) {
        customCommands[message.content](message);
      }
    });
  }
}
