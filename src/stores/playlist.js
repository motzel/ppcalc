import {writable} from 'svelte/store'

export const playlistMatch = (song, hash, difficulty) => song.hash === hash && song.difficulty === difficulty;

function createStore() {
  const store = writable([]);

  const add = (hash, difficulty) => store.update(playlist => playlist.filter(p => !playlistMatch(p, hash, difficulty)).concat([{hash, difficulty}]));
  const remove = (hash, difficulty) => store.update(playlist => playlist.filter(p => !playlistMatch(p, hash, difficulty)));

  return {
    add,
    remove,
    subscribe: store.subscribe,
  }
}

const playlist = createStore();

export default playlist;