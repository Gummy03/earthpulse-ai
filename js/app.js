Cesium.Ion.defaultAccessToken = 'PASTE_TOKEN_HERE';

var viewer = new Cesium.Viewer('cesiumContainer',{
animation:true,
timeline:true,
baseLayerPicker:true,
terrainProvider:new Cesium.EllipsoidTerrainProvider()
});

/* PERFORMANCE MODE */
viewer.scene.requestRenderMode = true;
viewer.scene.maximumRenderTimeChange = Infinity;

let alertBox=document.getElementById("alerts");
let stats=document.getElementById("stats");
let count=0;

fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson")
.then(res=>res.json())
.then(data=>{

/* SORT + LIMIT strongest anomalies (performance boost) */
const quakes=data.features
.sort((a,b)=>(b.properties.mag||0)-(a.properties.mag||0))
.slice(0,60);

quakes.forEach(eq=>{

count++;
if(stats) stats.innerHTML="Anomalies: "+count;

const coords=eq.geometry.coordinates;
const mag=eq.properties.mag||0;

/* magnitude color */
let color=Cesium.Color.YELLOW;
if(mag>4) color=Cesium.Color.ORANGE;
if(mag>6) color=Cesium.Color.RED;

/* main marker */
viewer.entities.add({
position:Cesium.Cartesian3.fromDegrees(coords[0],coords[1]),
point:{
pixelSize:6,
color:color,
outlineColor:Cesium.Color.WHITE,
outlineWidth:1
},
description:`<b>${eq.properties.place}</b><br>Magnitude: ${mag}`
});

/* anomaly ring */
viewer.entities.add({
position:Cesium.Cartesian3.fromDegrees(coords[0],coords[1]),
ellipse:{
semiMinorAxis:20000,
semiMajorAxis:20000,
material:color.withAlpha(0.25)
}
});

/* radar stripe only strong quakes */
if(mag>5){
viewer.entities.add({
position:Cesium.Cartesian3.fromDegrees(coords[0],coords[1]),
ellipse:{
semiMinorAxis:50000,
semiMajorAxis:50000,
material:new Cesium.StripeMaterialProperty({
evenColor:color.withAlpha(0.35),
oddColor:Cesium.Color.TRANSPARENT,
repeat:1
})
}
});
}

/* pulse only medium+ quakes */
if(mag>4){
viewer.entities.add({
position:Cesium.Cartesian3.fromDegrees(coords[0],coords[1]),
ellipse:{
semiMinorAxis:new Cesium.CallbackProperty(()=>20000+(Date.now()%2000)*20,false),
semiMajorAxis:new Cesium.CallbackProperty(()=>20000+(Date.now()%2000)*20,false),
material:color.withAlpha(0.15)
}
});
}

/* alert UI */
if(mag>4 && alertBox){
let div=document.createElement("div");
div.className="alert";
div.innerHTML=`<b>${eq.properties.place}</b><br>Mag: ${mag}`;
alertBox.prepend(div);
}

});

/* auto focus biggest quake */
const biggest=quakes[0];
const bc=biggest.geometry.coordinates;
viewer.camera.flyTo({
destination:Cesium.Cartesian3.fromDegrees(bc[0],bc[1],2000000)
});

});