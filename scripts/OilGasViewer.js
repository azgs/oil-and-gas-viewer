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
    dojo.require("dojo.store.Memory");
    dojo.require("esri.geometry.Extent");

    var findParams,map;

    function init() {

      map = new esri.Map("map", {
        basemap: "topo",
        center: [-111.3877, 34.5],
        zoom: 7
      });

      //Mouse listener for coords
      map.on("load", function(){
          //after map loads, connect to listen to mouse move & drag events
          map.on("mouse-move", showCoordinates);


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

      //Popup window settings
      var content = "<b>API Number</b>: ${apino}"  +
                    "<br><b>State Permit Number</b>: ${otherid}"  +
                    "<br><b>Well Name</b>: ${wellname}" +
                    "<br><b>Operator</b>: ${operator}" +
                    "<br><b>County</b>: ${county}" +
                    "<br><b>Township-Range, Section </b>: T${twp}-R${rge}, Sec. ${section_}" +
                    "<br><b>Total Depth</b>: ${drillertotaldepth} ft" +
                    "<br><b>Formation</b>: ${formationtd}" +
                    "<br><b>Download Well Folders </b>: ${relatedresource:folderInfo}" +
                    "<br><b>Download Scanned Well Logs </b>: ${relatedresource:logInfo}" +
                    "<br><b>Download LAS Data</b>: ${relatedresource:lasInfo}";
      var infoTemplate = new esri.InfoTemplate("Well Info", content);


      sect = new esri.layers.ArcGISDynamicMapServiceLayer("http://services.azgs.az.gov/ArcGIS/rest/services/baselayers/ArizonaPLSS/MapServer/", {
        mode:  esri.layers.FeatureLayer.MODE_ONDEMAND,
        outFields:["*"]
      });


      wellFeatureLayer = new esri.layers.FeatureLayer("http://services.azgs.az.gov/ArcGIS/rest/services/baselayers/AZWellHeaders/MapServer/0",{
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



    findTask = new esri.tasks.FindTask("http://services.azgs.az.gov/ArcGIS/rest/services/aasggeothermal/AZWellHeaders/MapServer");


    findParams = new esri.tasks.FindParameters();
    findParams.returnGeometry = true;
    findParams.layerIds = [0];
    findParams.searchFields = ["apino"];
    findParams.outSpatialReference = map.spatialReference;


    }

    function lasInfo(data){
        var lasData = [];
        var lasRR = data === null ? "no value" : data;
        var lasRaw = lasRR.split("|");
        lasRaw.forEach(function(lasBit){
            var lasResource = lasBit.split(",");
            if (lasResource[0]&&lasResource[1]){
                var lasUrl = lasResource[1].trim();
                var lasName = lasResource[0].trim();
                }
                var anchor = "<a href='" + lasUrl + "' target='_blank'>" + " " + lasName + "</a>";
                if (lasUrl != null ){
                //if ( lasUrl.indexOf(".tif", url.length -4) !==-1){
                    //logs.push(anchor);
                //}
                //if ( lasUrl.indexOf(".pdf", url.length -4) !==-1){
                    //folders.push(anchor);
                //}
                if ( lasUrl.indexOf(".las", lasUrl.length -4) !==-1){
                    lasData.push(anchor);
                }
                }
        });
    return lasData;
    }

    function folderInfo(data){
        var folderData = [];
        var folderRR = data === null ? "no value" : data;
        var folderRaw = folderRR.split("|");
        folderRaw.forEach(function(folderBit){
            var folderResource = folderBit.split(",");
            if (folderResource[0]&&folderResource[1]){
                var folderUrl = folderResource[1].trim();
                var folderName = folderResource[0].trim();
                }
                var anchor = "<a href='" + folderUrl + "' target='_blank'>" + " " + folderName + "</a>";
                if (folderUrl != null ){
                //if ( folderUrl.indexOf(".tif", url.length -4) !==-1){
                    //logs.push(anchor);
                //}
                if ( folderUrl.indexOf(".pdf", folderUrl.length -4) !==-1){
                    folderData.push(anchor);
                }
                //if ( folderUrl.indexOf(".las", folderUrl.length -4) !==-1){
                //	folderData.push(anchor);
                //}
                }
        });
    return folderData;
    }

    function logInfo(data){
        var logData = [];
        var logRR = data === null ? "no value" : data;
        var logRaw = logRR.split("|");
        logRaw.forEach(function(logBit){
            var logResource = logBit.split(",");
            if (logResource[0]&&logResource[1]){
                var logUrl = logResource[1].trim();
                var logName = logResource[0].trim();
                }
                var anchor = "<a href='" + logUrl + "' target='_blank'>" + " " + logName + "</a>";
                if (logUrl != null ){
                if ( logUrl.indexOf(".tif", logUrl.length -4) !==-1){
                    logData.push(anchor);
                }

                }
        });
    return logData;
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
        });
      });
    }

    /*function showResults(results){
        //map.graphics.clear();
        var resultSym = new esri.symbol.SimpleMarkerSymbol().setColor("blue");
    }*/
