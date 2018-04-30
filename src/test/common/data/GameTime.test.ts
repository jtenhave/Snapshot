import "mocha";
import * as assert from "assert";
import { GameTime } from "../../../common/data/GameTime";

describe("GameTime", () => {
    describe("constructor()", () => {
        it("Initializes GameTime", () => {
            const gameTime = new GameTime(1, 2);

            assert.strictEqual(gameTime.period, 1);
            assert.strictEqual(gameTime.time, 2);
        });
    });

    describe("totalTime", () => {
        it("Calculates total time correctly", () => {
            const gameTime = new GameTime(2, 343);

            assert.strictEqual(gameTime.totalTime, 1543);
        });
    });
});