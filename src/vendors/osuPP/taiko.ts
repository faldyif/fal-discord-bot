import { OsuPlay } from "../../models/osuRequest";

import Calculator from "./index";

export default class TaikoCalculator extends Calculator {
    calculate = async (beatmapId: number, score?: OsuPlay): Promise<number> => {
        // TODO: Implement this
        return 0;
    }
}
