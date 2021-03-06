
dojo.require("dojox.grid.DataGrid");


require(["dojo/data/ObjectStore",
    "dijit/registry",
    "dojo/store/Memory",
    "dojox/grid/DataGrid",

    "dojo/ready",
    "esri/tasks/query",
    "esri/tasks/QueryTask",

    "dojo/dom",
    "dojo/on",
    "dojo/_base/array",

    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",

    "dojo/domReady!"],
function(ObjectStore,
         registry,
         Memory,
         DataGrid,
         ready,
         Query,
         QueryTask,
         dom,
         on,
         array){
    ready(function(){

    var myQueryTask, myQuery;
    myQueryTask = new QueryTask("http://services.azgs.az.gov/ArcGIS/rest/services/aasggeothermal/AZWellHeaders/MapServer/0");
    myQuery = new Query();
    myQuery.returnGeometry = false;
    myQuery.outFields = ["apino","otherid","wellname","operator","county","twp","rge","section_","drillertotaldepth","formationtd","field","relatedresource","welltype"];




        function apiQuery(){
            var apiNo = dom.byId('apinum').value;
            myQuery.where ="apino like '%" + apiNo + "%'";
            myQueryTask.execute(myQuery,updateGrid);
        }
        function stPerQuery(){
            var otherId = dom.byId('stateperm').value;
            myQuery.where ="otherid like '%" + otherId + "%'" + " AND " +"apino like '02-%'";
            myQueryTask.execute(myQuery,updateGrid);
        }
        function countQuery(){
            var county = dom.byId('countyid').value;
            myQuery.where ="county like '%" + county+ "%'" + " AND " +"apino like '02-%'";
            myQueryTask.execute(myQuery,updateGrid);
        }
        function fieldQuery(){
            var field = dom.byId('fieldid').value;
            myQuery.where ="field like '%" + field + "%'" + " AND " +"apino like '02-%'";
            myQueryTask.execute(myQuery,updateGrid);
        }
        function twnQuery(){
            var twp = dom.byId('twpid').value;
            myQuery.where ="twp like '%" + twp + "%'" + " AND " +"apino like '02-%'";
            myQueryTask.execute(myQuery,updateGrid);
        }
        function rgeQuery(){
            var rge = dom.byId('rgeid').value;
            myQuery.where ="rge like '%" + rge + "%'" + " AND " +"apino like '02-%'";
            myQueryTask.execute(myQuery,updateGrid);
        }
        function sectQuery(){
            var section = dom.byId('sectionid').value;
            myQuery.where ="section_ like '%" + section + "%'" + " AND " +"apino like '02-%'";
            myQueryTask.execute(myQuery,updateGrid);
        }
        function operQuery(){
            var operator = dom.byId('operatorid').value;
            myQuery.where ="Lower(operator) like '%" + operator.toLowerCase() + "%'" + " AND " +"apino like '02-%'";
            myQueryTask.execute(myQuery,updateGrid);
        }
        function wellNaQuery(){
            var wellName = dom.byId('wellnameid').value;
            myQuery.where ="Lower(wellname) like '%" + wellName.toLowerCase() + "%'" + " AND " +"apino like '02-%'";
            myQueryTask.execute(myQuery,updateGrid);
        }
        function depthQuery(){
            var drillerDepth = dom.byId('depthid').value;
            myQuery.where ="drillertotaldepth >=" + drillerDepth + " AND " +"apino like '02-%'";
            myQueryTask.execute(myQuery,updateGrid);
        }
        function formQuery(){
            var formation = dom.byId('formationtdid').value;
            myQuery.where ="Lower(formationtd) like '%" + formation.toLowerCase() + "%'" + " AND " +"apino like '02-%'";
            myQueryTask.execute(myQuery,updateGrid);
        }


function showResults(myFeatures){
    console.log(myFeatures);
    var s = "";
          for (var i=0, il=myFeatures.features.length; i < il; i++) {
            var featureAttributes = myFeatures.features[i].attributes;
            for (att in featureAttributes) {
              s = s + "<strong>" + att + ": </strong>" + featureAttributes[att] + "<br />";
            }
          }
          dojo.byId("info").innerHTML = s;

}

function updateGrid(featureSet){
        console.log("1");
        var data=[];
        var grid = registry.byId('grid');
        array.forEach(featureSet.features, function (entry) {

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
                wellname:entry.attributes.wellname,//3
                operator:entry.attributes.operator,
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
console.log(data);
        var store = new ObjectStore({objectStore: new Memory({data:dataForGrid}) });
        grid.setStore(store);
    }
    on(dom.byId("executeApi"), "click", apiQuery);
    on(dom.byId("executeSP"), "click", stPerQuery);
    on(dom.byId("executeCount"), "click", countQuery);
    on(dom.byId("executeField"), "click", fieldQuery);
    on(dom.byId("executePLSS"), "click", twnQuery);
    on(dom.byId("executeOper"), "click", operQuery);
    on(dom.byId("executeWellN"), "click", wellNaQuery);
    on(dom.byId("executeDepth"), "click", depthQuery);
    on(dom.byId("executeForm"), "click", formQuery);

    });
});
