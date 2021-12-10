<script>
  import SongCover from './SongCover.svelte'

  export let leaderboard = null;
</script>

{#if leaderboard}
  <section>
    <SongCover {leaderboard} />

    <div class="songinfo">
        <span class="name">{leaderboard.songName} {leaderboard.songSubName}</span>
        <div class="author">{leaderboard.songAuthorName} <small>{leaderboard.levelAuthorName}</small></div>
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
        margin-right: .75em;
    }

    .songinfo {
        text-align: left;
        font-size: .95rem;
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
</style>