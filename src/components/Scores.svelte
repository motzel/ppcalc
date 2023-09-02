<script>
	import Pager from './Pager.svelte';
	import SongScore from './SongScore.svelte';
	import {getPpFromAccAndStars} from '../utils/pp';
	import {getRatings} from '../utils/diffs';

	export let scores = null;
	export let modifiedScores = {};
	export let service = 'scoresaber';

	const ITEMS_PER_PAGE = 8;

	let currentPage = 0;
	let type = 'all';

	function onPageChanged(e) {
		if (!Number.isFinite(e?.detail?.page)) return;

		currentPage = e.detail.page;
	}

	$: sortedScores = (scores ?? []).sort((a, b) => b?.score?.pp - a?.score?.pp);
	$: currentPageScores = sortedScores.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE).map(scoreInfo => {
		const {score, leaderboard} = scoreInfo;

		const maxScore = leaderboard?.maxScore ?? 0;
		const stars = leaderboard?.stars ?? 0;
		const basePp = score?.pp ?? 0;
		const basePercentage = maxScore ? ((score?.modifiedScore ?? 0) / maxScore) * 100 : score?.percentage;
		const baseModifiers = score?.modifiers ?? '';
		let ratings = getRatings(leaderboard, score?.modifiers);
		const baseModifiersRating = {...ratings};

		let pp = basePp;
		let percentage = basePercentage;
		let modifiers = baseModifiers;
		if (modifiedScores[leaderboard?.id]) {
			modifiers = modifiedScores[leaderboard.id].modifiers;
			ratings = getRatings(leaderboard, modifiers);

			percentage = modifiedScores[leaderboard.id].percentage;
			const newPp = getPpFromAccAndStars(percentage, stars, service, ratings, leaderboard?.difficulty?.modeName ?? 'Standard');

			pp = !isNaN(newPp) ? newPp : basePp;
		}

		return basePercentage
			? {
					leaderboard,
					score: {
						...score,
						basePp,
						pp,
						acc: ((score.baseScore ?? 0) / maxScore) * 100,
						basePercentage,
						percentage,
						modifiers,
						baseModifiers,
						baseModifiersRating,
					},
			  }
			: scoreInfo;
	});
</script>

{#if scores?.length}
	{#each currentPageScores as score (score?.leaderboard?.id)}
		<SongScore songScore={score} on:score-changed on:add-to-playlist on:remove-from-playlist />
	{/each}

	<Pager {currentPage} totalItems={scores.length} itemsPerPage={ITEMS_PER_PAGE} itemsPerPageValues={null} on:page-changed={onPageChanged} />
{:else}
	<p>No scores.</p>
{/if}
