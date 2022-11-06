<script>
    import { search, read, deleteData } from '../utils/data.js';
    import { pushURL } from '../../settings.js';
    import { progress, plstore } from '../stores.js';
    import Result from './Result.svelte';
    import { createPlaylist } from '../utils/spotify_utils.js';

	//remove auth url params
	history.pushState({}, 'feed', pushURL);

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
            <del>save playlist.</del> done
        {/if}
            {#if results.length != 0}
            {#each results as r }
            <Result r={r} /> 
            {/each}
            {:else}
            no playlists found sorry
        {/if}
    {/if}
</main>

<style>
    :global(:root){
        overflow-y: auto;
    }

    main {
        margin-left: 0.4em;
        margin-left: 0.4em;
        margin-top: 0.4em;
        text-align: left;
        font-family: "Josefin Slab";
        color: #000;
        font-size: 4.2em;
    }

    button {
        all: unset;
        padding-top: 1em;
        cursor: pointer;
    }

    input {
        all: unset;
        border: none;
        border-bottom: 4px solid black;
    }

</style>
