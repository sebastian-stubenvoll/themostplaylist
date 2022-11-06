<script>
    export let r; 

    let showDetails = false;

    function checkSeperator(artists, i) {
        if (artists.length-1 == i) {return ''}
        else if (artists.length-2 == i) {return ' & '}
        else {return ', '}}


</script>

<main>
    <a href="{r.song_link}" target="_blank" rel="noopener noreferrer">
        {r.song_title}</a> in {r.occurrences} playlists 
    <button on:click={() => showDetails = !showDetails}>{showDetails ? '-' : '+'}</button>
    {#if showDetails}
        <div>
            by
            {#each r.artists as {name, link}, i}
                <a href={link} target='_blank'>{name}</a>{checkSeperator(r.artists, i)}
            {/each}
            on <a href="{r.album_link}" target="_blank" rel="noopener noreferrer">{r.album_name}</a>
            <br>
            <br>
            <i>this song appears in</i>
            <br>
            {#each r.playlists as p}
                <br>
                <a href="{p.external_urls.spotify}" target="_blank" rel="noopener noreferrer">{p.name}</a>
            {/each}
        </div>
{/if}
<br>
</main>

<style>
    button {
        all: unset;
        cursor: pointer;
    }

    main {
        font-size: 0.6em;
        padding: 0.1em;
        overflow-y: auto;
    }

    div {
        font-size: 0.6em;
    }

    a {
        color: #000;
    }
    a:hover {
        text-decoration: none;
    }

</style>

