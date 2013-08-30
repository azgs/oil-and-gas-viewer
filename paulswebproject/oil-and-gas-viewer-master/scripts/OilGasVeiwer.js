dojo.require("esri.map");
	dojo.require("esri.tasks.query");
	dojo.require("esri.tasks.find");
	dojo.require("esri.tasks.FindParameters");
	dojo.require("esri.dijit.Legend");
	dojo.require("esri.dijit.Scalebar");
	dojo.require("esri.toolbars.draw");
    dojo.require("esri.layers.FeatureLayer");
    dojo.require("dojox.grid.DataGrid");
    dojo.require("dojo.data.ItemFileReadStore");
    dojo.require("dijit.layout.BorderContainer");
    dojo.require("dijit.layout.ContentPane");
	dojo.require("esri.dijit.OverviewMap");
	//dojo.require("dgrid.OnDemandGrid");
    dojo.require("dojo.store.Memory");
	
	//var grid;
	var findParams;
	
    function init() {
	
	
	
      var map = new esri.Map("map", { 
        basemap: "topo",
        center: [-111.3877, 34.5],
        zoom: 7
      });
	  
      //Mouse listener for coords
	  map.on("load", function(){
          //after map loads, connect to listen to mouse move & drag events
          map.on("mouse-move", showCoordinates);
         // map.on("mouse-drag", showCoordinates);

        });
		
	
	  var scalebar = new esri.dijit.Scalebar({
          map: map,
          scalebarUnit: "english"
        }, dojo.byId("scalebar"));

		//Overview Map
      map.on("load", function(){
          //add the overview map 
          var overviewMapDijit = new esri.dijit.OverviewMap({
            map: map,
            visible: false
          });
          overviewMapDijit.startup();
        });
	  
      var fieldsSelectionSymbol = new esri.symbol.SimpleMarkerSymbol().setColor("red");

	  //var link = '<a href='+ x + ' target="_blank">' + x + '</a>';
      //Popup window settings
      var content = "<b>API Number</b>: ${apino}"  +
					"<br><b>State Permit Number</b>: ${otherid}"  +
					"<br><b>Operator</b>: ${wellname}" +
					"<br><b>County</b>: ${county}" +
					"<br><b>Township-Range, Section </b>: T${twp}-R${rge}, Sec. ${section_}" +
					"<br><b>Total Depth</b>: ${drillertotaldepth} ft" +
					"<br><b>Formation</b>: ${formationtd}" +
					"<br><b>Download Well Folders </b>: <a href=\"${headeruri}\" target='_blank'> PDF </a>" +
					"<br><b>Download Scanned Well Logs </b>: <a href=\"${headeruri}\" target='_blank'> TIFF </a>" +
					"<br><b>Download LAS Data</b>: <a href=\"${headeruri.split('|')}\" target='_blank'> LAS </a>";						
      var infoTemplate = new esri.InfoTemplate("Well Info", content);
	  
		//esri.InfoTemplate("Title", function (feature) {
		//	return feature.apino;
		//});
	  
	  sect = new esri.layers.ArcGISDynamicMapServiceLayer("http://services.azgs.az.gov/ArcGIS/rest/services/baselayers/ArizonaPLSS/MapServer/", {
        mode:  esri.layers.FeatureLayer.MODE_ONDEMAND,
        outFields:["*"]
      });	
	 
	  
	  wellFeatureLayer = new esri.layers.FeatureLayer("http://services.azgs.az.gov/ArcGIS/rest/services/aasggeothermal/AZWellHeaders/MapServer/0",{
        mode: esri.layers.FeatureLayer.MODE_ONDEMAND, //data on demand
        infoTemplate: infoTemplate,
        outFields: ["*"]
      });
	  
	  wellFeatureLayer.setDefinitionExpression("welltype IN ('Gas','Geothermal','O&Gexplor','GasStorage')");
	  
	  //Controls what the select and clear buttons do
	  wellFeatureLayer.setSelectionSymbol(fieldsSelectionSymbol);
     
	  //add the legend
      dojo.connect(map, 'onLayersAddResult', function (results) {
		var layerInfo = dojo.map(results, function (layer, index) {
          return {layer:layer.layer, title:layer.layer.name};
        });
        if (layerInfo.length > 0) {
          var legendDijit = new esri.dijit.Legend({
            map :map,

            layerInfos:layerInfo
          }, "legendDiv");
          legendDijit.startup();
        }
      });
	  
      map.addLayers([sect, wellFeatureLayer]);
	  
	  dojo.connect(map, "onLoad", initSelectToolbar);
	  
	 
	 //findTask = new esri.tasks.FindTask(wellFeatureLayer);
	findTask = new esri.tasks.FindTask("http://services.azgs.az.gov/ArcGIS/rest/services/aasggeothermal/AZWellHeaders/MapServer");

	  //dojo.connect(map, "onLoad", function() {
	findParams = new esri.tasks.FindParameters();
	findParams.returnGeometry = true;
	findParams.searchFields = ["apino"];
	findParams.outSpatialReference = map.spatialReference;
    //});

	}
	//Pointer Coordinates
	function showCoordinates(evt) {
        //get mapPoint from event
        //The map is in web mercator - modify the map point to display the results in geographic
        var mp = esri.geometry.webMercatorToGeographic(evt.mapPoint);
        //display mouse coordinates
        dojo.byId("info").innerHTML ="Cursor Coordinates:<br>" + "Long. " + mp.x.toFixed(3) + ", " + "Lat. " + mp.y.toFixed(3);
      }
	
	//Listens for selection box and initializes the buttons
    function initSelectToolbar(map) {
      selectionToolbar = new esri.toolbars.Draw(map); //creates toolbar
      var selectQuery = new esri.tasks.Query();
	  
	  
      //Selects data once box is drawn
      dojo.connect(selectionToolbar, "onDrawEnd", function(geometry) {
        selectionToolbar.deactivate();
        selectQuery.geometry = geometry;
		
        wellFeatureLayer.selectFeatures(selectQuery, esri.layers.FeatureLayer.SELECTION_NEW, function (featureSet) {
			updateGrid(featureSet);
		//window.alert("Me!");
		});
		
		});
			
    }
	//apino = document.getElementById("email").select();
	function apiSearch(){
		findParams.searchText = dojo.byId("textSearch").value;
		findTask.execute(findParams, updateGrid);
	}
	
	function folderFormatter(x) {
		//x is the value
		var link = '<a href='+ x + ' target="_blank">' + x + '</a>';
		return link;
	}

	function logFormatter(x) {
		//x is the value
		var link = '<a href='+ x + ' target="_blank">' + x + '</a>';
		return link;
	}

	function lasFormatter(x) {
		//x is the value
		var link = '<a href='+ x + ' target="_blank">' + x + '</a>';
		return link;
	}
	
	function updateGrid(featureSet){
		
		var data=[];
		var grid = dijit.byId('grid');
		dojo.forEach(featureSet, function (entry) {
			var logs = [], 
				las = [], 
				folders = [],
				relatedResource = entry.attributes.relatedresource === null ? "no value" : entry.attributes.relatedresource;
				
				
				//relatedResource = entry.attributes.relatedresource || "";
				//if (entry.attributes.relatedresource === null) {
				//}
			//if ( relatedResource.length >=4){
			
			
			var raw = relatedResource.split("|");
			raw.forEach(function (bit){
				var resource = bit.split(", ");
				if (resource[0] && resource[1]){
				var url = resource[1].trim();
				var name = resource[0].trim();
				}
				var anchor = "<li><a href='" + url + "' target='_blank'>" + name + "</a></li>";
				if (url != null ){
				if ( url.indexOf(".tif", url.length -4) !==-1){
					logs.push(anchor);
				}
				if ( url.indexOf(".pdf", url.length -4) !==-1){
					folders.push(anchor);
				} 
				if ( url.indexOf(".las", url.length -4) !==-1){
					las.push(anchor);
				}
				}
			});
			//}
			data.push({
				objectid:entry.attributes.objectid,//0
				apino:entry.attributes.apino,//1
				otherid:entry.attributes.otherid,//2
				wellname:entry.attributes.wellname,//3
				county:entry.attributes.county,//4
				twp:entry.attributes.twp,//5
				rge:entry.attributes.rge,//6
				//headeruri:entry.attributes.headeruri,//7
				section_:entry.attributes.section_,//8
				drillertotaldepth:entry.attributes.drillertotaldepth,//9
				formationtd:entry.attributes.formationtd,//10
				wellname:entry.attributes.wellname,//11
				logField: '<ul>' + logs.join(" ") + '</ul>',
				lasField: '<ul>' + las.join(" ") + '</ul>',
				folderField: '<ul>' + folders.join(" ") + '</ul>'
			});

		});
		var dataForGrid= {
			items: data
			};

		var store = new dojo.data.ItemFileReadStore({data:dataForGrid});
		grid.setStore(store);
	}
	
	

    dojo.ready(init);