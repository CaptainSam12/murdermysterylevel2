
---
layout: opencs
title: Murder Mystery Game 
permalink: /gamify/MurderMysteryLevel2
---
<div id="gameContainer" style="position: relative;">
   <div id="promptDropDown" class="promptDropDown" style="z-index: 9999"></div>
   <canvas id='gameCanvas'></canvas>
</div>
<script type="module">
   // Adnventure Game assets locations
   import Core from "{{site.baseurl}}/assets/js/murderMysteryGame/muderMysteryGameLogic/Game.js";
   import GameControl from "{{site.baseurl}}/assets/js/murderMysteryGame/muderMysteryGameLogicGameControl.js";
   import { initCheats } from "{{site.baseurl}}/assets/js/murderMysteryGame/muderMysteryGameLogic/cheats.js";
   import GameLevel1 from "{{site.baseurl}}/assets/js/murderMysteryGame/MurderMysteryLevel2.js";
   import { pythonURI, javaURI, fetchOptions } from '{{site.baseurl}}/assets/js/api/config.js';
   // Web Server Environment data
   const environment = {
       path:"{{site.baseurl}}",
       pythonURI: pythonURI,
       javaURI: javaURI,
       fetchOptions: fetchOptions,
       gameContainer: document.getElementById("gameContainer"),
       gameCanvas: document.getElementById("gameCanvas"),
       gameLevelClasses: [MansionLevel2]
   }
   // Launch Mansion Game using the central core and mansion GameControl
   Core.main(environment, GameControl);
</script>
