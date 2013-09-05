dojo.require("dojox.grid.DataGrid");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("esri.tasks.query");
dojo.require("esri.tasks.QueryTask");
dojo.require("dojo.dom");
dojo.require("dojo.on");
dojo.require("dojo.domReady");

var queryTask, query;

function int(on,query,QueryTask, dom){

    queryTask = new QueryTask("http://services.azgs.az.gov/ArcGIS/rest/services/aasggeothermal/AZWellHeaders/MapServer/0");

    query = new Query();
    query.returnGeometry = false;
    query.outFeilds = ["apino", "wellname", "drillertotaldepth", "county", "twp", "rge", "section_", "formationtd", "otherid","status","field"]
    on(dom.byId("execute"), "click", runQuery);
}
function runQuery(twp){
    query.where = "twp = '" + twp + "'";
    queryTask.execute(query,updateGrid(featureSet));

}

function updateGrid(featureSet){
        console.log(map.spatialReference);
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
    }