import { generateRandomString, challenge_from_verifier, to_unix } from './utils.js';
import { clientID, redirect_uri } from '../../settings.js';
import { progress, plstore } from "../stores.js";


//******************************
//*******AUTHENTIFICATION*******
//******************************

export let token;
let refresh;
let expires_in;
let refresh_interval;

function createVerifier() {
    const v = generateRandomString();
    localStorage.setItem('verifier', v);
    return v
};

async function createChallenge(v) {
    const c = await challenge_from_verifier(v)
    return 'code_challenge=' + c
};

export async function createAuthURL () {
    const prefix = 'https://accounts.spotify.com/authorize?';
    const cID = 'client_id=' + clientID;
    const response_type = 'response_type=' + 'code';
    const callback = 'redirect_uri=' + encodeURIComponent(redirect_uri);
    const code_challenge_method = 'code_challenge_method=' + 'S256';
    const s = generateRandomString();
    localStorage.setItem('state', s);
    const ps = 'state=' + s
    const scope = 'scope=playlist-read-private%20playlist-read-collaborative%20playlist-modify-private';
    const c = await createChallenge(createVerifier());
    const params = [cID, response_type, callback, c, code_challenge_method, ps, scope].join('&');
    const url = prefix + params
    return url;
}


export async function getAccessToken(params) {
    if (params.state != localStorage.getItem('state')) {
        return false
    } else {
        let postBody = [];
        const details = {
            'client_id' : clientID,
            'grant_type' : 'authorization_code',
            'code' : params.code,
            'redirect_uri' : redirect_uri,
            'code_verifier' : localStorage.getItem('verifier')
        };
        for (let property in details) {
            const encodedKey = encodeURIComponent(property);
            const encodedValue = encodeURIComponent(details[property]);
            postBody.push(encodedKey + '=' + encodedValue);
        }
        postBody = postBody.join('&'); 
        const endpoint = 'https://accounts.spotify.com/api/token';
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: postBody
        });
        if (res.status != 200) {
            return false
        } else {
            const json = await res.json()
            token = json.access_token;
            refresh = json.refresh_token;
            expires_in = json.expires_in*1000;
            localStorage.removeItem('verifier');
            refresh_interval = setInterval(refreshAccessToken, expires_in - (expires_in*0.1));
            return true
        }
    }
};


const refreshAccessToken = async function () {
    clearInterval(refresh_interval);
    console.log('Refreshing access token...');
    const endpoint = 'https://accounts.spotify.com/api/token';
    let postBody = [];
    const details = {
        'grant_type' : 'refresh_token',
        'refresh_token' : refresh,
        'client_id' : clientID
    };
    for (let property in details) {
        const encodedKey = encodeURIComponent(property);
        const encodedValue = encodeURIComponent(details[property]);
        postBody.push(encodedKey + '=' + encodedValue);
    }
    postBody = postBody.join('&');
    const res =  await fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: postBody
    });
    const json = await res.json();
    token = json.access_token;
    refresh = json.refresh_token;
    expires_in = json.expires_in*1000;
    refresh_interval = setInterval(refreshAccessToken, expires_in - (expires_in*0.1));
};


//******************************
//*********API FUNCTIONS********
//******************************
function authHeader (auth) {
    const header = {'Authorization' : 'Bearer ' + auth};
    return header
}

export async function playlistSearch (auth, cue) {
    const endpoint = 'https://api.spotify.com/v1/search';
    let send = true;
    let playlists = [];

    let url = endpoint + '?q=' + encodeURIComponent(cue) + '&type=playlist&limit=50';

    while (send) {
        const res = await fetch(url, {
            method: 'GET',
            headers : authHeader(auth)
        });
        const json = await res.json();
        for (let pl of json.playlists.items) {
            if (!(pl.name.startsWith('This is'))) {
                playlists.push(pl);
            }
            if ((json.playlists.next == null) || (playlists.length == 100)) {
                send = false;
                break;
            }
        }    
            if ((json.playlists.next == null) || (playlists.length == 100)) {
                send = false;
                break;
            }
            url = json.playlists.next;
    }
    plstore.set(playlists.length);
    return playlists
}

