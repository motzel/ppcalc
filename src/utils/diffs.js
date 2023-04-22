import {capitalize, opt} from './js'

export const difficulties = {
  1: 'easy',
  3: 'normal',
  5: 'hard',
  7: 'expert',
  9: 'expert+',
}

export const diffColors = {
  1: 'MediumSeaGreen',
  3: '#59b0f4',
  5: 'tomato',
  7: '#bf2a42',
  9: '#8f48db',
}

export function getDiffColor(diffInfo) {
  return diffColors[diffInfo.difficulty] ? diffColors[diffInfo.difficulty] : null;
}

export function extractDiffAndType(ssDiff) {
  const match = /^_([^_]+)_Solo(.*)$/.exec(ssDiff);
  if (!match) return null;

  return {
    diff: match[1].toLowerCase().replace('plus', 'Plus'),
    type: opt(match, '2', 'Standard'),
  };
}
export function getHumanDiffInfo(diffInfo) {
  if (!diffInfo || !diffInfo.difficulty || !difficulties[diffInfo.difficulty]) return null;

  const name = capitalize(difficulties[diffInfo.difficulty]);
  const typeSuffix = diffInfo.gameMode !== 'SoloStandard' ? '/' + diffInfo.gameMode : '';

  switch(name) {
    case 'Easy':
      return {name, type: diffInfo.type, fullName: name + typeSuffix, shortName: 'Es', difficulty: 1, color: getDiffColor(diffInfo)};
    case 'Normal':
      return {name, type: diffInfo.type, fullName: name + typeSuffix, shortName: 'N', difficulty: 3, color: getDiffColor(diffInfo)};
    case 'Hard':
      return {name, type: diffInfo.type, fullName: name + typeSuffix, shortName: 'H', difficulty: 5, color: getDiffColor(diffInfo)};
    case 'Expert':
      return {name, type: diffInfo.type, fullName: name + typeSuffix, shortName: 'Ex', difficulty: 7, color: getDiffColor(diffInfo)};
    case 'Expert+':
      return {name, type: diffInfo.type, fullName: name + typeSuffix, shortName: 'E+', difficulty: 9, color: getDiffColor(diffInfo)};

    default: return null;
  }
}

export const getRatings = (leaderboard, modifiers = '') => {
  const ratings = leaderboard?.difficulty?.passRating && leaderboard?.difficulty?.accRating && leaderboard?.difficulty?.techRating
    ? {
      passRating: leaderboard.difficulty.passRating,
      accRating: leaderboard.difficulty?.accRating,
      techRating: leaderboard.difficulty.techRating,
    }
    : null;

  const mods = (modifiers ?? '').split(',').map(m => m?.toLowerCase()).filter(m => m?.length);
  if (!mods.length) return ratings;

  const modifiersRating = leaderboard?.difficulty?.modifiersRating ?? null;
  for(const mod of mods) {
    if (modifiersRating[`${mod}PassRating`] && modifiersRating[`${mod}AccRating`] && modifiersRating[`${mod}TechRating`])
      return {
        passRating: modifiersRating[`${mod}PassRating`],
        accRating: modifiersRating[`${mod}AccRating`],
        techRating: modifiersRating[`${mod}TechRating`],
      }
  }

  return ratings;
}