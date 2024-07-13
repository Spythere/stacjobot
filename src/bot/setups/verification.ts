import { InjectDiscordClient, On } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CacheType,
  Client,
  EmbedBuilder,
  GuildMember,
  GuildMemberRoleManager,
  Interaction,
  InteractionType,
  TextChannel,
} from 'discord.js';
import { isDevelopment } from '../utils/envUtils';

@Injectable()
export class UserVerificationService {
  private logger = new Logger('Verification');

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly config: ConfigService,
  ) {}

  async setupVerificationChannel() {
    const channelId = this.config.get<string>('VERIFICATION_CHANNEL_ID');

    if (!channelId) {
      this.logger.warn('Kanał weryfikacji nie został ustawiony - brak VERIFICATION_CHANNEL_ID!');
      return;
    }

    try {
      const channel = await this.client.channels.fetch(channelId);

      if (!channel || !(channel instanceof TextChannel)) {
        this.logger.warn(`Kanał weryfikacji nie został ustawiony - brak kanału tesktowego o ID: ${channelId}!`);
        return;
      }

      // Kanał istnieje i został pobrany
      this.logger.log('Wykryto kanał weryfikacji: ' + channel.name);

      const channelMessages = await channel.messages.fetch({ limit: 5 });

      if (!isDevelopment() && channelMessages.size == 2) {
        return;
      }

      this.logger.log('Czyszczenie kanału...');
      await channel.bulkDelete(100);

      const confirmButtonPolish = new ButtonBuilder()
        .setCustomId('stacjobot_verify_pl_btn')
        .setLabel('Przyjąłem!')
        .setEmoji('<:stacjownik:1002553938538676234>')
        .setStyle(ButtonStyle.Success);

      const confirmButtonEnglish = new ButtonBuilder()
        .setCustomId('stacjobot_verify_en_btn')
        .setLabel('Roger that!')
        .setEmoji('<:stacjownik:1002553938538676234>')
        .setStyle(ButtonStyle.Success);

      const embedPolish = new EmbedBuilder()
        .setTitle('Witaj na serwerze Stacjownika!')
        .setDescription('Aby uzyskać dostęp do zawartości serwera, kliknij przycisk "Przyjąłem!" poniżej')
        .setFields([
          {
            name: 'Reagując na tę wiadomość akceptujesz regulamin serwera:',
            value: 'https://discord.com/channels/912703992017068093/915692453678424095',
          },
        ])
        .setThumbnail('https://raw.githubusercontent.com/Spythere/api/main/thumbnails/stacjownik-logo-512.png')
        .setFooter({ text: 'Stacjobot' });

      const embedEnglish = new EmbedBuilder()
        .setTitle('Welcome to the Stacjownik server!')
        .setDescription(
          'This server is entirely Polish. To get access to its content, click the "Roger that!" button below',
        )
        .setFields([
          {
            name: "By reacting to this message, you accept the server's terms & conditions",
            value: 'https://discord.com/channels/912703992017068093/915692453678424095',
          },
        ])
        .setThumbnail('https://raw.githubusercontent.com/Spythere/api/main/thumbnails/stacjownik-logo-512.png')
        .setFooter({ text: 'Stacjobot' });

      channel.send({
        embeds: [embedPolish],
        components: [new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButtonPolish)],
      });

      channel.send({
        embeds: [embedEnglish],
        components: [new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButtonEnglish)],
      });
    } catch (error) {
      this.logger.error('Wystąpił błąd podczas konfiguracji kanału weryfikacji!', error);
      return;
    }
  }

  // Controlled from bot.gateway.ts as part of single interaction event
  async verifyUser(interaction: Interaction) {
    if (!interaction.guild) return false;

    await interaction.guild.roles.fetch();

    const verifiedRole = interaction.guild.roles.cache.find((r) => r.name === 'Użytkownik');

    if (!verifiedRole) return false;

    if (!(interaction.member instanceof GuildMember)) return false;

    if (interaction.member.roles.cache.has(verifiedRole.id)) {
      this.logger.log(
        `Użytkownik ${interaction.member.displayName} (${interaction.member.id}) został już zweryfikowany`,
      );

      return false;
    }

    interaction.member.roles.add(verifiedRole);

    this.logger.log(`Pomyślnie zweryfikowano użytkownika ${interaction.member.displayName} (${interaction.member.id})`);
    return true;
  }
}
