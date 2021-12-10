<script>
  import Avatar from './Avatar.svelte'
  import PpCalc from './PpCalc.svelte'
  import Scores from './Scores.svelte'
  import {formatNumber} from '../utils/format'

  export let playerData = null;

  $: ({playerInfo, scores} = playerData ?? {})
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

          <span class="pp">{formatNumber(playerInfo.pp)}pp</span>
        </h1>

        <PpCalc {scores} />
      </div>
    </div>
  </div>

  <div class="box has-shadow">
    <Scores {scores} />
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