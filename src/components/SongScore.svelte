<script>
  import {formatNumber} from '../utils/format'
  import Badge from './Badge.svelte'
  import Accuracy from './Accuracy.svelte'
  import SongInfo from './SongInfo.svelte'
  import Pp from './Pp.svelte'
  import Value from './Value.svelte'
  import FormattedDate from './FormattedDate.svelte'

  export let songScore = null;

  $: leaderboard = songScore?.leaderboard ?? null;
  $: score = songScore?.score ?? null
</script>

{#if songScore}
  <div class="song-score">
    <div class="main">
      <div class="rank">
        <Value value={score.rank} prefix="#" zero="-" digits={0}/>

        <div class="timeset tablet-and-up">
          <FormattedDate date={score.timeSet}/>
        </div>
      </div>

      <span class="timeset mobile-only">
        <FormattedDate date={score.timeSet}/>
      </span>

      <span class="song">
        <SongInfo {leaderboard}/>
      </span>

      <section class="stats">
        {#if score.pp}
          <span class="pp with-badge">
            <Badge onlyLabel={true} color="white" bgColor="var(--ppColour)">
              <span slot="label">
                <Pp playerId={score.playerId} leaderboardId={leaderboard.leaderboardId}
                    pp="{score.pp}" weighted={score.ppWeighted} attribution={score.ppAttribution}
                    whatIf={score.whatIfPp}
                    zero={formatNumber(0)} withZeroSuffix={true} inline={false}
                    color="white"
                />
              </span>
            </Badge>
          </span>
        {:else}
          <span class="pp with-badge"></span>
        {/if}

        {#if score.acc}
            <span class="acc with-badge">
              <Accuracy {score}/>
            </span>
        {:else}
          <span class="acc with-badge"></span>
        {/if}

        {#if score.modifiedScore}
        <span class="score with-badge">
          <Badge onlyLabel={true} color="white" bgColor="var(--dimmed)">
              <span slot="label">
                <Value value={score.modifiedScore} inline={false} digits={0}/>
              </span>
          </Badge>
        </span>
        {/if}
      </section>
    </div>
  </div>
{/if}

<style>
    .song-score {
        border-bottom: 1px solid var(--dimmed);
        padding: .5em 0;
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
        padding: .125em .25em !important;
        width: 100%;
    }

    .song-score .main :global(.badge small) {
        font-size: .7em;
        font-weight: normal;
        margin-top: -2px;
    }

    .song-score .main :global(.inc), .song-score :global(.dec) {
        color: inherit;
    }

    section.stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        grid-template-rows: min-content;
        grid-column-gap: .75em;
        grid-row-gap: .25em;
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
        font-size: .8em;
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
        font-size: .75em;
    }

    .compare-player-name > span {
        display: inline-block;
        position: relative;
        top: .5em;
        background-color: var(--foreground);
        padding: 0 .5em;
    }

    @media screen and (max-width: 767px) {
        .song-score {
            padding: .75em 0;
        }

        .song-score .main {
            flex-wrap: wrap;
        }

        .rank, .timeset {
            padding-bottom: .5em !important;
        }

        .song {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            width: 100%;
            margin-right: 0;
            padding-bottom: .75em;
        }
    }
</style>