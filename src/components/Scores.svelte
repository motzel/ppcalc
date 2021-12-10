<script>
  import Pager from './Pager.svelte'
  import SongScore from './SongScore.svelte'

  export let scores = null;

  const ITEMS_PER_PAGE = 8;

  let currentPage = 0;

  function onPageChanged(e) {
    if (!Number.isFinite(e?.detail?.page)) return;

    currentPage = e.detail.page;
  }

  $: sortedScores = (scores ?? []).sort((a, b) => b?.score?.pp - a?.score?.pp)
  $: currentPageScores = sortedScores
    .slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE)
    .map(scoreInfo => {
      const {score, leaderboard} = scoreInfo;

      const maxScore = leaderboard?.maxScore ?? 0;

      return maxScore
        ? {
          leaderboard,
          score: {
            ...score,
            acc: (score.baseScore ?? 0) / maxScore * 100,
            percentage: (score.modifiedScore ?? 0) / maxScore * 100,
          },
        }
        : scoreInfo;
    })
  ;
</script>

{#if scores?.length}
  {#each currentPageScores as score (score?.leaderboard?.id)}
    <SongScore songScore={score}/>
  {/each}

  <Pager {currentPage} totalItems={scores.length} itemsPerPage={ITEMS_PER_PAGE} itemsPerPageValues={null}
         on:page-changed={onPageChanged}/>
{:else}
  <p>No scores.</p>
{/if}