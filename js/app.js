Cesium.Ion.defaultAccessToken = 'PASTE_TOKEN_HERE';

var viewer = new Cesium.Viewer('cesiumContainer',{
animation:true,
timeline:true,
baseLayerPicker:true,
terrainProvider:new Cesium.EllipsoidTerrainProvider()
});

let alertBox=document.getElementById("alerts");
let stats=document.getElementById("stats");
let count=0;

fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson")
.then(res=>res.json())
.then(data=>{

data.features.forEach(eq=>{

count++;
stats.innerHTML="Anomalies: "+count;

const coords=eq.geometry.coordinates;
const mag=eq.properties.mag||0;

let color=Cesium.Color.YELLOW;
if(mag>4) color=Cesium.Color.ORANGE;
if(mag>6) color=Cesium.Color.RED;

// main marker
viewer.entities.add({
position:Cesium.Cartesian3.fromDegrees(coords[0],coords[1]),
point:{pixelSize:8,color:color,outlineColor:Cesium.Color.WHITE,outlineWidth:1},
description:`<b>${eq.properties.place}</b><br>Magnitude: ${mag}`
});

// anomaly ring
viewer.entities.add({
position:Cesium.Cartesian3.fromDegrees(coords[0],coords[1]),
ellipse:{semiMinorAxis:20000,semiMajorAxis:20000,material:color.withAlpha(0.3)}
});

// radar stripe
viewer.entities.add({
position:Cesium.Cartesian3.fromDegrees(coords[0],coords[1]),
ellipse:{
semiMinorAxis:50000,
semiMajorAxis:50000,
material:new Cesium.StripeMaterialProperty({
evenColor:color.withAlpha(0.4),
oddColor:Cesium.Color.TRANSPARENT,
repeat:1
})
}
});

// pulse
viewer.entities.add({
position:Cesium.Cartesian3.fromDegrees(coords[0],coords[1]),
ellipse:{
semiMinorAxis:new Cesium.CallbackProperty(()=>20000+(Date.now()%2000)*20,false),
semiMajorAxis:new Cesium.CallbackProperty(()=>20000+(Date.now()%2000)*20,false),
material:color.withAlpha(0.2)
}
});

// alert UI
if(mag>4){
let div=document.createElement("div");
div.className="alert";
div.innerHTML=`<b>${eq.properties.place}</b><br>Mag: ${mag}`;
alertBox.prepend(div);
}

});

// focus biggest quake
const biggest=data.features.reduce((a,b)=>
(a.properties.mag||0)>(b.properties.mag||0)?a:b);

const bc=biggest.geometry.coordinates;
viewer.camera.flyTo({
destination:Cesium.Cartesian3.fromDegrees(bc[0],bc[1],2000000)
});

});