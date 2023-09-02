<script>
	import ScoresDownloader from './ScoresDownloader.svelte';
	import Stats from './Stats.svelte';

	let playerData = null;
</script>

<section>
	{#if !playerData}
		<ScoresDownloader on:download={event => (playerData = event?.detail)} />
	{:else}
		<Stats {playerData} />
	{/if}
</section>

<style>
	section {
		padding: 1rem 0;
		max-width: 1150px;
		margin: 0 auto;
	}
</style>
