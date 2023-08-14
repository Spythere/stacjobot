import { Client, Message } from 'discord.js';
import { PrismaService } from '../../prisma/prisma.service';
import { stacjobotUsers } from '@prisma/client';

const isDevelopment = process.env.NODE_ENV === 'development';

const MAX_TIMEOUT_MINUTES = 360,
  MIN_TIMEOUT_MINUTES = 60,
  KOFOLA_TIMEOUT_HOURS = 12;

const customEmojiIds = {
  kofola: isDevelopment
    ? '<:utk:1139170160327000064>'
    : '<:kofola2:1107627668293292083>',
  rewident: isDevelopment
    ? '<a:rewident:1139173995476963398>'
    : '<a:rewident:1108083125147406389>',
  bagiety: isDevelopment
    ? '<:utk:1139170160327000064>'
    : '<a:bagiety:1084565542930751649>',
  tenseSmash: isDevelopment
    ? '<a:tenseSmash:1140620190493720596>'
    : '<a:tenseSmash:1140423227634630657>',
};

async function randomMuteUser(message: Message) {
  const randMinutes = ~~(
    Math.random() * (MAX_TIMEOUT_MINUTES - MIN_TIMEOUT_MINUTES) +
    MIN_TIMEOUT_MINUTES
  );

  try {
    await message.member.timeout(randMinutes * 60 * 1000);

    const hours = ~~(randMinutes / 60);
    const minutes = randMinutes % 60;

    message.react(customEmojiIds.rewident);

    message.reply(
      `Gratulacje, <@${message.member.id}>! Dostałeś ${
        hours > 0 ? hours + 'h i ' : ''
      }${minutes}m przerwy! ${customEmojiIds.rewident}`,
    );
  } catch (error) {
    message.reply(
      'Niestety, obecny reżim nie pozwala na mutowanie oficjeli na wysokich stanowiskach! ' +
        customEmojiIds.bagiety,
    );
  }
}

async function addKofolaToUser(prisma: PrismaService, message: Message) {
  const messageAuthorId = message.author.id;

  const user = await prisma.stacjobotUsers.findUnique({
    where: { userId: messageAuthorId },
  });

  let updatedUser: stacjobotUsers;
  const nextTime = new Date(
    new Date().getTime() + KOFOLA_TIMEOUT_HOURS * 60 * 60 * 1000,
  );
  const randAmount = ~~(Math.random() * (6 - 1) + 1);

  if (user) {
    if (user.nextKofolaTime > new Date()) {
      message.reply(
        `Następny przydział kofoli dostępny <t:${~~(
          user.nextKofolaTime.getTime() / 1000
        )}:R> ${customEmojiIds.tenseSmash} \nObecnie posiadasz: ${
          user.kofolaCount
        }x ${customEmojiIds.kofola}!`,
      );

      return;
    }

    updatedUser = await prisma.stacjobotUsers.update({
      where: {
        userId: messageAuthorId,
      },
      data: {
        kofolaCount: {
          increment: randAmount,
        },
        nextKofolaTime: nextTime,
      },
    });
  } else
    updatedUser = await prisma.stacjobotUsers.create({
      data: {
        userId: messageAuthorId,
        nextKofolaTime: nextTime,
        kofolaCount: randAmount,
      },
    });

  message.react(customEmojiIds.kofola);
  message.reply(
    `Zdobyłeś ${randAmount}x ${customEmojiIds.kofola}! (Łącznie: ${updatedUser.kofolaCount})`,
  );
}

export class CustomCommandHandler {
  constructor(
    private readonly client: Client,
    private readonly prisma: PrismaService,
  ) {}

  public handleCommands() {
    this.client.on('messageCreate', async (message) => {
      const content = message.content;

      if (!content.startsWith('!')) return;

      const [command] = content.slice(1).split(' ');

      switch (command.toLocaleLowerCase()) {
        case 'dajmute':
          randomMuteUser(message);
          break;

        case 'kofola':
          addKofolaToUser(this.prisma, message);
          break;

        default:
          break;
      }
    });
  }
}
