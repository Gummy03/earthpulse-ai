Cesium.Ion.defaultAccessToken = 'PASTE_TOKEN_HERE';

var viewer = new Cesium.Viewer('cesiumContainer',{
animation:false,
timeline:false,
baseLayerPicker:true,
terrainProvider:new Cesium.EllipsoidTerrainProvider()
});

/* PERFORMANCE MODE */
viewer.scene.requestRenderMode = true;
viewer.scene.maximumRenderTimeChange = Infinity;

/* entity collection for clustering */
const dataSource = new Cesium.CustomDataSource("quakes");
viewer.dataSources.add(dataSource);

/* clustering */
dataSource.clustering.enabled = true;
dataSource.clustering.pixelRange = 40;
dataSource.clustering.minimumClusterSize = 3;

let alertBox=document.getElementById("alerts");
let stats=document.getElementById("stats");
let count=0;

fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson")
.then(res=>res.json())
.then(data=>{

/* SORT strongest first */
const quakes=data.features
.sort((a,b)=>(b.properties.mag||0)-(a.properties.mag||0))
.slice(0,120); // safe limit

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
dataSource.entities.add({
position:Cesium.Cartesian3.fromDegrees(coords[0],coords[1]),
point:{
pixelSize:5,
color:color,
outlineColor:Cesium.Color.WHITE,
outlineWidth:1,
scaleByDistance:new Cesium.NearFarScalar(1e2,2.0,1e7,0.5)
},
description:`<b>${eq.properties.place}</b><br>Magnitude: ${mag}`
});

/* only strong quakes get animation */
if(mag>5){

dataSource.entities.add({
position:Cesium.Cartesian3.fromDegrees(coords[0],coords[1]),
ellipse:{
semiMinorAxis:20000,
semiMajorAxis:20000,
material:color.withAlpha(0.2)
}
});

/* pulse optimized */
dataSource.entities.add({
position:Cesium.Cartesian3.fromDegrees(coords[0],coords[1]),
ellipse:{
semiMinorAxis:new Cesium.CallbackProperty(()=>20000+(Date.now()%2000)*10,false),
semiMajorAxis:new Cesium.CallbackProperty(()=>20000+(Date.now()%2000)*10,false),
material:color.withAlpha(0.15)
}
});

}

/* alert UI only strong */
if(mag>5 && alertBox){
let div=document.createElement("div");
div.className="alert";
div.innerHTML=`<b>${eq.properties.place}</b><br>Mag: ${mag}`;
alertBox.prepend(div);
}

});

/* focus biggest quake */
const biggest=quakes[0];
const bc=biggest.geometry.coordinates;
viewer.camera.flyTo({
destination:Cesium.Cartesian3.fromDegrees(bc[0],bc[1],2000000)
});

});

/* camera distance optimization */
viewer.camera.changed.addEventListener(()=>{
const height=viewer.camera.positionCartographic.height;

/* zoomed out → hide animations */
if(height>5000000){
dataSource.entities.values.forEach(e=>{
if(e.ellipse) e.show=false;
});
}else{
dataSource.entities.values.forEach(e=>{
if(e.ellipse) e.show=true;
});
}
});