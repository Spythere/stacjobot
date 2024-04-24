import { DiscordAPIError, Message, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { PrismaService } from '../../prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { Prisma } from '.prisma/client';
import { unescape } from 'querystring';

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
      cmdName !== undefined &&
      nick !== undefined &&
      amountGr !== undefined &&
      cmdName.trim() !== '' &&
      nick.trim() !== '' &&
      !isNaN(Number(amountGr))
    );
  }

  private runGuard(message: Message): boolean {
    if (!message.member) return false;

    return message.member.permissions.has(PermissionFlagsBits.Administrator);
  }

  private parsePLN(amountGr: number) {
    const amountZloty = ~~(amountGr / 100);
    const amountRest = ~~(amountGr % 100);

    return `${amountZloty}zł ${amountRest}gr`;
  }

  private async addToDonator(message: Message): Promise<Message> {
    const { 2: nickTD2, 3: amountGr, 4: memberId } = message.content.split(' ');

    try {
      const discordMember = await message.guild!.members.fetch(memberId);

      if (memberId) {
        await message.guild!.roles.fetch();
        const sponsorRole = message.guild!.roles.cache.find((r) => r.name === 'Stacjosponsor');

        if (sponsorRole) await discordMember.roles.add(sponsorRole);
      }

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

      this.logger.log(`${donator.nameTD2}: ${this.parsePLN(donator.donatedAmount)}`);

      return message.reply({
        content: `Gracz \`${donator.nameTD2}\` (${
          donator.nameDiscord ? `<@${donator.nameDiscord}>` : 'brak profilu DC'
        }): dodano ${this.parsePLN(Number(amountGr))} (łącznie teraz: ${this.parsePLN(donator.donatedAmount)})`,
        flags: [MessageFlags.SuppressNotifications],
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code == 'P2002') return message.reply('Ten użytkownik Discord jest już przypisany pod inny wpis!');
      } else if (error instanceof DiscordAPIError) {
        if (error.code == '10013') return message.reply('Użytkownik o podanym ID nie jest na tym serwerze!');
      } else this.logger.error(error);

      return message.reply('Wystąpił błąd podczas wykonywania komendy, sprawdź czy wszystko wpisałeś poprawnie!');
    }
  }

  private async removeDonator(message: Message): Promise<Message> {
    const { 2: nickTD2 } = message.content.split(' ');

    if (!nickTD2 || nickTD2.trim() == '')
      return message.reply({
        content: 'Nie podano poprawnego nicku TD2!',
      });

    try {
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
          const discordMember = message.guild!.members.fetch(donator.nameDiscord);
          await message.guild!.roles.fetch();

          const sponsorRole = message.guild!.roles.cache.find((r) => r.name === 'Stacjosponsor');

          if (sponsorRole) (await discordMember).roles.remove(sponsorRole);
        } catch (error) {
          console.log(error);

          message.reply('Wystąpił problem z usunięciem rangi Stacjosponsora na serwerze Discord!');
        }
      }

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

      return message.reply('Wystąpił błąd podczas wykonywania komendy, sprawdź czy wszystko wpisałeś poprawnie!');
    }
  }

  private async showDonators(message: Message): Promise<Message> {
    const donatorList = await this.prisma.donators.findMany({});

    const donatorListContent = donatorList
      .map(
        (d) => `\`${d.nameTD2}\` ${d.nameDiscord ? `(<@${d.nameDiscord}>)` : ''} - ${this.parsePLN(d.donatedAmount)}`,
      )
      .join('\n');

    return message.reply({
      content: `# LISTA STACJOSPONSORÓW\n${donatorListContent || 'brak zapisanych sponsorów :('}`,
      flags: [MessageFlags.SuppressNotifications],
    });
  }
}
