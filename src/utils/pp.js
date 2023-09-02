export const WEIGHT_COEFFICIENT = 0.965;
export const PP_PER_STAR = 42.114296;

const ppCurve = [
	{at: 0.0, value: 0.0},
	{at: 60.0, value: 0.18223233667439062},
	{at: 65.0, value: 0.5866010012767576},
	{at: 70.0, value: 0.6125565959114954},
	{at: 75.0, value: 0.6451808210101443},
	{at: 80.0, value: 0.6872268862950283},
	{at: 82.5, value: 0.7150465663454271},
	{at: 85.0, value: 0.7462290664143185},
	{at: 87.5, value: 0.7816934560296046},
	{at: 90.0, value: 0.825756123560842},
	{at: 91.0, value: 0.8488375988124467},
	{at: 92.0, value: 0.8728710341448851},
	{at: 93.0, value: 0.9039994071865736},
	{at: 94.0, value: 0.9417362980580238},
	{at: 95.0, value: 1.0},
	{at: 95.5, value: 1.0388633331418984},
	{at: 96.0, value: 1.0871883573850478},
	{at: 96.5, value: 1.1552120359501035},
	{at: 97.0, value: 1.2485807759957321},
	{at: 97.25, value: 1.3090333065057616},
	{at: 97.5, value: 1.3807102743105126},
	{at: 97.75, value: 1.4664726399289512},
	{at: 98.0, value: 1.5702410055532239},
	{at: 98.25, value: 1.697536248647543},
	{at: 98.5, value: 1.8563887693647105},
	{at: 98.75, value: 2.058947159052738},
	{at: 99.0, value: 2.324506282149922},
	{at: 99.125, value: 2.4902905794106913},
	{at: 99.25, value: 2.685667856592722},
	{at: 99.375, value: 2.9190155639254955},
	{at: 99.5, value: 3.2022017597337955},
	{at: 99.625, value: 3.5526145337555373},
	{at: 99.75, value: 3.996793606763322},
	{at: 99.825, value: 4.325027383589547},
	{at: 99.9, value: 4.715470646416203},
	{at: 99.95, value: 5.019543595874787},
	{at: 100.0, value: 5.367394282890631},
];

export function ppFactorFromAcc(acc) {
	if (!acc || acc <= 0) {
		return 0;
	}
	let index = ppCurve.findIndex(o => o.at >= acc);
	if (index === -1) {
		return ppCurve[ppCurve.length - 1].value;
	}
	if (!index) {
		return ppCurve[0].value;
	}
	let from = ppCurve[index - 1];
	let to = ppCurve[index];
	let progress = (acc - from.at) / (to.at - from.at);
	return from.value + (to.value - from.value) * progress;
}

export function accFromPpFactor(ppFactor) {
	if (!ppFactor || ppFactor <= 0) return 0;

	const idx = ppCurve.findIndex(o => o.value >= ppFactor);
	if (idx < 0) return ppCurve[ppCurve.length - 1].at;

	const from = ppCurve[idx - 1];
	const to = ppCurve[idx];
	const progress = (ppFactor - from.value) / (to.value - from.value);

	return from.at + (to.at - from.at) * progress;
}

export const getTotalPpFromSortedPps = (ppArray, startIdx = 0) =>
	ppArray.reduce((cum, pp, idx) => cum + Math.pow(WEIGHT_COEFFICIENT, idx + startIdx) * pp, 0);

const getTotalPp = scores =>
	scores && Array.isArray(scores) ? getTotalPpFromSortedPps(scores.map(s => s?.score?.pp).sort((a, b) => b - a)) : null;

const convertScoresToObject = (scores, idFunc = score => score?.leaderboard?.id, asArray = false) =>
	scores.reduce((scoresObj, score) => {
		const _id = idFunc(score);
		if (!_id) return scoresObj;

		if (asArray) {
			if (!scoresObj[_id]) scoresObj[_id] = [];

			scoresObj[_id].push({...score});
		} else {
			scoresObj[_id] = {...score};
		}

		return scoresObj;
	}, {});

export const getTotalPlayerPp = (scores, modifiedScores = {}) =>
	getTotalPp(
		Object.values({
			...convertScoresToObject(scores),
			...modifiedScores,
		})
	);

