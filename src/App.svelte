<script>
	import Login from './components/Login.svelte';
    import Interface from './components/Interface.svelte';


	import { getAccessToken } from './utils/spotify_utils.js';
	import queryString from 'query-string';

	let token_valid;

	async function checkToken () {
        console.log(1);
		const paramCheck = await getParams();
        console.log(2);
		if (!paramCheck) {
			token_valid = false;
			return
		}
		token_valid = true;
	}			

	async function getParams () {
		if (typeof window !== 'undefined') {
			const parsed = queryString.parse(window.location.search);
			if (parsed.code) {
				const success = await getAccessToken(parsed);
				if (success) {
					return true
				}
			}
		}
		return false
	}


	const validity = checkToken();

</script>

	<main>
		{#await validity}
			checking spotify access!
		{:then}
			{#if !token_valid}
				<Login/>
			{:else}
				<Interface/>
			{/if}
		{/await}
	</main>

<style>
</style>