export async function songRequests (auth, cue) {
    const playlists = await playlistSearch(auth, cue);

    let allResults = {};

    const results_list = await Promise.all(
        playlists.map(async pl => {
            let endpoint = 'https://api.spotify.com/v1/playlists/'
            const params = {
                market: 'from_token',
                limit : '100',
                fields : 'name,id,external_urls,tracks.items(is_local,track(duration_ms,external_urls,name,popularity,id),added_at,added_by(id,external_urls,href),track.album(external_urls,name),track.artists(external_urls,name)),tracks(limit,next,offset)'
            };
            const altparams = {
                market: 'from_token',
                limit : '100',
                fields : 'items(is_local,track(duration_ms,external_urls,name,popularity,id),added_at,added_by(id,external_urls,href),track.album(external_urls,name),track.artists(external_urls,name)),limit,next,offset'
            };

            let songIDs = [];
            let send = true;
            let url = new URL(endpoint + pl.id)
            let current_params = params;
            let container = undefined;
            url.search = new URLSearchParams(current_params).toString();

            let results = {};

            while (send) {
                const res = await fetch(url, {
                    method: 'GET',
                    headers : authHeader(auth)
                });
                let json = await res.json();
                if (container != undefined) {
                    container.tracks.items = json.items;
                    container.tracks.next = json.next; 
                    json = container;
                }
                try {
                for (let track of json.tracks.items) {
                    try {
                        let artists = [];
                        for (let artist of track.track.artists) {
                            artists.push({name : artist.name, link : artist.external_urls.spotify});
                        } 
                        if (!(track.track.id in results) && (track.track.id != null)) {
                            results[track.track.id] = {
                                song_title : track.track.name,
                                song_link : track.track.external_urls.spotify,
                                song_popularity : track.track.popularity,
                                song_islocal : track.is_local,
                                song_id : track.track.id,
                                song_duration : track.track.duration_ms,

                                album_name : track.track.album.name,
                                album_link : track.track.album.external_urls.spotify,

                                playlists : [],
                                artists : artists,
                                occurrences : 1,
                            }
                        }

                        if (!songIDs.includes(track.track.id)) {
                            results[track.track.id].playlists.push(pl);
                            songIDs.push(track.track.id);
                        }
                    } catch { 
                        //pass
                    }
                }
                } catch {
                    //pass
                }
                if (json.tracks.next != null) {
                    url = new URL(json.tracks.next);
                    container = json;
                    current_params = altparams;
                } else {
                    send = false;
                }
            }
            progress.update(v => v+1);
            return results
        }
        )
    )

    let results = {};
    for (let r of results_list) {
        for (let k of Object.keys(r)) {
            if (k in results) {
                results[k].playlists = [...new Set([...results[k].playlists, ...r[k].playlists])];
            } else {
                results[k] = r[k];
            }
            results[k].occurrences = results[k].playlists.length;
        }
    }
    return results;
}



export async function createPlaylist (results, cue) {
    let url = 'https://api.spotify.com/v1/me';
    const res1 = await fetch(url, {
        method: 'GET',
        headers : authHeader(token)
    });
    if (!res1.ok) { 
        console.log(res1)
        return false}
    let json = await res1.json();
    const id = json.id; 
    
    console.log(id);
    
    
    url = 'https://api.spotify.com/v1/users/' + id + '/playlists';
    const res2 = await fetch(url, {
        method : 'POST',
        headers : {
            'Authorization' : 'Bearer ' + token,
            'Accept': 'application/json',
            'Content-Type' : 'application/json',
        },
        body: JSON.stringify({
            'name' : 'the most ' + cue + ' playlist',
            'public' : false,
        })
    });
    if (!res2.ok) { 
        console.log(res2)
        return false}
    json = await res2.json();
    const pid = json.id;

    let song_ids = [];
    for (const r of results) {
        song_ids.push('spotify:track:'+r.song_id);
    }

    url = 'https://api.spotify.com/v1/playlists/' + pid + '/tracks';

    const res3 = await fetch(url, {
        method : 'POST',
        headers : {
            'Authorization' : 'Bearer ' + token,
            'Accept': 'application/json',
            'Content-Type' : 'application/json',
        },
        body: JSON.stringify({
            'uris' : song_ids,
        })
    });
    if (!res3.ok) { 
        console.log(res3)
        return false}
    return json.external_urls.spotify;
    

}


