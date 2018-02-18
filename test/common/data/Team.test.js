const assert = require("assert");
const samples = require ("../../samples/gameData");
const Team = require("../../../src/common/data/Team.js");

describe("Team", () => {
    describe("constructor()", () => {
        it("Initializes Team", () => {
            const teamData = samples.finishedGameData.liveData.boxscore.teams.away;

            const team = new Team(teamData);

            assert.strictEqual(team.id, "MTL");
            assert.strictEqual(team.name, "Montréal Canadiens");

            const rawPlayerKeys = Object.keys(teamData.players);
            assert.strictEqual(team.players.length, rawPlayerKeys.length - teamData.scratches.length);
            for (const key of rawPlayerKeys.map(k => k.slice(2))) {
                if (teamData.scratches.find(s => s.toString() === key)) {
                    assert.strictEqual(team.players.find(p => p.id === key) !== undefined, false)

                } else {
                    assert.strictEqual(team.players.find(p => p.id === key) !== undefined, true)
                }
            }
        }); 
    });

    describe("findPlayer()", () => {
        it("Finds player", () => {
            const teamData = samples.finishedGameData.liveData.boxscore.teams.away;
            const team = new Team(teamData);

            const player = team.findPlayer("8473507");

            assert.strictEqual(player !== undefined, true);
            assert.strictEqual(player.name, "Jeff Petry");
        });
    });

    describe("toJSON()", () => {
        it("Returns correct JSON", () => {
            const teamData = samples.finishedGameData.liveData.boxscore.teams.away;          
            const team = new Team(teamData);

            const json = team.toJSON();

            assert.strictEqual(json.n, team.name);
            assert.strictEqual(json.p.length, team.players.length);
            for (const name of team.players.map(p => p.name)) {
                assert.strictEqual(json.p.find(p => p.n === name) !== undefined, true)
            }
        });
    });

    describe("fromJSON()", () => {
        it("Returns correct Team", () => {
            const json = {
                n: "habs",
                p: [{ n: "playerA"}, { n: "playerB"}]
            };

            const team = Team.fromJSON(json);

            assert.strictEqual(team.name, json.n);
            assert.strictEqual(team.players.length, json.p.length);
            assert.strictEqual(team.players[0].name, "playerA");
            assert.strictEqual(team.players[1].name, "playerB");
        });
    });
});
