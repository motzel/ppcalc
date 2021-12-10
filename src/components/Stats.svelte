<script>
  import Avatar from './Avatar.svelte'
  import PpCalc from './PpCalc.svelte'
  import Scores from './Scores.svelte'
  import {formatNumber} from '../utils/format'
  import {getTotalPlayerPp, PP_PER_STAR, ppFactorFromAcc} from '../utils/pp'

  export let playerData = null;

  let modifiedPercentage = {};

  function onPercentageChanged(e) {
    if (!e.detail) return;

    const {leaderboardId, percentage} = e.detail;

    if (leaderboardId) {
      if (!percentage) {
        delete modifiedPercentage[leaderboardId];
        modifiedPercentage = modifiedPercentage;
      } else {
        modifiedPercentage[leaderboardId] = e.detail;
      }
    }
  }

  $: ({playerInfo, scores} = playerData ?? {})
  $: totalPlayerPp = scores?.length ? getTotalPlayerPp(scores) : 0;
  $: modifiedTotalPlayerPp = scores?.length
    ?
    getTotalPlayerPp(scores, Object.entries(modifiedPercentage).reduce((cum, [leaderboardId, modified]) => {
      const pp = PP_PER_STAR * modified.stars * ppFactorFromAcc(modified.percentage);

      return {
        ...cum,
       ...{[leaderboardId]: {score: {pp}}}
      };
    }, {}))
    : totalPlayerPp
  $: totalPpDiff = modifiedTotalPlayerPp - totalPlayerPp;
</script>

{#if playerInfo}
  <div class="box has-shadow">
    <div class="columns">
      <div class="column is-narrow avatar">
        <Avatar {playerInfo}/>
      </div>

      <div class="column">
        <h1 class="title is-4 has-text-centered-mobile">
          <div class="name">{playerInfo.name}</div>

          <span class="pp">
            {formatNumber(playerInfo.pp)}pp
            {#if totalPpDiff > 0}
              <span class="inc">+{formatNumber(totalPpDiff)}pp</span>
            {/if}
          </span>
        </h1>

        <PpCalc {scores} />
      </div>
    </div>
  </div>

  <div class="box has-shadow">
    <Scores {scores} {modifiedPercentage} on:percentage-changed={onPercentageChanged} />
  </div>
{/if}

<style>
    h1 {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
  .name {
      color: var(--ppColour);
  }

  @media screen and (max-width: 767px) {
      h1 {
          flex-direction: column;
      }
  }
</style>