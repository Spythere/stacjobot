import { Command, Handler } from '@discord-nestjs/core';
import { CommandInteraction, InteractionReplyOptions } from 'discord.js';
import { PrismaService } from '../../../prisma/prisma.service';

@Command({
  name: 'kofolanotify',
  description: 'Zmienia indywidualne ustawienia powiadomień kofoloterii',
})
export class KofolaNotifyCmd {
  constructor(private prisma: PrismaService) {}

  @Handler()
  async onCommand(interaction: CommandInteraction): Promise<InteractionReplyOptions> {
    const userId = interaction.user.id;

    const stacjobotUser = await this.prisma.stacjobotUsers.findUnique({ where: { userId: userId } });

    if (!stacjobotUser)
      return {
        content: 'Musisz skorzystać z komendy !kofola przynajmniej raz, aby zmienić ustawienia powiadomień!',
        ephemeral: true,
      };

    const res = await this.prisma.stacjobotUsers.update({
      where: { userId: userId },
      data: { kofolaNotify: !stacjobotUser.kofolaNotify },
    });

    return {
      content: `:bell: Zmieniono ustawienia pingu przy wygranej w kofoloterii na: ${
        res.kofolaNotify ? ':white_check_mark: włączone' : ':x: wyłączone'
      }!`,
      ephemeral: true,
    };
  }
}
