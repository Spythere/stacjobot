import { Message, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { PrismaService } from '../../prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export class SponsorPrefixCmd {
  constructor(private readonly prisma: PrismaService) {}

  private readonly logger = new Logger('Stacjosponsor');

  private readonly subCommands = [
    {
      name: 'list',
      requiresValidation: false,
      handler: 'showDonators',
    },
    {
      name: 'add',
      requiresValidation: true,
      handler: 'addToDonator',
    },
    {
      name: 'remove',
      requiresValidation: false,
      handler: 'removeDonator',
    },
  ];

  async handleCommand(message: Message) {
    if (!this.runGuard(message)) return;

    const [_, cmdName] = message.content.split(' ');

    const cmd = this.subCommands.find((c) => c.name === cmdName);

    if (!cmd) return message.reply('Dostępne subkomendy: add / remove / list');

    if (cmd.requiresValidation && !this.validateArgs(message))
      return message.reply(
        'Komenda powinna wyglądać tak: !sponsor [add | remove] [nick TD2] [amount (gr)] [opcjonalnie: discord ID]',
      );

    return this[cmd.handler](message);
  }

  private validateArgs(message: Message): boolean {
    const [_, cmdName, nick, amountGr] = message.content.split(' ');

    return (
      cmdName &&
      nick &&
      amountGr &&
      cmdName.trim() !== '' &&
      nick.trim() !== '' &&
      !isNaN(Number(amountGr))
    );
  }

  private runGuard(message: Message): boolean {
    return message.member.permissions.has(PermissionFlagsBits.Administrator);
  }

  private parsePLN(amountGr: number) {
    const amountZloty = ~~(amountGr / 100);
    const amountRest = ~~(amountGr % 100);

    return `${amountZloty}zł ${amountRest}gr`;
  }

  private async addToDonator(message: Message): Promise<Message> {
    const { 2: nickTD2, 3: amountGr } = message.content.split(' ');

    const discordMember = message.mentions.members.first();

    if (discordMember) {
      await message.guild.roles.fetch();

      const sponsorRole = message.guild.roles.cache.find(
        (r) => r.name === 'Stacjosponsor',
      );

      if (sponsorRole) discordMember.roles.add(sponsorRole);
    }

    try {
      const donator = await this.prisma.donators.upsert({
        where: {
          nameTD2: nickTD2,
        },

        create: {
          nameTD2: nickTD2,
          donatedAmount: Number(amountGr),
          nameDiscord: discordMember?.id,
        },

        update: {
          donatedAmount: {
            increment: Number(amountGr),
          },
          nameDiscord: discordMember?.id,
        },
      });

      this.logger.log(
        `${donator.nameTD2}: ${this.parsePLN(donator.donatedAmount)}`,
      );

      return message.reply({
        content: `Gracz \`${donator.nameTD2}\` (${
          donator.nameDiscord ? `<@${donator.nameDiscord}>` : 'brak profilu DC'
        }): dodano ${this.parsePLN(
          Number(amountGr),
        )} (łącznie teraz: ${this.parsePLN(donator.donatedAmount)})`,
        flags: [MessageFlags.SuppressNotifications],
      });
    } catch (error) {
      this.logger.error(error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code == 'P2002')
          return message.reply(
            'Ten użytkownik Discord jest już przypisany pod inny wpis!',
          );
      }

      return message.reply(
        'Wystąpił błąd podczas wykonywania komendy, sprawdź czy wszystko wpisałeś poprawnie!',
      );
    }
  }

  private async removeDonator(message: Message): Promise<Message> {
    const { 2: nickTD2 } = message.content.split(' ');

    const donator = await this.prisma.donators.findUnique({
      where: {
        nameTD2: nickTD2,
      },
    });

    if (!donator)
      return message.reply({
        content: 'Nie znaleziono podanego gracza na liście Stacjosponsorów!',
      });

    if (donator.nameDiscord) {
      try {
        const discordMember = message.guild.members.fetch(donator.nameDiscord);
        await message.guild.roles.fetch();

        const sponsorRole = message.guild.roles.cache.find(
          (r) => r.name === 'Stacjosponsor',
        );

        (await discordMember).roles.remove(sponsorRole);
      } catch (error) {
        console.log(error);

        message.reply(
          'Wystąpił problem z usunięciem rangi Stacjosponsora na serwerze Discord!',
        );
      }
    }

    try {
      await this.prisma.donators.delete({
        where: {
          nameTD2: nickTD2,
        },
      });

      return message.reply({
        content: `Gracz \`${donator.nameTD2}\` został usunięty z listy Stacjosponsorów!`,
        flags: [MessageFlags.SuppressNotifications],
      });
    } catch (error) {
      console.log(error);

      return message.reply(
        'Wystąpił błąd podczas wykonywania komendy, sprawdź czy wszystko wpisałeś poprawnie!',
      );
    }
  }

  private async showDonators(message: Message): Promise<Message> {
    const donatorList = await this.prisma.donators.findMany({});

    return message.reply({
      content: `# LISTA STACJOSPONSORÓW\n${donatorList
        .map(
          (d) =>
            `\`${d.nameTD2}\` ${
              d.nameDiscord ? `(<@${d.nameDiscord}>)` : ''
            } - ${this.parsePLN(d.donatedAmount)}`,
        )
        .join('\n')}`,
      flags: [MessageFlags.SuppressNotifications],
    });
  }
}
