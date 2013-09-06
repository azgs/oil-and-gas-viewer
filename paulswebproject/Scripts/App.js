

//dojo.require("esri.tasks.query");
//dojo.require("esri.map");
//dojo.require("dojo.data.ItemFileReadStore");
// dojo.require("dojo.store.Memory");
//dojo.require("esri.layers.FeatureLayer");
//dojo.require("dojox.grid.DataGrid");
// dojo.require("dijit.layout.BorderContainer");
//dojo.require("dijit.layout.ContentPane");



var queryTask, query;
require([
    "esri/tasks/query", "esri/tasks/QueryTask",
    "dojo/dom", "dojo/on", "dojo/domReady!",
    "dojo/store/Memory", "dojo/data/ItemFileReadStore",
    "dojox/grid//DataGrid", "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane"
], function (Query, QueryTask, dom, on) {
    queryTask = new QueryTask("http://services.azgs.az.gov/ArcGIS/rest/services/aasggeothermal/AZWellHeaders/MapServer/0");


    query = new Query();
    query.returnGeometry = false;
    query.outFields = ["apino", "operator", "wellname", "drillertotaldepth", "county", "twp", "rge", "section_", "formationtd", "otherid"];

    on(dom.byId("execute"), "click", execute);

    function execute() {
        //query.text = dom.byId("apinum","operatorid","wellnameid","statusid","fieldid","countyid","twpid","rgeid","sectionid","formationtdid","stateperm").value;
        query.text = dom.byId("countyid").value;
        //execute query
        queryTask.execute(query, updateGrid(featureSet));
    }

    /*function execute() {
     var whereclause = "apino = 02-001-05159";

     function addToWhereClause(inputEleId, fieldName) {
     var content = dom.byId(inputEleId).value;
     if (content !== "") {
     whereclause += fieldName + "='" + content + "'";
     }
     }


     // Start moving through the inputs
     // APINO
     addToWhereClause("apinum", "apino");

     // OPERATOR
     addToWhereClause("operatorid", "operator");

     //WELLNAME
     addToWhereClause("wellnameid", "wellname");

     //STATUS
     addToWhereClause("statusid", "status");

     //FIELD
     addToWhereClause("fieldid", "field");

     //COUNTY
     addToWhereClause("countyid", "county");

     //TOWNSHIP
     addToWhereClause("twpid", "twp");

     //RANGE
     addToWhereClause("rgeid", "rge");

     //SECTION
     addToWhereClause("sectionid", "section_");

     //FORMATIONTD
     addToWhereClause("formationtdid","formationtd");

     //OTHERID
     addToWhereClause("stateperm","otherid");

     query.where = whereclause

     queryTask.execute(query, showResults);
     }*/


    function updateGrid(featureSet){
        var data=[];
        var grid = dijit.byId('grid');
        dojo.forEach(featureSet, function (entry) {
            //if related geographic then related = entry.att.related
            // else api search related= entry.feature.att.related
            console.log(entry);
            var logs = [],
                las = [],               folders = [],
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
    )

        /*function showResults(results) {
         var s = "";
         for (var i=0, il=results.features.length; i<il; i++) {
         var featureAttributes = results.features[i].attributes;
         for (att in featureAttributes) {
         s = s + "<b>" + att + ":</b>  " + featureAttributes[att] + "<br>";
         }
         s = s + "<br>";
         }
         dom.byId("results").innerHTML = s;
         }*/

    });
