<script>
  import Avatar from './Avatar.svelte'
  import PpCalc from './PpCalc.svelte'
  import Scores from './Scores.svelte'
  import {formatNumber} from '../utils/format'
  import {getTotalPlayerPp, PP_PER_STAR, ppFactorFromAcc} from '../utils/pp'
  import playlist from '../stores/playlist'
  import download from '../utils/download'
  import {difficulties} from '../utils/diffs'

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

  function onAddToPlaylist(e) {
    if (!e?.detail?.songHash || !e?.detail?.difficulty?.difficulty) return;

    const hash = e.detail.songHash;
    const difficulty = e.detail.difficulty.difficulty;

    playlist.add(hash, difficulty);
  }

  function onRemoveFromPlaylist(e) {
    if (!e?.detail?.songHash || !e?.detail?.difficulty?.difficulty) return;

    const hash = e.detail.songHash;
    const difficulty = e.detail.difficulty.difficulty;

    playlist.remove(hash, difficulty);
  }

  async function onPlaylistDownload(playlist) {
    if (!playlist.length) return;

    const hashes = Object.values(
      playlist.reduce((cum, s) => {
        const {hash, difficulty} = s;
        const name = difficulties[difficulty].replace('expert+', 'expertPlus');

        if (!cum[hash]) cum[hash] = {hash, difficulties: []};

        if (!cum[hash].difficulties.filter(d => d.characteristic === 'Standard' && d.name === name).length)
          cum[hash].difficulties.push({characteristic: "Standard", name});

        return cum;
      }, {}),
    );

    const icon = "data:image/png;base64,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";
    const json = {
      AllowDuplicates: false,
      playlistTitle: 'PP Calc',
      playlistAuthor: "motzel",
      playlistDescription: "",
      image: icon,
      songs: hashes,
    }

    download(JSON.stringify(json), ("ppcalc-" + (new Date()).toISOString()).replace(/:/g, '_') + '.json', 'application/json;charset=utf-8;');
  }

  $: ({playerInfo, scores} = playerData ?? {})
  $: totalPlayerPp = scores?.length ? getTotalPlayerPp(scores) : 0;
  $: modifiedTotalPlayerPp = scores?.length
    ?
    getTotalPlayerPp(scores, Object.entries(modifiedPercentage).reduce((cum, [leaderboardId, modified]) => {
      const pp = PP_PER_STAR * modified.stars * ppFactorFromAcc(modified.percentage);

      return {
        ...cum,
        ...{[leaderboardId]: {score: {pp}}},
      };
    }, {}))
    : totalPlayerPp
  $: totalPpDiff = modifiedTotalPlayerPp - totalPlayerPp;
</script>

<main>
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

          <PpCalc {scores}/>
        </div>
      </div>
    </div>

    <div class="box has-shadow">
      <Scores {scores} {modifiedPercentage} on:percentage-changed={onPercentageChanged}
              on:add-to-playlist={onAddToPlaylist} on:remove-from-playlist={onRemoveFromPlaylist}/>
    </div>
  {/if}

  {#if $playlist.length}
    <div class="playlist clickable" title="Download playlist" on:click={() => onPlaylistDownload($playlist)}>
      <i class="fas fa-music"></i>
      <span class="num">{formatNumber($playlist.length, 0)}</span>
    </div>
  {/if}
</main>

<style>
    main {
        position: relative;
    }

    .playlist {
        position: fixed;
        padding: .5rem;
        top: .5rem;
        right: .5rem;
        background-color: var(--decrease);
        border-radius: 50%;
        transition: all 300ms;
        cursor: pointer;
    }

    .playlist:hover {
        background-color: var(--error);
    }

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