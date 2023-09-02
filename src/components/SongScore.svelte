<script>
	import {createEventDispatcher} from 'svelte';
	import {formatNumber, round} from '../utils/format';
	import playlist, {playlistMatch} from '../stores/playlist';
	import Badge from './Badge.svelte';
	import Accuracy from './Accuracy.svelte';
	import SongInfo from './SongInfo.svelte';
	import Pp from './Pp.svelte';
	import Value from './Value.svelte';
	import FormattedDate from './FormattedDate.svelte';

	export let songScore = null;

	const dispatch = createEventDispatcher();

	let selectedMod = null;

	function onChange(leaderboardId, stars, value, newMod) {
		if (!leaderboardId || !stars || !value || (availableMods?.length && !newMod)) return;

		const modifiedMods = mods
			.filter(m => !availableModNames.includes(m))
			.concat(newMod?.length && newMod !== '-' ? [newMod] : [])
			.sort((a, b) => a.localeCompare(b))
			.join(',');
		const percentage = parseFloat(value);

		const isModified = percentage !== round(score?.basePercentage) || modifiedMods !== mods?.join(',');

		selectedMod = newMod;

		dispatch('score-changed', {
			leaderboardId,
			stars,
			percentage: !isModified ? null : percentage,
			modifiers: !isModified ? null : modifiedMods,
		});
	}

	$: leaderboard = songScore?.leaderboard ?? null;
	$: score = songScore?.score ?? null;
	$: totalMistakes = (score?.badCuts ?? 0) + (score?.missedNotes ?? 0);
	$: fc = !!score?.fullCombo;
	$: isAddedToPlaylist = !!$playlist.find(p => playlistMatch(p, leaderboard?.songHash, leaderboard?.difficulty?.difficulty));
	$: mods =
		songScore?.score?.baseModifiers
			?.split(',')
			?.filter(m => m?.length)
			?.sort((a, b) => a.localeCompare(b)) ?? [];
	$: modifiersRating = leaderboard?.difficulty?.modifiersRating ?? null;
	$: baseModifiersRating = score?.baseModifiersRating ?? null;
	$: modifiersAndNoneRating = modifiersRating
		? {
				nonePassRating: leaderboard?.difficulty?.passRating,
				noneAccRating: leaderboard?.difficulty?.accRating,
				noneTechRating: leaderboard?.difficulty?.techRating,
				...modifiersRating,
		  }
		: null;
	$: availableMods = Object.keys(modifiersAndNoneRating ?? {})
		.map(m => {
			const match = m?.match(/^(.*?)AccRating/);
			return match?.[1]
				? {
						name: match[1] === 'none' ? '-' : match[1].toUpperCase(),
						passRating: modifiersAndNoneRating?.[`${match[1]}PassRating`],
						accRating: modifiersAndNoneRating?.[`${match[1]}AccRating`],
						techRating: modifiersAndNoneRating?.[`${match[1]}TechRating`],
				  }
				: null;
		})
		.filter(m => m?.name && m?.passRating && m?.accRating && m?.techRating)
		.sort((a, b) => a.accRating - b.accRating);
	$: availableModNames = availableMods.map(m => m.name);

	$: if (availableModNames && !selectedMod) {
		selectedMod =
			availableModNames.find(m => (mods.length ? mods.includes(m) : false)) ??
			availableModNames.find(m => !mods.length && m === '-') ??
			null;
	}

	$: selectedModRating = availableMods.find(m => m.name === selectedMod)?.accRating ?? null;
	$: higherIndexes =
		baseModifiersRating?.accRating && selectedModRating
			? availableMods.reduce(
					(acc, mr) => (mr.accRating <= selectedModRating && mr.accRating > baseModifiersRating.accRating ? acc + 1 : acc),
					0
			  )
			: 0;

	$: minPercentage = Math.max(0, (score?.basePercentage ?? 0) - higherIndexes * 10);
</script>

