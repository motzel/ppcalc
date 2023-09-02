<script>
	import SongCover from './SongCover.svelte';

	export let leaderboard = null;
	export let mods = [];
</script>

{#if leaderboard}
	<section>
		<SongCover {leaderboard} />

		<div class="songinfo">
			<span class="name">{leaderboard.songName} {leaderboard.songSubName}</span>
			<div class="author">{leaderboard.songAuthorName} <small>{leaderboard.levelAuthorName}</small></div>
		</div>

		<div class="mods">
			{#if mods?.length}
				{#each mods as mod}<span>{mod}</span>{/each}
			{/if}
		</div>
	</section>
{/if}

<style>
	section {
		display: flex;
		justify-content: flex-start;
		align-items: center;
	}

	section :global(> *) {
		margin-right: 0.75em;
	}

	.songinfo {
		text-align: left;
		font-size: 0.95rem;
		font-weight: 500;
		flex-grow: 1;
	}

	.songinfo {
		color: var(--alternate);
	}

	.songinfo small {
		font-size: 0.75em;
		color: var(--ppColour);
	}

	.mods {
		font-size: 0.75em;
		margin: 0;
	}
	.mods > * {
		display: block;
	}
</style>
