<script>
    import { createAuthURL } from '../utils/spotify_utils.js';

    const authURL = createAuthURL();

    let state = 0;

</script>

{#await authURL}
    <h1> </h1>
{:then url}
    {#if state == 0}
        <h1>
            {#each Array(100) as _}
            <a href={url}>login with spotify</a>
            <button on:click={() => state = 1}>about</button>
            <button on:click={() => state = 2}>privacy</button>
            &nbsp;
            {/each}
        </h1>
    {:else if state == 1}
        <h1 class="page">
            a silly little project that scans your top 100 playlist-search results for a certain prompt and returns the most frequently added songs. in short: you can use this to create your most ___ playlist ever. since this involves making a fair amount of api calls, you may have to bring a little patience. in theory this could be improved by predicting the api call urls but for now this is good enough.
        <button on:click={() => state = 0}><b>back</b></button>
        </h1>
    {:else if state == 2}
        <h1 class="page">
            all the spotify api calls are done from your browser directly. no data is passed to any third party. only data necessary for the functionality of this website is stored temporarily in your browser. if you have any concerns feel free to take a look at the source code <a href="https://github.com/sebastian-stubenvoll/themostplaylist" target="_blank" rel="noopener noreferrer"><b>here</b></a>.
            <button on:click={() => state = 0}><b>back</b></button>
        </h1>
    {:else}
        <div></div>
    {/if}
{/await}

<style>
    .page {
        line-break: normal;
        font-size: 4.1em;
        font-weight: 100;
    }

    h1 {
        text-align: left;
        font-family: "Josefin Slab";
        color: #000;
        font-size: 8.2em;
        margin: 1em;
        margin-top: 0.5em;
        position: relative;
        line-break: anywhere;
        line-height: 120%;
        height: 100%;
        top: 0px;
    }

    a {
        color: #000;
    }
    a:hover {
        text-decoration: none;
    }

    b {
        font-weight: 700;
    }

    button {
        all: unset;
        cursor: pointer;
    }

</style>






