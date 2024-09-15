const colors = require("colors");
const { EmbedBuilder } = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");

const command = new SlashCommand()
  .setName("autoleave")
  .setDescription("Automatically leaves when everyone leaves the voice channel (toggle)")
  .setRun(async (client, interaction) => {
    let channel = await client.getChannel(client, interaction);
    if (!channel) return;

    let player;
    if (client.manager.Engine)
      player = client.manager.Engine.players.get(interaction.guild.id);
    else
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("Lavalink node is not connected"),
        ],
      });

    if (!player) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("There's nothing playing in the queue"),
        ],
        ephemeral: true,
      });
    }

    let autoLeaveEmbed = new EmbedBuilder().setColor(client.config.embedColor);
    const autoLeave = player.get("autoLeave");
    player.set("requester", interaction.guild.members.me);

    if (!autoLeave) {
      player.set("autoLeave", true);
    } else {
      player.set("autoLeave", false);
    }
    autoLeaveEmbed
			.setDescription(`**Auto Leave is** \`${!autoLeave ? "ON" : "OFF"}\``)
			.setFooter({
			  text: `The player will ${!autoLeave ? "now automatically" : "not automatically"} leave when the voice channel is empty.`
			});
    client.warn(
      `Player: ${player.options.guild} | [${colors.blue(
        "autoLeave"
      )}] has been [${colors.blue(!autoLeave ? "ENABLED" : "DISABLED")}] in ${
        client.guilds.cache.get(player.options.guild)
          ? client.guilds.cache.get(player.options.guild).name
          : "a guild"
      }`
    );

    const ret = await interaction.reply({ embeds: [autoLeaveEmbed], fetchReply: true });
    if (ret) setTimeout(() => ret.delete().catch(client.warn), 20000);
    return ret;
  });

module.exports = command;
