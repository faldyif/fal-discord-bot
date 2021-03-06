import { DiscordCommand } from '../../contracts/discord';
import { Message, RichEmbed } from 'discord.js';
import NoMatchError from '../../errors/noMatchError';
import OsuVendor from '../../vendors/osuAPI';
import {
    enumModeToString,
    OsuType,
    stringModeToEnum
} from '../../common/osu';
import { getLatestChannelBeatmapId} from "../../common/cache";
import { EmbedDescription } from "./embedTemplate";

const osuVendors = new OsuVendor();

export default class CompareScore implements DiscordCommand {
    public description: string = 'Compare osu! score';
    public name: string = 'compare';
    public aliases: string[] = ['c'];

    execute = async (message: Message, args?: string[]) => {
        if (args === undefined || args.length === 0) throw new NoMatchError('Invalid arguments');
        const [userName, vendor, modeArg] = args;
        const mode = stringModeToEnum(modeArg);

        const beatmapId = await getLatestChannelBeatmapId(message.channel.id);
        if (beatmapId === '' || beatmapId === null) throw new NoMatchError('No beatmap found in this channel');

        const osuVendor = osuVendors.getVendor(vendor);

        const scores = await osuVendor.getScores({u: userName, type: OsuType.userName, m: mode, b: beatmapId});
        if (scores === undefined || scores === null || scores.length === 0) throw new NoMatchError('Scores not found');

        const beatmaps = await osuVendor.getBeatmaps({b: beatmapId});
        if (beatmaps === undefined || beatmaps === null || beatmaps.length === 0) throw new NoMatchError('Beatmap not found');
        const [beatmap] = beatmaps;

        const embed = new RichEmbed({
            author: {
                name: `Top ${enumModeToString(mode)} Plays for ${userName} on ${beatmap.title} [${beatmap.version}]`,
                icon_url: osuVendor.getUserImageUrl(scores[0].user_id),
                url: osuVendor.getBeatmapImageUrl(beatmapId),
            },
            description: await EmbedDescription.score(scores, beatmap, mode, osuVendor),
            thumbnail: { url: osuVendor.getBeatmapImageUrl(beatmap.beatmapset_id) },
            footer: {
                text: `On ${osuVendor.getServerName()}`,
            },
        });

        await message.channel.send(embed);
    }
}
