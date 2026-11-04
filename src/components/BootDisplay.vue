<script setup>
defineProps({ on:Boolean, lines:{ type:Array, default:()=>[] } })
</script>

<template>
  <figure class="boot-display" :class="{ lit:on }" aria-label="Prueba en la laptop del cliente">
    <div class="boot-lid">
      <div class="boot-screen" role="status">
        <template v-if="on"><span class="boot-wordmark">PL <b>/</b> FIRMWARE</span><strong>Autoprueba de arranque</strong>
          <ul><li v-for="line in lines" :key="line">{{ line }}</li></ul><i class="boot-cursor" aria-hidden="true"></i></template>
        <span v-else class="boot-off">Pantalla apagada</span>
      </div>
    </div>
    <div class="boot-hinge"></div><div class="boot-deck" aria-hidden="true"><div class="boot-keys"><i v-for="row in 4" :key="row"></i></div><div class="boot-trackpad"></div><div class="boot-led"></div></div>
  </figure>
</template>

<style scoped>
.boot-display { --glow:#9af3bc; margin:0; padding:clamp(14px,3vw,30px); display:grid; justify-items:center; background:radial-gradient(ellipse at 50% 65%,#33505a,#192e38 80%); overflow:hidden; }
.boot-lid { padding:clamp(8px,1.3vw,14px); border-radius:13px 13px 5px 5px; background:#283337; border:2px solid #839295; width:min(89%,430px); box-shadow:0 5px 12px #15252b; position:relative; }
.boot-lid:before { content:''; position:absolute; top:3px; left:50%; width:4px; height:4px; border-radius:100%; background:#71878b; }
.boot-screen { background:linear-gradient(145deg,#172024,#080f13); color:#e5f5ef; min-height:clamp(140px,19vw,210px); padding:clamp(10px,2vw,20px); display:flex; flex-direction:column; justify-content:center; gap:5px; border:1px solid #091a21; font:500 .85rem/1.4 var(--mono,monospace); }
.lit .boot-screen { background:radial-gradient(ellipse at 35% 75%,#174d44,#0c262c); box-shadow:0 0 12px #6ecca92b; }
.boot-screen strong { font-size:clamp(.94rem,1.5vw,1.2rem); }.boot-wordmark { color:#a9f6c9; font-weight:700; letter-spacing:.1em; font-size:.72rem; }.boot-wordmark b { color:#fff; padding:0 .2em; }
.boot-screen ul { padding:0; margin:2px 0; list-style:none; }.boot-screen li:before { content:'› '; color:var(--glow); }.boot-off { color:#a5b1b8; text-align:center; }.boot-cursor { background:var(--glow); width:8px; height:3px; }
.boot-hinge { width:69%; max-width:326px; height:6px; background:linear-gradient(#607078,#262e34); }.boot-deck { position:relative; width:min(100%,470px); background:linear-gradient(#9ba9a9,#768488); height:clamp(42px,6vw,63px); clip-path:polygon(6% 0,94% 0,100% 87%,99% 98%,1% 98%,0 87%); display:grid; justify-items:center; align-content:start; }
.boot-keys { width:76%; display:grid; margin:4px auto 1px; gap:1.5px; transform:perspective(50px) rotateX(13deg); }.boot-keys i { height:clamp(3px,.65vw,6px); background:repeating-linear-gradient(90deg,#344348 0 5.5%,transparent 5.5% 6.5%); }.boot-keys i:nth-child(even){background-position:4px 0;}
.boot-trackpad { border:1px solid #506267; width:19%; height:clamp(5px,1vw,10px); }.boot-led { position:absolute; bottom:12%; right:10%; width:8px; height:2px; background:#39494d; }.lit .boot-led { background:var(--glow); }
</style>

