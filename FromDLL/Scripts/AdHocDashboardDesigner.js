function toggleLayer( whichLayer )
	{  
	    var elem, vis;  
	    if( document.getElementById )    
	        elem = document.getElementById( whichLayer );  
	    else if( document.all )      
	        elem = document.all[whichLayer];  
	    else if( document.layers ) 
	        elem = document.layers[whichLayer];  
	    
	    vis = elem.style;    
	    if(vis.display==''&&elem.offsetWidth!=undefined&&elem.offsetHeight!=undefined)    
	        vis.display = (elem.offsetWidth!=0&&elem.offsetHeight!=0)?'block':'none';  
	    vis.display = (vis.display==''||vis.display=='block')?'none':'block';
	}
	
	function hideLayer( whichLayer )
	{  
	    var elem, vis;  
	    if( document.getElementById )    
	        elem = document.getElementById( whichLayer );  
	    else if( document.all )      
	        elem = document.all[whichLayer];  
	    else if( document.layers ) 
	        elem = document.layers[whichLayer];  
	    
	    vis = elem.style;    
	    if(vis.display==''&&elem.offsetWidth!=undefined&&elem.offsetHeight!=undefined)    
	        vis.display = (elem.offsetWidth!=0&&elem.offsetHeight!=0)?'block':'none';  
	    vis.display = 'none';
	}
	
	function showLayer( whichLayer )
	{  
	    var elem, vis;  
	    if( document.getElementById )    
	        elem = document.getElementById( whichLayer );  
	    else if( document.all )      
	        elem = document.all[whichLayer];  
	    else if( document.layers ) 
	        elem = document.layers[whichLayer];  
	    
	    vis = elem.style;    
	    if(vis.display==''&&elem.offsetWidth!=undefined&&elem.offsetHeight!=undefined)    
	        vis.display = (elem.offsetWidth!=0&&elem.offsetHeight!=0)?'block':'none';  
	    vis.display = 'block';
	}
	
	function makeLayerInvisible( whichLayer )
	{  
	    var elem, vis;  
	    if( document.getElementById )    
	        elem = document.getElementById( whichLayer );  
	    else if( document.all )      
	        elem = document.all[whichLayer];  
	    else if( document.layers ) 
	        elem = document.layers[whichLayer];  
	    
	    vis = elem.style;    
	    vis.visibility = 'hidden';
	}
	
	function makeLayerVisible( whichLayer )
	{  
	    var elem, vis;  
	    if( document.getElementById )    
	        elem = document.getElementById( whichLayer );  
	    else if( document.all )      
	        elem = document.all[whichLayer];  
	    else if( document.layers ) 
	        elem = document.layers[whichLayer];  
	    
	    vis = elem.style;    
	    vis.visibility = 'visible';
	}
	
	function OpenReport ( dropdownID )
	{
	    var e = document.getElementById( dropdownID ); // select element
        var strval = e.options[e.selectedIndex].value; 

        if (strval == "...")
            alert(jsResources.CannotOpenReport);
        else {
            window.open("reportviewer.aspx?rn=" + strval.replace(/\|/,"\\"),"viewreport","status=0,toolbar=0");
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
