import { InjectDiscordClient, On, Once } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  GuildMember,
  Interaction,
  InteractionType,
  TextChannel,
} from 'discord.js';

@Injectable()
export class UserVerificationService {
  private logger = new Logger('Verification');
  private readonly CHANNEL_MESSAGE_COUNT = 2;

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly config: ConfigService,
  ) {}

  @Once('ready')
  onReady() {
    this.setupVerificationChannel();
  }

  // Button interaction listener
  @On('interactionCreate')
  async onInteraction(i: Interaction) {
    if (i.type == InteractionType.MessageComponent && i.customId && /^stacjobot_verify/.test(i.customId)) {
      // Verification button
      const verifyResult = await this.verifyInteractionUser(i);

      if (verifyResult) i.reply({ content: 'Zostałeś zweryfikowany!', ephemeral: true });
      else i.reply({ content: 'Jesteś już zweryfikowany!', ephemeral: true });
    }
  }

  private async setupVerificationChannel() {
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

      if (channelMessages.size == this.CHANNEL_MESSAGE_COUNT) {
        return;
      }

      this.logger.log('Czyszczenie kanału...');
      await channel.bulkDelete(100, true);

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

  private async verifyInteractionUser(interaction: Interaction) {
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
