<script>
  import ScoresDownloader from './ScoresDownloader.svelte'
  import Stats from './Stats.svelte'

  let playerData = null;
</script>

{#if !playerData}
  <ScoresDownloader on:download={event => playerData = event?.detail} />
{:else}
  <Stats {playerData} />
{/if}
