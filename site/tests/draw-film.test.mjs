import test from 'node:test';
import assert from 'node:assert/strict';
import {filmRows,filmPhase,filmDuration} from '../public/draw-film.js';
import {PARTICIPANTS,LANGUAGES} from '../lib/improving.mjs';
test('film replays recorded results and project titles without drawing again',()=>{
 const state={participants:PARTICIPANTS,languages:LANGUAGES,projects:[{agent:6,title:'Mon moteur de recherche'}],draw:{assignments:PARTICIPANTS.map((p,i)=>({numero:p.numero,language:LANGUAGES[i].id}))}};
 const before=JSON.stringify(state);const rows=filmRows(state);assert.equal(rows.length,10);assert.equal(rows[5].title,'Mon moteur de recherche');assert.equal(rows[5].language,LANGUAGES[5].name);assert.equal(JSON.stringify(state),before);
 assert.equal(filmPhase(0,rows).type,'intro');assert.equal(filmPhase(1.6,rows).index,0);assert.equal(filmPhase(18.61,rows).type,'recap');assert.equal(filmDuration(rows),23.6);
 assert.throws(()=>filmRows({...state,draw:null}));
});
