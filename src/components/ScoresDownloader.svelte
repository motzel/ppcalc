<script>
	import {createEventDispatcher} from 'svelte';
	import Spinner from './Spinner.svelte';
	import {formatNumber} from '../utils/format';
	import {dateFromUnix} from '../utils/date';

	const dispatch = createEventDispatcher();

	let profileUrl = null;
	let playerId = null;
	let playerInfo = null;
	let service = null;

	let isFetching = false;
	let error = null;
	let message = null;

	function clearAll() {
		playerId = null;
		playerInfo = null;
		service = null;
		error = null;
		message = null;
	}

	const ssApiFetchPlayer = async playerId => await (await fetch(`/cors/score-saber/api/player/${playerId}/full`)).json();

	const blApiFetchPlayer = async playerId => {
		const response = await fetch(`/cors/beatleader/player/${playerId}`);
		if (response.status !== 200) return {errorMessage: 'Unknown server response'};

		const data = await response.json();

		return {
			...data,
			profilePicture: data?.avatar ?? null,
		};
	};

	const ssApiFetchScoresPage = async (playerId, page = 1, itemsPerPage = 100) =>
		(
			(await (await fetch(`/cors/score-saber/api/player/${playerId}/scores?limit=${itemsPerPage}&page=${page}`)).json())?.playerScores ?? []
		).filter(s => s?.score?.pp);
	const blApiFetchScoresPage = async (playerId, page = 1, itemsPerPage = 100) => {
		const response = await fetch(`/cors/beatleader/player/${playerId}/scores?count=${itemsPerPage}&page=${page}&sortBy=pp&order=desc`);

		if (response.status !== 200) return {errorMessage: 'Unknown server response'};

		const data = await response.json();

		return (
			data?.data
				?.filter(s => s?.pp)
				?.map(score => ({
					score: {
						...score,
						percentage: (score?.accuracy ?? 0) * 100,
						timeSet: dateFromUnix(score?.timeset),
					},
					leaderboard: {
						...(score?.leaderboard?.song ?? null),
						...(score?.leaderboard ?? null),
						leaderboardId: score?.leaderboard?.id ?? null,
						songHash: score?.leaderboard?.song?.hash ?? '',
						songName: score?.leaderboard?.song?.name ?? '',
						songSubName: score?.leaderboard?.song?.subName ?? '',
						songAuthorName: score?.leaderboard?.song?.author ?? '',
						levelAuthorName: score?.leaderboard?.song?.mapper ?? '',
						stars: score?.leaderboard?.difficulty?.stars ?? 0,
						difficulty: {
							...score?.leaderboard?.difficulty,
							type: score?.leaderboard?.difficulty?.modeName,
							difficulty: score?.leaderboard?.difficulty?.value,
							gameMode: score?.leaderboard?.difficulty?.modeName,
						},
					},
				})) ?? []
		);
	};

	async function fetchScores(service, playerInfo) {
		if (!playerInfo?.id?.length) return;

		const fetchServiceScores = service === 'scoresaber' ? ssApiFetchScoresPage : blApiFetchScoresPage;

		try {
			let scores = [];
			let allScoresFetched = false;
			let page = 1;
			const itemsPerPage = 100;

			isFetching = true;

			while (!allScoresFetched) {
				message = `Downloading ranked scores, ${page * itemsPerPage}...`;

				const scoresPage = await fetchServiceScores(playerInfo.id, page++, itemsPerPage);
				if (scoresPage?.errorMessage) throw scoresPage.errorMessage;

				scores = [...scores, ...scoresPage];

				allScoresFetched = scoresPage.length < itemsPerPage;
			}

			dispatch('download', {playerInfo, scores, service});
		} catch (e) {
			error = `Error has occurred: ${e.toString()}`;
		} finally {
			isFetching = false;
		}
	}

	async function fetchPlayer(service, playerId) {
		// dispatch('download',  {
		// 	"playerInfo": {
		// 		"id": "1917",
		// 		"name": "onyerbokin",
		// 		"platform": "oculus",
		// 		"avatar": "https://cdn.beatleader.xyz/assets/oculusavatar.png",
		// 		"country": "PH",
		// 		"histories": "1083,1137,1154,1172,1192,1359,1367,1380,1397,1433,1460,1483,1503,1526,1542,1554,1582,1590,1612,1625,1634,1650,1660,1673,1686,1696,1708,1691,1697,1705,1718,1730,1740,1759,1767,1777,1793,1801,1815,1825,1832,1835,1854,1868,1879,1893,1902,1913,1934,1948",
		// 		"role": "",
		// 		"pp": 1595.8557,
		// 		"rank": 1953,
		// 		"countryRank": 5,
		// 		"banned": false,
		// 		"inactive": false,
		// 		"externalProfileUrl": "",
		// 		"lastTwoWeeksTime": 0,
		// 		"allTime": 0,
		// 		"scoreStats": {
		// 			"id": 8028,
		// 			"totalScore": 112730337,
		// 			"averageRankedAccuracy": 0.9267212,
		// 			"averageAccuracy": 0.8987879,
		// 			"medianRankedAccuracy": 0.9282831,
		// 			"medianAccuracy": 0.9115292,
		// 			"topAccuracy": 0.9500128,
		// 			"topPp": 280.0736,
		// 			"totalPlayCount": 159,
		// 			"rankedPlayCount": 13,
		// 			"replaysWatched": 0,
		// 			"averageRank": 5.421384,
		// 			"averageRankedRank": 21.384615,
		// 			"sspPlays": 1,
		// 			"ssPlays": 11,
		// 			"spPlays": 1,
		// 			"sPlays": 0,
		// 			"aPlays": 0,
		// 			"topPlatform": "oculus",
		// 			"topHMD": 256,
		// 			"dailyImprovements": 0
		// 		},
		// 		"statsHistory": {
		// 			"id": 1795,
		// 			"pp": "1521.47,1521.469,1521.469,1521.469,1521.469,1524.18,1524.18,1524.18,1524.18,1524.18,1524.18,1524.18,1524.18,1524.18,1524.18,1524.18,1524.18,1524.18,1524.693,1524.693,1527.155,1527.155,1527.155,1527.155,1527.155,1527.155,1527.155,1585.455,1585.455,1585.455,1585.455,1585.455,1585.455,1585.455,1585.455,1585.455,1585.455,1585.455,1585.455,1585.455,1585.455,1595.856,1595.856,1595.856,1595.856,1595.856,1595.856,1595.856,1595.856,1595.856",
		// 			"rank": "1083,1137,1154,1172,1192,1359,1367,1380,1397,1433,1460,1483,1503,1526,1542,1554,1582,1590,1612,1625,1634,1650,1660,1673,1686,1696,1708,1691,1697,1705,1718,1730,1740,1759,1767,1777,1793,1801,1815,1825,1832,1835,1854,1868,1879,1893,1902,1913,1934,1948",
		// 			"countryRank": "4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5",
		// 			"totalScore": "2730,70074283,74139176,74139176,75582303,86668759,86668759,86698112,86698112,86698112,86698112,86698112,90584118,90584118,90584118,90584118,90584118,90584118,93180611,93180611,95850941,95850941,95850941,96588915,96588915,96588915,96588915,100209027,100209027,100209027,103188308,103188308,103188308,103188308,103188308,103188308,103188308,103188308,103188308,105838362,105838362,106518554,106518554,107391166,107391166,110507996,110507996,112730337,112730337,112730337",
		// 			"averageRankedAccuracy": ",.92004,.92004,.92004,.92004,.922,.922,.922,.922,.922,.922,.922,.922,.922,.922,.922,.922,.922,.922,.922,.92371,.92371,.92371,.92371,.92371,.92371,.92371,.92406,.92406,.92406,.92406,.92406,.92406,.92406,.92406,.92406,.92406,.92406,.92406,.92406,.92406,.92672,.92672,.92672,.92672,.92672,.92672,.92672,.92672,.92672",
		// 			"topAccuracy": ".94599,.94599,.94599,.94599,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001,.95001",
		// 			"topPp": "269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,269.6729,280.0736,280.0736,280.0736,280.0736,280.0736,280.0736,280.0736,280.0736,280.0736",
		// 			"averageAccuracy": ".94,.89189,.89023,.89023,.89234,.89584,.89584,.89613,.89613,.89613,.89613,.89613,.8947,.8947,.8947,.8947,.8947,.8947,.89559,.89559,.89626,.89626,.89626,.89605,.89605,.89605,.89605,.8969,.8969,.8969,.89743,.89743,.89743,.89743,.89743,.89743,.89743,.89743,.89743,.89762,.89762,.89755,.89755,.8978,.8978,.89841,.89841,.89879,.89879,.89879",
		// 			"medianAccuracy": ".90029,.89802,.89802,.90029,.90489,.90489,.90489,.90489,.90489,.90489,.90489,.90489,.90489,.90489,.90489,.90489,.90489,.90489,.90489,.9056,.9056,.9056,.90598,.90598,.90598,.90598,.90634,.90634,.90634,.9067,.9067,.9067,.9067,.9067,.9067,.9067,.9067,.9067,.90764,.90764,.90764,.90764,.9107,.9107,.9107,.9107,.91153,.91153,.91153",
		// 			"medianRankedAccuracy": ".91961,.91961,.91961,.91961,.91961,.91961,.91961,.91961,.91961,.91961,.91961,.91961,.91961,.91961,.91961,.91961,.91961,.91961,.91961,.91961,.91961,.91961,.91961,.91961,.91961,.91961,.91998,.91998,.91998,.91998,.91998,.91998,.91998,.91998,.91998,.91998,.91998,.91998,.91998,.91998,.92828,.92828,.92828,.92828,.92828,.92828,.92828,.92828,.92828",
		// 			"totalPlayCount": "0,100,106,106,108,124,124,124,124,124,124,124,129,129,129,129,129,129,133,133,137,137,137,138,138,138,138,143,143,143,147,147,147,147,147,147,147,147,147,151,151,152,152,153,153,156,156,159,159,159",
		// 			"rankedPlayCount": "0,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13",
		// 			"replaysWatched": "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0"
		// 		},
		// 		"clans": [],
		// 		"friends": [],
		// 		"badges": [],
		// 		"patreonFeatures": null,
		// 		"profilePicture": "https://cdn.beatleader.xyz/assets/oculusavatar.png"
		// 	},
		// 	"scores": [
		// 		{
		// 			"score": {
		// 				percentage: 0.9319633*100,
		// 				"myScore": null,
		// 				"weight": 1,
		// 				"accLeft": 107.05218,
		// 				"accRight": 109.16602,
		// 				"leaderboard": {
		// 					"id": "d7c991",
		// 					"song": {
		// 						"id": "d7c9",
		// 						"hash": "9ec4bbf552797685df73033c04cf487737097a7d",
		// 						"name": "The Clear Blue Sky",
		// 						"description": null,
		// 						"subName": "(feat. Misawa)",
		// 						"author": "Tsukasa",
		// 						"mapper": "Mystikmol",
		// 						"coverImage": "https://eu.cdn.beatsaver.com/9ec4bbf552797685df73033c04cf487737097a7d.jpg",
		// 						"downloadUrl": "https://eu.cdn.beatsaver.com/9ec4bbf552797685df73033c04cf487737097a7d.zip",
		// 						"bpm": 178,
		// 						"duration": 95,
		// 						"tags": null,
		// 						"createdTime": "",
		// 						"difficulties": [
		// 							{
		// 								"id": 895,
		// 								"value": 9,
		// 								"mode": 1,
		// 								"difficultyName": "ExpertPlus",
		// 								"modeName": "Standard",
		// 								"qualified": false,
		// 								"qualifiedTime": "",
		// 								"ranked": true,
		// 								"rankedTime": "",
		// 								"stars": 6.83,
		// 								"njs": 20,
		// 								"nps": 5.78,
		// 								"notes": 490,
		// 								"bombs": 0,
		// 								"walls": 4,
		// 								"maxScore": 0
		// 							},
		// 							{
		// 								"id": 891,
		// 								"value": 1,
		// 								"mode": 1,
		// 								"difficultyName": "Easy",
		// 								"modeName": "Standard",
		// 								"qualified": false,
		// 								"qualifiedTime": "",
		// 								"ranked": true,
		// 								"rankedTime": "",
		// 								"stars": 0.78,
		// 								"njs": 11,
		// 								"nps": 1.191,
		// 								"notes": 101,
		// 								"bombs": 0,
		// 								"walls": 1,
		// 								"maxScore": 0
		// 							},
		// 							{
		// 								"id": 892,
		// 								"value": 3,
		// 								"mode": 1,
		// 								"difficultyName": "Normal",
		// 								"modeName": "Standard",
		// 								"qualified": false,
		// 								"qualifiedTime": "",
		// 								"ranked": true,
		// 								"rankedTime": "",
		// 								"stars": 1.18,
		// 								"njs": 14,
		// 								"nps": 1.935,
		// 								"notes": 164,
		// 								"bombs": 13,
		// 								"walls": 4,
		// 								"maxScore": 0
		// 							},
		// 							{
		// 								"id": 893,
		// 								"value": 5,
		// 								"mode": 1,
		// 								"difficultyName": "Hard",
		// 								"modeName": "Standard",
		// 								"qualified": false,
		// 								"qualifiedTime": "",
		// 								"ranked": true,
		// 								"rankedTime": "",
		// 								"stars": 1.76,
		// 								"njs": 16,
		// 								"nps": 3.22,
		// 								"notes": 273,
		// 								"bombs": 0,
		// 								"walls": 6,
		// 								"maxScore": 0
		// 							},
		// 							{
		// 								"id": 894,
		// 								"value": 7,
		// 								"mode": 1,
		// 								"difficultyName": "Expert",
		// 								"modeName": "Standard",
		// 								"qualified": false,
		// 								"qualifiedTime": "",
		// 								"ranked": true,
		// 								"rankedTime": "",
		// 								"stars": 2.73,
		// 								"njs": 17,
		// 								"nps": 4.353,
		// 								"notes": 369,
		// 								"bombs": 0,
		// 								"walls": 14,
		// 								"maxScore": 0
		// 							}
		// 						]
		// 					},
		// 					"difficulty": {
		// 						"id": 895,
		// 						"value": 9,
		// 						"mode": 1,
		// 						"difficultyName": "ExpertPlus",
		// 						"modeName": "Standard",
		// 						"qualified": false,
		// 						"qualifiedTime": "",
		// 						"ranked": true,
		// 						"rankedTime": "",
		// 						"stars": 6.83,
		// 						"njs": 20,
		// 						"nps": 5.78,
		// 						"notes": 490,
		// 						"bombs": 0,
		// 						"walls": 4,
		// 						"maxScore": 0
		// 					},
		// 					"scores": null,
		// 					"plays": 0
		// 				},
		// 				"id": 371556,
		// 				"baseScore": 413377,
		// 				"modifiedScore": 413377,
		// 				"accuracy": 0.9319633,
		// 				"playerId": "1917",
		// 				"pp": 280.0736,
		// 				"rank": 35,
		// 				"countryRank": 0,
		// 				"replay": "https://cdn.beatleader.xyz/replays/1917-ExpertPlus-Standard-9EC4BBF552797685DF73033C04CF487737097A7D.bsor",
		// 				"modifiers": "",
		// 				"badCuts": 1,
		// 				"missedNotes": 0,
		// 				"bombCuts": 0,
		// 				"wallsHit": 0,
		// 				"pauses": 0,
		// 				"fullCombo": false,
		// 				"platform": "oculus,1.21.0,0.3.0",
		// 				"hmd": 256,
		// 				"leaderboardId": "d7c991",
		// 				"timeset": "1656787084",
		// 				"timeSet": dateFromUnix("1656787084"),
		// 				"player": null,
		// 				"scoreImprovement": {
		// 					"id": 44192,
		// 					"timeset": "",
		// 					"score": 15351,
		// 					"accuracy": 0.03460902,
		// 					"pp": 10.400696,
		// 					"rank": -11,
		// 					"accRight": 0.11544037,
		// 					"accLeft": -0.9654465,
		// 					"averageRankedAccuracy": 0.002225399,
		// 					"totalPp": 10.400635,
		// 					"totalRank": -7,
		// 					"badCuts": 0,
		// 					"missedNotes": 0,
		// 					"bombCuts": 0,
		// 					"wallsHit": 0,
		// 					"pauses": 0
		// 				}
		// 			},
		// 			"leaderboard": {
		// 				leaderboardId: 895,
		// 				"id": 895,
		// 				"hash": "9ec4bbf552797685df73033c04cf487737097a7d",
		// 				"name": "The Clear Blue Sky",
		// 				"description": null,
		// 				"subName": "(feat. Misawa)",
		// 				"author": "Tsukasa",
		// 				"mapper": "Mystikmol",
		// 				"coverImage": "https://eu.cdn.beatsaver.com/9ec4bbf552797685df73033c04cf487737097a7d.jpg",
		// 				"downloadUrl": "https://eu.cdn.beatsaver.com/9ec4bbf552797685df73033c04cf487737097a7d.zip",
		// 				"bpm": 178,
		// 				"duration": 95,
		// 				"tags": null,
		// 				"createdTime": "",
		// 				"difficulties": [
		// 					{
		// 						"id": 895,
		// 						"value": 9,
		// 						"mode": 1,
		// 						"difficultyName": "ExpertPlus",
		// 						"modeName": "Standard",
		// 						"qualified": false,
		// 						"qualifiedTime": "",
		// 						"ranked": true,
		// 						"rankedTime": "",
		// 						"stars": 6.83,
		// 						"njs": 20,
		// 						"nps": 5.78,
		// 						"notes": 490,
		// 						"bombs": 0,
		// 						"walls": 4,
		// 						"maxScore": 0
		// 					},
		// 					{
		// 						"id": 891,
		// 						"value": 1,
		// 						"mode": 1,
		// 						"difficultyName": "Easy",
		// 						"modeName": "Standard",
		// 						"qualified": false,
		// 						"qualifiedTime": "",
		// 						"ranked": true,
		// 						"rankedTime": "",
		// 						"stars": 0.78,
		// 						"njs": 11,
		// 						"nps": 1.191,
		// 						"notes": 101,
		// 						"bombs": 0,
		// 						"walls": 1,
		// 						"maxScore": 0
		// 					},
		// 					{
		// 						"id": 892,
		// 						"value": 3,
		// 						"mode": 1,
		// 						"difficultyName": "Normal",
		// 						"modeName": "Standard",
		// 						"qualified": false,
		// 						"qualifiedTime": "",
		// 						"ranked": true,
		// 						"rankedTime": "",
		// 						"stars": 1.18,
		// 						"njs": 14,
		// 						"nps": 1.935,
		// 						"notes": 164,
		// 						"bombs": 13,
		// 						"walls": 4,
		// 						"maxScore": 0
		// 					},
		// 					{
		// 						"id": 893,
		// 						"value": 5,
		// 						"mode": 1,
		// 						"difficultyName": "Hard",
		// 						"modeName": "Standard",
		// 						"qualified": false,
		// 						"qualifiedTime": "",
		// 						"ranked": true,
		// 						"rankedTime": "",
		// 						"stars": 1.76,
		// 						"njs": 16,
		// 						"nps": 3.22,
		// 						"notes": 273,
		// 						"bombs": 0,
		// 						"walls": 6,
		// 						"maxScore": 0
		// 					},
		// 					{
		// 						"id": 894,
		// 						"value": 7,
		// 						"mode": 1,
		// 						"difficultyName": "Expert",
		// 						"modeName": "Standard",
		// 						"qualified": false,
		// 						"qualifiedTime": "",
		// 						"ranked": true,
		// 						"rankedTime": "",
		// 						"stars": 2.73,
		// 						"njs": 17,
		// 						"nps": 4.353,
		// 						"notes": 369,
		// 						"bombs": 0,
		// 						"walls": 14,
		// 						"maxScore": 0
		// 					}
		// 				],
		// 				songName: "The Clear Blue Sky",
		// 				songSubName: "(feat. Misawa)",
		// 				songAuthorName: "Tsukasa",
		// 				levelAuthorName: "Mystikmol",
		// 				"song": {
		// 					"id": "d7c9",
		// 					"hash": "9ec4bbf552797685df73033c04cf487737097a7d",
		// 					"name": "The Clear Blue Sky",
		// 					"description": null,
		// 					"subName": "(feat. Misawa)",
		// 					"author": "Tsukasa",
		// 					"mapper": "Mystikmol",
		// 					"coverImage": "https://eu.cdn.beatsaver.com/9ec4bbf552797685df73033c04cf487737097a7d.jpg",
		// 					"downloadUrl": "https://eu.cdn.beatsaver.com/9ec4bbf552797685df73033c04cf487737097a7d.zip",
		// 					"bpm": 178,
		// 					"duration": 95,
		// 					"tags": null,
		// 					"createdTime": "",
		// 					"difficulties": [
		// 						{
		// 							"id": 895,
		// 							"value": 9,
		// 							"mode": 1,
		// 							"difficultyName": "ExpertPlus",
		// 							"modeName": "Standard",
		// 							"qualified": false,
		// 							"qualifiedTime": "",
		// 							"ranked": true,
		// 							"rankedTime": "",
		// 							"stars": 6.83,
		// 							"njs": 20,
		// 							"nps": 5.78,
		// 							"notes": 490,
		// 							"bombs": 0,
		// 							"walls": 4,
		// 							"maxScore": 0
		// 						},
		// 						{
		// 							"id": 891,
		// 							"value": 1,
		// 							"mode": 1,
		// 							"difficultyName": "Easy",
		// 							"modeName": "Standard",
		// 							"qualified": false,
		// 							"qualifiedTime": "",
		// 							"ranked": true,
		// 							"rankedTime": "",
		// 							"stars": 0.78,
		// 							"njs": 11,
		// 							"nps": 1.191,`
		// 							"notes": 101,
		// 							"bombs": 0,
		// 							"walls": 1,
		// 							"maxScore": 0
		// 						},
		// 						{
		// 							"id": 892,
		// 							"value": 3,
		// 							"mode": 1,
		// 							"difficultyName": "Normal",
		// 							"modeName": "Standard",
		// 							"qualified": false,
		// 							"qualifiedTime": "",
		// 							"ranked": true,
		// 							"rankedTime": "",
		// 							"stars": 1.18,
		// 							"njs": 14,
		// 							"nps": 1.935,
		// 							"notes": 164,
		// 							"bombs": 13,
		// 							"walls": 4,
		// 							"maxScore": 0
		// 						},
		// 						{
		// 							"id": 893,
		// 							"value": 5,
		// 							"mode": 1,
		// 							"difficultyName": "Hard",
		// 							"modeName": "Standard",
		// 							"qualified": false,
		// 							"qualifiedTime": "",
		// 							"ranked": true,
		// 							"rankedTime": "",
		// 							"stars": 1.76,
		// 							"njs": 16,
		// 							"nps": 3.22,
		// 							"notes": 273,
		// 							"bombs": 0,
		// 							"walls": 6,
		// 							"maxScore": 0
		// 						},
		// 						{
		// 							"id": 894,
		// 							"value": 7,
		// 							"mode": 1,
		// 							"difficultyName": "Expert",
		// 							"modeName": "Standard",
		// 							"qualified": false,
		// 							"qualifiedTime": "",
		// 							"ranked": true,
		// 							"rankedTime": "",
		// 							"stars": 2.73,
		// 							"njs": 17,
		// 							"nps": 4.353,
		// 							"notes": 369,
		// 							"bombs": 0,
		// 							"walls": 14,
		// 							"maxScore": 0
		// 						}
		// 					]
		// 				},
		// 				"difficulty": {
		// 					"id": 895,
		// 					"difficulty": 9,
		// 					"mode": 1,
		// 					"difficultyName": "ExpertPlus",
		// 					"gameMode": "SoloStandard",
		// 					"type": "Standard",
		// 					"qualified": false,
		// 					"qualifiedTime": "",
		// 					"ranked": true,
		// 					"rankedTime": "",
		// 					"stars": 6.83,
		// 					"njs": 20,
		// 					"nps": 5.78,
		// 					"notes": 490,
		// 					"bombs": 0,
		// 					"walls": 4,
		// 					"maxScore": 0
		// 				},
		// 				"scores": null,
		// 				"plays": 0,
		// 				"value": 9,
		// 				"mode": 1,
		// 				"difficultyName": "ExpertPlus",
		// 				"modeName": "Standard",
		// 				"qualified": false,
		// 				"qualifiedTime": "",
		// 				"ranked": true,
		// 				"rankedTime": "",
		// 				"stars": 6.83,
		// 				"njs": 20,
		// 				"nps": 5.78,
		// 				"notes": 490,
		// 				"bombs": 0,
		// 				"walls": 4,
		// 				"maxScore": 0
		// 			}
		// 		},
		// 	],
		// 	"service": "beatleader"
		// }); return;

		if (!service?.length || !playerId?.length) return;

		const fetchServicePlayer = service === 'scoresaber' ? ssApiFetchPlayer : blApiFetchPlayer;

		try {
			isFetching = true;
			const info = await fetchServicePlayer(playerId);
			if (info?.errorMessage) throw info.errorMessage;

			playerInfo = info;
		} catch (e) {
			error = `Error has occurred: ${e.toString()}`;
		} finally {
			isFetching = false;
		}
	}

	function extractPlayerId(profileUrl) {
		if (!profileUrl?.trim()?.length) {
			clearAll();
			return;
		}

		const matches = profileUrl.match(/https?:\/\/(?:www\.)?(?:scoresaber\.com|beatleader\.xyz|beatleader\.net|beatleader\.com)\/u\/(.*?)(?:\/|$)/);
		if (!matches) {
			error = 'Invalid URL';
			return;
		}

		clearAll();

		playerId = matches[1] ? matches[1] : matches[2];
		service = profileUrl.indexOf('scoresaber.com') >= 0 ? 'scoresaber' : 'beatleader';
	}

	$: extractPlayerId(profileUrl);
	$: fetchPlayer(service, playerId);
	$: fetchScores(service, playerInfo);

	$: isSteamPlayer = playerInfo?.id && parseInt(playerInfo.id, 10) >= 70000000000000000;
