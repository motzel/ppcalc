<script>
  export let playerInfo;
  export let isLoading = false;
  export let centered = false;
</script>

{#if playerInfo}
<span><img src={playerInfo.profilePicture} class="avatar" alt=""/></span>
{/if}

<style>
    span {
        display: flex;
    }

    img {
        border-radius: 50%;
        width: 150px;
        height: 150px;
        transition: transform 300ms;
        z-index: 2;
        top: .75rem;
        left: .75rem;
    }

    @media (max-width: 768px) {
        span {
            justify-content: center;
        }

        img {
            left: auto;
        }
    }
</style>