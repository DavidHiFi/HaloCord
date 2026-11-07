// @license      MIT | Copyright (c) 2026 Kurtzon (Kurtzon Audio)
(function(){'use strict';if(window['__acStereoLoaded'])return;try{window['__acStereoLoaded']=!![];}catch(Gu){}function __kcT(f,d){var l=0,t=0;return function(){var n=Date['now'](),w=d-(n-l);if(w<=0){l=n;if(t){clearTimeout(t);t=0}try{f()}catch(__e){}}else if(!t){t=setTimeout(function(){t=0;l=Date['now']();try{f()}catch(__e){}},w)}}}var __kcQvT=0;(function(){var Gc=[/Pasting anything in here/i,/someone told you to copy/i,/chance you.?re being scammed/i,/%c\s*Wait!/i,/\[PostMessageTransport\] Protocol error/i,/duplicate listener CONTEXT_MENU_CLOSE/i,/getCodecSurvey is not implemented/i];['log','warn','error','info']['forEach'](function(GN){var Gl=console[GN]?console[GN]['bind'](console):function(){};console[GN]=function(){try{var Gs='';for(var Gw=-0xf02+-0x1c*-0x53+0x5ee;Gw<arguments['length'];Gw++){if(typeof arguments[Gw]==='string')Gs+=arguments[Gw]+'\x20';}if(Gc['some'](function(GF){return GF['test'](Gs);}))return;}catch(GF){}return Gl['apply'](console,arguments);};});}()),(function(){try{if(typeof window['Notification']==='function'){try{Object['defineProperty'](window['Notification'],'permission',{'configurable':!![],'get':function(){return'granted';}});}catch(Gc){}window['Notification']['requestPermission']=function(GN){if(typeof GN==='function')try{GN('granted');}catch(Gl){}return Promise['resolve']('granted');};}}catch(GN){}}());var Q={'stereo':!![],'codec':'opus','maxaveragebitrate':0x7c830,'maxplaybackrate':0xbb80,'echoCancellation':![],'noiseSuppression':![],'autoGainControl':![],'micGain':1,'outBoost':1,'secondaryMic':![],'secondaryMicDevice':'','secondaryMicGain':1,'thirdMic':![],'thirdMicDevice':'','thirdMicGain':1,'secondarySpeaker':![],'secondarySpeakerDevice':'','secondarySpeakerGain':1,'thirdSpeaker':![],'thirdSpeakerDevice':'','thirdSpeakerGain':1,'micOff':![],'speakerOff':![],'micPan':0,'speakerPan':0,'secondaryMicPan':0,'thirdMicPan':0,'secondarySpeakerPan':0,'thirdSpeakerPan':0,'micTestSource':'main','micTestDeafen':!![],'micTestDeafenMode':'deafen','micFxAskReset':!![],'nativeAudio':![],'micReverb':0,'micReverbSize':2,'micReverbTone':7000,'micRate':0,'vstEnabled':![],'vstChain':'','vst2Enabled':![],'vst2Chain':'','eqEnabled':![],'eqQ':1,'limOn':![],'limTarget':'both','limMode':'clean','limCeil':-1,'limGain':0,'limRel':100,'eqBands':'','priority':'high','networkPriority':'high','adaptivePtime':![],'opusHighBitrate':![],'bit24':![],'inbandFec':!![],'opusFecDefaultOnBuild':'','opusDtx':![],'opusCbr':!![],'opusMinptime':0xa,'opusMaxptime':0x3c,'opusComplexity':0xa,'opusSpropMaxcapturerate':0xbb80,'noPushToTalk':![],'telemetry':!![],'voiceMeter':![],'bypassInputProcessing':![],'directMode':![],'directBitrate':0x7c830,'directSampleRate':0xbb80,'directChannels':0x2,'directPtime':0xa,'directCbr':!![],'directComplexity':0xa,'directBitDepth':0x10,'videoHD':![],'videoHDUserSet':![],'videoHDDefaultOffBuild':'','vW':0x780,'vH':0x438,'vFps':0x3c,'vbMin':0x1e8480,'vbTarget':0x7a1200,'vbMax':0xb71b00,'videoGoLive':![],'screenShareAdvanced':![],'screenShareRes':0x438,'screenShareFps':0x3c,'screenShareBitrate':0x7a1200,'screenShareMode':'quality','spatialEnabled':![],'spatialSpread':0x78,'spatialDistance':1.2,'spatialElevation':0x0,'spatialRotation':0x0,'spatialProfile':0x0,'spatialGain':0x0,'spatialBalance':0x0,'spatialSwap':![],'spatialMaxObjects':0x8,'spatialOrder':0x3,'spatialInput':![],'uiAccent':'#AFE37F'},G={'channelCount':0x2,'sampleRate':0xbb80,'sampleSize':0x10,'usedtx':![],'useinbandfec':!![],'cbr':!![],'minptime':0xa,'maxptime':0x3c,'complexity':0xa,'spropmaxcapturerate':0xbb80,'bypassAudioWorklet':![],'replaceProcessedTrack':!![]},n='2.57.2-advid-default-off',L='2.58.3-fec-default-on',a='-',b=![];try{b=!!window['opener'];}catch(Gc){}var H=![];var qFrame=null;function q(){try{if(!qFrame||!qFrame['isConnected']){qFrame=document['createElement']('iframe');qFrame['style']['display']='none';(document['documentElement']||document['body'])['appendChild'](qFrame);}return{'s':qFrame['contentWindow']['localStorage'],'done':function(){}};}catch(Gl){return null;}}function R(GN){try{var Gl=localStorage['getItem'](GN);if(Gl!=null)return Gl;}catch(GF){}var Gs=q();if(Gs)try{var Gw=Gs['s']['getItem'](GN);return Gs['done'](),Gw;}catch(GA){Gs['done']();}return null;}function i(GN,Gl){try{return localStorage['setItem'](GN,Gl),!![];}catch(Gw){}var Gs=q();if(Gs)try{return Gs['s']['setItem'](GN,Gl),Gs['done'](),!![];}catch(GF){Gs['done']();}return![];}function o(){var GN={};try{var Gl=JSON['parse'](R('discord-stereo-config'));if(Gl&&typeof Gl==='object')GN=Gl;}catch(Gs){}Object['keys'](Q)['forEach'](function(Gw){GN[Gw]=Q[Gw];}),i('discord-stereo-config',JSON['stringify'](GN));}try{var V=JSON['parse'](R('discord-stereo-config'));if(V)Object['keys'](V)['forEach'](function(GN){if(Q['hasOwnProperty'](GN))Q[GN]=V[GN];});(!V||!V['videoHDUserSet'])&&(Q['videoHD']=![],Q['videoHDUserSet']=![],Q['videoHDDefaultOffBuild']=n,H=!![]),Q['videoHDDefaultOffBuild']=n,(!V||V['opusFecDefaultOnBuild']!==L)&&(Q['inbandFec']=!![],Q['opusFecDefaultOnBuild']=L,H=!![]);}catch(GN){Q['videoHD']=![],Q['videoHDUserSet']=![],Q['videoHDDefaultOffBuild']=n,Q['inbandFec']=!![],Q['opusFecDefaultOnBuild']=L,H=!![];}function X(Gl,Gs){var Gw=Number(Q[Gl]);if(!isFinite(Gw)||Gw<=0xcc0+-0x93b*0x2+-0x2*-0x2db)Gw=Gs;Q[Gl]!==Gw&&(Q[Gl]=Gw,H=!![]);}function h(Gl,Gs){var Gw=Q[Gl],GF;if(Gw===!![]||Gw==='true'||Gw===0xf59*-0x1+0x1*0x16f1+-0x797*0x1||Gw==='1')GF=!![];else{if(Gw===![]||Gw==='false'||Gw===0x5*-0x4f8+-0x1210+0x2ae8*0x1||Gw==='0')GF=![];else GF=!!Gs;}return Q[Gl]!==GF&&(Q[Gl]=GF,H=!![]),GF;}function D(Gl,Gs,Gw,GF){var GA=Number(Q[Gl]);if(!isFinite(GA))GA=Gs;GA=Math['round'](GA);if(GA<Gw)GA=Gw;if(GA>GF)GA=GF;return Q[Gl]!==GA&&(Q[Gl]=GA,H=!![]),GA;}function S(Gl,Gs,Gw){var GF=Number(Q[Gl]);if(!isFinite(GF)||Gw['indexOf'](GF)<-0x1a9*0x11+-0x3f*0x4d+0x2f2c)GF=Gs;return Q[Gl]!==GF&&(Q[Gl]=GF,H=!![]),GF;}function E(){G['useinbandfec']=!!Q['inbandFec'],G['usedtx']=!!Q['opusDtx'],G['cbr']=!!Q['opusCbr'],G['minptime']=Number(Q['opusMinptime'])||0x4*0x878+0xe*-0x107+-0x1374,G['maxptime']=Number(Q['opusMaxptime'])||0x1a*-0x139+-0x5*-0x1a5+0x17cd,G['complexity']=Number(Q['opusComplexity']);if(!isFinite(G['complexity']))G['complexity']=-0x1*-0x1bd7+0xf*-0x71+0xa97*-0x2;G['spropmaxcapturerate']=Number(Q['maxplaybackrate'])||48e3;}function j(){return 510000;}function W(Gl,Gs,Gw){if(Q[Gl]!==Gs){Q[Gl]=Gs;if(Gw)H=!![];return!![];}return![];}function v(Gl){if(!Q['opusHighBitrate'])return![];var Gs=![];return Gs=W('bit24',![],Gl)||Gs,Gs=W('stereo',!![],Gl)||Gs,Gs=W('opusCbr',!![],Gl)||Gs,Gs=W('opusDtx',![],Gl)||Gs,Gs=W('adaptivePtime',![],Gl)||Gs,Gs=W('opusMinptime',0x566*-0x2+0x13e0+-0x90a,Gl)||Gs,Gs=W('opusMaxptime',0xa06+-0x1*0x20c2+0x48e*0x5,Gl)||Gs,E(),Gs;}function I(){Q['stereo']=h('stereo',!![]),X('maxaveragebitrate',0x295*0x217+0x1*0x10807+0x15ac6),X('maxplaybackrate',-0x448f+0x1063f+-0x630),Q['maxplaybackrate']>48e3&&(Q['maxplaybackrate']=48e3,H=!![]),Number(Q['micRate'])>96e3&&(Q['micRate']=96e3,H=!![]),X('vW',-0x2084*-0x1+-0xd54+-0xbb0),X('vH',0x2342*-0x1+-0x7d4+0x2f4e),X('vFps',0xb*-0x27d+0x68e+0x150d),X('vbMin',0x1e8480),X('vbTarget',0x7a1200),X('vbMax',0xb71b00),Q['screenShareAdvanced']=![],Q['videoGoLive']=![],S('screenShareRes',0x4*0x17b+0x1a19+0x1*-0x1bcd,[-0x711+-0x17d5*-0x1+0x26*-0x5e,0x1*-0xa82+-0x35*0x1b+-0x7*-0x2e7,-0xf3d+0x2*-0x874+0x25c5,0x208a+0x270b+-0x3f25]),S('screenShareFps',0x12c+-0x1e*0x56+0x924,[-0x35*0x35+0x1cb1+-0x119a,-0x1d66+-0x17*0xf7+0x33d3,0x1a6+-0x7*0xa7+-0x33*-0x11]),D('screenShareBitrate',0x6baffe*0x1+0xb6de5a+-0xa87c58,-0xb89d4+0x234d0*0x7+-0xb5a64*-0x1,0xfef291*0x2+0x4f*0x5ea1b+0x1631*-0x9a7);['quality','latency']['indexOf'](String(Q['screenShareMode']))<-0x1*-0x208b+-0x1ef9+-0x192&&(Q['screenShareMode']='quality',H=!![]);S('opusMinptime',0x3*-0x319+0x31c+0x3*0x213,[0x21c+-0x1*0xa9f+-0x88d*-0x1,-0x1e9*0x7+-0x1*-0x24d4+-0x1761,0x19db*-0x1+-0xdc1*0x1+0x7f4*0x5,-0x238e+-0x1*-0x23d1+-0x7*0x1]),S('opusMaxptime',0x169e+0x15dc+-0x2c3e,[0x47*0x37+-0x23d4+0x149d*0x1,-0x212+-0xe97+-0x5*-0x359,-0xcb3+-0x5ef+0x12ca,0x129d*-0x1+-0x29f*0x5+-0x14*-0x199,-0x11b*0xf+0x32*-0x3b+0x1c93]);Q['opusMaxptime']<Q['opusMinptime']&&(Q['opusMaxptime']=Q['opusMinptime'],H=!![]);D('opusComplexity',-0x2141+0x159c*0x1+0x3e5*0x3,0x42e+0x546*-0x5+0x1630,0x2607+0x44*-0x68+-0x7*0x17b),S('opusSpropMaxcapturerate',-0x4b0d*0x4+-0x12769+0x30f1d*0x1,[0x2463+0x14e9*0x1+-0x4*0x683,0x5d4b+0x7*-0x5d3+-0x5a6,0x56f4+-0x1*0x1cab+-0x1*-0x437,0x764e*0x1+0x8e93+0x216d*-0x5,0x12882+-0x2c*0x2f+0x1*-0x64ee,0x17700]);[-0x14f7+0x12ff+0x202,-0x9*-0x13+-0x1*-0x1b5+-0x24c,-0x1*0x1bbc+-0xbaa+0x278e,0xf*0x1e1+0xcc4+-0x5d1*0x7]['indexOf'](Q['opusMinptime'])<-0x1688+-0x89*-0x26+0x2*0x119&&(Q['opusMinptime']=0x21f*0xe+0x2c*-0x2c+0x1c*-0xca,H=!![]);Q['inbandFec']=h('inbandFec',!![]),Q['opusDtx']=h('opusDtx',![]),Q['opusCbr']=h('opusCbr',!![]),Q['bit24']=(h('bit24',![]),![]),Q['opusHighBitrate']=h('opusHighBitrate',![]),Q['directMode']=h('directMode',![]),Q['bypassInputProcessing']=h('bypassInputProcessing',![]),D('directBitrate',-0x3f5a9+0x2c*0x2b56+0x44b11,-0x158f*-0x2+0x3*0x6d5+-0x282d,0xc3414+-0x55*-0xefe+0x8ea*0x17f),S('directSampleRate',-0x9d41+0x171a2+-0x84b*0x3,[0x149ed*0x1+-0x2*-0xa264+0x13*-0x1897,0x7e2*0x1c+0x7*0x24c6+-0x6722*0x1]),S('directChannels',-0x1*0x884+-0x22c*-0x7+-0x6ae,[-0x15c+0x1*0x157d+-0x284*0x8,-0x2474+-0x216d*-0x1+0x309,0x6*0x211+-0x53*-0x1e+-0x161c,-0x1*0x20d2+0x48*-0x59+-0x1*-0x39e0,0x19e4+0x1f8e+-0x396a]),S('directBitDepth',-0x8*0x478+0x207+0x5d*0x5d,[0x1*-0x54a+0x2a*0xc4+-0x1ace,-0x70+-0x7a*0x31+-0x2*-0xbf1,-0x2405+0x19c8+0x7*0x17b]),S('directPtime',0xb86+0x1dfc+0x2978*-0x1,[-0x7c*0x1b+-0x1517*0x1+0x2235,-0x2a9+-0x66f+0x92c]),Q['directCbr']=h('directCbr',!![]),D('directComplexity',-0x176*-0xe+-0x1*0x19c7+-0x55d*-0x1,0x175a+0xa75*-0x1+-0xce5,0x1f17+-0x37*-0xd+-0x169*0x18),v(!![]);var Gl=j();Q['maxaveragebitrate']>Gl&&(Q['maxaveragebitrate']=Gl,H=!![]);Q['spatialEnabled']=h('spatialEnabled',![]),Q['spatialSwap']=h('spatialSwap',![]),Q['spatialInput']=h('spatialInput',![]);!Q['stereo']&&Q['spatialInput']&&(Q['spatialInput']=![],H=!![]);var Gs=Number(Q['spatialSpread']);if(!isFinite(Gs))Gs=0x984*-0x4+-0xfe1+-0x1223*-0x3;Q['spatialSpread']=Math['max'](-0x166b+0x4*0x540+-0x79*-0x3,Math['min'](-0x19d5+-0x18e*0x2+0x1da5,Gs));var Gw=Number(Q['spatialDistance']);if(!isFinite(Gw))Gw=0xb42+-0x15cb+-0x545*-0x2+0.19999999999999996;Q['spatialDistance']=Math['max'](0xee1+0x13*-0x23+0x1*-0xc48+0.5,Math['min'](-0x43*0x43+0x5*0x455+-0x418,Gw));var GF=Number(Q['spatialElevation']);if(!isFinite(GF))GF=0x265a+-0x223*0x8+-0x1542;Q['spatialElevation']=Math['max'](-(-0x3d+-0x1b6b+0xef*0x1e),Math['min'](-0xc61*-0x2+0xd*0x15c+-0x2a14,GF));var GA=Number(Q['spatialRotation']);if(!isFinite(GA))GA=0x1edb+0x4d6+-0x23b1;Q['spatialRotation']=Math['max'](-(0x109d*-0x1+-0xb*-0x12d+-0x3*-0x158),Math['min'](-0x2088+0x22e8+0x25*-0xe,GA));var Gm=Number(Q['spatialGain']);if(!isFinite(Gm))Gm=-0x2597*-0x1+-0x2*-0x76d+0x37f*-0xf;Q['spatialGain']=Math['max'](-(0x2709+0x59e*0x1+-0x2c9b),Math['min'](-0x1895*-0x1+0x1*-0x268d+0xdfa,Gm));var GO=Number(Q['spatialBalance']);if(!isFinite(GO))GO=0x542*0x2+-0x17ca+0xd46;Q['spatialBalance']=Math['max'](-(-0x1f4f+-0x5*-0x3ef+0xc08),Math['min'](0x1*-0x241f+-0x2*-0x1d6+0x20d7,GO));var Gz=Math['round'](Number(Q['spatialProfile']));if(!isFinite(Gz)||Gz<0x194f+0x4*0x1b8+0x1*-0x202f||Gz>0x6*-0x63a+0x1*0x49d+0x20c1)Gz=-0x1e8f*0x1+-0x2ea*-0x2+-0x1*-0x18bb;Q['spatialProfile']=Gz;var GZ=Math['round'](Number(Q['spatialMaxObjects']));if(!isFinite(GZ))GZ=-0x1393+-0xd09+-0x829*-0x4;Q['spatialMaxObjects']=Math['max'](-0x1cc2+0x1075*-0x1+0x2d38,Math['min'](-0x1af8*0x1+0x55*0x6a+0x56*-0x17,GZ));var Gd=Math['round'](Number(Q['spatialOrder']));if(!isFinite(Gd)||Gd<0x61a+0x2602+-0x2c1b||Gd>0xdfa+0x2f9*-0x1+-0xafd)Gd=0x19+-0x236b*0x1+0xc9*0x2d;Q['spatialOrder']=Gd,E();}function g(Gl,Gs){try{var Gw=typeof Gl==='string'?JSON['parse'](Gl):Gl;if(!Gw)return![];Object['keys'](Gw)['forEach'](function(GA){if(Q['hasOwnProperty'](GA))Q[GA]=Gw[GA];});var GF=H;return H=![],I(),Q['videoGoLive']=![],Gs&&H&&o(),H=GF||H,!![];}catch(GA){return![];}}function t(){var Gl=![];try{Gl=g(R('discord-stereo-config'),![]);}catch(Gs){}if(Gl){a='-';try{QD();}catch(Gw){}try{Qs();}catch(GF){}}}I();!b&&H&&o();if(!b){try{window['addEventListener']('storage',function(Gl){if(Gl&&Gl['key']==='discord-stereo-config')t();});}catch(Gl){}setInterval(t,0x3fd*0x5+-0x1af1+0x15d*0x8);}Q['videoGoLive']=![];var f=null,B=null,T=null,J=null,u=![];(function(){try{var Gs=XMLHttpRequest['prototype']['setRequestHeader'];XMLHttpRequest['prototype']['setRequestHeader']=function(GF,GA){try{if(!J&&GF&&String(GF)['toLowerCase']()==='authorization'&&GA)J=String(GA);}catch(Gm){}return Gs['apply'](this,arguments);};}catch(GF){}try{var Gw=window['fetch'];window['fetch']=function(GA,Gm){try{if(!J){var GO=Gm&&Gm['headers']||GA&&GA['headers'];if(GO){var Gz=typeof GO['get']==='function'?GO['get']('authorization')||GO['get']('Authorization'):GO['authorization']||GO['Authorization'];if(Gz)J=String(Gz);}}}catch(GZ){}return Gw['apply'](this,arguments);};}catch(GA){}}());function c(){if(T)return T;try{eM(function(Gs){if(T)return;try{if(Gs&&typeof Gs['getCurrentUser']==='function'){var Gw=Gs['getCurrentUser']();if(Gw&&Gw['id'])T=Gs;}}catch(GF){}});}catch(Gs){}return T;}function N(){if(J)return J;try{eM(function(Gs){if(J)return;try{if(Gs&&typeof Gs['getToken']==='function'){var Gw=Gs['getToken']();if(typeof Gw==='string'&&Gw['length']>0x25df+-0x21*0xf0+-0x6e5)J=Gw['replace'](/^"+|"+$/g,'');}}catch(GF){}});}catch(Gs){}return J;}function l(Gs){if(!Gs)return null;var Gw=Gs['username']?String(Gs['username']):null,GF=Gs['globalName']||Gs['global_name']||Gs['displayName']||Gs['display_name']||null;if(GF&&Gw&&GF!==Gw)return String(GF)+'\x20(@'+Gw+')';if(Gw&&Gs['discriminator']&&Gs['discriminator']!=='0')return Gw+'#'+Gs['discriminator'];return Gw||GF||null;}function s(Gs){if(!Gs)return;B=B||{};if(Gs['uid'])B['uid']=String(Gs['uid']);if(Gs['avatar'])B['avatar']=String(Gs['avatar']);if(Gs['username'])B['username']=String(Gs['username']);if(Gs['status'])B['status']=String(Gs['status']);}function w(Gs){Gs=String(Gs||'')['replace'](/\s+/g,'\x20')['trim']();if(!Gs)return null;var Gw=null,GF=/(Do Not Disturb|Invisible|Online|Idle|Offline)/i['exec'](Gs);GF&&(Gw=GF[-0x1028+-0xbf*0x22+0x2987]['replace'](/\b\w/g,function(GA){return GA['toUpperCase']();}),Gs=Gs['slice'](-0x180a+0x1*0x1931+0x3b*-0x5,GF['index'])['replace'](/\s+/g,'\x20')['trim']());if(!Gs||/^(mute|deafen|settings|user settings|set status)$/i['test'](Gs))return null;return{'username':Gs,'status':Gw};}function A(Gs){if(!Gs)return null;try{var Gw=null,GF=Gs['querySelectorAll']('[aria-label],[title]');for(var GA=-0x1*-0xa27+0x1ac4+-0x24eb;GA<GF['length'];GA++){var Gm=(GF[GA]['getAttribute']('aria-label')||GF[GA]['getAttribute']('title')||'')['replace'](/\s+/g,'\x20')['trim'](),GO=/\b(Do Not Disturb|Invisible|Online|Idle|Offline)\b/i['exec'](Gm);if(GO){Gw=GO[-0xb24*-0x2+-0x13b+-0x150c]['replace'](/\b\w/g,function(Gr){return Gr['toUpperCase']();});break;}}var Gz=['[data-text-variant*=\x22semibold\x22]','[class*=\x22username\x22]','[class*=\x22nameTag\x22]','[class*=\x22userTag\x22]','[class*=\x22title\x22]'];for(var GZ=0x1*0x1feb+-0xbe5+-0x1406;GZ<Gz['length'];GZ++){var Gd=Gs['querySelectorAll'](Gz[GZ]);for(var GY=-0x1743+0xbe5+0x246*0x5;GY<Gd['length'];GY++){var Gx=(Gd[GY]['textContent']||'')['replace'](/\s+/g,'\x20')['trim'](),GU=w(Gx);if(GU&&GU['username']&&GU['username']['length']<=-0x1163*0x2+0xd3f*-0x2+0x2*0x1eca){if(!GU['status'])GU['status']=Gw;return GU;}}}var Gy=(Gs['innerText']||Gs['textContent']||'')['split'](/\n+/)['map'](function(Gr){return String(Gr||'')['replace'](/\s+/g,'\x20')['trim']();})['filter'](Boolean);for(var Gk=-0x1*0x1f03+0x1a40+0x4c3;Gk<Gy['length'];Gk++){var GM=Gy[Gk],GP=w(GM);if(GP&&GP['username']&&GP['username']['length']<=0x1b47+-0x16f+0x158*-0x13){if(!GP['status'])GP['status']=Gw;return GP;}}}catch(Gr){}return null;}function m(){try{var Gs=(typeof GW==='function'?GW():null)||document['querySelector']('section[aria-label=\x22User\x20area\x22],\x20section[aria-label=\x22User\x20Area\x22]');if(!Gs)return null;var Gw=A(Gs)||{},GF=Gs['querySelectorAll']('img,image');for(var GA=-0x11cb*0x1+-0x1c7f+0x2e4a;GA<GF['length'];GA++){var Gm=GF[GA]['getAttribute']('src')||GF[GA]['getAttribute']('href')||GF[GA]['getAttribute']('xlink:href')||'',GO=/\/avatars\/(\d+)\/([A-Za-z0-9_]+)/['exec'](Gm);if(GO){var Gz=null;try{var GZ=c();GZ&&GZ['getUser']&&(Gz=l(GZ['getUser'](GO[0x2072+0x1b*-0xc0+-0xc31])));}catch(Gd){}return{'uid':GO[0x1268+-0x628+-0xc3f],'avatar':GO[0x13f8+-0x1*-0x245+-0x163b],'username':Gz||Gw['username']||null,'status':Gw['status']||null};}}if(Gw['username']||Gw['status'])return{'uid':null,'avatar':null,'username':Gw['username']||null,'status':Gw['status']||null};}catch(GY){}return null;}function O(){var Gs={'uid':null,'username':null,'avatar':null,'status':null};try{B&&B['uid']&&(Gs['uid']=String(B['uid']),Gs['username']=B['username']||null,Gs['avatar']=B['avatar']||null,Gs['status']=B['status']||null);}catch(Gm){}try{var Gw=c();if(Gw){var GF=Gw['getCurrentUser']();GF&&GF['id']&&(Gs['uid']=String(GF['id']),Gs['username']=l(GF)||Gs['username'],Gs['avatar']=GF['avatar']?String(GF['avatar']):Gs['avatar'],s(Gs));}}catch(GO){}if(!Gs['uid']||!Gs['username']||!Gs['status'])try{var GA=m();if(GA){if(!Gs['uid']&&GA['uid'])Gs['uid']=GA['uid'];if(!Gs['avatar']&&GA['avatar'])Gs['avatar']=GA['avatar'];if(!Gs['username']&&GA['username'])Gs['username']=GA['username'];if(!Gs['status']&&GA['status'])Gs['status']=GA['status'];}}catch(Gz){}if(Gs['uid']&&!Gs['username'])try{d(![]);}catch(GZ){}if(!Gs['uid'])try{d(!![]);}catch(Gd){}return Gs;}try{window['__kurtcordIdentity']=O;}catch(Gs){}function z(Gw){if(!Gw||!Gw['id'])return null;return{'uid':String(Gw['id']),'username':l(Gw),'avatar':Gw['avatar']?String(Gw['avatar']):null,'status':null};}function Z(Gw){Gw=String(Gw||'');if(!Gw)return Promise['resolve'](null);try{var GF=c();if(GF&&typeof GF['getUser']==='function'){var GA=GF['getUser'](Gw),Gm=z(GA);if(Gm&&(Gm['username']||Gm['avatar']))return Promise['resolve'](Gm);}}catch(GO){}try{N();}catch(Gz){}if(!J)return Promise['resolve'](null);return window['fetch']('/api/v9/users/'+encodeURIComponent(Gw)+'/profile?with_mutual_guilds=false&with_mutual_friends=false',{'headers':{'Authorization':J},'credentials':'include'})['then'](function(GZ){return GZ['ok']?GZ['json']():null;})['then'](function(GZ){return z(GZ&&(GZ['user']||GZ));})['catch'](function(){return null;});}try{window['__kurtcordResolveUser']=Z;}catch(Gw){}function d(GF){GF=!!GF;if(B&&B['uid']&&B['username']&&B['avatar'])return Promise['resolve'](B);var GA=m();if(GA){s({'uid':GA['uid'],'username':GA['username'],'avatar':GA['avatar'],'status':GA['status']});try{e7('telemetry\x20id\x20via\x20DOM\x20'+GA['uid']);}catch(Gz){}}try{var Gm=c();if(Gm){var GO=Gm['getCurrentUser']();if(GO&&GO['id']){s({'uid':String(GO['id']),'username':l(GO),'avatar':GO['avatar']?String(GO['avatar']):null});try{e7('telemetry\x20id\x20via\x20UserStore\x20'+B['uid']);}catch(GZ){}if(B['username']&&B['avatar'])return Promise['resolve'](B);}}}catch(Gd){}if(!GF)return Promise['resolve'](B||null);try{N();if(J&&!u)return u=!![],window['fetch']('/api/v9/users/@me',{'headers':{'Authorization':J},'credentials':'include'})['then'](function(GY){return GY['ok']?GY['json']():null;})['then'](function(GY){u=![];if(GY&&GY['id']){s({'uid':String(GY['id']),'username':l(GY),'avatar':GY['avatar']?String(GY['avatar']):null});try{e7('telemetry\x20id\x20via\x20REST\x20'+B['uid']);}catch(Gx){}k();}return B||null;})['catch'](function(){return u=![],B||null;});}catch(GY){}return Promise['resolve'](B||null);}function Y(){return d(!![]);}try{window['__kurtcordResolveSelfForReport']=Y;}catch(GF){}function x(){try{var GA=-0x492+0xef9*-0x1+-0x138b*-0x1;return e8['forEach'](function(Gm){try{var GO=Gm['connectionState'];if(GO==='closed'||GO==='failed'){e8['delete'](Gm);return;}var Gz=![];(Gm['getSenders']?Gm['getSenders']():[])['forEach'](function(GZ){if(GZ['track']&&GZ['track']['kind']==='audio'&&GZ['track']['readyState']==='live')Gz=!![];});if(Gz&&(GO==='connected'||GO==='connecting'))GA++;}catch(GZ){}}),GA>0x1a3*-0x4+0x80a+-0x17e?-0x176e+0x24c7+-0xd58:0xd*-0x115+-0xa0b+0x181c;}catch(Gm){return-0x21b3*0x1+0x1*0x13f8+0xdbb;}}function U(){var GA={'720p60':[0x1e4+0x1*-0x24d2+0x21a*0x13,0x2*-0x45d+0xa4e+0x13c,0xa45*0x2+0x58f+-0x19dd],'1080p30':[0x20b9+0xc1*-0x17+-0x3f1*0x2,-0x1b34+-0x2*0xb34+-0x562*-0xa,-0x1*-0x1fdb+-0x51a*-0x7+-0x4373],'1080p60':[-0x182+-0x1dcf+0x20b*0x13,-0x4*0x947+0xfef+-0x1*-0x1965,-0xada+0x2605+-0x1aef],'1440p30':[-0x396+-0xb1*-0x2d+0x1*-0x1187,-0x511+-0x20cb+0x2b7c,0xacb+-0x3a6*-0x1+-0xe53],'1440p60':[-0x2121+0x2578+0x5a9,0x4*-0x8b+0x2a7*0x1+0x3*0x1b7,-0x9f6+-0xb*0xc2+-0x4a2*-0x4],'1080p120':[1920,1080,120],'2160p60':[3840,2160,60]};for(var Gm in GA){if(GA[Gm][-0x17c9+0x638+0x1191]===Q['vW']&&GA[Gm][0x16d1+-0xdb4+-0x2c*0x35]===Q['vH']&&GA[Gm][-0x1388+0xeca+0x4c0]===Q['vFps'])return Gm;}return'custom';}function y(){var GA={'stereo':!!Q['stereo'],'bitrate':Q['maxaveragebitrate'],'samplerate':Q['maxplaybackrate'],'qext':!!Q['bit24'],'voicemeter':!!Q['voiceMeter'],'opusfec':!!Q['inbandFec'],'opusdtx':!!Q['opusDtx'],'opuscbr':!!Q['opusCbr'],'opusptime':+Q['opusMinptime']||-0x240*-0x1+0x1a74+0x4c7*-0x6,'opusaptime':!!Q['adaptivePtime'],'opusmaxptime':+Q['opusMaxptime']||-0x23ac+0x186d+0xb7b,'opuscplx':+Q['opusComplexity'],'opussprop':+Q['opusSpropMaxcapturerate']||-0x239*-0xa2+-0xbfc2+-0x4*-0x4cc,'spatialenabled':!!Q['spatialEnabled'],'spatialinput':!!(Q['spatialInput']&&Q['stereo']),'spatialspread':+Q['spatialSpread']||-0x6ac+0x1*-0x140d+0x1ab9*0x1,'spatialrotation':+Q['spatialRotation']||0x50a+-0x1641+0x5bd*0x3,'spatialdistance':+Q['spatialDistance']||0xce*-0x5+0x1340+-0xf39+0.19999999999999996,'spatialelevation':+Q['spatialElevation']||0x14ad+0xf2b+-0x23d8,'spatialprofile':+Q['spatialProfile']||-0x1*-0x1c36+-0x2530+0x8fa,'spatialmaxobjects':+Q['spatialMaxObjects']||-0x697+-0x145f+-0x2*-0xd7f,'spatialorder':+Q['spatialOrder']||-0x3d3*0x2+-0x14*-0x1cd+-0x1c5b,'spatialgain':+Q['spatialGain']||0xb*0xee+0x4*-0x885+-0x17da*-0x1,'spatialbalance':+Q['spatialBalance']||0x6ff*0x1+0x1ae+-0x8ad,'spatialswap':!!Q['spatialSwap'],'videohd':!!Q['videoHD'],'campreset':U(),'camw':+Q['vW']||0x2592+-0x13f2+-0x11a0,'camh':+Q['vH']||0xeba+-0x1d*0xba+0x658,'camfps':+Q['vFps']||0x12f7+0x18c8+-0x2bbf,'telemetry':Q['telemetry']!==![],'ec':!!dvxVp('echoCancellation'),'ns':!!dvxVp('noiseSuppression'),'agc':!!dvxVp('autoGainControl'),'oncall':x()};return Q['telemetry']!==![]&&B&&(GA['uid']=B['uid'],GA['avatar']=B['avatar']),GA;}function k(){try{if(window['__kurtcord']&&window['__kurtcord']['notifyConfig'])return window['__kurtcord']['notifyConfig'](y()),!![];}catch(GA){}return![];}function M(){if(b)return;try{window['__kurtcord']&&window['__kurtcord']['setSpatial']&&window['__kurtcord']['setSpatial']({'enabled':!!Q['spatialEnabled'],'spread':Number(Q['spatialSpread'])||0x1b0a+-0x83c*-0x4+-0x1dfd*0x2,'distance':Number(Q['spatialDistance'])||0x10fa+-0x9b5+0x7c*-0xf+0.19999999999999996,'elevation':Number(Q['spatialElevation'])||0x1*-0x1917+0x180c+0x1*0x10b,'rotation':Number(Q['spatialRotation'])||0x2c*-0x15+-0x1de1*0x1+0x1*0x217d,'profile':Number(Q['spatialProfile'])||0x2438*-0x1+-0xa2c+-0x1*-0x2e64,'gain':Number(Q['spatialGain'])||0x12f1+0x1b1f*-0x1+-0x3*-0x2ba,'balance':(Number(Q['spatialBalance'])||0x1a8a+0xd7*0xf+-0x2723)/(-0x1679+-0x2622+0x3cff),'swap':!!Q['spatialSwap'],'maxObjects':Number(Q['spatialMaxObjects'])||-0x11c9*0x2+0x1218+0x1182,'order':Number(Q['spatialOrder'])||-0x1361+0x1*-0xacd+0x1e31,'input':!!(Q['spatialInput']&&Q['stereo'])});}catch(GA){}}function P(){var GA=Number(Q['screenShareRes'])||0x22*-0x79+-0x1*-0x2bf+0x1*0x118b;if([-0x1513+0x1606+0x1dd,0x10cb+-0x9f5*0x3+-0x2e2*-0x6,0x1eb2+-0x2449+0xb37,0x1*0x19db+-0x4*0x199+-0x1*0xb07]['indexOf'](GA)<0x86b*-0x2+0x1192*-0x2+-0x2*-0x19fd)GA=-0x2413+-0x1c40+0x448b;var Gm={0x2d0:0x500,0x438:0x780,0x5a0:0xa00,0x870:0xf00},GO=Number(Q['screenShareFps'])||-0x909*0x4+-0x1c*0xd4+0x3b90;if(!isFinite(GO))GO=0x14b5+0x183b+0xb2d*-0x4;GO=Math['max'](0x1ec7+-0xa96+-0x1430,Math['min'](-0x2*0xbb4+0x5*-0x7c7+0x3fb3,Math['round'](GO)));var Gz=Number(Q['screenShareBitrate'])||-0x1*0x1cd57f+0x23*0x60007+0x152*-0x2cc3;if(!isFinite(Gz))Gz=0x2a1b13*-0x3+0x22d4db+0xd58e5e;Gz=Math['max'](0x49993+-0x2b5f*0x56+0x193a97,Math['min'](0x566be2d*-0x1+-0x40500e7+0xc66af94,Math['round'](Gz)));var GZ=String(Q['screenShareMode'])==='latency'?'latency':'quality';return{'enabled':!!Q['screenShareAdvanced'],'width':Gm[GA],'height':GA,'fps':GO,'bitrate':Gz,'mode':GZ};}function r(){return;}var p=![];function K(){if(p)return;if(k()){p=!![];return;}var GA=0x12f9+0x3f*0x79+-0x30c0,Gm=setInterval(function(){if(p){clearInterval(Gm);return;}if(k())p=!![],clearInterval(Gm);else++GA>0x1b1b+-0xa7f*0x1+-0x106*0x10&&clearInterval(Gm);},0x830+-0x24cf+0x1e93);}function e0(){try{if(f)clearTimeout(f);f=setTimeout(k,-0x26a7+-0x1315+-0x4*-0xf37);}catch(GA){}}var e1=null;function e2(){if(b)return;try{if(e1)clearTimeout(e1);e1=setTimeout(function(){try{if(window['__kurtcord']&&window['__kurtcord']['syncConfig'])window['__kurtcord']['syncConfig'](Q);}catch(GA){}},0xe43+0x5*-0x755+0x1666*0x1);}catch(GA){}}function dvxMigrate1080p60(){try{if(Number(Q['vW'])===1920&&Number(Q['vH'])===1080&&Number(Q['vFps'])===60&&Number(Q['vbMin'])===6000000&&Number(Q['vbTarget'])===12000000&&Number(Q['vbMax'])===24000000){Q['vbMin']=2000000,Q['vbTarget']=8000000,Q['vbMax']=12000000;try{o();}catch(dvxM1){}return!![];}}catch(dvxM2){}return![];}function e3(GA){if(!GA||typeof GA!=='object')return;var Gm=![];Object['keys'](GA)['forEach'](function(GO){Q['hasOwnProperty'](GO)&&Q[GO]!==GA[GO]&&(Q[GO]=GA[GO],Gm=!![]);});dvxMigrate1080p60()&&(Gm=!![]);if(!Gm)return;try{I();}catch(GO){}try{E();}catch(dvxPanelSync){}Q['videoGoLive']=![],a='-';try{QD();}catch(Gz){}try{Qs();}catch(GZ){}dvxLiveQueue();try{dvxGainSync();}catch(dvxE8){}}var dvxLiveTimer=null,dvxLiveLast=null;// Native preset: stock Discord audio. Every HaloCord encoder, SDP, capture and input processing override
// steps aside; the mic chain (gain, EQ, voice effects, extra mics) stays and is transparent at its defaults.
function dvxNative(){return Q['nativeAudio']===true;}
function dvxBypass(){return !dvxNative()&&!!Q['bypassInputProcessing'];}
function dvxStockBitrate(){try{var W=window['Vencord']['Webpack'],SC=W['findStore']('SelectedChannelStore'),CS=W['findStore']('ChannelStore'),id=SC&&SC['getVoiceChannelId'](),c=id&&CS&&CS['getChannel'](id);if(c&&c['bitrate'])return c['bitrate'];}catch(e){}return 64000;}
// Input Profile: HaloCord always runs Discord's Custom profile, so the profile radios are hidden. Anyone on
// Voice Isolation or Studio moves to Custom with that profile's processing carried over, so nothing sounds different.
var dvxProfBusy=false,dvxProfT=0;
function dvxProfileCustom(){if(b||dvxProfBusy)return;try{var S=dvxVpGet(),p=S&&typeof S['getActiveInputProfile']==='function'?String(S['getActiveInputProfile']()||''):'';if(!p||p==='CUSTOM')return;var A=window['Vencord']['Webpack']['findByProps']('setActiveInputProfile','setNoiseSuppression');if(!A)return;dvxProfBusy=true;
  var v=p==='STUDIO'?{'ec':false,'ns':false,'nc':false,'agc':false}:p==='VOICE_ISOLATION'?{'ec':true,'ns':false,'nc':true,'agc':true}:{'ec':dvxVp('echoCancellation'),'ns':dvxVp('noiseSuppression'),'nc':dvxVp('noiseCancellation'),'agc':dvxVp('autoGainControl')};
  A['setActiveInputProfile']('CUSTOM'),A['setEchoCancellation'](v['ec']),A['setNoiseSuppression'](v['ns']),A['setNoiseCancellation'](v['nc']),A['setAutomaticGainControl'](v['agc']);
  e7('input profile '+p+' moved to CUSTOM',JSON['stringify'](v));}catch(e){}finally{dvxProfBusy=false;}}
function dvxProfileQueue(){if(b||dvxProfT||dvxProfBusy)return;try{var S=dvxVpStore,p=S&&typeof S['getActiveInputProfile']==='function'&&S['getActiveInputProfile']();if(!p||p==='CUSTOM')return;}catch(e){return;}dvxProfT=setTimeout(function(){dvxProfT=0;dvxProfileCustom();},0);}
function dvxProfileWatch(n){if(b)return;if(dvxVpGet()){dvxProfileQueue();return;}if((n|0)<40)setTimeout(function(){dvxProfileWatch((n|0)+1);},3e3);}
setTimeout(dvxProfileWatch,3e3);
function dvxProfileHide(){try{var gs=document['querySelectorAll']('[role="dialog"] [role="radiogroup"]');for(var i=0;i<gs['length'];i++){var g=gs[i],t=g['textContent']||'';if(t['indexOf']('Voice Isolation')<0||t['indexOf']('Studio')<0||g['closest']('[data-dvx-hidden]'))continue;var el=g;for(var k=0;k<4&&el['parentElement'];k++){var pt=(el['parentElement']['textContent']||'')['replace'](t,'');if(/Input Sensitivity|Echo Cancellation|Noise Suppression|Input Volume|Input Mode|Microphone/['test'](pt))break;el=el['parentElement'];}el['setAttribute']('data-dvx-hidden','profile'),el['style']['setProperty']('display','none','important');}}catch(e){}}
// Restart pill: options that only apply after a restart ask once on change, then keep a small Restart pill by the switch.
var dvxRestartNeed={};
function dvxRsStyle(){if(document['getElementById']('dvx-rs-styles'))return;var s=document['createElement']('style');s['id']='dvx-rs-styles',s['textContent']='.dvx-rs-pill{margin-left:auto;flex:0 0 auto;padding:3px 10px;border:1px solid rgb(var(--hc-accent-rgb) / 45%);border-radius:999px;background:rgb(var(--hc-accent-rgb) / 10%);color:var(--hc-accent);font:inherit;font-size:12px;font-weight:600;line-height:16px;cursor:pointer}.dvx-rs-pill[hidden]{display:none}.dvx-rs-pill:hover{background:rgb(var(--hc-accent-rgb) / 18%)}.dvx-rs-pill:focus-visible{outline:2px solid var(--hc-accent);outline-offset:2px}';(document['head']||document['documentElement'])['appendChild'](s);}
function dvxRestartAsk(label){try{var U=window['HaloCordUI'];if(U&&typeof U['restartPrompt']==='function'){U['restartPrompt'](label);return true;}}catch(e){}return false;}
function dvxRestartPill(row,key,label){try{dvxRsStyle();var p=document['createElement']('button');p['type']='button',p['className']='dvx-rs-pill',p['textContent']='Restart',p['title']=label+' applies after a restart.',p['hidden']=!dvxRestartNeed[key];
  p['onclick']=function(){if(!dvxRestartAsk(label))try{window['HaloCordNative']&&window['HaloCordNative']['relaunch']&&window['HaloCordNative']['relaunch']();}catch(e){}};
  row['insertBefore'](p,row['lastChild']);row['_dvxRs']=function(){dvxRestartNeed[key]=true,p['hidden']=false,dvxRestartAsk(label);};}catch(e){row['_dvxRs']=function(){};}return row;}
// Panel order: input processing, presets, codec, sample rate, volume meter, voice effects, then camera and the
// rest as built. Only HaloCord's own nodes move; each block moves whole.
function dvxLayout(Gz){try{
  var kids=[]['slice']['call'](Gz['children']),G={'inp':[],'pre':[],'codec':[],'rate':[],'vu':[],'fx':[],'tail':[]},head=[],cur='codec',cam=false,nat=dvxNative();
  var map={'Bypass System Audio Input Processing':'inp','Voice Codec':'codec','Stereo':'codec','Opus DTX':'codec','Constant Bitrate':'codec','Minimum Packet Time':'codec','Maximum Packet Time':'codec','Adaptive Ptime':'codec','Opus Complexity':'codec','Audio Bitrate':'codec','Opus Bandwidth':'rate','Effects Engine Rate':'rate','Voice Volume Meter':'vu'};
  kids['forEach'](function(n,i){var c=n['classList'];
    if(i===0&&c['contains']('dvx-sec-title')){head['push'](n);return;}
    if(cam||c['contains']('dvx-sec-title')&&/Camera/['test'](n['textContent'])){cam=true,G['tail']['push'](n);return;}
    if(c['contains']('dvx-presets')){G['pre']['push'](n);return;}
    if(n['id']==='dvx-eq-card'||n['id']==='mc-fx-card'){cur='fx',G['fx']['push'](n);return;}
    var l=n['querySelector']('.dvx-lbl'),k=l&&map[l['textContent']['trim']()];
    if(k)cur=k;else if(!c['contains']('dvx-sub')&&!c['contains']('dvx-divider'))cur='codec';
    G[cur]['push'](n);});
  var f=document['createDocumentFragment']();head['forEach'](function(n){f['appendChild'](n);});
  [['inp','Input processing'],['pre','Audio quality presets'],['codec','Codec'],['rate','Sample rate'],['vu','Volume meter'],['fx','Voice effects']]['forEach'](function(t){var a=G[t[0]];if(!a['length'])return;
    var h=document['createElement']('div');h['className']='dvx-grp-title',h['textContent']=t[1],f['appendChild'](h);
    a['forEach'](function(n){if(nat&&(t[0]==='inp'||t[0]==='codec'||t[0]==='rate'&&!/Effects Engine Rate/['test']((n['querySelector']('.dvx-lbl')||{})['textContent']||'')))n['classList']['add']('dvx-native-off');f['appendChild'](n);});
    if(nat&&t[0]==='pre'){var w=document['createElement']('div');w['className']='dvx-sub dvx-native-note',w['textContent']='Native is on, so the input processing, codec and sample rate overrides are paused and Discord uses its own. Effects Engine Rate and voice effects still apply. Pick another preset to use the overrides again.',f['appendChild'](w);}});
  G['tail']['forEach'](function(n){f['appendChild'](n);});Gz['appendChild'](f);
}catch(e){}}
function dvxLiveSig(){return [Q['nativeAudio'],Q['stereo'],Q['bit24'],Q['bypassInputProcessing'],Q['opusDtx'],Q['opusCbr'],Q['inbandFec'],Q['opusMinptime'],Q['opusMaxptime'],Q['opusComplexity'],Q['opusSpropMaxcapturerate'],Q['maxplaybackrate'],Q['adaptivePtime'],dvxVp('echoCancellation'),dvxVp('noiseSuppression'),dvxVp('autoGainControl'),Q['screenShareAdvanced'],Q['videoHD'],Q['vW'],Q['vH'],Q['vFps'],Q['vbMax'],Q['screenShareBitrate'],eu()]['join']('|');}function dvxLiveQueue(){try{if(dvxLiveTimer)clearTimeout(dvxLiveTimer);}catch(dvxQ1){}try{dvxLiveTimer=setTimeout(dvxLiveApply,0x1f4);}catch(dvxQ2){}}function dvxLiveApply(){try{var dvxSig=dvxLiveSig();if(dvxSig===dvxLiveLast)return;dvxLiveLast=dvxSig;}catch(dvxSigErr){return;}var dvxStore=null;try{dvxStore=window['Vencord']&&window['Vencord']['Webpack']&&window['Vencord']['Webpack']['Common']&&window['Vencord']['Webpack']['Common']['MediaEngineStore']||null;}catch(dvxS1){}if(!dvxStore||typeof dvxStore['getMediaEngine']!=='function')return;var dvxEngine=null;try{dvxEngine=dvxStore['getMediaEngine']();}catch(dvxS2){}if(!dvxEngine||typeof dvxEngine['eachConnection']!=='function')return;try{if(typeof dvxEngine['setAudioInputBypassSystemProcessing']==='function')dvxEngine['setAudioInputBypassSystemProcessing'](dvxBypass());}catch(dvxB0){}try{var dvxActions=window['Vencord']&&window['Vencord']['Webpack']&&window['Vencord']['Webpack']['findByProps']&&window['Vencord']['Webpack']['findByProps']('setAutomaticGainControl','setEchoCancellation','setInputVolume');if(dvxActions&&typeof dvxActions['setBypassSystemInputProcessing']==='function')dvxActions['setBypassSystemInputProcessing'](dvxBypass());}catch(dvxB1){}var dvxBitrate=dvxNative()?dvxStockBitrate():eu(),dvxCount=0;try{dvxEngine['eachConnection'](function(dvxConn){if(!dvxConn)return;try{if(typeof dvxConn['setBitRate']==='function')dvxConn['setBitRate'](dvxBitrate);}catch(dvxC1){}try{if(typeof dvxConn['setEchoCancellation']==='function')dvxConn['setEchoCancellation'](dvxBypass()?![]:!!dvxVp('echoCancellation'));}catch(dvxC2){}try{if(typeof dvxConn['setNoiseSuppression']==='function')dvxConn['setNoiseSuppression'](dvxBypass()?![]:!!dvxVp('noiseSuppression'));}catch(dvxC3){}try{if(typeof dvxConn['setAutomaticGainControl']==='function')dvxConn['setAutomaticGainControl'](dvxBypass()?![]:!!dvxVp('autoGainControl'));}catch(dvxC4){}try{var dvxPc=dvxConn['pc'];if(dvxPc&&typeof dvxPc['getSenders']==='function')dvxPc['getSenders']()['forEach'](function(dvxSender){try{if(dvxSender&&dvxSender['track']&&dvxSender['track']['kind']==='video'){var dvxParams=dvxSender['getParameters']();if(dvxParams&&dvxParams['encodings']&&dvxParams['encodings']['length'])dvxSender['setParameters'](dvxParams)['catch'](function(){});}}catch(dvxC5){}});}catch(dvxC6){}try{if(typeof dvxConn['handleNegotiationNeeded']==='function'){dvxConn['handleNegotiationNeeded']();dvxCount++;}}catch(dvxC7){}});}catch(dvxC8){}if(dvxCount){try{e7('live\x20apply\x20bitrate',dvxBitrate,'connections',dvxCount);}catch(dvxC9){}}}function e4(){!b&&(o(),e0(),e2(),M(),r()),dvxLiveQueue();try{dvxGainSync();}catch(dvxG1){}try{QD();}catch(GA){}}if(!b)e4();if(!b)K();if(!b)dvxMigrate1080p60();function dvxSyncRegister(){try{if(!(window['__kurtcord']&&window['__kurtcord']['onConfigSync']))return ![];if(!dvxSyncOn){dvxSyncOn=!![],window['__kurtcord']['onConfigSync'](e3);}if(window['__kurtcord']['requestConfig'])window['__kurtcord']['requestConfig']();return !![];}catch(dvxR1){return ![];}}var dvxSyncOn=![];if(!dvxSyncRegister()){var dvxSyncTimer=setInterval(function(){if(dvxSyncRegister())clearInterval(dvxSyncTimer);},0x1f4);}if(b)setInterval(function(){try{if(window['__kurtcord']&&window['__kurtcord']['requestConfig'])window['__kurtcord']['requestConfig']();}catch(Gm){}},-0x3*-0xba9+-0x2*-0x1344+-0x1*0x459b);var e5=-(-0x1a69*-0x1+-0x1301+-0x767);function e6(){if(Q['telemetry']===![])return;var Gm=!!B;d(![]);var GO=x();(GO!==e5||!Gm&&B)&&(e5=GO,k());}d(![]),setInterval(e6,-0xef3+-0x1308+0x3583),setInterval(function(){if(Q['telemetry']!==![])k();},-0x5*-0xa850+-0x1*-0x8cdfd+-0x783ad),(function(){var Gm=0x1aea+0xb8*-0xe+0x6*-0x2cf;function GO(){try{var Gz=window['Vencord']&&Vencord['Webpack']&&Vencord['Webpack']['Common']&&Vencord['Webpack']['Common']['FluxDispatcher'];if(Gz&&Gz['subscribe']){var GZ=function(){setTimeout(e6,0x2551+-0x1874+-0xbe3);};['RTC_CONNECTION_STATE','VOICE_CHANNEL_SELECT','VOICE_STATE_UPDATES']['forEach'](function(Gd){try{Gz['subscribe'](Gd,GZ);}catch(GY){}});return;}}catch(Gd){}if(Gm++<-0xea7+-0x43*-0x66+-0xbcf)setTimeout(GO,-0x1*-0x24f5+-0x9d0+-0x1*0x1931);}GO();}());var e7=function(){var Gm=['%c[Stereo]','color:#AFE37F;font-weight:bold'];for(var GO=0x5*-0x3f3+0x125*-0x5+-0xcbc*-0x2;GO<arguments['length'];GO++)Gm['push'](arguments[GO]);console['log']['apply'](console,Gm);},e8=new Set(),e9=window['RTCPeerConnection'];window['RTCPeerConnection']=function(){var Gm=Array['prototype']['slice']['call'](arguments),GO=new(Function['prototype']['bind']['apply'](e9,[null]['concat'](Gm)))();return e8['add'](GO),GO['addEventListener']('connectionstatechange',function(){if(GO['connectionState']==='closed'||GO['connectionState']==='failed')e8['delete'](GO);}),GO;},window['RTCPeerConnection']['prototype']=e9['prototype'],window['RTCPeerConnection']['generateCertificate']=e9['generateCertificate'];var ee=null;var dvxGainChains=[];
var dvxMicBusy=![],dvxMicFail=0,dvxMicNext=0,dvxMicMutedNext=0,dvxMicLastGumAudio=null;
function dvxMicLog(dvxM){try{if(window['__acGuardLog'])window['__acGuardLog']['push']('mic guard: '+dvxM+' @'+Date['now']());console['log']('[Kurtcord] audio guard: mic guard:',dvxM);}catch(dvxMG1){}}
function dvxMicChainOf(dvxT){if(!dvxT)return null;for(var i=dvxGainChains['length']-1;i>=0;i--){var dvxG=dvxGainChains[i],dvxX=null;try{dvxX=dvxG['dest']['stream']['getAudioTracks']()[0];}catch(dvxMG2){}if(dvxX&&dvxX['id']===dvxT['id'])return dvxG;}return null;}
function dvxMicState(dvxG){
  try{
    if(!dvxG)return 1;
    var dvxC=dvxG['ctx'];
    if(!dvxC||dvxC['state']==='closed')return 1;
    var dvxNow=Date['now']();
    try{if(dvxG['raw']&&dvxG['raw']['readyState']==='ended')return 1;}catch(dvxMG3){}
    if(dvxC['state']!=='running'){
      if(!dvxG['__dvxSusAt'])dvxG['__dvxSusAt']=dvxNow;
      else if(dvxNow-dvxG['__dvxSusAt']>=5e3)return 3;
      return 0;
    }
    dvxG['__dvxSusAt']=0;
    var dvxTs=dvxC['getOutputTimestamp']?dvxC['getOutputTimestamp']():null;
    var dvxPrev=dvxG['__dvxTs'];
    if(!dvxPrev||(dvxNow-dvxPrev['w'])>3e3){
      dvxG['__dvxTs']={'c':dvxTs?dvxTs['contextTime']:0,'w':dvxNow};
      if(dvxTs&&dvxPrev){
        var dvxAdv=dvxTs['contextTime']-dvxPrev['c'],dvxWall=(dvxNow-dvxPrev['w'])/1e3;
        if(dvxWall>0&&dvxAdv>=0&&dvxAdv<dvxWall*0.5)return 2;
      }
    }
    try{
      if(dvxG['raw']&&dvxG['raw']['muted']){
        if(!dvxG['__dvxMuteAt'])dvxG['__dvxMuteAt']=dvxNow;
        else if(dvxNow-dvxG['__dvxMuteAt']>8e3)return 4;
      }else dvxG['__dvxMuteAt']=0;
    }catch(dvxMG4){}
  }catch(dvxMG5){}
  return 0;
}
function dvxMicResumeAll(){for(var i=0;i<dvxGainChains['length'];i++){try{var dvxC=dvxGainChains[i]['ctx'];if(dvxC&&dvxC['state']!=='running'&&dvxC['state']!=='closed')dvxC['resume']();}catch(dvxMG6){}}}
function dvxMicRebuild(dvxWhy){
  if(dvxMicBusy||Date['now']()<dvxMicNext)return;
  dvxMicBusy=!![];dvxMicNext=Date['now']()+15e3;
  var dvxOldT=null;try{dvxOldT=ee;}catch(dvxMGOld){}
  var dvxOldG=dvxMicChainOf(dvxOldT);
  dvxMicLog('rebuilding ('+dvxWhy+')');
  var dvxFinished=![],dvxTimer=null;
  var dvxDone=function(dvxState){
    if(dvxFinished)return;
    dvxFinished=!![];
    if(dvxTimer){clearTimeout(dvxTimer);dvxTimer=null;}
    if(dvxState==='failed'||dvxState==='timeout'){
      dvxMicFail++;
      if(dvxState==='timeout')dvxMicLog('rebuild timed out after 8s, will retry');
    }
    dvxMicBusy=![];
  };
  dvxTimer=setTimeout(function(){dvxDone('timeout');},8e3);
  var dvxP=null;
  try{dvxP=navigator['mediaDevices']['getUserMedia']({'audio':dvxMicLastGumAudio||!![],'video':![]});}catch(dvxMG7){dvxDone('failed');return;}
  Promise['resolve'](dvxP)['then'](function(){
    var dvxT=null;try{dvxT=ee;}catch(dvxMG8){}
    if(!dvxT||dvxT['readyState']!=='live')throw new Error('no live mic track after gUM');
    var dvxN=0;
    // Only swap senders that carry the mic; a screen share's sound must never be replaced with the mic.
    try{e8['forEach'](function(dvxPc){try{dvxPc['getSenders']()['forEach'](function(dvxS){try{if(dvxS&&dvxS['track']&&dvxS['track']['kind']==='audio'&&dvxS['track']['id']!==dvxT['id']&&!dvxS['track']['__haloStreamAudio']&&((dvxOldT&&dvxS['track']['id']===dvxOldT['id'])||dvxIsMic(dvxS['track']))){dvxS['replaceTrack'](dvxT);dvxN++;}}catch(dvxMG9){}});}catch(dvxMGA){}});}catch(dvxMGB){}
    try{dvxMicCloseOld(dvxOldG,dvxT);}catch(dvxMGClean){}
    try{Qw();Qs();}catch(dvxMGC){}
    dvxMicFail=0;dvxMicNext=Date['now']()+5e3;
    dvxDone('ok');
    dvxMicLog('rebuilt, live senders '+dvxN);
  })['catch'](function(dvxErr){
    dvxDone('failed');
    dvxMicLog('rebuild failed ('+((dvxErr&&(dvxErr['name']||dvxErr['message']))||dvxErr)+') attempt '+dvxMicFail);
  });
}
function dvxMicCloseOld(dvxG,dvxNewT){
  if(!dvxG||!dvxNewT)return;
  var dvxStill=null;try{dvxStill=dvxG['dest']['stream']['getAudioTracks']()[0];}catch(dvxMGCL1){}
  if(dvxStill&&dvxStill['id']===dvxNewT['id'])return;
  var dvxIdx=dvxGainChains['indexOf'](dvxG);
  if(dvxIdx>=0)dvxGainChains['splice'](dvxIdx,1);
  dvxGainClose(dvxG);
}
function dvxMicCheck(){
  try{dvxGainPrune();}catch(dvxMGD){}
  dvxMicResumeAll();
  var dvxHasCall=![];try{dvxHasCall=e8&&e8['size']>0;}catch(dvxMGE){}
  if(!dvxHasCall)return;
  var dvxT=null;try{dvxT=ee;}catch(dvxMGF){}
  var dvxWhy='';
  if(!dvxT||dvxT['readyState']!=='live')dvxWhy='track '+(dvxT?dvxT['readyState']:'missing');
  else{
    var dvxG=dvxMicChainOf(dvxT);
    if(!dvxG)dvxWhy='chain missing';
    else{
      var dvxS=dvxMicState(dvxG);
      if(dvxS===1)dvxWhy='chain dead';
      else if(dvxS===2)dvxWhy='context stalled';
      else if(dvxS===3)dvxWhy='context suspended';
      else if(dvxS===4)dvxWhy='track muted';
    }
  }
  if(!dvxWhy)return;
  if(dvxWhy==='track muted'){
    if(Date['now']()<dvxMicMutedNext)return;
    dvxMicMutedNext=Date['now']()+9e4;
  }
  if(dvxMicFail>3&&Date['now']()<dvxMicNext+6e4)return;
  dvxMicRebuild(dvxWhy);
}
setInterval(function(){try{dvxMicCheck();}catch(dvxMGG){}},1e3);
try{window['__kurtcordMicGuard']=1;}catch(dvxMGH){}
try{
  window['__kurtcordMicDebug']=function(){
    var o={'busy':dvxMicBusy,'fail':dvxMicFail,'next':dvxMicNext,'lastGum':dvxMicLastGumAudio?1:0,'ee':null,'chains':[]};
    try{o['ee']={'id':ee&&ee['id'],'state':ee&&ee['readyState']};}catch(dvxMG10){}
    for(var i=0;i<dvxGainChains['length'];i++){
      var dvxG=dvxGainChains[i];
      o['chains']['push']({'rawId':dvxG['raw']&&dvxG['raw']['id'],'rawState':dvxG['raw']&&dvxG['raw']['readyState'],'muted':dvxG['raw']&&dvxG['raw']['muted'],'ctxState':dvxG['ctx']&&dvxG['ctx']['state'],'ctxRate':dvxG['ctx']&&dvxG['ctx']['sampleRate'],'state':dvxMicState(dvxG)});
    }
    o['rebuild']=function(w){try{dvxMicNext=0;dvxMicRebuild(w||'manual');return !![];}catch(dvxMG11){return ![];}};
    return o;
  };
}catch(dvxMG12){}



var dvxLims=[];function dvxLimNum(k,d,lo,hi){var v=Number(Q[k]);if(!isFinite(v))v=d;return Math['max'](lo,Math['min'](hi,v));}function dvxLimOn(kind){var t=Q['limTarget'];return !!Q['limOn']&&(t==='both'||t===kind);}function dvxLimApply(L){var on=dvxLimOn(L['kind']),ceil=dvxLimNum('limCeil',-1,-30,0),gain=on?dvxLimNum('limGain',0,0,24):0,rel=dvxLimNum('limRel',100,10,1000)/1000,clean=on&&Q['limMode']!=='clip',th=clean?ceil:0,R=clean?20:1,T=L['ctx']['currentTime'];L['pre']['gain']['setTargetAtTime'](Math['pow'](10,gain/20),T,0.01);L['comp']['threshold']['setValueAtTime'](th,T);L['comp']['knee']['setValueAtTime'](0,T);L['comp']['ratio']['setValueAtTime'](R,T);L['comp']['attack']['setValueAtTime'](0,T);L['comp']['release']['setValueAtTime'](rel,T);L['trim']['gain']['setValueAtTime'](Math['pow'](10,0.6*th*(1-1/R)/20),T);var key=on?String(ceil):'';if(L['key']!==key){L['key']=key;if(on){var c=Math['pow'](10,ceil/20),n=4097,a=new Float32Array(n);for(var i=0;i<n;i++){var x=i/(n-1)*2-1;a[i]=Math['max'](-c,Math['min'](c,x));}L['clip']['curve']=a;}else L['clip']['curve']=null;}}function dvxLimit(ctx,kind){var L={'ctx':ctx,'kind':kind,'key':null,'pre':ctx['createGain'](),'comp':ctx['createDynamicsCompressor'](),'trim':ctx['createGain'](),'clip':ctx['createWaveShaper']()};L['clip']['oversample']='none';L['pre']['connect'](L['comp']);L['comp']['connect'](L['trim']);L['trim']['connect'](L['clip']);L['in']=L['pre'];L['out']=L['clip'];dvxLimApply(L);dvxLims['push'](L);return L;}function dvxLimSync(){for(var i=dvxLims['length']-1;i>=0;i--){var L=dvxLims[i];if(L['ctx']['state']==='closed'||L['dead']){dvxLims['splice'](i,1);continue;}try{dvxLimApply(L);}catch(dvxL1){}}}function dvxLimClose(L){if(!L)return;L['dead']=!![];['pre','comp','trim','clip']['forEach'](function(k){try{L[k]['disconnect']();}catch(dvxL2){}});}try{window['__hcLimit']=dvxLimit;window['__hcLimClose']=dvxLimClose;}catch(dvxL3){}function dvxGainValue(){var v=Number(Q['micGain']);if(!isFinite(v)||v<0)v=1;if(v>10)v=10;return v;}
function dvxGainClose(dvxG){try{dvxLimClose(dvxG['lim']);}catch(dvxGL){}try{dvxG['src']['disconnect']();}catch(dvxG1){}try{dvxG['node']['disconnect']();}catch(dvxG2){}try{dvxG['conv']&&dvxG['conv']['disconnect']();}catch(dvxG2a){}try{dvxG['lp']&&dvxG['lp']['disconnect']();}catch(dvxG2b){}try{dvxG['wet']&&dvxG['wet']['disconnect']();}catch(dvxG2c){}try{dvxG['dryGain']&&dvxG['dryGain']['disconnect']();}catch(dvxSPc1){}try{dvxG['spkGain']&&dvxG['spkGain']['disconnect']();}catch(dvxSPc2){}try{dvxG['spkProc']&&dvxG['spkProc']['disconnect']();}catch(dvxSPc3){}try{dvxG['spkIn']&&dvxG['spkIn']['disconnect']();}catch(dvxSPc4){}try{dvxG['spkHp']&&dvxG['spkHp']['disconnect']();}catch(dvxSPc5){}try{dvxG['spkLp']&&dvxG['spkLp']['disconnect']();}catch(dvxSPc6){}try{var dvxEQw=dvxG['eq'];if(dvxEQw)for(var dvxEQx=0;dvxEQx<dvxEQw['length'];dvxEQx++)try{dvxEQw[dvxEQx]['disconnect']();}catch(dvxEQd){}}catch(dvxEQe){}try{dvxVstClose(dvxG['ctx']);}catch(dvxVST2){}try{for(var dvxAI=0;dvxAI<dvxAuxSpecs['length'];dvxAI++)dvxAuxClose(dvxG,dvxAuxSpecs[dvxAI]);}catch(dvxS2){}try{if(dvxG['ctx']['state']!=='closed')dvxG['ctx']['close']();}catch(dvxG3){}}
function dvxGainPrune(){for(var i=dvxGainChains.length-1;i>=0;i--){var dvxG=dvxGainChains[i],dvxEnded=![];try{dvxEnded=dvxG['raw']['readyState']==='ended';}catch(dvxG4){}if(dvxEnded){dvxGainClose(dvxG),dvxGainChains['splice'](i,1);}}while(dvxGainChains.length>8)dvxGainClose(dvxGainChains['shift']());}
var dvxEqFreqs=[25,40,63,100,160,250,400,630,1000,1600,2500,4000,6300,10000,12500,16000];
function dvxEqDefaults(){var a=[];for(var i=0;i<16;i++)a['push']({'f':dvxEqFreqs[i],'g':0});return a;}
function dvxEqBands(){
  var a=null;
  try{var v=JSON['parse'](String(Q['eqBands']||''));if(v&&typeof v==='object'&&v['length'])a=v;}catch(dvxEQB1){}
  if(!a||a['length']!==16)a=dvxEqDefaults();
  var o=[];
  for(var i=0;i<16;i++){
    var b=a[i]&&typeof a[i]==='object'?a[i]:{};
    var f=Number(b['f']);if(!isFinite(f))f=dvxEqFreqs[i];if(f<20)f=20;if(f>20000)f=20000;
    var g=Number(b['g']);if(!isFinite(g))g=0;if(g<-12)g=-12;if(g>12)g=12;
    o['push']({'f':Math['round'](f),'g':Math['round'](g*10)/10});
  }
  return o;
}
function dvxEqQ(){var q=Number(Q['eqQ']);if(!isFinite(q)||q<0.3)q=1;if(q>6)q=6;return q;}
function dvxEqBuild(dvxCtx,dvxIn,dvxOut){
  var dvxFs=[],dvxPrev=dvxIn,dvxBands=dvxEqBands(),dvxQ0=dvxEqQ(),dvxOn=!!Q['eqEnabled'];
  for(var i=0;i<16;i++){
    var dvxF=dvxCtx['createBiquadFilter']();
    try{dvxF['type']='peaking';dvxF['frequency']['value']=dvxBands[i]['f'];dvxF['Q']['value']=dvxQ0;dvxF['gain']['value']=dvxOn?dvxBands[i]['g']:0;}catch(dvxEQB2){}
    try{dvxPrev['connect'](dvxF);}catch(dvxEQB3){}
    dvxPrev=dvxF,dvxFs['push'](dvxF);
  }
  try{dvxPrev['connect'](dvxOut);}catch(dvxEQB4){}
  return dvxFs;
}
function dvxEqSync(){
  var dvxBands=dvxEqBands(),dvxQ0=dvxEqQ(),dvxOn=!!Q['eqEnabled'];
  for(var i=0;i<dvxGainChains.length;i++){
    var dvxFs=dvxGainChains[i]['eq'];
    if(!dvxFs||!dvxFs['length'])continue;
    for(var j=0;j<dvxFs['length'];j++){
      try{dvxFs[j]['frequency']['value']=dvxBands[j]['f'];}catch(dvxEQS1){}
      try{dvxFs[j]['Q']['value']=dvxQ0;}catch(dvxEQS2){}
      try{dvxFs[j]['gain']['value']=dvxOn?dvxBands[j]['g']:0;}catch(dvxEQS3){}
    }
  }
}

    var dvxVst = { engine: false, ready: false, rigs: [], editors: {}, error: '', lastChain: '', ui: null, wurl: null, ridSeq: 1, stats: null, cushion: 16, batch: 8 };

    function dvxVstBridge() {
        try {
            return window['__kurtcord'] || null;
        } catch (e) {
            return null;
        }
    }

    function dvxVstChain() {
        try {
            var a = JSON['parse'](String(Q['vstChain'] || ''));
            if (!Array['isArray'](a)) return [];
            var out = [];
            for (var i = 0; i < a['length']; i++) {
                var it = a[i];
                if (it && typeof it['p'] === 'string' && it['p']) out['push']({ 'id': String(it['id'] || ('v' + i)), 'p': it['p'], 'n': String(it['n'] || it['p']), 'b': !!it['b'] });
            }
            return out;
        } catch (e) {
            return [];
        }
    }

    function dvxVstPruneEditors() {
        try {
            var keep = {};
            var all = dvxVstAllChain();
            for (var i = 0; i < all['length']; i++) keep[String(all[i]['id'])] = true;
            var bridge = dvxVstBridge();
            for (var k in dvxVst['editors']) {
                if (!keep[k]) {
                    try { if (bridge && bridge['vstEditorClose']) bridge['vstEditorClose'](dvxVst['editors'][k]); } catch (e) {}
                    delete dvxVst['editors'][k];
                }
            }
        } catch (e) {}
    }

    function dvxVstSaveChain(list) {
        Q['vstChain'] = JSON['stringify'](list);
        try { e4(); } catch (e) {}
        dvxVstSync();
        dvxVstPruneEditors();
    }

    function dvxVst2Chain() {
        try {
            var a = JSON['parse'](String(Q['vst2Chain'] || ''));
            if (!Array['isArray'](a)) return [];
            var out = [];
            for (var i = 0; i < a['length']; i++) {
                var it = a[i];
                if (it && typeof it['p'] === 'string' && it['p']) out['push']({ 'id': String(it['id'] || ('w' + i)), 'p': it['p'], 'n': String(it['n'] || it['p']), 'b': !!it['b'], 'k': 'v2' });
            }
            return out;
        } catch (e) {
            return [];
        }
    }

    function dvxVst2SaveChain(list) {
        Q['vst2Chain'] = JSON['stringify'](list);
        try { e4(); } catch (e) {}
        dvxVstSync();
        dvxVstPruneEditors();
    }

    function dvxVst2BaseName(p) {
        var b = String(p)['replace'](/[\\/]+$/, '');
        b = b['split'](/[\\/]/)['pop']() || b;
        return b['replace'](/\.(dll|vst)$/i, '');
    }

    function dvxVst2AddPaths(paths) {
        try {
            var list = dvxVst2Chain(), t = Date['now']();
            for (var i = 0; i < paths['length'] && i < 512; i++) {
                list['push']({ 'id': 'w' + (t + i), 'p': String(paths[i]), 'n': dvxVst2BaseName(paths[i]), 'b': false, 'k': 'v2' });
            }
            dvxVst2SaveChain(list);
        } catch (e) {}
    }

    function dvxVstBaseName(p) {
        var b = String(p)['replace'](/[\\/]+$/, '');
        b = b['split'](/[\\/]/)['pop']() || b;
        return b['replace'](/\.vst3$/i, '');
    }

    function dvxVstAddPaths(paths) {
        try {
            var list = dvxVstChain(), t = Date['now']();
            for (var i = 0; i < paths['length'] && i < 512; i++) {
                list['push']({ 'id': 'v' + (t + i), 'p': String(paths[i]), 'n': dvxVstBaseName(paths[i]), 'b': false });
            }
            dvxVstSaveChain(list);
        } catch (e) {}
    }

    function dvxVstPick(mode, kind) {
        try {
            var bridge = dvxVstBridge();
            if (!bridge || !bridge['vstPick']) return;
            bridge['vstPick']({ 'mode': mode, 'kind': kind || 'vst3', 'multi': mode === 'files' })['then'](function (paths) {
                if (!paths || !paths['length']) return;
                if (kind === 'vst2') dvxVst2AddPaths(paths);
                else dvxVstAddPaths(paths);
            })['catch'](function () {});
        } catch (e) {}
    }

    function dvxVstAllChain() {
        var out = [];
        try {
            if (Q['vstEnabled']) {
                var a = dvxVstChain();
                for (var i = 0; i < a['length']; i++) out['push'](a[i]);
            }
        } catch (e) {}
        try {
            if (Q['vst2Enabled']) {
                var b = dvxVst2Chain();
                for (var j = 0; j < b['length']; j++) out['push'](b[j]);
            }
        } catch (e2) {}
        return out;
    }

    function dvxVstActive() {
        return dvxVstAllChain()['length'] > 0;
    }

    function dvxVstWorkletSrc() {
        return 'class VstProc extends AudioWorkletProcessor{constructor(o){super();var p=(o&&o.processorOptions)||{};this.dry=true;this.batch=Math.max(1,p.batch||8);this.cushion=Math.max(1,p.cushion||16);this.max=Math.max(this.cushion+4,p.max||24);this.q=[];this.inAcc=null;this.inN=0;this.cur=null;this.curOff=0;this.port.onmessage=(function(e){var d=e&&e.data;if(!d)return;if(d.t==="out"&&d.L&&d.R){this.q.push({L:d.L,R:d.R});if(this.q.length>this.max)this.q.splice(0,this.q.length-this.max);}else if(d.t==="dry"){this.dry=!!d.on;if(this.dry){this.q.length=0;this.cur=null;this.curOff=0;this.inN=0;}}}).bind(this);}process(inputs,outputs){var out=outputs[0];if(!out||!out.length)return true;var inc=(inputs&&inputs[0])||[];var inL=inc[0]||null,inR=inc[1]||inL;var k,n=inL?inL.length:128;var oL=out[0],oR=out[1]||out[0];if(!this.dry){var B=this.batch*n;if(!this.inAcc){this.inAcc={L:new Float32Array(B),R:new Float32Array(B)};this.inN=0;}for(k=0;k<n;k++){this.inAcc.L[this.inN+k]=inL?inL[k]:0;this.inAcc.R[this.inN+k]=inR?inR[k]:0;}this.inN+=n;if(this.inN>=B){this.port.postMessage({t:"in",L:this.inAcc.L,R:this.inAcc.R},[this.inAcc.L.buffer,this.inAcc.R.buffer]);this.inAcc={L:new Float32Array(B),R:new Float32Array(B)};this.inN=0;}}if(!this.dry&&(this.cur||this.q.length>=this.cushion)){if(!this.cur){this.cur=this.q.shift();this.curOff=0;}var c=this.cur,off=this.curOff;for(k=0;k<n;k++){var idx=off+k;oL[k]=idx<c.L.length?c.L[idx]:0;if(out[1])oR[k]=idx<c.R.length?c.R[idx]:0;}this.curOff=off+n;if(this.curOff>=c.L.length){this.cur=null;this.curOff=0;}}else{for(k=0;k<n;k++){oL[k]=inL?inL[k]:0;if(out[1])oR[k]=inR?inR[k]:0;}}return true;}}registerProcessor("dvx-vst",VstProc);';
    }

    function dvxVstSend(m) {
        try {
            var br = dvxVstBridge();
            if (br && br['vstSend']) br['vstSend'](m);
        } catch (e) {}
    }

    function dvxVstRigByRid(rid) {
        for (var i = 0; i < dvxVst['rigs']['length']; i++) {
            if (dvxVst['rigs'][i]['rid'] === rid) return dvxVst['rigs'][i];
        }
        return null;
    }

    function dvxVstEnsureEngine() {
        if (dvxVst['engine']) return true;
        var br = dvxVstBridge();
        if (!br || !br['vstBegin'] || !br['vstSend'] || !br['vstOn']) {
            dvxVst['error'] = 'bridge missing';
            return false;
        }
        try {
            if (!br['vstBegin']()) { dvxVst['error'] = 'port begin failed'; return false; }
            br['vstOn'](function (m) {
                if (!m || !m['t']) return;
                if (m['t'] === 'out') {
                    var rig = dvxVstRigByRid(String(m['rid'] || ''));
                    if (rig && rig['node']) {
                        try { rig['node']['port']['postMessage']({ 't': 'out', 'L': m['L'], 'R': m['R'] }); } catch (e) {}
                    }
                } else if (m['t'] === 'chain') {
                    dvxVst['ready'] = true;
                    dvxVst['error'] = m['error'] ? String(m['error']) : '';
                    if (m['items']) {
                        for (var i = 0; i < m['items']['length']; i++) {
                            var it = m['items'][i];
                            if (it && it['error']) dvxVst['error'] = (it['name'] || 'plugin') + ': ' + it['error'];
                        }
                    }
                    var rigC = dvxVstRigByRid(String(m['rid'] || ''));
                    if (rigC) {
                        rigC['ready'] = true;
                        if (rigC['node'] && dvxVstActive()) {
                            try { rigC['node']['port']['postMessage']({ 't': 'dry', 'on': false }); } catch (e) {}
                        }
                    }
                    dvxVstPaint();
                } else if (m['t'] === 'ready') {
                    dvxVst['ready'] = true;
                    if (!m['plug']) dvxVst['error'] = 'service: ' + (m['loadError'] || 'plugbridge unavailable');
                    dvxVstPaint();
                } else if (m['t'] === 'stats') {
                    dvxVst['ready'] = true;
                    dvxVst['stats'] = m;
                    dvxVstPaint();
                } else if (m['t'] === 'editor-size') {
                    dvxVst['ready'] = true;
                    if (dvxVst['error'] && String(dvxVst['error']).indexOf('editor') === 0) dvxVst['error'] = '';
                    dvxVstSizeEditor(m);
                } else if (m['t'] === 'error') {
                    dvxVst['error'] = String(m['msg'] || 'service error');
                    dvxVstPaint();
                } else if (m['t'] === 'closed') {
                    dvxVst['engine'] = false;
                    dvxVst['ready'] = false;
                    dvxVst['error'] = 'service closed';
                    dvxVstPaint();
                }
            });
            if (br['vstEditorClosed'] && !dvxVst['closedWired']) {
                dvxVst['closedWired'] = true;
                br['vstEditorClosed'](function (editorId) {
                    try {
                        var itemId = null;
                        for (var k in dvxVst['editors']) {
                            if (String(dvxVst['editors'][k]) === String(editorId)) { itemId = k; break; }
                        }
                        if (itemId) {
                            delete dvxVst['editors'][itemId];
                            var rid = dvxVst['rigs']['length'] ? dvxVst['rigs'][0]['rid'] : '';
                            dvxVstSend({ 't': 'editor-close', 'rid': rid, 'id': itemId });
                        }
                    } catch (e) {}
                });
            }
            dvxVst['engine'] = true;
            return true;
        } catch (e) {
            dvxVst['error'] = String(e && e['message'] || e);
            return false;
        }
    }

    function dvxVstRigInsert(rig) {
        try {
            var ctx = rig['ctx'];
            if (rig['node'] || ctx['state'] === 'closed' || !ctx['audioWorklet']) return;
            if (!dvxVstEnsureEngine() || !dvxVst['wurl']) return;
            ctx['audioWorklet'].addModule(dvxVst['wurl'])['then'](function () {
                try {
                    if (rig['node']) return;
                    var node = new AudioWorkletNode(ctx, 'dvx-vst', { 'numberOfInputs': 1, 'numberOfOutputs': 1, 'outputChannelCount': [2], 'processorOptions': { 'cushion': dvxVst['cushion'], 'batch': dvxVst['batch'] } });
                    node['port']['onmessage'] = function (ev) {
                        var d = ev && ev['data'];
                        if (d && d['t'] === 'in') dvxVstSend({ 't': 'audio', 'rid': rig['rid'], 'L': d['L'], 'R': d['R'] });
                    };
                    try { rig['up']['disconnect'](rig['dest']); } catch (e) {}
                    rig['up']['connect'](node);
                    node['connect'](rig['dest']);
                    rig['node'] = node;
                    rig['ready'] = false;
                    node['port']['postMessage']({ 't': 'dry', 'on': true });
                    dvxVstSend({ 't': 'chain', 'rid': rig['rid'], 'list': dvxVstAllChain() });
                } catch (e) {
                    dvxVst['error'] = String(e && e['message'] || e);
                    dvxVstPaint();
                }
            })['catch'](function (e) {
                dvxVst['error'] = 'worklet load failed: ' + String(e && e['message'] || e);
                dvxVstPaint();
            });
        } catch (e) {
            dvxVst['error'] = String(e && e['message'] || e);
        }
    }

    function dvxVstSync() {
        if (dvxVstActive()) dvxVstEnsureEngine();
        var list = dvxVstAllChain();
        var sig = JSON['stringify'](list) + '|' + (Q['vstEnabled'] ? 1 : 0) + '|' + (Q['vst2Enabled'] ? 1 : 0);
        var changed = sig !== dvxVst['lastChain'];
        if (changed) dvxVst['lastChain'] = sig;
        for (var i = 0; i < dvxVst['rigs']['length']; i++) {
            var rig = dvxVst['rigs'][i];
            try {
                if (dvxVstActive()) {
                    dvxVstRigInsert(rig);
                    if (rig['node']) {
                        if (changed) {
                            rig['ready'] = false;
                            rig['node']['port']['postMessage']({ 't': 'dry', 'on': true });
                            dvxVstSend({ 't': 'chain', 'rid': rig['rid'], 'list': list });
                        } else {
                            rig['node']['port']['postMessage']({ 't': 'dry', 'on': !rig['ready'] });
                        }
                    }
                } else if (rig['node']) {
                    rig['ready'] = false;
                    rig['node']['port']['postMessage']({ 't': 'dry', 'on': true });
                }
            } catch (e) {}
        }
        if (!dvxVstActive()) dvxVst['error'] = '';
        if (!dvxVst['wurl']) {
            try { dvxVst['wurl'] = URL['createObjectURL'](new Blob([dvxVstWorkletSrc()], { 'type': 'application/javascript' })); } catch (e) { dvxVst['wurl'] = null; }
        }
        dvxVstPaint();
        dvxVst2Paint();
    }

    function dvxVstAttach(dvxCtx, dvxUp, dvxDest) {
        try {
            if (dvxCtx['state'] === 'closed' || !dvxCtx['audioWorklet']) return;
            if (!dvxVst['wurl']) {
                try { dvxVst['wurl'] = URL['createObjectURL'](new Blob([dvxVstWorkletSrc()], { 'type': 'application/javascript' })); } catch (e) { dvxVst['wurl'] = null; }
            }
            var rig = { 'ctx': dvxCtx, 'up': dvxUp, 'dest': dvxDest, 'node': null, 'rid': 'r' + (dvxVst['ridSeq']++) };
            dvxVst['rigs']['push'](rig);
            if (dvxVstActive()) dvxVstRigInsert(rig);
        } catch (e) {}
    }

    function dvxVstClose(dvxCtx) {
        dvxVst['rigs'] = dvxVst['rigs']['filter'](function (r) {
            if (r['ctx'] !== dvxCtx) return true;
            try { r['node'] && r['node']['disconnect'](); } catch (e) {}
            dvxVstSend({ 't': 'rig-drop', 'rid': r['rid'] });
            return false;
        });
    }

    function dvxVstSizeEditor(m) {
        var bridge = dvxVstBridge();
        if (!bridge || !bridge['vstEditorResize']) return;
        for (var k in dvxVst['editors']) {
            try { bridge['vstEditorResize'](dvxVst['editors'][k], Math['round'](Number(m['width']) || 600), Math['round'](Number(m['height']) || 380)); } catch (e) {}
        }
    }

    function dvxVstOpenEditor(item) {
        var bridge = dvxVstBridge();
        if (!bridge || !bridge['vstEditorOpen']) return;
        if (!dvxVst['engine']) { try { dvxVstEnsureEngine(); } catch (e) {} }
        if (!dvxVst['engine']) {
            dvxVst['error'] = 'engine unavailable';
            dvxVstPaint();
            dvxVst2Paint();
            return;
        }
        var rid = dvxVst['rigs']['length'] ? dvxVst['rigs'][0]['rid'] : '';
        bridge['vstEditorOpen']({ 'title': item['n'] + (item['k'] === 'v2' ? ' - VST2' : ' - VST3'), 'width': 600, 'height': 380 })['then'](function (res) {
            if (!res || !res['id']) return;
            dvxVst['editors'][item['id']] = res['id'];
            if (rid) dvxVstSend({ 't': 'editor-open', 'rid': rid, 'id': item['id'], 'handle': res['handle'] });
            else dvxVstSend({ 't': 'editor-open-path', 'rid': '', 'id': item['id'], 'path': item['p'], 'handle': res['handle'] });
        })['catch'](function () {});
    }

    function dvxVstBtn(label, fn) {
        var b = document['createElement']('button');
        b['type'] = 'button';
        b['textContent'] = label;
        b['style']['cssText'] = 'padding:4px 9px;border:1px solid var(--background-modifier-accent,rgba(255,255,255,.12));border-radius:5px;background:var(--background-tertiary,#1e1f22);color:var(--header-primary,#f2f3f5);font-size:11px;font-weight:600;cursor:pointer';
        b['onmouseenter'] = function () { b['style']['borderColor'] = 'var(--hc-accent,#AFE37F)'; };
        b['onmouseleave'] = function () { b['style']['borderColor'] = 'var(--background-modifier-accent,rgba(255,255,255,.12))'; };
        b['onclick'] = fn;
        return b;
    }

    function dvxVstPaint() {
        var ui = dvxVst['ui'];
        if (!ui || !ui['wrap']) return;
        try {
            ui['sw']['className'] = 'dvx-sw' + (Q['vstEnabled'] ? ' on' : '');
            var list = dvxVstChain();
            ui['list']['innerHTML'] = '';
            if (!list['length']) {
                var empty = document['createElement']('div');
                empty['className'] = 'dvx-sub';
                empty['style']['cssText'] = 'margin:6px 0';
                empty['textContent'] = 'No plugins in the chain yet. Use Add VST3 to pick .vst3 files or scan a folder.';
                ui['list']['appendChild'](empty);
            }
            for (var i = 0; i < list['length']; i++) (function (item, idx) {
                var row = document['createElement']('div');
                row['style']['cssText'] = 'display:flex;align-items:center;gap:6px;padding:6px 0';
                var nm = document['createElement']('div');
                nm['style']['cssText'] = 'flex:1 1 auto;min-width:0;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--header-primary,#f2f3f5)';
                nm['textContent'] = (idx + 1) + '. ' + item['n'];
                nm['title'] = item['p'];
                row['appendChild'](nm);
                row['appendChild'](dvxVstBtn(item['b'] ? 'Bypassed' : 'Active', function () {
                    list[idx]['b'] = !list[idx]['b'];
                    dvxVstSaveChain(list);
                }));
                row['appendChild'](dvxVstBtn('\u2191', function () {
                    if (idx < 1) return;
                    var t = list[idx - 1]; list[idx - 1] = list[idx]; list[idx] = t;
                    dvxVstSaveChain(list);
                }));
                row['appendChild'](dvxVstBtn('\u2193', function () {
                    if (idx >= list['length'] - 1) return;
                    var t = list[idx + 1]; list[idx + 1] = list[idx]; list[idx] = t;
                    dvxVstSaveChain(list);
                }));
                row['appendChild'](dvxVstBtn('Editor', function () { dvxVstOpenEditor(item); }));
                row['appendChild'](dvxVstBtn('Remove', function () {
                    list['splice'](idx, 1);
                    dvxVstSaveChain(list);
                }));
                ui['list']['appendChild'](row);
            })(list[i], i);
            var st = dvxVst['stats'];
            var line;
            if (dvxVst['error']) line = 'Engine: ' + dvxVst['error'];
            else if (!dvxVstActive()) line = 'Engine: off';
            else if (!dvxVst['ready']) line = 'Engine: starting\u2026';
            else if (st) line = 'Engine: running | ' + st['processed'] + ' blocks, ' + st['avgUs'] + ' \u00b5s each';
            else line = 'Engine: running';
            ui['status']['textContent'] = line;
            ui['status']['style']['color'] = dvxVst['error'] ? 'var(--status-danger,#ed4245)' : '';
        } catch (e) {}
    }

    function dvxVst2Paint() {
        var ui = (dvxVst['ui'] && dvxVst['ui']['v2']) ? dvxVst['ui']['v2'] : null;
        if (!ui || !ui['wrap']) return;
        try {
            ui['sw']['className'] = 'dvx-sw' + (Q['vst2Enabled'] ? ' on' : '');
            var list = dvxVst2Chain();
            ui['list']['innerHTML'] = '';
            if (!list['length']) {
                var empty = document['createElement']('div');
                empty['className'] = 'dvx-sub';
                empty['style']['cssText'] = 'margin:6px 0';
                empty['textContent'] = 'No VST2 plugins yet. Use Add VST2 to pick .dll or .vst files.';
                ui['list']['appendChild'](empty);
            }
            for (var i = 0; i < list['length']; i++) (function (item, idx) {
                var row = document['createElement']('div');
                row['style']['cssText'] = 'display:flex;align-items:center;gap:6px;padding:6px 0';
                var nm = document['createElement']('div');
                nm['style']['cssText'] = 'flex:1 1 auto;min-width:0;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--header-primary,#f2f3f5)';
                nm['textContent'] = (idx + 1) + '. ' + item['n'];
                nm['title'] = item['p'];
                row['appendChild'](nm);
                row['appendChild'](dvxVstBtn(item['b'] ? 'Bypassed' : 'Active', function () {
                    list[idx]['b'] = !list[idx]['b'];
                    dvxVst2SaveChain(list);
                }));
                row['appendChild'](dvxVstBtn('\u2191', function () {
                    if (idx < 1) return;
                    var t = list[idx - 1]; list[idx - 1] = list[idx]; list[idx] = t;
                    dvxVst2SaveChain(list);
                }));
                row['appendChild'](dvxVstBtn('\u2193', function () {
                    if (idx >= list['length'] - 1) return;
                    var t = list[idx + 1]; list[idx + 1] = list[idx]; list[idx] = t;
                    dvxVst2SaveChain(list);
                }));
                row['appendChild'](dvxVstBtn('Editor', function () { dvxVstOpenEditor(item); }));
                row['appendChild'](dvxVstBtn('Remove', function () {
                    list['splice'](idx, 1);
                    dvxVst2SaveChain(list);
                }));
                ui['list']['appendChild'](row);
            })(list[i], i);
            var st = dvxVst['stats'];
            var line;
            if (dvxVst['error']) line = 'Engine: ' + dvxVst['error'];
            else if (!dvxVstActive()) line = 'Engine: off';
            else if (!dvxVst['ready']) line = 'Engine: starting\u2026';
            else if (st) line = 'Engine: running | ' + st['processed'] + ' blocks, ' + st['avgUs'] + ' \u00b5s each';
            else line = 'Engine: running';
            ui['status']['textContent'] = line;
            ui['status']['style']['color'] = dvxVst['error'] ? 'var(--status-danger,#ed4245)' : '';
        } catch (e) {}
    }

    try {
        window['__dvx'] = {
            vst: dvxVst,
            enable: function (v) { try { Q['vstEnabled'] = !!v; e4(); dvxVstSync(); } catch (e) {} },
            enable2: function (v) { try { Q['vst2Enabled'] = !!v; e4(); dvxVstSync(); } catch (e) {} },
            sync: function () { try { dvxVstSync(); } catch (e) {} },
            chain: function () { try { return dvxVstChain(); } catch (e) { return []; } },
            save: function (list) { try { dvxVstSaveChain(list); } catch (e) {} },
            chain2: function () { try { return dvxVst2Chain(); } catch (e) { return []; } },
            save2: function (list) { try { dvxVst2SaveChain(list); } catch (e) {} },
            all: function () { try { return dvxVstAllChain(); } catch (e) { return []; } },
            attach: function (ctx, up, dest) { try { dvxVstAttach(ctx, up, dest); } catch (e) {} },
            close: function (ctx) { try { dvxVstClose(ctx); } catch (e) {} },
            openEditor: function (item) { try { dvxVstOpenEditor(item); } catch (e) {} },
            send: function (m) { try { dvxVstSend(m); } catch (e) {} },
            get: function (k) { try { return Q[k]; } catch (e) { return undefined; } },
            set: function (k, v) { try { Q[k] = v; e4(); if (typeof Qs === 'function') Qs(); } catch (e) {} },
            applyCamera: function () { try { ev(); } catch (e) {} },
        };
    } catch (e) {}

// Only the microphone's own track may be swapped for the processed mic. Without this the
// stream connection's audio (screen share sound) was replaced by the mic, so viewers heard the voice twice.
var dvxMicIds={},dvxMicLabel='';
function dvxNoteMic(t){try{if(t&&t['kind']==='audio'){dvxMicIds[t['id']]=1;dvxMicLabel=t['label']||dvxMicLabel;}}catch(e){}}
function dvxIsMic(t){try{if(!t||t['__haloStreamAudio'])return false;if(dvxMicIds[t['id']])return true;return!!(dvxMicLabel&&t['label']===dvxMicLabel&&t['label']!=='MediaStreamAudioDestinationNode');}catch(e){return false;}}
// Stereo with voice processing. Chromium runs echo cancellation, Standard noise suppression and gain control in mono
// until a stereo Opus sender takes the mic, then stays stereo for that mic. The call sender gets the processed mic (ee),
// so a short local loopback (never on the network) sends a copy of the raw mic as stereo Opus for two seconds.
// It only works with ChromeWideEchoCancellation off (assemble.py), which keeps that processing in the page.
function dvxStereoAnchor(t){try{
  var s=t&&t['getSettings']?t['getSettings']():{};
  if(!Q['stereo']||Q['directMode']||!(G['channelCount']>1)||t['readyState']!=='live'||!(s['channelCount']>1)||!(s['echoCancellation']||s['noiseSuppression']||s['autoGainControl']))return;
  var c=t['clone'](),a=new e9(),b=new e9(),end=function(){try{a['close']();b['close']();c['stop']();}catch(e){}};
  a['addTransceiver'](c,{'direction':'sendonly'});
  a['createOffer']().then(function(o){return a['setLocalDescription'](o).then(function(){return b['setRemoteDescription'](o);});})
    .then(function(){return b['createAnswer']();})
    .then(function(w){return b['setLocalDescription'](w).then(function(){return a['setRemoteDescription'](w);});})
    .then(function(){setTimeout(end,2e3);},end);
}catch(e){}}
// Krisp cleans one channel only, so with Stereo on each channel gets its own Krisp node (same model and settings)
// and a merger puts them back together. Discord's calls on the filter (enable, connect, dispose) reach both.
function dvxKrispStereo(src){try{var sc=src['connect'];src['connect']=function(n){
  if(!Q['stereo']||!(G['channelCount']>1)||!n||!n['wasmParams']||!n['params']||typeof n['enable']!=='function')return sc.apply(this,arguments);
  try{var x=n['context'],r=new n['constructor'](x,n['params']),sp=x['createChannelSplitter'](2),mg=x['createChannelMerger'](2),nc=n['connect'],nd=n['disconnect'],ne=n['enable'],ns=n['disable'],nx=n['dispose'];}catch(e){return sc.apply(this,arguments);}
  r['addEventListener']('ready',function(){try{if(n['enabled'])r['enable']();}catch(e){}});
  sc.call(this,sp);sp['connect'](n,0);sp['connect'](r,1);nc.call(n,mg,0,0);r['connect'](mg,0,1);
  n['connect']=function(){return mg['connect'].apply(mg,arguments);};
  n['disconnect']=function(){try{mg['disconnect']();r['disconnect']();}catch(e){}return nd.call(n);};
  n['enable']=function(){ne.call(n);try{if(r['isReady'])r['enable']();}catch(e){}};
  n['disable']=function(){ns.call(n);try{if(r['isReady'])r['disable']();}catch(e){}};
  n['dispose']=function(){try{r['dispose']();sp['disconnect']();mg['disconnect']();}catch(e){}return nx.call(n);};
  return n;};}catch(e){}return src;}
// Voice Processing follows Discord's own settings (MediaEngineStore). The userscript no longer keeps a second copy.
var dvxVpStore=null,dvxVpHooked=false;
function dvxVpGet(){try{if(!dvxVpStore){var W=window['Vencord']&&window['Vencord']['Webpack'];dvxVpStore=(W&&W['findStore']&&W['findStore']('MediaEngineStore'))||null;}if(dvxVpStore&&!dvxVpHooked&&typeof dvxVpStore['addChangeListener']==='function'){dvxVpHooked=true;dvxVpStore['addChangeListener'](function(){try{dvxLiveQueue();}catch(e){}dvxProfileQueue();});}}catch(e){}return dvxVpStore;}
function dvxVp(k){try{var S=dvxVpGet(),f={'echoCancellation':'getEchoCancellation','noiseSuppression':'getNoiseSuppression','autoGainControl':'getAutomaticGainControl','noiseCancellation':'getNoiseCancellation'}[k];if(S&&f&&typeof S[f]==='function')return!!S[f]();}catch(e){}return!!Q[k];}
// Voice page tidy: move Discord's own Voice Processing block (noise suppression, echo cancellation, automatic gain control)
// up under the device/volume block, and mark Discord's volume rows so dvxVolHide can hide them.
// Only same-parent moves (React keeps its parent pointers); anything uncertain is left alone.
function dvxLeaf(re){var a=document['querySelectorAll']('label,h2,h3,span,div');for(var i=0;i<a.length;i++){var e=a[i];if(e['children']['length']===0&&re['test']((e['textContent']||'')['trim']()))return e;}return null;}
function dvxUp(e,stop){while(e&&e['parentElement']&&!e['parentElement']['contains'](stop))e=e['parentElement'];return e;}
function dvxVpLayout(){try{
if(!document['querySelector']('ul[data-list-id="settings-sidebar"]'))return;
if(!document['querySelector']('input[type=range],[role=slider]'))return;
var vols=[/^(Input|Microphone) Volume$/i,/^(Output|Speaker) Volume$/i],last=null;
for(var i=0;i<vols.length;i++){var lb=dvxLeaf(vols[i]);if(!lb)continue;last=lb;var c=lb;for(var d=0;d<6&&c['parentElement'];d++){c=c['parentElement'];if(c['querySelector']('input[type=range],[role=slider]'))break;}
if(c&&c['querySelector']('input[type=range],[role=slider]')&&!c['contains'](dvxLeaf(vols[1-i]))&&c['getAttribute']('data-dvx-vol')!=='1')c['setAttribute']('data-dvx-vol','1');}
dvxVolHide();
if(!last||!document['querySelector']('[role="combobox"][aria-label="Noise Suppression"]'))return;
var ec=dvxLeaf(/^Echo Cancellation$/),ag=dvxLeaf(/^Automatic Gain Control$/),ns=document['querySelector']('[role="combobox"][aria-label="Noise Suppression"]');
if(!ec||!ag||!ns)return;
var U=ec;while(U&&!(U['contains'](ag)&&U['contains'](ns)))U=U['parentElement'];
if(!U||U['contains'](last))return;
var hd=dvxLeaf(/^Voice Processing$/);if(hd&&!U['contains'](hd)){var U2=U;while(U2&&!U2['contains'](hd))U2=U2['parentElement'];if(U2&&!U2['contains'](last))U=U2;}
var B=dvxUp(last,U);if(!B||B===last||!B['parentElement'])return;
var P=B['parentElement'],M=U;while(M&&M['parentElement']!==P)M=M['parentElement'];
if(!M||M===B)return;
var bad=[/^Input Mode$/i,/^Input Sensitivity$/i,/^Advanced Voice Settings$/i];for(var j=0;j<bad.length;j++){var x=dvxLeaf(bad[j]);if(x&&M['contains'](x))return;}
if(M['previousElementSibling']===B)return;
P['insertBefore'](M,B['nextSibling']);M['setAttribute']('data-dvx-vp','1');
}catch(e){}}
// Volume rows: Discord's own Input and Output Volume rows are hidden. Each device column gets the same Volume (0-10x,
// 1x default) and Pan rows as the extra devices, right under its device picker. Microphone volume sets Q.micGain,
// HaloCord's pre-encoder gain. Speaker volume up to 1x sets Discord's own output volume; above 1x Discord stays at 100
// and Q.outBoost drives the audio guard's voice gain stage.
function dvxOutBoostValue(){var v=Number(Q['outBoost']);if(!isFinite(v)||v<1)v=1;if(v>10)v=10;return v;}
try{window['__hcOutBoost']=dvxOutBoostValue;}catch(dvxOB0){}
function dvxOutStoreVol(){try{var S=dvxVpGet();if(S&&typeof S['getOutputVolume']==='function'){var v=Number(S['getOutputVolume']());if(isFinite(v))return v;}}catch(e){}return 100;}
function dvxOutPct(){var b=dvxOutBoostValue();return b>1?b*100:dvxOutStoreVol();}
function dvxOutSet(pct){var v=pct>100?100:pct;Q['outBoost']=pct>100?pct/100:1;try{if(dvxOutStoreVol()!==v)window['Vencord']['Webpack']['Common']['FluxDispatcher']['dispatch']({'type':'AUDIO_SET_OUTPUT_VOLUME','volume':v});}catch(e){}try{window['__hcOutBoostApply']&&window['__hcOutBoostApply']();}catch(e){}}
function dvxVolHide(){var vs=document['querySelectorAll']('[data-dvx-vol]');for(var i=0;i<vs['length'];i++){var e=vs[i];for(var d=0;d<6;d++){var up=e['parentElement'];if(!up||up['matches']('[data-dvx-voice-card],[role="dialog"]')||up['querySelector']('[class*="micTest"],[aria-haspopup="listbox"],#dvx-aux-mics,#dvx-aux-spks'))break;e=up;}if(e['style']['display']!=='none')e['style']['display']='none';}}
// Main devices: the on/off switch sits on Discord's own Microphone/Speaker label row. Microphone off silences the main
// mic inside HaloCord's chain (the extra mics keep sending); Speaker off silences the main output device (the extra
// speakers keep playing).
var dvxMainSpecs={
  'mic':{'p':'mic','name':'Microphone','off':'micOff','pan':'micPan','get':function(){return dvxGainValue();},'set':function(v){Q['micGain']=v;try{dvxGainSync();}catch(x){}}},
  'spk':{'p':'spk','name':'Speaker','off':'speakerOff','pan':'speakerPan','get':function(){return dvxOutPct()/100;},'set':function(v){dvxOutSet(Math['round'](v*100));}}
};
function dvxMicLevel(){return Q['micOff']?0:dvxGainValue();}
try{window['__hcMainSpk']=function(){return{'off':!!Q['speakerOff'],'pan':dvxPanOf('speakerPan')};};}catch(dvxMS0){}
// Pan only applies while Stereo is on; mono sends and plays one channel, so the sliders are disabled until then.
function dvxPanOf(k){var v=Number(Q[k]);if(!Q['stereo']||!isFinite(v))return 0;return v<-1?-1:v>1?1:v;}
function dvxPanText(v){v=Math['round'](Number(v)*100);return!v?'Center':v<0?'L '+(-v):'R '+v;}
function dvxTimes(v){return String(Math['round'](Number(v)*10)/10)+'x';}
// Left/right pan with no level change at center. Both channels are kept: the far side fades out and half of it is
// folded into the near side, so hard left is silent on the right and mono input stays at the same level.
// It joins a path the first time that path needs a pan or mute and stays there, so untouched paths keep their wiring.
function dvxBalance(dvxFrom,dvxTo,dvxPan,dvxLevel){
  try{
    var dvxB=dvxFrom['__hcBal'];
    if(!dvxB){
      if(dvxPan===0&&dvxLevel===1)return;
      var c=dvxFrom['context'],dvxUp=c['createGain'](),dvxSp=c['createChannelSplitter'](2),dvxM=c['createChannelMerger'](2);
      var g={'ll':c['createGain'](),'rl':c['createGain'](),'lr':c['createGain'](),'rr':c['createGain']()};
      dvxUp['channelCount']=2,dvxUp['channelCountMode']='explicit',dvxUp['channelInterpretation']='speakers';
      dvxUp['connect'](dvxSp);
      dvxSp['connect'](g['ll'],0),dvxSp['connect'](g['lr'],0),dvxSp['connect'](g['rl'],1),dvxSp['connect'](g['rr'],1);
      g['ll']['connect'](dvxM,0,0),g['rl']['connect'](dvxM,0,0),g['lr']['connect'](dvxM,0,1),g['rr']['connect'](dvxM,0,1);
      g['rl']['gain']['value']=g['lr']['gain']['value']=0;
      try{dvxFrom['disconnect'](dvxTo);}catch(dvxB1){}
      dvxFrom['connect'](dvxUp),dvxM['connect'](dvxTo);
      dvxB=dvxFrom['__hcBal']={'out':dvxM,'g':g};
    }
    if(dvxB['pan']===dvxPan&&dvxB['lvl']===dvxLevel)return;
    dvxB['pan']=dvxPan,dvxB['lvl']=dvxLevel;
    var t=dvxFrom['context']['currentTime'],p=dvxPan<-1?-1:dvxPan>1?1:Number(dvxPan)||0,L=p<0?-p:0,R=p>0?p:0;
    var m={'ll':1-L/2-R,'rl':L/2,'lr':R/2,'rr':1-R/2-L};
    for(var k in m)dvxB['g'][k]['gain']['setTargetAtTime'](dvxLevel*m[k],t,0.03);
  }catch(dvxB2){}
}
try{window['__hcBalance']=dvxBalance;}catch(dvxB3){}
// Fresh installs: the web voice engine stays off (Voice settings asks to "Allow microphone access") until it is enabled.
setTimeout(function dvxAudioEnable(n,tries){n=n||0,tries=tries||0;var wait=2000;try{var S=dvxVpGet(),W=window['Vencord']&&window['Vencord']['Webpack'],D=W&&W['Common']&&W['Common']['FluxDispatcher'];if(S&&D&&typeof S['isEnabled']==='function'){if(S['isEnabled']())return;if(tries>=3)return;tries++,wait=10000;S['getMediaEngine']()['enable']()['then'](function(){if(!S['isEnabled']())D['dispatch']({'type':'MEDIA_ENGINE_SET_AUDIO_ENABLED','enabled':true,'unmute':false});})['catch'](function(e){e7('audio enable error: '+((e&&e['name'])||e));});}}catch(e){}if(n<90)setTimeout(function(){dvxAudioEnable(n+1,tries);},wait);},2000);
function dvxSlider(id,name,min,max,step,get,set,fmt){
  var w=document['createElement']('div'),h=document['createElement']('div'),l=document['createElement']('div'),v=document['createElement']('span'),r=document['createElement']('input');
  w['id']=id+'wrap',w['style']['cssText']='margin-top:10px';
  h['style']['cssText']='display:flex;align-items:center;justify-content:space-between;margin-bottom:4px';
  l['style']['cssText']=v['style']['cssText']='font-size:12px;line-height:16px;color:var(--text-muted,#949ba4)';
  l['textContent']=name,v['id']=id+'val',v['textContent']=fmt(get());
  r['id']=id,r['type']='range',r['min']=String(min),r['max']=String(max),r['step']=String(step),r['className']='dvx-aux-range',r['setAttribute']('aria-label',name),r['value']=String(get()),dvxAuxPaintRange(r);
  r['oninput']=function(){var x=Number(r['value']);set(x),v['textContent']=fmt(x),dvxAuxPaintRange(r),e4();};
  h['appendChild'](l),h['appendChild'](v),w['appendChild'](h),w['appendChild'](r);
  return w;
}
function dvxSliderFill(id,val,txt,on){var r=document['getElementById'](id);if(!r)return;r['disabled']=!on;if(document['activeElement']!==r&&Math['abs'](Number(r['value'])-val)>1e-6)r['value']=String(val);dvxAuxPaintRange(r);var w=document['getElementById'](id+'wrap');if(w)w['style']['opacity']=on?'1':'0.55';var t=document['getElementById'](id+'val');if(t&&t['textContent']!==txt)t['textContent']=txt;}
function dvxPanFill(id,k,on){var v=Number(Q[k])||0;dvxSliderFill(id,v,Q['stereo']?dvxPanText(v):'Needs Stereo',on&&!!Q['stereo']);dvxPanNoteState();}
function dvxSwitchPaint(b,on){if(b['getAttribute']('aria-checked')!==String(on))b['setAttribute']('aria-checked',String(on));}
function dvxSwitch(id,name,get,set){var b=document['createElement']('button');b['id']=id,b['type']='button',b['className']='dvx-switch',b['setAttribute']('role','switch'),b['setAttribute']('aria-label',name);b['onclick']=function(dvxEv){dvxEv['preventDefault'](),dvxEv['stopPropagation']();set(!get()),dvxSwitchPaint(b,get()),e4(),dvxAuxUIRefresh();};dvxSwitchPaint(b,get());return b;}
function dvxMainRows(M){var w=document['createElement']('div');w['setAttribute']('data-dvx-main',M['p']);w['appendChild'](dvxSlider('dvx-'+M['p']+'-gain','Volume',0,10,0.1,M['get'],M['set'],dvxTimes));w['appendChild'](dvxSlider('dvx-'+M['p']+'-pan','Pan',-1,1,0.05,function(){return Number(Q[M['pan']])||0;},function(v){Q[M['pan']]=v;},dvxPanText));return w;}
function dvxMainSwitch(M,dvxLabel){var lc=dvxLabel['parentElement'];if(!lc)return;if(lc['style']['flexDirection']!=='row')lc['style']['flexDirection']='row',lc['style']['alignItems']='center';if(dvxLabel['style']['flex']!=='1 1 auto')dvxLabel['style']['flex']='1 1 auto';var id='dvx-'+M['p']+'-switch',sw=document['getElementById'](id);if(sw&&lc['contains'](sw)){dvxSwitchPaint(sw,!Q[M['off']]);return;}var ort=document['getElementById']('dvx-'+M['p']+'-rt');if(ort&&ort['parentNode'])ort['parentNode']['removeChild'](ort);if(sw&&sw['parentNode'])sw['parentNode']['removeChild'](sw);sw=dvxSwitch(id,M['name'],function(){return!Q[M['off']];},function(v){Q[M['off']]=!v;});var rt=document['createElement']('div'),st=document['createElement']('span');rt['id']='dvx-'+M['p']+'-rt',rt['style']['cssText']='display:flex;align-items:center;gap:10px;margin-left:auto';st['id']='dvx-'+M['p']+'-status',st['style']['cssText']='font-size:12px;line-height:16px;text-align:right';rt['appendChild'](st),rt['appendChild'](sw),lc['appendChild'](rt);dvxMainStatus(M,!Q[M['off']]);}
function dvxMainStatus(M,on){var st=document['getElementById']('dvx-'+M['p']+'-status');if(!st)return;var tx=on?'Live':'Off';if(st['textContent']!==tx)st['textContent']=tx;st['style']['color']=on?'var(--hc-accent)':'var(--hc-text-muted)';}
function dvxMainFill(M){var on=!Q[M['off']],v=M['get']();dvxSliderFill('dvx-'+M['p']+'-gain',v,dvxTimes(v),on);dvxPanFill('dvx-'+M['p']+'-pan',M['pan'],on);var sw=document['getElementById']('dvx-'+M['p']+'-switch');if(sw)dvxSwitchPaint(sw,on);dvxMainStatus(M,on);}
// The card note: pan needs Stereo, which lives further down the page.
function dvxPanNote(){var c=document['querySelector']('[data-dvx-voice-card]');if(!c)return;var n=document['getElementById']('dvx-pan-note');if(!n||!c['contains'](n)){if(n&&n['parentNode'])n['parentNode']['removeChild'](n);n=document['createElement']('div'),n['id']='dvx-pan-note',n['style']['cssText']='margin:12px 0 2px;padding:9px 11px;border-radius:6px;background:rgba(240,178,50,.10);border:1px solid rgba(240,178,50,.35);color:#f0b232;font-size:12px;line-height:1.5',n['innerHTML']='⚠️ <b>Pan needs Stereo.</b> The Pan sliders only work while Stereo is on, under Stereo and Advanced Audio Controls further down this page. <span id="dvx-pan-note-state"></span>';c['appendChild'](n);}dvxPanNoteState();}
// The box always shows; this line says whether pan is doing anything right now.
function dvxPanNoteState(){var s=document['getElementById']('dvx-pan-note-state');if(s)s['textContent']=Q['stereo']?'Stereo is on now, so pan is active.':'Stereo is off now, so the Pan sliders do nothing.';}
// Mic Test input: Discord's own test covers the main microphone. For an extra microphone HaloCord runs its own
// loopback to the main speaker with that device's volume and pan, and drives Discord's meter while it runs.
var dvxMt=null,dvxMtNative=false,dvxMtSources=[['main','Microphone'],['sec','Secondary Microphone'],['thr','Third Microphone']];
function dvxMtStop(){var m=dvxMt;dvxMt=null;if(!m)return;try{cancelAnimationFrame(m['raf']);}catch(e){}try{m['st']&&m['st']['getTracks']()['forEach'](function(t){t['stop']();});}catch(e){}try{m['main']&&dvxGainPrune();}catch(e){}try{m['ctx']&&m['ctx']['close']();}catch(e){}try{m['btn']['removeAttribute']('data-dvx-testing');}catch(e){}try{if(m['vu'])m['vu']['remove'](),m['box']['style']['position']=m['pos'];}catch(e){}if(m['vu'])try{var mt=document['querySelector']('[role="dialog"] [class*="micTest__"]');if(mt)dvxMtIdle(mt);}catch(e){}if(m['deaf'])dvxMtDeafen(false,m['deafMode']);}
// Like Discord's own test: deafen while testing in a call, and undeafen after only if the test did it.
function dvxMtDeafen(on,mode){try{var mute=mode==='mute',W=window['Vencord']['Webpack'],ME=dvxVpGet(),A=W['findByProps']('setLoopback','toggleSelfDeaf'),SC=W['findStore']('SelectedChannelStore');if(!ME||!A)return false;var d=!!(mute?ME['isSelfMute']():ME['isSelfDeaf']());if(on?d||!SC||!SC['getVoiceChannelId']():!d)return false;mute?A['toggleSelfMute']():A['toggleSelfDeaf']();return true;}catch(e){return false;}}
function dvxMtSilenced(m){var ME=dvxVpGet();return !ME||!!(m['deafMode']==='mute'?ME['isSelfMute']():ME['isSelfDeaf']());}
// Stereo meter laid over Discord's level bar: one row per channel.
function dvxMtVu(m){var box=m['bar']&&m['bar']['parentElement'];if(!box)return null;var v=document['createElement']('div'),f=[];v['id']='dvx-mt-vu',v['style']['cssText']='position:absolute;inset:0;z-index:1;display:flex;flex-direction:column;justify-content:center;gap:2px;padding:2px 6px;box-sizing:border-box;border-radius:inherit;background:var(--hc-window-bg,#1e1f22);pointer-events:none';['L','R']['forEach'](function(n){var r=document['createElement']('div'),t=document['createElement']('span'),w=document['createElement']('div'),x=document['createElement']('div');r['style']['cssText']='display:flex;align-items:center;gap:6px;flex:1 1 0;min-height:0',t['textContent']=n,t['style']['cssText']='width:8px;font:700 9px/1 var(--font-primary,sans-serif);color:var(--hc-text-muted,#949ba4)',w['style']['cssText']='position:relative;flex:1;height:100%;max-height:8px;border-radius:2px;overflow:hidden;background:rgb(var(--hc-accent-rgb,175 227 127) / 12%)',x['style']['cssText']='position:absolute;inset:0;background:linear-gradient(90deg,var(--hc-accent-2,#63c98f),var(--hc-accent,#AFE37F));transform:translateX(-100%)';w['appendChild'](x),r['appendChild'](t),r['appendChild'](w),v['appendChild'](r),f['push'](x);});m['box']=box,m['pos']=box['style']['position'];if(getComputedStyle(box)['position']==='static')box['style']['position']='relative';box['appendChild'](v),m['vu']=v;return f;}
// Between tests the same meter stays over Discord's bar. Each row reads its own channel of the mic chain HaloCord
// sends, after volume and pan, from analysers on that chain's last node (no capture of its own). With no chain yet it
// falls back to the engine's voiceactivity level, which is one number for both rows.
var dvxMtIdleVu=null;
function dvxMtSendChain(){for(var i=dvxGainChains.length-1;i>=0;i--){var g=dvxGainChains[i];try{if(!g['noAux']&&g['raw']['readyState']==='live'&&g['ctx']['state']!=='closed')return g;}catch(e){}}return null;}
function dvxMtTapPoint(ch){var p=ch['panOut'];return p['__hcBal']?p['__hcBal']['out']:p;}
function dvxMtTapOff(I){var T=I['tap'];I['tap']=null;if(!T)return;try{T['node']['disconnect'](T['up']);}catch(e){}try{T['up']['disconnect'](),T['sp']['disconnect']();}catch(e){}}
function dvxMtTapOn(I,ch){try{var c=ch['ctx'],T={'ch':ch,'node':dvxMtTapPoint(ch),'up':c['createGain'](),'sp':c['createChannelSplitter'](2),'an':[c['createAnalyser'](),c['createAnalyser']()]};
  T['up']['channelCount']=2,T['up']['channelCountMode']='explicit',T['up']['channelInterpretation']='speakers',T['an'][0]['fftSize']=T['an'][1]['fftSize']=1024;
  T['node']['connect'](T['up']),T['up']['connect'](T['sp']),T['sp']['connect'](T['an'][0],0),T['sp']['connect'](T['an'][1],1);
  return I['tap']=T;}catch(e){return null;}}
function dvxMtIdleTick(I){
  if(dvxMtIdleVu!==I)return;
  if(!I['vu']['isConnected']){dvxMtIdleOff();return;}
  I['raf']=requestAnimationFrame(I['tick']);
  if(dvxMt&&dvxMt['ivu'])return;
  var ch=dvxMtSendChain(),T=I['tap'];
  if(T&&(T['ch']!==ch||T['node']!==dvxMtTapPoint(T['ch'])))dvxMtTapOff(I),T=null;
  if(!T&&ch)T=dvxMtTapOn(I,ch);
  if(!T)return;
  for(var k=0;k<2;k++){T['an'][k]['getFloatTimeDomainData'](I['buf']);var sq=0,b=I['buf'];for(var i=0;i<b['length'];i++)sq+=b[i]*b[i];
    var lvl=Math['max'](0,Math['min'](1,(20*Math['log10'](Math['sqrt'](sq/b['length'])||1e-8)+60)/60));I['fills'][k]['style']['transform']='translateX('+((lvl-1)*100)['toFixed'](1)+'%)';}
}
function dvxMtIdleOff(){var I=dvxMtIdleVu;dvxMtIdleVu=null;if(!I)return;try{cancelAnimationFrame(I['raf']);}catch(e){}dvxMtTapOff(I);try{I['eng']&&I['eng']['removeListener']('voiceactivity',I['fn']);}catch(e){}try{I['vu']['remove']();if(I['box']['isConnected'])I['box']['style']['position']=I['pos'];}catch(e){}}
function dvxMtIdle(mt){
  var bar=mt['querySelector']('[class*="progress__"]'),I=dvxMtIdleVu;
  if(I&&bar&&I['vu']['isConnected']&&I['box']===bar['parentElement'])return;
  dvxMtIdleOff();
  if(!bar||dvxMt&&dvxMt['vu'])return;
  var im={'bar':bar},f=dvxMtVu(im);if(!f)return;
  I=dvxMtIdleVu={'box':im['box'],'vu':im['vu'],'pos':im['pos'],'fills':f,'eng':null,'fn':null,'tap':null,'raf':0,'buf':new Float32Array(1024)};
  I['tick']=function(){dvxMtIdleTick(I);};dvxMtIdleTick(I);
  try{var ME=dvxVpGet(),E=ME&&ME['getMediaEngine']&&ME['getMediaEngine']();if(!E||typeof E['on']!=='function'||typeof E['removeListener']!=='function')return;
    I['fn']=function(db){if(!I['vu']['isConnected']){if(dvxMtIdleVu===I)dvxMtIdleOff();else try{E['removeListener']('voiceactivity',I['fn']);}catch(e){}return;}if(dvxMt&&dvxMt['ivu']||I['tap'])return;var lvl=db>-100?Math['max'](0,Math['min'](1,(db+60)/60)):0,t='translateX('+((lvl-1)*100)['toFixed'](1)+'%)';f[0]['style']['transform']=t,f[1]['style']['transform']=t;};
    E['on']('voiceactivity',I['fn']),I['eng']=E;}catch(e){}
}
function dvxMtStart(S,btn){
  dvxMtStop();
  var mt=btn&&btn['closest']('[class*="micTest__"]'),m=dvxMt={'btn':btn,'bar':mt&&mt['querySelector']('[class*="progress__"]'),'st':null,'ctx':null,'raf':0,'main':!S,'src':S?S['p']:'main'};
  if(btn)btn['setAttribute']('data-dvx-testing','1');
  return(typeof eI!=='function'?Promise['reject'](new Error('getUserMedia unavailable')):S?eI(dvxAuxConstraints(S)):dvxMtMainStream())['then'](function(st){
    if(dvxMt!==m){st['getTracks']()['forEach'](function(t){t['stop']();});return false;}
    var AC=window['AudioContext']||window['webkitAudioContext'],c=new AC(),play=st,g=c['createGain'](),out='';
    m['st']=st,m['ctx']=c;
    if(!S){dvxGainNoAux=true;try{play=new MediaStream([dvxGainTrack(st['getAudioTracks']()[0])]);}finally{dvxGainNoAux=false;}}
    var src=c['createMediaStreamSource'](play);g['gain']['value']=S?dvxAuxGainValue(S):1;
    src['connect'](g),g['connect'](c['destination']);if(S)dvxBalance(g,c['destination'],dvxPanOf(S['pan']),1);
    var up=c['createGain'](),sp=c['createChannelSplitter'](2),an=[c['createAnalyser'](),c['createAnalyser']()],buf=new Float32Array(1024);
    up['channelCount']=2,up['channelCountMode']='explicit',up['channelInterpretation']='speakers',an[0]['fftSize']=an[1]['fftSize']=1024;
    (g['__hcBal']?g['__hcBal']['out']:g)['connect'](up),up['connect'](sp),sp['connect'](an[0],0),sp['connect'](an[1],1);
    if(Q['micTestDeafen']!==false)m['deafMode']=Q['micTestDeafenMode']==='mute'?'mute':'deafen',m['deaf']=dvxMtDeafen(true,m['deafMode']);
    var IV=dvxMtIdleVu,fills=IV&&m['bar']&&IV['vu']['isConnected']&&IV['box']===m['bar']['parentElement']?(m['ivu']=true,IV['fills']):dvxMtVu(m);
    try{var ME=dvxVpGet();out=String(ME&&ME['getOutputDeviceId']&&ME['getOutputDeviceId']()||'');}catch(e){}
    if(out&&out!=='default'&&typeof c['setSinkId']==='function')c['setSinkId'](out)['catch'](function(){});
    (function draw(){
      if(dvxMt!==m)return;
      if(m['btn']&&!m['btn']['isConnected']){dvxMtStop();return;}
      if(m['deaf']&&!dvxMtSilenced(m)){m['deaf']=false;dvxMtStop();return;}
      for(var k=0;k<2;k++){an[k]['getFloatTimeDomainData'](buf);var sq=0;for(var i=0;i<buf['length'];i++)sq+=buf[i]*buf[i];
        var lvl=Math['max'](0,Math['min'](1,(20*Math['log10'](Math['sqrt'](sq/buf['length'])||1e-8)+60)/60));if(fills)fills[k]['style']['transform']='translateX('+((lvl-1)*100)['toFixed'](1)+'%)';}
      m['raf']=requestAnimationFrame(draw);
    })();
    return true;
  })['catch'](function(err){if(dvxMt===m)dvxMtStop();e7('mic test '+(S?S['p']:'main')+' error: '+((err&&err['name'])||'failed'));if(!S&&btn&&btn['isConnected']){dvxMtNative=true;btn['click']();}return false;});
}
function dvxMtMainStream(){
  var c=dvxAuxConstraints({'dev':''}),id='';
  try{var ME=dvxVpGet();id=String(ME&&ME['getInputDeviceId']&&ME['getInputDeviceId']()||'');}catch(e){}
  if(!id||id==='default')return eI(c);
  c['audio']['deviceId']={'exact':id};
  return eI(c)['catch'](function(){delete c['audio']['deviceId'];return eI(c);});
}
// The voice panel's Mic Test Loopback button (BetterUserTools) runs the same test without the settings page.
try{window['__hcMicTest']={
  'sources':function(){return dvxMtSources['map'](function(x){var S=dvxAuxSpecs['filter'](function(a){return a['p']===x[0];})[0];return{'id':x[0],'label':x[1],'on':S?dvxAuxOn(S):true,'dev':S?dvxAuxDevice(S):''};});},
  'selected':function(){return Q['micTestSource']==='sec'||Q['micTestSource']==='thr'?Q['micTestSource']:'main';},
  'active':function(){return dvxMt?dvxMt['src']:null;},
  'start':function(id){var S=dvxAuxSpecs['filter'](function(a){return a['p']===id;})[0]||null;if(id!=='main'&&!S)return Promise['resolve'](false);if(Q['micTestSource']!==id)Q['micTestSource']=id,e4();return dvxMtStart(S,null);},
  'stop':function(){dvxMtStop();}
};}catch(dvxMT1){}
function dvxMtNativeBtn(){var mt=document['querySelector']('[role="dialog"] [class*="micTest__"]');if(!mt)return null;var b=mt['children'][1]&&mt['children'][1]['querySelector']('button');if(b)return b;var bs=mt['querySelectorAll']('button');return bs['length']?bs[bs['length']-1]:null;}
try{document['addEventListener']('click',function(ev){
  var btn=ev['target']&&ev['target']['closest']&&ev['target']['closest']('button');
  if(!btn||btn!==dvxMtNativeBtn())return;
  if(dvxMt){ev['preventDefault'](),ev['stopImmediatePropagation'](),dvxMtStop();return;}
  if(dvxMtNative||/stop/i['test'](btn['textContent']||'')){dvxMtNative=false;return;}
  var S=dvxAuxSpecs['filter'](function(x){return x['p']===Q['micTestSource'];})[0]||null;
  ev['preventDefault'](),ev['stopImmediatePropagation'](),dvxMtStart(S,btn);
},!![]);}catch(dvxMT0){}
function dvxMtMount(){
  if(dvxMt&&dvxMt['btn']&&!dvxMt['btn']['isConnected'])dvxMtStop();
  var mt=document['querySelector']('[role="dialog"] [class*="micTest__"]');if(!mt||!mt['parentElement'])return;
  dvxMtIdle(mt);
  var row=document['getElementById']('dvx-mt-row');
  if(row&&mt['parentElement']['contains'](row))return;
  if(row&&row['parentNode'])row['parentNode']['removeChild'](row);
  row=document['createElement']('div'),row['id']='dvx-mt-row',row['style']['cssText']='order:-1;display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:6px';
  var l=document['createElement']('span'),sel=document['createElement']('select');
  l['style']['cssText']='font-size:12px;line-height:16px;color:var(--text-muted,#949ba4)',l['textContent']='Test input';
  sel['id']='dvx-mt-src',sel['setAttribute']('aria-label','Mic Test input');
  sel['style']['cssText']='min-width:220px;height:32px;box-sizing:border-box;background:var(--background-secondary,#2b2d31);color:var(--text-strong,#f2f3f5);border:1px solid rgb(var(--hc-accent-rgb,175 227 127) / .16);border-radius:8px;padding:0 10px;font-size:14px;outline:none;cursor:pointer';
  for(var i=0;i<dvxMtSources['length'];i++){var o=document['createElement']('option');o['value']=dvxMtSources[i][0],o['textContent']=dvxMtSources[i][1],sel['appendChild'](o);}
  sel['value']=Q['micTestSource']==='sec'||Q['micTestSource']==='thr'?Q['micTestSource']:'main';
  sel['onchange']=function(){dvxMtStop();var nb=dvxMtNativeBtn();if(nb&&/stop/i['test'](nb['textContent']||''))nb['click']();Q['micTestSource']=sel['value'],e4();};
  var dg=document['createElement']('div'),dl=document['createElement']('span'),ms=document['createElement']('select');
  dg['style']['cssText']='display:flex;align-items:center;gap:10px;margin-left:auto';
  dl['style']['cssText']=l['style']['cssText']+';transition:opacity .15s';
  ms['setAttribute']('aria-label','While testing'),ms['style']['cssText']='min-width:130px;height:32px';
  [['deafen','Deafen'],['mute','Mute only']]['forEach'](function(p){var o=document['createElement']('option');o['value']=p[0],o['textContent']=p[1],ms['appendChild'](o);});
  ms['value']=Q['micTestDeafenMode']==='mute'?'mute':'deafen';
  function paintDg(){var on=Q['micTestDeafen']!==false;dl['style']['opacity']=on?'1':'.5',dl['textContent']=Q['micTestDeafenMode']==='mute'?'Mute while testing':'Deafen while testing',ms['disabled']=!on;}
  ms['onchange']=function(){Q['micTestDeafenMode']=ms['value']==='mute'?'mute':'deafen',e4(),paintDg();};
  var dw=dvxSwitch('dvx-mt-deaf','Silence yourself while testing',function(){return Q['micTestDeafen']!==false;},function(v){Q['micTestDeafen']=v,paintDg();});
  dvxAuxStyle(),paintDg();
  dg['appendChild'](dl),dg['appendChild'](dw),dg['appendChild'](dvxDd(ms));
  row['appendChild'](l),row['appendChild'](dvxDd(sel)),row['appendChild'](dg),mt['parentElement']['appendChild'](row);
}
function dvxGainSync(){for(var i=0;i<dvxGainChains.length;i++){try{dvxGainChains[i]['node']['gain']['value']=dvxMicLevel();}catch(dvxG5){}dvxBalance(dvxGainChains[i]['panOut'],dvxGainChains[i]['lim']['in'],dvxPanOf('micPan'),1);}try{dvxLimSync();}catch(dvxGL2){}try{window['__hcSpkApply']&&window['__hcSpkApply']();}catch(dvxG6){}dvxReverbSync();try{dvxEqSync();}catch(dvxEQ1){}try{dvxMicSync();}catch(dvxSY){}try{dvxCodecSync();}catch(dvxSP8){}}
var dvxAuxSpecs=[
  {'p':'sec','label':'Secondary Microphone','on':'secondaryMic','dev':'secondaryMicDevice','gain':'secondaryMicGain','pan':'secondaryMicPan'},
  {'p':'thr','label':'Third Microphone','on':'thirdMic','dev':'thirdMicDevice','gain':'thirdMicGain','pan':'thirdMicPan'}
],dvxAuxDevices=[],dvxAuxDevSig='',dvxAuxMountId='dvx-aux-mics',dvxAuxLastErr={'sec':null,'thr':null};
// Extra speakers: the audio guard below plays call audio on these devices too and reports back in window.__hcSpkStatus.
var dvxSpkSpecs=[
  {'p':'spk2','label':'Secondary Speaker','on':'secondarySpeaker','dev':'secondarySpeakerDevice','gain':'secondarySpeakerGain','pan':'secondarySpeakerPan','out':1},
  {'p':'spk3','label':'Third Speaker','on':'thirdSpeaker','dev':'thirdSpeakerDevice','gain':'thirdSpeakerGain','pan':'thirdSpeakerPan','out':1}
],dvxSpkDevices=[],dvxSpkDevSig='',dvxSpkMountId='dvx-aux-spks';
try{window['__hcExtraSpk']=function(){return dvxSpkSpecs['map'](function(S){return{'p':S['p'],'on':dvxAuxOn(S),'dev':dvxAuxDevice(S),'gain':dvxAuxGainValue(S),'pan':dvxPanOf(S['pan'])};});};}catch(dvxSK0){}
try{navigator['mediaDevices']['addEventListener']('devicechange',function(){dvxAuxRetryAll(),dvxAuxLoadDevices(function(){dvxAuxUIRefresh();});});}catch(dvxE20){}
function dvxAuxOn(S){return!!Q[S['on']];}
function dvxAuxDevice(S){return String(Q[S['dev']]||'');}
function dvxAuxGainValue(S){var v=Number(Q[S['gain']]);if(!isFinite(v)||v<0)v=0;if(v>10)v=10;return v;}
// Extra mics join after Discord's mute point (it disables the raw mic track), so they follow that track's enabled flag.
function dvxAuxLevel(dvxG,S){try{if(dvxG['raw']&&dvxG['raw']['enabled']===![])return 0;}catch(dvxE30){}return dvxAuxGainValue(S);}
function dvxAuxGateAll(){for(var i=0;i<dvxGainChains['length'];i++)for(var j=0;j<dvxAuxSpecs['length'];j++){var dvxG=dvxGainChains[i],dvxN=dvxG[dvxAuxSpecs[j]['p']+'Gain'];if(dvxN)try{dvxN['gain']['value']=dvxAuxLevel(dvxG,dvxAuxSpecs[j]);}catch(dvxE31){}}}
try{var dvxEnD=Object['getOwnPropertyDescriptor'](MediaStreamTrack['prototype'],'enabled');if(dvxEnD&&dvxEnD['set']&&dvxEnD['configurable'])Object['defineProperty'](MediaStreamTrack['prototype'],'enabled',{'configurable':!![],'enumerable':dvxEnD['enumerable'],'get':dvxEnD['get'],'set':function(dvxV){dvxEnD['set']['call'](this,dvxV);try{if(this['kind']==='audio'&&dvxGainChains['length'])dvxAuxGateAll();}catch(dvxE32){}}});}catch(dvxE33){}
function dvxAuxKey(S){return(dvxAuxOn(S)?1:0)+'|'+dvxAuxDevice(S)+'|'+(dvxBypass()?1:0)+(dvxVp('echoCancellation')?1:0)+(dvxVp('noiseSuppression')?1:0)+(dvxVp('autoGainControl')?1:0);}
function dvxAuxSetStatus(S,dvxText,dvxErr){try{var dvxEl=document['getElementById']('dvx-'+S['p']+'-status');if(dvxEl)dvxEl['textContent']=dvxText,dvxEl['style']['color']=dvxErr?'#ed4245':dvxText==='Live'?'var(--hc-accent)':'var(--hc-text-muted)';}catch(dvxE0){}}
function dvxAuxClose(dvxG,S){var dvxP=S['p'];try{if(dvxG[dvxP+'Raw'])dvxG[dvxP+'Raw']['getTracks']()['forEach'](function(dvxT){try{dvxT['stop']();}catch(dvxE1){}});}catch(dvxE2){}try{dvxG[dvxP+'Gain']&&dvxG[dvxP+'Gain']['disconnect']();}catch(dvxE3){}try{dvxG[dvxP+'Gain']&&dvxG[dvxP+'Gain']['__hcBal']&&dvxG[dvxP+'Gain']['__hcBal']['out']['disconnect']();}catch(dvxE3b){}try{dvxG[dvxP+'Src']&&dvxG[dvxP+'Src']['disconnect']();}catch(dvxE4){}dvxG[dvxP+'Raw']=null,dvxG[dvxP+'Gain']=null,dvxG[dvxP+'Src']=null,dvxG[dvxP+'Key']=null,dvxG[dvxP+'FailKey']=null,dvxG[dvxP+'FailAt']=0,dvxG[dvxP+'Err']=null,dvxAuxLastErr[dvxP]=null;}
function dvxAuxConstraints(S){var dvxC={'echoCancellation':dvxBypass()?![]:!!dvxVp('echoCancellation'),'noiseSuppression':dvxBypass()?![]:!!dvxVp('noiseSuppression'),'autoGainControl':dvxBypass()?![]:!!dvxVp('autoGainControl')},dvxDev=dvxAuxDevice(S);if(dvxDev)dvxC['deviceId']={'exact':dvxDev};return{'audio':dvxC};}
function dvxAuxOpen(dvxG,S){
  var dvxP=S['p'],dvxKey=dvxAuxKey(S);
  if(!dvxAuxOn(S))return;
  if(dvxG[dvxP+'Key']===dvxKey||dvxG[dvxP+'FailKey']===dvxKey)return;
  dvxAuxClose(dvxG,S),dvxG[dvxP+'Key']=dvxKey,dvxAuxSetStatus(S,'Connecting...');
  try{
    (typeof eI==='function'?eI(dvxAuxConstraints(S)):Promise['reject'](new Error('getUserMedia unavailable')))['then'](function(dvxSt){
      if(dvxG[dvxP+'Key']!==dvxKey){try{dvxSt['getTracks']()['forEach'](function(dvxT){try{dvxT['stop']();}catch(dvxE5){}});}catch(dvxE6){}return;}
      try{
        var dvxSrc=dvxG['ctx']['createMediaStreamSource'](dvxSt),dvxNode=dvxG['ctx']['createGain']();
        dvxNode['gain']['value']=dvxAuxLevel(dvxG,S);
        try{dvxSrc['channelInterpretation']='speakers';}catch(dvxE7){}
        try{dvxNode['channelInterpretation']='speakers';}catch(dvxE8){}
        dvxSrc['connect'](dvxNode),dvxNode['connect'](dvxG['dest']),dvxBalance(dvxNode,dvxG['dest'],dvxPanOf(S['pan']),1);
        dvxG[dvxP+'Raw']=dvxSt,dvxG[dvxP+'Src']=dvxSrc,dvxG[dvxP+'Gain']=dvxNode,dvxG[dvxP+'Err']=null,dvxAuxLastErr[dvxP]=null;
        dvxAuxSetStatus(S,'Live');
        e7('aux mic '+dvxP+': live');
      }catch(dvxE9){dvxG[dvxP+'Key']=null,dvxG[dvxP+'Err']=(dvxE9&&dvxE9['name'])||'failed',dvxAuxLastErr[dvxP]=dvxG[dvxP+'Err'],dvxG[dvxP+'FailKey']=dvxKey;dvxAuxSetStatus(S,'Error: '+dvxG[dvxP+'Err'],!![]);}
    })['catch'](function(dvxErr){
      if(dvxG[dvxP+'Key']!==dvxKey)return;
      dvxG[dvxP+'Key']=null,dvxG[dvxP+'Err']=(dvxErr&&dvxErr['name'])||'failed',dvxAuxLastErr[dvxP]=dvxG[dvxP+'Err'],dvxG[dvxP+'FailKey']=dvxKey;
      dvxAuxSetStatus(S,'Error: '+dvxG[dvxP+'Err'],!![]);
      e7('aux mic '+dvxP+' error: '+dvxG[dvxP+'Err']);
    });
  }catch(dvxEX){dvxG[dvxP+'Key']=null,dvxG[dvxP+'Err']='failed',dvxAuxLastErr[dvxP]='failed',dvxG[dvxP+'FailKey']=dvxKey;}
}
function dvxAuxSync(dvxG,S){
  var dvxP=S['p'],dvxKey=dvxAuxKey(S);
  if(!dvxAuxOn(S)){if(dvxG[dvxP+'Raw']||dvxG[dvxP+'Key']||dvxG[dvxP+'FailKey'])dvxAuxClose(dvxG,S);return'off';}
  if(dvxG[dvxP+'Raw']&&dvxG[dvxP+'Key']===dvxKey){try{if(dvxG[dvxP+'Gain'])dvxG[dvxP+'Gain']['gain']['value']=dvxAuxLevel(dvxG,S),dvxBalance(dvxG[dvxP+'Gain'],dvxG['dest'],dvxPanOf(S['pan']),1);}catch(dvxE10){}return'live';}
  if(dvxG[dvxP+'FailKey']===dvxKey){var dvxNow=Date['now']();if(!dvxG[dvxP+'FailAt'])dvxG[dvxP+'FailAt']=dvxNow;if(dvxNow-dvxG[dvxP+'FailAt']<1e4)return'error';dvxG[dvxP+'FailKey']=null,dvxG[dvxP+'FailAt']=0;}
  if(dvxG[dvxP+'Raw']||dvxG[dvxP+'Key']!==dvxKey)dvxAuxOpen(dvxG,S);
  if(dvxG[dvxP+'Raw'])return'live';
  if(dvxG[dvxP+'Key'])return'connecting';
  if(dvxG[dvxP+'FailKey']===dvxKey)return'error';
  return'idle';
}
function dvxMicSync(){
  for(var i=0;i<dvxAuxSpecs['length'];i++){
    var S=dvxAuxSpecs[i],dvxLive=![],dvxErr=![],dvxConn=![];
    for(var j=0;j<dvxGainChains['length'];j++){
      if(dvxGainChains[j]['noAux'])continue;
      var dvxSt=dvxAuxSync(dvxGainChains[j],S);
      if(dvxSt==='live')dvxLive=!![];else if(dvxSt==='error')dvxErr=!![];else if(dvxSt==='connecting')dvxConn=!![];
    }
    if(!dvxAuxOn(S))dvxAuxSetStatus(S,'Off');
    else if(dvxLive)dvxAuxSetStatus(S,'Live');
    else if(dvxErr)dvxAuxSetStatus(S,'Error: '+(dvxAuxLastErr[S['p']]||'failed'),!![]);
    else if(dvxConn)dvxAuxSetStatus(S,'Connecting...');
    else dvxAuxSetStatus(S,dvxGainChains['length']?'Waiting':'Waiting for microphone');
  }
}
function dvxAuxRetryAll(){for(var i=0;i<dvxGainChains['length'];i++){var dvxG=dvxGainChains[i];for(var j=0;j<dvxAuxSpecs['length'];j++){var dvxP=dvxAuxSpecs[j]['p'];dvxG[dvxP+'FailKey']=null,dvxG[dvxP+'Err']=null;}}}
function dvxAuxLoadDevices(dvxCb){
  try{navigator['mediaDevices']['enumerateDevices']()['then'](function(dvxAll){
    var dvxIn=[],dvxSig=[],dvxOut=[],dvxOSig=[];
    dvxAll['forEach'](function(dvxD){if(!dvxD)return;var dvxK=String(dvxD['deviceId']||'')+'|'+String(dvxD['label']||'');if(dvxD['kind']==='audioinput')dvxIn['push'](dvxD),dvxSig['push'](dvxK);else if(dvxD['kind']==='audiooutput')dvxOut['push'](dvxD),dvxOSig['push'](dvxK);});
    dvxAuxDevices=dvxIn,dvxAuxDevSig=dvxSig['join']('||'),dvxSpkDevices=dvxOut,dvxSpkDevSig=dvxOSig['join']('||');
    try{dvxCb&&dvxCb();}catch(dvxE11){}
  })['catch'](function(){try{dvxCb&&dvxCb();}catch(dvxE12){}});}catch(dvxE13){}
}
function dvxAuxPaintRange(dvxGr){try{var dvxMin=Number(dvxGr['min'])||0,dvxMax=Number(dvxGr['max'])||10,dvxPct=(Number(dvxGr['value'])-dvxMin)/(dvxMax-dvxMin)*100,dvxBg='var(--dvx-track)';if(dvxPct<0)dvxPct=0;if(dvxPct>100)dvxPct=100;if(dvxMin<0){var dvxA=Math['min'](50,dvxPct),dvxZ=Math['max'](50,dvxPct);dvxGr['style']['background']='linear-gradient(to right,'+dvxBg+' '+dvxA+'%,var(--hc-accent,#AFE37F) '+dvxA+'%,var(--hc-accent,#AFE37F) '+dvxZ+'%,'+dvxBg+' '+dvxZ+'%)';return;}dvxGr['style']['background']='linear-gradient(to right,var(--hc-accent,#AFE37F) '+dvxPct+'%,'+dvxBg+' '+dvxPct+'%)';}catch(dvxE24){}}
// HaloCord dropdown: keeps the native <select> as the data model (options, value, onchange) and draws a dark pill and menu over it.
var dvxDdSeq=0,dvxDdOpen=null,dvxSelDesc=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value');
function dvxDdStyle(){
  if(document.getElementById('dvx-dd-styles'))return;
  var s=document.createElement('style');s.id='dvx-dd-styles';
  s.textContent='.dvx-dd{position:relative;display:inline-flex;min-width:0;max-width:100%;flex:0 1 auto}.dvx-dd>select{display:none!important}'+
  '.dvx-dd-btn{position:relative;display:flex;align-items:center;width:100%;min-width:0;min-height:34px;box-sizing:border-box;margin:0;padding:0 36px 0 12px;border:1px solid rgb(var(--hc-accent-rgb) / 16%);border-radius:10px;background:var(--hc-row-bg);color:var(--hc-text);font:inherit;font-size:14px;font-weight:500;line-height:18px;text-align:left;cursor:pointer;transition:border-color .15s,box-shadow .15s}'+
  '.dvx-dd-btn:hover:not(:disabled),.dvx-dd.open .dvx-dd-btn{border-color:rgb(var(--hc-accent-rgb) / 55%);box-shadow:0 0 0 1px rgb(var(--hc-accent-rgb) / 18%),0 0 14px rgb(var(--hc-accent-rgb) / 22%)}'+
  '.dvx-dd-btn:focus-visible{outline:2px solid var(--hc-accent);outline-offset:2px}.dvx-dd-btn:disabled{opacity:.5;cursor:not-allowed}'+
  '.dvx-dd-lbl{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
  '.dvx-dd-btn::after{content:"";position:absolute;right:15px;top:50%;width:6px;height:6px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:translateY(-70%) rotate(45deg);opacity:.7;transition:transform .15s}'+
  '.dvx-dd.open .dvx-dd-btn::after{transform:translateY(-25%) rotate(225deg)}'+
  '.dvx-dd-menu{position:fixed;z-index:1000001;box-sizing:border-box;max-height:280px;overflow-y:auto;padding:4px;border:1px solid var(--hc-panel-border);border-radius:10px;background:var(--hc-window-bg);box-shadow:0 12px 32px rgb(0 0 0 / 50%);outline:none;scrollbar-width:thin;scrollbar-color:var(--hc-scroll-thumb) transparent;font-family:var(--font-primary,sans-serif)}'+
  '.dvx-dd-opt{padding:8px 10px;border-radius:6px;font-size:14px;line-height:18px;color:var(--hc-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}'+
  '.dvx-dd-opt.act{background:rgb(var(--hc-accent-rgb) / 14%)}.dvx-dd-opt[aria-selected=true]{color:var(--hc-accent);font-weight:600}.dvx-dd-opt[aria-disabled=true]{opacity:.45;cursor:default}';
  (document.head||document.documentElement).appendChild(s);
}
function dvxDdClose(focusBtn){var d=dvxDdOpen;if(!d)return;dvxDdOpen=null;d.sel._dvxOpen=false;d.w.classList.remove('open');d.btn.setAttribute('aria-expanded','false');if(d.menu.parentNode)d.menu.parentNode.removeChild(d.menu);var doc=d.w.ownerDocument;doc.removeEventListener('pointerdown',d.outside,true);doc.removeEventListener('scroll',d.scroll,true);(doc.defaultView||window).removeEventListener('resize',d.resize);if(focusBtn)try{d.btn.focus();}catch(e){}}
function dvxDd(sel){
  if(sel._dvxDd)return sel._dvxDd;
  dvxDdStyle();
  var id='dvx-dd-'+(++dvxDdSeq),w=document.createElement('div'),btn=document.createElement('button'),lbl=document.createElement('span'),menu=document.createElement('div'),act=-1,st;
  w.className='dvx-dd';btn.type='button';btn.className='dvx-dd-btn';lbl.className='dvx-dd-lbl';btn.appendChild(lbl);
  btn.setAttribute('aria-haspopup','listbox');btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-controls',id);
  if(sel.getAttribute('aria-label'))btn.setAttribute('aria-label',sel.getAttribute('aria-label'));
  menu.id=id;menu.className='dvx-dd-menu';menu.tabIndex=-1;menu.setAttribute('role','listbox');
  w.style.margin=sel.style.margin;if(sel.style.width){w.style.width=sel.style.width;w.style.display='flex';}if(sel.style.minWidth)w.style.minWidth=sel.style.minWidth;if(sel.style.height)btn.style.height=sel.style.height;
  sel.style.cssText='';w.appendChild(sel);w.appendChild(btn);
  function opts(){return sel.options;}
  function paint(){var o=sel.options[sel.selectedIndex];var t=o?o.textContent:'';if(lbl.textContent!==t)lbl.textContent=t;btn.disabled=!!sel.disabled;if(sel.disabled&&dvxDdOpen&&dvxDdOpen.w===w)dvxDdClose(false);}
  function setAct(i,scroll){var k=menu.children;if(act>=0&&k[act])k[act].classList.remove('act');act=i;if(i>=0&&k[i]){k[i].classList.add('act');menu.setAttribute('aria-activedescendant',k[i].id);if(scroll)k[i].scrollIntoView({block:'nearest'});}}
  function step(from,dir){var o=opts();for(var i=from+dir;i>=0&&i<o.length;i+=dir)if(!o[i].disabled)return i;return from;}
  function choose(i){var o=opts()[i];if(!o||o.disabled)return;dvxDdClose(true);if(sel.selectedIndex!==i){dvxSelDesc.set.call(sel,o.value);paint();sel.dispatchEvent(new Event('change',{bubbles:true}));}}
  function place(){var r=btn.getBoundingClientRect(),vh=(w.ownerDocument.defaultView||window).innerHeight,h=Math.min(menu.scrollHeight,280),below=vh-r.bottom-8;menu.style.minWidth=r.width+'px';menu.style.left=r.left+'px';menu.style.top=(below<h&&r.top>below?Math.max(8,r.top-4-h):r.bottom+4)+'px';}
  function open(){
    if(sel.disabled)return;dvxDdClose(false);
    var o=opts(),doc=w.ownerDocument;menu.textContent='';act=-1;
    for(var i=0;i<o.length;i++)(function(i){var d=doc.createElement('div');d.id=id+'-'+i;d.className='dvx-dd-opt';d.setAttribute('role','option');d.textContent=o[i].textContent;d.setAttribute('aria-selected',String(i===sel.selectedIndex));if(o[i].disabled)d.setAttribute('aria-disabled','true');d.onmousedown=function(e){e.preventDefault();};d.onclick=function(){choose(i);};d.onmouseenter=function(){if(!o[i].disabled)setAct(i,false);};menu.appendChild(d);})(i);
    doc.body.appendChild(menu);place();setAct(sel.selectedIndex>=0?sel.selectedIndex:step(-1,1),true);
    st={w:w,sel:sel,btn:btn,menu:menu,outside:function(e){if(!menu.contains(e.target)&&!w.contains(e.target))dvxDdClose(false);},scroll:function(e){if(!menu.contains(e.target))dvxDdClose(false);},resize:function(){dvxDdClose(false);}};
    dvxDdOpen=st;sel._dvxOpen=true;w.classList.add('open');btn.setAttribute('aria-expanded','true');
    doc.addEventListener('pointerdown',st.outside,true);doc.addEventListener('scroll',st.scroll,true);(doc.defaultView||window).addEventListener('resize',st.resize);
    menu.focus({preventScroll:true});
  }
  btn.onclick=function(){if(dvxDdOpen&&dvxDdOpen.w===w)dvxDdClose(true);else open();};
  btn.onkeydown=function(e){if(e.key==='ArrowDown'||e.key==='ArrowUp'||e.key==='Enter'||e.key===' '){e.preventDefault();open();}};
  menu.onkeydown=function(e){
    var o=opts(),k=e.key;
    if(k==='Escape'){e.preventDefault();e.stopPropagation();dvxDdClose(true);return;}
    if(k==='Tab'){dvxDdClose(false);return;}
    e.preventDefault();e.stopPropagation();
    if(k==='ArrowDown')setAct(step(act,1),true);else if(k==='ArrowUp')setAct(step(act,-1),true);
    else if(k==='Home')setAct(step(-1,1),true);else if(k==='End')setAct(step(o.length,-1),true);
    else if(k==='Enter'||k===' ')choose(act);
    else if(k.length===1){var c=k.toLowerCase();for(var n=1;n<=o.length;n++){var j=(act+n)%o.length;if(!o[j].disabled&&(o[j].textContent||'').trim().toLowerCase().indexOf(c)===0){setAct(j,true);break;}}}
  };
  Object.defineProperty(sel,'value',{configurable:true,get:function(){return dvxSelDesc.get.call(sel);},set:function(v){dvxSelDesc.set.call(sel,v);paint();}});
  Object.defineProperty(w,'value',{configurable:true,get:function(){return sel.value;},set:function(v){sel.value=v;}});
  Object.defineProperty(w,'disabled',{configurable:true,get:function(){return sel.disabled;},set:function(v){sel.disabled=!!v;}});
  w.select=sel;
  try{new MutationObserver(paint).observe(sel,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['disabled']});}catch(e){}
  paint();sel._dvxDd=w;return w;
}
function dvxAuxStyle(){
  try{
    if(document['getElementById']('dvx-aux-styles'))return;
    var dvxS=document['createElement']('style');dvxS['id']='dvx-aux-styles';
    dvxS['textContent']=':root{--dvx-track:color-mix(in srgb,var(--hc-text-muted) 42%,transparent)}[data-dvx-main] .dvx-aux-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:16px;height:16px;border-radius:50%;background:var(--hc-accent,#AFE37F);box-shadow:0 0 0 3px rgb(var(--hc-accent-rgb,175 227 127) / .20);cursor:pointer}[data-dvx-main] .dvx-aux-range{-webkit-appearance:none;appearance:none;width:100%;height:8px;border-radius:4px;outline:none;cursor:pointer;background:var(--dvx-track)}[data-dvx-main] .dvx-aux-range:disabled{cursor:default}.dvx-switch{position:relative;flex:none;width:34px;height:20px;border:0;padding:0;border-radius:10px;cursor:pointer;background:var(--background-modifier-accent,#4e5058);transition:background .15s}.dvx-switch::after{content:\'\';position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:#f2f3f5;transition:transform .15s}.dvx-switch[aria-checked=true]{background:var(--hc-accent,#AFE37F)}.dvx-switch[aria-checked=true]::after{transform:translateX(14px);background:#1e1f22}.dvx-switch:focus-visible{outline:2px solid var(--hc-accent,#AFE37F);outline-offset:2px}button[data-dvx-testing]{position:relative}button[data-dvx-testing]>*{visibility:hidden}button[data-dvx-testing]::after{content:\'Stop Testing\';position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:500}[data-dvx-aux] .dvx-aux-range{-webkit-appearance:none;appearance:none;width:100%;height:8px;border-radius:4px;outline:none;cursor:pointer;background:var(--dvx-track)}[data-dvx-aux] .dvx-aux-range:disabled{cursor:default}html.hc-theming [data-dvx-voice-card] [role="combobox"],html.hc-theming [data-dvx-voice-card] [class*="micTest__"] button{transition:border-color .15s,box-shadow .15s}html.hc-theming [data-dvx-voice-card] [role="combobox"]:hover,html.hc-theming [data-dvx-voice-card] [role="combobox"][aria-expanded="true"]{border-color:rgb(var(--hc-accent-rgb) / 55%);box-shadow:0 0 0 1px rgb(var(--hc-accent-rgb) / 18%),0 0 14px rgb(var(--hc-accent-rgb) / 22%)}html.hc-theming [data-dvx-voice-card] [class*="micTest__"] button:hover:not(:disabled){box-shadow:0 0 0 1px rgb(var(--hc-accent-rgb) / 18%),0 0 14px rgb(var(--hc-accent-rgb) / 22%)}html.hc-theming [data-dvx-voice-card]{padding:16px!important;border:1px solid var(--background-modifier-accent,rgba(255,255,255,.06));border-radius:11px;background:var(--background-secondary,#2b2d31);box-sizing:border-box}[data-dvx-aux] .dvx-aux-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:16px;height:16px;border-radius:50%;background:var(--hc-accent,#AFE37F);box-shadow:0 0 0 3px rgb(var(--hc-accent-rgb,175 227 127) / .20);cursor:pointer}';
    (document['head']||document['documentElement'])['appendChild'](dvxS);
  }catch(dvxE25){}
}
function dvxAuxFill(S){
  var dvxSel=document['getElementById']('dvx-'+S['p']+'-select');if(!dvxSel)return;
  if(document['activeElement']===dvxSel||dvxSel['_dvxOpen'])return;
  var dvxList=S['out']?dvxSpkDevices:dvxAuxDevices,dvxCur=dvxAuxDevice(S),dvxSig=(S['out']?dvxSpkDevSig:dvxAuxDevSig)+'|'+dvxCur+'|'+(dvxAuxOn(S)?1:0);
  if(dvxSel['__dvxSig']!==dvxSig){
    dvxSel['__dvxSig']=dvxSig;
    var dvxFound=![],dvxOpts=[['',S['out']?'System default output':'System default input']];
    for(var i=0;i<dvxList['length'];i++){var dvxD=dvxList[i],dvxId=String(dvxD['deviceId']||'');if(!dvxId)continue;if(dvxId===dvxCur)dvxFound=!![];dvxOpts['push']([dvxId,dvxD['label']||((S['out']?'Output ':'Input ')+(i+1))]);}
    if(dvxCur!==''&&!dvxFound)dvxOpts['push']([dvxCur,'(selected device not connected)']);
    dvxSel['innerHTML']='';
    for(var k=0;k<dvxOpts['length'];k++){var dvxO=document['createElement']('option');dvxO['value']=dvxOpts[k][0],dvxO['textContent']=dvxOpts[k][1],dvxSel['appendChild'](dvxO);}
    dvxSel['value']=dvxCur;
  }
  var dvxOn=dvxAuxOn(S);
  var dvxGw=document['getElementById']('dvx-'+S['p']+'-gainwrap');if(dvxGw)dvxGw['style']['opacity']=dvxOn?'1':'0.55';
  var dvxGr=document['getElementById']('dvx-'+S['p']+'-gain');if(dvxGr){dvxGr['disabled']=!dvxOn;if(document['activeElement']!==dvxGr)dvxGr['value']=String(dvxAuxGainValue(S));dvxAuxPaintRange(dvxGr);}
  var dvxGv=document['getElementById']('dvx-'+S['p']+'-gainval');if(dvxGv)dvxGv['textContent']=String(Math['round'](dvxAuxGainValue(S)*10)/10)+'x';
  dvxPanFill('dvx-'+S['p']+'-pan',S['pan'],dvxOn);var dvxSw=document['getElementById']('dvx-'+S['p']+'-switch');if(dvxSw)dvxSwitchPaint(dvxSw,dvxOn);
}
function dvxSpkStatus(S){var dvxM=null;try{dvxM=window['__hcSpkStatus']&&window['__hcSpkStatus'][S['p']];}catch(dvxSK1){}var dvxT=!dvxAuxOn(S)?'Off':dvxM||'Waiting for a call';dvxAuxSetStatus(S,dvxT,dvxT['indexOf']('Error')===0);}
function dvxAuxUIRefresh(){
  if(document['getElementById'](dvxSpkMountId)){dvxMainFill(dvxMainSpecs['spk']);for(var j=0;j<dvxSpkSpecs['length'];j++)dvxAuxFill(dvxSpkSpecs[j]),dvxSpkStatus(dvxSpkSpecs[j]);}
  if(!document['getElementById'](dvxAuxMountId))return;
  dvxMainFill(dvxMainSpecs['mic']);
  for(var i=0;i<dvxAuxSpecs['length'];i++)dvxAuxFill(dvxAuxSpecs[i]);
  dvxMicSync();
}
function dvxAuxBuildRow(S,dvxLabel){
  var dvxWrap=document['createElement']('div'),dvxLab=dvxLabel['cloneNode'](![]),dvxLabRow=document['createElement']('div'),dvxSt=document['createElement']('span'),dvxSel=document['createElement']('select'),dvxGw=document['createElement']('div'),dvxGh=document['createElement']('div'),dvxGl=document['createElement']('div'),dvxGv=document['createElement']('span'),dvxGr=document['createElement']('input');
  dvxWrap['setAttribute']('data-dvx-aux',S['p']),dvxWrap['style']['marginTop']='16px';
  dvxLab['textContent']=S['label'],dvxLab['removeAttribute']('for'),dvxLab['removeAttribute']('id');
  dvxLab['style']['margin']='0',dvxLabRow['style']['cssText']='display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:24px;margin-bottom:8px',dvxLabRow['appendChild'](dvxLab);
  dvxSt['id']='dvx-'+S['p']+'-status',dvxSt['style']['cssText']='font-size:12px;line-height:16px;color:var(--hc-text-muted);text-align:right',dvxSt['textContent']='Off';
  var dvxRt=document['createElement']('div');dvxRt['style']['cssText']='display:flex;align-items:center;gap:10px';
  dvxRt['appendChild'](dvxSt),dvxRt['appendChild'](dvxSwitch('dvx-'+S['p']+'-switch',S['label'],function(){return dvxAuxOn(S);},function(v){Q[S['on']]=v;}));
  dvxLabRow['appendChild'](dvxRt),dvxWrap['appendChild'](dvxLabRow);
  dvxSel['id']='dvx-'+S['p']+'-select',dvxSel['setAttribute']('aria-label',S['label']);
  dvxSel['style']['cssText']='width:100%;height:40px;box-sizing:border-box;background:var(--background-secondary,#2b2d31);color:var(--text-strong,#f2f3f5);border:1px solid rgb(var(--hc-accent-rgb,175 227 127) / .16);border-radius:10px;padding:0 12px;font-size:14px;outline:none;cursor:pointer';
  dvxSel['onchange']=function(){Q[S['on']]=!![],Q[S['dev']]=dvxSel['value'],e4();},dvxWrap['appendChild'](dvxDd(dvxSel));
  dvxGw['id']='dvx-'+S['p']+'-gainwrap',dvxGw['style']['cssText']='margin-top:10px';
  dvxGh['style']['cssText']='display:flex;align-items:center;justify-content:space-between;margin-bottom:4px';
  dvxGl['style']['cssText']='font-size:12px;line-height:16px;color:var(--text-muted,#949ba4)',dvxGl['textContent']='Volume';
  dvxGv['id']='dvx-'+S['p']+'-gainval',dvxGv['style']['cssText']='font-size:12px;line-height:16px;color:var(--text-muted,#949ba4)',dvxGv['textContent']='1x';
  dvxGh['appendChild'](dvxGl),dvxGh['appendChild'](dvxGv);
  dvxGr['id']='dvx-'+S['p']+'-gain',dvxGr['type']='range',dvxGr['min']='0',dvxGr['max']='10',dvxGr['step']='0.1',dvxGr['className']='dvx-aux-range',dvxGr['value']=String(dvxAuxGainValue(S)),dvxAuxPaintRange(dvxGr);
  dvxGr['oninput']=function(){Q[S['gain']]=Number(dvxGr['value']),dvxGv['textContent']=String(Math['round'](Q[S['gain']]*10)/10)+'x',dvxAuxPaintRange(dvxGr),e4();},dvxGw['appendChild'](dvxGh),dvxGw['appendChild'](dvxGr),dvxWrap['appendChild'](dvxGw);
  dvxWrap['appendChild'](dvxSlider('dvx-'+S['p']+'-pan','Pan',-1,1,0.05,function(){return Number(Q[S['pan']])||0;},function(v){Q[S['pan']]=v;},dvxPanText));
  return dvxWrap;
}
function dvxMicMount(){
  try{
    if(!document['querySelector']('ul[data-list-id="settings-sidebar"]'))return;
    var dvxLabels=document['querySelectorAll']('label,h2,h3'),dvxMic=null,dvxSpk=null,dvxI,dvxTxt;
    for(dvxI=0;dvxI<dvxLabels['length'];dvxI++){if(dvxLabels[dvxI]['children']['length']!==0)continue;dvxTxt=dvxLabels[dvxI]['textContent']['trim']();if(dvxTxt==='Microphone')dvxMic=dvxMic||dvxLabels[dvxI];else if(dvxTxt==='Speaker')dvxSpk=dvxSpk||dvxLabels[dvxI];}
    if(!dvxMic||!dvxSpk)return;
    if(!dvxMic['closest']('[role="dialog"]'))return;
    var dvxField=dvxMic['parentElement']&&dvxMic['parentElement']['parentElement'];
    if(!dvxField||!dvxField['querySelector']('[aria-haspopup="listbox"]'))return;
    var dvxIns=dvxField['parentElement']||dvxField,dvxHolder=document['getElementById'](dvxAuxMountId);
    dvxVoiceCard(dvxIns),dvxSpkMount(dvxSpk);
    try{dvxMainSwitch(dvxMainSpecs['mic'],dvxMic),dvxMainSwitch(dvxMainSpecs['spk'],dvxSpk),dvxMtMount(),dvxPanNote(),dvxProfileHide(),dvxProfileQueue();}catch(dvxE14b){}
    if(dvxHolder&&dvxIns['contains'](dvxHolder)){dvxAuxUIRefresh();return;}
    if(dvxHolder&&dvxHolder['parentNode'])dvxHolder['parentNode']['removeChild'](dvxHolder);
    dvxAuxStyle();
    dvxHolder=document['createElement']('div'),dvxHolder['id']=dvxAuxMountId,dvxHolder['style']['cssText']='width:100%;margin-top:4px';
    dvxHolder['appendChild'](dvxMainRows(dvxMainSpecs['mic']));
    for(dvxI=0;dvxI<dvxAuxSpecs['length'];dvxI++)dvxHolder['appendChild'](dvxAuxBuildRow(dvxAuxSpecs[dvxI],dvxMic));
    dvxIns['appendChild'](dvxHolder),dvxAuxLoadDevices(function(){dvxAuxUIRefresh();}),dvxAuxUIRefresh();
  }catch(dvxE14){}
}
// The Mic/Speaker/volume/Mic Test block gets a bordered card like the EQ card: the first ancestor holding the volume rows.
function dvxVoiceCard(dvxFrom){var dvxDlg=dvxFrom['closest']('[role="dialog"]');for(var dvxE=dvxFrom['parentElement'];dvxE&&dvxE!==dvxDlg;dvxE=dvxE['parentElement']){if(dvxE['querySelector']('[data-dvx-vol]')){if(!dvxE['hasAttribute']('data-dvx-voice-card'))dvxE['setAttribute']('data-dvx-voice-card','1');return;}}}
function dvxSpkMount(dvxLabel){
  var dvxF=dvxLabel['parentElement']&&dvxLabel['parentElement']['parentElement'];
  if(!dvxF||!dvxF['querySelector']('[aria-haspopup="listbox"]'))return;
  var dvxIns=dvxF['parentElement']||dvxF,dvxH=document['getElementById'](dvxSpkMountId);
  if(dvxH&&dvxIns['contains'](dvxH))return;
  if(dvxH&&dvxH['parentNode'])dvxH['parentNode']['removeChild'](dvxH);
  dvxAuxStyle();
  dvxH=document['createElement']('div'),dvxH['id']=dvxSpkMountId,dvxH['style']['cssText']='width:100%;margin-top:4px';
  dvxH['appendChild'](dvxMainRows(dvxMainSpecs['spk']));
  for(var i=0;i<dvxSpkSpecs['length'];i++)dvxH['appendChild'](dvxAuxBuildRow(dvxSpkSpecs[i],dvxLabel));
  dvxIns['appendChild'](dvxH),dvxAuxLoadDevices(function(){dvxAuxUIRefresh();});
}

var dvxReverbTimer=null,dvxReverbSizeCache=null,dvxReverbIrKey=null,dvxReverbIrBuf=null;
function dvxReverbWet(){if(![])return 0;var v=Number(Q['micReverb']);if(!isFinite(v)||v<0)v=0;if(v>100)v=100;return(v/100)*0.85;}
function dvxReverbSize(){var v=Number(Q['micReverbSize']);if(!isFinite(v)||v<0.2)v=0.2;if(v>6)v=6;return v;}
function dvxReverbTone(){var v=Number(Q['micReverbTone']);if(!isFinite(v)||v<1500)v=1500;if(v>16000)v=16000;return v;}
function dvxReverbIr(dvxCtx,dvxSize){
  try{
    var dvxSr=dvxCtx['sampleRate']||48000;
    var dvxKey=Math['round'](dvxSize*1000)+':'+dvxSr;
    if(dvxReverbIrKey===dvxKey&&dvxReverbIrBuf)return dvxReverbIrBuf;
    var dvxLen=Math['max'](1,Math['round'](dvxSize*dvxSr)),dvxPre=Math['round'](0.012*dvxSr);
    var dvxBuf=dvxCtx['createBuffer'](2,dvxLen,dvxSr);
    var dvxRefl=[[0.019,0.5],[0.031,0.42],[0.047,0.34],[0.063,0.26],[0.081,0.2],[0.103,0.15]];
    for(var dvxCh=0;dvxCh<2;dvxCh++){
      var dvxData=dvxBuf['getChannelData'](dvxCh),dvxLp=0;
      for(var dvxI=0;dvxI<dvxLen;dvxI++){
        if(dvxI<dvxPre){dvxData[dvxI]=0;continue;}
        var dvxT=(dvxI-dvxPre)/(dvxLen-dvxPre),dvxEnv=Math['pow'](1-dvxT,1.8),dvxNoise=Math['random']()*2-1;
        dvxLp=dvxLp+0.42*(dvxNoise-dvxLp);
        dvxData[dvxI]=dvxLp*dvxEnv;
      }
      for(var dvxR=0;dvxR<dvxRefl.length;dvxR++){
        var dvxIdx=dvxPre+Math['round'](dvxRefl[dvxR][0]*dvxSr)+(dvxCh?Math['round'](0.0025*dvxSr):0);
        if(dvxIdx<dvxLen)dvxData[dvxIdx]+=(dvxCh?-1:1)*dvxRefl[dvxR][1];
      }
    }
    var dvxEnergy=0;
    for(var dvxCh2=0;dvxCh2<2;dvxCh2++){var dvxD2=dvxBuf['getChannelData'](dvxCh2);for(var dvxJ=0;dvxJ<dvxLen;dvxJ++)dvxEnergy+=dvxD2[dvxJ]*dvxD2[dvxJ];}
    if(dvxEnergy>0){var dvxS=1/Math['sqrt'](dvxEnergy/2);for(var dvxCh3=0;dvxCh3<2;dvxCh3++){var dvxD3=dvxBuf['getChannelData'](dvxCh3);for(var dvxK=0;dvxK<dvxLen;dvxK++)dvxD3[dvxK]*=dvxS;}}
    dvxReverbIrKey=dvxKey,dvxReverbIrBuf=dvxBuf;
    return dvxBuf;
  }catch(dvxRE1){return null;}
}
function dvxReverbRoute(dvxNode,dvxConv){try{if(dvxReverbWet()>0.0005){try{dvxNode['connect'](dvxConv);}catch(dvxRE2){}}else{try{dvxNode['disconnect'](dvxConv);}catch(dvxRE3){}}}catch(dvxRE4){}}
function dvxReverbSync(){
  for(var i=0;i<dvxGainChains.length;i++){
    var dvxG=dvxGainChains[i];
    try{dvxG['wet']['gain']['value']=dvxReverbWet();}catch(dvxRE5){}
    try{dvxG['lp']['frequency']['value']=dvxReverbTone();}catch(dvxRE6){}
    dvxReverbRoute(dvxG['eqOut']||dvxG['node'],dvxG['conv']);
  }
  var dvxWant=Math['round'](dvxReverbSize()*1000);
  if(dvxReverbSizeCache!==dvxWant){
    dvxReverbSizeCache=dvxWant;
    if(dvxReverbTimer)clearTimeout(dvxReverbTimer);
    dvxReverbTimer=setTimeout(function(){
      dvxReverbTimer=null;
      for(var j=0;j<dvxGainChains.length;j++){try{dvxGainChains[j]['conv']['buffer']=dvxReverbIr(dvxGainChains[j]['ctx'],dvxReverbSize());}catch(dvxRE7){}}
    },150);
  }
}var dvxSpkRng=123456789;
function dvxSpkRand(){dvxSpkRng=(dvxSpkRng*1103515245+12345)&0x7fffffff;return dvxSpkRng/0x7fffffff;}
function dvxSpkProcessor(dvxCtx){try{var dvxProc=dvxCtx['createScriptProcessor'](4096,1,1);var dvxSr=dvxCtx['sampleRate']||48000;var dvxMode='speex';var dvxBW=2*Math['PI']*2400/dvxSr,dvxBC=Math['cos'](dvxBW),dvxBS=Math['sin'](dvxBW),dvxBA=dvxBS/1.41421356,dvxBN=1/(1+dvxBA),dvxBB0=((1-dvxBC)/2)*dvxBN,dvxBB1=(1-dvxBC)*dvxBN,dvxBB2=dvxBB0,dvxBA1=(-2*dvxBC)*dvxBN,dvxBA2=(1-dvxBA)*dvxBN;var dvxP1x1=0,dvxP1x2=0,dvxP1y1=0,dvxP1y2=0,dvxP2x1=0,dvxP2x2=0,dvxP2y1=0,dvxP2y2=0;var dvxPhase=0,dvxAcc=0,dvxAccN=0,dvxHold=0,dvxLp=0,dvxPrev=0,dvxHp=0,dvxDropLeft=0,dvxEnv=0,dvxLfo=0,dvxDpos=0,dvxDelay=new Float32Array(64);dvxProc['dvxSetMode']=function(dvxM){dvxMode=(dvxM==='xma')?'xma':'speex';dvxPhase=0;dvxAcc=0;dvxAccN=0;dvxHold=0;dvxLp=0;dvxPrev=0;dvxHp=0;dvxDropLeft=0;dvxEnv=0;dvxLfo=0;dvxDpos=0;dvxP1x1=0;dvxP1x2=0;dvxP1y1=0;dvxP1y2=0;dvxP2x1=0;dvxP2x2=0;dvxP2y1=0;dvxP2y2=0;for(var dvxI=0;dvxI<dvxDelay['length'];dvxI++)dvxDelay[dvxI]=0;};dvxProc['onaudioprocess']=function(dvxEv){var dvxIn=dvxEv['inputBuffer']['getChannelData'](0),dvxOut=dvxEv['outputBuffer']['getChannelData'](0),dvxN=dvxOut['length'];var dvxXma=(dvxMode==='xma');var dvxF=dvxSr/(dvxXma?16000:8000);if(!(dvxF>=1))dvxF=1;for(var i=0;i<dvxN;i++){dvxAcc+=dvxIn[i];dvxAccN++;dvxPhase++;if(dvxPhase>=dvxF){dvxPhase-=dvxF;var dvxS=dvxAcc/dvxAccN;dvxAcc=0;dvxAccN=0;if(dvxXma){dvxHp=dvxHp+0.046*(dvxS-dvxHp);var dvxHx=dvxS-dvxHp;var dvxAv=dvxHx<0?-dvxHx:dvxHx;dvxEnv=(dvxAv>dvxEnv)?dvxEnv+0.0308*(dvxAv-dvxEnv):dvxEnv+0.00052*(dvxAv-dvxEnv);var dvxG=(dvxEnv>0.07)?Math['pow'](0.07/dvxEnv,0.9):1;var dvxV=dvxHx*dvxG*2.2;var dvxM=dvxV<0?-dvxV:dvxV;if(dvxM>1)dvxM=1;var dvxQ=Math['round'](Math['log'](1+255*dvxM)/Math['log'](256)*127)/127;var dvxDq=(Math['pow'](256,dvxQ)-1)/255;dvxV=dvxV<0?-dvxDq:dvxDq;dvxV*=1.5;if(dvxV>1)dvxV=1;if(dvxV<-1)dvxV=-1;dvxLfo+=0.00025;if(dvxLfo>1)dvxLfo-=1;var dvxDs=3+((dvxLfo*3)|0);var dvxDel=dvxDelay[(dvxDpos-dvxDs+dvxDelay['length'])%dvxDelay['length']];dvxDelay[dvxDpos]=dvxV;dvxDpos=(dvxDpos+1)%dvxDelay['length'];dvxV=dvxV*0.88+dvxDel*0.14;dvxHold=dvxV;if(dvxDropLeft>0)dvxDropLeft--;else if(dvxSpkRand()<0.00008)dvxDropLeft=8+((dvxSpkRand()*50)|0);if(dvxDropLeft>0)dvxHold*=0.35;}else{dvxHp=0.94*(dvxHp+dvxS-dvxPrev);dvxPrev=dvxS;dvxLp=dvxLp+0.72*(dvxHp-dvxLp);var dvxV2=dvxLp,dvxM=dvxV2<0?-dvxV2:dvxV2;if(dvxM>1)dvxM=1;var dvxQ=Math['round'](Math['log'](1+255*dvxM)/Math['log'](256)*127)/127;var dvxDc=(Math['pow'](256,dvxQ)-1)/255;dvxV2=dvxV2<0?-dvxDc:dvxDc;dvxV2*=1.35;if(dvxV2>1)dvxV2=1;if(dvxV2<-1)dvxV2=-1;dvxHold=dvxV2;if(dvxDropLeft>0)dvxDropLeft--;else if(dvxSpkRand()<0.00012)dvxDropLeft=20+((dvxSpkRand()*120)|0);if(dvxDropLeft>0)dvxHold=0;}}if(dvxXma){var dvxPy=dvxBB0*dvxHold+dvxBB1*dvxP1x1+dvxBB2*dvxP1x2-dvxBA1*dvxP1y1-dvxBA2*dvxP1y2;dvxP1x2=dvxP1x1;dvxP1x1=dvxHold;dvxP1y2=dvxP1y1;dvxP1y1=dvxPy;var dvxPy2=dvxBB0*dvxPy+dvxBB1*dvxP2x1+dvxBB2*dvxP2x2-dvxBA1*dvxP2y1-dvxBA2*dvxP2y2;dvxP2x2=dvxP2x1;dvxP2x1=dvxPy;dvxP2y2=dvxP2y1;dvxP2y1=dvxPy2;dvxOut[i]=dvxPy2*1.8;}else{dvxOut[i]=dvxHold;}}};return dvxProc;}catch(dvxSPp){return null;}}
function dvxCodecMode(){return 'opus';}
function dvxCodecSync(){var dvxMode=dvxCodecMode(),dvxOn=dvxMode!=='opus';for(var i=0;i<dvxGainChains.length;i++){var dvxG=dvxGainChains[i];try{if(dvxG['dryGain'])dvxG['dryGain']['gain']['value']=dvxOn?0:1;}catch(dvxSPs1){}try{if(dvxG['spkGain'])dvxG['spkGain']['gain']['value']=dvxOn?0.5:0;}catch(dvxSPs2){}try{if(dvxG['spkHp'])dvxG['spkHp']['frequency']['value']=(dvxMode==='xma')?120:300;}catch(dvxSPs6){}try{if(dvxG['spkLp'])dvxG['spkLp']['frequency']['value']=(dvxMode==='xma')?4400:3400;}catch(dvxSPs7){}try{if(dvxG['spkProc']&&dvxG['spkProc']['dvxSetMode'])dvxG['spkProc']['dvxSetMode'](dvxMode);}catch(dvxSPs5){}}try{dvxReverbSync();}catch(dvxSPs3){}try{dvxCodecPaint();}catch(dvxSPs4){}}
function dvxCodecPaint(){var dvxMode=dvxCodecMode(),dvxOn=dvxMode!=='opus';try{var dvxRoot=document['getElementById']('dvx-native-settings');if(dvxRoot){if(dvxOn)dvxRoot['classList']['add']('dvx-speex-on');else dvxRoot['classList']['remove']('dvx-speex-on');var dvxSt=dvxRoot['querySelector']('.kc-codec-status');if(dvxSt)dvxSt['textContent']=dvxMode==='xma'?'XMA 2009 Modern Warfare 2 is on: your mic runs through the Xbox 360 XMA-style game-audio path and the controls below are locked.':dvxMode==='speex'?'Speex 2009 Xbox Live is on: your mic runs through the 8 kHz low-bitrate Speex path and the controls below are locked.':'Opus (default): every control below is active.';}}catch(dvxSPp1){}try{var dvxLive=document['getElementById']('vc-quick-voice-panel');if(dvxLive){if(dvxOn)dvxLive['classList']['add']('kc-speex-on');else dvxLive['classList']['remove']('kc-speex-on');}}catch(dvxSPp2){}}
try{setInterval(function(){try{dvxCodecPaint();}catch(dvxSPt){}},1000);}catch(dvxSPt2){}
// Discord web sends the mic all the time and only the speaking flag (voice activity or push to talk) tells the voice
// server to pass it on, and that flag comes from an analyser on Discord's raw mic stream. The processed mix (gain,
// secondary and third mic) only exists on the track swapped into the sender, so speech on the extra mics never set the
// flag and was dropped. Hand Discord the mix of the mic's own chain instead; HaloCord's own nodes still get the raw track.
function dvxMixFor(dvxCx,dvxS){try{if(!G['replaceProcessedTrack']||!dvxS||!dvxS['getAudioTracks'])return dvxS;var dvxTs=dvxS['getAudioTracks']();if(dvxTs['length']!==1||!dvxIsMic(dvxTs[0]))return dvxS;for(var i=dvxGainChains['length']-1;i>=0;i--){var dvxG=dvxGainChains[i];if(dvxG['raw']===dvxTs[0]&&dvxG['ctx']!==dvxCx){var dvxT=dvxG['dest']['stream']['getAudioTracks']()[0];if(dvxT&&dvxT['readyState']==='live')return new MediaStream([dvxT]);}}}catch(dvxMX){}return dvxS;}
var dvxGainNoAux=false;
function dvxGainTrack(dvxRaw){try{if(!dvxRaw||dvxRaw['kind']!=='audio')return dvxRaw;for(var i=0;i<dvxGainChains.length;i++){if(dvxGainChains[i]['raw']===dvxRaw){var dvxT=dvxGainChains[i]['dest']['stream']['getAudioTracks']()[0];if(dvxT)return dvxT;}}dvxGainPrune();var dvxAC=window['AudioContext']||window['webkitAudioContext'];if(!dvxAC)return dvxRaw;var dvxRate=0;try{dvxRate=Number(dvxRaw['getSettings']()['sampleRate'])||0;}catch(dvxG6){}var dvxCtx=null;try{var dvxPick=Number(Q['micRate'])||dvxRate||48e3;if(dvxPick>96e3)dvxPick=96e3;if(dvxPick<8e3)dvxPick=48e3;dvxCtx=new dvxAC({'sampleRate':dvxPick});}catch(dvxG7){try{dvxCtx=new dvxAC();}catch(dvxG8){return dvxRaw;}}var dvxSrc=dvxCtx['createMediaStreamSource'](new MediaStream([dvxRaw])),dvxNode=dvxCtx['createGain'](),dvxDest=dvxCtx['createMediaStreamDestination']();try{dvxSrc['channelInterpretation']='speakers';}catch(dvxG9){}try{dvxDest['channelInterpretation']='speakers';}catch(dvxGA){}dvxNode['gain']['value']=dvxMicLevel();dvxSrc['connect'](dvxNode);var dvxPanOut=dvxCtx['createGain'](),dvxLim=dvxLimit(dvxCtx,'mic');dvxPanOut['connect'](dvxLim['in']);dvxLim['out']['connect'](dvxDest);dvxBalance(dvxPanOut,dvxLim['in'],dvxPanOf('micPan'),1);var dvxVstIn=dvxCtx['createGain']();var dvxEqs=dvxEqBuild(dvxCtx,dvxNode,dvxVstIn),dvxEqOut=dvxEqs['length']?dvxEqs[dvxEqs['length']-1]:dvxNode;var dvxDryGain=dvxCtx['createGain'](),dvxSpkIn=dvxCtx['createGain'](),dvxSpkHp=dvxCtx['createBiquadFilter'](),dvxSpkLp=dvxCtx['createBiquadFilter'](),dvxSpkProc=dvxSpkProcessor(dvxCtx),dvxSpkGain=dvxCtx['createGain']();dvxVstIn['connect'](dvxDryGain),dvxDryGain['connect'](dvxPanOut);try{dvxSpkHp['type']='highpass',dvxSpkHp['frequency']['value']=300,dvxSpkHp['Q']['value']=0.7;}catch(dvxSP4){}try{dvxSpkLp['type']='lowpass',dvxSpkLp['frequency']['value']=3400,dvxSpkLp['Q']['value']=0.7;}catch(dvxSP5){}try{dvxNode['connect'](dvxSpkIn),dvxSpkIn['connect'](dvxSpkHp),dvxSpkHp['connect'](dvxSpkLp);if(dvxSpkProc){dvxSpkLp['connect'](dvxSpkProc),dvxSpkProc['connect'](dvxSpkGain);}dvxSpkGain['connect'](dvxPanOut);}catch(dvxSP6){}var dvxConv=dvxCtx['createConvolver'](),dvxLp=dvxCtx['createBiquadFilter'](),dvxWet=dvxCtx['createGain']();try{dvxLp['type']='lowpass',dvxLp['frequency']['value']=dvxReverbTone();}catch(dvxG10){}dvxWet['gain']['value']=dvxReverbWet();try{dvxConv['normalize']=![];}catch(dvxG11){}dvxConv['buffer']=dvxReverbIr(dvxCtx,dvxReverbSize());dvxEqOut['connect'](dvxConv),dvxConv['connect'](dvxLp),dvxLp['connect'](dvxWet),dvxWet['connect'](dvxPanOut);dvxReverbRoute(dvxEqOut,dvxConv);dvxGainChains['push']({'raw':dvxRaw,'ctx':dvxCtx,'src':dvxSrc,'node':dvxNode,'dest':dvxDest,'eq':dvxEqs,'eqOut':dvxEqOut,'conv':dvxConv,'lp':dvxLp,'wet':dvxWet,'dryGain':dvxDryGain,'spkIn':dvxSpkIn,'spkHp':dvxSpkHp,'spkLp':dvxSpkLp,'spkProc':dvxSpkProc,'spkGain':dvxSpkGain,'panOut':dvxPanOut,'lim':dvxLim,'noAux':dvxGainNoAux});try{dvxCodecSync();}catch(dvxSP7){}try{for(var dvxAJ=0;!dvxGainNoAux&&dvxAJ<dvxAuxSpecs['length'];dvxAJ++)dvxAuxOpen(dvxGainChains[dvxGainChains.length-1],dvxAuxSpecs[dvxAJ]);}catch(dvxSG){}try{dvxCtx['state']==='suspended'&&dvxCtx['resume']();}catch(dvxGB){}try{dvxCtx['addEventListener']('statechange',function(){try{if(dvxCtx['state']!=='running'&&dvxCtx['state']!=='closed')dvxCtx['resume']();}catch(dvxSC){}});}catch(dvxSC1){}try{dvxRaw['addEventListener']('ended',dvxGainPrune);}catch(dvxGC){}var dvxOut=dvxDest['stream']['getAudioTracks']()[0];return dvxOut||dvxRaw;}catch(dvxGD){return dvxRaw;}}function eQ(){var Gm=+Q['vW']>0x9d*0x3a+0x1638+-0x1*0x39ca?+Q['vW']:0x14c3*-0x1+0x255d+-0x48d*0x2,GO=+Q['vH']>-0xf16+0x21ae+-0x1298*0x1?+Q['vH']:0xc84+0x219a+-0x1*0x29e6,Gz=+Q['vFps']>0x3*0x55d+0x1*-0x108b+-0x2*-0x3a?+Q['vFps']:-0x89e*0x1+-0x2*0x8ae+0x1a36;return{'w':Gm,'h':GO,'fr':Gz,'px':Gm*GO,'bMin':+Q['vbMin']>0?+Q['vbMin']:0x1e8480,'bTarget':+Q['vbTarget']>0?+Q['vbTarget']:0x7a1200,'bMax':+Q['vbMax']>0?+Q['vbMax']:0xb71b00};}function eG(){var Gm=P(),GO=Math['max'](0x283b2*0x2+0x68a3b+-0x8c5*0x73,Math['round'](Gm['bitrate']*(0x82*-0x1+0x1dbf+0x1f3*-0xf+0.65)));return{'w':Gm['width'],'h':Gm['height'],'fr':Gm['fps'],'px':Gm['width']*Gm['height'],'bMin':GO,'bTarget':Gm['bitrate'],'bMax':Gm['bitrate'],'mode':Gm['mode'],'priority':'high'};}function en(Gm){return!!(Gm&&(Gm['mandatory']&&Gm['mandatory']['chromeMediaSource']||Gm['chromeMediaSource']||Gm['mediaSource']||Gm['displaySurface']||Gm['mozMediaSource']));}function eC(Gm){try{if(Gm&&Gm['__kurtcordDisplayTrack'])return!![];var GO=Gm&&Gm['getSettings']?Gm['getSettings']():{};return!!(GO['displaySurface']||GO['logicalSurface']);}catch(Gz){return![];}}function eL(Gm){if(!Gm&&Gm!==!![])return Gm;var GO=Gm===!![]?{}:Object['assign']({},Gm);if(en(GO))return GO;var Gz=eQ();return GO['width']={'ideal':Gz['w']},GO['height']={'ideal':Gz['h']},GO['frameRate']={'ideal':Gz['fr']},GO['aspectRatio']={'ideal':(0x6dc+-0x1b05*-0x1+0x313*-0xb)/(-0x1*0x171c+0x1b92+-0x46d)},GO;}function ea(Gm){var GO=Gm===!![]||Gm==null?{}:Object['assign']({},Gm),Gz=Q['screenShareAdvanced']?eG():eQ();return GO['width']={'ideal':Gz['w']},GO['height']={'ideal':Gz['h']},GO['frameRate']={'ideal':Gz['fr']},GO;}function eb(Gm,GO){if(!Gm&&Gm!==!![])return GO?{}:Gm;if(Gm===!![])return GO?{}:!![];if(typeof Gm!=='object')return GO?{}:!![];var Gz=Object['assign']({},Gm);if(en(Gz))return Gz;var GZ={};return['deviceId','groupId','facingMode']['forEach'](function(Gd){if(Gz[Gd]!=null)GZ[Gd]=Gz[Gd];}),Object['keys'](GZ)['length']?GZ:GO?{}:!![];}function eH(Gm){if(!Gm)return![];var GO=Gm['name']||'',Gz=String(Gm['constraint']||'');if(GO==='OverconstrainedError')return!Gz||/width|height|frameRate|aspectRatio|resizeMode|deviceId|groupId|facingMode/i['test'](Gz);return GO==='NotReadableError'||GO==='NotFoundError'||GO==='AbortError';}(function(){try{var Gm=window['MediaStreamTrack']&&MediaStreamTrack['prototype'];if(!Gm||!Gm['applyConstraints'])return;var GO=Gm['applyConstraints'];Gm['applyConstraints']=function(Gz){var GZ=this,Gd=eC(GZ);if(this['kind']!=='video')return GO['call'](this,Gz);if(!Q['videoHD']&&!(Gd&&Q['screenShareAdvanced']))return GO['call'](this,Gz);if(Gd&&!(Q['videoGoLive']||Q['screenShareAdvanced']))return GO['call'](GZ,Gz);var GY=Gd?ea(Gz||{}):eL(Gz||{});return GO['call'](GZ,GY)['catch'](function(Gx){if(eH(Gx)){if(Gd){try{e7('display\x20applyConstraints\x20'+(Gx['name']||'error')+'\x20-\x20retrying\x20without\x20HD\x20display\x20constraints');}catch(GU){}return GO['call'](GZ,Gz||{});}try{e7('video\x20applyConstraints\x20'+(Gx['name']||'error')+'\x20-\x20retrying\x20selected\x20camera\x20without\x20HD\x20capture\x20constraints');}catch(Gy){}return GO['call'](GZ,eb(Gz||{},!![]));}throw Gx;});},Gm['applyConstraints']['toString']=function(){return GO['toString']();};}catch(Gz){}}());function eq(Gm,GO){var Gz=GO?eG():eQ(),GZ=Math['round'](Gz['bMax']),Gd=Math['round'](Gz['bMin']),GY=Math['round'](Gz['bTarget']);for(var Gx=-0x169*-0xa+0x239a+0x4*-0xc6d;Gx<Gm['length'];Gx++){var GU=Gm[Gx];if(!GU||typeof GU!=='object')continue;GU['maxBitrate']=GZ,GU['minBitrate']=Gd,GU['targetBitrate']=GY,GU['maxFrameRate']=Gz['fr'],GU['maxFramerate']=Gz['fr'],GU['maxPixelCount']=Gz['px'],GU['maxResolution']={'type':'fixed','width':Gz['w'],'height':Gz['h']},GU['quality']=-0x2*0x63a+0x7*-0x1f7+0x1a99,GU['localWant']=-0x2024*-0x1+-0xa2f+-0x1591;if('width'in GU)GU['width']=Gz['w'];if('height'in GU)GU['height']=Gz['h'];}}function eR(Gm){if(!Gm||typeof Gm!=='object'||!Q['screenShareAdvanced'])return Gm;var GO=eG();return Gm['bitrateMin']=GO['bMin'],Gm['bitrateTarget']=GO['bTarget'],Gm['bitrateMax']=GO['bMax'],Gm['capture']=Object['assign']({},Gm['capture']||{},{'width':GO['w'],'height':GO['h'],'framerate':GO['fr'],'pixelCount':GO['px']}),Gm['encode']=Object['assign']({},Gm['encode']||{},{'width':GO['w'],'height':GO['h'],'framerate':GO['fr'],'pixelCount':GO['px']}),Gm;}function ei(Gm){if(!Gm||typeof Gm!=='object')return![];var GO=![];['canUseHighVideoUploadQuality','canStreamQuality']['forEach'](function(Gz){try{if(typeof Gm[Gz]==='function'&&!Gm[Gz]['__dvxSS']){var GZ=Gm[Gz];Gm[Gz]=function(){return!![];},Gm[Gz]['toString']=function(){return GZ['toString']();},Gm[Gz]['__dvxSS']=!![],GO=!![];}}catch(Gd){}});try{Object['prototype']['hasOwnProperty']['call'](Gm,'guildPremiumTier')&&(delete Gm['guildPremiumTier'],GO=!![]);}catch(Gz){}return GO;}function eo(Gm){if(!Gm||typeof Gm!=='object'||Gm['__dvxDesktopBitrate'])return![];if(!Gm['desktopBitrate']||typeof Gm['desktopBitrate']!=='object')return![];var GO=Object['assign']({},Gm['desktopBitrate']);try{return Object['defineProperty'](Gm,'desktopBitrate',{'configurable':!![],'enumerable':!![],'get':function(){if(!Q['screenShareAdvanced'])return Object['assign']({},GO);var Gz=eG();return Object['assign']({},GO,{'min':Math['min'](GO['min']||-0x4a6d6*-0x1+0x523f*-0x3+0x3f107,Gz['bMin']),'target':Gz['bTarget'],'max':Math['max'](GO['max']||-0xc1*-0x20+-0x2026+-0x4f*-0x1a,Gz['bMax'])});}}),Gm['__dvxDesktopBitrate']=!![],!![];}catch(Gz){return![];}}function eV(Gm){return Gm&&(typeof Gm['setGoliveQuality']==='function'||typeof Gm['setDesktopEncodingOptions']==='function'||typeof Gm['getDefaultGoliveQuality']==='function');}function eX(Gm){if(!Gm||Gm['__dvxGolive'])return;Gm['__dvxGolive']=!![];if(typeof Gm['getDefaultGoliveQuality']==='function'){var GO=Gm['getDefaultGoliveQuality'];Gm['getDefaultGoliveQuality']=function(){return eR(GO['apply'](this,arguments));};}if(typeof Gm['setGoliveQuality']==='function'){var Gz=Gm['setGoliveQuality'];Gm['setGoliveQuality']=function(Gd){if(Gd&&typeof Gd==='object')arguments[0x1eb0+0x169e+-0x354e]=eR(Object['assign']({},Gd));return Gz['apply'](this,arguments);};}if(typeof Gm['setDesktopEncodingOptions']==='function'){var GZ=Gm['setDesktopEncodingOptions'];Gm['setDesktopEncodingOptions']=function(Gd,GY,Gx){if(Q['screenShareAdvanced']){var GU=eG();arguments[-0xa3a+0x2*-0x1c3+0x6e0*0x2]=GU['w'],arguments[0x1649+-0x1bc5*-0x1+0x10af*-0x3]=GU['h'],arguments[-0x2*-0x95e+-0x1f00+0xc46]=GU['fr'];}return GZ['apply'](this,arguments);};}e7('screenshare:\x20GoLive\x20encoder\x20wrapped');}function eh(Gm){return Gm&&(typeof Gm['getVideoQuality']==='function'||typeof Gm['getQuality']==='function'||typeof Gm['getVideoQualityForSsrc']==='function'||typeof Gm['getDefaultGoliveQuality']==='function'||typeof Gm['applyQualityConstraints']==='function'||typeof Gm['getQualityConstraints']==='function');}function eD(Gm){if(!Gm)return![];var GO=typeof Gm['updateVideoQuality']==='function'||typeof Gm['initializeStreamParameters']==='function';if(!GO)return![];return typeof Gm['setVideoStreamParameters']==='function'||typeof Gm['getStreamParameters']==='function'||'videoStreamParameters'in Gm||'_videoStreamParameters'in Gm;}function eS(Gm){if(!Gm||Gm['__dvxVQM'])return;Gm['__dvxVQM']=!![];var GO=[['getVideoQuality',![]],['getQuality',![]],['getVideoQualityForSsrc',![]],['getDefaultGoliveQuality',!![]]];GO['forEach'](function(Gz){var GZ=Gz[-0x1de8+-0x1*0x22ad+0x4095],Gd=Gz[-0x1*-0x120d+0x1457+0x2663*-0x1];if(typeof Gm[GZ]!=='function')return;var GY=Gm[GZ];Gm[GZ]=function(){var Gx=GY['apply'](this,arguments);if(!Gx||typeof Gx!=='object')return Gx;if(Gd&&!(Q['videoGoLive']||Q['screenShareAdvanced']))return Gx;var GU=Gd&&Q['screenShareAdvanced']?eG():eQ();if(Gx['capture']!=null)Gx['capture']={'width':GU['w'],'height':GU['h'],'framerate':GU['fr'],'pixelCount':GU['px']};if(Gx['encode']!=null)Gx['encode']={'width':GU['w'],'height':GU['h'],'framerate':GU['fr'],'pixelCount':GU['px']};if('bitrateMin'in Gx)Gx['bitrateMin']=GU['bMin'];if('bitrateTarget'in Gx)Gx['bitrateTarget']=GU['bTarget'];if('bitrateMax'in Gx)Gx['bitrateMax']=GU['bMax'];if('localWant'in Gx)Gx['localWant']=0x250a+0xd4*-0x1+-0xe*0x28f;if('framerate'in Gx)Gx['framerate']=GU['fr'];if('frameRate'in Gx)Gx['frameRate']=GU['fr'];if('maxFramerate'in Gx)Gx['maxFramerate']=GU['fr'];if('maxFrameRate'in Gx)Gx['maxFrameRate']=GU['fr'];if('width'in Gx)Gx['width']=GU['w'];if('height'in Gx)Gx['height']=GU['h'];if(Gx['remoteSinkWants']!=null)Gx['remoteSinkWants']=Object['assign']({},Gx['remoteSinkWants'],{'maxFramerate':GU['fr'],'maxPixelCount':GU['px'],'maxSingleSide':Math['max'](GU['w'],GU['h'])});return Gx;};}),['applyQualityConstraints','getQualityConstraints']['forEach'](function(Gz){if(typeof Gm[Gz]!=='function')return;var GZ=Gm[Gz];Gm[Gz]=function(){var Gd=GZ['apply'](this,arguments);if(!Gd||typeof Gd!=='object')return Gd;var GY=!!(this&&this['isStreamContext']);if(GY&&!(Q['videoGoLive']||Q['screenShareAdvanced']))return Gd;var Gx=GY&&Q['screenShareAdvanced']?eG():eQ(),GU={'encodingVideoWidth':Gx['w'],'encodingVideoHeight':Gx['h'],'encodingVideoFrameRate':Gx['fr'],'captureVideoFrameRate':Gx['fr'],'remoteSinkWantsMaxFramerate':Gx['fr'],'remoteSinkWantsPixelCount':Gx['px'],'encodingVideoBitRate':Gx['bTarget'],'encodingVideoMinBitRate':Gx['bMin'],'encodingVideoMaxBitRate':Gx['bMax']};if('encodingVideoWidth'in Gd||'remoteSinkWantsMaxFramerate'in Gd)Object['assign'](Gd,GU);if(Gd['constraints'])Object['assign'](Gd['constraints'],GU);return Gd['quality']&&(Gd['quality']['bitrateMin']=Gx['bMin'],Gd['quality']['bitrateTarget']=Gx['bTarget'],Gd['quality']['bitrateMax']=Gx['bMax']),Gd;};}),e7('HD\x20video:\x20VideoQualityManager\x20wrapped');}function eE(Gm){if(!Gm||Gm['__dvxBC'])return;Gm['__dvxBC']=!![];if(typeof Gm['getStreamParameters']==='function'){var GO=Gm['getStreamParameters'];Gm['getStreamParameters']=function(){var Gz=GO['apply'](this,arguments);if(!Gz)return Gz;var GZ=!!(this&&this['hasDesktopSource']&&this['hasDesktopSource']());if(GZ&&!(Q['videoGoLive']||Q['screenShareAdvanced']))return Gz;return eq(Array['isArray'](Gz)?Gz:[Gz],GZ&&Q['screenShareAdvanced']),Gz;};}['initializeStreamParameters','updateVideoQuality','setVideoStreamParameters']['forEach'](function(Gz){if(typeof Gm[Gz]!=='function')return;var GZ=Gm[Gz];Gm[Gz]=function(){var Gd=!!(this&&this['hasDesktopSource']&&this['hasDesktopSource']());if(Gd&&!(Q['videoGoLive']||Q['screenShareAdvanced']))return GZ['apply'](this,arguments);var GY=this&&(this['videoStreamParameters']||this['_videoStreamParameters']);if(Array['isArray'](GY))eq(GY,Gd&&Q['screenShareAdvanced']);var Gx=GZ['apply'](this,arguments),GU=this&&(this['videoStreamParameters']||this['_videoStreamParameters']);if(Array['isArray'](GU))eq(GU,Gd&&Q['screenShareAdvanced']);return Gx;};}),e7('HD\x20video:\x20BaseConnection\x20wrapped');}function ej(Gm){if(!Gm||Gm['__dvxEQ'])return;Gm['__dvxEQ']=!![];try{var GO={'videoBudget':Object['assign']({},Gm['videoBudget']),'videoCapture':Object['assign']({},Gm['videoCapture'])};function GZ(Gd){var GY=Object['getOwnPropertyDescriptor'](Gm,Gd);if(GY&&(GY['get']||GY['set']))return;Object['defineProperty'](Gm,Gd,{'configurable':!![],'enumerable':!![],'get':function(){var Gx=eQ();return Object['assign']({},GO[Gd],{'width':Gx['w'],'height':Gx['h'],'framerate':Gx['fr']});}});}GZ('videoBudget'),GZ('videoCapture');if(Gm['videoBitrate']){var Gz=Object['assign']({},Gm['videoBitrate']);Object['defineProperty'](Gm,'videoBitrate',{'configurable':!![],'enumerable':!![],'get':function(){var Gd=eQ();return Object['assign']({},Gz,{'min':Gd['bMin'],'max':Gd['bMax']});}});}Gm['videoBitrateFloor']!=null&&Object['defineProperty'](Gm,'videoBitrateFloor',{'configurable':!![],'enumerable':!![],'get':function(){return eQ()['bMin'];}}),e7('HD\x20video:\x20eQ\x20constants\x20wrapped');}catch(Gd){}}var eW=![];function ev(){if(!Q['videoHD']&&!Q['screenShareAdvanced'])return;var Gm=![],GO=![],Gz=![],GZ=![],Gd=![],GY=![];try{eM(function(Gx){if(!Gx||typeof Gx!=='object'&&typeof Gx!=='function')return;if(ei(Gx))Gd=!![];if(eo(Gx))GY=!![];Q['videoHD']&&!Gz&&Gx['videoBudget']&&Gx['videoBudget']['width']!=null&&Gx['videoCapture']&&Gx['videoCapture']['framerate']!=null&&(ej(Gx),Gz=!![]);var GU=Gx['prototype']||Gx;eV(GU)&&(eX(GU),GZ=!![]),eh(GU)&&(eS(GU),Gm=!![]),eD(GU)&&(eE(GU),GO=!![]);});}catch(Gx){}try{eM(function(GU){try{GU&&GU['connections']&&typeof GU['connections']['forEach']==='function'&&GU['connections']['forEach'](function(Gy){var Gk=!!(Gy&&Gy['hasDesktopSource']&&Gy['hasDesktopSource']());if(Gk&&!(Q['videoGoLive']||Q['screenShareAdvanced']))return;var GM=Gy&&(Gy['videoStreamParameters']||Gy['_videoStreamParameters']);if(Array['isArray'](GM))eq(GM,Gk&&Q['screenShareAdvanced']);try{if(Gy['updateVideoQuality'])Gy['updateVideoQuality']();}catch(GP){}});}catch(Gy){}});}catch(GU){}return(Gm||GO||Gz||GZ||Gd||GY)&&!eW&&(eW=!![],e7('video\x20controls\x20active\x20camera\x20'+eQ()['w']+'x'+eQ()['h']+'@'+eQ()['fr']+'\x20screenshare\x20'+eG()['w']+'x'+eG()['h']+'@'+eG()['fr'])),Gm||GO||Gz||GZ||Gd||GY;}(function(){var Gm=-0x1*-0xb65+-0xc56+0xf1,GO=setInterval(function(){if(!Q['videoHD']&&!Q['screenShareAdvanced']){clearInterval(GO);return;}if(ev()||++Gm>0x1211+-0x1*-0x953+0x1c*-0xf9)clearInterval(GO);},0x12e*-0x7+-0x8a4+-0x9*-0x234);}());var eI=navigator['mediaDevices']['getUserMedia']['bind'](navigator['mediaDevices']);function eg(Gm,GO){if(dvxNative()&&!(Gm&&typeof Gm==='object'&&Gm['__kurtcordDirect']))return GO?(Gm&&typeof Gm==='object'&&Gm['deviceId']?{'deviceId':Gm['deviceId']}:!![]):Gm;var Gz=Gm&&typeof Gm==='object'?Gm['deviceId']:undefined;if(Gm&&typeof Gm==='object'&&Gm['__kurtcordDirect']){var GZ=Number(Gm['sampleRate'])||Number(Q['directSampleRate'])||0xbec1+0x9aec+-0x9e2d;if([-0x417*-0x1b+0x60*0x61+-0x97*-0x45,0xb037+-0x4c83*-0x9+-0x1e9d2]['indexOf'](GZ)<0x1d*-0x72+-0x1559+0x2243)GZ=-0xbf3b+-0x2*-0x8a8+0x1696b;var Gd=Number(Gm['channelCount'])||Number(Q['directChannels'])||-0xb2d+0x27*-0x4b+0x169c;if([0x2253+0x7f9+-0x4b3*0x9,-0x3*0x108+-0xc86+0x1f4*0x8,-0x26f1+-0x4a0+-0x2b95*-0x1,-0x829*-0x1+0x6*0x3fe+0x1*-0x2017,-0x1400+0x1478+0x7*-0x10]['indexOf'](Gd)<-0x9*0x75+0x23*0x10f+-0x1*0x20f0)Gd=0x1*-0x4c7+-0x1c2*-0x5+-0x401;var GY=Number(Gm['sampleSize'])||Number(Q['directBitDepth'])||-0xc9*0xb+-0x1bc7+0x247a*0x1;if([0x1d9*0x5+0x9d6+-0x1303,-0x21f5+-0x167*-0x1b+-0x1e8*0x2,0x220c+0x309+0x1*-0x24f5]['indexOf'](GY)<-0xb51*-0x1+0x15b1+0x32*-0xa9)GY=0x1a6d+0x1*0x22a7+-0x3d04;var Gx={'sampleRate':{'ideal':GZ},'channelCount':{'ideal':Gd},'sampleSize':{'ideal':GY}};Gx['echoCancellation']={'ideal':dvxBypass()?![]:dvxVp('echoCancellation')},Gx['noiseSuppression']={'ideal':dvxBypass()?![]:dvxVp('noiseSuppression')},Gx['autoGainControl']={'ideal':dvxBypass()?![]:dvxVp('autoGainControl')};if(Gz)Gx['deviceId']=Gz;return Gx;}if(GO>=-0x766*-0x2+0x3*-0x379+-0x175*0x3)return Gz?{'deviceId':Gz}:!![];var GU=GO>=-0x10*0x12f+-0x1*-0x247d+-0x118c?'ideal':'exact',Gy={'sampleRate':{'ideal':G['sampleRate']}};if(GO<0x4c7*-0x5+-0x5*0x245+0x233d)Gy['channelCount']={'ideal':G['channelCount']};Gy['echoCancellation']={},Gy['echoCancellation'][GU]=dvxBypass()?![]:dvxVp('echoCancellation'),Gy['noiseSuppression']={},Gy['noiseSuppression'][GU]=dvxBypass()?![]:dvxVp('noiseSuppression'),Gy['autoGainControl']={},Gy['autoGainControl'][GU]=dvxBypass()?![]:dvxVp('autoGainControl');if(Gm&&typeof Gm==='object'){var Gk=Object['assign']({},Gm,Gy);if(Gz)Gk['deviceId']=Gz;return Gk;}return Gy;}navigator['mediaDevices']['getUserMedia']=function(Gm){try{dvxMicLastGumAudio=(Gm&&Gm['audio'])?Gm['audio']:null;}catch(dvxLG){}var GO=Gm&&Gm['audio'],Gz=Gm&&Gm['video'],GZ=![],Gd=![];Gm&&Gm['audio']&&(Gm['audio']=eg(Gm['audio'],0xa7b*0x1+-0x276+0x1*-0x805));if(Q['videoHD']&&Gm&&Gm['video']&&!en(Gm['video']))try{Gm['video']=eL(Gm['video']),GZ=!![];}catch(GU){}if(!(Gm&&(Gm['audio']||Gm['video'])))return eI(Gm);var GY=function(Gy){var Gk=Gy['getAudioTracks']()[0xcdc*0x3+0x15b1+-0x3c45];if(Gk&&(dvxNoteMic(Gk),ee=dvxGainTrack(Gk),dvxStereoAnchor(Gk),Qw(),Qs()),Q['videoHD'])try{Gy['getVideoTracks']()['forEach'](function(Gv){try{var Gs=Gv['getSettings']?Gv['getSettings']():{};Gs['displaySurface']||Gs['logicalSurface']||Gv['__kurtcordDisplayTrack']||(Gv['contentHint']='motion');}catch(Ge){}});}catch(Ge){}return Gy;},Gx=function(Gy){return eI(Gm)['then'](GY)['catch'](function(Gk){if(GZ&&!Gd&&Gz&&eH(Gk))return Gd=!![],e7('video\x20gUM\x20'+(Gk['name']||'error')+'\x20-\x20retrying\x20selected\x20camera\x20without\x20HD\x20capture\x20constraints'),Gm['video']=eb(Gz,![]),new Promise(function(GM){setTimeout(GM,-0x3*0xbec+-0x1*0x21aa+0x4668);})['then'](function(){return Gx(Gy);});if(Gk&&(Gk['name']==='NotReadableError'||Gk['name']==='OverconstrainedError'||Gk['name']==='AbortError')&&GO&&Gy<-0x26c*0x1+-0x2221+0x248f)return e7('audio\x20gUM\x20'+Gk['name']+'\x20-\x20retrying\x20with\x20relaxed\x20audio\x20(level\x20'+(Gy+(-0x64*-0x21+-0x707*-0x5+0x2ab*-0x12))+')'),Gm['audio']=eg(GO,Gy+(0x146*-0x9+0xa85+0xf2)),new Promise(function(GM){setTimeout(GM,-0x455*-0x6+0x5*-0x59d+0x30d);})['then'](function(){return Gx(Gy+(-0x1b91*-0x1+0x2*0xe63+-0x3856));});throw Gk;});};return Gx(-0x3*0xcf7+-0xdc*-0x19+-0x1169*-0x1);};try{var et=navigator['mediaDevices']['getDisplayMedia']&&navigator['mediaDevices']['getDisplayMedia']['bind'](navigator['mediaDevices']);if(et){var ef=function(GO){var Gz=function(GY){try{var Gx=GY&&GY['getVideoTracks']?GY['getVideoTracks']():[];Gx['forEach'](function(GU){try{GU['__kurtcordDisplayTrack']=!![];}catch(Gy){}Q['screenShareAdvanced']&&GU&&GU['applyConstraints']&&GU['applyConstraints'](ea({}))['catch'](function(Gk){try{e7('screenshare\x20applyConstraints\x20'+(Gk&&Gk['name']?Gk['name']:'error')+'\x20-\x20keeping\x20selected\x20source\x20defaults');}catch(GM){}});});}catch(GU){}return GY;},GZ=function(GY){if(!GY||!GY['id'])return Promise['reject'](new DOMException('Screenshare\x20source\x20selection\x20cancelled.','NotAllowedError'));var Gx=Q['screenShareAdvanced']?eG():{'w':0xf00,'h':0x870,'fr':0x3c,'bMax':0x7a1200},GU={'chromeMediaSource':'desktop','chromeMediaSourceId':String(GY['id']),'maxWidth':Math['max'](-0x87*-0x3e+0x2*-0xa4e+-0x716,Math['round'](Gx['w'])),'maxHeight':Math['max'](0xbc4+0x1*0xb59+-0x144d,Math['round'](Gx['h'])),'maxFrameRate':Math['max'](0x1*0x1223+0x1e4*-0x7+-0x4e6*0x1,Math['round'](Gx['fr']||-0x1*0x1dc1+0x1576*0x1+0x887))};return eI({'audio':![],'video':{'mandatory':GU}})['then'](Gz)['catch'](function(Gy){try{e7('desktopCapturer\x20gUM\x20'+(Gy&&Gy['name']?Gy['name']:'error')+'\x20for\x20'+GY['id']+'\x20-\x20falling\x20back\x20to\x20getDisplayMedia');}catch(GM){}var Gk=GO;return Q['screenShareAdvanced']&&GO&&GO['video']&&(Gk=Object['assign']({},GO),Gk['video']=ea(GO['video'])),et(Gk)['then'](Gz);});},Gd=GO;return Q['videoGoLive']&&GO&&GO['video']&&(Gd=Object['assign']({},GO),Gd['video']=ea(GO['video'])),et(Gd)['then'](Gz);};ef['toString']=function(){return et['toString']();};function Gm(){try{navigator['mediaDevices']&&navigator['mediaDevices']['getDisplayMedia']!==ef&&(navigator['mediaDevices']['getDisplayMedia']=ef);}catch(GO){}}Gm(),[0x229d*-0x1+0x2481+0x16*-0x16,-0x6*0x365+0x1115+0x443,-0x3*0x409+-0x2275+-0xa18*-0x5,0x4c6+0x1171+-0xc73,0x1b13+-0xc9e+-0x513*-0x1]['forEach'](function(GO){setTimeout(Gm,GO);});}}catch(GO){}function eB(Gz){if(typeof Gz!=='string'||Gz['indexOf']('a=fmtp:')<-0x1*-0x17d2+0x1f43*-0x1+-0x771*-0x1)return Gz;var GZ=Gz['split'](/\r?\n/),Gd={},GY,Gx;for(GY=-0x1d56+-0x1720+0x3476;GY<GZ['length'];GY++){Gx=/^a=fmtp:(\d+)\s+(.*)$/['exec'](GZ[GY]);if(Gx&&Gd[Gx[-0x67c+-0x1*-0x1e70+0x17f3*-0x1]]===undefined)Gd[Gx[0x19e6+-0x1480+-0x1*0x565]]=Gx[0x2304+0x1*-0x8b+-0x2277*0x1];}var GU=![];for(GY=-0x27f+-0x476*0x5+-0x38b*-0x7;GY<GZ['length'];GY++){Gx=/^a=fmtp:(\d+)\s+(.*)$/['exec'](GZ[GY]);if(Gx){var Gy=Gd[Gx[0x2*-0x901+-0x184*0xc+-0xc11*-0x3]];Gy!==undefined&&Gx[0xc26+-0x1007+0x3e3]!==Gy&&(GZ[GY]='a=fmtp:'+Gx[0xd4b+-0x197d+0xc33]+'\x20'+Gy,GU=!![]);}}if(GU){try{e7('SDP:\x20normalised\x20duplicate\x20fmtp\x20(BUNDLE\x20codec-collision\x20fix)');}catch(Gk){}return GZ['join']('\x0d\x0a');}return Gz;}function eT(Gz,GZ,Gd){if(typeof Gz!=='string'||Gz['indexOf']('opus/48000/2')<0xc*-0x1a+0x837+0x9*-0xc7)return Gz;var GY=GZ!=null?Number(GZ):Number(G['minptime']),Gx=String(Gd!=null?Number(Gd):G['maxptime']||0x1bd9+-0x14a4+-0x6f9),GU=Number(GY)===Number(Gx)?String(GY):null;try{e7('ptime-patch:\x20minptime='+GY+'\x20maxptime='+Gx+'\x20forcePtime='+GU);}catch(n1){}var Gy=Gz['split'](/(?=^m=)/m);for(var Gk=0x4e1*-0x8+0x3df*0x1+0x2329;Gk<Gy['length'];Gk++){if(!/^m=audio\b/m['test'](Gy[Gk])||!/a=rtpmap:\d+\s+opus\/48000\/2/i['test'](Gy[Gk]))continue;var GM=Gy[Gk]['split'](/\r?\n/),GP=[],Gr=![],Gp=![],GK=-(0x1d0e+0x25b*-0xf+-0x3*-0x218);for(var n0=0x2*0xdcd+-0x3e6*0xa+-0x2f*-0x3e;n0<GM['length'];n0++){if(/^a=rtpmap:\d+\s+opus\/48000\/2/i['test'](GM[n0]))GK=GP['length'];if(/^a=maxptime:/i['test'](GM[n0])){!Gr&&(GP['push']('a=maxptime:'+Gx),Gr=!![]);continue;}if(/^a=ptime:/i['test'](GM[n0])){if(GU){!Gp&&(GP['push']('a=ptime:'+GU),Gp=!![]);continue;}}GP['push'](GM[n0]);}if(!Gr){if(GK<0x9ff+-0xf*0x277+0x1afa)GK=-0x1f99+0x79a*-0x2+0x2ecd;GP['splice'](GK+(-0x4c*0x3a+-0x3d*0x81+0x2ff6),-0x163d+0x2e7+0x1356,'a=maxptime:'+Gx);}if(GU&&!Gp){if(GK<0x17*-0x95+-0x82d*-0x4+-0xd7*0x17)GK=0x2291+-0x1*0x1a12+-0x87f;GP['splice'](GK+(Gr?0x1dbe+0x2*0x59f+-0x28fb:-0x61c+0x1519+0x3b*-0x41),0x1668+0x72e*0x3+0x1c2*-0x19,'a=ptime:'+GU);}Gy[Gk]=GP['join']('\x0d\x0a');}return Gy['join']('');}function eJ(Gz){if(typeof Gz!=='string'||!Q['screenShareAdvanced'])return Gz;var GZ=eG(),Gd=Math['max'](0x1b05*-0x1+0x2195+0x2a8*-0x1,Math['round'](GZ['bMax']/(0x15e5+-0x97d+0x88*-0x10))),GY=![];Gz=Gz['replace'](/x-google-max-bitrate=\d+/g,function(){return GY=!![],'x-google-max-bitrate='+Gd;}),Gz=Gz['replace'](/x-google-min-bitrate=\d+/g,function(){return GY=!![],'x-google-min-bitrate='+Math['max'](-0x3f*0x8+-0x1*-0x493+-0x1*0xa7,Math['round'](GZ['bMin']/(0x13dc+-0x679*0x1+-0x97b)));});Gz['indexOf']('level-asymmetry-allowed=1')>=0x2300+-0x136e+0x7c9*-0x2&&Gz['indexOf']('b=AS:'+Gd)<-0x1c88+-0x17d1+0x3459*0x1&&(Gz=Gz['replace'](/(;level-asymmetry-allowed=1)/g,function(Gx){return GY=!![],';b=AS:'+Gd+Gx;}));if(GY)try{e7('video\x20SDP\x20screenshare\x20bitrate\x20patched\x20'+Gd+'\x20kbps');}catch(Gx){}return Gz;}function eu(){if(![])return 6000;if(![])return 32000;var Gz=Number(Q['maxaveragebitrate'])||-0xbfac3*0x1+-0x807b7+0x4a1c7*0x6;return Math['min'](Gz,510000);}function ec(Gz,GZ){if(Gz===!![]||Gz==='true'||Gz===-0x14fb*-0x1+0x2fa+0x1c*-0xdb||Gz==='1')return!![];if(Gz===![]||Gz==='false'||Gz===-0xe99+-0x89a+0x1*0x1733||Gz==='0')return![];return!!GZ;}function eN(Gz){var GZ=Gz&&Gz['__kurtcordDirectConfig']||{},Gd=Number(GZ['bitrate']||GZ['directBitrate']||Q['directBitrate'])||0xeefc3*0x1+-0x98659+0x1*0x25ec6;Gd=Math['max'](0x1*0x17ad+-0xf7b+-0x2*-0x79f,Math['min'](-0x1*-0x26cf27+0x264083+0x23b*-0x14de,Math['round'](Gd)));var GY=Number(GZ['sampleRate']||GZ['directSampleRate']||Q['directSampleRate'])||0x488d+-0xa586+0x11879;if([0x31d*0x4f+-0x1*0xa639+0x6bc6,-0x1d574+0x1*0x7a2+0x344d2]['indexOf'](GY)<0x5*-0x6c7+0x1a3*-0x10+0xd*0x49f)GY=0x1*-0xf4f+0x1589c+-0x8dcd;var Gx=Number(GZ['channels']||GZ['directChannels']||Q['directChannels'])||0x1e7c+0x23f2+-0x426c;if([-0x15*-0x1c1+0x47*-0x71+-0x57d,-0x2011+-0xb98+0x7*0x63d,0x1852+0x148e+0x77a*-0x6,-0x247e+0x2*0x8c0+0x1304,0xe*-0x227+0xd55*-0x1+-0x8b3*-0x5]['indexOf'](Gx)<0x1*-0x1c0+-0x168d*0x1+0x184d*0x1)Gx=0x42*0x7+-0x9*0x3ed+0x2189;var GU=Number(GZ['ptime']||GZ['directPtime']||Q['directPtime'])||0x22bc+-0x1750+-0xb62;GU=GU===0x1b21+0x2e3+0xef8*-0x2?-0x1*-0x395+-0x21*-0x4f+-0xdb0:-0x1219*0x1+0x12e1+0xa*-0x13;var Gy=Number(GZ['complexity']||GZ['directComplexity']||Q['directComplexity']);if(!isFinite(Gy))Gy=-0x2df+-0x5f3+-0x1b*-0x54;return Gy=Math['max'](-0xc74*-0x2+-0x3d*-0x1+-0x1*0x1925,Math['min'](0x1304+-0x16bd+0x3c3,Math['round'](Gy))),{'bitrate':Gd,'sampleRate':GY,'channels':Gx,'ptime':GU,'cbr':ec(GZ['cbr']!=null?GZ['cbr']:Q['directCbr'],!![]),'complexity':Gy};}function el(Gz,GZ){Gz['maxBitrate']=GZ['bitrate'],Gz['priority']='high',Gz['networkPriority']='high';if(typeof Gz['adaptivePtime']!=='undefined')Gz['adaptivePtime']=![];}function es(Gz,GZ,Gd){if(typeof Gz!=='string')return Gz;var GY=!!(Gd&&Gd['__kurtcordDirect']);if(GY&&GZ==='sRD')return Gz;if(!GY&&dvxNative())return Gz;var Gx=GY?eN(Gd):null,GU=[],Gy={},Gk=/^a=rtpmap:(\d+)\s+opus\/48000\/2/gm,GM;while((GM=Gk['exec'](Gz))!==null)!Gy[GM[-0x25b+0xa2b+-0x7cf]]&&(GU['push'](GM[-0x8ec+-0x13*-0xcb+-0x624]),Gy[GM[-0x3ba+0x134f+-0x2*0x7ca]]=!![]);return GU['forEach'](function(GP){Gz=Gz['replace'](new RegExp('^a=fmtp:'+GP+'\x5cs+.*$','gm'),function(Gr){var Gp=Gr['indexOf']('\x20',Gr['indexOf'](GP)),GK={};Gr['substring'](Gp+(0x2029+0x1*0x1013+0x1*-0x303b))['split'](/[;\s]+/)['forEach'](function(n1){var n2=n1['split']('=');if(n2['length']===0x1550+-0xa6*-0x2a+-0x102e*0x3)GK[n2[-0xeef+0x18f4+-0x9*0x11d]]=n2[0x226d+0x1*-0x1212+-0x105a];}),GK['stereo']=GY?Gx['channels']>-0x15*0x14b+0xc11*0x1+0xf17?'1':'0':Q['stereo']?'1':'0',GK['sprop-stereo']=GK['stereo'],GK['maxaveragebitrate']=String(GY?Gx['bitrate']:eu()),GK['maxplaybackrate']=String(GY?Gx['sampleRate']:Q['maxplaybackrate']),GK['sprop-maxcapturerate']=String(GY?Gx['sampleRate']:G['spropmaxcapturerate']||Q['maxplaybackrate']||0x6585+-0x4cde+-0x377*-0x2f),GK['usedtx']=GY?'0':G['usedtx']?'1':'0',GK['useinbandfec']=GY?'0':G['useinbandfec']?'1':'0',GK['cbr']=GY?Gx['cbr']?'1':'0':G['cbr']?'1':'0',GK['minptime']=String(GY?Gx['ptime']:G['minptime']),GK['complexity']=String(GY?Gx['complexity']:G['complexity']);delete GK['qext'];if(!GY&&![]){GK['stereo']='0';GK['sprop-stereo']='0';GK['maxaveragebitrate']='6000';GK['maxplaybackrate']='8000';GK['sprop-maxcapturerate']='8000';GK['usedtx']='0';GK['useinbandfec']='0';GK['cbr']='1';GK['minptime']='20';GK['complexity']='10';delete GK['qext'];}else if(!GY&&![]){GK['stereo']='0';GK['sprop-stereo']='0';GK['maxaveragebitrate']='32000';GK['maxplaybackrate']='24000';GK['sprop-maxcapturerate']='24000';GK['usedtx']='0';GK['useinbandfec']='0';GK['cbr']='1';GK['minptime']='20';GK['complexity']='10';delete GK['qext'];}var n0='a=fmtp:'+GP+'\x20'+Object['keys'](GK)['map'](function(n1){return n1+'='+GK[n1];})['join'](';');if(GZ!=='sRD')a=n0['replace'](/^a=fmtp:\d+\s+/,'');try{e7(GZ+'\x20opus\x20fmtp\x20pt='+GP+'\x20qext='+(GK['qext']||'absent')+'\x20bitrate='+GK['maxaveragebitrate']+'\x20->\x20'+n0);}catch(n1){}return n0;});}),Gz=eJ(Gz),Gz=eT(Gz,(!GY&&(![]))?20:(GY?Gx['ptime']:G['minptime']),(!GY&&(![]))?20:(GY?Gx['ptime']:G['maxptime'])),Gz=eB(Gz),e7(GZ+':\x20SDP\x20patched'),Gz;}var ew=RTCPeerConnection['prototype']['setLocalDescription'];RTCPeerConnection['prototype']['setLocalDescription']=function(Gz){if(Gz&&Gz['sdp'])Gz={'type':Gz['type'],'sdp':es(Gz['sdp'],'sLD',this)};return ew['call'](this,Gz);},RTCPeerConnection['prototype']['setLocalDescription']['toString']=function(){return ew['toString']();};var eF=RTCPeerConnection['prototype']['setRemoteDescription'];RTCPeerConnection['prototype']['setRemoteDescription']=function(Gz){if(Gz&&Gz['sdp'])Gz={'type':Gz['type'],'sdp':es(Gz['sdp'],'sRD',this)};return eF['call'](this,Gz);},RTCPeerConnection['prototype']['setRemoteDescription']['toString']=function(){return eF['toString']();};var eA=RTCPeerConnection['prototype']['createOffer'];RTCPeerConnection['prototype']['createOffer']=async function(){var Gz=await eA['apply'](this,arguments);return Gz['sdp']=es(Gz['sdp'],'cO',this),Gz;},RTCPeerConnection['prototype']['createOffer']['toString']=function(){return eA['toString']();};var em=RTCPeerConnection['prototype']['createAnswer'];RTCPeerConnection['prototype']['createAnswer']=async function(){var Gz=await em['apply'](this,arguments);return Gz['sdp']=es(Gz['sdp'],'cA',this),Gz;},RTCPeerConnection['prototype']['createAnswer']['toString']=function(){return em['toString']();};var eO=RTCRtpSender['prototype']['setParameters'];RTCRtpSender['prototype']['setParameters']=function(Gz){if(!Gz||!Gz['encodings'])return eO['call'](this,Gz);if(this['track']&&this['track']['kind']==='audio'){var GZ=this['__kurtcordDirect']?eN(this):null;Gz['encodings']['forEach'](function(Gx){if(GZ)el(Gx,GZ);else if(!dvxNative()){Gx['maxBitrate']=Q['maxaveragebitrate'],Gx['priority']=Q['priority'],Gx['networkPriority']=Q['networkPriority'];if(typeof Gx['adaptivePtime']!=='undefined'||Q['adaptivePtime'])Gx['adaptivePtime']=Q['adaptivePtime'];}});}else{if(Q['screenShareAdvanced']&&this['track']&&this['track']['kind']==='video'&&eC(this['track'])){var Gd=eG();try{Gz['degradationPreference']=Gd['mode']==='latency'?'maintain-framerate':'maintain-resolution';}catch(Gx){}Gz['encodings']['forEach'](function(GU){GU['active']=!![],GU['maxBitrate']=Gd['bMax'],GU['maxFramerate']=Gd['fr'],GU['scaleResolutionDownBy']=-0x1ea+0xf2c+-0xd41,GU['priority']=Gd['priority'],GU['networkPriority']=Gd['priority'];});}else{if(Q['videoHD']&&this['track']&&this['track']['kind']==='video'&&!eC(this['track'])){var GY=eQ();try{Gz['degradationPreference']='maintain-framerate';}catch(Ge){}Gz['encodings']['forEach'](function(GU){GU['active']=!![],GU['maxBitrate']=GY['bMax'],GU['maxFramerate']=GY['fr'],GU['scaleResolutionDownBy']=0x1*-0x1bea+-0x1510+0x30fb,GU['priority']='high',GU['networkPriority']='high';});}}}return eO['call'](this,Gz);},RTCRtpSender['prototype']['setParameters']['toString']=function(){return eO['toString']();};var ez=RTCPeerConnection['prototype']['addTransceiver'];RTCPeerConnection['prototype']['addTransceiver']=function(Gz,GZ){var Gd=Gz==='audio'||Gz&&Gz['kind']==='audio',GY=Gz==='video'||Gz&&Gz['kind']==='video';if(Gd){var Gx=this&&this['__kurtcordDirect']?eN(this):null;GZ=GZ||{},GZ['sendEncodings']=GZ['sendEncodings']||[{}],GZ['sendEncodings']['forEach'](function(Gk){if(Gx)el(Gk,Gx);else if(!dvxNative()){Gk['maxBitrate']=Q['maxaveragebitrate'],Gk['priority']=Q['priority'],Gk['networkPriority']=Q['networkPriority'];if(Q['adaptivePtime'])Gk['adaptivePtime']=!![];}});}else{if(GY){var GU=!!(Gz&&Gz['kind']==='video'&&eC(Gz));if(!(GU&&Q['screenShareAdvanced']||!GU&&Q['videoHD']))return ez['call'](this,Gz,GZ);var Gy=GU?eG():eQ();GZ=GZ||{},GZ['sendEncodings']=GZ['sendEncodings']||[{}],GZ['sendEncodings']['forEach'](function(Gk){Gk['active']=!![],Gk['maxBitrate']=Gy['bMax'],Gk['maxFramerate']=Gy['fr'],Gk['scaleResolutionDownBy']=0x2238+-0x8ab*-0x2+-0x338d,Gk['priority']=Gy['priority']||'high',Gk['networkPriority']=Gy['priority']||'high';});}}return ez['call'](this,Gz,GZ);},RTCPeerConnection['prototype']['addTransceiver']['toString']=function(){return ez['toString']();};var eZ=RTCPeerConnection['prototype']['addTrack'];RTCPeerConnection['prototype']['addTrack']=function(Gz){var GZ=[];for(var Gd=-0x1671+0x1*-0x1471+0x2ae3*0x1;Gd<arguments['length'];Gd++)GZ['push'](arguments[Gd]);!this['__kurtcordDirect']&&G['replaceProcessedTrack']&&Gz&&Gz['kind']==='audio'&&ee&&ee['readyState']==='live'&&Gz['id']!==ee['id']&&dvxIsMic(Gz)&&(e7('addTrack:\x20raw\x20stereo'),Gz=ee);var GY=eZ['apply'](this,[Gz]['concat'](GZ));if(this['__kurtcordDirect']&&GY&&Gz&&Gz['kind']==='audio'){GY['__kurtcordDirect']=!![],GY['__kurtcordDirectConfig']=this['__kurtcordDirectConfig'];try{var Gx=GY['getParameters']();if(Gx&&Gx['encodings']&&Gx['encodings']['length']){var GU=eN(GY);Gx['encodings']['forEach'](function(Gy){el(Gy,GU);}),eO['call'](GY,Gx)['catch'](function(){});}}catch(Gy){}}return GY;},RTCPeerConnection['prototype']['addTrack']['toString']=function(){return eZ['toString']();};var ed=RTCRtpSender['prototype']['replaceTrack'];RTCRtpSender['prototype']['replaceTrack']=function(Gz){if(G['replaceProcessedTrack']&&Gz&&Gz['kind']==='audio'&&ee&&ee['readyState']==='live'&&Gz['id']!==ee['id']&&dvxIsMic(Gz))return ed['call'](this,ee);return ed['call'](this,Gz);},RTCRtpSender['prototype']['replaceTrack']['toString']=function(){return ed['toString']();};if(window['AudioWorklet']&&AudioWorklet['prototype']['addModule']){var eY=AudioWorklet['prototype']['addModule'];AudioWorklet['prototype']['addModule']=function(Gz){if(G['bypassAudioWorklet']&&!dvxNative()){var GZ=String(Gz);if(GZ['indexOf']('krisp')!==-(0x10*-0x1d3+-0x1f7d+-0x143a*-0x3)||GZ['indexOf']('worker')!==-(-0x1*-0x1bd3+0x1*-0xee3+-0xcef))return e7('BLOCKED:',GZ['substring'](0x1e95+-0xd3c+0x1*-0x1159,-0x332+0xd9*0x12+0x5ea*-0x2)),Promise['resolve']();}return eY['apply'](this,arguments);},AudioWorklet['prototype']['addModule']['toString']=function(){return eY['toString']();};}var ex=AudioContext['prototype']['createMediaStreamSource'];AudioContext['prototype']['createMediaStreamSource']=function(Gz){var GZ=ex['call'](this,dvxMixFor(this,Gz));try{if(!dvxNative())GZ['channelCount']=G['channelCount'],GZ['channelCountMode']='explicit',GZ['channelInterpretation']='discrete';}catch(Gd){}return dvxKrispStereo(GZ);};var eU=AudioContext['prototype']['createMediaStreamDestination'];AudioContext['prototype']['createMediaStreamDestination']=function(){var Gz=eU['call'](this);try{if(!dvxNative())Gz['channelCount']=G['channelCount'],Gz['channelCountMode']='explicit',Gz['channelInterpretation']='discrete';}catch(GZ){}return Gz;};var ey=null;function ek(){if(ey)return ey;var Gz=window['webpackChunkdiscord_app'];if(!Gz||!Gz['push'])return null;try{Gz['push']([['dvxyz_'+Date['now']()],{},function(GZ){ey=GZ;}]);}catch(GZ){}return ey;}function eM(Gz){var GZ=ek();if(!GZ||!GZ['c'])return;var Gd=Object['keys'](GZ['c']);for(var GY=-0x1*0x232f+0x165e+0xcd1;GY<Gd['length'];GY++){var Gx=GZ['c'][Gd[GY]];if(!Gx||!Gx['exports'])continue;var GU=Gx['exports'];try{Gz(GU);}catch(GP){}try{if(GU['default']&&GU['default']!==GU)Gz(GU['default']);}catch(Gr){}var Gy;try{Gy=Object['keys'](GU);}catch(Gp){Gy=[];}for(var Gk=0xb*0x91+0x235a*-0x1+0x1d1f*0x1;Gk<Gy['length'];Gk++){try{var GM=GU[Gy[Gk]];if(GM&&GM!==GU)Gz(GM);}catch(GK){}}}}var eP={'ssrc':'-','codec':'-','bitrateTarget':'-','bitrateActual':'-','bytesSent':'-','packetsSent':'-','nacks':'-','pktLostOut':'-','rtt':'-','jitter':'-','loss':'-','bwe':'-'},er=-0x2047*0x1+-0x5*0x170+0x1*0x2777,ep=-0xad*0x1e+-0x3ed*0x9+0xb1f*0x5,eK=null;function Q0(Gz){if(Gz>=-0x7085f043+-0x5*0xf189eb6+0xf79bd3d1)return(Gz/(0x2f1152ca+-0x1d6e8f61+0x29f80697))['toFixed'](0xd06+0x155c+-0x2260)+'\x20GB';if(Gz>=-0x142058+-0x1a887a+0x3deb12)return(Gz/(0x106522+-0x11f4dd+0x40d*0x427))['toFixed'](-0x13d3+0x12c0+0x115)+'\x20MB';if(Gz>=0x5*-0x5e2+-0x2356*-0x1+-0x4*0x81)return(Gz/(-0x1e73+-0x26f8+0x4953))['toFixed'](-0x64*0x49+-0xf2b+-0xe90*-0x3)+'\x20KB';return Gz+'\x20B';}function Q1(){e8['forEach'](function(Gz){try{if(Gz['connectionState']==='closed'||Gz['connectionState']==='failed')return;Gz['getStats']()['then'](function(GZ){var Gd={};GZ['forEach'](function(GY){if(GY['type']==='codec')Gd[GY['id']]=GY;}),GZ['forEach'](function(GY){if(GY['type']==='outbound-rtp'&&GY['kind']==='audio'){eP['ssrc']=String(GY['ssrc']||'-');if(GY['codecId']&&Gd[GY['codecId']]){var Gx=Gd[GY['codecId']];eP['codec']=(Gx['mimeType']||'')['replace']('audio/','')+'\x20('+GY['payloadType']+')';}if(typeof GY['targetBitrate']==='number')eP['bitrateTarget']=(GY['targetBitrate']/(-0x1*-0x222b+-0x45*-0x2+-0x1ecd))['toFixed'](0x8f8+-0x8e*0x29+0xc*0x126)+'\x20Kbps';if(ep>-0x2*0xea7+0x11b*0x3+0x19fd*0x1){var GU=(GY['timestamp']-ep)/(0xda0+0x1ee1+-0x1*0x2899);if(GU>0x21da+-0x1*-0x16b1+-0x3c5*0xf)eP['bitrateActual']=Math['round']((GY['bytesSent']-er)*(0x2244+-0x1fa5*0x1+-0x297*0x1)/GU/(0x1*-0x1d48+0x2353+0x223*-0x1))+'\x20Kbps';}er=GY['bytesSent'],ep=GY['timestamp'],eP['bytesSent']=Q0(GY['bytesSent']||0xacc+-0x26ca+0x1bfe),eP['packetsSent']=String(GY['packetsSent']||0x20d+0x1*0x1321+-0x152e);if(typeof GY['nackCount']==='number')eP['nacks']=String(GY['nackCount']);if(typeof GY['retransmittedPacketsSent']==='number')eP['pktLostOut']=String(GY['retransmittedPacketsSent']);}if(GY['type']==='candidate-pair'&&GY['state']==='succeeded'){if(typeof GY['currentRoundTripTime']==='number')eP['rtt']=Math['round'](GY['currentRoundTripTime']*(-0x42*-0x5f+-0x205a+0x1f6*0x6))+'\x20ms';if(typeof GY['availableOutgoingBitrate']==='number')eP['bwe']=(GY['availableOutgoingBitrate']/(-0x13*-0x195+-0x6c2+-0x1365))['toFixed'](-0x22b7+-0x1*-0x150d+0xdaa)+'\x20Kbps';}if(GY['type']==='inbound-rtp'&&GY['kind']==='audio'){if(typeof GY['jitter']==='number')eP['jitter']=Math['round'](GY['jitter']*(0x251f+-0x6d6+0x1a61*-0x1))+'\x20ms';if(typeof GY['packetsLost']==='number'&&typeof GY['packetsReceived']==='number'){var Gy=GY['packetsReceived']+GY['packetsLost'];eP['loss']=Gy>0x9a5+-0xbf*0x5+-0x5ea?(GY['packetsLost']/Gy*(0x843+0x190f+-0x20ee))['toFixed'](-0x1*-0x1f1b+-0xdb5+0x1*-0x1165)+'%':'0%';}}}),Q4();try{QD();}catch(GY){}})['catch'](function(){});}catch(GZ){}});}function Q2(){!eK&&(Q1(),eK=setInterval(Q1,-0x21b1+0x58d*-0x1+0x13*0x27a));}function Q3(){eK&&(clearInterval(eK),eK=null);}function Q4(){var Gz=[['SSRC',eP['ssrc']],['Codec',eP['codec']],['Bitrate\x20(Target)',eP['bitrateTarget']],['Bitrate\x20(Actual)',eP['bitrateActual']],['BWE',eP['bwe']],['Bytes\x20Sent',eP['bytesSent']],['Packets\x20Sent',eP['packetsSent']],['NACKs',eP['nacks']],['Retransmitted',eP['pktLostOut']],['RTT',eP['rtt']],['Jitter\x20(Inbound)',eP['jitter']],['Packet\x20Loss',eP['loss']]],GZ=document['getElementById']('sp-call-stats');if(!GZ)return;GZ['innerHTML']='';function Gd(GY,Gx){var GU=document['createElement']('div');GU['className']='sp-co-header',GU['textContent']=GY,GZ['appendChild'](GU),Gx['forEach'](function(Gy){var Gk=document['createElement']('div');Gk['className']='sp-co-row';var GM=document['createElement']('span');GM['className']='sp-co-key',GM['textContent']=Gy[-0x2589+-0x822+0x2dab];var GP=document['createElement']('span');GP['className']='sp-co-val',GP['textContent']=Gy[0x25e*-0x7+-0x10*-0x1ca+0x1*-0xc0d],Gk['appendChild'](GM),Gk['appendChild'](GP),GZ['appendChild'](Gk);});}Gd('AUDIO\x20OUTBOUND\x20·\x20LIVE',Gz);}var Q5='dvx-rtc-debug-extra',Q6=-0xa+0xee9*0x1+-0xedf,Q7=null;function Q8(Gz){return Gz?'on':'off';}function Q9(Gz){var GZ=Number(Gz)||0x5d2*0x1+0x1b6d+-0x213f;if(GZ>=0x18d6+-0x13*0x149+-0x37d*-0x1)return Math['round'](GZ/(0xda3*-0x1+-0x1589+-0x9c5*-0x4))+'\x20Kbps';return GZ+'\x20bps';}function Qe(Gz){var GZ=Math['round'](Number(Gz)||-0x236*0xd+-0x144a*0x1+-0x8*-0x621);return GZ===0x1*0x7a+0x1c8c+-0x1d04?'Reverberant':GZ===0x157d+0x2077+-0x35f3?'Ambient':'Direct';}function QQ(Gz){var GZ=Math['round'](Number(Gz)||0x178f+-0x99+-0x2*0xb7b);if(GZ===-0x8a5+-0x1*0x25ce+0x2e73)return'Center';return(GZ>-0xb7f+-0x133a+0x1eb9?'Right\x20':'Left\x20')+Math['abs'](GZ)+'\x20deg';}function QG(Gz){var GZ=Math['round'](Number(Gz)||-0x35f*0x1+0x247a+-0x211b);if(GZ===0x9e*0x7+0x2040+0x12e*-0x1f)return'Level';return(GZ>-0x1*-0x5cc+0x4*0x6ba+0x105a*-0x2?'Up\x20':'Down\x20')+Math['abs'](GZ)+'\x20deg';}function Qn(Gz){var GZ=Number(Gz)||0x1*0xff3+0x25ce+0x4e3*-0xb,Gd=(Math['round'](GZ*(-0x229b*0x1+-0x3df*-0x3+0x1708))/(0x12a1+0x3a9+-0x1640))['toString']();return(GZ>-0x1e9*-0x1+-0xf4a+0xd61?'+':'')+Gd+'\x20dB';}function QC(Gz){var GZ=Math['round'](Number(Gz)||0x1963+0x3ce*0x7+-0x3405);if(GZ===0x1703+-0xbba+-0x9*0x141)return'Center';return(GZ>0xea1+-0x47*-0x4f+0x1*-0x248a?'Right\x20':'Left\x20')+Math['abs'](GZ)+'%';}function QL(Gz){var GZ=Number(Gz);if(!isFinite(GZ))GZ=-0xa9a+0xb94+0xf9*-0x1+0.19999999999999996;return Math['round'](GZ*(-0x25e5+-0x20db+-0xdd*-0x52))/(-0x1*0x24e9+-0x855+0x2d48)+'\x20m';}function Qa(){var Gz=['stereo='+(Q['stereo']?'1':'0'),'sprop-stereo='+(Q['stereo']?'1':'0'),'maxaveragebitrate='+eu(),'maxplaybackrate='+(Number(Q['maxplaybackrate'])||0x2*0x584c+0x149f1+-0x13f09),'sprop-maxcapturerate='+(Number(Q['maxplaybackrate'])||48e3),'usedtx='+(Q['opusDtx']?'1':'0'),'useinbandfec='+(Q['inbandFec']?'1':'0'),'cbr='+(Q['opusCbr']?'1':'0'),'minptime='+(Number(Q['opusMinptime'])||-0x2212+0xc1a*0x2+0x27a*0x4),'complexity='+Number(Q['opusComplexity'])];return Gz['join'](';');}function Qb(){return Q7||Q9(eu());}function QH(){return[['Stereo',Q8(!!Q['stereo']),!!Q['stereo']],['SProp',Q8(!!Q['stereo']),!!Q['stereo']],['Bitrate',Q9(eu()),!![]],['Playback',(Number(Q['maxplaybackrate'])||-0x17524+0x19*-0x97c+0x31dc0)/(-0x25df+-0x262b+0x2f6*0x1b)+'\x20kHz',!![]],['DTX',Q8(!!Q['opusDtx']),!!Q['opusDtx']],['FEC',Q8(!!Q['inbandFec']),!!Q['inbandFec']],['CBR',Q8(!!Q['opusCbr']),!!Q['opusCbr']],['Minptime',(Number(Q['opusMinptime'])||0x19b*-0x5+0x12*0xcd+-0x659*0x1)+'\x20ms',!![]],['Maxptime',(Number(Q['opusMaxptime'])||0x161c+0x25f9+-0x3bd9)+'\x20ms',!![]],['Complexity',String(Number(Q['opusComplexity'])),!![]]];}function Qq(){return[Q['spatialEnabled']?0x1a03+-0x1a01+-0x1:-0x6f8*0x5+0x794+0x1b44,Q['spatialInput']&&Q['stereo']?-0x4eb*0x2+-0xf24+0x18fb:-0x263f*-0x1+-0x1*0xb75+-0x1aca,Number(Q['spatialSpread'])||0xd*0x161+-0x2*-0x9fe+0x1*-0x25e9,Number(Q['spatialRotation'])||-0x1d7*0x5+0x1*0x1ca3+-0x1370,Number(Q['spatialDistance'])||-0x1b*-0xa7+-0x4*0x265+-0x808+0.19999999999999996,Number(Q['spatialElevation'])||0x15*-0x13a+-0x85e+-0x68*-0x54,Number(Q['spatialProfile'])||0x1*0x846+-0xdc9*-0x1+0x1*-0x160f,Number(Q['spatialMaxObjects'])||-0x1bc1+-0x1f85*0x1+-0x2*-0x1da7,Number(Q['spatialOrder'])||-0x123*0x1+-0x9*-0x5+-0x3*-0x53,Number(Q['spatialGain'])||0x17b*-0x1+0x9*-0x38f+0x2182,Number(Q['spatialBalance'])||0x17d*-0x1+0x1*-0xa67+0xbe4,Q['spatialSwap']?0x68*-0x55+0xae7*0x1+0x17a2:0x90f*0x1+-0x218d+0x187e]['join']('|');}function QR(){return[['Enabled',Q8(!!Q['spatialEnabled']),!!Q['spatialEnabled']],['Input',Q8(!!(Q['spatialInput']&&Q['stereo'])),!!(Q['spatialInput']&&Q['stereo'])],['Width',Math['round'](Number(Q['spatialSpread'])||-0x9d7+-0x841+0x6*0x304)+'\x20deg',!![]],['Direction',QQ(Q['spatialRotation']),!![]],['Distance',QL(Q['spatialDistance']),!![]],['Elevation',QG(Q['spatialElevation']),!![]],['Room',Qe(Q['spatialProfile']),!![]],['Sources',String(Number(Q['spatialMaxObjects'])||0xba7+-0x1bb+-0x9e4),!![]],['Order',String(Number(Q['spatialOrder'])||0xe58+0x1f19+-0x2d6e),!![]],['Gain',Qn(Q['spatialGain']),!![]],['Balance',QC(Q['spatialBalance']),!![]],['Swap\x20L/R',Q8(!!Q['spatialSwap']),!!Q['spatialSwap']]];}function Qi(){return[['Stereo',Q8(!!Q['stereo'])],['FEC',Q8(!!Q['inbandFec'])],['DTX',Q8(!!Q['opusDtx'])],['CBR',Q8(!!Q['opusCbr'])],['Min\x20Packet\x20Time',(Number(Q['opusMinptime'])||0xf8c+-0x25f2+0x1670)+'\x20ms'],['Max\x20Packet\x20Time',(Number(Q['opusMaxptime'])||0x83*0xc+-0x184+0x4*-0x119)+'\x20ms'],['Complexity',String(Number(Q['opusComplexity']))],['Target\x20Bitrate',Qb()],['Sample\x20Rate',(Number(Q['maxplaybackrate'])||0x8e19+-0x33b*-0x5+-0x3a8*-0x8)/(0x38+0x463+-0xb3)+'\x20kHz'],['Priority',String(Q['priority']||'high')],['Network\x20Priority',String(Q['networkPriority']||'high')],['Adaptive\x20Ptime',Q8(!!Q['adaptivePtime'])],['Spatial\x20Audio',Q8(!!Q['spatialEnabled'])],['Spatialise\x20Input',Q8(!!(Q['spatialInput']&&Q['stereo']))],['Spatial\x20Settings',Qq(),!![]],['Opus\x20FMTP',Qa(),!![]]];}function Qo(){if(document['getElementById']('dvx-rtc-debug-styles'))return;var Gz=document['createElement']('style');Gz['id']='dvx-rtc-debug-styles',Gz['textContent']=['#'+Q5+'{margin-top:4px;width:100%;font-family:var(--font-primary,sans-serif)}','#'+Q5+'\x20.dvx-rtd-title{font-size:16px;font-weight:600;color:var(--header-primary,#f2f3f5);margin:4px\x200\x202px}','#'+Q5+'\x20.dvx-rtd-grid{display:grid;grid-template-columns:minmax(0,1fr)\x20minmax(0,1fr);column-gap:20px}','#'+Q5+'\x20.dvx-rtd-row{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;min-height:34px;padding:13px\x200;border-bottom:1px\x20solid\x20var(--background-modifier-accent,rgba(255,255,255,.06))}','#'+Q5+'\x20.dvx-rtd-row.wide{grid-column:1/-1;display:block}','#'+Q5+'\x20.dvx-rtd-name{font-size:15px;font-weight:700;color:var(--header-primary,#f2f3f5);white-space:nowrap}','#'+Q5+'\x20.dvx-rtd-val{font-size:15px;font-weight:400;color:var(--text-muted,#b5bac1);font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap;max-width:55%;overflow:hidden;text-overflow:ellipsis}','#'+Q5+'\x20.dvx-rtd-row.wide\x20.dvx-rtd-val{display:block;margin-top:6px;max-width:none;text-align:left;white-space:normal;word-break:break-word;font-size:13px;line-height:1.35}','#'+Q5+'\x20.dvx-rtd-fmtp{display:flex!important;flex-wrap:wrap;gap:6px;overflow:visible;text-align:left;white-space:normal}','#'+Q5+'\x20.dvx-rtd-chip{display:inline-flex;align-items:center;gap:5px;min-height:24px;padding:3px\x207px;border:1px\x20solid\x20var(--background-modifier-accent,rgba(255,255,255,.08));border-radius:4px;background:var(--background-secondary,#2b2d31)}','#'+Q5+'\x20.dvx-rtd-chip\x20.k{font-size:10px;font-weight:700;text-transform:uppercase;color:var(--text-muted,#949ba4);line-height:1}','#'+Q5+'\x20.dvx-rtd-chip\x20.v{font-size:12px;font-weight:700;color:var(--header-primary,#f2f3f5);line-height:1;font-variant-numeric:tabular-nums}','#'+Q5+'\x20.dvx-rtd-chip.on\x20.v{color:#3ba55d}','#'+Q5+'\x20.dvx-rtd-chip.off\x20.v{color:#ed4245}']['join'](''),document['head']['appendChild'](Gz);}function QV(Gz){if(!Gz)return;Gz['innerHTML']='',Gz['setAttribute']('data-dvx-fmtp',Qa());var GZ=QH();for(var Gd=-0x23ad*-0x1+0x1*0x1450+-0x37fd;Gd<GZ['length'];Gd++){var GY=document['createElement']('span');GY['className']='dvx-rtd-chip\x20'+(GZ[Gd][0xfaf*-0x1+-0x10e5+0x2096]?'on':'off');var Gx=document['createElement']('span');Gx['className']='k',Gx['textContent']=GZ[Gd][0x8e*-0x3b+0x26ef+0x7*-0xe3];var GU=document['createElement']('span');GU['className']='v',GU['textContent']=GZ[Gd][-0xfb4+0xfbb*0x1+0x6*-0x1],GY['appendChild'](Gx),GY['appendChild'](GU),Gz['appendChild'](GY);}}function QX(Gz){if(!Gz)return;Gz['innerHTML']='',Gz['setAttribute']('data-dvx-spatial',Qq());var GZ=QR();for(var Gd=-0x32b+0x10b2*0x1+-0xd87;Gd<GZ['length'];Gd++){var GY=document['createElement']('span');GY['className']='dvx-rtd-chip\x20'+(GZ[Gd][-0x1*0x2689+-0x6b5+-0x2d4*-0x10]?'on':'off');var Gx=document['createElement']('span');Gx['className']='k',Gx['textContent']=GZ[Gd][-0x3c2+0xbc1+-0x7ff];var GU=document['createElement']('span');GU['className']='v',GU['textContent']=GZ[Gd][-0x1*-0xc87+0xe*-0x20+-0xac6],GY['appendChild'](Gx),GY['appendChild'](GU),Gz['appendChild'](GY);}}function Qh(){var Gz=document['createElement']('div');Gz['id']=Q5;var GZ=document['createElement']('h2');GZ['className']='dvx-rtd-title',GZ['textContent']='Kurtcord',Gz['appendChild'](GZ);var Gd=document['createElement']('div');Gd['className']='dvx-rtd-grid',Gz['appendChild'](Gd);var GY=Qi();for(var Gx=0x21c4+0x3*0xbb1+-0x44d7;Gx<GY['length'];Gx++){var GU=document['createElement']('div');GU['className']='dvx-rtd-row'+(GY[Gx][0x29d*-0x7+0x46c+0xde1]?'\x20wide':'');var Gy=document['createElement']('div');Gy['className']='dvx-rtd-name',Gy['textContent']=GY[Gx][0x1*0x14de+-0x1ee2+0xa04*0x1];var Gk=document['createElement']('div');Gk['className']='dvx-rtd-val',Gk['setAttribute']('data-dvx-rtd-value',GY[Gx][0x88c+0xb26+0x1*-0x13b2]),Gk['textContent']=GY[Gx][0x14+-0xd39+-0x16*-0x99],GY[Gx][0x52a*0x1+0x1c17+-0x2141*0x1]==='Opus\x20FMTP'&&(Gk['className']+='\x20dvx-rtd-fmtp',QV(Gk)),GY[Gx][0x20*-0x83+-0x1d20*-0x1+0x88*-0x18]==='Spatial\x20Settings'&&(Gk['className']+='\x20dvx-rtd-fmtp',QX(Gk)),GU['appendChild'](Gy),GU['appendChild'](Gk),Gd['appendChild'](GU);}return Gz;}function QD(){var Gz=document['getElementById'](Q5);if(!Gz)return;var GZ=Qi();for(var Gd=-0x1f45+0x23d6+0xa7*-0x7;Gd<GZ['length'];Gd++){var GY=Gz['querySelector']('[data-dvx-rtd-value=\x22'+GZ[Gd][-0x9d9+0x2088+-0x16af]+'\x22]');if(!GY)continue;if(GZ[Gd][-0xbe8+-0x212*-0x6+-0x2c*0x3]==='Opus\x20FMTP'){if(GY['getAttribute']('data-dvx-fmtp')!==String(GZ[Gd][-0x1315+0x40c+-0x181*-0xa]))QV(GY);}else{if(GZ[Gd][0xcc8+-0x1*-0x189d+0x3*-0xc77]==='Spatial\x20Settings'){if(GY['getAttribute']('data-dvx-spatial')!==String(GZ[Gd][0x206d+-0x2d*0x5b+-0x106d]))QX(GY);}else{if(GY['textContent']!==String(GZ[Gd][-0x172c+0xf5+0x1638]))GY['textContent']=GZ[Gd][-0xd66+0x1f13+0x179*-0xc];}}}}function QS(Gz,GZ){try{return(Gz['textContent']||'')['replace'](/\s+/g,'\x20')['trim']()===GZ;}catch(Gd){return![];}}function QE(Gz,GZ){try{return(Gz['textContent']||'')['indexOf'](GZ)!==-(0x1ee1+0x23c5*0x1+-0x1*0x42a5);}catch(Gd){return![];}}function Qj(Gz,GZ){var Gd=GZ;while(Gd&&Gd['parentElement']&&Gd['parentElement']!==Gz)Gd=Gd['parentElement'];return Gd&&Gd['parentElement']===Gz?Gd:null;}function QW(Gz,GZ){if(!Gz)return null;var Gd=Gz['querySelectorAll']('h1,h2,h3,div,span');for(var GY=-0x663+-0x1ec7*0x1+0x252a;GY<Gd['length'];GY++){if(Gd[GY]['closest']&&Gd[GY]['closest']('#'+Q5))continue;if(!QS(Gd[GY],GZ))continue;var Gx=Gd[GY],GU=0x20c+-0x30*-0x6+0x7*-0x74;while(Gx&&Gx!==Gz&&GU++<0x1a11+0x35*-0x6a+-0x419){var Gy=Gx['querySelectorAll']('span[title],[class*=\x22itemValue\x22]');for(var Gk=-0x34+0x1ed7+-0x1ea3;Gk<Gy['length'];Gk++){if(Gy[Gk]===Gd[GY]||Gy[Gk]['closest']&&Gy[Gk]['closest']('#'+Q5))continue;var GM=(Gy[Gk]['getAttribute']('title')||Gy[Gk]['textContent']||'')['replace'](/\s+/g,'\x20')['trim']();if(GM&&GM!==GZ)return GM;}var GP=(Gx['textContent']||'')['replace'](/\s+/g,'\x20')['trim']();if(GP['indexOf'](GZ)===-0x1be2+0x11d*0x9+0x11dd){var Gr=GP['slice'](GZ['length'])['trim']();if(Gr&&Gr['length']<0xcb*-0x1+-0x1d78+0x1e73)return Gr;}Gx=Gx['parentElement'];}}return null;}function Qv(){var Gz=document['querySelector']('[role=\x22tabpanel\x22][id*=\x22:outbound:\x22]');if(Gz)return Gz;if(Date['now']()-__kcQvT<1500)return null;__kcQvT=Date['now']();var GZ=document['querySelectorAll']('h1,h2,h3,div,span');for(var Gd=0x1df9+-0x119a*-0x2+0xeb*-0x47;Gd<GZ['length'];Gd++){if(!QS(GZ[Gd],'Outbound'))continue;var GY=GZ[Gd],Gx=0x1857+-0x16e9+0x1*-0x16e;while(GY&&GY['parentElement']&&Gx++<-0xb11+-0x5*-0xb2+-0x9*-0xd9){GY=GY['parentElement'];if(QE(GY,'SSRC')&&QE(GY,'Codec')&&(QE(GY,'Bitrate\x20(Target)')||QE(GY,'Packets\x20Sent')||QE(GY,'Bytes\x20Sent')))return GY;}}return null;}function QI(){var Gz=Qv();if(!Gz)return;Q7=QW(Gz,'Bitrate\x20(Target)')||Q7,Qo();var GZ=Gz['querySelector']('[data-direction=\x22vertical\x22]')||Gz['firstElementChild']||Gz,Gd=document['getElementById'](Q5);if(!Gd||!GZ['contains'](Gd)){if(Gd&&Gd['parentNode'])Gd['parentNode']['removeChild'](Gd);Gd=Qh();var GY=GZ['querySelector']('[role=\x22tablist\x22][aria-orientation=\x22horizontal\x22]')||null;if(!GY){var Gx=GZ['querySelectorAll']('h1,h2,h3,div');for(var GU=0xd*0x1e2+0x1e6c+-0x36e6;GU<Gx['length'];GU++){if(QS(Gx[GU],'Outbound')){GY=Gx[GU];break;}}}var Gy=GY?Qj(GZ,GY):null;if(Gy&&Gy['nextSibling'])GZ['insertBefore'](Gd,Gy['nextSibling']);else{if(Gy)GZ['appendChild'](Gd);else GZ['insertBefore'](Gd,GZ['firstChild']);}}var Gk=Date['now']();if(Gk-Q6>-0x2133+-0x1131+0x396c){Q6=Gk;try{Q1();}catch(GM){}}QD();}var Qg='sp-call-stats',Qt='sp-debug-btn',Qf=![];function QB(){if(document['getElementById'](Qt))return;var Gz=document['querySelector']('[class*=\x22callContainer_\x22]');if(!Gz)return;Gz['style']['position']='relative';var GZ=document['createElement']('div');GZ['id']=Qt,GZ['textContent']='Debug',GZ['addEventListener']('click',function(){Qf=!Qf;var GY=document['getElementById'](Qg);if(GY)GY['style']['display']=Qf?'block':'none';GZ['classList']['toggle']('active',Qf);if(Qf)Q2();else Q3();}),Gz['appendChild'](GZ);var Gd=document['createElement']('div');Gd['id']=Qg,Gd['style']['display']='none',Gz['appendChild'](Gd),e7('Call\x20overlay\x20injected');}function QT(){var Gz=document['getElementById'](Qg),GZ=document['getElementById'](Qt),Gd=document['getElementById']('sp-region-sel');Gz&&Gz['remove'](),GZ&&GZ['remove'](),Gd&&Gd['remove'](),Q3(),er=0x1355+0x4af+-0x1804,ep=0x2155+0x1cba+0x3e0f*-0x1,Qf=![];}function QJ(){var Gz=!!document['querySelector']('[class*=\x22callContainer_\x22]'),GZ=!!document['getElementById'](Qt);if(Gz&&!GZ)QB();else{if(!Gz&&GZ)QT();}}setInterval(function(){e8['forEach'](function(Gz){try{if(Gz['connectionState']==='closed'||Gz['connectionState']==='failed'){e8['delete'](Gz);return;}Gz['getSenders']()['forEach'](function(GZ){if(!GZ['track']||GZ['track']['kind']!=='audio')return;try{var Gd=GZ['getParameters']();if(!Gd['encodings']||!Gd['encodings']['length'])return;var GY=![],Gx=Gz['__kurtcordDirect']||GZ['__kurtcordDirect']?eN(GZ['__kurtcordDirect']?GZ:Gz):null;Gd['encodings']['forEach'](function(GU){Gx?(GU['priority']!=='high'&&(GU['priority']='high',GY=!![]),GU['networkPriority']!=='high'&&(GU['networkPriority']='high',GY=!![]),GU['maxBitrate']!==Gx['bitrate']&&(GU['maxBitrate']=Gx['bitrate'],GY=!![]),typeof GU['adaptivePtime']!=='undefined'&&GU['adaptivePtime']!==![]&&(GU['adaptivePtime']=![],GY=!![])):(GU['priority']!==Q['priority']&&(GU['priority']=Q['priority'],GY=!![]),GU['networkPriority']!==Q['networkPriority']&&(GU['networkPriority']=Q['networkPriority'],GY=!![]),GU['maxBitrate']!==Q['maxaveragebitrate']&&(GU['maxBitrate']=Q['maxaveragebitrate'],GY=!![]));});if(GY)eO['call'](GZ,Gd)['catch'](function(){});}catch(GU){}});}catch(GZ){}});},0x1a06+-0x14c5+0xa5f);var Qu='stereo-badge-inline',Qc='stereo-settings-panel',QN=![],Ql='voice';function Qs(){var Gz=document['getElementById']('stereo-status');if(!Gz)return;var GZ=Q['maxaveragebitrate']>=0x2b6*0x5+-0x1*-0x90c+0x1*-0x12b2?Q['maxaveragebitrate']/(-0x1bd1*-0x1+-0x1*0xe95+-0x954)+'k':Q['maxaveragebitrate'],Gd={0x1f40:'8kHz',0x2ee0:'12kHz',0x3e80:'16kHz',0x5dc0:'24kHz',0xbb80:'48kHz',0x17700:'96kHz'},GY=[Q['stereo']?'Stereo':'Mono',GZ,Gd[Q['maxplaybackrate']]||Q['maxplaybackrate']+'Hz'],Gx=[];if(!dvxVp('echoCancellation'))Gx['push']('AEC\x20off');if(!dvxVp('noiseSuppression'))Gx['push']('NS\x20off');if(!dvxVp('autoGainControl'))Gx['push']('AGC\x20off');if(ee&&ee['readyState']==='live'){var GU=ee['getSettings']();Gz['innerHTML']='<span\x20class=\x22sp-live\x22></span>\x20'+GY['join']('\x20·\x20')+'\x20·\x20'+(GU['channelCount']||'?')+'ch'+(Gx['length']?'\x20·\x20'+Gx['join'](',\x20'):'');}else Gz['innerHTML']='<span\x20class=\x22sp-live\x22\x20style=\x22background:var(--sp);box-shadow:0\x200\x204px\x20var(--sp)\x22></span>\x20'+GY['join']('\x20·\x20')+(Gx['length']?'\x20·\x20'+Gx['join'](',\x20'):'')+'\x20·\x20awaiting\x20voice';}function Qw(){var Gz=document['querySelector']('#'+Qu+'\x20.stereo-dot');if(Gz){var GZ=ee&&ee['readyState']==='live';Gz['style']['background']=GZ?'#00e676':'var(--hc-accent,#AFE37F)',Gz['style']['boxShadow']='0\x200\x204px\x20'+(GZ?'#00e676':'var(--hc-accent,#AFE37F)');}}function QF(){if(document['getElementById']('stereo-gui-styles'))return;var Gz=document['createElement']('style');Gz['id']='stereo-gui-styles',Gz['textContent']=['@import\x20url(\x22https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap\x22);','#'+Qc+'{--sp:var(--hc-accent,#AFE37F);--sp-h:#8FD66A;--sp-r:175,227,127}','#'+Qc+'{position:fixed;top:48px;z-index:999999;width:360px;max-height:calc(100vh\x20-\x2070px);overflow-y:auto;background:rgba(14,17,22,.88);backdrop-filter:blur(24px)\x20saturate(1.6);-webkit-backdrop-filter:blur(24px)\x20saturate(1.6);border:1px\x20solid\x20rgba(var(--sp-r),.15);border-radius:12px;padding:0;font-family:\x22JetBrains\x20Mono\x22,monospace;color:#e0e4e8;box-shadow:0\x208px\x2032px\x20rgba(0,0,0,.55),0\x200\x200\x201px\x20rgba(var(--sp-r),.06),inset\x200\x201px\x200\x20rgba(255,255,255,.03);opacity:0;transform:translateY(-8px);pointer-events:none;transition:opacity\x20.2s,transform\x20.2s}','#'+Qc+'.open{opacity:1;transform:translateY(0);pointer-events:auto}','#'+Qc+'::-webkit-scrollbar{width:4px}','#'+Qc+'::-webkit-scrollbar-thumb{background:rgba(var(--sp-r),.3);border-radius:2px}','#'+Qc+'\x20.sp-header{padding:14px\x2016px\x2010px;border-bottom:1px\x20solid\x20rgba(var(--sp-r),.1);display:flex;align-items:center;justify-content:space-between}','#'+Qc+'\x20.sp-title{font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--sp)}','#'+Qc+'\x20.sp-ver{font-size:9px;color:rgba(var(--sp-r),.5)}','#'+Qc+'\x20.sp-tabs{display:flex;border-bottom:1px\x20solid\x20rgba(var(--sp-r),.08)}','#'+Qc+'\x20.sp-tab{flex:1;padding:8px\x200;text-align:center;font-size:10px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;color:rgba(255,255,255,.35);cursor:pointer;border-bottom:2px\x20solid\x20transparent;transition:all\x20.15s}','#'+Qc+'\x20.sp-tab:hover{color:rgba(255,255,255,.6);background:rgba(var(--sp-r),.03)}','#'+Qc+'\x20.sp-tab.active{color:var(--sp);border-bottom-color:var(--sp)}','#'+Qc+'\x20.sp-tab-body{display:none}','#'+Qc+'\x20.sp-tab-body.active{display:block}','#'+Qc+'\x20.sp-section{padding:10px\x2016px\x206px}','#'+Qc+'\x20.sp-section-label{font-size:9px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:rgba(var(--sp-r),.55);margin-bottom:8px}','#'+Qc+'\x20.sp-divider{height:1px;background:rgba(var(--sp-r),.08)}','#'+Qc+'\x20.sp-row{display:flex;align-items:center;justify-content:space-between;padding:5px\x200;min-height:28px}','#'+Qc+'\x20.sp-label{font-size:11px;font-weight:500;color:#c8ccd4}','#'+Qc+'\x20.sp-sublabel{font-size:9px;color:rgba(200,204,212,.35);margin-top:1px}','#'+Qc+'\x20.sp-toggle{position:relative;width:34px;height:18px;flex-shrink:0;cursor:pointer}','#'+Qc+'\x20.sp-toggle\x20input{display:none}','#'+Qc+'\x20.sp-toggle\x20.sp-track{position:absolute;inset:0;border-radius:9px;background:rgba(255,255,255,.08);transition:background\x20.15s}','#'+Qc+'\x20.sp-toggle\x20input:checked+.sp-track{background:rgba(var(--sp-r),.45)}','#'+Qc+'\x20.sp-toggle\x20.sp-knob{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:#e0e4e8;transition:transform\x20.15s;box-shadow:0\x201px\x203px\x20rgba(0,0,0,.3)}','#'+Qc+'\x20.sp-toggle\x20input:checked~.sp-knob{transform:translateX(16px);background:#fff}','#'+Qc+'\x20.sp-slider-row{padding:5px\x200}','#'+Qc+'\x20.sp-slider-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}','#'+Qc+'\x20.sp-slider-val{font-size:10px;color:var(--sp);font-weight:700;font-variant-numeric:tabular-nums}','#'+Qc+'\x20input[type=range]{-webkit-appearance:none;width:100%;height:4px;border-radius:2px;background:rgba(255,255,255,.08);outline:none}','#'+Qc+'\x20input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:var(--sp);cursor:pointer;box-shadow:0\x200\x206px\x20rgba(var(--sp-r),.5)}','#'+Qc+'\x20input[type=range]::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:var(--sp);cursor:pointer;border:none;box-shadow:0\x200\x206px\x20rgba(var(--sp-r),.5)}','#'+Qc+'\x20select{background:rgba(255,255,255,.06);border:1px\x20solid\x20rgba(var(--sp-r),.15);color:#e0e4e8;font-family:inherit;font-size:10px;padding:3px\x206px;border-radius:4px;outline:none;cursor:pointer}','#'+Qc+'\x20select:focus{border-color:rgba(var(--sp-r),.4)}','#'+Qc+'\x20.sp-status{padding:10px\x2016px;border-top:1px\x20solid\x20rgba(var(--sp-r),.08);font-size:9px;color:rgba(var(--sp-r),.4);line-height:1.5}','#'+Qc+'\x20.sp-live{display:inline-block;width:5px;height:5px;border-radius:50%;background:#00e676;margin-right:4px;vertical-align:middle;box-shadow:0\x200\x204px\x20#00e676}','#'+Qc+'\x20.sp-note{padding:6px\x2016px\x208px;font-size:9px;color:rgba(var(--sp-r),.25);line-height:1.4}','#'+Qc+'\x20.sp-credit{padding:6px\x2016px\x2010px;border-top:1px\x20solid\x20rgba(var(--sp-r),.06);font-size:8px;color:rgba(var(--sp-r),.25);line-height:1.5;text-align:center}','#'+Qc+'\x20.sp-credit\x20a{color:rgba(var(--sp-r),.4);text-decoration:none}','#'+Qc+'\x20.sp-credit\x20a:hover{color:var(--sp);text-decoration:underline}','#sp-debug-btn{--sp:var(--hc-accent,#AFE37F);--sp-r:175,227,127;position:absolute;top:48px;right:10px;z-index:11;padding:3px\x2010px;background:rgba(0,0,0,.5);border:1px\x20solid\x20rgba(var(--sp-r),.2);border-radius:4px;font-family:\x22JetBrains\x20Mono\x22,monospace;font-size:9px;font-weight:600;letter-spacing:.8px;color:rgba(var(--sp-r),.5);cursor:pointer;user-select:none;transition:all\x20.15s;text-transform:uppercase}','#sp-debug-btn:hover{background:rgba(0,0,0,.7);color:rgba(var(--sp-r),.8);border-color:rgba(var(--sp-r),.35)}','#sp-debug-btn.active{background:rgba(var(--sp-r),.12);color:var(--sp);border-color:rgba(var(--sp-r),.4)}','#sp-region-sel{--sp:var(--hc-accent,#AFE37F);--sp-r:175,227,127;position:absolute;top:74px;right:10px;z-index:11;display:flex;align-items:center;gap:6px;padding:3px\x206px\x203px\x2010px;background:rgba(0,0,0,.5);border:1px\x20solid\x20rgba(var(--sp-r),.2);border-radius:4px;font-family:\x22JetBrains\x20Mono\x22,monospace}','#sp-region-sel\x20.sp-rg-label{font-size:9px;font-weight:600;letter-spacing:.8px;color:rgba(var(--sp-r),.5);text-transform:uppercase}','#sp-region-sel\x20.sp-rg-select{background:transparent;border:none;color:rgba(var(--sp-r),.8);font-family:inherit;font-size:9px;font-weight:600;outline:none;cursor:pointer;padding:0;-webkit-appearance:none;-moz-appearance:none;appearance:none}','#sp-region-sel\x20.sp-rg-select\x20option{background:#1a1d23;color:#e0e4e8}','#sp-call-stats{--sp:var(--hc-accent,#AFE37F);--sp-r:175,227,127;position:absolute;top:100px;right:10px;z-index:10;padding:8px\x2012px;background:rgba(0,0,0,.65);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px\x20solid\x20rgba(var(--sp-r),.12);border-radius:8px;font-family:\x22JetBrains\x20Mono\x22,monospace;pointer-events:none;min-width:200px}','#sp-call-stats\x20.sp-co-header{font-size:8px;font-weight:700;letter-spacing:1.2px;color:rgba(var(--sp-r),.5);margin-bottom:4px}','#sp-call-stats\x20.sp-co-row{display:flex;justify-content:space-between;gap:16px;padding:1px\x200;font-size:9px;line-height:1.5}','#sp-call-stats\x20.sp-co-key{color:rgba(255,255,255,.35);font-weight:500;white-space:nowrap}','#sp-call-stats\x20.sp-co-val{color:rgba(var(--sp-r),.75);font-weight:600;font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap}']['join'](''),document['head']['appendChild'](Gz);}function QA(Gz,GZ,Gd){var GY=document['createElement']('div');GY['className']='sp-row';var Gx=document['createElement']('div'),GU=document['createElement']('div');GU['className']='sp-label',GU['textContent']=GZ,Gx['appendChild'](GU);if(Gd){var Gy=document['createElement']('div');Gy['className']='sp-sublabel',Gy['textContent']=Gd,Gx['appendChild'](Gy);}var Gk=document['createElement']('label');Gk['className']='sp-toggle';var GM=document['createElement']('input');GM['type']='checkbox',GM['checked']=Q[Gz];var GP=document['createElement']('span');GP['className']='sp-track';var Gr=document['createElement']('span');return Gr['className']='sp-knob',Gk['appendChild'](GM),Gk['appendChild'](GP),Gk['appendChild'](Gr),GM['addEventListener']('change',function(){Q[Gz]=GM['checked'],e4(),Qs();}),GY['appendChild'](Gx),GY['appendChild'](Gk),GY;}function Qm(Gz,GZ,Gd,GY,Gx,GU,Gy){var Gk=document['createElement']('div');Gk['className']='sp-slider-row';var GM=document['createElement']('div');GM['className']='sp-slider-header';var GP=document['createElement']('div'),Gr=document['createElement']('div');Gr['className']='sp-label',Gr['textContent']=GZ,GP['appendChild'](Gr);if(Gd){var Gp=document['createElement']('div');Gp['className']='sp-sublabel',Gp['textContent']=Gd,GP['appendChild'](Gp);}var GK=document['createElement']('span');GK['className']='sp-slider-val',GK['textContent']=Gy(Q[Gz]),GM['appendChild'](GP),GM['appendChild'](GK);var n0=document['createElement']('input');return n0['type']='range',n0['min']=GY,n0['max']=Gx,n0['step']=GU,n0['value']=Q[Gz],n0['addEventListener']('input',function(){Q[Gz]=Number(n0['value']),GK['textContent']=Gy(Q[Gz]),e4(),Qs();}),Gk['appendChild'](GM),Gk['appendChild'](n0),Gk;}function QO(Gz,GZ,Gd,GY){var Gx=document['createElement']('div');Gx['className']='sp-row';var GU=document['createElement']('div'),Gy=document['createElement']('div');Gy['className']='sp-label',Gy['textContent']=GZ,GU['appendChild'](Gy);if(Gd){var Gk=document['createElement']('div');Gk['className']='sp-sublabel',Gk['textContent']=Gd,GU['appendChild'](Gk);}var GM=document['createElement']('select');for(var GP=-0x23fe+0x55b*-0x3+-0x1*-0x340f;GP<GY['length'];GP++){var Gr=document['createElement']('option');Gr['value']=GY[GP]['value'],Gr['textContent']=GY[GP]['label'];if(String(Q[Gz])===String(GY[GP]['value']))Gr['selected']=!![];GM['appendChild'](Gr);}return GM['addEventListener']('change',function(){Q[Gz]=isNaN(Number(GM['value']))?GM['value']:Number(GM['value']),e4(),Qs();}),Gx['appendChild'](GU),Gx['appendChild'](GM),Gx;}function Qz(){var Gz=document['createElement']('div');Gz['id']=Qc;var GZ=document['createElement']('div');GZ['className']='sp-header';var Gd=document['createElement']('span');Gd['className']='sp-title',Gd['textContent']='Voice\x20&\x20Transport';var GY=document['createElement']('span');GY['className']='sp-ver',GY['textContent']='v9.0',GZ['appendChild'](Gd),GZ['appendChild'](GY),Gz['appendChild'](GZ);var Gx=document['createElement']('div');Gx['className']='sp-tabs';var GU=document['createElement']('div');GU['className']='sp-tab\x20active',GU['textContent']='Audio',GU['setAttribute']('data-sp-tab','voice');var Gy=document['createElement']('div');Gy['className']='sp-tab',Gy['textContent']='Transport',Gy['setAttribute']('data-sp-tab','transport'),Gx['appendChild'](GU),Gx['appendChild'](Gy),Gz['appendChild'](Gx);function Gk(n6){Ql=n6,Gz['querySelectorAll']('.sp-tab')['forEach'](function(n7){n7['classList']['toggle']('active',n7['getAttribute']('data-sp-tab')===n6);}),Gz['querySelectorAll']('.sp-tab-body')['forEach'](function(n7){n7['classList']['toggle']('active',n7['getAttribute']('data-sp-tab')===n6);});}GU['addEventListener']('click',function(){Gk('voice');}),Gy['addEventListener']('click',function(){Gk('transport');});var GM=document['createElement']('div');GM['className']='sp-tab-body\x20active',GM['setAttribute']('data-sp-tab','voice');var GP=document['createElement']('div');GP['className']='sp-section';var Gr=document['createElement']('div');Gr['className']='sp-section-label',Gr['textContent']='Opus\x20Codec\x20·\x20SDP',GP['appendChild'](Gr),GP['appendChild'](QA('stereo','Stereo','stereo=1\x20·\x20sprop-stereo=1')),GP['appendChild'](Qm('maxaveragebitrate','Max\x20Bitrate','maxaveragebitrate',-0x159+0x60*-0x7a+0x4689,0xce0c*0xa+-0xb5d88+-0x2c65*-0x40,0x2292+-0x1b1e+-0xe3*0x4,function(n6){return n6>=-0x56d*0x1+-0x2b*0x59+0x378*0x7?n6/(-0xd03*-0x1+0x1b*0x101+-0x1*0x2436)+'k':n6;})),GP['appendChild'](QO('maxplaybackrate','Playback\x20Rate','maxplaybackrate',[{'value':0x1f40,'label':'8\x20kHz'},{'value':0x2ee0,'label':'12\x20kHz'},{'value':0x3e80,'label':'16\x20kHz'},{'value':0x5dc0,'label':'24\x20kHz'},{'value':0xbb80,'label':'48\x20kHz'}])),GM['appendChild'](GP),GM['appendChild'](document['createElement']('div'))['className']='sp-divider';var Gp=document['createElement']('div');Gp['className']='sp-section';var GK=document['createElement']('div');GK['className']='sp-section-label',GK['textContent']='Browser\x20Suppression',Gp['appendChild'](GK),Gp['appendChild'](QA('echoCancellation','Echo\x20Cancellation','AEC')),Gp['appendChild'](QA('noiseSuppression','Noise\x20Suppression','NS')),Gp['appendChild'](QA('autoGainControl','Auto\x20Gain\x20Control','AGC')),GM['appendChild'](Gp),Gz['appendChild'](GM);var n0=document['createElement']('div');n0['className']='sp-tab-body',n0['setAttribute']('data-sp-tab','transport');var n1=document['createElement']('div');n1['className']='sp-section';var n2=document['createElement']('div');n2['className']='sp-section-label',n2['textContent']='RTP\x20Sender\x20·\x20Encoding',n1['appendChild'](n2),n1['appendChild'](QO('priority','Priority','Local\x20bandwidth\x20scheduling',[{'value':'very-low','label':'Very\x20Low'},{'value':'low','label':'Low'},{'value':'medium','label':'Medium'},{'value':'high','label':'High'}])),n1['appendChild'](QO('networkPriority','Network\x20Priority','DSCP\x20QoS\x20packet\x20marking',[{'value':'very-low','label':'Very\x20Low'},{'value':'low','label':'Low'},{'value':'medium','label':'Medium'},{'value':'high','label':'High'}])),n1['appendChild'](QA('adaptivePtime','Adaptive\x20Ptime','Dynamic\x20packet\x20rate\x20under\x20congestion')),n0['appendChild'](n1),Gz['appendChild'](n0);var n3=document['createElement']('div');n3['className']='sp-status',n3['id']='stereo-status',Gz['appendChild'](n3);var n4=document['createElement']('div');n4['className']='sp-note',n4['textContent']='Rejoin\x20call\x20after\x20SDP\x20changes.\x20Toggle\x20camera\x20to\x20refresh\x20active\x20video.\x20Stats\x20overlay\x20appears\x20on\x20call\x20view.',Gz['appendChild'](n4);var n5=document['createElement']('div');return n5['className']='sp-credit',n5['innerHTML']='Made\x20with\x20❤\x20by\x20<a\x20href=\x22https://www.youtube.com/@unpbeatsuk\x22\x20target=\x22_blank\x22>UNP\x20Beats\x20UK</a>\x20·\x20<a\x20href=\x22https://www.youtube.com/@Kurtzonaudio\x22\x20target=\x22_blank\x22>Kurtzon</a>',Gz['appendChild'](n5),Gz;}function QZ(){var Gz=document['getElementById'](Qc);if(!Gz)return;QN=!QN;if(QN){Gz['classList']['add']('open');var GZ=document['getElementById'](Qu);if(GZ){var Gd=GZ['getBoundingClientRect']();Gz['style']['left']=Math['max'](-0x335*0xa+0x1c89+0xb*0x53,Gd['left']-(-0x1f09+-0x5*0x5cf+0x3c78))+'px';}Qs();}else Gz['classList']['remove']('open');}document['addEventListener']('click',function(Gz){if(!QN)return;var GZ=document['getElementById'](Qc),Gd=document['getElementById'](Qu);GZ&&!GZ['contains'](Gz['target'])&&Gd&&!Gd['contains'](Gz['target'])&&(QN=![],GZ['classList']['remove']('open'));},!![]);function Qd(){var Gz=document['createElement']('div');Gz['id']=Qu,Gz['style']['cssText']='display:inline-flex;align-items:center;gap:6px;margin-left:8px;padding:2px\x208px;border-radius:4px;background:rgb(var(--hc-accent-rgb,175 227 127) / .08);border:1px\x20solid\x20rgb(var(--hc-accent-rgb,175 227 127) / .18);cursor:pointer;user-select:none;flex-shrink:0;transition:background\x20.15s',Gz['addEventListener']('mouseenter',function(){Gz['style']['background']='rgb(var(--hc-accent-rgb,175 227 127) / .16)';}),Gz['addEventListener']('mouseleave',function(){Gz['style']['background']='rgb(var(--hc-accent-rgb,175 227 127) / .08)';});var GZ=document['createElement']('span');GZ['className']='stereo-dot',GZ['style']['cssText']='width:6px;height:6px;border-radius:50%;background:var(--hc-accent,#AFE37F);box-shadow:0\x200\x204px\x20var(--hc-accent,#AFE37F);flex-shrink:0',Gz['appendChild'](GZ);var Gd=document['createElement']('span');Gd['textContent']='STEREO',Gd['style']['cssText']='color:var(--hc-accent,#AFE37F);font:700\x2010px/1\x20monospace;letter-spacing:.5px;white-space:nowrap',Gz['appendChild'](Gd);var GY=document['createElement']('span');return GY['textContent']='▾',GY['style']['cssText']='color:rgb(var(--hc-accent-rgb,175 227 127) / .5);font-size:8px;margin-left:2px',Gz['appendChild'](GY),Gz['addEventListener']('click',function(Gx){Gx['stopPropagation'](),QZ();}),Gz;}function QY(){var Gz=document['querySelectorAll']('[class*=\x22title_\x22]');for(var GZ=-0x110d+-0x10eb+0x8*0x43f;GZ<Gz['length'];GZ++){if(Gz[GZ]['querySelector']('[class*=\x22guildIcon\x22]'))return Gz[GZ];}var Gd=document['querySelector']('[class*=\x22bar_\x22][class*=\x22theme-dark\x22]');if(Gd){var GY=Gd['querySelector']('[class*=\x22title_\x22]');if(GY)return GY;}return null;}function Qx(){}function QU(){Qx(),QJ(),QI(),new MutationObserver(__kcT(function(){Qx(),QJ(),QI();},150))['observe'](document['body']||document['documentElement'],{'childList':!![],'subtree':!![]}),setInterval(function(){Qx(),QJ(),QI();},0x260+0x11fd+-0x8a5);}if(document['body'])QU();else document['addEventListener']('DOMContentLoaded',QU);setInterval(function(){ee&&(Qw(),Qs());},-0x25*0x1d+-0x4403*0x1+0x82cc);var Qy='dvx-native-settings';if(typeof Q['noPushToTalk']==='undefined')Q['noPushToTalk']=![];if(typeof Q['bit24']==='undefined')Q['bit24']=![];if(typeof Q['opusHighBitrate']==='undefined')Q['opusHighBitrate']=![];function Qk(){if(document['getElementById']('dvx-native-styles'))return;var Gz=document['createElement']('style');Gz['id']='dvx-native-styles',Gz['textContent']=[':root{--dvx-track:color-mix(in srgb,var(--hc-text-muted) 42%,transparent)}','#'+Qy+',.dvx-ns{margin:4px 0}','#'+Qy+' .dvx-sec-title,.dvx-ns .dvx-sec-title{display:flex;align-items:center;gap:9px;font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--hc-accent,#AFE37F);margin:22px 0 10px}','#'+Qy+' .dvx-sec-title:before,.dvx-ns .dvx-sec-title:before{content:"";width:9px;height:9px;border-radius:3px;background:linear-gradient(135deg,var(--hc-accent,#AFE37F),var(--hc-accent-2,#63c98f));box-shadow:0 0 12px rgb(var(--hc-accent-rgb,175 227 127) / .45);flex:0 0 auto}','.dvx-ns .dvx-priv-h2{font-size:22px;font-weight:800;letter-spacing:-.01em;color:var(--header-primary,#f2f3f5);margin:0 0 6px;padding:0 0 10px;border-bottom:1px solid rgb(var(--hc-accent-rgb,175 227 127) / .22)}','#'+Qy+' .dvx-row,.dvx-ns .dvx-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 14px;min-height:40px;background:var(--background-secondary,#2b2d31);border:1px solid var(--background-modifier-accent,rgba(255,255,255,.06));border-radius:11px;margin-top:8px}','#'+Qy+' .dvx-row.dis,.dvx-ns .dvx-row.dis{opacity:.4}','#'+Qy+' .dvx-lbl,.dvx-ns .dvx-lbl{font-size:15px;font-weight:600;color:var(--header-primary,#f2f3f5)}','#'+Qy+' .dvx-sub,.dvx-ns .dvx-sub{font-size:12.5px;line-height:1.45;color:var(--text-muted,#949ba4);margin-top:3px}','#'+Qy+' .dvx-sw,.dvx-ns .dvx-sw{position:relative;width:42px;height:24px;border-radius:13px;background:var(--background-modifier-active,#4e5058);flex:0 0 auto;cursor:pointer;transition:background .15s;border:none;padding:0}','#'+Qy+' .dvx-sw.on,.dvx-ns .dvx-sw.on{background:var(--hc-accent,#AFE37F)}','#'+Qy+' .dvx-sw .knob,.dvx-ns .dvx-sw .knob{position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .15s,background .15s}','#'+Qy+' .dvx-sw.on .knob,.dvx-ns .dvx-sw.on .knob{transform:translateX(18px);background:var(--hc-accent-ink,#10151a)}','#'+Qy+' .dvx-row.dis .dvx-sw,.dvx-ns .dvx-row.dis .dvx-sw{cursor:not-allowed}','#'+Qy+' .dvx-slider-wrap{padding:6px 0 14px}','#'+Qy+' .dvx-slider-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}','#'+Qy+' .dvx-val{font-size:13px;font-weight:700;color:var(--hc-accent,#AFE37F);font-variant-numeric:tabular-nums}','#'+Qy+' input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:8px;border-radius:4px;background:var(--dvx-track);outline:none;cursor:pointer}','#'+Qy+' input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--hc-accent,#AFE37F);cursor:pointer;box-shadow:0 0 0 4px rgb(var(--hc-accent-rgb,175 227 127) / .18),0 2px 6px rgba(0,0,0,.45);border:none}','#'+Qy+' input[type=range]::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:var(--hc-accent,#AFE37F);cursor:pointer;border:none;box-shadow:0 0 0 4px rgb(var(--hc-accent-rgb,175 227 127) / .18),0 2px 6px rgba(0,0,0,.45)}','#'+Qy+' .dvx-slider-labels{display:flex;justify-content:space-between;margin-top:7px;font-size:11px;font-weight:500;color:var(--text-muted,#949ba4)}','#'+Qy+' .dvx-slider-labels.dvx-gain-labels{position:relative;display:block;height:14px}','#'+Qy+' .dvx-slider-labels.dvx-gain-labels span{position:absolute;top:0;transform:translateX(-50%);white-space:nowrap}','#'+Qy+' .dvx-divider,.dvx-ns .dvx-divider{height:1px;background:linear-gradient(90deg,rgb(var(--hc-accent-rgb,175 227 127) / .28),rgb(var(--hc-accent-rgb,175 227 127) / 0));margin:16px 0}','#'+Qy+'.dvx-speex-on .dvx-codec-row~*{opacity:.35;pointer-events:none;filter:grayscale(1)}','#'+Qy+' .dvx-codec-row{background:linear-gradient(90deg,rgb(var(--hc-accent-rgb,175 227 127) / .10),rgb(var(--hc-accent-rgb,175 227 127) / .02));border:1px solid rgb(var(--hc-accent-rgb,175 227 127) / .30)}','#'+Qy+' .dvx-codec-row .dvx-sub{color:rgb(var(--hc-accent-rgb,175 227 127) / .75)}','#vc-quick-voice-panel.kc-speex-on>div>*:not(:first-child){opacity:.35;pointer-events:none;filter:grayscale(1)}','.dvx-modal-bg{position:fixed;inset:0;z-index:1000000;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center}','.dvx-modal{width:440px;max-width:90vw;background:var(--background-primary,#313338);border:1px solid rgb(var(--hc-accent-rgb,175 227 127) / .22);border-radius:14px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.6);font-family:var(--font-primary,sans-serif)}','.dvx-modal h1{margin:0;padding:16px;font-size:20px;font-weight:800;color:var(--header-primary,#f2f3f5);background:linear-gradient(90deg,rgb(var(--hc-accent-rgb,175 227 127) / .14),rgb(var(--hc-accent-rgb,175 227 127) / 0))}','.dvx-modal .dvx-mbody{padding:4px 16px 20px;font-size:15px;line-height:1.45;color:var(--text-normal,#dbdee1)}','.dvx-modal .dvx-foot{display:flex;justify-content:flex-end;gap:8px;padding:16px;background:var(--background-secondary,#2b2d31)}','.dvx-btn{border:none;border-radius:8px;padding:2px 16px;min-height:38px;font-size:14px;font-weight:600;cursor:pointer}','.dvx-btn.yes{background:var(--hc-accent,#AFE37F);color:var(--hc-accent-ink,#10151a)}','.dvx-btn.no{background:transparent;color:var(--text-normal,#dbdee1)}','#'+Qy+' button:not(.dvx-sw):not(.dvx-dd-btn):not(.dvx-danger){transition:border-color .15s,box-shadow .15s}','#'+Qy+' button:not(.dvx-sw):not(.dvx-dd-btn):not(.dvx-danger):hover{border-color:rgb(var(--hc-accent-rgb) / 55%)!important;box-shadow:0 0 0 1px rgb(var(--hc-accent-rgb) / 18%),0 0 14px rgb(var(--hc-accent-rgb) / 22%)}','#'+Qy+' input[type=number]:focus{border-color:var(--hc-accent)!important}','#'+Qy+' .dvx-eq-freq{box-sizing:border-box;width:100%;min-width:0;height:22px;padding:0 1px;border:1px solid var(--hc-panel-border,rgba(255,255,255,.08));border-radius:6px;background:var(--hc-row-bg,rgba(0,0,0,.2));color:var(--hc-text,#dbdee1);font-family:var(--font-code,monospace);font-size:10px;font-variant-numeric:tabular-nums;letter-spacing:-.3px;text-align:center;outline:none;color-scheme:dark;transition:border-color .15s,box-shadow .15s}','#'+Qy+' .dvx-eq-freq:hover{border-color:rgb(var(--hc-accent-rgb) / 45%)}','#'+Qy+' .dvx-eq-freq::-webkit-inner-spin-button,#'+Qy+' .dvx-eq-freq::-webkit-outer-spin-button{display:none;margin:0;-webkit-appearance:none}','#'+Qy+' .dvx-eq-freq:focus{position:relative;z-index:2;width:calc(100% + 22px);margin:0 -11px;padding:0 2px 0 4px;background:var(--hc-window-bg,#1e1f22);box-shadow:0 0 0 1px rgb(var(--hc-accent-rgb) / 20%),0 4px 12px rgb(0 0 0 / 40%)}','#'+Qy+' .dvx-eq-freq:focus::-webkit-inner-spin-button{display:block;height:18px;opacity:.75;cursor:pointer}','#'+Qy+' .dvx-grp-title{font-size:13px;font-weight:700;color:var(--hc-text-muted);margin:18px 0 0}','#'+Qy+' .dvx-native-off{opacity:.4;pointer-events:none}','#'+Qy+' .dvx-native-note{margin:-6px 0 8px}','.dvx-btn.dvx-danger{display:inline-flex;align-items:center;gap:8px;background:var(--status-danger,#da373c);color:#fff;transition:filter .15s,box-shadow .15s}','.dvx-btn.dvx-danger:hover{filter:brightness(1.1);box-shadow:0 0 14px rgb(218 55 60 / 45%)}','.dvx-btn.dvx-danger:focus-visible{outline:2px solid var(--hc-accent);outline-offset:2px}','html.hc-theming [data-dvx-vol]{padding:6px 0 14px}','html.hc-theming [data-dvx-vol] label,html.hc-theming [data-dvx-vol] h2,html.hc-theming [data-dvx-vol] h3{font-size:15px;font-weight:600;color:var(--header-primary,#f2f3f5);margin:0 0 8px;letter-spacing:0;text-transform:none}','html.hc-theming [data-dvx-vol] input[type=range]:not([class*="grabber"] *){-webkit-appearance:none;appearance:none;width:100%;height:8px;border-radius:4px;background:var(--dvx-track);outline:none;cursor:pointer}','html.hc-theming [data-dvx-vol] input[type=range]:not([class*="grabber"] *)::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--hc-accent,#AFE37F);cursor:pointer;box-shadow:0 0 0 4px rgb(var(--hc-accent-rgb,175 227 127) / .18),0 2px 6px rgba(0,0,0,.45);border:none}','html.hc-theming [data-dvx-vol] [class^="bar_"],html.hc-theming [data-dvx-vol] [class*=" bar_"]{height:8px!important;border-radius:4px!important;background:var(--dvx-track)!important}','html.hc-theming [data-dvx-vol] [class*="barFill_"]{height:8px!important;border-radius:4px!important;background:var(--hc-accent,#AFE37F)!important}','html.hc-theming [data-dvx-vol] [class*="grabber_"]{width:18px!important;height:18px!important;border-radius:50%!important;background:var(--hc-accent,#AFE37F)!important;border:none!important;box-shadow:0 0 0 4px rgb(var(--hc-accent-rgb,175 227 127) / .18),0 2px 6px rgba(0,0,0,.45)!important}','html.hc-theming [data-dvx-vol] [class*="grabber_"] *{background:transparent!important;border:none!important}']['join'](''),document['head']['appendChild'](Gz);}function QM(Gz,GZ,Gd){Qk();var GY=document['createElement']('div');GY['className']='dvx-modal-bg';var Gx=document['createElement']('div');Gx['className']='dvx-modal';var GU=document['createElement']('h1');GU['textContent']=Gz,Gx['appendChild'](GU);var Gy=document['createElement']('div');Gy['className']='dvx-mbody',Gy['textContent']=GZ,Gx['appendChild'](Gy);var Gk=document['createElement']('div');Gk['className']='dvx-foot';var GM=document['createElement']('button');GM['className']='dvx-btn\x20no',GM['textContent']='No';var GP=document['createElement']('button');GP['className']='dvx-btn\x20yes',GP['textContent']='Yes',Gk['appendChild'](GM),Gk['appendChild'](GP),Gx['appendChild'](Gk),GY['appendChild'](Gx),document['body']['appendChild'](GY);var Gr=function(){if(GY['parentNode'])GY['parentNode']['removeChild'](GY);};GM['onclick']=Gr,GY['onclick']=function(Gp){if(Gp['target']===GY)Gr();},GP['onclick']=function(){Gr();try{Gd();}catch(Gp){}};}function QP(Gz,GZ){var Gd=document['createElement']('button');Gd['type']='button';var GY=document['createElement']('span');return GY['className']='knob',Gd['className']='dvx-sw'+(Gz()?'\x20on':''),Gd['appendChild'](GY),Gd['_render']=function(){var on=!!Gz();Gd['className']='dvx-sw'+(on?'\x20on':'');Gd['setAttribute']('aria-checked',String(on));},Gd['setAttribute']('role','switch'),Gd['_render'](),Gd['onclick']=function(){GZ(!Gz(),Gd);Gd['_render']();},Gd;}function Qr(Gz,GZ,Gd,GY){var Gx=document['createElement']('div');Gx['className']='dvx-row'+(GY?'\x20dis':'');var GU=document['createElement']('div'),Gy=document['createElement']('div');Gy['className']='dvx-lbl',Gy['textContent']=Gz,GU['appendChild'](Gy);if(GZ){var Gk=document['createElement']('div');Gk['className']='dvx-sub',Gk['textContent']=GZ,GU['appendChild'](Gk);}return Gx['appendChild'](GU),Gx['appendChild'](Gd),Gx;}function Qp(Gz,GZ,Gd){var GY=document['createElement']('select');return GY['style']['cssText']='background:var(--background-tertiary,#1e1f22);border:1px\x20solid\x20var(--background-modifier-accent,rgba(255,255,255,.08));color:var(--header-primary,#f2f3f5);font-size:13px;padding:6px\x208px;border-radius:4px;outline:none;cursor:pointer',Gz['forEach'](function(Gx){var GU=document['createElement']('option');GU['value']=Gx[0x1e8a*0x1+0xc20*-0x2+-0x64a],GU['textContent']=Gx[-0xff6+-0x3*0x3e5+0x1ba6],GY['appendChild'](GU);}),GY['value']=String(GZ()),GY['onchange']=function(){Gd(GY['value'],GY);},dvxDd(GY);}
function QK(){var Gz=document['createElement']('div');Gz['id']=Qy;var GZ=document['createElement']('div');GZ['className']='dvx-sec-title',GZ['textContent']='Stereo\x20and\x20Advanced\x20Audio\x20Controls',Gz['appendChild'](GZ);var dvxCodecRow=document['createElement']('div');dvxCodecRow['className']='dvx-row dvx-codec-row';var dvxCodecL=document['createElement']('div'),dvxCodecT=document['createElement']('div'),dvxCodecS=document['createElement']('div');dvxCodecT['className']='dvx-lbl',dvxCodecT['textContent']='Voice Codec';dvxCodecS['className']='dvx-sub kc-codec-status',dvxCodecS['textContent']='Opus (default): every control below is active.';dvxCodecL['appendChild'](dvxCodecT),dvxCodecL['appendChild'](dvxCodecS);var dvxCodecSel=Qp([['opus','Opus (Default)'],['speex','Speex (2009 Xbox Live)'],['xma','XMA (2009 Modern Warfare 2)']],function(){var dvxC=Q['codec'];return (dvxC==='speex'||dvxC==='xma')?dvxC:'opus';},function(nx){var dvxC=(nx==='speex'||nx==='xma')?nx:'opus';Q['codec']=dvxC;E(),e4();dvxCodecPaint();if(typeof Qs==='function')Qs();});dvxCodecRow['appendChild'](dvxCodecL),dvxCodecRow['appendChild'](dvxCodecSel);var Gd=document['createElement']('div');Gd['className']='dvx-presets',Gd['style']['cssText']='margin:2px\x200\x2014px';var GY=document['createElement']('div');GY['className']='dvx-sub',GY['style']['cssText']='margin-bottom:8px',GY['textContent']='One tap tunes the Opus encoder for a goal. Native turns every HaloCord audio override off and uses stock Discord audio. Changes apply to the call you are in. You can still fine-tune the controls below afterwards.',Gd['appendChild'](GY);var Gx=document['createElement']('div');Gx['style']['cssText']='display:flex;gap:8px;flex-wrap:wrap';function GU(nx,nU,ny){var nk=document['createElement']('button'),on=ny==='native'&&dvxNative();nk['type']='button',nk['title']=nU,nk['textContent']=nx;if(ny==='native')nk['setAttribute']('aria-pressed',String(on));nk['style']['cssText']='flex:1 1 130px;min-width:120px;padding:9px 10px;border:1px solid '+(on?'var(--hc-accent)':'var(--hc-row-border)')+';border-radius:8px;background:'+(on?'rgb(var(--hc-accent-rgb) / 12%)':'var(--hc-row-bg)')+';color:'+(on?'var(--hc-accent)':'var(--hc-text)')+';font-size:12px;font-weight:600;cursor:pointer';nk['onclick']=function(){Gi(ny);};return nk;}Gx['appendChild'](GU('Native','Stock Discord audio: Discord picks the bitrate, channels, packet time and voice processing. Every HaloCord audio override is off.','native')),Gx['appendChild'](GU('High\x20bitrate','10\x20ms\x20min\x20and\x20max\x20packet\x20time,\x20bitrate\x20maxed\x20at\x20510\x20kbps.\x20Highest\x20stable\x20quality.','high')),Gx['appendChild'](GU('Optimised\x20bitrate','248\x20kbps,\x2010/60\x20ms\x20packet\x20time.\x20Balanced\x20quality\x20and\x20reliability\x20for\x20most\x20connections.','optimised')),Gx['appendChild'](GU('Anti\x20packet\x20loss','128\x20kbps,\x20FEC\x20on,\x20variable\x20bitrate.\x20Tuned\x20to\x20stay\x20clear\x20on\x20lossy\x20networks\x20through\x20the\x20Discord\x20SFU.','antiloss')),Gd['appendChild'](Gx),Gz['appendChild'](Gd);var Gy=null,Gk=null,GM=null;function GP(){if(Gy&&Gy['_render'])Gy['_render']();if(Gk){if(Q['stereo'])Gk['classList']['remove']('dis');else Gk['classList']['add']('dis');}}var Gr=QP(function(){return Q['stereo'];},function(nx,nU){if(nx)QM('Enable\x20Stereo','Your\x20microphone\x20requires\x20at\x20least\x20dual\x20channel\x20and\x20a\x20modern\x20CPU\x20with\x20AVX-2\x20support\x20for\x20better\x20stability,\x20would\x20you\x20like\x20to\x20continue?',function(){Q['stereo']=!![],e4(),nU['_render'](),GP();if(typeof Qs==='function')Qs();});else{Q['stereo']=![],Q['spatialInput']=![],e4(),nU['_render'](),GP();if(typeof Qs==='function')Qs();}});Gz['appendChild'](Qr('Stereo','Dual-channel\x20Opus\x20(stereo=1,\x20sprop-stereo=1)',Gr));var GK=QP(function(){return!!Q['opusDtx'];},function(nx,nU){Q['opusDtx']=!!nx,E(),e4(),nU['_render']();if(typeof Qs==='function')Qs();});Gz['appendChild'](Qr('Opus\x20DTX','Discontinuous\x20transmission.\x20Sends\x20less\x20during\x20silence.\x20Changes\x20apply\x20right\x20away.',GK));var n0=QP(function(){return!!Q['opusCbr'];},function(nx,nU){Q['opusCbr']=!!nx,E(),e4(),nU['_render']();if(typeof Qs==='function')Qs();});Gz['appendChild'](Qr('Constant\x20Bitrate','Keeps\x20Opus\x20cbr=1\x20for\x20steadier\x20bitrate.\x20Turn\x20off\x20for\x20variable\x20bitrate.',n0));var n1=Qp([['10','10\x20ms'],['20','20\x20ms'],['40','40\x20ms'],['60','60\x20ms']],function(){return Q['opusMinptime'];},function(nx){Q['opusMinptime']=Number(nx)||-0x365*-0xa+-0x13e1*0x1+-0x3f*0x39;if(Q['opusMaxptime']<Q['opusMinptime'])Q['opusMaxptime']=Q['opusMinptime'];E(),e4();if(typeof Qs==='function')Qs();});Gz['appendChild'](Qr('Minimum\x20Packet\x20Time','Opus\x20minptime\x20hint.\x2010\x20ms\x20has\x20the\x20lowest\x20delay;\x20higher\x20values\x20can\x20add\x20latency.',n1));var n2=Qp([['10','10\x20ms'],['20','20\x20ms'],['40','40\x20ms'],['60','60\x20ms'],['120','120\x20ms']],function(){return Q['opusMaxptime'];},function(nx){Q['opusMaxptime']=Number(nx)||-0x1a32+0x1*-0x1a2f+0x349d;if(Q['opusMaxptime']<Q['opusMinptime'])Q['opusMaxptime']=Q['opusMinptime'];E(),e4();if(typeof Qs==='function')Qs();});Gz['appendChild'](Qr('Maximum\x20Packet\x20Time','Opus\x20maxptime\x20SDP\x20attribute.\x20Higher\x20values\x20can\x20add\x20packet\x20latency.',n2));var n4=document['createElement']('div');n4['className']='dvx-slider-wrap';var n5=document['createElement']('div');n5['className']='dvx-slider-top';var n6=document['createElement']('div');n6['className']='dvx-lbl',n6['textContent']='Opus\x20Complexity';var n7=document['createElement']('span');n7['className']='dvx-val',n5['appendChild'](n6),n5['appendChild'](n7);var n8=document['createElement']('input');n8['type']='range',n8['min']='0',n8['max']='10',n8['step']='1',n8['value']=String(Number(Q['opusComplexity']));function n9(nx){return String(Math['max'](-0x1734+0x2051+-0x1*0x91d,Math['min'](-0x13f*-0x11+0x1f41+0x1a33*-0x2,Number(nx)||0x259d+-0x122*0x22+0xb*0x15)));}n7['textContent']=n9(n8['value']),n8['oninput']=function(){Q['opusComplexity']=Math['max'](0x1ef1+0x1*-0xa83+-0x146e,Math['min'](-0x13bd*0x1+0x1ede+-0x11*0xa7,Number(n8['value'])||-0x3*-0xbf5+0x1*0x17c6+0x1*-0x3ba5)),n7['textContent']=n9(Q['opusComplexity']),nH(n8),E(),e4();if(typeof Qs==='function')Qs();},nH(n8);var ne=document['createElement']('div');ne['className']='dvx-slider-labels',ne['innerHTML']='<span>0</span><span>5</span><span>10</span>',n4['appendChild'](n5),n4['appendChild'](n8),n4['appendChild'](ne),Gz['appendChild'](n4);var nQ=document['createElement']('div');nQ['className']='dvx-sub',nQ['style']['margin']='-6px\x200\x208px',nQ['textContent']='No\x20effect\x20in\x20this\x20client:\x20Chromium\x27s\x20WebRTC\x20ignores\x20it\x20and\x20always\x20uses\x20complexity\x209.',Gz['appendChild'](nQ);var nG=QP(function(){return!!Q['adaptivePtime'];},function(nx,nU){Q['adaptivePtime']=!!nx,e4(),nU['_render']();if(typeof Qs==='function')Qs();});Gz['appendChild'](Qr('Adaptive\x20Ptime','Allows\x20Chromium\x20to\x20adapt\x20Opus\x20packet\x20timing\x20under\x20congestion.',nG));var nn=QP(function(){return!!Q['voiceMeter'];},function(nx,nU){Q['voiceMeter']=nx,e4(),nU['_render']();try{if(nx)Gf['start']();else Gf['stop']();}catch(ny){}});Gz['appendChild'](Qr('Voice\x20Volume\x20Meter','Live\x20volume\x20bars\x20on\x20voice\x20call\x20tiles.\x20Inbound\x20(other)\x20users\x20only.',nn));Gz['appendChild'](Qr('Bypass\x20System\x20Audio\x20Input\x20Processing','Requests\x20the\x20raw\x20microphone.\x20Overrides\x20Voice\x20Processing\x20(echo\x20cancellation,\x20noise\x20suppression,\x20automatic\x20gain\x20control)\x20above\x20while\x20on.\x20Applies\x20right\x20away.',QP(function(){return!!Q['bypassInputProcessing'];},function(nx){Q['bypassInputProcessing']=!!nx,e4();})));nf('Microphone Gain','micGain',1,10,0.1,function(nx){return Math['round'](Number(nx)*10)/10+'x';},'<span style=\x22left:0;transform:none\x22>1x</span><span style=\x22left:50%\x22>5x</span><span style=\x22left:100%;transform:translateX(-100%)\x22>10x</span>','Pre-encoder microphone gain (1x-10x), the same idea as the Stereo Node Patcher gain. 1x is off. Applies live; high values can clip a loud mic.','dvx-gain-labels');nf('Mic Reverb','micReverb',0,100,1,function(nx){return Math['round'](Number(nx))+'%';},'<span style=\x22left:0;transform:none\x22>Off</span><span style=\x22left:100%;transform:translateX(-100%)\x22>100%</span>','How much of your voice goes through the reverb. 0 is off. Applies live; everyone hears it and it shows in your mic test.','dvx-gain-labels');nf('Reverb Size','micReverbSize',0.2,6,0.1,function(nx){return Number(nx)['toFixed'](1)+'\x20s';},'<span style=\x22left:0;transform:none\x22>0.2s</span><span style=\x22left:100%;transform:translateX(-100%)\x22>6s</span>','Length of the reverb tail. Longer sounds like a bigger room. Rebuilds the reverb when changed.','dvx-gain-labels');nf('Reverb Tone','micReverbTone',1500,16000,100,function(nx){return(Math['round'](Number(nx)/100)/10)+'\x20kHz';},'<span style=\x22left:0;transform:none\x22>1.5k</span><span style=\x22left:100%;transform:translateX(-100%)\x22>16k</span>','Damps the reverb tail. Lower is darker and softer; higher is brighter.','dvx-gain-labels');try{var dvxEQcard=document['createElement']('div');dvxEQcard['id']='dvx-eq-card';
dvxEQcard['style']['cssText']='margin-top:12px;padding:12px 12px 10px;border:1px solid var(--background-modifier-accent,rgba(255,255,255,.08));border-radius:8px;background:rgba(0,0,0,.12)';
var dvxEQhead=document['createElement']('div');dvxEQhead['style']['cssText']='display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:8px';
var dvxEQhl=document['createElement']('div');
var dvxEQt=document['createElement']('div');dvxEQt['className']='dvx-lbl';dvxEQt['textContent']='16-Band Parametric EQ';
var dvxEQs=document['createElement']('div');dvxEQs['className']='dvx-sub';dvxEQs['textContent']='Sixteen peaking bands on your outgoing voice, before Opus. Drag a fader for its gain, type to set its frequency. Applies live and shows in your mic test.';
dvxEQhl['appendChild'](dvxEQt);dvxEQhl['appendChild'](dvxEQs);dvxEQhead['appendChild'](dvxEQhl);
var dvxEQsw=QP(function(){return !!Q['eqEnabled'];},function(nx){Q['eqEnabled']=!!nx,e4();dvxEQpaint();});
dvxEQhead['appendChild'](dvxEQsw);dvxEQcard['appendChild'](dvxEQhead);
var dvxEQcv=document['createElement']('canvas');
dvxEQcv['style']['cssText']='width:100%;height:84px;display:block;border-radius:6px;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.06);margin-bottom:10px';
dvxEQcard['appendChild'](dvxEQcv);
var dvxEQst=dvxEqBands(),dvxEQctl=[];
var dvxEQgrid=document['createElement']('div');
dvxEQgrid['style']['cssText']='display:grid;grid-template-columns:repeat(auto-fit,minmax(58px,1fr));gap:10px 6px;align-items:end';
function dvxEQcommit(){Q['eqBands']=JSON['stringify'](dvxEQst);e4();dvxEQpaint();}
function dvxEQcurve(){
  try{
    var W=dvxEQcv['clientWidth']||dvxEQcv['offsetWidth']||360,H=84,dpr=window['devicePixelRatio']||1;
    dvxEQcv['width']=Math['round'](W*dpr);dvxEQcv['height']=Math['round'](H*dpr);
    var g=dvxEQcv['getContext']('2d');if(!g)return;
    g['setTransform'](dpr,0,0,dpr,0,0);g['clearRect'](0,0,W,H);
    var fmin=20,fmax=20000,dbMax=12;
    function Xp(f){return Math['log'](f/fmin)/Math['log'](fmax/fmin)*W;}
    function Yp(db){return H/2-db/dbMax*(H/2-6);}
    g['strokeStyle']='rgba(255,255,255,.07)';g['lineWidth']=1;
    [30,100,300,1000,3000,10000]['forEach'](function(f){g['beginPath']();g['moveTo'](Xp(f),0);g['lineTo'](Xp(f),H);g['stroke']();});
    [12,6,0,-6,-12]['forEach'](function(db){g['beginPath']();g['moveTo'](0,Yp(db));g['lineTo'](W,Yp(db));g['stroke']();});
    var bands=dvxEqBands(),qq=dvxEqQ(),on=!!Q['eqEnabled'],co=[];
    for(var bi=0;bi<16;bi++){
      var b=bands[bi],A=Math['pow'](10,b['g']/40),w0=2*Math['PI']*b['f']/48000,c0=Math['cos'](w0),s0=Math['sin'](w0),al=s0/(2*qq);
      co['push']({'b0':1+al*A,'b1':-2*c0,'b2':1-al*A,'a0':1+al/A,'a1':-2*c0,'a2':1-al/A});
    }
    g['beginPath']();
    for(var px=0;px<=W;px++){
      var f=fmin*Math['pow'](fmax/fmin,px/W),w=2*Math['PI']*f/48000,cw=Math['cos'](w),sw=Math['sin'](w),cw2=Math['cos'](2*w),sw2=Math['sin'](2*w),db=0;
      if(on)for(var ci=0;ci<16;ci++){
        var c=co[ci];
        var nr=c['b0']+c['b1']*cw+c['b2']*cw2,nim=-(c['b1']*sw+c['b2']*sw2);
        var dr=c['a0']+c['a1']*cw+c['a2']*cw2,dim=-(c['a1']*sw+c['a2']*sw2);
        var m2=(nr*nr+nim*nim)/(dr*dr+dim*dim);db+=10*Math['log10'](m2>0?m2:0.0000001);
      }
      var yy=Yp(db);px===0?g['moveTo'](px,yy):g['lineTo'](px,yy);
    }
    var hcA=String(getComputedStyle(document['documentElement'])['getPropertyValue']('--hc-accent')||'')['trim']()||'#AFE37F';g['strokeStyle']=on?hcA:'rgba(255,255,255,.45)';g['lineWidth']=on?2:1.5;g['stroke']();
    if(on)try{g['fillStyle']=hcA;g['globalAlpha']=0.07;g['lineTo'](W,H/2);g['lineTo'](0,H/2);g['closePath']();g['fill']();}catch(dvxEQF1){}g['globalAlpha']=1;
  }catch(dvxEQF2){}
}
function dvxEQpaint(){
  for(var i=0;i<dvxEQctl['length'];i++){
    var b=dvxEQst[i],gl=dvxEQctl[i]['gl'];
    gl['textContent']=(b['g']>0?'+':'')+String(b['g']===0?0:b['g']);
    gl['style']['color']=b['g']>0?'var(--hc-accent)':b['g']<0?'#ed4245':'var(--text-muted,#949ba4)';
  }
  dvxEQcurve();
}
function dvxEQsetGains(arr){
  for(var i=0;i<16&&i<arr['length'];i++){
    dvxEQst[i]['g']=arr[i];
    try{dvxEQctl[i]['hs']['value']=String(arr[i]);}catch(dvxEQG0){}
  }
  dvxEQcommit();
}
for(var dvxEQi=0;dvxEQi<16;dvxEQi++)(function(idx){
  var col=document['createElement']('div');col['style']['cssText']='display:flex;flex-direction:column;align-items:center;gap:4px;min-width:0';
  var gl=document['createElement']('div');gl['style']['cssText']='font-size:10px;line-height:12px;height:12px;font-variant-numeric:tabular-nums;color:var(--text-muted,#949ba4)';
  var hs=document['createElement']('input');hs['type']='range';hs['min']='-12';hs['max']='12';hs['step']='0.5';hs['value']=String(dvxEQst[idx]['g']);
  hs['style']['cssText']='-webkit-appearance:slider-vertical;appearance:slider-vertical;writing-mode:vertical-lr;direction:rtl;width:18px;height:96px;accent-color:var(--hc-accent,#AFE37F);cursor:pointer;margin:0 auto';
  hs['title']='Band '+(idx+1)+' gain in dB (double-click to reset)';
  var fn=document['createElement']('input');fn['type']='number';fn['min']='20';fn['max']='20000';fn['step']='1';fn['value']=String(dvxEQst[idx]['f']);
  fn['className']='dvx-eq-freq';
  fn['style']['cssText']='height:28px;font-size:11px;letter-spacing:0;padding:0 3px';
  fn['title']='Band '+(idx+1)+' frequency in Hz (double-click to reset)';
  hs['oninput']=function(){dvxEQst[idx]['g']=Number(this['value']);dvxEQcommit();};hs['ondblclick']=function(){dvxEQst[idx]['g']=0;this['value']='0';if(dvxEQctl[idx]&&dvxEQctl[idx]['gl'])dvxEQctl[idx]['gl']['textContent']='0';dvxEQcommit();};
  fn['onchange']=function(){var v=Number(this['value']);if(!isFinite(v))v=dvxEQst[idx]['f'];if(v<20)v=20;if(v>20000)v=20000;v=Math['round'](v);this['value']=String(v);dvxEQst[idx]['f']=v;dvxEQcommit();};fn['ondblclick']=function(){this['value']=String(dvxEqFreqs[idx]);dvxEQst[idx]['f']=dvxEqFreqs[idx];dvxEQcommit();};
  col['appendChild'](gl);col['appendChild'](hs);col['appendChild'](fn);
  dvxEQgrid['appendChild'](col);
  dvxEQctl['push']({'hs':hs,'fn':fn,'gl':gl});
})(dvxEQi);
dvxEQcard['appendChild'](dvxEQgrid);
var dvxEQfoot=document['createElement']('div');dvxEQfoot['style']['cssText']='display:flex;flex-wrap:wrap;gap:6px;margin-top:10px';
var dvxEQpresets=[['Flat',[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],['Bass',[4,3.5,3,2.5,2,1.5,1,0.5,0,0,0,0,0,0,0,0]],['Treble',[0,0,0,0,0,0,0,0,0,0.5,1,1.5,2,2.5,3,3.5]],['Warm',[2.5,2,1.5,0.5,-0.5,-0.5,0,0,0,0,0.5,1,1.5,2,2,2]],['Podcast',[-2,-2,-1.5,-1,0,0.5,1,1.5,1.5,1,0.5,0,0,0,0,0]],['V-Shape',[3,3,2.5,1.5,0,-1,-1.5,-1,0,1,1.5,2,2.5,3,3,3]],['Telephone',[-6,-6,-4,-2,0,2,3,3,2,1,0,-2,-4,-6,-6,-6]]];
dvxEQpresets['forEach'](function(P){
  var b=document['createElement']('button');b['type']='button';b['textContent']=P[0];
  b['style']['cssText']='padding:4px 10px;border:1px solid var(--background-modifier-accent,rgba(255,255,255,.12));border-radius:5px;background:var(--background-tertiary,#1e1f22);color:var(--header-primary,#f2f3f5);font-size:11px;font-weight:600;cursor:pointer';
  b['onmouseenter']=function(){b['style']['borderColor']='var(--hc-accent,#AFE37F)';};
  b['onmouseleave']=function(){b['style']['borderColor']='var(--background-modifier-accent,rgba(255,255,255,.12))';};
  b['onclick']=function(){dvxEQsetGains(P[1]);};
  dvxEQfoot['appendChild'](b);
});
dvxEQcard['appendChild'](dvxEQfoot);
var dvxEQqrow=document['createElement']('div');dvxEQqrow['className']='dvx-slider-wrap';dvxEQqrow['style']['marginTop']='12px';
var dvxEQqtop=document['createElement']('div');dvxEQqtop['className']='dvx-slider-top';
var dvxEQql=document['createElement']('div');dvxEQql['className']='dvx-lbl';dvxEQql['textContent']='Band width (Q)';
var dvxEQqv=document['createElement']('span');dvxEQqv['className']='dvx-val';dvxEQqv['textContent']=dvxEqQ()['toFixed'](1);
dvxEQqtop['appendChild'](dvxEQql);dvxEQqtop['appendChild'](dvxEQqv);
var dvxEQqs=document['createElement']('input');dvxEQqs['type']='range';dvxEQqs['min']='0.3';dvxEQqs['max']='6';dvxEQqs['step']='0.1';dvxEQqs['value']=String(dvxEqQ());
var dvxEQqPaint=function(){var nx=+dvxEQqs['min'],nU=+dvxEQqs['max'],ny=+dvxEQqs['value'],nM=nU>nx?(ny-nx)/(nU-nx)*100:0;dvxEQqs['style']['background']='linear-gradient(to right,var(--hc-accent,#AFE37F) '+nM+'%,var(--dvx-track) '+nM+'%)';};
dvxEQqs['oninput']=function(){Q['eqQ']=Number(this['value']);dvxEQqv['textContent']=dvxEqQ()['toFixed'](1);dvxEQqPaint();e4();dvxEQcurve();};
var dvxEQqlab=document['createElement']('div');dvxEQqlab['className']='dvx-slider-labels';dvxEQqlab['innerHTML']='<span>0.3</span><span>3</span><span>6</span>';
dvxEQqrow['appendChild'](dvxEQqtop);dvxEQqrow['appendChild'](dvxEQqs);dvxEQqrow['appendChild'](dvxEQqlab);
dvxEQcard['appendChild'](dvxEQqrow);dvxEQqPaint();
Gz['appendChild'](dvxEQcard);
dvxEQpaint();
}catch(dvxEQuiErr){}try{var dvxLMcard=document['createElement']('div');dvxLMcard['id']='dvx-lim-card';
dvxLMcard['style']['cssText']='margin-top:12px;padding:12px 12px 10px;border:1px solid var(--background-modifier-accent,rgba(255,255,255,.08));border-radius:8px;background:rgba(0,0,0,.12)';
var dvxLMhead=document['createElement']('div');dvxLMhead['style']['cssText']='display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:8px';
var dvxLMhl=document['createElement']('div'),dvxLMt=document['createElement']('div'),dvxLMs=document['createElement']('div');
dvxLMt['className']='dvx-lbl';dvxLMt['textContent']='Hard Limiter';
dvxLMs['className']='dvx-sub';dvxLMs['textContent']='A brickwall limiter like the one in Ableton. Nothing gets louder than the ceiling. Applies live to your microphone, what you hear, or both, and shows in your mic test.';
dvxLMhl['appendChild'](dvxLMt);dvxLMhl['appendChild'](dvxLMs);dvxLMhead['appendChild'](dvxLMhl);
var dvxLMbody=document['createElement']('div');
function dvxLMpaint(){dvxLMbody['style']['opacity']=Q['limOn']?'1':'.45';dvxLMbody['style']['pointerEvents']=Q['limOn']?'':'none';}
dvxLMhead['appendChild'](QP(function(){return !!Q['limOn'];},function(nx,nU){Q['limOn']=!!nx,e4(),nU['_render'](),dvxLMpaint();}));
dvxLMcard['appendChild'](dvxLMhead);
dvxLMbody['appendChild'](Qr('Limit','Which audio goes through the limiter.',Qp([['both','Microphone and Speakers'],['mic','Microphone only'],['spk','Speakers only']],function(){var t=Q['limTarget'];return t==='mic'||t==='spk'?t:'both';},function(nx){Q['limTarget']=nx==='mic'||nx==='spk'?nx:'both',e4();})));
dvxLMbody['appendChild'](Qr('Mode','Clean pulls peaks down smoothly first. Hard Clip only cuts them off at the ceiling, which is louder but can crackle.',(function(el){el['style']['minWidth']='130px';el['style']['flexShrink']='0';return el;})(Qp([['clean','Clean'],['clip','Hard Clip']],function(){return Q['limMode']==='clip'?'clip':'clean';},function(nx){Q['limMode']=nx==='clip'?'clip':'clean',e4();}))));
function dvxLMslider(lbl,k,lo,hi,st,fmt,ticks,sub){var w=document['createElement']('div');w['className']='dvx-slider-wrap';var top=document['createElement']('div');top['className']='dvx-slider-top';var t=document['createElement']('div');t['className']='dvx-lbl',t['textContent']=lbl;var v=document['createElement']('span');v['className']='dvx-val';top['appendChild'](t),top['appendChild'](v);var r=document['createElement']('input');r['type']='range',r['min']=String(lo),r['max']=String(hi),r['step']=String(st),r['value']=String(dvxLimNum(k,Number(r['min']),lo,hi));v['textContent']=fmt(Number(r['value']));r['oninput']=function(){Q[k]=Number(r['value']),v['textContent']=fmt(Q[k]),nH(r),e4();};nH(r);w['appendChild'](top),w['appendChild'](r);var lb=document['createElement']('div');lb['className']='dvx-slider-labels dvx-gain-labels',lb['innerHTML']=ticks,w['appendChild'](lb);var sb=document['createElement']('div');sb['className']='dvx-sub',sb['style']['margin']='6px 0 0',sb['textContent']=sub,w['appendChild'](sb);dvxLMbody['appendChild'](w);}
function dvxLMdb(nx){return (Math['round'](Number(nx)*10)/10)['toFixed'](1)+' dB';}
dvxLMslider('Ceiling','limCeil',-30,0,0.1,dvxLMdb,'<span style="left:0;transform:none">-30 dB</span><span style="left:50%">-15 dB</span><span style="left:100%;transform:translateX(-100%)">0 dB</span>','The hard limit. No sample goes above this level.');
dvxLMslider('Gain','limGain',0,24,0.1,function(nx){return '+'+dvxLMdb(nx);},'<span style="left:0;transform:none">0 dB</span><span style="left:50%">+12 dB</span><span style="left:100%;transform:translateX(-100%)">+24 dB</span>','Drives the sound into the limiter. More gain is louder and more squashed.');
dvxLMslider('Release','limRel',10,1000,10,function(nx){return Math['round'](Number(nx))+' ms';},'<span style="left:0;transform:none">10 ms</span><span style="left:100%;transform:translateX(-100%)">1000 ms</span>','How fast the level comes back after a peak. Short is punchy; long is smoother.');
var dvxLMgr=document['createElement']('div');dvxLMgr['className']='dvx-sub dvx-lim-gr';dvxLMgr['style']['cssText']='margin-top:8px;font-variant-numeric:tabular-nums';dvxLMbody['appendChild'](dvxLMgr);
function dvxLMgrPaint(){var m=null,s=null;for(var i=0;i<dvxLims['length'];i++){var L=dvxLims[i];if(L['dead']||L['ctx']['state']==='closed')continue;var r=L['comp']['reduction'];if(L['kind']==='mic')m=m===null?r:Math['min'](m,r);else s=s===null?r:Math['min'](s,r);}function f(x){return x===null?'idle':(x<-0.05?x['toFixed'](1)+' dB':'0.0 dB');}dvxLMgr['textContent']='Gain reduction: microphone '+f(m)+', speakers '+f(s);}
dvxLMgrPaint();var dvxLMseen=![],dvxLMwait=0,dvxLMtimer=setInterval(function(){if(dvxLMcard['isConnected'])dvxLMseen=!![];else{if(dvxLMseen||++dvxLMwait>240)clearInterval(dvxLMtimer);return;}dvxLMgrPaint();},250);
dvxLMcard['appendChild'](dvxLMbody);dvxLMpaint();Gz['appendChild'](dvxLMcard);}catch(dvxLMe){}Gz['appendChild'](Qr('Effects Engine Rate','Sample rate of HaloCord\x27s mic effects chain. Listeners always get 48 kHz Opus, so higher rates only cost CPU. Applies after the mic restarts.',Qp([['0','Follow device'],['48000','48 kHz'],['96000','96 kHz']],function(){return String(Number(Q['micRate'])||0);},function(nx){Q['micRate']=Number(nx)||0;e4();})));var nC=document['createElement']('div');nC['className']='dvx-slider-wrap';var nL=document['createElement']('div');nL['className']='dvx-slider-top';var na=document['createElement']('div');na['className']='dvx-lbl',na['textContent']='Audio\x20Bitrate';var nb=document['createElement']('span');nb['className']='dvx-val',nL['appendChild'](na),nL['appendChild'](nb);function nH(nx){var nU=+nx['min'],ny=+nx['max'],nk=+nx['value'],nM=ny>nU?(nk-nU)/(ny-nU)*(0x1*0xfd1+-0xa*0x2e7+0x3b*0x3b):0x24b7+-0x4a2+-0x2015;nx['style']['background']='linear-gradient(to\x20right,var(--hc-accent,#AFE37F)\x20'+nM+'%,var(--dvx-track)\x20'+nM+'%)';}var nq=document['createElement']('input');nq['id']='dvx-br-slider',nq['type']='range',nq['min']='6000',nq['max']=String(j()),nq['step']='1000',nq['value']=String(Q['maxaveragebitrate']);var nR=function(nx){return(nx>=-0x1256+-0x14c+0x178a?nx/(-0x87*0x3d+-0x439*0x1+0x284c)+'k':nx)+'bps';};nb['textContent']=nR(Q['maxaveragebitrate']),nq['oninput']=function(){Q['maxaveragebitrate']=Number(nq['value']),nb['textContent']=nR(Q['maxaveragebitrate']),nH(nq),e4();if(typeof Qs==='function')Qs();},nH(nq);var ni=document['createElement']('div');ni['id']='dvx-br-labels',ni['className']='dvx-slider-labels',ni['innerHTML']='<span>6kbps</span><span>256kbps</span><span>510kbps</span>';function no(){var nx=j();nq['max']=String(nx);Number(nq['value'])>nx&&(nq['value']=String(nx),Q['maxaveragebitrate']=nx);var nU=ni['children'];nU&&nU['length']>=-0x109b+-0x20b3+0x1*0x3151&&(nU[-0x1*-0x9ee+-0x245*0xb+-0x16*-0xaf]['textContent']=Math['round'](nx/(-0x1a21+0x1e5*-0x1+0x116*0x21))+'kbps',nU[-0x187*-0x13+-0xf*0x12+-0x1bf5]['textContent']=nx/(0x2512+0x1*0x134a+-0x3474)+'kbps');if(typeof nb!=='undefined'&&nb)nb['textContent']=nR(Number(nq['value']));nH(nq),e4();}no(),nC['appendChild'](nL),nC['appendChild'](nq),nC['appendChild'](ni),Gz['appendChild'](nC);var nV=[8e3,12e3,16e3,24e3,48e3],nX=document['createElement']('div');nX['className']='dvx-slider-wrap';var nh=document['createElement']('div');nh['className']='dvx-slider-top';var nD=document['createElement']('div');nD['className']='dvx-lbl',nD['textContent']='Opus\x20Bandwidth';var nS=document['createElement']('span');nS['className']='dvx-val',nh['appendChild'](nD),nh['appendChild'](nS);var nE=document['createElement']('input');nE['type']='range',nE['min']='0',nE['max']=String(nV['length']-(-0xc1+-0x241*0x9+0x150b*0x1)),nE['step']='1';var nj=nV['indexOf'](Q['maxplaybackrate']);if(nj<0x1a65+0x5b*-0x25+-0xd3e)nj=nV['length']-(-0x5dc+-0x491*-0x7+0xd0d*-0x2);nE['value']=String(nj);var nW=function(nx){return nV[nx]/(0x1*-0x115f+0xd89+-0x7be*-0x1)+'\x20kHz';};nS['textContent']=nW(nj),nE['oninput']=function(){var nx=Number(nE['value']);Q['maxplaybackrate']=nV[nx],nS['textContent']=nW(nx),nH(nE),e4();if(typeof Qs==='function')Qs();},nH(nE);var nv=document['createElement']('div');nv['className']='dvx-slider-labels',nv['innerHTML']='<span>8kHz</span><span>24kHz</span><span>48kHz</span>',nX['appendChild'](nh),nX['appendChild'](nE),nX['appendChild'](nv),Gz['appendChild'](nX);var nI=document['createElement']('div');nI['className']='dvx-sub',nI['style']['margin']='-6px\x200\x208px',nI['textContent']='Highest\x20audio\x20frequency\x20Opus\x20encodes.\x2048\x20kHz\x20(fullband)\x20is\x20best;\x20lower\x20values\x20only\x20help\x20on\x20very\x20poor\x20connections.\x20Applies\x20after\x20you\x20rejoin.',Gz['appendChild'](nI);try{if(n4&&n4['parentNode']===Gz){var dvxRowAnchor=nQ&&nQ['parentNode']===Gz?nQ:n4;dvxRowAnchor['parentNode']['insertBefore'](nC,dvxRowAnchor['nextSibling']);dvxRowAnchor['parentNode']['insertBefore'](nX,nC['nextSibling']);dvxRowAnchor['parentNode']['insertBefore'](nI,nX['nextSibling']);}}catch(dvxRowMoveErr){}void (Object['assign'](document['createElement']('div'),{'className':'dvx-divider'}));var ng=document['createElement']('div');ng['className']='dvx-sec-title',ng['textContent']='Spatial\x20Audio',void (ng);var nt=QP(function(){return!!Q['spatialEnabled'];},function(nx,nU){Q['spatialEnabled']=!!nx,e4(),nU['_render']();});void (Qr('Spatial\x20Audio\x20(Binaural)','Positions\x20everyone\x20in\x20the\x20voice\x20call\x20around\x20your\x20head\x20using\x20HRTF\x20binaural\x20rendering.\x20Headphones\x20strongly\x20recommended;\x20speakers\x20will\x20not\x20produce\x20the\x20effect.',nt)),Gy=QP(function(){return!!(Q['spatialInput']&&Q['stereo']);},function(nx,nU){if(nx&&!Q['stereo']){Q['spatialInput']=![],e4(),nU['_render'](),QM('Stereo\x20Required','Spatialise\x20Input\x20sends\x20binaural\x20stereo\x20to\x20peers,\x20so\x20enable\x20Stereo\x20first.',function(){});return;}Q['spatialInput']=!!(nx&&Q['stereo']),e4(),nU['_render']();}),Gk=Qr('Spatialise\x20Input','Requires\x20Stereo.\x20This\x20bakes\x20your\x20chosen\x20HRTF\x20into\x20your\x20outgoing\x20voice\x20before\x20send;\x20peers\x20hear\x20fixed\x20binaural/HRTF-coloured\x20stereo,\x20not\x20true\x20listener-side\x20positioning.\x20It\x20can\x20sound\x20phasey\x20or\x20distant,\x20especially\x20on\x20speakers.',Gy,!Q['stereo']),void (Gk);function nf(nx,nU,ny,nk,nM,nP,nr,np,nK){var C0=document['createElement']('div');C0['className']='dvx-slider-wrap';var C1=document['createElement']('div');C1['className']='dvx-slider-top';var C2=document['createElement']('div');C2['className']='dvx-lbl',C2['textContent']=nx;var C3=document['createElement']('span');C3['className']='dvx-val',C1['appendChild'](C2),C1['appendChild'](C3);var C4=document['createElement']('input');C4['type']='range',C4['min']=String(ny),C4['max']=String(nk),C4['step']=String(nM),C4['value']=String(Q[nU]),C3['textContent']=nP(Number(Q[nU])),C4['oninput']=function(){Q[nU]=Number(C4['value']),C3['textContent']=nP(Q[nU]),nH(C4),e4();},nH(C4),C0['appendChild'](C1),C0['appendChild'](C4);if(nr){var C5=document['createElement']('div');C5['className']='dvx-slider-labels'+(nK?'\x20'+nK:''),C5['innerHTML']=nr,C0['appendChild'](C5);}if(np){var C6=document['createElement']('div');C6['className']='dvx-sub',C6['style']['margin']='6px\x200\x200',C6['textContent']=np,C0['appendChild'](C6);}void (C0);}nf('Width','spatialSpread',-0x76c+0x186+-0x5*-0x12e,0x1eb4+0xea9+-0x135*0x25,-0x12a6+0x73*-0x15+0x1c1a,function(nx){return Math['round'](nx)+'°';},'<span>0°</span><span>90°</span><span>180°</span>','How\x20wide\x20everyone\x20is\x20spread\x20across\x20the\x20front.\x200\x20stacks\x20everyone\x20dead\x20ahead.'),nf('Direction','spatialRotation',-(0x8e3+-0x22cb+0x1a42),-0x8e6+-0x20b9*0x1+0x29f9*0x1,-0x1*-0xf5c+-0x745*-0x4+-0x2c6b,function(nx){return nx=Math['round'](nx),nx===-0xdf3*0x1+-0x2589+0x5*0xa4c?'Center':nx<0xc88+-0x5*-0xb3+-0x1007?'Left\x20'+-nx+'°':'Right\x20'+nx+'°';},'<span>Left</span><span>Center</span><span>Right</span>','Rotate\x20the\x20whole\x20group\x20left\x20or\x20right.'),nf('Distance','spatialDistance',-0x114e*0x2+0x2032+0x26a+0.5,-0x54d*-0x1+0x6b*0x8+0x69*-0x15,0xa54*-0x2+-0x1996+-0x7b5*-0x6+0.1,function(nx){return Number(nx)['toFixed'](-0x84e+0x14fd+-0xcae)+'\x20m';},'<span>0.5\x20m</span><span>4\x20m</span><span>8\x20m</span>','How\x20far\x20away\x20everyone\x20sounds.\x20Further\x20is\x20also\x20a\x20little\x20quieter.'),nf('Elevation','spatialElevation',-(0x1911+0xb8*-0xc+-0x1017),0x10cd+-0x65*-0x3d+0x2884*-0x1,-0x3*-0x303+-0xa2c+0x128,function(nx){return nx=Math['round'](nx),(nx>0x4d7+-0x1af0+0x1619?'+':'')+nx+'°';},'<span>-90°</span><span>0°</span><span>90°</span>','Raise\x20or\x20lower\x20everyone.\x200°\x20is\x20ear\x20height.');var nB=Qp([['0','Direct\x20(dry)'],['1','Ambient'],['2','Reverberant']],function(){return Q['spatialProfile'];},function(nx){Q['spatialProfile']=Number(nx)||-0x1d6c+-0x5fb*0x1+0x2367,e4();});void (Qr('Room','Binaural\x20HRTF\x20profile.\x20Direct\x20is\x20dry\x20and\x20closest;\x20Ambient\x20adds\x20some\x20space;\x20Reverberant\x20is\x20the\x20roomiest.\x20Changing\x20this\x20rebuilds\x20the\x20renderer\x20(a\x20brief\x20blip).',nB));var nT=Qp([['8','8\x20sources'],['16','16\x20sources'],['32','32\x20sources'],['64','64\x20sources'],['128','128\x20sources']],function(){return Q['spatialMaxObjects'];},function(nx){Q['spatialMaxObjects']=Number(nx)||-0x1e02*-0x1+-0xc6e*-0x1+0x8*-0x54d,e4();});void (Qr('Max\x20Spatial\x20Sources','How\x20many\x20people\x20can\x20be\x20positioned\x20at\x20once.\x20Calls\x20larger\x20than\x20this\x20fall\x20back\x20to\x20flat\x20stereo\x20(nobody\x20is\x20dropped).\x20Higher\x20costs\x20a\x20little\x20more\x20CPU\x20and\x20a\x20brief\x20pause\x20when\x20spatial\x20is\x20(re)built.',nT));var nJ=Qp([['1','1st\x20order\x20(4ch)'],['2','2nd\x20order\x20(9ch)'],['3','3rd\x20order\x20(16ch)'],['4','4th\x20order\x20(25ch)']],function(){return Q['spatialOrder'];},function(nx){Q['spatialOrder']=Number(nx)||-0x1b17+-0x19e1*0x1+0x34fb,e4();});void (Qr('Ambisonic\x20Order','Spatial\x20resolution.\x20Higher\x20orders\x20localise\x20more\x20sharply\x20for\x20more\x20CPU.\x20Changing\x20this\x20rebuilds\x20the\x20renderer\x20(a\x20brief\x20blip).',nJ)),nf('Output\x20Gain','spatialGain',-(0x4*0x675+-0x7d3*-0x1+0x4cd*-0x7),-0x1b78+0x1248+0xb*0xd6,0x155*0x13+-0x1534+-0x20d*0x2,function(nx){return nx=Math['round'](nx),(nx>0x345*0x2+0x13f3+-0x1*0x1a7d?'+':'')+nx+'\x20dB';},'<span\x20style=\x22left:0;transform:none\x22>-12</span><span\x20style=\x22left:85.714%\x22>0</span><span\x20style=\x22left:100%;transform:translateX(-100%)\x22>+2</span>','Overall\x20loudness\x20of\x20the\x20spatialised\x20mix.\x20Boost\x20is\x20capped\x20at\x20+2\x20dB.','dvx-gain-labels'),nf('Balance','spatialBalance',-(0x46c*0x1+0x2d7*-0x4+0x1*0x754),-0x641*0x1+0x1c34+-0x158f,0x75*0x2a+0x3*-0x51a+-0x3df,function(nx){return nx=Math['round'](nx),nx===-0x210b+-0x9d9+-0x3c*-0xb7?'Center':nx<0x981+0x10e5+0x3e*-0x6d?'L\x20'+-nx:'R\x20'+nx;},'<span>Left</span><span>Center</span><span>Right</span>','Trim\x20left/right\x20output\x20loudness.');var nu=QP(function(){return!!Q['spatialSwap'];},function(nx,nU){Q['spatialSwap']=!!nx,e4(),nU['_render']();});void (Qr('Swap\x20Left/Right','Flip\x20the\x20binaural\x20output\x20channels.\x20Only\x20needed\x20if\x20your\x20headphones\x20are\x20wired\x20in\x20reverse.',nu));var nc=document['createElement']('div');nc['className']='dvx-sub',nc['style']['margin']='2px\x200\x208px',nc['textContent']='Positioning\x20is\x20global:\x20the\x20people\x20talking\x20are\x20spread\x20evenly\x20across\x20the\x20arc\x20and\x20centred\x20on\x20the\x20Direction,\x20not\x20placed\x20per-user.\x20A\x20single\x20talker\x20sits\x20dead\x20ahead\x20(both\x20ears).\x20Changes\x20apply\x20within\x20about\x20a\x20quarter\x20second,\x20no\x20reconnect\x20needed.',void (nc),void (Object['assign'](document['createElement']('div'),{'className':'dvx-divider'}));var nN=document['createElement']('div');nN['className']='dvx-sec-title',nN['textContent']='Advanced\x20Camera\x20Controls',Gz['appendChild'](nN);var nl={'720p60':{'vW':0x500,'vH':0x2d0,'vFps':0x3c,'vbMin':0x2625a0,'vbTarget':0x5b8d80,'vbMax':0xb71b00},'1080p30':{'vW':0x780,'vH':0x438,'vFps':0x1e,'vbMin':0x3d0900,'vbTarget':0x7a1200,'vbMax':0xf42400},'1080p60':{'vW':0x780,'vH':0x438,'vFps':0x3c,'vbMin':0x1e8480,'vbTarget':0x7a1200,'vbMax':0xb71b00},'1440p30':{'vW':0xa00,'vH':0x5a0,'vFps':0x1e,'vbMin':0x7a1200,'vbTarget':0xf42400,'vbMax':0x2625a00},'1440p60':{'vW':0xa00,'vH':0x5a0,'vFps':0x3c,'vbMin':0x989680,'vbTarget':0x1312d00,'vbMax':0x2625a00},'1080p120':{'vW':0x780,'vH':0x438,'vFps':0x78,'vbMin':0x989680,'vbTarget':0x1312d00,'vbMax':0x2625a00},'2160p60':{'vW':0xf00,'vH':0x870,'vFps':0x3c,'vbMin':0x1312d00,'vbTarget':0x2625a00,'vbMax':0x4c4b400}};function ns(){for(var nx in nl){var nU=nl[nx];if(nU['vW']===Q['vW']&&nU['vH']===Q['vH']&&nU['vFps']===Q['vFps'])return nx;}return'custom';}var nw=QP(function(){return!!Q['videoHD'];},function(nx,nU){Q['videoHD']=nx,Q['videoHDUserSet']=!![],e4(),nU['_render']();if(nx)try{ev();}catch(ny){}});Gz['appendChild'](Qr('Advanced\x20Camera\x20Controls','Removes\x20Discord\x27s\x20720p\x20camera\x20cap\x20so\x20resolution\x20is\x20negotiated\x20from\x20your\x20connection\x20up\x20to\x20the\x20preset\x20below.\x20This\x20is\x20a\x20CAPTURE/encoder\x20hint\x20-\x20your\x20webcam\x20and\x20uplink\x20decide\x20the\x20actual\x20result;\x20it\x20does\x20not\x20invent\x20detail\x20your\x20camera\x20cannot\x20produce.',nw));var nF=document['createElement']('div');nF['className']='dvx-row';var nA=document['createElement']('div'),nm=document['createElement']('div');nm['className']='dvx-lbl',nm['textContent']='Quality\x20Preset',nA['appendChild'](nm);var nO=document['createElement']('div');nO['className']='dvx-sub',nO['textContent']='Resolution\x20and\x20frame\x20rate',nA['appendChild'](nO);var nz=document['createElement']('select');nz['style']['cssText']='background:var(--background-tertiary,#1e1f22);border:1px\x20solid\x20var(--background-modifier-accent,rgba(255,255,255,.08));color:var(--header-primary,#f2f3f5);font-size:13px;padding:6px\x208px;border-radius:4px;outline:none;cursor:pointer',[['720p60','720p\x20@\x2060fps'],['1080p30','1080p\x20@\x2030fps'],['1080p60','1080p\x20@\x2060fps'],['1440p30','1440p\x20@\x2030fps'],['1440p60','1440p\x20@\x2060fps'],['1080p120','1080p\x20@\x20120fps'],['2160p60','4K\x20@\x2060fps']]['forEach'](function(nx){var nU=document['createElement']('option');nU['value']=nx[0xe5*0x4+0x1*0x1bf1+-0x1*0x1f85],nU['textContent']=nx[0x1f11+0xd*-0x2dd+0x629],nz['appendChild'](nU);}),nz['value']=ns()==='custom'?'1080p60':ns(),nz['onchange']=function(){var nx=nl[nz['value']];if(!nx)return;Q['vW']=nx['vW'],Q['vH']=nx['vH'],Q['vFps']=nx['vFps'],Q['vbMin']=nx['vbMin'],Q['vbTarget']=nx['vbTarget'],Q['vbMax']=nx['vbMax'],e4();try{ev();}catch(nU){}},nF['appendChild'](nA),nF['appendChild'](dvxDd(nz)),Gz['appendChild'](nF);var nZ=document['createElement']('div');nZ['style']['cssText']='margin:8px\x200\x202px;padding:9px\x2011px;border-radius:6px;background:rgba(240,178,50,.10);border:1px\x20solid\x20rgba(240,178,50,.35);color:#f0b232;font-size:12px;line-height:1.5',nZ['innerHTML']='⚠️\x20<b>High\x20CPU/GPU\x20use.</b>\x20This\x20bypasses\x20Discord’s\x20automatic\x20quality\x20reduction,\x20so\x20on\x20a\x20call\x20with\x20more\x20than\x20~4\x20cameras\x20every\x20participant\x20decodes\x20several\x20high-resolution\x20streams\x20at\x20once\x20-\x20expect\x20lag\x20on\x20weaker\x20machines.\x20A\x20strong\x20CPU/GPU\x20is\x20recommended;\x20turn\x20this\x20off\x20if\x20calls\x20stutter.\x20With\x20it\x20off,\x20Discord’s\x20stock\x20720p\x20handling\x20(which\x20scales\x20down\x20as\x20more\x20people\x20join)\x20is\x20used.',Gz['appendChild'](nZ),Gz['appendChild'](Object['assign'](document['createElement']('div'),{'className':'dvx-divider'}));var dvxRsHw=null,nhws=![];var nhwc=QP(function(){return nhws;},function(nhwx,nhwy){nhws=!!nhwx;try{window['__kurtcord']&&window['__kurtcord']['setHwAccel']&&window['__kurtcord']['setHwAccel'](nhws)['then'](function(nhwz){nhwz&&nhwz['ok']&&(nhws=!!nhwz['on'],dvxRsHw&&dvxRsHw['_dvxRs']());try{nhwy['_render']();}catch(Ge){}});}catch(Ge){}});try{window['__kurtcord']&&window['__kurtcord']['getHwAccel']&&window['__kurtcord']['getHwAccel']()['then'](function(nhwx){nhwx&&nhwx['ok']&&(nhws=!!nhwx['on']);try{nhwc['_render']();}catch(Ge){}});}catch(Ge){}Gz['appendChild'](dvxRsHw=dvxRestartPill(Qr('Advanced Hardware Acceleration','Force GPU rasterisation, zero-copy and accelerated video decode. Applies after a restart.',nhwc),'hwAccel','Advanced Hardware Acceleration'));Gz['appendChild'](Object['assign'](document['createElement']('div'),{'className':'dvx-divider'}));var nY=QP(function(){return Q['noPushToTalk'];},function(nx,nU){nx?QM('Enable\x20No\x20Push-to-Talk','This\x20bypasses\x20the\x20push-to-talk\x20requirement\x20in\x20channels\x20that\x20enforce\x20it\x20and\x20switches\x20you\x20to\x20voice\x20activity.\x20Some\x20servers\x20set\x20PTT\x20deliberately.\x20Continue?',function(){Q['noPushToTalk']=!![],e4(),nU['_render'](),Gg();}):(Q['noPushToTalk']=![],e4(),nU['_render']());});Gz['appendChild'](Qr('No\x20Push-to-Talk\x20(Experimental)','Bypass\x20forced\x20push-to-talk\x20(use\x20voice\x20activity)',nY));dvxLayout(Gz);




return Gz;}var G0='dvx-privacy-panel',G1='dvx-privacy-overlay',G2='dvx-privacy-navitem',G3=![],G4=null;function G5(){Qk();var Gz=document['createElement']('div');Gz['id']=G0,Gz['className']='dvx-ns';var GZ=document['createElement']('div');GZ['className']='dvx-priv-h2',GZ['textContent']='Kurtcord\x20Privacy',Gz['appendChild'](GZ);var Gd=document['createElement']('div');Gd['className']='dvx-sub',Gd['style']['cssText']='margin:0\x200\x2014px',Gd['textContent']='Anti-fingerprinting\x20and\x20traffic\x20controls\x20for\x20this\x20client.\x20Most\x20options\x20take\x20full\x20effect\x20after\x20a\x20restart.',Gz['appendChild'](Gd);var GY={'uaSpoof':![],'firewall':![],'telemetry':Q['telemetry']!==![],'proxy':![],'proxyRules':''};function Gx(n6){if(n6&&n6['ok']){GY['uaSpoof']=!!n6['uaSpoof'],GY['firewall']=!!n6['firewall'],GY['telemetry']=!!n6['telemetry'],GY['proxy']=!!n6['proxy'];if(typeof n6['proxyRules']==='string')GY['proxyRules']=n6['proxyRules'];Q['telemetry']=GY['telemetry'];try{e4();}catch(n7){}}}function GU(n6,n7,n8){try{if(window['__kurtcord']&&window['__kurtcord']['setPrivacy']){window['__kurtcord']['setPrivacy'](n6,n7)['then'](function(n9){Gx(n9);if(n8)n8();});return;}}catch(n9){}if(n8)n8();}var Gy=document['createElement']('div');Gy['className']='dvx-sec-title',Gy['textContent']='Browser\x20Hardening',Gy['style']['marginTop']='6px',Gz['appendChild'](Gy);var dvxRsUa=null,dvxRsFw=null;var Gk=QP(function(){return GY['uaSpoof'];},function(n6,n7){n6?QM('Enable\x20Chrome\x20Spoofing','Kurtcord\x20will\x20report\x20itself\x20to\x20Discord\x20as\x20an\x20ordinary\x20Chrome\x20browser,\x20including\x20the\x20navigator\x20user-agent\x20and\x20Client\x20Hints,\x20so\x20it\x20blends\x20in\x20with\x20normal\x20web\x20traffic.\x20Fully\x20applies\x20after\x20a\x20restart.\x20Continue?',function(){GU('uaSpoof',!![],function(){n7['_render'](),dvxRsUa&&dvxRsUa['_dvxRs']();});}):GU('uaSpoof',![],function(){n7['_render'](),dvxRsUa&&dvxRsUa['_dvxRs']();});});Gz['appendChild'](dvxRsUa=dvxRestartPill(Qr('Spoof\x20Chrome','Present\x20Kurtcord\x20to\x20Discord\x20as\x20a\x20vanilla\x20Chrome\x20browser\x20(user-agent\x20+\x20Client\x20Hints)\x20so\x20it\x20blends\x20in\x20with\x20normal\x20web\x20traffic\x20and\x20is\x20harder\x20to\x20fingerprint\x20as\x20a\x20custom\x20client.\x20Applies\x20fully\x20after\x20a\x20restart.',Gk),'uaSpoof','Spoof Chrome'));var GM=QP(function(){return GY['firewall'];},function(n6,n7){GU('firewall',!!n6,function(){n7['_render'](),dvxRsFw&&dvxRsFw['_dvxRs']();});});Gz['appendChild'](dvxRsFw=dvxRestartPill(Qr('Tracker\x20Firewall','Block\x20known\x20Discord\x20and\x20third-party\x20telemetry/tracking\x20requests\x20(science,\x20error\x20reporting,\x20sentry,\x20analytics,\x20ad/doubleclick\x20endpoints).\x20Legitimate\x20media,\x20assets\x20and\x20search\x20traffic\x20are\x20whitelisted.\x20Applies\x20fully\x20after\x20a\x20restart.',GM),'firewall','Tracker Firewall'));var GP=QP(function(){return GY['telemetry'];},function(n6,n7){GU('telemetry',!!n6,function(){n7['_render'](),Gp();});});Gz['appendChild'](Qr('Kurtcord\x20Telemetry','Anonymous\x20usage\x20data\x20to\x20help\x20prioritise\x20development\x20and\x20catch\x20issues\x20early.\x20While\x20it\x20is\x20on,\x20it\x20also\x20includes\x20your\x20Discord\x20user\x20ID\x20and\x20avatar.\x20No\x20voice,\x20audio,\x20or\x20message\x20content\x20is\x20ever\x20collected.',GP));var Gr=document['createElement']('div');Gr['style']['cssText']='margin:2px\x200\x204px;padding:9px\x2011px;border:1px\x20solid\x20rgba(250,166,26,.30);background:rgba(250,166,26,.07);border-radius:6px;font-size:12px;line-height:1.45;color:var(--header-secondary,#b5bac1)',Gz['appendChild'](Gr);function Gp(){try{!GY['telemetry']?(Gr['style']['display']='block',Gr['textContent']='⚠️\x20While\x20Kurtcord\x20Telemetry\x20is\x20off,\x20this\x20install\x20is\x20not\x20included\x20in\x20Kurtcord’s\x20anonymous\x20usage\x20counts.'):Gr['style']['display']='none';}catch(n6){}}Gp();var GK=QP(function(){return GY['proxy'];},function(n6,n7){n6?QM('Enable\x20Proxy','Route\x20Kurtcord’s\x20Discord\x20traffic\x20through\x20the\x20proxy\x20address\x20below.\x20A\x20wrong,\x20dead\x20or\x20slow\x20proxy\x20will\x20stop\x20Discord\x20loading.\x20Note:\x20Kurtcord\x20Direct\x20(P2P)\x20voice\x20uses\x20UDP\x20and\x20generally\x20will\x20NOT\x20pass\x20through\x20an\x20HTTP/SOCKS\x20proxy,\x20so\x20Direct\x20calls\x20may\x20fail\x20to\x20connect\x20while\x20this\x20is\x20on.\x20Continue?',function(){GU('proxy',!![],function(){n7['_render'](),n3();});}):GU('proxy',![],function(){n7['_render'](),n3();});});Gz['appendChild'](Qr('Proxy','Send\x20the\x20Discord\x20session\x20through\x20a\x20proxy\x20server\x20(e.g.\x20a\x20SOCKS5\x20from\x20a\x20VPN/Tor\x20setup).\x20Format\x20like\x20socks5://127.0.0.1:9050\x20or\x20http://host:port.\x20Direct\x20(P2P)\x20calls\x20may\x20not\x20work\x20behind\x20a\x20proxy.',GK));var n0=document['createElement']('div');n0['style']['cssText']='margin:2px\x200\x206px;display:flex;gap:8px;align-items:center';var n1=document['createElement']('input');n1['type']='text',n1['placeholder']='socks5://127.0.0.1:9050',n1['value']=GY['proxyRules']||'',n1['style']['cssText']='flex:1;background:var(--background-tertiary,#1e1f22);border:1px\x20solid\x20var(--background-modifier-accent,rgba(255,255,255,.08));color:var(--header-primary,#f2f3f5);font-size:13px;padding:7px\x209px;border-radius:4px;outline:none';var n2=document['createElement']('button');n2['type']='button',n2['textContent']='Save',n2['style']['cssText']='padding:7px\x2014px;border:1px\x20solid\x20var(--background-modifier-accent,rgba(255,255,255,.12));border-radius:4px;background:var(--background-tertiary,#1e1f22);color:var(--header-primary,#f2f3f5);font-size:12px;font-weight:600;cursor:pointer',n2['onclick']=function(){try{window['__kurtcord']&&window['__kurtcord']['setProxyRules']&&window['__kurtcord']['setProxyRules'](n1['value'],'<local>')['then'](function(n6){n6&&n6['ok']&&(GY['proxyRules']=n6['proxyRules']||'',n2['textContent']='Saved',setTimeout(function(){n2['textContent']='Save';},-0x2038+0x1af+0x1*0x2339));});}catch(n6){}},n0['appendChild'](n1),n0['appendChild'](n2),Gz['appendChild'](n0);function n3(){try{n0['style']['display']=GY['proxy']?'flex':'none';}catch(n6){}}n3();try{window['__kurtcord']&&window['__kurtcord']['getPrivacy']&&window['__kurtcord']['getPrivacy']()['then'](function(n6){Gx(n6);try{Gk['_render'](),GM['_render'](),GP['_render'](),GK['_render'](),n1['value']=GY['proxyRules']||'',n3(),Gp();}catch(n7){}});}catch(n6){}Gz['appendChild'](Object['assign'](document['createElement']('div'),{'className':'dvx-divider'}));var n4=document['createElement']('div');n4['className']='dvx-priv-h2',n4['textContent']='End-to-End\x20Encryption',n4['style']['marginTop']='6px',Gz['appendChild'](n4);var n5=document['createElement']('div');return n5['className']='dvx-sub',n5['style']['cssText']='margin:0\x200\x2014px',n5['textContent']='Encrypt\x20messages\x20so\x20Discord’s\x20servers\x20only\x20see\x20ciphertext.\x20Works\x20only\x20between\x20people\x20who\x20both\x20run\x20Kurtcord\x20and\x20have\x20added\x20each\x20other’s\x20key;\x20to\x20everyone\x20else\x20your\x20messages\x20appear\x20as\x20encrypted\x20attachments.\x20Off\x20by\x20default.',Gz['appendChild'](n5),Ge(Gz),Gz;}var G6=(function(){var Gz=window['crypto']&&window['crypto']['subtle']||null,GZ=new TextEncoder(),Gd=new TextDecoder(),GY='kurtcord-e2ee-v1';function Gx(nL){var na=new Uint8Array(nL);return window['crypto']['getRandomValues'](na),na;}function GU(nL){var na='';for(var nb=-0x8db*-0x2+-0x7ae+-0x8*0x141;nb<nL['length'];nb++)na+=String['fromCharCode'](nL[nb]);return btoa(na);}function Gy(nL){var na=atob(nL),nb=new Uint8Array(na['length']);for(var nH=-0x41*-0xf+0x2*0x757+-0x127d;nH<na['length'];nH++)nb[nH]=na['charCodeAt'](nH);return nb;}function Gk(){var nL=[]['slice']['call'](arguments),na=-0x557*0x5+0x266e+-0xbbb,nb;for(nb=-0xd*0x1+-0x3c*0x58+-0x43*-0x4f;nb<nL['length'];nb++)na+=nL[nb]['length'];var nH=new Uint8Array(na),nq=-0x879+0x87*0x39+-0x1596;for(nb=-0x11c6+-0x1*0x427+0x1*0x15ed;nb<nL['length'];nb++){nH['set'](nL[nb],nq),nq+=nL[nb]['length'];}return nH;}function GM(nL){try{if(typeof CompressionStream==='undefined')return Promise['resolve'](nL);var na=new CompressionStream('gzip'),nb=na['writable']['getWriter']();return nb['write'](nL),nb['close'](),new Response(na['readable'])['arrayBuffer']()['then'](function(nH){return new Uint8Array(nH);});}catch(nH){return Promise['resolve'](nL);}}function GP(nL){try{if(typeof DecompressionStream==='undefined')return Promise['resolve'](nL);var na=new DecompressionStream('gzip'),nb=na['writable']['getWriter']();return nb['write'](nL),nb['close'](),new Response(na['readable'])['arrayBuffer']()['then'](function(nH){return new Uint8Array(nH);});}catch(nH){return Promise['resolve'](nL);}}var Gr=null;function Gp(nL){Gr=nL;}function GK(){return!!Gr;}function n0(){return Promise['all']([Gz['generateKey']({'name':'Ed25519'},!![],['sign','verify']),Gz['generateKey']({'name':'X25519'},!![],['deriveBits'])])['then'](function(nL){var na={'ed':nL[0x2f9*-0x8+0xcef+-0x1*-0xad9],'x':nL[0x20c6+0x1*-0x8c5+-0x80*0x30],'mlkem':null};if(Gr)try{na['mlkem']=Gr['keygen']();}catch(nb){}return na;});}function n1(nL){return Promise['all']([Gz['exportKey']('pkcs8',nL['ed']['privateKey']),Gz['exportKey']('raw',nL['ed']['publicKey']),Gz['exportKey']('pkcs8',nL['x']['privateKey']),Gz['exportKey']('raw',nL['x']['publicKey'])])['then'](function(na){return{'v':0x1,'edSk':GU(new Uint8Array(na[-0x2163+0x6b*0x4d+-0x16*-0xe])),'edPk':GU(new Uint8Array(na[0x177a+0x1976+-0x30ef])),'xSk':GU(new Uint8Array(na[-0x113e+-0x2410*0x1+0x3550*0x1])),'xPk':GU(new Uint8Array(na[0x1aa*0x5+0xff1*0x1+0x8*-0x308])),'mlkemSk':nL['mlkem']?GU(nL['mlkem']['secretKey']):'','mlkemPk':nL['mlkem']?GU(nL['mlkem']['publicKey']):''};});}function n2(nL){return Promise['all']([Gz['importKey']('pkcs8',Gy(nL['edSk']),{'name':'Ed25519'},!![],['sign']),Gz['importKey']('raw',Gy(nL['edPk']),{'name':'Ed25519'},!![],['verify']),Gz['importKey']('pkcs8',Gy(nL['xSk']),{'name':'X25519'},!![],['deriveBits']),Gz['importKey']('raw',Gy(nL['xPk']),{'name':'X25519'},!![],[])])['then'](function(na){var nb={'ed':{'privateKey':na[-0x1*-0x19d5+-0x37f+0x1*-0x1656],'publicKey':na[0x1c9a+0x1*-0x1983+0x9e*-0x5]},'x':{'privateKey':na[-0x5d*0x53+0x34*0x70+-0x1*-0x769],'publicKey':na[-0x1183*-0x2+0x1984+-0x3c87]},'mlkem':null};return nL['mlkemSk']&&nL['mlkemPk']&&(nb['mlkem']={'secretKey':Gy(nL['mlkemSk']),'publicKey':Gy(nL['mlkemPk'])}),nb;});}function n3(nL){return Promise['all']([Gz['exportKey']('raw',nL['ed']['publicKey']),Gz['exportKey']('raw',nL['x']['publicKey'])])['then'](function(na){var nb=new Uint8Array(na[-0x15bd+0x4c8+0x10f5]),nH=new Uint8Array(na[0x2197+-0x118d*0x2+0x184]),nq=nb['length']+nH['length']+(nL['mlkem']?nL['mlkem']['publicKey']['length']:-0x107c+-0x18de+0x295a),nR=new Uint8Array([nL['mlkem']?0x14ee+-0x24e*-0x4+-0x1e25:0xe3*0xd+0x1*0x25b1+-0x3138]);return GU(Gk(nR,nb,nH,nL['mlkem']?nL['mlkem']['publicKey']:new Uint8Array(-0x2000+0x224+0x1ddc)));});}function n4(nL){var na=Gy(nL),nb=na[0x25a7+-0x1821+-0x1*0xd86]===0x1*-0xe5+-0x1a6d+0x1b53,nH=0x265b+0xc7*-0x4+-0x119f*0x2,nq=na['slice'](nH,nH+(-0x1*-0x827+-0x2*-0x585+-0x65b*0x3));nH+=-0x22c7*0x1+0x398*0x9+0x28f;var nR=na['slice'](nH,nH+(0x112*0xe+-0x3b6*0x9+0x128a));nH+=-0x4f3*0x7+-0x3*0xa61+0x4a*0xe4;var ni=nb?na['slice'](nH,nH+(-0x27a*0x5+0xe3d*0x1+0x2c5)):null;return Promise['all']([Gz['importKey']('raw',nq,{'name':'Ed25519'},!![],['verify']),Gz['importKey']('raw',nR,{'name':'X25519'},!![],[])])['then'](function(no){return{'edPub':no[0x5c*0x11+-0x1*0xdef+0x7d3*0x1],'xPub':no[0x1bdb*0x1+-0x1*0x141e+-0x7bc],'mlkemPub':ni,'raw':na};});}function n5(nL){return Gz['digest']('SHA-256',Gy(nL))['then'](function(na){var nb=new Uint8Array(na)['slice'](-0x1*-0x2226+0xe1d*0x1+-0x3043,0x115f+-0x1*0x1b47+0x9f0),nH='';for(var nq=0x5*0xec+0x1*-0x1d18+0x187c;nq<nb['length'];nq++){nH+=('0'+nb[nq]['toString'](-0xc*0xae+0x6*0x14c+0xe*0x8))['slice'](-(0xedb+0xed7+0x190*-0x13))+(nq<-0xb*-0x353+-0x14*0x9+-0x23d6?'\x20':'');}return nH;});}function n6(nL){var na=Gy(nL),nb=na['length']===0x211+-0x59e+0x3cd?na:na['slice'](0x90f+-0x9*-0xfc+-0x11ea*0x1,-0xa0f+0x1a85*0x1+0x9*-0x1cd);return GU(nb);}function n7(nL){try{if(nL&&nL['charAt'](-0x1*0x16f7+0xc98*0x1+-0x5*-0x213)==='G')return GP(Gy(nL['slice'](-0xaa7+-0xcbb+0x1763)))['then'](function(na){try{return JSON['parse'](Gd['decode'](na));}catch(nb){return{};}});return Promise['resolve'](JSON['parse'](Gd['decode'](Gy(nL))));}catch(na){return Promise['resolve']({});}}function n8(nL,na,nb,nH){return Gz['importKey']('raw',nL,'HKDF',![],['deriveKey'])['then'](function(nq){return Gz['deriveKey']({'name':'HKDF','hash':'SHA-256','salt':na,'info':GZ['encode'](GY+'|'+nb)},nq,{'name':'AES-GCM','length':0x100},![],nH);});}function n9(nL,na,nb,nH,nq){var nR,ni,no=new Uint8Array(-0x1945+-0x1613+0x1f9*0x18);return Gz['generateKey']({'name':'X25519'},!![],['deriveBits'])['then'](function(nV){return nR=nV,Gz['exportKey']('raw',nR['publicKey']);})['then'](function(nV){return ni=new Uint8Array(nV),Gz['deriveBits']({'name':'X25519','public':na},nR['privateKey'],-0xb83+0x1*0x66e+0x615);})['then'](function(nV){var nX=new Uint8Array(nV);if(nq&&Gr&&nb){var nh=Gr['encapsulate'](nb);no=nh['cipherText'],nX=Gk(nX,nh['sharedSecret']);}var nD=Gx(-0x1361*-0x1+-0x99*-0x1f+-0x25d8),nS=Gx(0x1bdc+-0x1d56+0x186);return n8(nX,nD,nH,['encrypt'])['then'](function(nE){return Gz['encrypt']({'name':'AES-GCM','iv':nS},nE,nL)['then'](function(nj){return{'epk':GU(ni),'salt':GU(nD),'iv':GU(nS),'wct':GU(new Uint8Array(nj)),'mlc':no['length']?GU(no):''};});});});}function ne(nL,na,nb,nH,nq){var nR=Gx(0x1898+-0x16b4+0xe2*-0x2),ni=Gx(0x6*0x61d+-0x2d1+-0x21d1*0x1),no,nV,nX=nL['mlkem']?nL['mlkem']['publicKey']:null;return Gz['importKey']('raw',nR,{'name':'AES-GCM'},![],['encrypt'])['then'](function(nh){return Gz['encrypt']({'name':'AES-GCM','iv':ni},nh,GZ['encode'](nH));})['then'](function(nh){return no=new Uint8Array(nh),Gz['exportKey']('raw',nL['x']['publicKey']);})['then'](function(nh){return nV=new Uint8Array(nh),Promise['all']([n9(nR,na['xPub'],na['mlkemPub'],nb,nq),Gz['importKey']('raw',nV,{'name':'X25519'},!![],[])['then'](function(nD){return n9(nR,nD,nX,nb,nq);})]);})['then'](function(nh){var nD=nq&&Gr&&na['mlkemPub']?-0xbb7+-0x44e+0x1006:0xb52+0x20*-0x29+-0x632,nS=Gk(GZ['encode'](GY+'|v2|'+nb+'|'),ni,no,GZ['encode'](nh[-0x259*0x7+-0x1*0x245e+0x34cd]['epk']+nh[0x15a2+0x1e64+-0x3*0x1157]['epk']));return Promise['all']([Gz['sign']({'name':'Ed25519'},nL['ed']['privateKey'],nS),Gz['exportKey']('raw',nL['ed']['publicKey'])])['then'](function(nE){var nj={'v':0x2,'pq':nD,'iv':GU(ni),'ct':GU(no),'to':nh[-0x1*0x1669+-0x1e9f+0x3508],'me':nh[0xd34+-0x21f6+0x5*0x427],'sed':GU(new Uint8Array(nE[0x75e*0x1+0xd8b+-0x6f8*0x3])),'sx':GU(nV),'sig':GU(new Uint8Array(nE[-0x223+0x2383+-0x2160]))};return GM(GZ['encode'](JSON['stringify'](nj)))['then'](function(nW){return'G'+GU(nW);});});});}function nQ(nL,na,nb,nH){var nq=Gy(na['epk']),nR=Gy(na['salt']),ni=Gy(na['iv']),no=Gy(na['wct']),nV=na['mlc']?Gy(na['mlc']):new Uint8Array(0x1108+-0x69*-0x1c+-0x64*0x49);return Gz['importKey']('raw',nq,{'name':'X25519'},!![],[])['then'](function(nX){return Gz['deriveBits']({'name':'X25519','public':nX},nL['x']['privateKey'],-0x7*0x19c+-0x1*0x25ab+0x31ef);})['then'](function(nX){var nh=new Uint8Array(nX);if(nH&&nV['length']&&nL['mlkem']){var nD=Gr['decapsulate'](nV,nL['mlkem']['secretKey']);nh=Gk(nh,nD);}return n8(nh,nR,nb,['decrypt']);})['then'](function(nX){return Gz['decrypt']({'name':'AES-GCM','iv':ni},nX,no);});}function nG(nL,na,nb,nH){var nq;try{na&&na['charAt'](0xf34+0x2633+-0x3567)==='G'?nq=GP(Gy(na['slice'](-0xa38+-0x1929+-0x1*-0x2362)))['then'](function(nR){return Gd['decode'](nR);}):nq=Promise['resolve'](Gd['decode'](Gy(na)));}catch(nR){return Promise['reject'](new Error('not\x20an\x20Kurtcord\x20encrypted\x20message'));}return nq['then'](function(ni){var no;try{no=JSON['parse'](ni);}catch(nW){throw new Error('not\x20an\x20Kurtcord\x20encrypted\x20message');}if(no['v']!==0x158b+-0x3*0xba+-0x135b)throw new Error(no['v']===0x255*-0xb+0x2b*0xdb+-0xb21?'old\x20message\x20format\x20(re-send)':'unsupported\x20version');var nV=n6(GU(Gk(Gy(no['sed']),Gy(no['sx'])))),nX=![];try{nX=nV===nL['__idk'];}catch(nv){}if(!nX&&nH&&!nH(nV)){try{if(window['__ACE_DBG']){var nh=[];try{for(var nD=-0x293*0x7+0x2*0xb88+-0x1*0x50b;nD<window['__ACE_DBG']['contacts']()['length'];nD++)nh['push'](window['__ACE_DBG']['idk'](window['__ACE_DBG']['contacts']()[nD]['bundle'])['slice'](-0x928+0x1*0x419+-0x23*-0x25,-0xb29+-0x2646+0x317f));}catch(nI){}console['log']('[Kurtcord\x20E2EE]\x20REJECT\x20sender.\x20senderId='+nV['slice'](-0x1fd+-0x2705+0xb5*0x3a,0x193a+-0x2489+0x1*0xb5f)+'...\x20myIdk='+String(nL['__idk']||'')['slice'](0xa04*-0x1+0x2*0x1183+-0x123*0x16,-0x1a18+-0xee5+0xdaf*0x3)+'...\x20knownContacts=['+nh['join'](',\x20')+']');}}catch(ng){}throw new Error('sender\x20is\x20not\x20in\x20your\x20contacts');}var nS=Gy(no['iv']),nE=Gy(no['ct']),nj=Gk(GZ['encode'](GY+'|v2|'+nb+'|'),nS,nE,GZ['encode'](no['to']['epk']+no['me']['epk']));return Gz['importKey']('raw',Gy(no['sed']),{'name':'Ed25519'},!![],['verify'])['then'](function(nt){return Gz['verify']({'name':'Ed25519'},nt,Gy(no['sig']),nj);})['then'](function(nt){if(!nt)throw new Error('signature\x20invalid\x20(forged\x20or\x20tampered)');return nQ(nL,nX?no['me']:no['to'],nb,no['pq']);})['then'](function(nt){return Gz['importKey']('raw',new Uint8Array(nt),{'name':'AES-GCM'},![],['decrypt']);})['then'](function(nt){return Gz['decrypt']({'name':'AES-GCM','iv':nS},nt,nE);})['then'](function(nt){return Gd['decode'](nt);});});}function nn(nL,na){var nb=Gx(-0x21b4*-0x1+-0x4d1*0x5+0x98f*-0x1),nH=Gx(0x5da+-0x2fc+-0x2*0x169);return Gz['importKey']('raw',GZ['encode'](na),'PBKDF2',![],['deriveKey'])['then'](function(nq){return Gz['deriveKey']({'name':'PBKDF2','hash':'SHA-256','salt':nb,'iterations':0x3d090},nq,{'name':'AES-GCM','length':0x100},![],['encrypt']);})['then'](function(nq){return Gz['encrypt']({'name':'AES-GCM','iv':nH},nq,GZ['encode'](JSON['stringify'](nL)));})['then'](function(nq){return{'v':0x1,'kdf':'pbkdf2-250k','salt':GU(nb),'iv':GU(nH),'ct':GU(new Uint8Array(nq))};});}function nC(nL,na){return Gz['importKey']('raw',GZ['encode'](na),'PBKDF2',![],['deriveKey'])['then'](function(nb){return Gz['deriveKey']({'name':'PBKDF2','hash':'SHA-256','salt':Gy(nL['salt']),'iterations':0x3d090},nb,{'name':'AES-GCM','length':0x100},![],['decrypt']);})['then'](function(nb){return Gz['decrypt']({'name':'AES-GCM','iv':Gy(nL['iv'])},nb,Gy(nL['ct']));})['then'](function(nb){return JSON['parse'](Gd['decode'](nb));});}return{'setPQ':Gp,'hasPQ':GK,'genIdentity':n0,'exportSecret':n1,'importSecret':n2,'publicBundle':n3,'importRecipient':n4,'fingerprint':n5,'idKey':n6,'wireMeta':n7,'encrypt':ne,'decrypt':nG,'sealSecret':nn,'openSecret':nC,'b64e':GU,'b64d':Gy};}());try{if(window['KurtcordMLKEM']&&G6&&G6['setPQ'])G6['setPQ'](window['KurtcordMLKEM']);}catch(Gz){}try{window['__kurtcordE2EE']=G6;}catch(GZ){}var G7={'enabled':![],'pq':![],'hasKeystore':![],'unlocked':![],'id':null,'myBundle':'','contacts':[],'backup':![],'backupEnc':![]};function G8(){return(window['__kurtcord']&&window['__kurtcord']['e2eeGet']?window['__kurtcord']['e2eeGet']():Promise['resolve']({'ok':![]}))['then'](function(Gd){return Gd&&Gd['ok']&&(G7['enabled']=!!Gd['enabled'],G7['pq']=!!Gd['pq'],G7['hasKeystore']=!!Gd['hasKeystore'],G7['keystore']=Gd['keystore']||null,G7['contacts']=Array['isArray'](Gd['contacts'])?Gd['contacts']:[],G7['backup']=!!Gd['backup'],G7['backupEnc']=!!Gd['backupEnc']),Gd;});}function G9(){try{var Gd=document['getElementById']('ac-bk-viewer');if(Gd)Gd['remove']();}catch(GK){}var GY=document['createElement']('div');GY['id']='ac-bk-viewer',GY['style']['cssText']='position:fixed;inset:0;z-index:1000002;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;font-family:var(--font-primary,sans-serif)';var Gx=document['createElement']('div');Gx['style']['cssText']='width:560px;max-width:92vw;max-height:82vh;display:flex;flex-direction:column;background:var(--background-floating,#111214);border:1px\x20solid\x20var(--background-modifier-accent,rgba(255,255,255,.08));border-radius:10px;box-shadow:0\x2012px\x2040px\x20rgba(0,0,0,.6);overflow:hidden';var GU=document['createElement']('div');GU['style']['cssText']='display:flex;align-items:center;justify-content:space-between;padding:12px\x2014px;border-bottom:1px\x20solid\x20var(--background-modifier-accent,rgba(255,255,255,.06))';var Gy=document['createElement']('div');Gy['textContent']='Message\x20backups',Gy['style']['cssText']='font-size:14px;font-weight:700;color:var(--header-primary,#f2f3f5)';var Gk=document['createElement']('span');Gk['textContent']='×',Gk['style']['cssText']='cursor:pointer;font-size:22px;line-height:1;color:var(--text-muted,#949ba4);padding:0\x204px',Gk['onclick']=function(){GY['remove']();},GU['appendChild'](Gy),GU['appendChild'](Gk),Gx['appendChild'](GU);var GM=document['createElement']('div');GM['style']['cssText']='padding:12px\x2014px;overflow:auto',Gx['appendChild'](GM),GY['appendChild'](Gx),document['body']['appendChild'](GY),GY['onclick']=function(n0){if(n0['target']===GY)GY['remove']();};function GP(n0){try{return new Date(n0)['toLocaleString']();}catch(n1){return'';}}function Gr(){GM['innerHTML']='';var n0=document['createElement']('div');n0['textContent']='Loading…',n0['style']['cssText']='font-size:13px;color:var(--text-muted,#949ba4)',GM['appendChild'](n0),window['__kurtcord']['e2eeBackupList']()['then'](function(n1){GM['innerHTML']='';if(!n1||!n1['ok']||!n1['channels']||!n1['channels']['length']){var n2=document['createElement']('div');n2['textContent']='No\x20backups\x20yet.',n2['style']['cssText']='font-size:13px;color:var(--text-muted,#949ba4)',GM['appendChild'](n2);return;}n1['channels']['sort'](function(n3,n4){return(n4['mtime']||0x6a*-0x41+0x24a9+0x9bf*-0x1)-(n3['mtime']||-0x24f1+-0x1cb+0x26bc);}),n1['channels']['forEach'](function(n3){var n4=document['createElement']('button');n4['type']='button',n4['style']['cssText']='display:flex;align-items:center;justify-content:space-between;width:100%;text-align:left;background:var(--background-secondary,#2b2d31);border:1px\x20solid\x20var(--background-modifier-accent,rgba(255,255,255,.06));border-radius:6px;padding:9px\x2011px;margin-bottom:7px;cursor:pointer;color:var(--text-normal,#dbdee1);font-size:13px';var n5=document['createElement']('span'),n6=n3['channelId'];try{for(var n7=0x1*0xf3a+0x1db3*0x1+-0x7*0x66b;n7<G7['contacts']['length'];n7++){if(G7['contacts'][n7]['dm']===n3['channelId']){n6=G7['contacts'][n7]['name']||n3['channelId'];break;}}}catch(n9){}n5['textContent']=n6;var n8=document['createElement']('span');n8['textContent']=(n3['lines']||0x1576+0x1457*-0x1+-0x11f)+'\x20msgs',n8['style']['cssText']='font-size:11px;color:var(--text-muted,#949ba4)',n4['appendChild'](n5),n4['appendChild'](n8),n4['onclick']=function(){Gp(n3['channelId'],n6);},GM['appendChild'](n4);});})['catch'](function(){GM['innerHTML']='<div\x20style=\x22font-size:13px;color:var(--text-danger,#f23f42)\x22>Failed\x20to\x20list\x20backups.</div>';});}function Gp(n0,n1){GM['innerHTML']='';var n2=document['createElement']('div');n2['style']['cssText']='display:flex;align-items:center;gap:8px;margin-bottom:10px';var n3=document['createElement']('button');n3['type']='button',n3['textContent']='←\x20All',n3['style']['cssText']='background:var(--background-secondary,#2b2d31);border:none;border-radius:5px;padding:5px\x209px;color:var(--text-normal,#dbdee1);font-size:12px;cursor:pointer',n3['onclick']=Gr;var n4=document['createElement']('div');n4['textContent']=n1,n4['style']['cssText']='font-size:13px;font-weight:600;color:var(--header-primary,#f2f3f5)',n2['appendChild'](n3),n2['appendChild'](n4),GM['appendChild'](n2);var n5=document['createElement']('div');n5['textContent']='Loading…',n5['style']['cssText']='font-size:13px;color:var(--text-muted,#949ba4)',GM['appendChild'](n5),window['__kurtcord']['e2eeBackupRead'](n0)['then'](function(n6){if(!n6||!n6['ok']){n5['textContent']='Failed\x20to\x20read\x20backup.';return;}var n7=n6['lines']||[],n8=[];n7['forEach'](function(nQ){try{n8['push'](JSON['parse'](nQ));}catch(nG){}});var n9=Promise['resolve'](),ne=[];n8['forEach'](function(nQ){n9=n9['then'](function(){if(nQ&&nQ['enc']){if(!G7['id']){ne['push']({'text':'[locked\x20–\x20unlock\x20your\x20identity\x20to\x20read]','ts':nQ['ts'],'locked':!![]});return;}return G6['decrypt'](G7['id'],nQ['enc'],'kurtcord-backup',null)['then'](function(nG){try{var nn=JSON['parse'](nG);nn['ts']=nn['ts']||nQ['ts'],ne['push'](nn);}catch(nC){ne['push']({'text':'[unreadable]','ts':nQ['ts']});}})['catch'](function(){ne['push']({'text':'[cannot\x20decrypt]','ts':nQ['ts']});});}else ne['push'](nQ);});}),n9['then'](function(){n5['remove']();if(!ne['length']){var nQ=document['createElement']('div');nQ['textContent']='Empty.',nQ['style']['cssText']='font-size:13px;color:var(--text-muted,#949ba4)',GM['appendChild'](nQ);return;}if(n6['truncated']){var nG=document['createElement']('div');nG['textContent']='(showing\x20the\x20most\x20recent\x202000\x20entries)',nG['style']['cssText']='font-size:11px;color:var(--text-muted,#949ba4);margin-bottom:8px',GM['appendChild'](nG);}ne['forEach'](function(nn){var nC=document['createElement']('div');nC['style']['cssText']='padding:6px\x200;border-bottom:1px\x20solid\x20var(--background-modifier-accent,rgba(255,255,255,.04))';var nL=document['createElement']('div'),na=nn['dir']==='out'?'You':'Them';nL['textContent']=na+'\x20·\x20'+GP(nn['ts'])+(nn['pq']?'\x20·\x20🔒PQ':nn['locked']?'':'\x20·\x20🔒'),nL['style']['cssText']='font-size:10.5px;color:var(--text-muted,#949ba4);margin-bottom:2px';var nb=document['createElement']('div');nb['textContent']=nn['text']!=null?nn['text']:'',nb['style']['cssText']='font-size:14px;color:var(--text-normal,#dbdee1);white-space:pre-wrap;word-break:break-word'+(nn['dir']==='out'?';opacity:.95':''),nC['appendChild'](nL),nC['appendChild'](nb),GM['appendChild'](nC);});});})['catch'](function(){n5['textContent']='Failed\x20to\x20read\x20backup.';});}Gr();}function Ge(Gd){var GY=document['createElement']('div');Gd['appendChild'](GY);function Gx(GP,Gr){var Gp=document['createElement']('input');return Gp['type']=Gr||'text',Gp['placeholder']=GP,Gp['style']['cssText']='flex:1;background:var(--background-tertiary,#1e1f22);border:1px\x20solid\x20var(--background-modifier-accent,rgba(255,255,255,.08));color:var(--header-primary,#f2f3f5);font-size:13px;padding:7px\x209px;border-radius:4px;outline:none',Gp;}function GU(GP){var Gr=document['createElement']('button');return Gr['type']='button',Gr['textContent']=GP,Gr['style']['cssText']='padding:7px\x2014px;border:1px\x20solid\x20var(--background-modifier-accent,rgba(255,255,255,.12));border-radius:4px;background:var(--background-tertiary,#1e1f22);color:var(--header-primary,#f2f3f5);font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap',Gr;}function Gy(){var GP=document['createElement']('div');return GP['style']['cssText']='margin:2px\x200\x208px;display:flex;gap:8px;align-items:center;flex-wrap:wrap',GP;}function Gk(GP){var Gr=document['createElement']('div');return Gr['style']['cssText']='margin:2px\x200\x208px;font-size:12px;line-height:1.45;color:var(--text-muted,#949ba4)',Gr['textContent']=GP,Gr;}function GM(){GY['innerHTML']='';var GP=QP(function(){return G7['enabled'];},function(nH,nq){window['__kurtcord']&&window['__kurtcord']['e2eeSetFlag']&&window['__kurtcord']['e2eeSetFlag']('enabled',nH)['then'](function(nR){nR&&nR['ok']&&(G7['enabled']=!!nR['enabled'],nq['_render'](),GM());});});GY['appendChild'](Qr('Enable\x20Encryption','Turn\x20on\x20Kurtcord\x20end-to-end\x20encryption.\x20You\x20will\x20need\x20to\x20create\x20an\x20identity\x20and\x20add\x20contacts\x20below.',GP));if(!G7['enabled'])return;var Gr=document['createElement']('div');Gr['style']['cssText']='margin:2px\x200\x206px;font-size:12px;line-height:1.45;color:var(--text-muted,#949ba4)',Gr['textContent']=G7['pq']?'Mode:\x20Post-Quantum.\x20Messages\x20are\x20encrypted\x20with\x20ML-KEM-768\x20+\x20X25519\x20and\x20sent\x20as\x20a\x20small\x20.ac\x20file\x20attachment\x20(the\x20post-quantum\x20ciphertext\x20is\x20too\x20large\x20for\x20a\x20normal\x20message).':'Mode:\x20Basic.\x20Messages\x20are\x20encrypted\x20with\x20X25519\x20+\x20AES-256-GCM\x20and\x20sent\x20as\x20normal\x20text.\x20Strong,\x20and\x20what\x20most\x20secure\x20apps\x20used\x20until\x20recently.';var Gp=QP(function(){return G7['pq'];},function(nH,nq){var nR=function(){window['__kurtcord']&&window['__kurtcord']['e2eeSetFlag']&&window['__kurtcord']['e2eeSetFlag']('pq',nH)['then'](function(ni){ni&&ni['ok']&&(G7['pq']=!!ni['pq'],nq['_render'](),GM());});};if(nH&&!G6['hasPQ']())QM('Post-Quantum\x20unavailable','The\x20post-quantum\x20module\x20is\x20not\x20loaded\x20in\x20this\x20build,\x20so\x20this\x20will\x20fall\x20back\x20to\x20Basic\x20(classical)\x20encryption.\x20You\x20can\x20still\x20enable\x20the\x20preference.\x20Continue?',nR);else nR();});GY['appendChild'](Qr('Post-Quantum','Adds\x20ML-KEM-768\x20on\x20top\x20of\x20X25519\x20so\x20messages\x20stay\x20safe\x20even\x20against\x20future\x20quantum\x20computers.\x20Both\x20people\x20must\x20have\x20this\x20on.\x20Sent\x20as\x20a\x20.ac\x20file\x20attachment.'+(G6['hasPQ']()?'':'\x20(module\x20not\x20loaded\x20in\x20this\x20build\x20–\x20falls\x20back\x20to\x20Basic)'),Gp)),GY['appendChild'](Gr);if(!G7['hasKeystore']&&!G7['unlocked']){GY['appendChild'](Gk('Create\x20an\x20encrypted\x20identity.\x20Your\x20private\x20keys\x20are\x20protected\x20by\x20this\x20passphrase\x20and\x20stored\x20encrypted\x20on\x20this\x20device\x20only.\x20There\x20is\x20no\x20recovery\x20if\x20you\x20forget\x20it.'));var GK=Gy(),n0=Gx('Passphrase\x20(min\x2012\x20chars)','password'),n1=GU('Create\x20identity');GK['appendChild'](n0),GK['appendChild'](n1),GY['appendChild'](GK),n1['onclick']=function(){if((n0['value']||'')['length']<0xe1c*0x1+0x4*-0x251+0x4cc*-0x1){n1['textContent']='Min\x2012\x20chars',setTimeout(function(){n1['textContent']='Create\x20identity';},0x11*-0x13a+-0x1*-0x1fe7+-0x595*0x1);return;}n1['textContent']='Creating…',n1['disabled']=!![],G6['genIdentity']()['then'](function(nH){return G7['id']=nH,G6['exportSecret'](nH)['then'](function(nq){return G6['sealSecret'](nq,n0['value']);});})['then'](function(nH){return G7['keystore']=nH,window['__kurtcord']['e2eeSaveKeystore'](nH);})['then'](function(){return G6['publicBundle'](G7['id']);})['then'](function(nH){G7['myBundle']=nH;try{G7['id']['__idk']=G6['idKey'](nH);}catch(nq){}G7['unlocked']=!![],G7['hasKeystore']=!![],GM();})['catch'](function(nH){n1['textContent']='Error',n1['disabled']=![],setTimeout(function(){n1['textContent']='Create\x20identity';},0x288+0x1*0xa58+-0x20*0x35);});};return;}if(G7['hasKeystore']&&!G7['unlocked']){GY['appendChild'](Gk('Unlock\x20your\x20encrypted\x20identity\x20for\x20this\x20session.'));var n2=Gy(),n3=Gx('Passphrase','password'),n4=GU('Unlock'),n5=GU('Reset\x20identity');n2['appendChild'](n3),n2['appendChild'](n4),n2['appendChild'](n5),GY['appendChild'](n2),n4['onclick']=function(){n4['textContent']='Unlocking…',n4['disabled']=!![],G6['openSecret'](G7['keystore'],n3['value'])['then'](function(nH){return G6['importSecret'](nH);})['then'](function(nH){return G7['id']=nH,G7['unlocked']=!![],G6['publicBundle'](nH);})['then'](function(nH){G7['myBundle']=nH;try{G7['id']['__idk']=G6['idKey'](nH);}catch(nq){}GM();})['catch'](function(nH){n4['textContent']='Wrong\x20passphrase',n4['disabled']=![],setTimeout(function(){n4['textContent']='Unlock';},0x979*0x2+-0x13f*-0xb+-0x1acb);});},n5['onclick']=function(){QM('Reset\x20identity','This\x20deletes\x20your\x20encrypted\x20identity\x20and\x20all\x20added\x20contacts\x20on\x20this\x20device.\x20Anyone\x20you\x20talk\x20to\x20will\x20need\x20to\x20add\x20your\x20new\x20key.\x20This\x20cannot\x20be\x20undone.\x20Continue?',function(){window['__kurtcord']['e2eeClearKeystore']()['then'](function(){return window['__kurtcord']['e2eeSaveContacts']([]);})['then'](function(){G7['hasKeystore']=![],G7['unlocked']=![],G7['id']=null,G7['myBundle']='',G7['contacts']=[],GM();});});};return;}GY['appendChild'](Gk('Your\x20identity\x20is\x20unlocked\x20for\x20this\x20session.'));var n6=Gy(),n7=Gx('Your\x20public\x20key');n7['value']=G7['myBundle'],n7['readOnly']=!![];var n8=GU('Copy\x20my\x20key');n6['appendChild'](n7),n6['appendChild'](n8),GY['appendChild'](n6),n8['onclick']=function(){try{navigator['clipboard']['writeText'](G7['myBundle']),n8['textContent']='Copied',setTimeout(function(){n8['textContent']='Copy\x20my\x20key';},-0x265+0x1c4f*0x1+0x13*-0x11e);}catch(nH){}};var n9=Gy(),ne=GU('Lock\x20now'),nQ=GU('Reset\x20identity');nQ['style']['color']='var(--text-danger,#f23f42)',n9['appendChild'](ne),n9['appendChild'](nQ),GY['appendChild'](n9),ne['onclick']=function(){G7['unlocked']=![],G7['id']=null,G7['myBundle']='',GM();},nQ['onclick']=function(){QM('Reset\x20identity','This\x20deletes\x20your\x20encrypted\x20identity\x20on\x20this\x20device\x20and\x20clears\x20your\x20contacts.\x20Anyone\x20you\x20talk\x20to\x20will\x20need\x20to\x20add\x20your\x20NEW\x20key\x20afterwards.\x20This\x20cannot\x20be\x20undone.\x20Continue?',function(){window['__kurtcord']['e2eeClearKeystore']()['then'](function(){return window['__kurtcord']['e2eeSaveContacts']([]);})['then'](function(){G7['hasKeystore']=![],G7['unlocked']=![],G7['id']=null,G7['myBundle']='',G7['contacts']=[],GM();});});},GY['appendChild'](Gk('Message\x20backup\x20saves\x20your\x20decrypted\x20conversations\x20to\x20a\x20folder\x20on\x20this\x20device\x20so\x20they\x20are\x20not\x20lost.\x20Off\x20by\x20default.\x20Files\x20are\x20stored\x20UNENCRYPTED\x20on\x20disk\x20unless\x20you\x20turn\x20on\x20“Encrypt\x20backup”\x20below.'));var nG=QP(function(){return G7['backup'];},function(nH,nq){window['__kurtcord']&&window['__kurtcord']['e2eeSetFlag']&&window['__kurtcord']['e2eeSetFlag']('backup',nH)['then'](function(nR){nR&&nR['ok']&&(G7['backup']=!!nR['backup'],nq['_render'](),GM());});});GY['appendChild'](Qr('Message\x20backup','Save\x20decrypted\x20messages\x20to\x20a\x20local\x20folder\x20so\x20a\x20chat\x20can\x20be\x20recovered.',nG));if(G7['backup']){var nn=QP(function(){return G7['backupEnc'];},function(nH,nq){window['__kurtcord']&&window['__kurtcord']['e2eeSetFlag']&&window['__kurtcord']['e2eeSetFlag']('backupEnc',nH)['then'](function(nR){nR&&nR['ok']&&(G7['backupEnc']=!!nR['backupEnc'],nq['_render']());});});GY['appendChild'](Qr('Encrypt\x20backup','Seal\x20each\x20entry\x20to\x20your\x20own\x20identity\x20so\x20the\x20files\x20hold\x20ciphertext\x20instead\x20of\x20readable\x20text.\x20You\x20must\x20be\x20unlocked\x20to\x20read\x20them\x20back.',nn));var nC=Gy(),nL=GU('Open\x20backups\x20folder'),na=GU('Load\x20backups');nC['appendChild'](nL),nC['appendChild'](na),GY['appendChild'](nC),nL['onclick']=function(){try{if(window['__kurtcord']&&window['__kurtcord']['e2eeBackupOpen'])window['__kurtcord']['e2eeBackupOpen']();}catch(nH){}},na['onclick']=function(){try{G9();}catch(nH){}};}G6['fingerprint'](G7['myBundle'])['then'](function(nH){GY['appendChild'](Gk('Your\x20fingerprint:\x20'+nH+'\x20–\x20read\x20this\x20to\x20your\x20contact\x20out-of-band\x20to\x20confirm\x20nobody\x20is\x20impersonating\x20you.')),nb();});function nb(){var nH=document['createElement']('div');nH['style']['cssText']='margin-top:10px',GY['appendChild'](nH);var nq=document['createElement']('div');nq['className']='dvx-sec-title',nq['textContent']='Contacts',nH['appendChild'](nq);if(!G7['contacts']['length'])nH['appendChild'](Gk('No\x20contacts\x20yet.\x20Paste\x20someone’s\x20public\x20key\x20below\x20to\x20add\x20them.'));G7['contacts']['forEach'](function(nX,nh){var nD=document['createElement']('div');nD['style']['cssText']='display:flex;align-items:center;gap:8px;padding:7px\x200;border-bottom:1px\x20solid\x20var(--background-modifier-accent,rgba(255,255,255,.05))';var nS=document['createElement']('div');nS['style']['cssText']='flex:1;font-size:14px;color:var(--header-primary,#f2f3f5)',nS['textContent']=nX['name']||'(unnamed)';var nE=document['createElement']('div');nE['style']['cssText']='font-size:11px;color:var(--text-muted,#949ba4);font-family:monospace',nE['textContent']='…',G6['fingerprint'](nX['bundle'])['then'](function(nW){nE['textContent']=nW;});var nj=GU('Remove');nj['style']['padding']='4px\x2010px',nj['onclick']=function(){G7['contacts']['splice'](nh,-0x81*0xd+0x2*-0xaff+0x1c8c),window['__kurtcord']['e2eeSaveContacts'](G7['contacts'])['then'](function(){GM();});},nD['appendChild'](nS),nD['appendChild'](nE),nD['appendChild'](nj),nH['appendChild'](nD);});var nR=Gy();nR['style']['marginTop']='8px';var ni=Gx('Name');ni['style']['flex']='0\x200\x20120px';var no=Gx('Their\x20public\x20key'),nV=GU('Add');nR['appendChild'](ni),nR['appendChild'](no),nR['appendChild'](nV),nH['appendChild'](nR),nV['onclick']=function(){var nX=(no['value']||'')['trim']();if(!nX)return;G6['importRecipient'](nX)['then'](function(){return G7['contacts']['push']({'name':(ni['value']||'')['trim']()||'(unnamed)','bundle':nX,'added':Date['now']()}),window['__kurtcord']['e2eeSaveContacts'](G7['contacts']);})['then'](function(){GM();})['catch'](function(nh){nV['textContent']='Invalid\x20key',setTimeout(function(){nV['textContent']='Add';},-0x1bc*-0x6+-0xa01*-0x1+-0xef1);});};}}G8()['then'](GM);}function GQ(){var Gd=document['querySelector']('.sidebar__409aa');if(!Gd)return null;var GY=Gd['nextElementSibling'];if(GY&&GY['querySelector'])return GY;var Gx=Gd['parentElement'];if(!Gx)return null;for(var GU=0x4f*0x3+0x35*0x2e+-0xa73;GU<Gx['children']['length'];GU++){if(Gx['children'][GU]!==Gd)return Gx['children'][GU];}return null;}function GG(){G3=![];var Gd=document['getElementById'](G1);if(Gd&&Gd['parentNode'])Gd['parentNode']['removeChild'](Gd);var GY=document['getElementById'](G2);if(GY){var Gx=GY['querySelector']('.item_caf372');Gx&&(Gx['classList']['remove']('active_caf372'),Gx['removeAttribute']('aria-current'));}}function Gn(){var Gd=GQ();if(!Gd)return;G3=!![];var GY=document['getElementById'](G1);if(GY&&Gd['contains'](GY)){GC();return;}if(!G4||!G4['isConnected']){if(!G4)G4=G5();}var Gx=document['getElementById'](G1);if(Gx&&Gx['parentNode'])Gx['parentNode']['removeChild'](Gx);Gx=document['createElement']('div'),Gx['id']=G1,Gx['style']['cssText']='position:absolute;inset:0;overflow-x:hidden;overflow-y:auto;background:var(--background-primary,#313338);z-index:40';var GU=document['createElement']('div');GU['style']['cssText']='max-width:740px;margin:0\x20auto;padding:60px\x2040px\x2080px',GU['appendChild'](G4),Gx['appendChild'](GU);try{if(getComputedStyle(Gd)['position']==='static')Gd['style']['position']='relative';}catch(Gy){}Gd['appendChild'](Gx),GC();}function GC(){try{var Gd=document['querySelector']('ul[data-list-id=\x22settings-sidebar\x22]');if(Gd){var GY=Gd['querySelectorAll']('.item_caf372.active_caf372');for(var Gx=0x1acf+-0x1d59+0x28a;Gx<GY['length'];Gx++){if(GY[Gx]['closest']('#'+G2))continue;GY[Gx]['classList']['remove']('active_caf372'),GY[Gx]['removeAttribute']('aria-current');}}}catch(Gk){}var GU=document['getElementById'](G2);if(GU){var Gy=GU['querySelector']('.item_caf372');Gy&&(Gy['classList']['add']('active_caf372'),Gy['setAttribute']('aria-current','page'));}}function GL(){var Gd=document['createElement']('li');Gd['className']='section__409aa',Gd['id']=G2+'-sec';var GY=document['createElement']('div');GY['className']='sectionLabel__409aa';var Gx=document['createElement']('h3');Gx['className']='heading-sm/medium_cf4812\x20defaultColor__5345c\x20label__409aa',Gx['setAttribute']('data-text-variant','heading-sm/medium'),Gx['style']['color']='var(--text-muted)',Gx['textContent']='Kurtcord',GY['appendChild'](Gx),Gd['appendChild'](GY);var GU=document['createElement']('ul');GU['className']='sectionList__409aa';var Gy=document['createElement']('li');Gy['className']='itemContainer_caf372',Gy['id']=G2;var Gk=document['createElement']('div');Gk['className']='item_caf372',Gk['setAttribute']('role','link'),Gk['setAttribute']('tabindex','-1');var GM=document['createElement']('div');GM['className']='itemContent_caf372',GM['innerHTML']='<svg\x20class=\x22vc-icon\x22\x20role=\x22img\x22\x20width=\x2220\x22\x20height=\x2220\x22\x20viewBox=\x220\x200\x2024\x2024\x22><path\x20fill=\x22currentColor\x22\x20d=\x22M12\x202\x204\x205v6c0\x205\x203.4\x207.7\x208\x209\x204.6-1.3\x208-4\x208-9V5l-8-3Zm0\x202.2\x206\x202.25V11c0\x203.86-2.4\x206-6\x207.2C8.4\x2017\x206\x2014.86\x206\x2011V6.45L12\x204.2Z\x22></path><path\x20fill=\x22currentColor\x22\x20d=\x22M11\x2013.5\x208.5\x2011\x207\x2012.5l4\x204\x206-6L15.5\x209\x2011\x2013.5Z\x22></path></svg>';var GP=document['createElement']('div');return GP['className']='text-md/medium_cf4812',GP['setAttribute']('data-text-variant','text-md/medium'),GP['style']['color']='currentcolor',GP['textContent']='Privacy',GM['appendChild'](GP),Gk['appendChild'](GM),Gy['appendChild'](Gk),GU['appendChild'](Gy),Gd['appendChild'](GU),Gk['addEventListener']('click',function(Gr){try{Gr['preventDefault'](),Gr['stopPropagation']();}catch(Gp){}Gn();}),Gd;}function Ga(){var Gd=document['querySelector']('ul[data-list-id=\x22settings-sidebar\x22]');if(!Gd)return;if(!document['getElementById'](G2+'-sec')){var GY=Gd['querySelectorAll'](':scope\x20>\x20li.section__409aa'),Gx=GL();if(GY['length']>=0x221c*-0x1+0x2*-0x7ae+-0x95*-0x55&&GY[-0x5cf*-0x3+0x260b+-0x8*0x6ef]['nextSibling'])Gd['insertBefore'](Gx,GY[-0x15bc+-0x1891+0x2e4d]['nextSibling']);else Gd['appendChild'](Gx);Gd['addEventListener']('click',function(Gk){var GM=Gk['target'];if(GM&&GM['closest']&&GM['closest']('#'+G2))return;if(GM&&GM['closest']&&GM['closest']('.item_caf372'))GG();},!![]);}if(G3){if(!document['getElementById'](G1))Gn();var GU=document['getElementById'](G2);if(GU){var Gy=GU['querySelector']('.item_caf372');Gy&&!Gy['classList']['contains']('active_caf372')&&(Gy['classList']['add']('active_caf372'),Gy['setAttribute']('aria-current','page'));}}}function Gb(Gd){var GY=document['querySelectorAll']('label,h2,h3');for(var Gx=-0x23df+-0x3*0xc1b+0x1e*0x268;Gx<GY['length'];Gx++){if(GY[Gx]['children']['length']===0x1d6e+-0x2395*-0x1+0x59*-0xbb&&GY[Gx]['textContent']['trim']()===Gd)return GY[Gx];}return null;}function GH(Gd,GY){var Gx=Gd,GU=0xbeb+-0x58+-0xb93;while(Gx&&Gx['parentElement']&&GU++<0xeb6+0x952+-0x11*0x169){var Gy=Gb(GY);if(Gy&&Gx['parentElement']['contains'](Gy)&&!Gx['contains'](Gy))return Gx;Gx=Gx['parentElement'];}return null;}function Gq(){var Gd=document['querySelectorAll']('div');for(var GY=0x23c5+0xfe*0xb+-0x25*0x143;GY<Gd['length'];GY++){var Gx=Gd[GY];if(Gx['childNodes']['length']===0x1469+0x14b+0x37*-0x65&&Gx['firstChild']&&Gx['firstChild']['nodeType']===0x22d7+0x30f+-0xb7*0x35&&Gx['textContent']['indexOf']('Automatic\x20Gain\x20Control,\x20Advanced\x20Voice\x20Activity')===0x16e8+-0x281*-0x7+0x3ad*-0xb){if(Gx['textContent']['indexOf']('Stereo\x20and\x20Advanced\x20Audio\x20Controls')===-(-0x7*0xd3+-0x71d+0xce3*0x1))Gx['textContent']=Gx['textContent']['replace'](/\s*$/,'')+',\x20Stereo\x20and\x20Advanced\x20Audio\x20Controls';return;}}}function GR(){try{var Gd=document['getElementById'](Qy);if(Gd&&Gd['parentNode']){var GY=QK();Gd['parentNode']['replaceChild'](GY,Gd);}}catch(Gx){}}function Gi(Gd){if(Gd==='native'){Q['nativeAudio']=!![],I(),e4(),GR();if(typeof Qs==='function')Qs();return;}if(Gd==='high')Q['bit24']=![],Q['opusHighBitrate']=![],Q['opusMinptime']=0x8ab+-0x262+-0x215*0x3,Q['opusMaxptime']=-0x22ea+0x8a5*-0x4+0xb2*0x64,Q['opusCbr']=!![],Q['opusDtx']=![],Q['maxaveragebitrate']=0x6819d+0x77e1f*0x1+-0x3bf*0x194;else{if(Gd==='optimised')Q['bit24']=![],Q['opusHighBitrate']=![],Q['opusMinptime']=-0x1784+0x1*0x7ca+0xfc4,Q['opusMaxptime']=0x10b7+-0xdf*-0x1a+-0x2721,Q['maxaveragebitrate']=-0xa3cf*0x1+-0x471f7+0x8de86*0x1;else{if(Gd==='antiloss')Q['bit24']=![],Q['opusHighBitrate']=![],Q['opusMinptime']=-0x4*-0x21d+0x201+0x1*-0xa6b,Q['opusMaxptime']=0x14a5+0x2036+-0x349f,Q['maxaveragebitrate']=-0x2*0x4b5c+0x10*0x1c2d+-0x63f4*-0x2,Q['inbandFec']=!![],Q['opusDtx']=![],Q['opusCbr']=![];else return;}}Q['nativeAudio']=![],I(),e4(),GR();if(typeof Qs==='function')Qs();}function Go(){if(!document['querySelector']('ul[data-list-id=\x22settings-sidebar\x22]'))return;var Gd=Gb('Echo\x20Cancellation');if(!Gd)return;var GY=document['getElementById'](Qy);if(GY&&document['body']['contains'](GY))return;if(GY&&GY['parentNode'])GY['parentNode']['removeChild'](GY);Qk();var Gx=QK(),GU=null,Gy=document['querySelectorAll']('.react-aria-Disclosure');for(var Gk=-0xcc0+0x687+0x639;Gk<Gy['length'];Gk++){if(Gy[Gk]['textContent']&&Gy[Gk]['textContent']['indexOf']('Advanced\x20Voice\x20Settings')!==-(-0x682*0x1+0x1fcd*-0x1+0x2650)){GU=Gy[Gk];break;}}if(GU&&GU['parentNode']){GU['parentNode']['insertBefore'](Gx,GU['nextSibling']),e7('native\x20settings\x20injected\x20after\x20Advanced\x20Voice\x20disclosure');return;}var GM=Gd;for(var GP=0x269f*-0x1+-0x3*0x695+0x3a5e;GP<0xf95+0x4cf+-0x1460&&GM['parentElement'];GP++)GM=GM['parentElement'];GM&&GM['parentElement']?GM['parentElement']['insertBefore'](Gx,GM['nextSibling']):(Gd['parentElement']||document['body'])['appendChild'](Gx),e7('native\x20settings\x20injected\x20near\x20Echo\x20Cancellation\x20(fallback)');}var GX=0x1086+0x1*0x1ec5+-0x2f4b,Gh=-0x1d1+-0x1e52*0x1+0x2023;function GD(){var Gd=document['querySelector']('[role=\x22combobox\x22][aria-label=\x22Noise\x20Suppression\x22]');if(!Gd)return null;var GY=Gd['parentElement']&&Gd['parentElement']['querySelector']('[class*=\x22lineClamp1\x22]');return((GY?GY['textContent']:Gd['textContent'])||'')['trim']();}function GW(){var Gd=document['querySelector']('section[aria-label=\x22User\x20area\x22],\x20section[aria-label=\x22User\x20Area\x22]');if(Gd)return Gd;var GY=document['querySelector']('[aria-label=\x22User\x20Settings\x22],\x20[aria-label=\x22Open\x20User\x20Settings\x22]');if(GY){var Gx=GY;for(var GU=-0x1a94+0x2*-0x5f2+0x2678;GU<0x95c+0x118f+-0x1ae1&&Gx['parentElement'];GU++){Gx=Gx['parentElement'];if(Gx['tagName']==='SECTION')return Gx;}}return null;}var GI=![];function Gg(){if(!Q['noPushToTalk']||GI)return;try{var Gd=window['webpackChunkdiscord_app'];if(!Gd||!Gd['push'])return;var GY=null;Gd['push']([['dvx_noptt_'+Date['now']()],{},function(Gx){GY=Gx;}]);if(!GY||!GY['c'])return;Object['keys'](GY['c'])['forEach'](function(Gx){var GU=GY['c'][Gx]&&GY['c'][Gx]['exports'];if(!GU)return;[GU,GU['default'],GU['Z'],GU['ZP']]['forEach'](function(Gy){if(Gy&&typeof Gy['canUseVoiceActivity']==='function'&&!Gy['__dvxNoPTT']){try{Gy['canUseVoiceActivity']=function(){return!![];};}catch(Gk){}try{if(typeof Gy['shouldShowWarning']==='function')Gy['shouldShowWarning']=function(){return![];};}catch(GM){}Gy['__dvxNoPTT']=!![],GI=!![],e7('No\x20Push-to-Talk:\x20VAD\x20store\x20patched');}});});}catch(Gx){}}function Gt(){try{new MutationObserver(__kcT(function(){Go(),Ga(),QI(),dvxVpLayout(),dvxMicMount();},150))['observe'](document['documentElement']||document['body'],{'childList':!![],'subtree':!![]});}catch(Gd){try{e7('native\x20observer\x20error:\x20'+Gd);}catch(GY){}}setInterval(function(){Go(),Ga(),QI(),dvxVpLayout(),dvxMicMount(),dvxMicSync();if(Q['noPushToTalk'])Gg();},0x3f8*-0x4+0x2611+0x3*-0x4cb),Go(),Ga(),QI();if(Q['noPushToTalk'])setTimeout(Gg,0x12*0x59+0x1*0x52f+0x42f);}if(document['body'])Gt();else document['addEventListener']('DOMContentLoaded',Gt);var Gf=(function(){var Gd={'started':![],'paintTimer':null,'discTimer':null,'observer':null,'discScheduled':![],'lastDisc':0x0,'targets':new Map(),'smoothed':new Map(),'lastSig':new Map()},GY={'updateInterval':0x50,'threshold':0.01,'rise':0.72,'decay':0.84,'minVis':0.018,'showTrackSilent':!![],'glow':!![],'listW':0x28,'listH':0x5},Gx=null,GU=null,Gy=null;function Gk(nX){try{if(window['Vencord']&&Vencord['Webpack']){var nh=Vencord['Webpack']['findStore'];if(typeof nh==='function'){var nD=nh(nX);if(nD)return nD;}if(Vencord['Webpack']['Common']&&Vencord['Webpack']['Common'][nX])return Vencord['Webpack']['Common'][nX];}}catch(nS){}return null;}function GM(){Gx=Gk('MediaEngineStore'),GU=Gk('VoiceStateStore'),Gy=Gk('RTCConnectionStore');}var GP=null,Gr=null,Gp=null,GK=null,n0=0x1555+0x1231*0x2+-0x39b7;function n1(){if(GP)return GP;try{if(typeof B!=='undefined'&&B&&B['uid'])GP=String(B['uid']);else{if(typeof m==='function'){var nX=m();if(nX&&nX['uid'])GP=String(nX['uid']);}}}catch(nh){}return GP;}function n2(){try{if(typeof ee==='undefined'||!ee||ee['readyState']!=='live'){n0=0xc46+-0x246f*0x1+0x1829;return;}if(!Gp){var nX=window['AudioContext']||window['webkitAudioContext'];if(!nX)return;Gr=new nX();var nh=Gr['createMediaStreamSource'](new MediaStream([ee]));Gp=Gr['createAnalyser'](),Gp['fftSize']=0x588+0x1*0x139d+-0x7*0x373,Gp['smoothingTimeConstant']=0x1c*0x6a+0x9*-0x185+0x1*0x215+0.3,nh['connect'](Gp),GK=new Uint8Array(Gp['fftSize']);}if(Gr&&Gr['state']==='suspended')try{Gr['resume']();}catch(nj){}Gp['getByteTimeDomainData'](GK);var nD=-0xd*0x1fc+-0x1649+0x175*0x21;for(var nS=0xed7*0x1+-0x182*0x7+-0x449;nS<GK['length'];nS++){var nE=(GK[nS]-(-0x1b44+-0x571*-0x7+0xa53*-0x1))/(-0x3d6*0x9+0x561+0x1da5);nD+=nE*nE;}n0=n3(Math['sqrt'](nD/GK['length'])*(0x545*-0x3+-0x1a51+-0x5*-0x86d+0.8),0xda1+0x3d*0x9c+-0x2fd*0x11,-0x25eb+0x1103+0x14e9);}catch(nW){n0=0x44f*0x7+0xa*-0x328+0x167;}}function n3(nX,nh,nD){return Math['max'](nh,Math['min'](nD,nX));}function n4(nX){return/^\d{15,21}$/['test'](String(nX||''));}function n5(){try{return GU&&GU['getCurrentClientVoiceChannelId']&&GU['getCurrentClientVoiceChannelId']()||Gy&&Gy['getChannelId']&&Gy['getChannelId']()||null;}catch(nX){return null;}}try{window['__kurtcordVc']=function(){try{var nX=window['Vencord']&&Vencord['Webpack'];if(!nX)return null;var nh=nX['findStore'],nD=typeof nh==='function'&&nh('VoiceStateStore')||nX['Common']&&nX['Common']['VoiceStateStore'],nS=typeof nh==='function'&&nh('RTCConnectionStore')||nX['Common']&&nX['Common']['RTCConnectionStore'];return nD&&nD['getCurrentClientVoiceChannelId']&&nD['getCurrentClientVoiceChannelId']()||nS&&nS['getChannelId']&&nS['getChannelId']()||null;}catch(nE){return null;}},window['__kurtcordSelfId']=function(){try{if(typeof n1==='function'){var nX=n1();if(nX)return nX;}var nh=window['Vencord']&&Vencord['Webpack'];if(!nh)return null;var nD=nh['findStore'],nS=typeof nD==='function'&&nD('UserStore')||nh['Common']&&nh['Common']['UserStore'],nE=nS&&nS['getCurrentUser']&&nS['getCurrentUser']();return nE&&nE['id']?String(nE['id']):null;}catch(nj){return null;}},window['__kurtcordVcCount']=function(){try{var nX=window['Vencord']&&Vencord['Webpack'];if(!nX)return 0x2*-0x5b1+0x1*-0x186d+0x23cf;var nh=nX['findStore'],nD=typeof nh==='function'&&nh('VoiceStateStore')||nX['Common']&&nX['Common']['VoiceStateStore'],nS=typeof nh==='function'&&nh('RTCConnectionStore')||nX['Common']&&nX['Common']['RTCConnectionStore'],nE=nD&&nD['getCurrentClientVoiceChannelId']&&nD['getCurrentClientVoiceChannelId']()||nS&&nS['getChannelId']&&nS['getChannelId']()||null;if(!nE||!nD||!nD['getVoiceStatesForChannel'])return 0x58f*-0x2+-0x1a96*0x1+0x1fc*0x13;var nj=nD['getVoiceStatesForChannel'](nE)||{},nW=-0x2156+-0x1268+-0x1*-0x33be;for(var nv in nj){if(Object['prototype']['hasOwnProperty']['call'](nj,nv))nW++;}return nW;}catch(nI){return-0x55*-0x17+-0x1ede+0x173b;}};}catch(nX){}function n6(){var nh=new Set();try{var nD=Gy&&Gy['getUserIds']&&Gy['getUserIds']();if(nD){if(typeof nD['forEach']==='function')nD['forEach'](function(ng){if(ng!=null)nh['add'](String(ng));});else{if(nD['length']){for(var nS=0x5*-0xb1+-0x1e9+-0x3*-0x1ca;nS<nD['length'];nS++)if(nD[nS]!=null)nh['add'](String(nD[nS]));}}}}catch(ng){}if(!nh['size']){var nE=n5();if(nE)try{n7(GU&&GU['getVoiceStatesForChannel']&&GU['getVoiceStatesForChannel'](nE),nh,-0x2*-0xc1+0x2195+-0x2317*0x1);}catch(nt){}}if(!nh['size'])try{var nj=document['querySelectorAll']('[class*=\x22voiceCallWrapper\x22]\x20img,[class*=\x22participant_\x22]\x20img,[class*=\x22voiceUser\x22]\x20img');for(var nW=-0x21aa+0x13a4+0x2ce*0x5;nW<nj['length'];nW++){var nv=/\/avatars\/(\d{15,21})\//['exec'](nj[nW]['getAttribute']('src')||nj[nW]['src']||'');if(nv)nh['add'](nv[0x1cd0*-0x1+0x5*-0x3df+0x302c]);}}catch(nf){}var nI=n1();if(nI)nh['add'](nI);return nh;}function n7(nh,nD,nS){if(!nh||nS>0xdf4+0x5e9+-0x13d8)return;if(Array['isArray'](nh)){for(var nE=0x1b6a+-0x9aa+-0x8e0*0x2;nE<nh['length'];nE++)n7(nh[nE],nD,nS+(0x1*-0xf9a+-0x2293+0x85d*0x6));return;}if(nh instanceof Map){nh['forEach'](function(nI,ng){if(n4(ng))nD['add'](String(ng));n7(nI,nD,nS+(-0x1f2*-0x12+-0xed*-0x27+-0x471e));});return;}if(typeof nh!=='object')return;var nj=nh['userId']||nh['user_id']||nh['user']&&nh['user']['id']||nh['id'];if(n4(nj))nD['add'](String(nj));var nW=Object['keys'](nh)['slice'](-0x16d9*-0x1+0x1*0x2473+-0x3b4c,-0xf*-0x211+-0x1696+-0xc1*0xb);for(var nv=-0x1c0a+0x1aea+0x120;nv<nW['length'];nv++)n7(nh[nW[nv]],nD,nS+(0x2152+-0xb10+-0x1641));}function n8(){try{var nh=Gx&&Gx['getMediaEngine']&&Gx['getMediaEngine']();if(!nh)return null;var nD=nh['connections'],nS=[];if(nD){if(Array['isArray'](nD))nS=nD;else{if(typeof nD['forEach']==='function')nD['forEach'](function(nj){nS['push'](nj);});else{if(typeof nD==='object')nS=Object['values'](nD);}}}if(!nS['length'])return null;for(var nE=-0xd77+0x4f4*0x1+-0x883*-0x1;nE<nS['length'];nE++){if(nS[nE]&&nS[nE]['connectionState']==='CONNECTED')return nS[nE];}return nS[-0x171f+-0x7*0x4ad+0x37da];}catch(nj){return null;}}function n9(){var nh=n8();return nh&&nh['stats']&&nh['stats']['rtp']&&nh['stats']['rtp']['inbound']||null;}var dvxMeterAn={};function dvxMeterTap(uid){try{var nh=n8();if(!nh||!nh['outputs'])return null;var o=nh['outputs'][uid];if(!o||!o['gainNode']||!o['audioContext'])return null;var t=dvxMeterAn[uid];if(t&&t['gain']===o['gainNode']&&t['ctx']===o['audioContext']){t['an']['getFloatTimeDomainData'](t['buf']);var m=0;for(var i=0;i<t['buf']['length'];i++){var v=Math['abs'](t['buf'][i]);if(v>m)m=v;}return m;}try{t&&t['an']['disconnect']();}catch(e){}var an=o['audioContext']['createAnalyser']();an['fftSize']=512;o['gainNode']['connect'](an);dvxMeterAn[uid]={'an':an,'gain':o['gainNode'],'ctx':o['audioContext'],'buf':new Float32Array(an['fftSize'])};return 0;}catch(e){return null;}}function ne(nh){if(nh===n1())return{'level':n0,'detected':n0>=GY['threshold']};try{var dvxTap=dvxMeterTap(nh);if(dvxTap!=null){var dvxLv=dvxTap*2.8;return{'level':dvxLv,'detected':dvxLv>=GY['threshold']};}}catch(dvxME0){}try{var nD=n9();if(!nD)return{'level':0x0,'detected':![]};var nS=nD[nh]!=null?nD[nh]:typeof nD['get']==='function'?nD['get'](nh):undefined;if(!nS)return{'level':0x0,'detected':![]};var nE=Array['isArray'](nS)?nS:[nS],nj=-0x1d82+0x642+-0x1f0*-0xc,nW=![];for(var nv=0x2425*-0x1+0x1*-0x22b2+0x3*0x179d;nv<nE['length'];nv++){var nI=nE[nv];if(!nI||typeof nI!=='object')continue;if(isFinite(nI['audioLevel']))nj=Math['max'](nj,n3(Number(nI['audioLevel']),-0x1bec+-0x645*-0x1+0x15a7,-0x471*-0x7+-0x2632+0x104*0x7));if(nI['audioDetected']===!![]||isFinite(nI['audioDetected'])&&nI['audioDetected']>0xb*-0xc3+-0xd73+-0x1fc*-0xb)nW=!![];}return{'level':nj,'detected':nW};}catch(ng){return{'level':0x0,'detected':![]};}}function nQ(){n2();var nh=n6(),nD=Date['now']();return nh['forEach'](function(nS){var nE=ne(nS);Gd['lastSig']['set'](nS,{'raw':nE['level'],'detected':nE['detected'],'ts':nD});var nj=Gd['smoothed']['get'](nS)||0x985*-0x1+-0x1d34+0x26b9,nW=nE['detected']||nE['level']>=GY['threshold']?n3(nE['level'],-0x251f+0x119*0x1b+0x77c*0x1,-0x56*0x2f+-0x4d3+0x149e):-0x18a5+0xc4d+0x5*0x278,nv;if(nW>nj)nv=nj+(nW-nj)*n3(GY['rise'],-0x2*0x5ae+0x5*-0x5d5+0x2885+0.05,0xbfc+-0x81*0x9+0x1*-0x772);else nv=nj*n3(GY['decay'],-0x2b*0x59+0xe01+-0x16*-0xb+0.1,-0x79*0x47+-0x4db+-0x37e*-0xb+0.99);if(nW===-0x24e6+-0x22fc*0x1+0x23f1*0x2&&nv<0x3*-0xfb+0xd9a*0x2+-0x1843+0.0012)nv=-0x14b2+0x13ea+0x14*0xa;Gd['smoothed']['set'](nS,nv);}),Gd['smoothed']['forEach'](function(nS,nE){if(!nh['has'](nE)){var nj=nS*n3(GY['decay'],-0x1a48*-0x1+0x1dd5+-0xb39*0x5+0.1,0x1bf1+0x275*0x7+-0x2d24+0.99);if(nj<0xd91+-0x1*0x222b+0x149a+0.0012)Gd['smoothed']['delete'](nE),Gd['lastSig']['delete'](nE);else Gd['smoothed']['set'](nE,nj);}}),nh;}function nG(){var nh=[],nD=new Set();function nS(nE,nj){nE&&!nD['has'](nE)&&(nD['add'](nE),nh['push']({'el':nE,'type':nj}));}return['[class*=\x22voiceUser\x22]','[class*=\x22rtcConnectionUser\x22]']['forEach'](function(nE){try{var nj=document['querySelectorAll'](nE);for(var nW=-0x208b+0x4*0x349+0x1367;nW<nj['length'];nW++)nS(nj[nW],'row');}catch(nv){}}),['[class*=\x22participant_\x22]','[class*=\x22voiceCallWrapper\x22]\x20[class*=\x22tile_\x22]']['forEach'](function(nE){try{var nj=document['querySelectorAll'](nE);for(var nW=-0x1394+-0x1*0x23ea+0x377e;nW<nj['length'];nW++)nS(nj[nW],'tile');}catch(nv){}}),nh;}function nn(nh,nD){var nS=nh['querySelectorAll']?[]['slice']['call'](nh['querySelectorAll']('img')):[];if(nh['tagName']==='IMG')nS['unshift'](nh);for(var nE=-0xdba+-0x1d28+0x2ae2;nE<nS['length'];nE++){var nj=/\/avatars\/(\d{15,21})\//['exec'](nS[nE]['getAttribute']('src')||nS[nE]['src']||'');if(nj&&nD['has'](nj[-0xe6b*-0x2+0x20bb+-0x1*0x3d90]))return nj[-0x6*-0x152+-0x108f+0x1c*0x4f];}var nW=nh;for(var nv=0x4*0x63+0x237d+-0x2509;nv<0x1c87+-0xe2*-0x13+-0x2d45*0x1&&nW;nv++){try{var nI=nW['dataset']&&nW['dataset']['userId']||nW['getAttribute']&&nW['getAttribute']('data-user-id');if(nI&&nD['has'](String(nI)))return String(nI);}catch(ng){}nW=nW['parentElement'];}return null;}function nC(nh,nD,nS){var nE=Gd['targets']['get'](nh);if(nE){nE['userId']=nD;return;}try{if(getComputedStyle(nh)['position']==='static')nh['style']['position']='relative';}catch(nI){}var nj=document['createElement']('div');nj['className']='vvm-overlay\x20'+(nS==='tile'?'vvm-tile-meter':'vvm-list-meter');var nW=document['createElement']('div');nW['className']='vvm-track';var nv=document['createElement']('div');nv['className']='vvm-fill',nW['appendChild'](nv),nj['appendChild'](nW),nh['appendChild'](nj),Gd['targets']['set'](nh,{'userId':nD,'fill':nv,'track':nW,'root':nj});}function nL(nh){var nD=Gd['targets']['get'](nh);if(!nD)return;try{nD['root']['remove']();}catch(nS){}Gd['targets']['delete'](nh);}function na(){var nh=[];Gd['targets']['forEach'](function(nS,nE){nh['push'](nE);});for(var nD=0xcd2+0x16ba+-0x238c;nD<nh['length'];nD++)nL(nh[nD]);}function nb(){if(!Gd['started'])return;var nh=n6();if(!nh['size']){na();return;}var nD=nG();for(var nS=0xb6d*-0x3+0x38*-0x86+0x3f97;nS<nD['length'];nS++){if(Gd['targets']['has'](nD[nS]['el']))continue;var nE=nn(nD[nS]['el'],nh);if(nE)nC(nD[nS]['el'],nE,nD[nS]['type']);}var nj=[];Gd['targets']['forEach'](function(nv,nI){if(!document['body']['contains'](nI)||!nh['has'](nv['userId']))nj['push'](nI);});for(var nW=0x877+0x1d8b*-0x1+0x1514;nW<nj['length'];nW++)nL(nj[nW]);}function nH(){Gd['targets']['forEach'](function(nh,nD){if(!document['body']['contains'](nD)){nL(nD);return;}var nS=Gd['smoothed']['get'](nh['userId'])||0x1128+0x18da+-0x2a02,nE=nS>-0x1b18+-0x23b*0x5+-0x263f*-0x1?Math['max'](nS,GY['minVis']):-0x5*0x611+0x26e9*-0x1+0x453e;nh['fill']['style']['width']=n3(nE,-0xa81+-0x15b2*-0x1+0x1*-0xb31,-0x1*0x2226+0x1*0x1ef1+0x336)*(0x47*0x2f+-0x558+0x59*-0x15)+'%',nh['fill']['style']['opacity']=nS>-0xd5*0x1a+0x16e*-0x9+0x2280+0.001?'1':'0',nh['track']['style']['opacity']=GY['showTrackSilent']||nS>-0x1bbd+0x1b9*0xe+0x39f*0x1+0.001?'1':'0';});}function nq(){if(document['getElementById']('vvm-style'))return;var nh=document['createElement']('style');nh['id']='vvm-style',nh['textContent']='.vvm-list-meter{position:absolute;right:8px;bottom:4px;width:'+GY['listW']+'px;height:'+(GY['listH']+(-0x17f5+0x1c6+-0x12b*-0x13))+'px;pointer-events:none;z-index:5;display:flex;align-items:center}'+'.vvm-tile-meter{position:absolute;left:8px;right:8px;bottom:7px;height:6px;pointer-events:none;z-index:5;display:flex;align-items:center}'+'.vvm-track{position:relative;width:100%;height:100%;border-radius:999px;overflow:hidden;background:rgba(0,0,0,.45);box-shadow:inset\x200\x200\x200\x201px\x20rgba(255,255,255,.08);transition:opacity\x20.15s}'+'.vvm-fill{height:100%;width:0;border-radius:inherit;transition:width\x20.07s\x20linear,opacity\x20.12s;background:linear-gradient(90deg,rgba(64,255,154,.95),rgba(255,215,64,.95)\x2078%,rgba(255,96,96,.98))'+(GY['glow']?';box-shadow:0\x200\x208px\x20rgba(80,255,170,.5)':'')+'}',document['head']['appendChild'](nh);}function nR(){var nh=document['getElementById']('vvm-style');if(nh)nh['remove']();}function ni(){if(Gd['discScheduled'])return;Gd['discScheduled']=!![];var nh=Math['max'](-0x1fc+0x1d98+-0x1b9c,0x9b0+0x7db*-0x1+-0x10d-(Date['now']()-Gd['lastDisc']));if(Gd['discTimer'])clearTimeout(Gd['discTimer']);Gd['discTimer']=setTimeout(function(){Gd['discScheduled']=![],Gd['lastDisc']=Date['now'](),nb();},nh);}function no(){if(Gd['started'])return;Gd['started']=!![],GM(),nq();try{Gd['observer']=new MutationObserver(function(){ni();}),Gd['observer']['observe'](document['body'],{'childList':!![],'subtree':!![]});}catch(nh){}Gd['paintTimer']=setInterval(function(){if(!Gd['started'])return;nQ(),nH();},Math['max'](-0x1a4+0xcab+0xfd*-0xb,GY['updateInterval'])),ni(),e7('voice\x20meter\x20on');}function nV(){Gd['started']=![];Gd['paintTimer']&&(clearInterval(Gd['paintTimer']),Gd['paintTimer']=null);Gd['discTimer']&&(clearTimeout(Gd['discTimer']),Gd['discTimer']=null);Gd['observer']&&(Gd['observer']['disconnect'](),Gd['observer']=null);na(),nR(),Gd['smoothed']['clear'](),Gd['lastSig']['clear']();try{if(Gr&&Gr['close'])Gr['close']();}catch(nh){}Gr=null,Gp=null,GK=null,n0=-0x926+-0xd32+-0xdc*-0x1a;}try{window['VVMeter']={'inboundStats':n9,'signal':function(nh){return ne(String(nh));},'activeIds':function(){var nh=[];return n6()['forEach'](function(nD){nh['push'](nD);}),nh;},'levels':function(){var nh={};return Gd['smoothed']['forEach'](function(nD,nS){nh[nS]=nD;}),nh;}};}catch(nh){}return{'start':no,'stop':nV};}());if(Q['voiceMeter'])setTimeout(function(){try{Gf['start']();}catch(Gd){}},-0x112*-0x2+-0x6d*-0x43+-0xf0b);function GB(){return document['head']||document['getElementsByTagName']('head')[-0x1ce5+-0x12f6+0x1*0x2fdb]||document['documentElement'];}function GT(Gd,GY){try{if(document['getElementById'](Gd))return;var Gx=document['createElement']('style');Gx['id']=Gd,Gx['textContent']=GY,GB()['appendChild'](Gx);}catch(GU){}}function GJ(Gd){var GY=-0x1766+0x1*0x6e1+0x1085;(function Gx(){try{var GU=window['Vencord']&&Vencord['Webpack'];if(GU&&GU['findStore']&&GU['Common']&&GU['Common']['FluxDispatcher']&&typeof c==='function'&&c()){try{Gd();}catch(Gy){}return;}}catch(Gk){}if(GY++<0x5*0x292+-0x2*-0x5ef+0xbe4*-0x2)setTimeout(Gx,0x1453+-0x4*0x81d+-0x67*-0x23);}());}(function(){var Gd=null,GY=null,Gx=null;function GU(){try{var GM=Gd&&Gd['getLastPing']&&Gd['getLastPing']();return typeof GM==='number'?GM:null;}catch(GP){return null;}}function Gy(){return document['querySelector']('[class*=\x22rtcConnectionStatus\x22]');}function Gk(){var GM=Gy();if(!GM){if(Gx&&Gx['parentNode'])Gx['parentNode']['removeChild'](Gx);Gx=null;return;}(!Gx||!GM['contains'](Gx))&&(Gx=document['createElement']('span'),Gx['className']='dvx-ping',GM['appendChild'](Gx));var GP=GU();Gx['textContent']=GP!=null?GP+'\x20ms':'';}GJ(function(){try{Gd=Vencord['Webpack']['findStore']('RTCConnectionStore');}catch(GM){}try{GY=Vencord['Webpack']['Common']['FluxDispatcher'];}catch(GP){}GT('dvx-ping-style','.dvx-ping{margin-left:6px;font-size:12px;font-weight:600;color:var(--header-secondary,#b5bac1);font-variant-numeric:tabular-nums;white-space:nowrap}');try{if(GY&&GY['subscribe'])GY['subscribe']('RTC_CONNECTION_PING',Gk);}catch(Gr){}setInterval(Gk,0x1b03+-0x1c29+0x8f6),Gk(),e7('ShowPing\x20native\x20ready');});}()),(function(){var Gd='AC1|',GY=/(?:\uD83D\uDD12)?AC1\|/,Gx=-0x134*-0x12+-0x1da7*0x1+-0xf6b*-0x1;function GU(nV){try{var nX='ac-e2ee-toast',nh=document['getElementById'](nX);!nh&&(nh=document['createElement']('div'),nh['id']=nX,nh['style']['cssText']='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:1000001;background:var(--background-floating,#111214);color:var(--header-primary,#f2f3f5);border:1px\x20solid\x20rgba(237,66,69,.5);border-radius:8px;padding:12px\x2034px\x2012px\x2016px;font-size:13px;line-height:1.4;max-width:440px;box-shadow:0\x208px\x2024px\x20rgba(0,0,0,.5);font-family:var(--font-primary,sans-serif)',document['body']['appendChild'](nh));nh['innerHTML']='';var nD=document['createElement']('span');nD['textContent']='🔒\x20'+nV,nh['appendChild'](nD);var nS=document['createElement']('span');nS['textContent']='×',nS['title']='Dismiss',nS['style']['cssText']='position:absolute;top:6px;right:10px;cursor:pointer;font-size:18px;line-height:1;opacity:.6',nS['onclick']=function(){try{nh['style']['display']='none';}catch(nE){}},nh['appendChild'](nS),nh['style']['display']='block',clearTimeout(nh['__h']),nh['__h']=setTimeout(function(){try{nh['style']['display']='none';}catch(nE){}},-0x5*-0x43f+-0xd*0x2bd+0x1c0a);}catch(nE){}}function Gy(nV){try{var nX=String(nV)['match'](/channels\/(\d+)\/messages/);return nX?nX[-0x57*-0x11+0x2f9+-0x1*0x8bf]:'';}catch(nh){return'';}}function Gk(){try{var nV=location['pathname']['match'](/channels\/(?:@me|\d+)\/(\d+)/);return nV?nV[0x267d*0x1+-0x29c+0x8*-0x47c]:'';}catch(nX){return'';}}function GM(nV){try{for(var nX=0xf03+0x11*-0x11a+0x3b7;nX<G7['contacts']['length'];nX++){if(G7['contacts'][nX]['dm']===nV)return G7['contacts'][nX];}}catch(nh){}return null;}function GP(nV){try{for(var nX=0x559+-0x1*-0x1552+-0x1aab;nX<G7['contacts']['length'];nX++){if(G6['idKey'](G7['contacts'][nX]['bundle'])===nV)return!![];}}catch(nh){}return![];}var Gr=null,Gp='';function GK(){try{if(!G7['myBundle'])return Promise['resolve'](null);if(Gr&&Gp===G7['myBundle'])return Promise['resolve'](Gr);return G6['importRecipient'](G7['myBundle'])['then'](function(nV){return Gr=nV,Gp=G7['myBundle'],nV;});}catch(nV){return Promise['resolve'](null);}}function n0(nV,nX){try{if(!G7['backup']||!nV||!nX)return;nX['ts']=Date['now']();if(G7['backupEnc']&&G7['id'])GK()['then'](function(nh){if(!nh){try{window['__kurtcord']['e2eeBackupAppend'](nV,JSON['stringify'](nX));}catch(nD){}return;}G6['encrypt'](G7['id'],nh,'kurtcord-backup',JSON['stringify'](nX),![])['then'](function(nS){try{window['__kurtcord']['e2eeBackupAppend'](nV,JSON['stringify']({'ts':nX['ts'],'enc':nS}));}catch(nE){}})['catch'](function(){});});else try{window['__kurtcord']['e2eeBackupAppend'](nV,JSON['stringify'](nX));}catch(nh){}}catch(nD){}}var n1={};function n2(nV,nX,nh){try{n1[nV+'|'+nX]=Date['now']();}catch(nD){}n0(nV,{'dir':'out','text':nX,'pq':!!nh});}function n3(nV,nX,nh,nD){try{var nS=nV+'|'+nX,nE=n1[nS];if(nE&&Date['now']()-nE<0xaf*0x3f+-0xb7e*-0xd+-0x7257){delete n1[nS];return;}}catch(nj){}n0(nV,{'dir':'in','text':nX,'pq':!!nh,'att':!!nD});}function n4(){return document['querySelector']('[role=\x22textbox\x22][data-slate-editor=\x22true\x22]')||document['querySelector']('div[data-slate-editor=\x22true\x22]')||document['querySelector']('[class*=\x22slateTextArea_\x22]')||document['querySelector']('[role=\x22textbox\x22]');}function n5(nV){var nX=nV['replace'](/[^A-Za-z0-9]/g,'')['slice'](-0x1d3f+0x211*-0x5+-0x2794*-0x1,-0x1393*0x1+0x1e44+0xa99*-0x1)||'AC1';return new File([nV],nX+'.txt',{'type':'text/plain'});}function n6(nV){try{['keydown','keypress','keyup']['forEach'](function(nX){nV['dispatchEvent'](new KeyboardEvent(nX,{'key':'Enter','code':'Enter','keyCode':0xd,'which':0xd,'bubbles':!![],'cancelable':!![]}));});}catch(nX){}}function n7(nV,nX){try{var nh=n4();if(!nh)return GU('Could\x20not\x20find\x20the\x20message\x20box.\x20Click\x20in\x20the\x20chat\x20and\x20resend.'),![];nh['focus']();var nD=n5(nX),nS=new DataTransfer();nS['items']['add'](nD);var nE=new ClipboardEvent('paste',{'bubbles':!![],'cancelable':!![],'clipboardData':nS});try{Object['defineProperty'](nE,'clipboardData',{'value':nS});}catch(nj){}return nh['dispatchEvent'](nE),n9('attachment\x20paste\x20dispatched\x20('+nX['length']+'\x20chars).\x20Press\x20Enter\x20to\x20send\x20once\x20upload\x20finishes.'),GU('Encrypted\x20file\x20attached\x20–\x20press\x20Enter\x20to\x20send\x20it\x20once\x20the\x20upload\x20finishes.'),!![];}catch(nW){return n9('sendAsAttachment\x20error',nW&&nW['message']),GU('Failed\x20to\x20attach\x20the\x20encrypted\x20file:\x20'+(nW&&nW['message']||'unknown\x20error')),![];}}var n8=![];function n9(){if(n8)try{console['log']['apply'](console,['[Kurtcord\x20E2EE]']['concat']([]['slice']['call'](arguments)));}catch(nV){}}function ne(nV){return nV&&/\/channels\/\d+\/messages(\?|$)/['test'](String(nV));}function nQ(nV){var nX=GM(nV);return nX;}try{var nG=window['fetch'];window['fetch']=function(nV,nX){try{var nh=typeof nV==='string'?nV:nV&&nV['url'],nD=(nX&&nX['method']||nV&&nV['method']||'GET')['toUpperCase']();if(nD==='POST'&&ne(nh)){n9('fetch\x20POST\x20to\x20messages\x20endpoint;\x20enabled='+G7['enabled']+'\x20unlocked='+G7['unlocked']+'\x20hasId='+!!G7['id']);if(!1&&G7['enabled']&&G7['unlocked']&&G7['id']&&nX&&typeof nX['body']==='string'){var nS=Gy(nh),nE=nQ(nS);n9('channel='+nS+'\x20mappedContact='+(nE?nE['name']||'(unnamed)':'NONE'));if(nE){var nj=JSON['parse'](nX['body']);if(nj&&typeof nj['content']==='string'&&nj['content']&&nj['content']['indexOf'](Gd)!==0x1665*-0x1+0x103f+-0x313*-0x2){var nW=nj['content'];n9('encrypting\x20outgoing\x20message\x20('+nW['length']+'\x20chars)\x20pq='+G7['pq']);try{n2(nS,nW,G7['pq']);}catch(nv){}return G6['importRecipient'](nE['bundle'])['then'](function(nI){return G6['encrypt'](G7['id'],nI,nS,nW,G7['pq']);})['then'](function(nI){if((Gd+nI)['length']>Gx)return n9('over\x20text\x20limit\x20('+(Gd+nI)['length']+')\x20->\x20sending\x20as\x20attachment'),n7(nS,Gd+nI),new Response(JSON['stringify']({'message':'Kurtcord:\x20routed\x20to\x20attachment','code':0x0}),{'status':0x190,'headers':{'Content-Type':'application/json'}});nj['content']=Gd+nI;var ng={};for(var nt in nX)ng[nt]=nX[nt];return ng['body']=JSON['stringify'](nj),n9('SENT\x20ENCRYPTED\x20via\x20fetch\x20('+nI['length']+'\x20b64\x20chars)'),nG['call'](window,nV,ng);})['catch'](function(nI){return n9('fetch\x20encrypt\x20FAILED,\x20sending\x20plaintext:',nI&&nI['message']),nG['call'](window,nV,nX);});}}}}}catch(nI){n9('fetch\x20hook\x20error',nI&&nI['message']);}return nG['apply'](window,arguments);},n9('fetch\x20send-hook\x20installed');}catch(nV){}try{var nn=XMLHttpRequest['prototype']['open'],nC=XMLHttpRequest['prototype']['send'];XMLHttpRequest['prototype']['open']=function(nX,nh){try{this['__acMethod']=String(nX||'')['toUpperCase'](),this['__acUrl']=nh;}catch(nD){}return nn['apply'](this,arguments);},XMLHttpRequest['prototype']['send']=function(nX){try{if(this['__acMethod']==='POST'&&ne(this['__acUrl'])&&!this['__acEncrypted']){n9('XHR\x20POST\x20to\x20messages\x20endpoint;\x20enabled='+G7['enabled']+'\x20unlocked='+G7['unlocked']+'\x20hasId='+!!G7['id']+'\x20bodyType='+typeof nX);if(!1&&G7['enabled']&&G7['unlocked']&&G7['id']&&typeof nX==='string'){var nh=Gy(this['__acUrl']),nD=nQ(nh);n9('channel='+nh+'\x20mappedContact='+(nD?nD['name']||'(unnamed)':'NONE'));if(nD){var nS=null;try{nS=JSON['parse'](nX);}catch(nW){}if(nS&&typeof nS['content']==='string'&&nS['content']&&nS['content']['indexOf'](Gd)!==-0x2670+-0x1*-0x6b6+-0x83*-0x3e){var nE=nS['content'],nj=this;n9('encrypting\x20outgoing\x20message\x20('+nE['length']+'\x20chars)\x20pq='+G7['pq']);try{n2(nh,nE,G7['pq']);}catch(nv){}G6['importRecipient'](nD['bundle'])['then'](function(nI){return G6['encrypt'](G7['id'],nI,nh,nE,G7['pq']);})['then'](function(nI){if((Gd+nI)['length']>Gx){n9('over\x20text\x20limit\x20('+(Gd+nI)['length']+')\x20->\x20sending\x20as\x20attachment'),nj['__acEncrypted']=!![];try{var ng=String(Date['now']())+'0',nt=JSON['stringify']({'id':ng,'type':0x0,'channel_id':nh,'content':'','attachments':[],'embeds':[],'timestamp':new Date()['toISOString']()});Object['defineProperty'](nj,'readyState',{'configurable':!![],'get':function(){return 0x273*0x1+-0xdfd+0xb8e;}}),Object['defineProperty'](nj,'status',{'configurable':!![],'get':function(){return-0xbfb+0x9d*-0x2c+0x27bf;}}),Object['defineProperty'](nj,'responseText',{'configurable':!![],'get':function(){return nt;}}),Object['defineProperty'](nj,'response',{'configurable':!![],'get':function(){return nt;}});if(typeof nj['onreadystatechange']==='function')nj['onreadystatechange']();nj['dispatchEvent'](new Event('readystatechange')),nj['dispatchEvent'](new Event('load')),nj['dispatchEvent'](new Event('loadend'));}catch(nf){n9('synthetic-complete\x20failed',nf&&nf['message']);}n7(nh,Gd+nI);return;}nS['content']=Gd+nI,nj['__acEncrypted']=!![],n9('SENT\x20ENCRYPTED\x20via\x20XHR\x20('+nI['length']+'\x20b64\x20chars)'),nC['call'](nj,JSON['stringify'](nS));})['catch'](function(nI){n9('XHR\x20encrypt\x20FAILED,\x20sending\x20plaintext:',nI&&nI['message']),nj['__acEncrypted']=!![],nC['call'](nj,nX);});return;}}}}}catch(nI){n9('XHR\x20hook\x20error',nI&&nI['message']);}return nC['apply'](this,arguments);},n9('XHR\x20send-hook\x20installed');}catch(nX){}var nL={},na={};function nb(nh,nD,nS){try{nh['textContent']=nD,nh['setAttribute']('data-ac-e2ee','1');var nE=document['createElement']('span');nE['textContent']=nS?'\x20🔒PQ':'\x20🔒',nE['title']=nS?'Decrypted\x20(post-quantum)':'Decrypted\x20(Kurtcord\x20E2EE)',nE['style']['cssText']='font-size:11px;opacity:.6;margin-left:4px;vertical-align:middle',nh['appendChild'](nE);}catch(nj){}}function nH(nh,nD,nS){try{if(nh['querySelector']('.ac-e2ee-att'))return;var nE=document['createElement']('div');nE['className']='ac-e2ee-att',nE['style']['cssText']='margin:4px\x200\x206px;padding:8px\x2010px;border-left:3px\x20solid\x20var(--brand-500,#5865f2);background:var(--background-secondary,#2b2d31);border-radius:4px;font-size:15px;line-height:1.375;color:var(--text-normal,#dbdee1);white-space:pre-wrap;word-break:break-word';var nj=document['createElement']('div');nj['textContent']=nS?'🔒\x20PQ-E2EE\x20Message:':'🔒\x20E2EE\x20Message:',nj['title']=nS?'Decrypted\x20attachment\x20(post-quantum)':'Decrypted\x20attachment',nj['style']['cssText']='font-size:12px;font-weight:600;opacity:.7;margin-bottom:4px;letter-spacing:.02em',nE['appendChild'](nj),nE['appendChild'](document['createTextNode'](nD)),nh['insertBefore'](nE,nh['firstChild']);}catch(nW){}}function nq(){if(!G7['enabled']||!G7['unlocked']||!G7['id'])return;var nh=Gk();if(!nh)return;var nD=document['querySelectorAll']('a[href*=\x22cdn.discordapp.com/attachments/\x22]:not([data-ac-att]),\x20a[href*=\x22media.discordapp.net/attachments/\x22]:not([data-ac-att])');for(var nS=-0x4*0x199+0x169*-0x7+0x1043;nS<nD['length'];nS++){(function(nE){var nj=nE['getAttribute']('href')||'',nW=nj['split']('?')[-0x2093+0x1*0x1b7d+0x516];if(!/\.(txt|ac)$/i['test'](nW))return;var nv=nW['split']('/')['pop']()||'';if(!/^(GH4sI|AC1|H4sI)/['test'](nv))return;nE['setAttribute']('data-ac-att','pending');var nI=nE['closest']('[id^=\x22message-\x22]')||nE['closest']('li')||nE['parentNode'];if(na[nW]!==undefined){if(na[nW]!=='__fail__')nH(nI,na[nW]['t'],na[nW]['pq']);return;}fetch(nj)['then'](function(ng){return ng['text']();})['then'](function(ng){var nt=ng['trim'](),nf=nt['match'](GY);return nf&&(nt=nt['slice'](nf['index']+nf[-0x79*0x7+0x2d7*0x3+0x536*-0x1]['length'])['trim']()),G6['decrypt'](G7['id'],nt,nh,GP)['then'](function(nB){return G6['wireMeta'](nt)['then'](function(nT){var nJ=!!(nT&&nT['pq']);na[nW]={'t':nB,'pq':nJ},nH(nI,nB,nJ),nE['setAttribute']('data-ac-att','1');try{n3(nh,nB,nJ,!![]);}catch(nu){}});});})['catch'](function(ng){na[nW]='__fail__',nE['setAttribute']('data-ac-att','fail'),n9('attachment\x20decrypt\x20failed:',ng&&ng['message']);});}(nD[nS]));}}function nR(){if(!G7['enabled']||!G7['unlocked']||!G7['id'])return;var nh=Gk();if(!nh)return;var nD=document['querySelectorAll']('[id^=\x22message-content-\x22]:not([data-ac-e2ee])');for(var nS=-0x6c+0x79c+-0x5c*0x14;nS<nD['length'];nS++){(function(nE){var nj=nE['textContent']||'',nW=nj['match'](GY);if(!nW)return;var nv=nW['index'],nI=nj['slice'](nv+nW[0x19ce+0xfc+-0x1aca]['length'])['trim']();nE['setAttribute']('data-ac-e2ee','pending');if(nL[nI]!==undefined){nb(nE,nL[nI]['t'],nL[nI]['pq']);return;}G6['decrypt'](G7['id'],nI,nh,GP)['then'](function(ng){G6['wireMeta'](nI)['then'](function(nt){var nf=!!(nt&&nt['pq']);nL[nI]={'t':ng,'pq':nf},nb(nE,ng,nf);try{n3(nh,ng,nf,![]);}catch(nB){}});})['catch'](function(ng){nE['setAttribute']('data-ac-e2ee','fail');try{var nt=document['createElement']('span');nt['textContent']='\x20🔓',nt['title']='Encrypted\x20message\x20('+(ng&&ng['message']||'cannot\x20decrypt')+')',nt['style']['cssText']='font-size:11px;opacity:.5;margin-left:4px',nE['appendChild'](nt);}catch(nf){}});}(nD[nS]));}}try{var ni=-0xb21+-0xa1a+0x153b*0x1,no=new MutationObserver(function(){if(ni)return;ni=requestAnimationFrame(function(){ni=-0x2*-0xbff+0xf*-0x11e+-0x73c,nR(),nq();});});if(document['body'])no['observe'](document['body'],{'childList':!![],'subtree':!![]}),nR(),nq();else document['addEventListener']('DOMContentLoaded',function(){no['observe'](document['body'],{'childList':!![],'subtree':!![]}),nR(),nq();});setInterval(function(){nR(),nq();},-0x429+0x1db7*-0x1+-0xae9*-0x4);}catch(nh){}try{window['__kurtcord']&&window['__kurtcord']['e2eeGet']&&window['__kurtcord']['e2eeGet']()['then'](function(nD){nD&&nD['ok']&&(G7['enabled']=!!nD['enabled'],G7['pq']=!!nD['pq'],G7['hasKeystore']=!!nD['hasKeystore'],G7['keystore']=nD['keystore']||null,G7['contacts']=Array['isArray'](nD['contacts'])?nD['contacts']:[],G7['backup']=!!nD['backup'],G7['backupEnc']=!!nD['backupEnc']);});}catch(nD){}try{window['__kurtcordE2EEPipe']={'scan':nR,'MARK':Gd};}catch(nS){}try{window['__ACE_DBG']={'contacts':function(){return G7['contacts']||[];},'idk':function(nE){return G6['idKey'](nE);},'state':function(){return{'enabled':G7['enabled'],'unlocked':G7['unlocked'],'hasId':!!G7['id'],'myIdk':G7['id']&&G7['id']['__idk'],'nContacts':(G7['contacts']||[])['length']};}};}catch(nE){}try{console['log']('[Kurtcord]\x20E2EE\x20message\x20pipeline\x20armed\x20(inert\x20until\x20enabled+unlocked)');}catch(nj){}}()),(function(){var Gd='ac-e2ee-lock-btn',GY='ac-e2ee-lock-pop';function Gx(){try{var n2=location['pathname']['match'](/channels\/(?:@me|\d+)\/(\d+)/);return n2?n2[0x17*-0xe0+0x25*-0x8+0x1549]:'';}catch(n3){return'';}}function GU(){try{return/\/channels\/@me\//['test'](location['pathname']);}catch(n2){return![];}}function Gy(n2){try{for(var n3=-0x4*0x236+-0x2351+0x2c29;n3<G7['contacts']['length'];n3++){if(G7['contacts'][n3]['dm']===n2)return G7['contacts'][n3];}}catch(n4){}return null;}function Gk(){try{return window['__kurtcord']['e2eeSaveContacts'](G7['contacts']);}catch(n2){return Promise['resolve']();}}function GM(){var n2=document['getElementById'](GY);if(n2&&n2['parentNode'])n2['parentNode']['removeChild'](n2);}function GP(n2){GM();var n3=Gx();if(!n3)return;var n4=document['createElement']('div');n4['id']=GY,n4['style']['cssText']='position:fixed;z-index:1000000;width:300px;background:var(--background-floating,#111214);border:1px\x20solid\x20var(--background-modifier-accent,rgba(255,255,255,.08));border-radius:8px;box-shadow:0\x208px\x2024px\x20rgba(0,0,0,.5);padding:12px;font-family:var(--font-primary,sans-serif)';var n5=n2['getBoundingClientRect']();n4['style']['top']=n5['bottom']+(0x1fbd+-0x67e*0x1+-0x1937)+'px',n4['style']['left']=Math['max'](-0x1508+-0x1035+0x2545,Math['min'](n5['left']-(-0x1a11+0x1237*-0x2+0x47*0xe5)+n5['width'],window['innerWidth']-(-0x25ca*0x1+-0x15b6+0x3cb4)))+'px';var n6=document['createElement']('div');n6['style']['cssText']='display:flex;align-items:center;justify-content:space-between;margin-bottom:6px';var n7=document['createElement']('div');n7['textContent']='End-to-End\x20Encryption',n7['style']['cssText']='font-size:14px;font-weight:600;color:var(--header-primary,#f2f3f5)',n6['appendChild'](n7);var n8=document['createElement']('span');n8['textContent']='×',n8['title']='Close',n8['style']['cssText']='cursor:pointer;font-size:20px;line-height:1;color:var(--text-muted,#949ba4);padding:0\x202px',n8['onclick']=function(){GM();},n6['appendChild'](n8),n4['appendChild'](n6);function n9(){var nE=document['createElement']('button');return nE['type']='button',nE['textContent']='Open\x20Settings',nE['style']['cssText']='margin-top:10px;width:100%;padding:8px;border:1px\x20solid\x20var(--background-modifier-accent,rgba(255,255,255,.12));border-radius:4px;background:var(--background-tertiary,#1e1f22);color:var(--header-primary,#f2f3f5);font-size:12px;font-weight:600;cursor:pointer',nE['onclick']=function(){GM();try{Gn();}catch(nW){}try{var nj=document['querySelector']('[aria-label=\x22User\x20Settings\x22],[aria-label=\x22Open\x20User\x20Settings\x22]');if(nj)nj['click']();}catch(nv){}},nE;}if(!G7['enabled']){var ne=document['createElement']('div');ne['style']['cssText']='font-size:13px;color:var(--text-muted,#949ba4);line-height:1.45',ne['textContent']='Encryption\x20is\x20off.\x20Turn\x20it\x20on\x20in\x20Settings,\x20create\x20an\x20identity,\x20and\x20add\x20the\x20other\x20person’s\x20key.\x20Then\x20come\x20back\x20here\x20to\x20encrypt\x20this\x20DM.',n4['appendChild'](ne),n4['appendChild'](n9()),document['body']['appendChild'](n4);return;}if(!G7['unlocked']){var nQ=document['createElement']('div');nQ['style']['cssText']='display:flex;flex-direction:column;gap:8px';var nG=document['createElement']('div');nG['style']['cssText']='font-size:13px;color:var(--text-muted,#949ba4);line-height:1.45',nG['textContent']=G7['hasKeystore']?'Your\x20identity\x20is\x20locked.\x20Enter\x20your\x20passphrase\x20to\x20unlock\x20it\x20for\x20this\x20session.':'No\x20identity\x20yet.\x20Create\x20one\x20in\x20Settings\x20→\x20Kurtcord\x20→\x20Privacy\x20first.',nQ['appendChild'](nG);if(G7['hasKeystore']){var nn=document['createElement']('input');nn['type']='password',nn['placeholder']='Passphrase',nn['style']['cssText']='background:var(--background-tertiary,#1e1f22);border:1px\x20solid\x20var(--background-modifier-accent,rgba(255,255,255,.08));color:var(--header-primary,#f2f3f5);font-size:13px;padding:8px\x209px;border-radius:4px;outline:none';var nC=document['createElement']('button');nC['type']='button',nC['textContent']='Unlock',nC['style']['cssText']='padding:8px\x2014px;border:none;border-radius:4px;background:var(--brand-500,#5865f2);color:#fff;font-size:13px;font-weight:600;cursor:pointer';var nL=function(){nC['textContent']='Unlocking…',nC['disabled']=!![],G6['openSecret'](G7['keystore'],nn['value'])['then'](function(nE){return G6['importSecret'](nE);})['then'](function(nE){return G7['id']=nE,G7['unlocked']=!![],G6['publicBundle'](nE);})['then'](function(nE){G7['myBundle']=nE;try{G7['id']['__idk']=G6['idKey'](nE);}catch(nj){}GP(n2);})['catch'](function(){nC['textContent']='Wrong\x20passphrase',nC['disabled']=![],setTimeout(function(){nC['textContent']='Unlock';},-0x33b+-0x190d+0x2224);});};nC['onclick']=nL,nn['onkeydown']=function(nE){if(nE['key']==='Enter')nL();},nQ['appendChild'](nn),nQ['appendChild'](nC);}else nQ['appendChild'](n9());n4['appendChild'](nQ),document['body']['appendChild'](n4),setTimeout(function(){try{nn&&nn['focus']();}catch(nE){}},0x1*0x10cc+-0x24d3+0x1439);return;}var na=document['createElement']('div');na['style']['cssText']='font-size:12px;color:var(--text-muted,#949ba4);margin-bottom:8px',na['textContent']='Encrypt\x20this\x20conversation\x20to:',n4['appendChild'](na);if(!G7['contacts']['length']){var nb=document['createElement']('div');nb['style']['cssText']='font-size:13px;color:var(--text-muted,#949ba4)',nb['textContent']='No\x20contacts\x20yet.\x20Add\x20one\x20in\x20Settings\x20first.',n4['appendChild'](nb),document['body']['appendChild'](n4);return;}var nH=Gy(n3),nq=document['createElement']('select');nq['style']['cssText']='width:100%;background:var(--background-tertiary,#1e1f22);border:1px\x20solid\x20var(--background-modifier-accent,rgba(255,255,255,.08));color:var(--header-primary,#f2f3f5);font-size:13px;padding:7px\x208px;border-radius:4px;outline:none;cursor:pointer;margin-bottom:10px';var nR=document['createElement']('option');nR['value']='',nR['textContent']='—\x20Not\x20encrypted\x20—',nq['appendChild'](nR),G7['contacts']['forEach'](function(nE,nj){var nW=document['createElement']('option');nW['value']=String(nj),nW['textContent']=nE['name']||'(unnamed)';if(nE===nH)nW['selected']=!![];nq['appendChild'](nW);}),n4['appendChild'](nq);var ni=document['createElement']('div');ni['style']['cssText']='font-size:12px;color:var(--text-muted,#949ba4);margin-bottom:6px',ni['textContent']='Encryption\x20method:',n4['appendChild'](ni);var no=document['createElement']('select');no['style']['cssText']='width:100%;background:var(--background-tertiary,#1e1f22);border:1px\x20solid\x20var(--background-modifier-accent,rgba(255,255,255,.08));color:var(--header-primary,#f2f3f5);font-size:13px;padding:7px\x208px;border-radius:4px;outline:none;cursor:pointer;margin-bottom:10px';var nV=document['createElement']('option');nV['value']='basic',nV['textContent']='Basic\x20–\x20X25519\x20(sent\x20as\x20text)';var nX=document['createElement']('option');nX['value']='pq',nX['textContent']='Post-Quantum\x20–\x20ML-KEM-768\x20(sent\x20as\x20file)';if(G7['pq'])nX['selected']=!![];else nV['selected']=!![];no['appendChild'](nV),no['appendChild'](nX),n4['appendChild'](no),no['onchange']=function(){var nE=no['value']==='pq',nj=function(){window['__kurtcord']&&window['__kurtcord']['e2eeSetFlag']?window['__kurtcord']['e2eeSetFlag']('pq',nE)['then'](function(nW){nW&&nW['ok']&&(G7['pq']=!!nW['pq']),nD();}):nD();};if(nE&&!G6['hasPQ']()){no['value']='basic',e2eeNotice('Post-Quantum\x20module\x20is\x20not\x20loaded\x20in\x20this\x20build\x20–\x20staying\x20on\x20Basic.');return;}nj();};var nh=document['createElement']('div');nh['style']['cssText']='font-size:12px;line-height:1.4;margin-bottom:10px;color:var(--text-muted,#949ba4)',n4['appendChild'](nh);function nD(){var nE=Gy(n3);nE?nh['innerHTML']='🔒\x20Messages\x20you\x20send\x20here\x20are\x20encrypted\x20to\x20<b\x20style=\x22color:var(--header-primary,#f2f3f5)\x22>'+(nE['name']||'(unnamed)')['replace'](/[<>&]/g,'')+'</b>'+(G7['pq']?'\x20(post-quantum)':'')+'.':nh['textContent']='🔓\x20This\x20conversation\x20is\x20not\x20encrypted.';}nD(),nq['onchange']=function(){var nE=nq['value']===''?null:G7['contacts'][Number(nq['value'])];for(var nj=0x14e1*-0x1+-0xb7c+0x205d;nj<G7['contacts']['length'];nj++){if(G7['contacts'][nj]['dm']===n3)delete G7['contacts'][nj]['dm'];}if(nE)nE['dm']=n3;Gk()['then'](function(){nD(),Gr();});};var nS=document['createElement']('div');nS['style']['cssText']='font-size:11px;color:var(--text-muted,#949ba4);line-height:1.4',nS['textContent']='Both\x20of\x20you\x20must\x20run\x20Kurtcord,\x20have\x20added\x20each\x20other’s\x20key,\x20and\x20map\x20this\x20DM.\x20To\x20others\x20your\x20messages\x20look\x20like\x20encrypted\x20text.',n4['appendChild'](nS),document['body']['appendChild'](n4),setTimeout(function(){var nE=function(nj){!n4['contains'](nj['target'])&&nj['target']!==n2&&(GM(),document['removeEventListener']('mousedown',nE));};document['addEventListener']('mousedown',nE);},-0x1bef*-0x1+0x1a*-0xd+0x3*-0x8df);}function Gr(){var n2=document['getElementById'](Gd);if(!n2)return;var n3=Gx(),n4=!!Gy(n3);n2['textContent']=n4?'🔒':'🔓',n2['title']=n4?'This\x20DM\x20is\x20end-to-end\x20encrypted\x20(click\x20to\x20change)':'Encrypt\x20this\x20DM\x20(Kurtcord\x20E2EE)',n2['style']['opacity']=n4?'1':'.6';}function Gp(){var n2=document['createElement']('button');return n2['id']=Gd,n2['type']='button',n2['textContent']='🔓',n2['style']['cssText']='all:unset;box-sizing:border-box;display:flex;align-items:center;justify-content:center;width:24px;height:24px;cursor:pointer;font-size:18px;margin:0\x208px;opacity:.6;transition:opacity\x20.15s',n2['onmouseenter']=function(){n2['style']['opacity']='1';},n2['onmouseleave']=function(){Gr();},n2['onclick']=function(n3){n3['preventDefault'](),n3['stopPropagation']();if(document['getElementById'](GY))GM();else GP(n2);},n2;}function GK(){try{if(!G7['enabled']){var n2=document['getElementById'](Gd);if(n2&&n2['parentNode'])n2['parentNode']['removeChild'](n2);return;}if(!GU()){var n3=document['getElementById'](Gd);if(n3&&n3['parentNode'])n3['parentNode']['removeChild'](n3);return;}if(document['getElementById'](Gd)){Gr();return;}var n4=document['querySelector']('[class*=\x22title_\x22]\x20[class*=\x22toolbar_\x22]')||document['querySelector']('section[class*=\x22title_\x22]\x20[class*=\x22toolbar_\x22]')||document['querySelector']('[class*=\x22toolbar_\x22]');if(!n4)return;var n5=Gp();n4['insertBefore'](n5,n4['firstChild']),Gr();}catch(n6){}}var n0=-0x180e+-0x236d*0x1+0x1*0x3b7b;function n1(){GK(),setInterval(function(){if(G7['enabled']&&GU()&&!document['getElementById'](Gd))GK();else Gr();},-0x1*-0x2121+0xbd7+0x2*-0x138e);try{new MutationObserver(function(){if(n0)return;n0=requestAnimationFrame(function(){n0=-0x2*-0xc8c+0x230f+-0x3c27,GK();});})['observe'](document['documentElement'],{'childList':!![],'subtree':!![]});}catch(n2){}}if(document['body'])n1();else document['addEventListener']('DOMContentLoaded',n1);try{console['log']('[Kurtcord]\x20E2EE\x20lock\x20button\x20ready');}catch(n2){}}()),e7('v9.1\x20loaded\x20-\x20Voice\x20+\x20Transport\x20+\x20HD\x20Webcam\x20+\x20Voice\x20Meter\x20+\x20Ping\x20(Kurtzon)');}()),(function(){'use strict';if(window['__acBroadcastReady'])return;try{window['__acBroadcastReady']=!![];}catch(b){}function Q(H){return String(H==null?'':H)['replace'](/[&<>]/g,function(q){return q==='&'?'&amp;':q==='<'?'&lt;':'&gt;';});}function G(){try{console['log']['apply'](console,['[Kurtcord]']['concat']([]['slice']['call'](arguments)));}catch(H){}}var n=[],C=![];function L(){try{document['querySelectorAll']('#acd-broadcast-modal')['forEach'](function(q){try{q['remove']();}catch(R){}});}catch(q){}C=![];if(n['length']){var H=n['shift']();setTimeout(function(){a(H);},-0x5a4+-0x14d6+0x1af2*0x1);}}function a(H){if(!H)return;if(C){n['push'](H);return;}C=!![];var q=Q((H['title']!=null?String(H['title']):'Kurtcord')['slice'](-0x7b*0xf+0x26c5*-0x1+0x6e*0x6b,0x305*-0x1+0x2021+0x263*-0xc)),R=Q((H['body']!=null?String(H['body']):'')['slice'](0x229b+0x33*-0xa8+-0x123,-0xb*0x2e3+-0x1*-0x617+0x5*0x64e)),i=H['kind']==='update',o=H['url']?String(H['url']):'',V=document['createElement']('div');V['id']='acd-broadcast-modal',V['style']['cssText']=['position:fixed','inset:0','z-index:2147483646','display:flex','align-items:center','justify-content:center','background:rgba(0,0,0,.78)','padding:20px','font:13px/1.4\x20\x27gg\x20sans\x27,\x27Noto\x20Sans\x27,system-ui,sans-serif']['join'](';');var X=i&&o?'<button\x20id=\x22acd-bc-later\x22\x20type=\x22button\x22\x20style=\x22padding:8px\x2014px;border:0;border-radius:4px;background:transparent;color:#dbdee1;font-size:13px;font-weight:600;cursor:pointer\x22>Later</button>'+'<button\x20id=\x22acd-bc-dl\x22\x20type=\x22button\x22\x20style=\x22padding:8px\x2016px;border:0;border-radius:4px;background:var(--hc-accent,#AFE37F);color:var(--hc-accent-ink,#1e1f22);font-size:13px;font-weight:700;cursor:pointer\x22>Download</button>':'<button\x20id=\x22acd-bc-ok\x22\x20type=\x22button\x22\x20style=\x22padding:8px\x2018px;border:0;border-radius:4px;background:var(--hc-accent,#AFE37F);color:var(--hc-accent-ink,#1e1f22);font-size:13px;font-weight:700;cursor:pointer\x22>OK</button>';V['innerHTML']='<div\x20style=\x22box-sizing:border-box;width:100%;max-width:340px;background:#313338;border:1px\x20solid\x20#1e1f22;border-radius:8px;box-shadow:0\x2012px\x2040px\x20rgba(0,0,0,.6);overflow:hidden\x22>'+'<div\x20style=\x22padding:16px\x2016px\x2012px\x22>'+'<div\x20style=\x22display:flex;align-items:center;gap:6px;margin-bottom:8px\x22>'+'<span\x20style=\x22font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--hc-accent-ink,#1e1f22);background:var(--hc-accent,#AFE37F);border-radius:4px;padding:2px\x206px\x22>Kurtcord</span>'+(i?'<span\x20style=\x22font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#f0b6ff;background:rgba(244,127,255,.14);border:1px\x20solid\x20rgba(244,127,255,.35);border-radius:4px;padding:2px\x206px\x22>Update</span>':'')+'</div>'+'<div\x20style=\x22font-size:15px;font-weight:700;color:#f2f3f5;margin-bottom:6px;word-break:break-word\x22>'+q+'</div>'+(R?'<div\x20style=\x22font-size:13px;color:#dbdee1;line-height:1.5;white-space:pre-line;word-break:break-word;max-height:300px;overflow:auto\x22>'+R+'</div>':'')+'</div>'+'<div\x20style=\x22display:flex;justify-content:flex-end;gap:8px;padding:12px\x2016px;background:#2b2d31;border-top:1px\x20solid\x20#1e1f22\x22>'+X+'</div>'+'</div>',(document['body']||document['documentElement'])['appendChild'](V);var h=V['querySelector']('#acd-bc-ok'),D=V['querySelector']('#acd-bc-later'),S=V['querySelector']('#acd-bc-dl');function E(j){try{if(window['__kurtcord']&&window['__kurtcord']['broadcastDismiss'])window['__kurtcord']['broadcastDismiss'](H['id'],j);}catch(W){}}if(h)h['onclick']=function(){E('ok'),L();};if(D)D['onclick']=function(){E('later'),L();};if(S)S['onclick']=function(){E('download');try{if(window['__kurtcord']&&window['__kurtcord']['openUrl']&&o)window['__kurtcord']['openUrl'](o);}catch(j){}L();};V['addEventListener']('mousedown',function(j){if(j['target']===V)L();}),G('broadcast\x20shown',H['id']);}try{if(window['__kurtcord']&&window['__kurtcord']['onBroadcast'])window['__kurtcord']['onBroadcast'](a);}catch(H){}try{G('broadcast\x20receiver\x20ready');}catch(q){}}());
(function () {
    'use strict';
    if (window['__acAudioGuard'] >= 10) return '{already:10}';
    try {
        window['__acAudioGuard'] = 10;
    } catch (e) {}
    window['__acGuardLog'] = window['__acGuardLog'] || [];
    function GL(m) {
        try {
            window['__acGuardLog']['push'](m + ' @' + Date.now());
            if (window['__acGuardLog']['length'] > 300) window['__acGuardLog']['shift']();
            console['log']('[Kurtcord] audio guard:', m);
        } catch (e) {}
    }

    var OUT_RATE = 48000;
    var outCtx = null;
    var outHardClose = null;
    var stallRuns = 0;
    var clockPrev = null;
    var sinkWanted = null;
    var sinkTriedAt = 0;
    var sinkFails = 0;
    var outStates = new Map();
    // Output Volume above 100%: voice outputs (not Go Live streams) pass one shared gain stage set by the
    // userscript's Output Volume slider (window.__hcOutBoost). At 1 it multiplies by exactly 1, so 100% is
    // unchanged; deafen and per-user mute still zero each user's own gain before this stage.
    var voiceBus = null;
    var busTarget = 1;
    function outBoost() {
        try {
            var v = typeof window['__hcOutBoost'] === 'function' ? Number(window['__hcOutBoost']()) : 1;
            return isFinite(v) && v >= 1 ? Math.min(v, 10) : 1;
        } catch (e) {
            return 1;
        }
    }
    function busFor(ctx) {
        if (voiceBus && voiceBus['context'] === ctx) return voiceBus;
        voiceBus = ctx['createGain']();
        busTarget = outBoost();
        voiceBus['gain']['value'] = busTarget;
        busOut = null;
        routeBus();
        return voiceBus;
    }
    // MicSpamGuard's hard limiter (window.__hcVoiceLimiter) sits between the voice bus and the mix while it is on.
    var busOut = null;
    function routeBus() {
        if (!voiceBus) return;
        var mix = mixFor(voiceBus['context']);
        var lim = null;
        try {
            lim = typeof window['__hcVoiceLimiter'] === 'function' ? window['__hcVoiceLimiter'](voiceBus['context']) : null;
        } catch (e) {}
        var want = lim || mix;
        if (busOut === want) return;
        try {
            if (busOut) {
                voiceBus['disconnect']();
                if (busOut !== mix) busOut['disconnect']();
            }
            if (lim) lim['connect'](mix);
            voiceBus['connect'](want);
            busOut = want;
        } catch (e) {
            try { voiceBus['disconnect'](); } catch (e2) {}
            voiceBus['connect'](mix);
            busOut = mix;
        }
    }
    window['__hcVoiceRoute'] = routeBus;
    // Secondary/Third Speaker (window.__hcExtraSpk from the userscript): every call output ends in one mix node.
    // While an extra speaker is on, the mix also feeds a stream that a separate AudioContext plays on that device.
    var mixNode = null;
    var tapDst = null;
    var mirrors = {};
    function mixFor(ctx) {
        if (mixNode && mixNode['context'] === ctx) return mixNode;
        mixNode = ctx['createGain']();
        var lim = typeof window['__hcLimit'] === 'function' ? window['__hcLimit'](ctx, 'spk') : null;
        if (lim) {
            mixNode['connect'](lim['in']);
            lim['out']['connect'](ctx['destination']);
            mixNode['__hcLimIn'] = lim['in'];
        } else mixNode['connect'](ctx['destination']);
        tapDst = null;
        return mixNode;
    }
    function spkStatus(p, text) {
        try {
            (window['__hcSpkStatus'] = window['__hcSpkStatus'] || {})[p] = text;
        } catch (e) {}
    }
    function dropMirror(p) {
        var m = mirrors[p];
        if (!m) return;
        mirrors[p] = null;
        try {
            m['ctx']['close']();
        } catch (e) {}
    }
    function makeMirror(p, dev, stream) {
        var NAC = AC(), c = null;
        try {
            c = new NAC({
                'sampleRate': OUT_RATE
            });
        } catch (e) {
            try {
                c = new NAC();
            } catch (e2) {
                return null;
            }
        }
        var m = {
            'ctx': c,
            'gain': c['createGain'](),
            'key': dev + '|' + stream['id'],
            'state': 'Connecting...',
            'failAt': 0
        };
        c['createMediaStreamSource'](stream)['connect'](m['gain']);
        var lim = typeof window['__hcLimit'] === 'function' ? window['__hcLimit'](c, 'spk') : null;
        if (lim) {
            m['gain']['connect'](lim['in']);
            lim['out']['connect'](c['destination']);
            m['limIn'] = lim['in'];
        } else m['gain']['connect'](c['destination']);
        mirrors[p] = m;
        if (typeof c['setSinkId'] !== 'function') {
            m['state'] = 'Error: no output switching';
            m['failAt'] = Date.now();
            return m;
        }
        c['setSinkId'](dev)['then'](function () {
            if (mirrors[p] !== m) return;
            m['state'] = 'Live';
            GL('extra speaker ' + p + ' live');
        }, function (err) {
            if (mirrors[p] !== m) return;
            m['state'] = 'Error: ' + ((err && err['name']) || 'failed');
            m['failAt'] = Date.now();
            GL('extra speaker ' + p + ' ' + m['state']);
        });
        return m;
    }
    function syncSpeakers() {
        var specs = [];
        try {
            specs = typeof window['__hcExtraSpk'] === 'function' ? window['__hcExtraSpk']() || [] : [];
        } catch (e) {}
        var main = preferSink(), inCall = !!activeConn(), want = [];
        for (var i = 0; i < specs['length']; i++) {
            var S = specs[i], dev = String(S['dev'] || '');
            if (dev === 'default') dev = '';
            if (!S['on']) spkStatus(S['p'], 'Off');
            else if (dev === main) spkStatus(S['p'], 'Same as Speaker');
            else if (!inCall || !mixNode || mixNode['context'] !== outCtx) spkStatus(S['p'], 'Waiting for a call');
            else {
                want['push']({
                    'p': S['p'],
                    'dev': dev,
                    'gain': S['gain'],
                    'pan': Number(S['pan']) || 0
                });
                continue;
            }
            dropMirror(S['p']);
        }
        if (!want['length']) {
            if (tapDst) try {
                mixNode['disconnect'](tapDst);
            } catch (e) {}
            tapDst = null;
            return;
        }
        if (!tapDst) {
            tapDst = outCtx['createMediaStreamDestination']();
            mixNode['connect'](tapDst);
        }
        for (var j = 0; j < want['length']; j++) {
            var w = want[j], m = mirrors[w['p']];
            if (m && (m['key'] !== w['dev'] + '|' + tapDst['stream']['id'] || (m['failAt'] && Date.now() - m['failAt'] > 10000))) {
                dropMirror(w['p']);
                m = null;
            }
            if (!m) m = makeMirror(w['p'], w['dev'], tapDst['stream']);
            if (!m) {
                spkStatus(w['p'], 'Error: no audio context');
                continue;
            }
            try {
                if (m['gain']['gain']['value'] !== w['gain']) m['gain']['gain']['setTargetAtTime'](w['gain'], m['ctx']['currentTime'], 0.04);
                if (typeof window['__hcBalance'] === 'function') window['__hcBalance'](m['gain'], m['limIn'] || m['ctx']['destination'], w['pan'], 1);
                if (m['ctx']['state'] === 'suspended') m['ctx']['resume']();
            } catch (e) {}
            spkStatus(w['p'], m['state']);
        }
    }
    function applyBoost() {
        try {
            if (!voiceBus || voiceBus['context']['state'] === 'closed') return;
            var b = outBoost();
            if (b === busTarget) return;
            busTarget = b;
            voiceBus['gain']['cancelScheduledValues'](0);
            voiceBus['gain']['setTargetAtTime'](b, voiceBus['context']['currentTime'], 0.04);
        } catch (e) {}
    }
    try {
        window['__hcOutBoostApply'] = applyBoost;
    } catch (e) {}
    // Speaker switch and pan (window.__hcMainSpk): the mix's path to the main device goes through the userscript's
    // balance stage (window.__hcBalance) once either is used. The extra speakers tap the mix before that stage.
    function syncMain() {
        try {
            if (!mixNode || typeof window['__hcBalance'] !== 'function' || typeof window['__hcMainSpk'] !== 'function') return;
            var s = window['__hcMainSpk']();
            window['__hcBalance'](mixNode, mixNode['__hcLimIn'] || mixNode['context']['destination'], Number(s['pan']) || 0, s['off'] ? 0 : 1);
        } catch (e) {}
    }
    try {
        window['__hcSpkApply'] = function () {
            syncMain();
            syncSpeakers();
        };
    } catch (e) {}

    function AC() {
        return window['AudioContext'] || window['webkitAudioContext'];
    }

    function makeOutCtx(why) {
        var NAC = AC();
        if (!NAC) return null;
        var ctx = null;
        try {
            ctx = new NAC({
                'sampleRate': OUT_RATE
            });
        } catch (e) {
            try {
                ctx = new NAC();
            } catch (e2) {
                GL('context create failed: ' + (e2 && e2['message']));
                return null;
            }
        }
        try {
            outHardClose = ctx['close']['bind'](ctx);
            ctx['close'] = function () {
                GL('blocked external close() on the output context');
                return Promise['resolve']();
            };
        } catch (e) {}
        outCtx = ctx;
        stallRuns = 0;
        clockPrev = null;
        sinkWanted = null;
        sinkFails = 0;
        GL('output context ready (' + why + ') rate=' + ctx['sampleRate']);
        applySink(true);
        return ctx;
    }

    function ensureOutCtx() {
        if (!outCtx || outCtx['state'] === 'closed') return makeOutCtx('create');
        if (outCtx['state'] !== 'running') try {
            outCtx['resume']();
        } catch (e) {}
        return outCtx;
    }

    function retireOutCtx(why) {
        var old = outCtx;
        var hard = outHardClose;
        outCtx = null;
        outHardClose = null;
        stallRuns = 0;
        clockPrev = null;
        sinkWanted = null;
        sinkFails = 0;
        outStates['forEach'](function (st) {
            st['ctx'] = null;
            st['src'] = null;
            st['gain'] = null;
            st['dst'] = null;
            st['an'] = null;
            st['buf'] = null;
        });
        voiceBus = null;
        busOut = null;
        mixNode = null;
        tapDst = null;
        GL('output context retired (' + why + ')');
        if (old && hard) try {
            hard();
        } catch (e) {}
    }

    function engine() {
        try {
            var W = window['Vencord'] && window['Vencord']['Webpack'];
            if (!W) return null;
            var S = W['findStore'] ? W['findStore']('MediaEngineStore') : null;
            var E = S && S['getMediaEngine'] ? S['getMediaEngine']() : null;
            return E && E['connections'] ? E : null;
        } catch (e) {
            return null;
        }
    }

    function store() {
        try {
            var W = window['Vencord'] && window['Vencord']['Webpack'];
            return (W && W['findStore']) ? W['findStore']('MediaEngineStore') : null;
        } catch (e) {
            return null;
        }
    }

    function dispatcher() {
        try {
            var W = window['Vencord'] && window['Vencord']['Webpack'];
            var FD = W && W['Common'] && W['Common']['FluxDispatcher'];
            return FD && typeof FD['dispatch'] === 'function' ? FD : null;
        } catch (e) {
            return null;
        }
    }

    function connList() {
        var E = engine();
        if (!E) return [];
        var raw = E['connections'],
            conns = [];
        try {
            if (Array.isArray(raw)) conns = raw;
            else if (typeof raw['forEach'] === 'function') raw['forEach'](function (v) {
                conns['push'](v);
            });
            else Object['keys'](raw)['forEach'](function (k) {
                conns['push'](raw[k]);
            });
        } catch (e) {}
        return conns;
    }

    function activeConn() {
        var conns = connList();
        for (var i = 0; i < conns['length']; i++) {
            try {
                if (conns[i] && conns[i]['connectionState'] === 'CONNECTED') return conns[i];
            } catch (e) {}
        }
        return null;
    }

    function preferSink() {
        try {
            var S = store();
            var id = S && S['getOutputDeviceId'] ? String(S['getOutputDeviceId']() || '') : '';
            return id === 'default' ? '' : id;
        } catch (e) {
            return '';
        }
    }

    function shortId(o) {
        try {
            return String((o && o['stream'] && o['stream']['id']) || '?')['slice'](0, 6);
        } catch (e) {
            return '?';
        }
    }

    function applySink(force) {
        if (!outCtx || typeof outCtx['setSinkId'] !== 'function') return;
        var want = preferSink();
        var cur = null;
        try {
            cur = String(outCtx['sinkId'] || '');
        } catch (e) {}
        if (!force && sinkWanted === want && (cur === null || cur === want)) return;
        var now = Date.now();
        if (!force && now - sinkTriedAt < 4000) return;
        sinkTriedAt = now;
        sinkWanted = want;
        try {
            outCtx['setSinkId'](want)['catch'](function () {
                sinkFails++;
                if (sinkFails === 1 || sinkFails === 4) GL('setSinkId "' + want + '" failed (' + sinkFails + ')');
                if (sinkFails === 4) try {
                    outCtx['setSinkId']('')['catch'](function () {});
                } catch (e) {}
            });
        } catch (e) {}
    }

    var mutesDirty = false;

    function sanitizeMutes(c) {
        try {
            var lm = c && c['localMutes'];
            if (!lm || typeof lm !== 'object') return;
            var MES = store();
            if (!MES || typeof MES['isLocalMute'] !== 'function') return;
            var keys = Object['keys'](lm),
                removed = 0;
            for (var i = 0; i < keys['length']; i++) {
                if (!lm[keys[i]]) continue;
                var s = null;
                try {
                    s = MES['isLocalMute'](keys[i], c['context'] || 'default');
                } catch (e) {
                    s = null;
                }
                if (s === false) {
                    try {
                        delete lm[keys[i]];
                        removed++;
                    } catch (e) {}
                }
            }
            if (removed && !mutesDirty) {
                mutesDirty = true;
                GL('cleared ' + removed + ' stale localMute flags');
            }
        } catch (e) {}
    }

    function dropNodes(st) {
        try {
            st['src'] && st['src']['disconnect']();
        } catch (e) {}
        try {
            st['gain'] && st['gain']['disconnect']();
        } catch (e) {}
        try {
            st['an'] && st['an']['disconnect']();
        } catch (e) {}
        st['src'] = null;
        st['gain'] = null;
        st['dst'] = null;
        st['an'] = null;
        st['buf'] = null;
    }

    function releaseElement(o) {
        try {
            var el = o && o['audioElement'];
            if (!el) return;
            try {
                el['pause']();
            } catch (e) {}
            try {
                el['srcObject'] = null;
            } catch (e) {}
        } catch (e) {}
    }

    function silenceElement(o, elHint) {
        var el = elHint || o['audioElement'];
        if (!el) {
            var tracks = [];
            try {
                tracks = o['stream'] && o['stream']['getAudioTracks'] ? o['stream']['getAudioTracks']() : [];
            } catch (e) {}
            if (!tracks['length']) return;
            try {
                el = document['createElement']('audio');
                el['autoplay'] = true;
                el['srcObject'] = o['stream'];
                o['audioElement'] = el;
                GL('created audio element ' + shortId(o));
            } catch (e) {
                return;
            }
        }
        try {
            if (el['srcObject'] !== o['stream']) el['srcObject'] = o['stream'];
            if (el['muted'] !== !!o['_mute']) el['muted'] = !!o['_mute'];
            if (Number(el['volume']) !== 0) el['volume'] = 0;
            if (!elHint && el['paused'] && !o['_mute']) {
                var p = el['play']();
                if (p && p['catch']) p['catch'](function () {});
            }
        } catch (e) {}
    }

    function guardAttached(o) {
        var st = outStates['get'](o);
        return !!(st && st['src'] && st['gain'] && st['ctx'] && st['ctx']['state'] !== 'closed');
    }

    function enforceOutput(o, elHint) {
        var st = outStates['get'](o);
        if (!st || !st['src'] || !st['gain'] || !st['ctx'] || st['ctx']['state'] === 'closed') return;
        var el = elHint || o['audioElement'];
        if (el) try {
            if (el['muted'] !== !!o['_mute']) el['muted'] = !!o['_mute'];
            if (Number(el['volume']) !== 0) el['volume'] = 0;
        } catch (e) {}
        var want = o['_mute'] ? 0 : (typeof o['_volume'] === 'number' ? o['_volume'] / 100 : 1);
        try {
            if (st['gain']['gain']['value'] !== want) st['gain']['gain']['value'] = want;
        } catch (e) {}
    }

    function hookOutputProto(o) {
        try {
            var proto = Object['getPrototypeOf'](o);
            if (!proto || proto['__kcDoubleFix']) return;
            var orig = proto['updateAudioElement'];
            if (typeof orig !== 'function') return;
            proto['__kcDoubleFix'] = true;
            proto['updateAudioElement'] = function () {
                var res = orig['apply'](this, arguments);
                try {
                    enforceOutput(this);
                } catch (e) {}
                return res;
            };
            GL('output element lock installed');
        } catch (e) {}
    }

    function outputForStream(stream) {
        if (!stream) return null;
        var conns = connList();
        for (var i = 0; i < conns['length']; i++) {
            var outs = conns[i]['outputs'];
            if (!outs) continue;
            var list = [];
            if (typeof outs['forEach'] === 'function') outs['forEach'](function (v) {
                list['push'](v);
            });
            else Object['keys'](outs)['forEach'](function (k) {
                list['push'](outs[k]);
            });
            for (var j = 0; j < list['length']; j++) {
                if (list[j] && list[j]['stream'] === stream) return list[j];
            }
        }
        return null;
    }

    function hookPlay() {
        try {
            var P = window['HTMLMediaElement'] && window['HTMLMediaElement']['prototype'];
            if (!P || P['__kcDoubleFixPlay'] || typeof P['play'] !== 'function') return;
            var orig = P['play'];
            P['__kcDoubleFixPlay'] = true;
            P['play'] = function () {
                try {
                    var s = this['srcObject'];
                    if (s) {
                        var o = outputForStream(s);
                        if (o) {
                            hookOutputProto(o);
                            if (!guardAttached(o)) attachOutput(o, null, this);
                            else enforceOutput(o, this);
                        }
                    }
                } catch (e) {}
                return orig['apply'](this, arguments);
            };
            GL('media play hook installed');
        } catch (e) {}
    }

    function attachOutput(o, conn, elHint) {
        var ctx = ensureOutCtx();
        if (!ctx || !o || !o['stream']) return false;
        var tracks = [];
        try {
            tracks = o['stream']['getAudioTracks'] ? o['stream']['getAudioTracks']() : [];
        } catch (e) {
            return false;
        }
        if (!tracks['length']) return false;
        var key = String(tracks[0]['id'] || '');
        var st = outStates['get'](o);
        if (!st) {
            st = {
                'ctx': null,
                'stream': null,
                'key': '',
                'src': null,
                'gain': null,
                'an': null,
                'buf': null
            };
            outStates['set'](o, st);
        }
        if (st['ctx'] !== ctx) {
            dropNodes(st);
            st['ctx'] = ctx;
            st['stream'] = null;
            st['key'] = '';
        }
        if (st['src'] && (st['stream'] !== o['stream'] || st['key'] !== key)) {
            dropNodes(st);
            st['stream'] = null;
            st['key'] = '';
        }
        st['stream'] = o['stream'];
        st['key'] = key;
        if (!st['src']) st['src'] = ctx['createMediaStreamSource'](o['stream']);
        if (!st['gain']) st['gain'] = ctx['createGain']();
        try {
            st['src']['connect'](st['gain']);
        } catch (e) {}
        if (conn) st['conn'] = conn;
        var dst = st['conn'] && st['conn']['context'] === 'default' ? busFor(ctx) : mixFor(ctx);
        if (st['dst'] !== dst) {
            if (st['dst']) try {
                st['gain']['disconnect'](st['dst']);
            } catch (e) {}
            try {
                st['gain']['connect'](dst);
                st['dst'] = dst;
            } catch (e) {}
        }
        var wantGain = o['_mute'] ? 0 : (typeof o['_volume'] === 'number' ? o['_volume'] / 100 : 1);
        try {
            if (st['gain']['gain']['value'] !== wantGain) st['gain']['gain']['value'] = wantGain;
        } catch (e) {}
        var oldSrc = o['streamSourceNode'];
        var oldGain = o['gainNode'];
        if (oldSrc && oldSrc !== st['src']) try {
            oldSrc['disconnect']();
        } catch (e) {}
        if (oldGain && oldGain !== st['gain']) try {
            oldGain['disconnect']();
        } catch (e) {}
        o['audioContext'] = ctx;
        o['streamSourceNode'] = st['src'];
        o['gainNode'] = st['gain'];
        silenceElement(o, elHint);
        hookOutputProto(o);
        return true;
    }

    function watchClock() {
        if (!outCtx || outCtx['state'] === 'closed') return false;
        var now = (window['performance'] && performance['now']) ? performance['now']() : Date.now();
        var ts = outCtx['getOutputTimestamp'] ? outCtx['getOutputTimestamp']() : null;
        if (!ts) return false;
        if (!clockPrev) {
            clockPrev = {
                'c': ts['contextTime'],
                'w': now
            };
            return false;
        }
        var elapsed = now - clockPrev['w'];
        if (elapsed < 2000) return false;
        var cAdv = ts['contextTime'] - clockPrev['c'];
        var wAdv = elapsed / 1000;
        if (outCtx['state'] === 'running' && cAdv >= 0 && cAdv < wAdv * 0.5) {
            stallRuns++;
            if (stallRuns === 1) GL('output clock slow ctxAdv=' + cAdv.toFixed(2) + ' wall=' + wAdv.toFixed(2));
            if (stallRuns >= 2) {
                clockPrev = null;
                return true;
            }
        } else {
            stallRuns = 0;
        }
        clockPrev = {
            'c': ts['contextTime'],
            'w': now
        };
        return false;
    }

    function fixOutputs() {
        var conns = connList();
        var live = [];
        for (var ci = 0; ci < conns['length']; ci++) {
            var c = conns[ci];
            try {
                if (!c || c['connectionState'] !== 'CONNECTED') continue;
                sanitizeMutes(c);
                var outs = c['outputs'];
                if (!outs) continue;
                var list = [];
                if (typeof outs['forEach'] === 'function') outs['forEach'](function (v) {
                    list['push'](v);
                });
                else Object['keys'](outs)['forEach'](function (k) {
                    list['push'](outs[k]);
                });
                for (var oi = 0; oi < list['length']; oi++) {
                    var o = list[oi];
                    if (!o || !o['stream']) continue;
                    try {
                        if (!o['stream']['getAudioTracks']()['length']) continue;
                    } catch (e) {
                        continue;
                    }
                    live['push']([o, c]);
                }
            } catch (e) {}
        }
        outStates['forEach'](function (st, o) {
            var here = false;
            for (var i = 0; i < live['length']; i++) {
                if (live[i][0] === o) {
                    here = true;
                    break;
                }
            }
            if (!here) {
                releaseElement(o);
                dropNodes(st);
                outStates['delete'](o);
            }
        });
        if (!live['length']) return;
        ensureOutCtx();
        for (var li = 0; li < live['length']; li++) attachOutput(live[li][0], live[li][1]);
        if (watchClock()) {
            retireOutCtx('stalled');
            ensureOutCtx();
            for (var ri = 0; ri < live['length']; ri++) attachOutput(live[ri][0], live[ri][1]);
        }
        applySink(false);
    }

    var ringState = {};
    var ringAllAt = 0;

    function outActivity(o) {
        var st = outStates['get'](o);
        if (!st || !st['gain'] || !st['ctx']) return null;
        try {
            if (!st['an']) {
                st['an'] = st['ctx']['createAnalyser']();
                st['an']['fftSize'] = 2048;
                st['an']['smoothingTimeConstant'] = 0;
                st['buf'] = new Float32Array(st['an']['fftSize']);
                try { st['src']['connect'](st['an']); } catch (e) { st['gain']['connect'](st['an']); }
            }
            st['an']['getFloatTimeDomainData'](st['buf']);
            var m = 0, sq = 0;
            for (var i = 0; i < st['buf']['length']; i++) {
                var v = st['buf'][i];
                var a = Math.abs(v);
                if (a > m) m = a;
                sq += v * v;
            }
            return { 'peak': m, 'rms': Math.sqrt(sq / st['buf']['length']) };
        } catch (e) {
            return null;
        }
    }

    function ringOff(FD, uid) {
        var st = ringState[uid];
        if (!st || !st['on']) return;
        st['on'] = false;
        try {
            FD['dispatch']({
                'type': 'SPEAKING',
                'userId': uid,
                'speakingFlags': 0,
                'context': 'default',
                'ssrc': 1
            });
        } catch (e) {}
    }

    function ringTick() {
        try {
            var now = Date.now();
            var FD = dispatcher();
            if (!FD) return;
            var c = activeConn();
            if (!c) {
                if (ringAllAt && now - ringAllAt > 2000) {
                    Object['keys'](ringState)['forEach'](function (u) {
                        ringOff(FD, u);
                    });
                    ringAllAt = 0;
                }
                return;
            }
            ringAllAt = now;
            var entered = {};
            var outs = c['outputs'];
            if (outs) {
                var olist = [];
                if (typeof outs['forEach'] === 'function') outs['forEach'](function (v, k) {
                    olist['push']([k, v]);
                });
                else Object['keys'](outs)['forEach'](function (k) {
                    olist['push']([k, outs[k]]);
                });
                for (var oi = 0; oi < olist['length']; oi++) {
                    var uidO = String(olist[oi][0]);
                    var oo = olist[oi][1];
                    if (!/^\d{15,21}$/ ['test'](uidO)) continue;
                    var lv = outActivity(oo);
                    var activeO = !oo['_mute'] && lv != null && (lv['rms'] >= 0.001 || lv['peak'] >= 0.001);
                    var stO = ringState[uidO] || (ringState[uidO] = {
                        'on': false,
                        'at': 0,
                        'off': 0
                    });
                    entered[uidO] = 1;
                    if (activeO) {
                        stO['off'] = 0;
                        if (!stO['on'] || now - stO['at'] > 280) {
                            stO['on'] = true;
                            stO['at'] = now;
                            FD['dispatch']({
                                'type': 'SPEAKING',
                                'userId': uidO,
                                'speakingFlags': 1,
                                'context': 'default',
                                'ssrc': 1
                            });
                        }
                    } else if (stO['on']) {
                        if (!stO['off']) stO['off'] = now;
                        else if (now - stO['off'] > 1000) ringOff(FD, uidO);
                    }
                }
            }
            var rtp = c['stats'] && c['stats']['rtp'] && c['stats']['rtp']['inbound'];
            if (rtp) {
                function handle(uid, val) {
                    try {
                        var uidS = String(uid);
                        if (!/^\d{15,21}$/ ['test'](uidS)) return;
                        if (entered[uidS]) return;
                        var arr = Array.isArray(val) ? val : [val];
                        var active = false;
                        for (var j = 0; j < arr['length']; j++) {
                            var r = arr[j];
                            if (!r || typeof r !== 'object') continue;
                            if (r['audioDetected'] === true || Number(r['audioDetected']) > 0) active = true;
                            var al = Number(r['audioLevel']);
                            if (isFinite(al) && al >= 0.005) active = true;
                        }
                        entered[uidS] = 1;
                        var st = ringState[uidS] || (ringState[uidS] = {
                            'on': false,
                            'at': 0,
                            'off': 0
                        });
                        st['rtpOn'] = active ? now : 0;
                        if (active) {
                            st['off'] = 0;
                            if (!st['on'] || now - st['at'] > 280) {
                                st['on'] = true;
                                st['at'] = now;
                                FD['dispatch']({
                                    'type': 'SPEAKING',
                                    'userId': uidS,
                                    'speakingFlags': 1,
                                    'context': 'default',
                                    'ssrc': 1
                                });
                            }
                        } else if (st['on']) {
                            if (!st['off']) st['off'] = now;
                            else if (now - st['off'] > 1200) ringOff(FD, uidS);
                        }
                    } catch (e) {}
                }
                if (rtp instanceof Map) rtp['forEach'](function (v, k) {
                    handle(k, v);
                });
                else Object['keys'](rtp)['forEach'](function (k) {
                    handle(k, rtp[k]);
                });
            }
            Object['keys'](ringState)['forEach'](function (u) {
                if (!entered[u]) ringOff(FD, u);
            });
        } catch (e) {}
    }

    var deafHooked = false;

    function tick() {
        try {
            if (!deafHooked) {
                var FDh = dispatcher();
                if (FDh && typeof FDh['subscribe'] === 'function') {
                    deafHooked = true;
                    // Apply deafen at once instead of on the next one-second tick.
                    ['AUDIO_TOGGLE_SELF_DEAF', 'AUDIO_TOGGLE_LOCAL_MUTE', 'AUDIO_SET_LOCAL_VOLUME'].forEach(function (t) {
                        FDh['subscribe'](t, function () {
                            setTimeout(function () {
                                try { fixOutputs(); } catch (e) {}
                            }, 0);
                        });
                    });
                }
            }
            fixOutputs();
            applyBoost();
            syncMain();
            syncSpeakers();
        } catch (e) {}
    }
    try {
        navigator['mediaDevices']['addEventListener']('devicechange', function () {
            GL('devicechange');
            applySink(true);
            Object['keys'](mirrors)['forEach'](dropMirror);
            try {
                if (outCtx && outCtx['state'] !== 'running') outCtx['resume']();
            } catch (e) {}
        });
    } catch (e) {}

    try {
        window['__kurtcordAudioDebug'] = function () {
            var ctx = outCtx;
            var outs = [];
            outStates['forEach'](function (st, o) {
                var el = o['audioElement'];
                var item = {
                    'stream': shortId(o),
                    'src': !!st['src'],
                    'gain': !!st['gain'],
                    'gainValue': st['gain'] && st['gain']['gain'] ? st['gain']['gain']['value'] : null,
                    'mute': !!o['_mute'],
                    'volume': o['_volume'],
                    'bus': !!(voiceBus && st['dst'] === voiceBus)
                };
                try {
                    item['tracks'] = o['stream']['getAudioTracks']()['length'];
                    item['el'] = el ? {
                        'paused': !!el['paused'],
                        'muted': !!el['muted'],
                        'volume': el['volume'],
                        'srcMatches': el['srcObject'] === o['stream']
                    } : null;
                } catch (e) {
                    item['err'] = String(e);
                }
                outs['push'](item);
            });
            return {
                'version': 11,
                'doubleFix': 1,
                'ctx': ctx ? {
                    'state': ctx['state'],
                    'rate': ctx['sampleRate'],
                    'sink': (function () {
                        try {
                            return String(ctx['sinkId'] || '');
                        } catch (e) {
                            return '?';
                        }
                    })()
                } : null,
                'wantSink': preferSink(),
                'outBoost': voiceBus ? {
                    'target': busTarget,
                    'value': voiceBus['gain']['value']
                } : null,
                'speakers': Object['keys'](mirrors)['map'](function (p) {
                    var m = mirrors[p];
                    return m ? {
                        'p': p,
                        'state': m['state'],
                        'ctx': m['ctx']['state'],
                        'sink': String(m['ctx']['sinkId'] || ''),
                        'gain': m['gain']['gain']['value']
                    } : {
                        'p': p
                    };
                }),
                'outputs': outs
            };
        };
    } catch (e) {}

    setTimeout(tick, 800);
    setInterval(tick, 1000);
    hookPlay();
    GL('voice double fix v1 active (elements locked to the guard playback)');
    setInterval(ringTick, 300);
    GL('audio guard v11 active (shared 48 kHz playback, elements silenced, low-level ring)');
    return '{guard:11 installed}';
}())
