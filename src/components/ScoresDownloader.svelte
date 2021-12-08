<script>
  import {createEventDispatcher} from 'svelte';
  import Spinner from './Spinner.svelte'
  import {formatNumber} from '../utils/format'

  const dispatch = createEventDispatcher();

  let profileUrl = '';
  let playerId = null;
  let playerInfo = null;

  let isFetching = false;
  let error = null;
  let message = null;

  function clearAll() {
    playerId = null;
    playerInfo = null;
    error = null;
    message = null;
  }

  const difficulties = {
    1: 'easy',
    3: 'normal',
    5: 'hard',
    7: 'expert',
    9: 'expert+',
  }

  const apiFetchPlayer = async playerId => (await (await fetch(`/cors/score-saber/api/player/${playerId}/full`)).json());

  const apiFetchScoresPage = async (playerId, page = 1, itemsPerPage = 100) => (await (await
    fetch(`/cors/score-saber/api/player/${playerId}/scores?limit=${itemsPerPage}&page=${page}`)).json())
    .map(s => ({
      songName: s?.leaderboard?.songName ?? 'unknown',
      mapper: s?.leaderboard?.levelAuthorName ?? 'unknown',
      difficulty: difficulties?.[s?.leaderboard?.difficulty?.difficulty ?? 'unknown'],
      pp: s?.score?.pp ?? 0,
      weight: s?.score?.weight ?? 0,
      acc: s?.leaderboard?.maxScore && s?.score?.baseScore ? s.score.baseScore / s.leaderboard.maxScore * 100 : 0,
    }))
    .filter(s => s.pp)
  ;

  async function fetchScores(playerInfo) {
    if (!playerInfo?.id?.length) return;

    try {
      let playerScores = [];
      let allScoresFetched = false;
      let page = 1;
      const itemsPerPage = 100;

      isFetching = true;

      while (!allScoresFetched) {
        message = `Downloading ranked scores, ${page * itemsPerPage}...`;
        const scoresPage = await apiFetchScoresPage(playerInfo.id, page++, itemsPerPage);
        if (scoresPage?.errorMessage) throw scoresPage.errorMessage;

        playerScores = [...playerScores, ...scoresPage];

        allScoresFetched = scoresPage.length < itemsPerPage;
      }

      dispatch('download', playerScores)
    } catch (e) {
      error = `Error has occurred: ${e.toString()}`;
    } finally {
      isFetching = false;
    }
  }

  async function fetchPlayer(playerId) {
    if ((playerId?.length ?? 0) < 17) return;

    try {
      isFetching = true;
      const info = await apiFetchPlayer(playerId);
      if (info?.errorMessage) throw info.errorMessage;

      playerInfo = info;
    } catch (e) {
      error = `Error has occurred: ${e.toString()}`;
    } finally {
      isFetching = false;
    }
  }

  function retry() {
    error = null;
    message = null;

    if (playerInfo) fetchScores(playerInfo?.playerId);
    else if (playerId) fetchPlayer(playerId);
  }

  function extractPlayerId(profileUrl) {
    if (!profileUrl?.trim()?.length) {
      clearAll();
      return;
    }

    const matches = profileUrl.match(/^(?:\s*https:\/\/scoresaber.com\/u\/(\d+))|\s*(\d+)\s*/);
    if (!matches) {
      error = 'Invalid URL';
      return;
    }

    clearAll();
    playerId = matches[1] ? matches[1] : matches[2];
  }

  $: extractPlayerId(profileUrl)
  $: fetchPlayer(playerId)
  $: fetchScores(playerInfo);
</script>

<main>
  <section>
    <div class="profile-input">
      <input bind:value={profileUrl} placeholder="Your Score Saber profile..." disabled={isFetching} autofocus />
      {#if isFetching}
        <Spinner/>
      {/if}
    </div>

    {#if playerInfo}
      <h5 class="title is-5">
        <a rel="external" target="_blank" href="https://steamcommunity.com/profiles/{playerInfo.playerId}">
          {playerInfo?.name}
        </a>
        <span class="divider"></span>
        <span title="Performance Points" class="title-header pp">{formatNumber(playerInfo?.pp)}pp</span>
      </h5>
    {/if}

    {#if error || message}
      <small class:error={!!error}>
        {error ? error : message}
      </small>
    {/if}
  </section>
</main>

<style>
    main {
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 1rem;
    }

    section {
        width: 40rem;
        max-width: 100%;
        text-align: center;
    }

    .profile-input {
        position: relative;
        margin-bottom: 1rem;
    }

    input {
        width: 100%;
        font-size: 1.25rem;
        color: var(--textColor);
        background-color: var(--foreground);
        border: 1px solid var(--faded);
        padding: .5rem 2rem .5rem .5rem;
    }

    .profile-input :global(svg) {
        position: absolute;
        right: .5rem;
        top: 1rem;
    }

    input::placeholder {
        color: var(--faded) !important;
    }

    h5 {
        display: inline-flex;
        gap: .75rem;
        justify-content: space-evenly;
        align-items: center;
        margin-bottom: 1rem!important;
    }

    .divider {
        border-left: 1px solid var(--dimmed);
        height: .875rem;
    }

    small {
        display: block;
    }

    .error {
        color: var(--decrease);
    }

    @media screen and (max-width: 600px) {
        h5 {
            flex-direction: column;
            gap: .25rem;
        }
        .divider {
            display: none;
        }
    }
</style>