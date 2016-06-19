!function(){
  var viz = { version: "1.0.0", template:{} };
    
  viz.bP = function(){
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
			.append("g")
			.attr("transform", function(d){ return "translate("+d.x+","+d.y+")";})
        	.attr("class","subBars")
        	.append("rect")
        	.attr("x",fx).attr("y",fy).attr("width",fw).attr("height",fh);
			
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
			.attr("transform", function(d){ return "translate("+d.x+","+d.y+")";})
        	.attr("class","mainBars")
        	.append("rect")
        	.attr("x",fx).attr("y",fy).attr("width",fw).attr("height",fh)
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
		if(!arguments.length) return typeof barSize !== "undefined" ? barSize : 35;
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
		floorMainBars(); // ensure that main bars is atleast of size mi.n
		
		return {
			 mainBars:mainBars.primary.concat(mainBars.secondary)
			,subBars:subBars.primary.concat(subBars.secondary)
			,edges:calculateEdges()
		};

		function isSelKey(d, part){ 
			return (typeof mb === "undefined" || mb.part === part) || (key[mb.part](d) === mb.key);
		}
		function floorMainBars(){
			var m =bP.min()/2;
			
			mainBars.primary.forEach(function(d){
				if(d.height<m){
//					d.y=d.y+.5*(d.height-m);
					d.height=m;
				}
			});
			mainBars.secondary.forEach(function(d){
				if(d.height<m){
//					d.y=d.y+.5*(d.height-m);
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
					 x:_or=="horizontal"? (bars[i].s+bars[i].e)/2 : (part=="primary" ? bsize/2 : bP.width()-bsize/2)
					,y:_or=="vertical"? (bars[i].s+bars[i].e)/2 : (part=="primary" ? bsize/2 : bP.height()-bsize/2)
					,height:_or=="vertical"? (bars[i].e - bars[i].s)/2 : bsize/2
					,width: _or=="horizontal"? (bars[i].e - bars[i].s)/2 : bsize/2
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
							
			ps.forEach(function(d){ 
				var g= map.get(d.key); 
				var bars = bpmap(d.values, 0, 0
						,_or=="vertical" ? g.y-g.height : g.x-g.width
						,_or=="vertical" ? g.y+g.height : g.x+g.width);
				var bsize = bP.barSize();			
				d.values.forEach(function(t,i){ 
					subBars[part].push({
						 x:_or=="vertical"? part=="primary" ? bsize/2 : bP.width()-bsize/2 : (bars[i].s+bars[i].e)/2
						,y:_or=="horizontal"? part=="primary" ? bsize/2 : bP.height()-bsize/2 : (bars[i].s+bars[i].e)/2
						,height:(_or=="vertical"? bars[i].e - bars[i].s : bsize)/2
						,width: (_or=="horizontal"? bars[i].e - bars[i].s : bsize)/2
						,part:part
						,primary:part=="primary"? d.key : t.key
						,secondary:part=="primary"? t.key : d.key	
						,value:t.value
						,percent:bars[i].p*g.percent
						,index: part=="primary"? d.key+"|"+t.key : t.key+"|"+d.key //index 
					});
				});		  
			});
		}
		function calculateEdges(){	
			var map=d3.map(subBars.secondary,function(d){ return d.index;});
			return subBars.primary.map(function(d){
				var g=map.get(d.index);
				return {
					 path:_or === "vertical" 
						? ["M",d.x+d.width,",",d.y+d.height,"V",d.y-d.height,"L",g.x-g.width,",",g.y-g.height
							,"V",g.y+g.height,"Z"].join("")
						: ["M",d.x-d.width,",",d.y+d.height,"H",d.x+d.width,"L",g.x+g.width,",",g.y-g.height
							,"H",g.x-g.width,"Z"].join("")
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
			a.forEach(function(d){ if(d.value < r*t ){ ln+=1; lp+=d.value; }})
			var o= t < 1e-5 ? 0:(e-s-2*a.length*p-ln*m)/(t-lp); // scaling factor for percent.
			var b=s, ret=[];
			a.forEach(function(d){ 
				var v =d.value*o; 
				ret.push({
					 s:b+p+(v<m?.5*(m-v): 0)
					,e:b+p+(v<m? .5*(m+v):v)
					,p:t < 1e-5? 0:d.value/t
				}); 
				b+=2*p+(v<m? m:v); 
			});
			
			return ret;
		}	  
	  }	  
	  bP.mouseover = function(d){
		  var newbars = bP.bars(d);
		  g.selectAll(".mainBars").filter(function(r){ return r.part===d.part && r.key === d.key})
			.select("rect").style("stroke-opacity", 1);
		  
		  g.selectAll(".subBars").data(newbars.subBars)
			.transition().duration(bP.duration())
			.attr("transform", function(d){ return "translate("+d.x+","+d.y+")";})
			.select("rect").attr("x",fx).attr("y",fy).attr("width",fw).attr("height",fh);
			
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
			
		  g.selectAll(".mainBars").data(newbars.mainBars)
			.transition().duration(bP.duration())
			.attr("transform", function(d){ return "translate("+d.x+","+d.y+")";})
			.select("rect").attr("x",fx).attr("y",fy).attr("width",fw).attr("height",fh)
		}
	  bP.mouseout = function(d){
		  var newbars = bP.bars();
			
		  g.selectAll(".mainBars").filter(function(r){ return r.part===d.part && r.key === d.key})
			.select("rect").style("stroke-opacity", 0);
		  
		  g.selectAll(".subBars").data(newbars.subBars)
			.transition().duration(bP.duration())
			.attr("transform", function(d){ return "translate("+d.x+","+d.y+")";})
			.select("rect").attr("x",fx).attr("y",fy).attr("width",fw).attr("height",fh);
			
		  g.selectAll(".edges").data(newbars.edges)
			.transition().duration(bP.duration())
			.style("fill-opacity",bP.edgeOpacity())
			.attr("d",function(d){ return d.path});	
			
		  g.selectAll(".mainBars").data(newbars.mainBars)
			.transition().duration(bP.duration())
			.attr("transform", function(d){ return "translate("+d.x+","+d.y+")";})
			.select("rect").attr("x",fx).attr("y",fy).attr("width",fw).attr("height",fh);
		}
	  function fx(d){ return -d.width}
	  function fy(d){ return -d.height}
      function fw(d){ return 2*d.width}
      function fh(d){ return 2*d.height}
	  
	  return bP;
	}
  
  viz.gg = function(){
	  var innerRadius, outerRadius, startAngle, endAngle, needleColor, innerFaceColor, faceColor
		,tickColor, domain, value, angleOffset, duration, ease
	  ;
	  var def={
		innerRadius:20, outerRadius:150, angleOffset:0.7
		,startAngle:-1.5*Math.PI, endAngle:0.5*Math.PI
		,inTick:.12, outTick:.2, needleColor:"#de2c2c", innerFaceColor:"#999999", faceColor:"#666666"
		,tickColor:"#ffffff", domain:[0,100], duration:500, ease:"cubicInOut"
	  };
	  function gg(_){
		g=_;
        _.each(function() {
			var g = d3.select(this);
			var dom=gg.domain();
			var a = gg.scale();
			var it=gg.inTick(), ot=gg.outTick(), or=gg.outerRadius();
			var ticks=d3.range(dom[0],dom[1]+1,2);
			
			g.append("circle").attr("r",or)
				.style("fill","url(#vizgg03)")
				.attr("class","vizggouter");
	
			g.append("circle").attr("r",gg.innerRadius())
				.style("fill","url(#vizgg02)")
				.style("filter","url(#vizgg05)");
  
			var tickg = g.append("g").style("stroke",gg.tickColor());
			
			tickg.selectAll("line").data(ticks).enter().append("line")
				.style("stroke-width","2")
				.attr("x1",function(d){ return or*(1-it)*Math.cos(a(d));})
				.attr("y1",function(d){ return or*(1-it)*Math.sin(a(d));})
				.attr("x2",function(d){ return or*.95*Math.cos(a(d));})
				.attr("y2",function(d){ return or*.95*Math.sin(a(d));});
  
			tickg.selectAll("line").filter(function(d){ return d%10===0})
				.style("stroke-width","3") 
				.attr("x1",function(d){ return or*(1-ot)*Math.cos(a(d));})
				.attr("y1",function(d){ return or*(1-ot)*Math.sin(a(d));});
	
			g.selectAll("text").data(ticks.filter(function(d){ return d%10 === 0}))
				.enter().append("text").attr("class","vizggtext")
				.attr("x",function(d){ return or*(1-it)*.8*Math.cos(a(d));})
				.attr("y",function(d){ return or*(1-it)*.8*Math.sin(a(d));})
				.attr("dy",3)
				.text(function(d){ return d;});
				
			var r = gg.outerRadius()/def.outerRadius;

			var rot=gg.scale()(gg.value())*180/Math.PI+90;
			
//			console.log(rot);
			g.append("g").attr("transform","translate(1,1)")
				.selectAll(".needleshadow").data([0]).enter().append("g")
				.attr("transform","rotate("+rot+")")
				.attr("class","needleshadow")
				.append("path")
				.attr("d",["m 0",-130*r, 5*r, 175*r, -10*r, "0,z"].join(","))
				.style("filter","url(#vizgg06)");
	
			g.selectAll(".needle").data([0]).enter().append("g")
				.attr("transform","rotate("+rot+")")
				.attr("class","needle")
				.append("polygon")
				.attr("points",[-0.5*r,-130*r, 0.5*r,-130*r, 5*r,45*r, -5*r,45*r].join(","))
				.style("fill","url(#vizgg04)");			
		});		  
	  }
	  gg.scale = function(){ 
		return d3.scale.linear().domain(gg.domain())
			.range([def.startAngle+gg.angleOffset(), def.endAngle -gg.angleOffset()]);
	  }
	  gg.innerRadius = function(_){
		if(!arguments.length) return typeof innerRadius !== "undefined" ? innerRadius : def.innerRadius;
		innerRadius = _;
		return gg;
	  }
	  gg.outerRadius = function(_){
		if(!arguments.length) return typeof outerRadius !== "undefined" ? outerRadius : def.outerRadius;
		outerRadius = _;
		return gg;
	  }
	  gg.angleOffset = function(_){
		if(!arguments.length) return typeof angleOffset !== "undefined" ? angleOffset : def.angleOffset;
		angleOffset = _;
		return gg;
	  }
	  gg.inTick = function(_){
		if(!arguments.length) return typeof inTick !== "undefined" ? inTick : def.inTick;
		inTick = _;
		return gg;
	  }
	  gg.outTick = function(_){
		if(!arguments.length) return typeof outTick !== "undefined" ? outTick : def.outTick;
		outTick = _;
		return gg;
	  }
	  gg.needleColor = function(_){
		if(!arguments.length) return typeof needleColor !== "undefined" ? needleColor : def.needleColor;
		needleColor = _;
		return gg;
	  }
	  gg.innerFaceColor = function(_){
		if(!arguments.length) return typeof innerFaceColor !== "undefined" ? innerFaceColor : def.innerFaceColor;
		innerFaceColor = _;
		return gg;
	  }
	  gg.tickColor = function(_){
		if(!arguments.length) return typeof tickColor !== "undefined" ? tickColor : def.tickColor;
		tickColor = _;
		return gg;
	  }
	  gg.faceColor = function(_){
		if(!arguments.length) return typeof faceColor !== "undefined" ? faceColor : def.faceColor;
		faceColor = _;
		return gg;
	  }
	  gg.domain = function(_){
		if(!arguments.length) return typeof domain !== "undefined" ? domain : def.domain;
		domain = _;
		return gg;
	  }
	  gg.duration = function(_){
		if(!arguments.length) return typeof duration !== "undefined" ? duration : def.duration;
		duration = _;
		return gg;
	  }
	  gg.ease = function(_){
		if(!arguments.length) return typeof ease !== "undefined" ? ease : def.ease;
		ease = _;
		return gg;
	  }
	  gg.value = function(_){
		if(!arguments.length) return typeof value !== "undefined" ? value : .5*(def.domain[0]+def.domain[1]);
		value = _;
		return gg;
	  }
	  gg.defs = function(svg){
		var defs=svg.append("defs");
		  
		var lg1 =defs.append("linearGradient").attr("id","vizgg01");
		var nc = gg.needleColor();
		lg1.append("stop").attr("offset","0").style("stop-color",nc);
		lg1.append("stop").attr("offset","1").style("stop-color",d3.rgb(nc).darker(1));
		
		var rg1 =defs.append("radialGradient").attr("fx","35%").attr("fy","65%").attr("r","65%")
					.attr("spreadMethod","pad").attr("id","vizgg02");
		var fc =gg.innerFaceColor();
		rg1.append("stop").attr("offset","0").style("stop-color",fc);
		rg1.append("stop").attr("offset","1").style("stop-color",d3.rgb(fc).darker(2));
		
		var rg2 =defs.append("radialGradient").attr("fx","35%").attr("fy","65%").attr("r","65%")
					.attr("spreadMethod","pad").attr("id","vizgg03");
		var fbc =gg.faceColor();
		rg2.append("stop").attr("offset","0").style("stop-color",fbc);
		rg2.append("stop").attr("offset","1").style("stop-color",d3.rgb(fbc).darker(2));
		
		defs.append("linearGradient").attr("gradientUnits","userSpaceOnUse")
			.attr("y1","80").attr("x1","-10").attr("y2","80").attr("x2","10")
			.attr("id","vizgg04").attr("xlink:href","#vizgg01")
			
		var fl1 = defs.append("filter").attr("id","vizgg05")
		fl1.append("feFlood").attr("result","flood").attr("flood-color","rgb(0,0,0)").attr("flood-opacity","0.6");
		
		fl1.append("feComposite").attr("result","composite1")
			.attr("operator","in").attr("in2","SourceGraphic").attr("in","flood");
			
		fl1.append("feGaussianBlur").attr("result","blur").attr("stdDeviation","2").attr("in","composite1");
		
		fl1.append("feOffset").attr("result","offset").attr("dy","2").attr("dx","2");
		
		fl1.append("feComposite").attr("result","composite2").attr("operator","over")
			.attr("in2","offset").attr("in","SourceGraphic");
			
		var fl2 =defs.append("filter").attr("x","-0.3").attr("y","-0.3")
			.attr("height","1.8").attr("width","1.8").attr("id","vizgg06");
			
		fl2.append("feGaussianBlur").attr("stdDeviation","2");
	  }
	  
	  gg.setNeedle =function(a){
		var newAngle=gg.scale()(a)*180/Math.PI+90
			,oldAngle=gg.scale()(gg.value())*180/Math.PI+90
			,d3ease = d3.ease(gg.ease());
			
		g.selectAll(".needle").data([a])
			.transition().duration(gg.duration())
			.attrTween("transform",function(d){ return iS(oldAngle,newAngle); })
			.ease(d3ease);
		
		g.selectAll(".needleshadow").data([a])
			.transition().duration(gg.duration())
			.attrTween("transform",function(d){  return iS(oldAngle,newAngle); })
			.ease(d3ease)
			.each("end",function(){angle=a;});
			
		gg.value(a);
		
		function iS(o,n){
			return d3.interpolateString("rotate("+o+")", "rotate("+n+")");
		}
	  }
	  
	  return gg;
  }
  this.viz=viz;
}();

