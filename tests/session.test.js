/* Run after static/session.js in any JS runtime (no credentials). */
(() => {
 const assert=(v,m)=>{if(!v)throw Error(m);};
 const day=()=> '2026-11-07';
 const p={coins:0,streams:0,days:{},sessions:[],rewards:{}};
 const create=(id,duration=1)=>({id,duration,elapsedMs:0,lastTick:1000,stars:10});
 const s=create('a');NudgeSession.advance(s,31000);s.paused=true;NudgeSession.advance(s,91000);assert(s.elapsedMs===30000,'paused time excluded');s.paused=false;NudgeSession.settle(p,s,121000,day);assert(s.finished&&s.elapsedMs===60000,'countdown finish');assert(p.streams===1,'completed stream counted');NudgeSession.settle(p,s,181000,day);assert(p.streams===1&&p.sessions.length===1,'no duplicate settlement');
 const manual=create('manual');NudgeSession.settle(p,manual,21000,day);assert(!manual.finished&&p.streams===1,'manual early finish');
 for(const id of ['b','c'])NudgeSession.settle(p,create(id),61000,day);
 assert(p.coins===30,'daily reward once');NudgeSession.settle(p,create('d'),61000,day);assert(p.coins===30,'daily reward not repeated');
 NudgeSession.settle(p,create('long',200),12001000,day);assert(p.coins===130,'cumulative reward');NudgeSession.settle(p,create('long2',200),12001000,day);assert(p.coins===130,'cumulative reward not repeated');
 const reload=create('reload');reload.elapsedMs=20000;NudgeSession.prepare(reload,999999);NudgeSession.advance(reload,1000999);assert(reload.elapsedMs===21000,'closed time excluded');
 const duplicate=create('a');NudgeSession.settle(p,duplicate,61000,day);assert(p.sessions.filter(r=>r.id==='a').length===1,'session id deduplicated');
 globalThis.sessionTestsPassed=true;
})();
(() => {
 const p={coins:0,streams:0,days:{},sessions:[],rewards:{}};
 const s={id:'history',duration:2,elapsedMs:30000,lastTick:1000,title:'Biology',goal:'Read chapter 3',tasks:[{text:'Read',done:true},{text:'Review',done:false}],stars:10,peakAudience:17};
 NudgeSession.settle(p,s,11000,()=> '2026-11-07');
 const r=p.sessions[0];if(r.elapsedMs!==40000||r.stars!==10||r.peakAudience!==17||r.tasks[1].done||r.goal!=='Read chapter 3')throw Error('History must preserve actual session data');
 s.tasks[1].done=true;if(r.tasks[1].done)throw Error('History checklist must be a snapshot');
})();
(() => {
 const assert=(v,m)=>{if(!v)throw Error(m);};
 const p={coins:0,streams:0,days:{},sessions:[],rewards:{}};
 const settle=(id,day,minutes=1)=>NudgeSession.settle(p,{id,duration:minutes,elapsedMs:minutes*60000,lastTick:1000},1000,()=>day);
 settle('d1a','2026-11-07');settle('d1b','2026-11-07');assert(p.coins===0,'below daily threshold');settle('d1c','2026-11-07');assert(p.coins===30,'threshold credits balance');
 assert(NudgeSession.quests(p,'2026-11-08')[0].progress===0,'daily reset');
 settle('d2a','2026-11-08');settle('d2b','2026-11-08');settle('d2c','2026-11-08');assert(p.coins===60,'next calendar day gets its own reward');
 const restored=JSON.parse(JSON.stringify(p));NudgeSession.awardRewards(restored,'2026-11-08');assert(restored.coins===60,'reload does not repeat reward');
 settle('minutes','2026-11-08',193);assert(p.coins===60,'199 minutes not enough');settle('threshold','2026-11-08');assert(p.coins===160,'200 minute threshold awarded');
 const duplicate={...p.sessions[0]};p.sessions.push(duplicate);NudgeSession.awardRewards(p,'2026-11-08');assert(p.coins===160,'duplicate records do not repeat awards');
 const catchup={coins:0,sessions:[{id:'a',day:'2026-11-06',finished:true,elapsedMs:60000},{id:'b',day:'2026-11-06',finished:true,elapsedMs:60000},{id:'c',day:'2026-11-06',finished:true,elapsedMs:60000}],rewards:{}};
 assert(NudgeSession.awardRewards(catchup,'2026-11-08')===30,'older eligible day is reconciled');assert(NudgeSession.awardRewards(catchup,'2026-11-08')===0,'catchup awards only once');
})();