{#if songScore}
	<div class="song-score">
		<div class="main">
			<div class="rank">
				<Value value={score.rank} prefix="#" zero="-" digits={0} />

				<div class="timeset tablet-and-up">
					<FormattedDate date={score.timeSet} />
				</div>
			</div>

			<span class="timeset mobile-only">
				<FormattedDate date={score.timeSet} />
			</span>

			<span class="song">
				<SongInfo {leaderboard} {mods} />
			</span>

			<section class="stats">
				{#if score.pp}
					<span class="pp with-badge">
						<Badge onlyLabel={true} color="white" bgColor="var(--ppColour)">
							<span slot="label">
								<Pp
									playerId={score.playerId}
									leaderboardId={leaderboard.leaderboardId}
									pp={score.pp}
									weighted={score.ppWeighted}
									attribution={score.ppAttribution}
									zero={formatNumber(0)}
									withZeroSuffix={true}
									inline={false}
									color="white" />
							</span>
						</Badge>
					</span>
				{:else}
					<span class="pp with-badge" />
				{/if}

				{#if score.percentage}
					<span class="acc with-badge">
						<Accuracy {score} />
					</span>
				{:else}
					<span class="acc with-badge" />
				{/if}

				<span class="score with-badge">
					<Badge
						onlyLabel={true}
						color="white"
						bgColor={fc ? 'var(--increase)' : 'var(--decrease)'}
						title={fc
							? null
							: `Missed notes: ${score.missedNotes}, Bad cuts: ${score.badCuts}${
									Number.isFinite(score?.fcAccuracy) ? ' / Click to check FC accuracy' : ''
							  }`}
						clickable={!fc && Number.isFinite(score?.fcAccuracy)}
						on:click={() =>
							!fc && Number.isFinite(score?.fcAccuracy)
								? onChange(leaderboard?.id, leaderboard?.stars, score.fcAccuracy * 100, selectedMod)
								: null}>
						<span slot="label">
							{#if fc}
								FC
							{:else}
								<i class="fa fa-times" />
								<Value value={totalMistakes} inline={false} digits={0} />
							{/if}
						</span>
					</Badge>
				</span>

				{#if score.percentage}
					<span class="range">
						{#if availableMods?.length}
							<select
								bind:value={selectedMod}
								class="mod"
								title="Selected modifier"
								on:change={e => onChange(leaderboard?.id, leaderboard?.stars, score.percentage, e.target.value, selectedMod)}>
								{#each availableMods as mod (mod.name)}
									<option
										value={mod.name}
										title={`Pass: ${formatNumber(mod.passRating)}★ / Acc: ${formatNumber(mod.accRating)}★ / Tech: ${formatNumber(
											mod.techRating
										)}★`}>
										{mod.name}
									</option>
								{/each}
							</select>
						{/if}

						<input
							type="range"
							min={round(minPercentage)}
							max={100}
							step={0.01}
							bind:value={score.percentage}
							on:input={e => onChange(leaderboard?.id, leaderboard?.stars, e.target.value, selectedMod)} />
						<i
							class="fas fa-undo"
							title="Undo"
							on:click={() =>
								onChange(
									leaderboard?.id,
									leaderboard?.stars,
									round(score?.basePercentage),
									!mods?.join(',')?.length ? '-' : mods.join(',')
								)} />
						{#if isAddedToPlaylist}
							<i class="fas fa-minus-circle" title="Remove from playlist" on:click={() => dispatch('remove-from-playlist', leaderboard)} />
						{:else}
							<i class="fas fa-plus-circle" title="Add to playlist" on:click={() => dispatch('add-to-playlist', leaderboard)} />
						{/if}
					</span>
				{/if}
			</section>
		</div>
	</div>
{/if}

<style>
	.song-score {
		border-bottom: 1px solid var(--dimmed);
		padding: 0.5em 0;
	}

	.song-score .icons.up-to-tablet + .main {
		padding-top: 0;
	}

	.song-score .main {
		display: flex;
		flex-wrap: nowrap;
		justify-content: space-evenly;
		align-items: center;
	}

	.song-score.with-details .main {
		border-bottom: none;
	}

	.song-score .main > * {
		margin-right: 1em;
	}

	.song-score .main > *:last-child {
		margin-right: 0;
	}

	.song-score .main :global(.badge) {
		margin: 0 !important;
		padding: 0.125em 0.25em !important;
		width: 100%;
	}

	.song-score .main :global(.badge small) {
		font-size: 0.7em;
		font-weight: normal;
		margin-top: -2px;
	}

	.song-score .main :global(.inc),
	.song-score :global(.dec) {
		color: inherit;
	}

	section.stats {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		grid-template-rows: min-content;
		grid-column-gap: 0.75em;
		grid-row-gap: 0.25em;
		min-width: 20rem;
	}

	.rank {
		width: 5.5em;
		text-align: center;
	}

	.song {
		flex-grow: 1;
		min-width: 15.25em;
	}

	.timeset {
		width: 8.5em;
		text-align: center;
	}

	.timeset :global(small) {
		line-height: 1;
	}

	.rank .timeset {
		width: auto;
		min-width: 7em;
		font-size: 0.8em;
	}

	.pp {
		min-width: 5em;
	}

	.pp.with-badge {
		position: relative;
	}

	.acc {
		min-width: 4em;
	}

	.score {
		min-width: 5.25em;
	}

	.range {
		grid-column: 1 / span 3;
		width: 100%;
		padding-top: 0.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.range i.fas {
		cursor: pointer;
		margin-left: 0.5rem;
		color: var(--faded);
		transition: color 300ms;
	}

	.range i.fas.fa-minus-circle {
		color: var(--dimmed);
	}

	.range i.fas:hover {
		color: white;
	}

	.range input[type='range'] {
		width: calc(100% - 1.5rem);
	}

	input[type='range'] {
		outline: none;
	}

	.mod {
		margin-right: 0.25rem;
	}

	.with-badge {
		text-align: center;
	}

	.with-badge :global(.badge) {
		height: 100%;
	}

	small {
		display: block;
		text-align: center;
		white-space: nowrap;
		font-size: 0.75em;
	}

	.compare-player-name > span {
		display: inline-block;
		position: relative;
		top: 0.5em;
		background-color: var(--foreground);
		padding: 0 0.5em;
	}

	@media screen and (max-width: 767px) {
		.song-score {
			padding: 0.75em 0;
		}

		.song-score .main {
			flex-wrap: wrap;
		}

		.rank,
		.timeset {
			padding-bottom: 0.5em !important;
		}

		.song {
			display: flex;
			justify-content: flex-start;
			align-items: center;
			width: 100%;
			margin-right: 0;
			padding-bottom: 0.75em;
		}
	}

	.clickable,
	.clickable :global() {
		cursor: pointer !important;
	}
</style>