</script>

<main>
	<section>
		<div class="profile-input">
			<input bind:value={profileUrl} placeholder="Your BeatLeader or ScoreSaber profile..." disabled={isFetching} autofocus />
			{#if isFetching}
				<Spinner />
			{/if}
		</div>

		{#if playerInfo}
			<h5 class="title is-5">
				{#if isSteamPlayer}
					<a class="player-name" rel="external" target="_blank" href="https://steamcommunity.com/profiles/{playerInfo.id}">
						{playerInfo.name}
					</a>
				{:else}
					<span class="player-name">{playerInfo.name}</span>
				{/if}
				<span class="divider" />
				<span title="Performance Points" class="title-header pp">{formatNumber(playerInfo.pp)}pp</span>
			</h5>
		{/if}

		{#if error || message}
			<small class:error={!!error}>
				{error ? error : message}
			</small>
		{/if}
	</section>
</main>

<style>
	main {
		min-height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 1rem;
	}

	section {
		width: 40rem;
		max-width: 100%;
		text-align: center;
	}

	.player-name {
		color: var(--ppColour) !important;
	}

	.profile-input {
		position: relative;
		margin-bottom: 1rem;
	}

	input {
		width: 100%;
		font-size: 1.25rem;
		color: var(--textColor);
		background-color: var(--foreground);
		border: 1px solid var(--faded);
		padding: 0.5rem 2rem 0.5rem 0.5rem;
	}

	.profile-input :global(svg) {
		position: absolute;
		right: 0.5rem;
		top: 1rem;
	}

	input::placeholder {
		color: var(--faded) !important;
	}

	h5 {
		display: inline-flex;
		gap: 0.75rem;
		justify-content: space-evenly;
		align-items: center;
		margin-bottom: 1rem !important;
	}

	.divider {
		border-left: 1px solid var(--dimmed);
		height: 0.875rem;
	}

	small {
		display: block;
	}

	.error {
		color: var(--decrease);
	}

	@media screen and (max-width: 767px) {
		h5 {
			flex-direction: column;
			gap: 0.25rem;
		}

		.divider {
			display: none;
		}
	}
</style>