//Text search on the map
    /*function apiSearch(){
        //var selectionSymbol = new esri.symbol.SimpleMarkerSymbol().setColor("red");
        findParams.searchText = dojo.byId("textSearch").value;
        findTask.execute(findParams, updateGrid);
    }*/


    function updateGrid(featureSet){
        console.log(featureSet);
        var data=[];
        var grid = dijit.byId('grid');
        dojo.forEach(featureSet, function (entry) {
            //if related geographic then related = entry.att.related
            // else api search related= entry.feature.att.related
           // console.log(entry);
            var logs = [],
                las = [],
                folders = [],
                relatedResource = entry.attributes.relatedresource === null ? "no value" : entry.attributes.relatedresource;


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

            data.push({
                objectid:entry.attributes.objectid,//0
                apino:entry.attributes.apino,//1
                otherid:entry.attributes.otherid,//2
                wellname:entry.attributes.wellname,
                operator:entry.attributes.operator,//3
                county:entry.attributes.county,//4
                twp:entry.attributes.twp,//5
                rge:entry.attributes.rge,//6
                section_:entry.attributes.section_,//8
                drillertotaldepth:entry.attributes.drillertotaldepth,//9
                formationtd:entry.attributes.formationtd,//10
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
    //Zoom to Points
    function makeZoomButton(id){//id is objectid
        var zBtn = "<div data-dojo-type='dijit.form.Button'><img src='photos/bg_magnify.png'";
        zBtn = zBtn + " width='18' height='18'";
        zBtn = zBtn + " onClick=\"zoomRow('"+id+"')\"></div>"; //activates zoomRow function
        return zBtn;
      }
    //Zoom to points
    function zoomRow(id){
        var grid = dijit.byId('grid');
        var clickedWell = grid.getItem(id);
        var selectedWell = map.graphics;
        console.log(map.graphics.graphics);
        var distance = 100;
        var newExtent = new esri.geometry.Extent({
            "xmin": selectedWell.x - distance,
            "ymin": selectedWell.y - distance,
            "xmax": selectedWell.x + distance,
            "ymax": selectedWell.y + distance,
            "spatialReference":{"wkid":102100}
        });

        dojo.forEach(map.graphics.graphics,function(graphic){
            console.log(graphic);
          if((graphic.attributes) && graphic.attributes.FID === clickedWell.FID){
            selectedWell = graphic;
            return;
          }
        });

        map.setExtent(newExtent);
        //var wellExtent = selectedWell.geometry.getExtent();
        //selectionLayer.clear();
       // var wellExtent = featureLayer[0].geometry.getExtent().expand(5.0);
        //map.setExtent(wellExtent);
    }

/*
    //Zoom to points
    function zoomRow(id) {
        //console.log(id);
        var distance = 500;
        var newExtent = new esri.geometry.Extent({
            "xmin": pnt.x - distance,
            "ymin": pnt.y - distance,
            "xmax": pnt.x + distance,
            "ymax": pnt.y + distance,
            "spatialReference":{"wkid":4326}
        });

      dojo.some(wellFeatureLayer.graphic,function(graphic){
        if (graphic.attributes.ObjectID.toString() === id) {
        console.log(graphic.attributes);
          var selectedWell = new esri.Graphic(graphic.geometry).setAttributes(
              graphic.attributes);
          selectionLayer.add(selectedWell);
          var wellExtent = selectedWell.geometry.getExtent().expand(5.0);
          map.setExtent(wellExtent);
          return true;
        }
      });
    }*/

    /*function zoomExtent(){
        var initExtent = new esri.geometry.Extent(-118.644,30.872,-104.142,37.986,new esri.SpatialReference({"wkid":4326}));
        map.setExtent(initExtent);
    }*/

    dojo.ready(init);