export function getWhatIfScore(scores, leaderboardId, pp = 0) {
	const currentTotalPp = getTotalPlayerPp(scores);
	if (!currentTotalPp) return null;

	const newTotalPp = getTotalPlayerPp(scores, {[leaderboardId]: {score: {pp}}});

	return {
		currentTotalPp,
		newTotalPp,
		diff: newTotalPp - currentTotalPp,
	};
}

export const calcPpBoundary = (rankedScores, expectedPp = 1) => {
	if (!rankedScores || !Array.isArray(rankedScores)) return null;

	const calcRawPpAtIdx = (bottomScores, idx, expected) => {
		const oldBottomPp = getTotalPpFromSortedPps(bottomScores, idx);
		const newBottomPp = getTotalPpFromSortedPps(bottomScores, idx + 1);

		// 0.965^idx * rawPpToFind = expected + oldBottomPp - newBottomPp;
		// rawPpToFind = (expected + oldBottomPp - newBottomPp) / 0.965^idx;
		return (expected + oldBottomPp - newBottomPp) / Math.pow(WEIGHT_COEFFICIENT, idx);
	};

	const rankedScorePps = rankedScores.map(s => s?.score?.pp ?? 0).sort((a, b) => b - a);

	let idx = rankedScorePps.length - 1;

	while (idx >= 0) {
		const bottomSlice = rankedScorePps.slice(idx);
		const bottomPp = getTotalPpFromSortedPps(bottomSlice, idx);

		bottomSlice.unshift(rankedScorePps[idx]);
		const modifiedBottomPp = getTotalPpFromSortedPps(bottomSlice, idx);
		const diff = modifiedBottomPp - bottomPp;

		if (diff > expectedPp) {
			return calcRawPpAtIdx(rankedScorePps.slice(idx + 1), idx + 1, expectedPp);
		}

		idx--;
	}

	return calcRawPpAtIdx(rankedScorePps, 0, expectedPp);
};

const blCurve2 = acc => {
	const pointList2 = [
		[1.0, 7.424],
		[0.999, 6.241],
		[0.9975, 5.158],
		[0.995, 4.01],
		[0.9925, 3.241],
		[0.99, 2.7],
		[0.9875, 2.303],
		[0.985, 2.007],
		[0.9825, 1.786],
		[0.98, 1.618],
		[0.9775, 1.49],
		[0.975, 1.392],
		[0.9725, 1.315],
		[0.97, 1.256],
		[0.965, 1.167],
		[0.96, 1.094],
		[0.955, 1.039],
		[0.95, 1.0],
		[0.94, 0.931],
		[0.93, 0.867],
		[0.92, 0.813],
		[0.91, 0.768],
		[0.9, 0.729],
		[0.875, 0.65],
		[0.85, 0.581],
		[0.825, 0.522],
		[0.8, 0.473],
		[0.75, 0.404],
		[0.7, 0.345],
		[0.65, 0.296],
		[0.6, 0.256],
		[0.0, 0.0],
	];

	let i = 0;
	for (; i < pointList2.length; i++) {
		if (pointList2[i][0] <= acc) {
			break;
		}
	}

	if (i === 0) {
		i = 1;
	}

	const middle_dis = (acc - pointList2[i - 1][0]) / (pointList2[i][0] - pointList2[i - 1][0]);
	return pointList2[i - 1][1] + middle_dis * (pointList2[i][1] - pointList2[i - 1][1]);
};
function blInflate(peepee) {
	return (650 * Math.pow(peepee, 1.3)) / Math.pow(650, 1.3);
}
function blCurve(acc, passRating, accRating, techRating) {
	let passPP = 15.2 * Math.exp(Math.pow(passRating, 1 / 2.62)) - 30;
	if (!isFinite(passPP) || isNaN(passPP)) {
		passPP = 0;
	}
	const accPP = blCurve2(acc) * accRating * 34;
	const techPP = Math.exp(1.9 * acc) * 1.08 * techRating;
	return blInflate(passPP + accPP + techPP);
}

function blPpFromAcc(acc, ratings, modeName = 'Standard') {
	if (!ratings) return 0;

	return modeName === 'rhythmgamestandard'
		? acc * ratings.passRating * 55
		: blCurve(acc, ratings.passRating, ratings.accRating, ratings.techRating);
}

export const getPpFromAccAndStars = (acc, stars, service = 'scoresaber', ratings = null, modeName = 'Standard') =>
	service === 'beatleader' ? blPpFromAcc(acc / 100, ratings, modeName) : PP_PER_STAR * stars * ppFactorFromAcc(acc);
