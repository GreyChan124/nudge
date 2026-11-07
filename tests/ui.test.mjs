import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const elements=new Map();
function element(){return {value:'',hidden:false,disabled:false,textContent:'',style:{setProperty(){}},children:[],listeners:{},classList:{toggle(){}},addEventListener(n,fn){this.listeners[n]=fn;},append(...x){this.children.push(...x);},replaceChildren(...x){this.children=x;},getAttribute(){return '';},remove(){},removeAttribute(){},setAttribute(){},close(){this.open=false;},showModal(){this.open=true;},scrollTop:0,scrollHeight:100,clientHeight:100};}
const get=id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id);};
const storage=new Map(),events={};let cameraMode='deny',stops=0,pendingCamera;
const media=()=>({getTracks:()=>[{stop:()=>stops++}],getVideoTracks:()=>[{addEventListener(){}}]});
const context=vm.createContext({
 document:{getElementById:get,querySelectorAll:()=>[],createElement:element,body:{classList:{toggle(){}}},addEventListener:(n,fn)=>events[n]=fn},
 window:{addEventListener:(n,fn)=>events[n]=fn},location:{hostname:'localhost',hash:''},
 localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
 Audio:class{addEventListener(){}pause(){}},Option:class{},setInterval(){},setTimeout:fn=>fn(),
 fetch:async()=>({ok:true,json:async()=>({configured:false,provider:'openai',model:''})}),
 navigator:{mediaDevices:{getUserMedia:async()=>{if(cameraMode==='deny')throw Object.assign(Error(),{name:'NotAllowedError'});if(cameraMode==='pending')return new Promise(r=>pendingCamera=r);return media();}}},
 confirm:()=>true,matchMedia:()=>({matches:false,addEventListener(){}}),crypto:{randomUUID:()=>String(Math.random())},console
});
vm.runInContext(await fs.readFile(new URL('static/session.js',root),'utf8'),context);
vm.runInContext(await fs.readFile(new URL('static/app.js',root),'utf8'),context);
function start(){get('topic').value='test';get('goal').value='Read biology';get('duration').value='1';get('sound').value='off';get('setup-form').listeners.submit({preventDefault(){}});}
start();await get('camera-toggle').listeners.click();assert.match(get('camera-status').textContent,/denied/);
cameraMode='allow';await get('camera-toggle').listeners.click();assert.equal(get('camera-preview').hidden,false);await get('camera-toggle').listeners.click();assert.equal(stops,1);assert.equal(get('camera-preview').hidden,true);
await get('camera-toggle').listeners.click();get('end').listeners.click();assert.equal(stops,2);assert.equal(get('camera-video').srcObject,null);assert.match(get('page-title').textContent,/summary/);
start();cameraMode='pending';const request=get('camera-toggle').listeners.click();get('end').listeners.click();pendingCamera(media());await request;assert.equal(stops,3);assert.equal(get('camera-preview').hidden,true);
start();cameraMode='allow';await get('camera-toggle').listeners.click();events.pagehide();assert.equal(stops,4);
console.log('Camera rejection, close, end, pending permission and pagehide release passed.');
// Event grouping never crosses a conversation or a 30-second gap.
vm.runInContext(`stream.messages=[];saveMessage('mochi','♡','liked the stream ♡','event');saveMessage('pixelpuff','☾','liked the stream ♡','event');`,context);
let rows=get('messages').children;
assert.equal(rows.length,1);assert.match(rows[0].className,/chat-event/);assert.equal(rows[0].children.some(c=>c.className==='chat-avatar'),false);assert.equal(rows[0].children.find(c=>c.className==='event-count').textContent,'×2');
vm.runInContext(`saveMessage('you','✿','Working on chapter three','user');saveMessage('mochi','♡','liked the stream ♡','event');`,context);
rows=get('messages').children;assert.equal(rows.length,3);assert.match(rows[1].className,/message user/);assert.equal(rows[1].children[0].className,'chat-avatar');
vm.runInContext(`stream.messages.at(-1).at=Date.now()-31000;saveMessage('mochi','♡','liked the stream ♡','event');saveMessage('mochi','♡','how’s it going?','viewer');saveMessage('mochi','♡','sent a virtual star ✦','gift');`,context);
rows=get('messages').children;assert.equal(rows.length,6);assert.equal(rows[4].children[1].children[1].className,'bubble');assert.match(rows[5].className,/chat-event-gift/);
get('messages').scrollHeight=1000;get('messages').clientHeight=100;get('messages').scrollTop=120;
vm.runInContext(`saveMessage('mochi','♡','joined the room','event');`,context);assert.equal(get('messages').scrollTop,120);
console.log('Event styling, adjacent grouping, chronological boundaries and scroll retention passed.');
assert.equal(vm.runInContext('new Set(people.map(p=>p.avatar)).size',context),12);
vm.runInContext("stream.messages=[{kind:'viewer',name:'mochi'},{kind:'viewer',name:'nova'}];",context);
assert.equal(vm.runInContext("['mochi','nova'].includes(nextViewer().name)",context),false);
console.log('Varied viewer selection passed.');
// Completion reactions use the model response or an explicitly labeled demo fallback.
let taskCalls=[];
context.fetch=async(path,options)=>{taskCalls.push(JSON.parse(options.body));return {ok:true,json:async()=>({reply:'Chapter three in the bag! ✦',mode:'AI'})};};
vm.runInContext("stream.tasks=[{text:'Review chapter three',done:true,replyRevision:1}];queueTaskReaction(stream.tasks[0]);",context);await vm.runInContext('taskReplyQueue',context);
assert.equal(taskCalls[0].event,'task_completed');assert.equal(taskCalls[0].task,'Review chapter three');assert.equal(vm.runInContext('stream.messages.at(-1).source',context),'MODEL');
context.fetch=async()=>{throw Error('offline');};
vm.runInContext('queueTaskReaction(stream.tasks[0]);',context);await vm.runInContext('taskReplyQueue',context);
assert.equal(vm.runInContext('stream.messages.at(-1).source',context),'DEMO');assert.equal(vm.runInContext("stream.messages.at(-2).text.includes('demo response')",context),true);
// Visual bursts are independent of model calls and bounded during repeated clicks.
context.setTimeout=()=>0;get('floating-reactions').replaceChildren();
vm.runInContext("stream.reduceMotion=false;floatReactions('feedback');",context);assert.ok(get('floating-reactions').children.length>=3&&get('floating-reactions').children.length<=4);
get('floating-reactions').replaceChildren();vm.runInContext("floatReactions('task');",context);assert.ok(get('floating-reactions').children.length>=8);
vm.runInContext("for(let i=0;i<10;i++)floatReactions('task');",context);assert.equal(get('floating-reactions').children.length,16);
get('floating-reactions').replaceChildren();vm.runInContext("stream.reduceMotion=true;floatReactions('task');celebrate(true);",context);assert.equal(get('floating-reactions').children.length,0);assert.equal(get('confetti').children.length,0);
vm.runInContext('celebrate(false);',context);assert.equal(get('confetti').children.length,34);
console.log('Task model/demo responses, graded celebration limits and reduced motion passed.');
