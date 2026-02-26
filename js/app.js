Cesium.Ion.defaultAccessToken = 'PASTE_TOKEN';

var viewer = new Cesium.Viewer('cesiumContainer', {
animation: true,
timeline: true,
baseLayerPicker: true,
terrainProvider: new Cesium.EllipsoidTerrainProvider()
});

fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson")
.then(res => res.json())
.then(data => {

data.features.forEach(eq => {

const coords = eq.geometry.coordinates;
const mag = eq.properties.mag || 0;

let color = Cesium.Color.YELLOW;
if(mag > 4) color = Cesium.Color.ORANGE;
if(mag > 6) color = Cesium.Color.RED;

// main anomaly point
viewer.entities.add({
position: Cesium.Cartesian3.fromDegrees(coords[0], coords[1]),
point:{
pixelSize:8,
color:color,
outlineColor:Cesium.Color.WHITE,
outlineWidth:1
},
description:`<b>${eq.properties.place}</b><br>Magnitude: ${mag}`
});

// radar ring
viewer.entities.add({
position: Cesium.Cartesian3.fromDegrees(coords[0], coords[1]),
ellipse:{
semiMinorAxis:20000,
semiMajorAxis:20000,
material:color.withAlpha(0.3),
height:0
}
});

});

// camera focus on biggest quake
const biggest = data.features.reduce((a,b)=>
(a.properties.mag||0)>(b.properties.mag||0)?a:b);

const bc = biggest.geometry.coordinates;
viewer.camera.flyTo({
destination: Cesium.Cartesian3.fromDegrees(bc[0], bc[1], 2000000)
});

});