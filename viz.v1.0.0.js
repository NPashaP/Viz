!function(){
  var vis = { version: "1.0.0", template:{} };
    
  vis.bP = function(){
	  var key_scale, value_scale
		,keyPrimary, keySecondary, value
		,width, height, orient, barSize, min, pad
		,data, fill, g, edgeOpacity
	  ;
	  function bP(_){
		g=_;
        _.each(function() {
          var g = d3.select(this);
		  var bars = bP.bars();
		
		  var s = g.selectAll(".subBars")
        	.data(bars.subBars)
        	.enter()
        	.append("rect")
        	.attr("class","subBars")
        	.attr("x",function(d){ return d.x})
			.attr("y",function(d){ return d.y})
        	.attr("width",function(d){ return d.width})
        	.attr("height",function(d){ return d.height});
			
         if(typeof fill !=="undefined") s.style("fill", function(d){ return fill(d); });
			 
          var e = g.selectAll(".edges")
        	.data(bars.edges)
        	.enter()
        	.append("path")
        	.attr("class","edges")
        	.attr("d",function(d){ return d.path; })
			.style("fill-opacity",bP.edgeOpacity());
        	
         if(typeof fill !=="undefined") e.style("fill", function(d){ return fill(d); });
		 
          g.selectAll(".mainBars")
        	.data(bars.mainBars)
        	.enter()
			.append("g")
        	.attr("class","mainBars")
        	.append("rect")
        	.attr("x",function(d){ return d.x})
        	.attr("y",function(d){ return d.y})
        	.attr("width",function(d){ return d.width})
        	.attr("height",function(d){ return d.height})
			.on("mouseover",bP.mouseover)
			.on("mouseout",bP.mouseout);			
		});
	  }
	  bP.data = function(_){
		if(!arguments.length) return data;
		data = _;
		return bP;
	  }
	  bP.fill = function(_){
		if(!arguments.length) return fill;
		fill = _;
		return bP;
	  }
	  bP.keyPrimary = function(_){ 
		if(!arguments.length) return typeof keyPrimary !== "undefined" ? keyPrimary : function(d){ return d[0]; } ;
		keyPrimary = _;
		return bP;		
	  }
	  bP.keySecondary = function(_){ 
		if(!arguments.length) return typeof keySecondary !== "undefined" ? keySecondary : function(d){ return d[1]; };
		keySecondary = _;
		return bP;		
	  }	  
	  bP.value = function(_){ 
		if(!arguments.length) return typeof value !== "undefined" ? value : function(d){ return d[2]; };
		value = _;
		return bP;		
	  }	  
	  bP.width = function(_){
		if(!arguments.length) return typeof width !== "undefined" ? width : 400;
		width = _;
		return bP;
	  }
	  bP.height = function(_){
		if(!arguments.length) return typeof height !== "undefined" ? height : 600;
		height = _;
		return bP;
	  }
	  bP.barSize = function(_){
		if(!arguments.length) return barSize
		barSize = _;
		return bP;
	  }
	  bP.min = function(_){
		if(!arguments.length) return typeof min !== "undefined" ? min : 0;
		min = _;
		return bP;
	  }
	  bP.orient = function(_){
		if(!arguments.length) return typeof orient !== "undefined" ? orient : "vertical";
		orient = _;
		return bP;
	  }
	  bP.pad = function(_){
		if(!arguments.length) return typeof pad !== "undefined" ? pad : 0;
		pad = _;
		return bP;
	  }
	  bP.duration = function(_){
		if(!arguments.length) return typeof duration !== "undefined" ? duration : 500;
		duration = _;
		return bP;
	  }
	  bP.edgeOpacity = function(_){
		if(!arguments.length) return typeof edgeOpacity !== "undefined" ? edgeOpacity : .4;
		edgeOpacity = _;
		return bP;
	  }
	  bP.bars = function(mb){
		var mainBars={primary:[], secondary:[]};
		var subBars= {primary:[], secondary:[]};
		var key ={primary:bP.keyPrimary(), secondary:bP.keySecondary() };
		var _or = bP.orient();
		
		calculateMainBars("primary");
		calculateMainBars("secondary");	
		calculateSubBars("primary");	
		calculateSubBars("secondary");
		floorMainBars();
		
		return {
			 mainBars:mainBars.primary.concat(mainBars.secondary)
			,subBars:subBars.primary.concat(subBars.secondary)
			,edges:calculateEdges()
		};

		function isSelKey(d, part){ 
			return (typeof mb === "undefined" || mb.part === part) || (key[mb.part](d) === mb.key);
		}
		function floorMainBars(){
			var m =bP.min();
			
			mainBars.primary.forEach(function(d){
				if(d.height<m){
					d.y=d.y+.5*(d.height-m);
					d.height=m;
				}
			});
			
			mainBars.secondary.forEach(function(d){
				if(d.height<m){
					d.x=d.x+.5*(d.height-m);
					d.height=m;
				}
			});
		}
		function calculateMainBars(part){
			function v(d){ return isSelKey(d, part) ? bP.value()(d): 0;};

			var ps = d3.nest()
				.key(part=="primary"? bP.keyPrimary():bP.keySecondary())
				.rollup(function(d){ return d3.sum(d,v); })
				.entries(bP.data());

			var bars = bpmap(ps, bP.pad(), bP.min(), 0, _or=="vertical" ? bP.height() : bP.width());
			var bsize = bP.barSize();
			
			ps.forEach(function(d,i){ 
				mainBars[part].push({
					 x:_or=="vertical"? part=="primary" ? 0 : bP.width()-bsize : bars[i].s
					,y:_or=="horizontal"? part=="primary" ? 0 : bP.height()-bsize : bars[i].s
					,height:_or=="vertical"? bars[i].e - bars[i].s : bsize
					,width: _or=="horizontal"? bars[i].e - bars[i].s : bsize
					,part:part
					,key:d.key
					,value:d.value
					,percent:bars[i].p
				});
			});		  
		}
		function calculateSubBars(part){
			function v(d){ return isSelKey(d, part) ? bP.value()(d): 0;};
			var map = d3.map(mainBars[part], function(d){ return d.key});
			
			var ps = d3.nest()
				.key(part=="primary"? bP.keyPrimary():bP.keySecondary())
				.key(part=="secondary"? bP.keyPrimary():bP.keySecondary())
				.rollup(function(d){ return d3.sum(d,v); })
				.entries(bP.data());
							
			ps.forEach(function(d,j){ 
				var g= map.get(d.key); 
				var bars = bpmap(d.values, 0, 0, _or=="vertical" ? g.y : g.x, _or=="vertical" ? g.y+g.height : g.x+g.width);
				var bsize = bP.barSize();
			
				d.values.forEach(function(t,i){ 
					subBars[part].push({
						 x:_or=="vertical"? part=="primary" ? 0 : bP.width()-bsize : bars[i].s
						,y:_or=="horizontal"? part=="primary" ? 0 : bP.height()-bsize : bars[i].s
						,height:_or=="vertical"? bars[i].e - bars[i].s : bsize
						,width: _or=="horizontal"? bars[i].e - bars[i].s : bsize
						,part:part
						,primary:part=="primary"? d.key : t.key
						,secondary:part=="primary"? t.key : d.key	
						,value:t.value
						,percent:bars[i].p*g.p
						,i: part=="primary"? j+"|"+i : i+"|"+j //index 
					});
				});		  
			});
		}
		function calculateEdges(){	
			var map=d3.map(subBars.secondary,function(d){ return d.i;});
			
			return subBars.primary.map(function(d){
				var g=map.get(d.i);
				
				return {
					 path:_or === "vertical" 
						? ["M",d.x+d.width,",",d.y+d.height,"V",d.y,"L",g.x,",",g.y,"V",g.y+g.height,"Z"].join("")
						: ["M",d.x,",",d.y+d.height,"H",d.x+d.width,"L",g.x+g.width,",",g.y,"H",g.x,"Z"].join("")
					,primary:d.primary
					,secondary:d.secondary
					,value:d.value
					,percent:d.percent
				}
			});
		}
		function bpmap(a/*array*/, p/*pad*/, m/*min*/, s/*start*/, e/*end*/){
			var r = m/(e-s-2*a.length*p); // cut-off for ratios
			var ln =0, lp=0, t=d3.sum(a,function(d){ return d.value;}); // left over count and percent.
			if(t<=0) return a;
			
			a.forEach(function(d){ if(d.value < r*t ){ ln+=1; lp+=d.value; }})
			var o=(e-s-2*a.length*p-ln*m)/(t-lp); // scaling factor for percent.
			var b=s, ret=[];
			a.forEach(function(d){ 
				var v =d.value*o; 
				ret.push({
					 s:b+p+(v<m?.5*(m-v): 0)
					,e:b+p+(v<m? .5*(m+v):v)
					,p:d.value/t
				}); 
				b+=2*p+(v<m? m:v); 
			});
			
			return ret;
		}	  
	  }	  
	  bP.mouseover = function(d){
		  var newbars = bP.bars(d);
		  
		  g.selectAll(".mainBars").filter(function(r){ return r.part===d.part && r.key === d.key})
			.style("stroke-opacity", 1);
		  
		  g.selectAll(".subBars")
			.data(newbars.subBars)
			.transition().duration(bP.duration())
			.attr("x",function(d){ return d.x}).attr("y",function(d){ return d.y})
			.attr("width",function(d){ return d.width})
			.attr("height",function(d){ return d.height});
			
		  var e = g.selectAll(".edges")
			.data(newbars.edges);
			
		  e.filter(function(t){ return t[d.part] === d.key;})
			.transition().duration(bP.duration())
			.style("fill-opacity",0.5)
			.attr("d",function(d){ return d.path});	
			
		  e.filter(function(t){ return t[d.part] !== d.key;})
			.transition().duration(bP.duration())
			.style("fill-opacity",0)
			.attr("d",function(d){ return d.path});	
			
		  g.selectAll(".mainBars")
			.data(newbars.mainBars)
			.transition().duration(bP.duration())
			.attr("x",function(d){ return d.x})
			.attr("y",function(d){ return d.y})
			.attr("width",function(d){ return d.width})
			.attr("height",function(d){ return d.height})
		}
	  bP.mouseout = function(d){
		  var newbars = bP.bars();
			
		  g.selectAll(".mainBars").filter(function(r){ return r.part===d.part && r.key === d.key})
			.style("stroke-opacity", 0);
		  
		  g.selectAll(".subBars")
			.data(newbars.subBars)
			.transition().duration(bP.duration())
			.attr("x",function(d){ return d.x}).attr("y",function(d){ return d.y})
			.attr("width",function(d){ return d.width})
			.attr("height",function(d){ return d.height});
			
		  g.selectAll(".edges")
			.data(newbars.edges)
			.transition().duration(bP.duration())
			.style("fill-opacity",bP.edgeOpacity())
			.attr("d",function(d){ return d.path});	
			
		  g.selectAll(".mainBars")
			.data(newbars.mainBars)
			.transition().duration(bP.duration())
			.attr("x",function(d){ return d.x})
			.attr("y",function(d){ return d.y})
			.attr("width",function(d){ return d.width})
			.attr("height",function(d){ return d.height})
		}

	  return bP;
	}
  
  this.vis=vis;
}();

