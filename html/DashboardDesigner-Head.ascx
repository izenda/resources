<%@ Control Language="C#" AutoEventWireup="true" %>

<script type="text/javascript">
    function toggleLayer(whichLayer) {
        var elem, vis;
        if (document.getElementById)
            elem = document.getElementById(whichLayer);
        else if (document.all)
            elem = document.all[whichLayer];
        else if (document.layers)
            elem = document.layers[whichLayer];
        vis = elem.style;
        if (vis.display == '' && elem.offsetWidth != undefined && elem.offsetHeight != undefined)
            vis.display = (elem.offsetWidth != 0 && elem.offsetHeight != 0) ? 'block' : 'none';
        vis.display = (vis.display == '' || vis.display == 'block') ? 'none' : 'block';
    }

    function hideLayer(whichLayer) {
        var elem, vis;
        if (document.getElementById)
            elem = document.getElementById(whichLayer);
        else if (document.all)
            elem = document.all[whichLayer];
        else if (document.layers)
            elem = document.layers[whichLayer];
        vis = elem.style;
        if (vis.display == '' && elem.offsetWidth != undefined && elem.offsetHeight != undefined)
            vis.display = (elem.offsetWidth != 0 && elem.offsetHeight != 0) ? 'block' : 'none';
        vis.display = 'none';
    }

    function showLayer(whichLayer) {
        var elem, vis;
        if (document.getElementById)
            elem = document.getElementById(whichLayer);
        else if (document.all)
            elem = document.all[whichLayer];
        else if (document.layers)
            elem = document.layers[whichLayer];

        vis = elem.style;
        if (vis.display == '' && elem.offsetWidth != undefined && elem.offsetHeight != undefined)
            vis.display = (elem.offsetWidth != 0 && elem.offsetHeight != 0) ? 'block' : 'none';
        vis.display = 'block';
    }

    function makeLayerInvisible(whichLayer) {
        var elem, vis;
        if (document.getElementById)
            elem = document.getElementById(whichLayer);
        else if (document.all)
            elem = document.all[whichLayer];
        else if (document.layers)
            elem = document.layers[whichLayer];

        vis = elem.style;
        vis.visibility = 'hidden';
    }

    function makeLayerVisible(whichLayer) {
        var elem, vis;
        if (document.getElementById)
            elem = document.getElementById(whichLayer);
        else if (document.all)
            elem = document.all[whichLayer];
        else if (document.layers)
            elem = document.layers[whichLayer];

        vis = elem.style;
        vis.visibility = 'visible';
    }

    function OpenReport(dropdownID) {
        var e = document.getElementById(dropdownID); // select element
        var strval = e.options[e.selectedIndex].value;
        var rptname;

        if (strval == "...")
            alert("cannot open report");
        else {
            if (strval.charAt(0) == '|')
                rptname = strval.substring(1);
            else
                rptname = strval;

            window.open("reportviewer.aspx?rn=" + rptname.replace(/\|/, "\\"), "viewreport", "location=1,status=1,scrollbars=1,resizable=1");
        }
    }

    function showPopUp(el) {
        var cvr = document.getElementById("cover")
        var dlg = document.getElementById(el)
        cvr.style.display = "block"
        dlg.style.display = "block"
        if (document.body.style.overflow = "hidden") {
            cvr.style.width = "100%"
            cvr.style.height = "100%"
        }
    }
    function closePopUp(el) {
        var cvr = document.getElementById("cover")
        var dlg = document.getElementById(el)
        cvr.style.display = "none"
        dlg.style.display = "none"
        document.body.style.overflowY = "scroll"
    }


</script>
<style type="text/css">
#cover {
display:none;
position:absolute;
left:0px;
top:0px;
width:100%;
height:100%;
background:gray;
filter:alpha(Opacity=50);
opacity:0.5;
-moz-opacity:0.5;
-khtml-opacity:0.5
}
#dialog {
display:none;
left:250px;
top:200px;
width:250px;
height:150px;
position:absolute;
z-index:100;
background:white;
padding:2px;
font:10pt tahoma;
border:1px solid gray
}
</style>