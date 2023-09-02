<script>
	import {createEventDispatcher} from 'svelte';
	import {getPpFromAccAndStars} from '../utils/pp';
	import {getRatings} from '../utils/diffs';
	import Badge from './Badge.svelte';
	import Pager from './Pager.svelte';
	import SongScore from './SongScore.svelte';

	export let scores = null;
	export let modifiedScores = {};
	export let service = 'scoresaber';

	const ITEMS_PER_PAGE = 8;

	const dispatch = createEventDispatcher();

	let currentPage = 0;
	let type = 'all';

	function onPageChanged(e) {
		if (!Number.isFinite(e?.detail?.page)) return;

		currentPage = e.detail.page;
	}

	$: filteredAndSortedScores = (scores ?? [])
		.filter(s => type === 'all' || (type === 'modified' && modifiedScores[s?.leaderboard?.id]))
		.sort((a, b) => b?.score?.pp - a?.score?.pp);
	$: currentPageScores = filteredAndSortedScores.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE).map(scoreInfo => {
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
	$: modifiedScoresCount = Object.keys(modifiedScores).length;
</script>

{#if scores?.length}
	<header>
		<section class="filters">
			<Badge
				onlyLabel={true}
				fluid={true}
				bgColor={type === 'all' ? 'var(--ppColour)' : 'var(--dimmed)'}
				label="All"
				on:click={() => (type = 'all')} />
			<Badge
				onlyLabel={true}
				fluid={true}
				bgColor={type === 'modified' ? 'var(--ppColour)' : 'var(--dimmed)'}
				label={`Modified only (${modifiedScoresCount})`}
				on:click={() => (type = 'modified')} />
		</section>

		<section>
			{#if type === 'modified' && filteredAndSortedScores.length}
				<Badge
					title="Add all to the playlist"
					onlyLabel={true}
					fluid={true}
					bgColor="var(--faded)"
					on:click={() =>
						dispatch(
							'add-all-to-playlist',
							filteredAndSortedScores.map(s => s.leaderboard)
						)}>
					<span slot="label">
						<i class="fas fa-plus-circle" />
						Playlist
					</span>
				</Badge>
			{/if}
		</section>
	</header>

	{#if filteredAndSortedScores.length}
		{#each currentPageScores as score (score?.leaderboard?.id)}
			<SongScore songScore={score} on:score-changed on:add-to-playlist on:remove-from-playlist />
		{/each}
	{:else}
		<p>No scores matching current filters.</p>
	{/if}

	<Pager
		{currentPage}
		totalItems={filteredAndSortedScores.length}
		itemsPerPage={ITEMS_PER_PAGE}
		itemsPerPageValues={null}
		on:page-changed={onPageChanged} />
{:else}
	<p>No scores.</p>
{/if}

<style>
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	header :global(.badge) {
		margin: 0 !important;
		cursor: pointer !important;
	}
</style>
