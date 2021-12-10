<script>
  import Difficulty from './Difficulty.svelte'

  export let leaderboard = null;
  export let url = null;

  const DEFAULT_IMG = '/assets/song-default.png';

  let preloadCache = {};
  let loadedImages = [];

  function preloadImages(images) {
    if (!images.some(img => img?.url?.length)) return;

    images.forEach(imgObj => {
      if (!imgObj?.url?.length || preloadCache[imgObj?.url]) return;

      const url = imgObj.url;

      preloadCache[url] = imgObj;

      const img = new Image();
      img.src = url;
      img.onload = e => {
        if (preloadCache[url]) loadedImages = [...loadedImages, imgObj]
      }
    })
  }

  $: hash = leaderboard?.songHash ?? null;
  $: ssCoverUrl = leaderboard?.coverImage ?? null

  $: preloadImages([{url: ssCoverUrl, priority: 10}]);

  $: coverUrl = loadedImages.length ? (loadedImages.sort((a, b) => a?.priority - b?.priority))[0].url : DEFAULT_IMG;
</script>

<div class="cover-difficulty">
  {#if leaderboard}
    <img src={coverUrl} alt=""/>

    <div class="difficulty">
      <Difficulty diff={leaderboard.difficulty} stars={leaderboard.stars}
                  useShortName={true} reverseColors={true} starsSuffix="★"
      />
    </div>
  {:else}
    <img src={DEFAULT_IMG} alt=""/>
  {/if}
</div>

<style>
    .cover-difficulty {
        position: relative;
        min-width: 4em;
        width: 4em;
    }

    .difficulty {
        display: flex;
        align-items: center;
        position: absolute;
        bottom: 1em;
        right: 0;
        font-size: .75em;
    }

    img {
        width: 3.5em;
        height: 3.5em;
        border-radius: 15%;
    }
</style>