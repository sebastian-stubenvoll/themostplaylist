import { songRequests } from "./spotify_utils.js";
import { token } from "./spotify_utils";
import { Connection } from "jsstore";
import workerInjector from "jsstore/dist/worker_injector";

//function exports
export async function search (cue) {
	await createConnection();
	await initDatabase();
	const songs = await updateSongs(cue);
}

export async function read (limit) {
	const result = await getSongs(limit);
	return result
}


export function deleteData () {
	indexedDB.deleteDatabase('pldb');
}

//global vars
let connection;
let playlistsTable;
let songsTable;
let db;


//internal functions
async function createConnection() {
	connection = new Connection();
	connection.addPlugin(workerInjector);
}

async function initDatabase() {
	
	songsTable = {
		name: 'songs',
		columns: {
			song_title : { notNull: true, dataType: 'string' },
			song_link : { dataType: 'string' },
			song_popularity : { dataType: 'number' },
			song_duration : { dataType: 'number' },
			song_islocal : { dataType: 'boolean' },
			song_id : { primaryKey : true, notNull: true, dataType: 'string' },
			album_name : { dataType: 'string' },
			album_link : { dataType: 'string' },
			artists : { notNull: true, dataType: 'array' },
            playlists : { notNull : true,  dataType: 'array' },
            occurrences : {notNull :'number' },
		}
	};

	db = {
		name : 'pldb',
		tables : [ songsTable ]
	};

	await connection.initDb(db);
}

//updateFunctions

async function updateSongs (cue) {
	//use playlists object from updatePlaylists to fetch 
	const songResults = await songRequests(token, cue)
	//update songs table; API response is designed in a manner
	//such that the songs key holds an array of songs,
	//all of which are objects that match the table row schema
	await connection.insert({
		into : 'songs',
		values: Object.values(songResults),
		upsert : 'true' //theoretically not necessary but better safe than sorry!
		});
};


async function getSongs (l) {
	//base query
	let query = {
		from : 'songs',
		order : {
			by : 'occurrences',
			type: 'desc'
		},
		limit : l,
	}
	//SQL: SELECT * FROM songs ORDER BY unix DESC LIMIT l
	const result = await connection.select(query);
	return result
}
