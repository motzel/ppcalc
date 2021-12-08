<script>
  import ScoresDownloader from './ScoresDownloader.svelte'
  import Stats from './Stats.svelte'

  let scores = null;
</script>

{#if !scores}
  <ScoresDownloader on:download={event => scores = event?.detail} />
{:else}
  <Stats {scores} />
{/if}
