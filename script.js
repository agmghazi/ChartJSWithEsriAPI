//Please go to the following jsbin for a working sample: https://jsbin.com/nejolahicu/1/edit?html,js,output
//Depending on server load, it may take awhile for the feature layer to load and be displayed on the map. 
require([
    "esri/Map",
    "esri/views/MapView",
    "esri/PopupTemplate",
    "esri/layers/FeatureLayer",
    "esri/widgets/Popup",
    "esri/tasks/support/Query",
    "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.2/Chart.js",
    "dojo/domReady!"
  ],
  function (Map, MapView, PopupTemplate, FeatureLayer, Popup, Query, Chart) {

    var featureLayerRenderer = {
      type: "simple",  
      symbol: {
        type: "simple-fill",  
        style: "solid",
        color: "white",
      }
    };

    var featureLayer = new FeatureLayer({
      url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/2",
      definitionExpression: "STATE_NAME = 'California'",
      renderer: featureLayerRenderer,
      visible: true
    });

    var map = new Map({
      basemap: "dark-gray",
      layers: [featureLayer]
    });

    var view = new MapView({
      container: "viewDiv",
      map: map,
      center: [-117.1825, 34.0556],
      zoom: 5,
      popup: {
        dockEnabled: true,
        visible: false,
        dockOptions: {
          buttonEnabled: true,
          breakpoint: false,
          position: "auto"
        }
      }
    });

    // Create a query to get data from the feature layer
    var query = new Query();
    query.returnGeometry = true;
    query.outFields = ["STATE_NAME", "WHITE", "BLACK", "ASIAN", "HAWN_PI", "OTHER", "HISPANIC"];
    query.where = "1=1";
    query.num = 50;

    // On view click, query the feature layer and pass the results to setContentInfo function.
    view.on("click", (e) => {
      query.geometry = e.mapPoint;
      featureLayer.queryFeatures(query).then((results) =>{
        if(results.features[0].attributes.STATE_NAME === "California"){
          view.popup.visible = true;
          view.popup.open({
              title: "Doughnut Graph Example",
              content: setContentInfo(results.features[0].attributes)
          });
        }
      });
    });

  // Using the data from the feature layer, create a doughnut graph.
  function setContentInfo(results){
    // Create a new canvas element, this is where the graph will be placed.
    var canvas = document.createElement('canvas');
    canvas.id = "myChart";
    
    // Create a data object, this will include the data from the feature layer and other information like color or labels.
    var data = {
      datasets:[{
        data: [results.ASIAN, results.BLACK, results.HAWN_PI, results.HISPANIC, results.OTHER, results.WHITE],
        backgroundColor: ["#4286f4", "#41f4be", "#8b41f4", "#e241f4", "#f44185", "#f4cd41"]
      }],
      labels: [
        'Asian',
        'Black',
        'Hawaiian',
        'Hispanic',
        'Other',
        'White'
      ]
    };

    // Create a new Chart and hook it to the canvas and then return the canvas.
    var myPieChart = new Chart(canvas,{
      type: 'doughnut',
      data: data
  });
		
  return canvas;
  }
});