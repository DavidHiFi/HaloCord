// Voice effects for the HaloCord mic engine. Ported from StreamEnhancer's
// micEffects.ts and microphone.ts (Copyright (c) 2026 Vendicated and contributors,
// GPL-3.0-or-later). Injected into the userscript closure, so Q (settings) and
// e4() (save and sync) are in scope. The effect path reads Q on every buffer, so
// slider moves are heard without rebuilding the chain.
var mcFxKeys=['micFxPitch','micFxBoost','micFxEcho','micFxRing','micFxCrush','micFxMuffle','micFxBass','micFxResonance','micFxStatic','micFxDropout','micFxClip'];
var mcFxPresets=[
  ['none','None',{}],
  ['robot','Robot / 8-bit',{micFxRing:80,micFxCrush:50,micFxClip:30,micFxBoost:25,micFxMuffle:15}],
  ['deep','Deep Voice',{micFxPitch:-35,micFxBoost:40,micFxBass:100,micFxResonance:60,micFxMuffle:60}],
  ['echo','Echo Chamber',{micFxEcho:70,micFxBoost:15,micFxMuffle:35,micFxCrush:20}],
  ['static','Radio Static',{micFxStatic:100,micFxDropout:95,micFxCrush:80,micFxClip:70,micFxMuffle:70,micFxBoost:10}],
  ['demon','Demon',{micFxPitch:-20,micFxBoost:65,micFxBass:95,micFxResonance:100,micFxCrush:45,micFxStatic:18,micFxDropout:20,micFxClip:100,micFxMuffle:85}],
  ['telephone','Telephone',{micFxBoost:8,micFxCrush:38,micFxClip:55,micFxStatic:10,micFxDropout:4,micFxMuffle:82}],
  ['underwater','Underwater',{micFxPitch:-10,micFxBoost:18,micFxBass:35,micFxResonance:35,micFxEcho:30,micFxMuffle:92,micFxCrush:20}],
  ['glitch','Glitch',{micFxBoost:22,micFxBass:5,micFxResonance:10,micFxCrush:100,micFxRing:30,micFxMuffle:48,micFxStatic:52,micFxDropout:100,micFxClip:92}],
  ['bullhorn','Bullhorn',{micFxBoost:70,micFxCrush:28,micFxMuffle:58,micFxStatic:6,micFxClip:85}],
  ['chipmunk','Chipmunk',{micFxPitch:70,micFxBoost:20}]
];
function mcFxNum(k){var v=Number(Q[k]);return isFinite(v)?v:0;}
function mcFxActive(){if(!Q['micFxOn'])return false;for(var i=0;i<mcFxKeys.length;i++)if(mcFxNum(mcFxKeys[i])!==0)return true;return false;}
// The sample engine only covers pitch, echo, ring and the finish stage; bass,
// resonance and muffle run on the filters around it.
function mcFxEngineActive(){var k=['micFxPitch','micFxEcho','micFxRing','micFxStatic','micFxDropout','micFxCrush','micFxClip','micFxBoost'];for(var i=0;i<k.length;i++)if(mcFxNum(k[i])!==0)return true;return false;}
function mcFxClamp(v,a,b){return Math.min(b,Math.max(a,v));}
function mcFxParams(){
  var crush=mcFxNum('micFxCrush'),echo=mcFxNum('micFxEcho'),bits=Math.round(16-crush/100*12);
  return{
    pitchRatio:Math.pow(2,mcFxClamp(mcFxNum('micFxPitch'),-100,100)/100),
    echoMix:echo/100*0.6,echoFeedback:0.2+echo/100*0.45,
    ringMix:mcFxNum('micFxRing')/100,
    gateThreshold:0.02,
    dropoutChance:mcFxClamp(mcFxNum('micFxDropout')/100*0.5,0,0.9),
    staticLevel:mcFxNum('micFxStatic')/100*0.08,
    crushStep:crush>0?2/Math.pow(2,bits):0,
    clipLimit:1-mcFxNum('micFxClip')/100*0.75,
    makeupGain:1+mcFxNum('micFxBoost')/100*2
  };
}
function mcFxEngine(rate,seed){
  var pw=mcFxClamp(Math.round(0.04*rate),64,4096),pb=new Float32Array(8192),pm=8191,pwr=0,pph=0;
  var ed=Math.max(1,Math.round(0.28*rate)),es=1;while(es<ed+1)es*=2;var eb=new Float32Array(es),em=es-1,ew=0;
  var rs=2*Math.PI*55/rate,rp=0;
  var rel=Math.exp(-1/(0.04*rate)),hold=Math.max(1,Math.round(640/48000*rate)),env=0,hc=0,drop=false,rnd=seed||1;
  function random(){rnd=(rnd*16807)%2147483647;return rnd/2147483647;}
  function readP(d){var p=pwr-d,i=Math.floor(p),f=p-i,a=pb[i&pm],b=pb[(i+1)&pm];return a+(b-a)*f;}
  function pitch(x,r){pb[pwr]=x;pph+=(1-r)/pw;if(pph<0)pph+=1;else if(pph>=1)pph-=1;var o=pph<0.5?pph+0.5:pph-0.5,g=Math.pow(Math.sin(Math.PI*pph),2),og=Math.pow(Math.sin(Math.PI*o),2),y=readP(pph*pw)*g+readP(o*pw)*og;pwr=(pwr+1)&pm;return y;}
  function echo(x,m,fb){var d=eb[(ew-ed)&em];eb[ew]=x+d*fb;ew=(ew+1)&em;return x+d*m;}
  function ring(x,m){var c=Math.sin(rp);rp+=rs;if(rp>=2*Math.PI)rp-=2*Math.PI;return x*(1-m+m*c);}
  function finish(x,p){var mag=Math.abs(x);env=mag>env?mag:env*rel;if(hc<=0){hc=hold;drop=random()<p.dropoutChance;}hc--;var open=!drop&&env>=p.gateThreshold,v=open?x:0;if(open&&p.staticLevel>0)v+=(random()*2-1)*p.staticLevel;if(p.crushStep>0)v=Math.round(v/p.crushStep)*p.crushStep;return mcFxClamp(v*p.makeupGain,-p.clipLimit,p.clipLimit);}
  return{process:function(inp,out,p){var pe=p.pitchRatio!==1,ee=p.echoMix>0,re=p.ringMix>0;for(var i=0;i<inp.length;i++){var s=inp[i];if(pe)s=pitch(s,p.pitchRatio);if(ee)s=echo(s,p.echoMix,p.echoFeedback);if(re)s=ring(s,p.ringMix);out[i]=finish(s,p);}}};
}
// src -> dry -> out, and src -> band limit -> soft clip -> engine -> bass shelf -> limiter -> wet -> out.
function mcFxAttach(ctx,src){
  var out=ctx['createGain'](),dry=ctx['createGain'](),wet=ctx['createGain'](),hp=ctx['createBiquadFilter'](),lp=ctx['createBiquadFilter'](),sh=ctx['createWaveShaper'](),shelf=ctx['createBiquadFilter'](),lim=ctx['createDynamicsCompressor']();
  var size=ctx['sampleRate']<16000?512:2048,proc=ctx['createScriptProcessor'](size,2,2),eng=mcFxEngine(ctx['sampleRate'],1),mono=new Float32Array(size),done=new Float32Array(size);
  var curve=new Float32Array(1024);for(var i=0;i<1024;i++){var x=i/1023*2-1;curve[i]=Math.tanh(x)/Math.tanh(1);}
  hp['type']='highpass';hp['Q']['value']=0.7;lp['type']='lowpass';lp['Q']['value']=0.7;sh['curve']=curve;sh['oversample']='2x';
  shelf['type']='lowshelf';shelf['frequency']['value']=180;
  lim['threshold']['value']=-12;lim['knee']['value']=6;lim['ratio']['value']=12;lim['attack']['value']=0.003;lim['release']['value']=0.15;
  function sync(on){
    dry['gain']['value']=on?0:1;wet['gain']['value']=on?1:0;
    var muffle=mcFxNum('micFxMuffle');
    // Muffle 0 keeps the full band, so pitch or echo alone do not sound like a phone line.
    hp['frequency']['value']=muffle>0?200:20;lp['frequency']['value']=muffle>0?3600-muffle*24:20000;
    shelf['gain']['value']=on?mcFxNum('micFxBass')/4:0;shelf['Q']['value']=0.7+mcFxNum('micFxResonance')/20;
  }
  proc['onaudioprocess']=function(ev){
    var ib=ev['inputBuffer'],ob=ev['outputBuffer'],l=ib['getChannelData'](0),r=ib['numberOfChannels']>1?ib['getChannelData'](1):l,lo=ob['getChannelData'](0),ro=ob['numberOfChannels']>1?ob['getChannelData'](1):lo;
    var on=mcFxActive();sync(on);
    if(!on){lo.fill(0);ro.fill(0);return;}
    if(mono.length!==l.length){mono=new Float32Array(l.length);done=new Float32Array(l.length);}
    for(var i=0;i<l.length;i++)mono[i]=(l[i]+r[i])*0.5;
    if(mcFxEngineActive())eng.process(mono,done,mcFxParams());else done.set(mono);
    for(var j=0;j<lo.length;j++){lo[j]=done[j];ro[j]=done[j];}
    out['mcFxProcessed']=(out['mcFxProcessed']||0)+1;
  };
  src['connect'](dry);dry['connect'](out);
  src['connect'](hp);hp['connect'](lp);lp['connect'](sh);sh['connect'](proc);proc['connect'](shelf);shelf['connect'](lim);lim['connect'](wet);wet['connect'](out);
  sync(mcFxActive());
  out['mcFxProc']=proc;
  return out;
}
function mcFxPanel(QP,Qr){
  var box=document['createElement']('div');box['id']='mc-fx-card';
  box['style']['cssText']='margin-top:12px;padding:12px 12px 6px;border:1px solid var(--hc-panel-border);border-radius:8px;background:var(--hc-panel-bg)';
  var head=document['createElement']('div');head['style']['cssText']='display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px';
  var hl=document['createElement']('div'),t=document['createElement']('div'),s=document['createElement']('div');
  t['className']='dvx-lbl';t['textContent']='Voice Effects';
  s['className']='dvx-sub';s['textContent']='Changes how you sound to everyone in the call: pitch, echo, robot, radio and more. Pick a preset, then fine-tune it below. Applies live and shows in your mic test.';
  hl['appendChild'](t);hl['appendChild'](s);head['appendChild'](hl);
  var body=document['createElement']('div'),sliders=[],chips=[];
  function paintBody(){body['style']['opacity']=Q['micFxOn']?'1':'.45';}
  var sw=QP(function(){return!!Q['micFxOn'];},function(v){Q['micFxOn']=!!v;e4();sw['_render']();paintBody();});
  head['appendChild'](sw);box['appendChild'](head);box['appendChild'](body);
  function paintChips(){for(var i=0;i<chips.length;i++){var on=chips[i][0]===Q['micFxPreset'];chips[i][1]['style']['borderColor']=on?'var(--hc-accent)':'var(--hc-row-border)';chips[i][1]['style']['color']=on?'var(--hc-accent)':'var(--hc-text)';chips[i][1]['setAttribute']('aria-pressed',on?'true':'false');}}
  function label(txt){var d=document['createElement']('div');d['className']='dvx-sub';d['style']['cssText']='margin:14px 0 6px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase';d['textContent']=txt;return d;}
  body['appendChild'](label('Presets'));
  var row=document['createElement']('div');row['style']['cssText']='display:flex;gap:8px;flex-wrap:wrap';
  mcFxPresets['forEach'](function(p){
    var b=document['createElement']('button');b['type']='button';b['textContent']=p[1];
    b['className']='dvx-chip';b['style']['cssText']='flex:1 1 110px;min-width:100px;padding:8px 10px;border:1px solid var(--hc-row-border);border-radius:8px;background:var(--hc-row-bg);color:var(--hc-text);font-size:12px;font-weight:600;cursor:pointer';
    b['onclick']=function(){
      for(var i=0;i<mcFxKeys.length;i++)Q[mcFxKeys[i]]=0;
      for(var k in p[2])Q[k]=p[2][k];
      Q['micFxPreset']=p[0];Q['micFxOn']=p[0]!=='none';
      e4();sw['_render']();paintBody();paintChips();for(var j=0;j<sliders.length;j++)sliders[j]();
    };
    chips['push']([p[0],b]);row['appendChild'](b);
  });
  body['appendChild'](row);
  function custom(){if(Q['micFxPreset']!=='custom'){Q['micFxPreset']='custom';paintChips();}if(!Q['micFxOn']){Q['micFxOn']=true;sw['_render']();paintBody();}}
  function slider(key,name,desc,min,max,unit){
    var w=document['createElement']('div');w['className']='dvx-slider-wrap';
    var top=document['createElement']('div');top['className']='dvx-slider-top';
    var l=document['createElement']('div'),ln=document['createElement']('div'),ld=document['createElement']('div');
    ln['className']='dvx-lbl';ln['textContent']=name;ld['className']='dvx-sub';ld['textContent']=desc;l['appendChild'](ln);l['appendChild'](ld);
    var v=document['createElement']('span');v['className']='dvx-val';
    top['appendChild'](l);top['appendChild'](v);
    var r=document['createElement']('input');r['type']='range';r['min']=String(min);r['max']=String(max);r['step']='1';r['setAttribute']('aria-label',name);
    function show(){var n=mcFxNum(key);r['value']=String(n);v['textContent']=(n>0&&min<0?'+':'')+n+unit;var pc=(n-min)/(max-min)*100;r['style']['background']='linear-gradient(to right,var(--hc-accent) '+pc+'%,var(--dvx-track) '+pc+'%)';}
    r['oninput']=function(){Q[key]=Number(r['value']);custom();show();e4();};
    w['appendChild'](top);w['appendChild'](r);show();sliders['push'](show);return w;
  }
  body['appendChild'](label('Voice'));
  body['appendChild'](slider('micFxPitch','Pitch','Below 0 is deeper, above 0 is higher. +100 is one octave up.',-50,100,'%'));
  body['appendChild'](slider('micFxBoost','Amplifier','Pushes your voice louder and harder into the effects.',0,100,'%'));
  body['appendChild'](label('Space'));
  body['appendChild'](slider('micFxEcho','Echo','A repeating echo, like a large hall.',0,100,'%'));
  body['appendChild'](label('Character'));
  body['appendChild'](slider('micFxRing','Robot','Metallic ring modulation for a robot voice.',0,100,'%'));
  body['appendChild'](slider('micFxCrush','Bitcrush','Lowers the audio resolution for a crunchy 8-bit sound.',0,100,'%'));
  body['appendChild'](slider('micFxMuffle','Muffle','Narrows the sound like a phone or radio.',0,100,'%'));
  body['appendChild'](slider('micFxBass','Bass boost','Adds weight to the low end.',0,100,'%'));
  body['appendChild'](slider('micFxResonance','Bass resonance','Makes the bass boost boomier.',0,100,'%'));
  body['appendChild'](label('Signal damage'));
  body['appendChild'](slider('micFxStatic','Static','Adds radio hiss while you talk.',0,100,'%'));
  body['appendChild'](slider('micFxDropout','Dropouts','Randomly cuts short pieces of your voice, like a bad connection.',0,100,'%'));
  body['appendChild'](slider('micFxClip','Clipping','Hard distortion, like a blown-out mic.',0,100,'%'));
  var resetRow=document['createElement']('div');resetRow['style']['cssText']='display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:10px 0 6px';
  var reset=document['createElement']('button');reset['type']='button';reset['className']='dvx-btn dvx-danger';
  reset['innerHTML']='<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2 1 21h22L12 2Zm1 15h-2v-2h2v2Zm0-4h-2V9h2v4Z"/></svg><span>Turn off and reset effects</span>';
  function resetNow(){chips[0][1]['onclick']();}
  reset['onclick']=function(){
    if(Q['micFxAskReset']===false){resetNow();return;}
    var opts={title:'Reset voice effects?',body:'Voice Effects turn off and every effect slider goes back to 0.',confirmText:'Reset',danger:true},ui=window['HaloCordUI'];
    if(ui&&typeof ui['confirm']==='function'){Promise['resolve'](ui['confirm'](opts))['then'](function(ok){if(ok)resetNow();},function(){});return;}
    if(window['confirm'](opts['title']+'\n\n'+opts['body']))resetNow();
  };
  var askL=document['createElement']('span');askL['className']='dvx-sub';askL['style']['margin']='0 0 0 6px';askL['textContent']='Ask first';
  var askSw=QP(function(){return Q['micFxAskReset']!==false;},function(v){Q['micFxAskReset']=!!v;e4();});askSw['setAttribute']('aria-label','Ask before resetting effects');
  resetRow['appendChild'](reset);resetRow['appendChild'](askL);resetRow['appendChild'](askSw);
  body['appendChild'](resetRow);
  paintBody();paintChips();
  return box;
}
