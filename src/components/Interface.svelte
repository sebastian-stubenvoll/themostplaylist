<script>
    import { search, read, deleteData } from '../utils/data.js';
    import { pushURL } from '../../settings.js';
    import { progress, plstore } from '../stores.js';
    import Result from './Result.svelte';
    import { createPlaylist } from '../utils/spotify_utils.js';

	//remove auth url params
	history.pushState({}, 'feed', pushURL);
    const basepath = window.location.pathname;

    let cue = 'heartbreak';
    let last_cue = '';
    let state = 0;
    let results;
    let saved = false;

    async function runSearch () {
        if (cue == '') {
            return
        }
        progress.set(0);
        plstore.set(1);
        state = 1;
        saved = false;
        deleteData();
        last_cue = cue;
        await search(cue);
        results = await read(100); 
        state = 2;
    }

    const go = () => runSearch();

    const savePlaylist = () => {
        saved = true;
        createPlaylist(results, last_cue);
    }

    const reloadPage = () => {
        location = location;
    }

</script>

<main>
    <form on:submit|preventDefault={() => cue = cue}>
    <label>
        <input bind:value={cue} />
    </label>
    
    <button on:click={go}>
        get me the most {cue == '' ? '_' : cue} playlist ever
    </button> 
</form>
        {#if state == 1}
            <br>
            {Math.round(($progress / $plstore) * 100 )}%
            {#if $plstore == $progress}
                sorting results...
            {/if}
        {:else if state == 2}
        {#if !saved && (results.length != 0)}
    <button on:click={savePlaylist}>
        save playlist?
    </button>
        {:else}
            <div class="saved">
            <del>save playlist.</del> done
        </div>
        {/if}
            {#if results.length != 0}
            {#each results as r }
            <Result r={r} /> 
            {/each}
            {:else}
            no playlists found. sorry
        {/if}
    {/if}
</main>
    <div class="container">
        <div class="item">
    <div class="frame">
        <img src="{basepath}/spotify-logo.png" alt="Spotify logo" />
    </div>
    </div>
    <div class="item">
        <div class="exit">
            <button on:click={reloadPage}> 
        exit 
    </button>
    </div>
    </div>
    </div>

<style>
    :global(:root){
        overflow-y: auto;
    }

    .item {
  width: 100%
}

.container {
  display: flex;
  flex-wrap: wrap;
  flex-flow: row;
  background-color: black;
  left: 0;
  bottom: 0;
  position: fixed;
  width: 100%;
  height: 5em;
}

.container > div {
  flex: 50%; /* or - flex: 0 50% - or - flex-basis: 50% - */
  /*demo*/
  margin-bottom: 10px;
}

    .frame {
        height: 708px;      /* Equals maximum image height */
        text-align: left;
        margin: 0.5em;
        }

     img {
        vertical-align: middle;
        max-height: 3.5em;
        }

        main {
        margin-left: 0.4em;
        margin-left: 0.4em;
        margin-top: 0.4em;
        text-align: left;
        font-family: "Josefin Slab";
        color: #000;
        font-size: 3.5em;
        }

        button {
        all: unset;
        padding-top: 0.2em;
        padding-bottom: 0.2em;
        cursor: pointer;
        }

        .saved {
        padding-top: 0.2em;
        padding-bottom: 0.2em;
        }


        .exit {
            color: white;
            font-size: 3.5em;
            text-align: right;
            align-self: right;
            padding-right: 10%;
            padding-top: 0px;
            font-family: "Josefin Slab";
            display: flex;
            justify-content: right;
        }

        input {
        all: unset;
        border: none;
        border-bottom: 4px solid black;
        }

</style>
