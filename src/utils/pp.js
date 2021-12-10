export const WEIGHT_COEFFICIENT = 0.965;
export const PP_PER_STAR = 42.114296;

const ppCurve = [
  {at: 0, value: 0},
  {at: 45, value: 0.015},
  {at: 50, value: 0.03},
  {at: 55, value: 0.06},
  {at: 60, value: 0.105},
  {at: 65, value: 0.15},
  {at: 70, value: 0.22},
  {at: 75, value: 0.3},
  {at: 80, value: 0.42},
  {at: 86, value: 0.6},
  {at: 90, value: 0.78},
  {at: 92.5, value: 0.905},
  {at: 94.5, value: 1.015},
  {at: 95, value: 1.046},
  {at: 96, value: 1.115},
  {at: 97, value: 1.2},
  {at: 98, value: 1.29},
  {at: 99, value: 1.39},
  {at: 100, value: 1.5},
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

export const getTotalPpFromSortedPps = (ppArray, startIdx = 0) => ppArray.reduce((cum, pp, idx) => cum + Math.pow(WEIGHT_COEFFICIENT, idx + startIdx) * pp, 0);

const getTotalPp = scores => scores && Array.isArray(scores)
  ? getTotalPpFromSortedPps(
    scores
      .map(s => s?.score?.pp)
      .sort((a, b) => b - a),
  )
  : null;

const convertScoresToObject = (scores, idFunc = score => score?.leaderboard?.id, asArray = false) =>
  scores.reduce((scoresObj, score) => {
    const _id = idFunc(score);
    if (!_id) return scoresObj;

    if (asArray) {
      if (!scoresObj[_id]) scoresObj[_id] = [];

      scoresObj[_id].push({...score})
    } else {
      scoresObj[_id] = {...score};
    }

    return scoresObj;
  }, {})

export const getTotalPlayerPp = (scores, modifiedScores = {}) => getTotalPp(
  Object.values({
    ...convertScoresToObject(scores),
    ...modifiedScores,
  }),
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
  }

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
}