<script>
  import Pager from './Pager.svelte'
  import SongScore from './SongScore.svelte'
  import {getPpFromAccAndStars} from '../utils/pp'

  export let scores = null;
  export let modifiedPercentage = {};
  export let service = 'scoresaber';

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
      const stars = leaderboard?.stars ?? 0;
      const basePp = score?.pp ?? 0;
      const basePercentage = maxScore ? (score?.modifiedScore ?? 0) / maxScore * 100 : score?.percentage;

      let pp = basePp;
      let percentage = basePercentage;
      if (modifiedPercentage[leaderboard?.id]) {
        percentage = modifiedPercentage[leaderboard.id].percentage;
        pp = getPpFromAccAndStars(percentage, stars, service);
      }

      return basePercentage
        ? {
          leaderboard,
          score: {
            ...score,
            basePp,
            pp,
            acc: (score.baseScore ?? 0) / maxScore * 100,
            basePercentage,
            percentage,
          },
        }
        : scoreInfo;
    })
  ;
</script>

{#if scores?.length}
  {#each currentPageScores as score (score?.leaderboard?.id)}
    <SongScore songScore={score} on:percentage-changed on:add-to-playlist on:remove-from-playlist />
  {/each}

  <Pager {currentPage} totalItems={scores.length} itemsPerPage={ITEMS_PER_PAGE} itemsPerPageValues={null}
         on:page-changed={onPageChanged}/>
{:else}
  <p>No scores.</p>
{/if}