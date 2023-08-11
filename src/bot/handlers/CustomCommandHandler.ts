import { Client, Message } from 'discord.js';

function randomMuteUser(message: Message) {
  const randMinutes = ~~(Math.random() * (60 - 3) + 3);

  message.member
    .timeout(randMinutes * 60 * 1000)
    .then(() => {
      message.reply(
        `Gratulacje, <@${message.member.id}>! Dostałeś ${randMinutes}m przerwy! <a:rewident:1108083125147406389>`,
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
