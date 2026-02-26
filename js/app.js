Cesium.Ion.defaultAccessToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4OWFkNmViZS0yMmYyLTQ2NzItODVlZS0xMGU3MDI0YWFhMjIiLCJpZCI6Mzk0OTM3LCJpYXQiOjE3NzIxMjI0ODR9.P6QY5KViwgQHWPiPI3aFH2zShJWER_kIAKWxdptk8YM';

var viewer=new Cesium.Viewer('cesiumContainer',{
animation:false,
timeline:false,
terrainProvider:new Cesium.EllipsoidTerrainProvider()
});

/* Fusion datasource */
const fusionDS=new Cesium.CustomDataSource("fusion");
viewer.dataSources.add(fusionDS);

/* AI anomaly score */
function scoreAnomaly(mag,type){
let score=mag*10;
if(type==="aircraft") score+=20;
if(type==="ship") score+=10;
return score;
}

/* EARTHQUAKES */
fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson")
.then(r=>r.json())
.then(data=>{
data.features.slice(0,60).forEach(eq=>{
const c=eq.geometry.coordinates;
const mag=eq.properties.mag||0;
const score=scoreAnomaly(mag,"quake");

fusionDS.entities.add({
position:Cesium.Cartesian3.fromDegrees(c[0],c[1]),
point:{pixelSize:6,color:Cesium.Color.RED},
description:`Quake<br>Mag:${mag}<br>Score:${score}`
});
});
});

/* AIRCRAFT (demo random simulation) */
setInterval(()=>{
let lon=Math.random()*360-180;
let lat=Math.random()*180-90;
fusionDS.entities.add({
position:Cesium.Cartesian3.fromDegrees(lon,lat),
point:{pixelSize:4,color:Cesium.Color.CYAN},
description:"Aircraft anomaly"
});
},4000);

/* SHIP AIS (demo simulation) */
setInterval(()=>{
let lon=Math.random()*360-180;
let lat=Math.random()*180-90;
fusionDS.entities.add({
position:Cesium.Cartesian3.fromDegrees(lon,lat),
point:{pixelSize:4,color:Cesium.Color.BLUE},
description:"Ship anomaly"
});
},5000);

/* HEATMAP style pulse */
fusionDS.entities.values.forEach(e=>{
e.point.scaleByDistance=new Cesium.NearFarScalar(1e2,2.0,1e7,0.5);
});

/* THREAT LEVEL */
let threat=document.querySelector(".danger");
setInterval(()=>{
let lvl=Math.random();
if(lvl>0.7) threat.innerHTML="● THREAT LEVEL: HIGH";
else if(lvl>0.4) threat.innerHTML="● THREAT LEVEL: MEDIUM";
else threat.innerHTML="● THREAT LEVEL: LOW";
},5000);