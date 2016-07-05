!function(){
  var viz = { version: "1.0.3" };
  var τ =2*Math.PI, π=Math.PI, π2=Math.PI/2;
  
  viz.bP = function(){
	  var key_scale, value_scale
		,keyPrimary, keySecondary, value
		,width, height, orient, barSize, min, pad
		,data, fill, g, edgeOpacity
		,sortPrimary, sortSecondary, edgeMode
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
			.style("fill-opacity",0)
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
	  bP.sortPrimary = function(_){ 
		if(!arguments.length) return typeof sortPrimary !== "undefined" ? sortPrimary : d3.ascending ;
		sortPrimary = _;
		return bP;		
	  }
	  bP.keySecondary = function(_){ 
		if(!arguments.length) return typeof keySecondary !== "undefined" ? keySecondary : function(d){ return d[1]; };
		keySecondary = _;
		return bP;		
	  }
	  bP.sortSecondary = function(_){ 
		if(!arguments.length) return typeof sortSecondary !== "undefined" ? sortSecondary : d3.ascending;
		sortSecondary = _;
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
	  bP.edgeMode = function(_){
		if(!arguments.length) return typeof edgeMode !== "undefined" ? edgeMode : "curved";
		edgeMode = _;
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
				if(d.height<m) d.height=m;
			});
			mainBars.secondary.forEach(function(d){
				if(d.height<m) d.height=m;
			});
		}
		function calculateMainBars(part){
				;
			function v(d){ return isSelKey(d, part) ? bP.value()(d): 0;};

			var ps = d3.nest()
				.key(part=="primary"? bP.keyPrimary():bP.keySecondary())
				.sortKeys(part=="primary"? bP.sortPrimary():bP.sortSecondary())
				.rollup(function(d){ return d3.sum(d,v); })
				.entries(bP.data())
			;
			
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
			
			var sort = part=="primary"
					? function(a,b){ return bP.sortPrimary()(a.key, b.key);}
					: function(a,b){ return bP.sortSecondary()(a.key, b.key);}
					
			var map = d3.map(mainBars[part], function(d){ return d.key});
			
			var ps = d3.nest()
				.key(part=="primary"? bP.keyPrimary():bP.keySecondary())
				.sortKeys(part=="primary"? bP.sortPrimary():bP.sortSecondary())
				.key(part=="secondary"? bP.keyPrimary():bP.keySecondary())
				.sortKeys(part=="secondary"? bP.sortPrimary():bP.sortSecondary())
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
			var eMode= bP.edgeMode();
			
			return subBars.primary.map(function(d){
				var g=map.get(d.index);
				return {
					 path:_or === "vertical" 
						? edgeVert(d.x+d.width,d.y+d.height,g.x-g.width,g.y+g.height,g.x-g.width,g.y-g.height,d.x+d.width,d.y-d.height)
						: edgeHoriz(d.x-d.width,d.y+d.height,g.x-g.width,g.y-g.height,g.x+g.width,g.y-g.height,d.x+d.width,d.y+d.height)
					,primary:d.primary
					,secondary:d.secondary
					,value:d.value
					,percent:d.percent
				}
			});
			function edgeVert(x1,y1,x2,y2,x3,y3,x4,y4){
				if(eMode=="straight") return ["M",x1,",",y1,"L",x2,",",y2,"L",x3,",",y3,"L",x4,",",y4,"z"].join("")
				var mx1=(x1+x2)/2,mx3=(x3+x4)/2;
				return ["M",x1,",",y1,"C",mx1,",",y1," ",mx1,",",y2,",",x2,",",y2,"L"
						,x3,",",y3,"C",mx3,",",y3," ",mx3,",",y4,",",x4,",",y4,"z"].join("");
			}
			function edgeHoriz(x1,y1,x2,y2,x3,y3,x4,y4){
				if(eMode=="straight") return ["M",x1,",",y1,"L",x2,",",y2,"L",x3,",",y3,"L",x4,",",y4,"z"].join("")
				var my1=(y1+y2)/2,my3=(y3+y4)/2;
				return ["M",x1,",",y1,"C",x1,",",my1," ",x2,",",my1,",",x2,",",y2,"L"
						,x3,",",y3,"C",x3,",",my3," ",x4,",",my3,",",x4,",",y4,"z"].join("");
			}
		}
		function bpmap(a/*array*/, p/*pad*/, m/*min*/, s/*start*/, e/*end*/){
			var r = m/(e-s-2*a.length*p); // cut-off for ratios
			var ln =0, lp=0, t=d3.sum(a,function(d){ return d.values;}); // left over count and percent.
			a.forEach(function(d){ if(d.values < r*t ){ ln+=1; lp+=d.values; }})
			var o= t < 1e-5 ? 0:(e-s-2*a.length*p-ln*m)/(t-lp); // scaling factor for percent.
			var b=s, ret=[];
			a.forEach(function(d){ 
				var v =d.values*o; 
				ret.push({
					 s:b+p+(v<m?.5*(m-v): 0)
					,e:b+p+(v<m? .5*(m+v):v)
					,p:t < 1e-5? 0:d.values/t
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
		, domain, value, angleOffset, duration, ease, g, dpg, ticks, majorTicks
		, minorTickStart, minorTickEnd, majorTickStart, majorTickEnd, labelLocation
	  ;
	  var def={
		innerRadius:20, outerRadius:150, angleOffset:0.7
		,startAngle:-1.5*π, endAngle:0.5*π
		,minorTickStart:.9, minorTickEnd:.95, majorTickStart:.82, majorTickEnd:.95
		,needleColor:"#de2c2c", innerFaceColor:"#999999", faceColor:"#666666"
		,domain:[0,100], duration:500, ease:"cubicInOut"
		,ticks:d3.range(0,101,2), majorTicks: function(d){ return d%10===0}
		,labelLocation: .7
	  };
	  function gg(_){
		g=_;
        _.each(function() {
			var g = d3.select(this);
			var a = gg.scale();
			var mS=gg.minorTickStart(), mE=gg.minorTickEnd(),MS=gg.majorTickStart(), ME=gg.majorTickEnd();
			var ticks=gg.ticks(), mT=gg.majorTicks(), lL=gg.labelLocation();
			var or = gg.outerRadius();
			
			g.append("circle").attr("r",or)
				.style("fill","url(#vizgg3"+dpg+")")
				.attr("class","face");
	
			g.append("circle").attr("r",gg.innerRadius())
				.style("fill","url(#vizgg2"+dpg+")")
				.style("filter","url(#vizgg5"+dpg+")")
				.attr("class","innerFace");
  
			var tickg = g.append("g");
			tickg.selectAll("line").data(ticks).enter().append("line")
				.attr("class",function(d){ return mT(d) ? "majorTicks": "minorTicks" })
				.attr("x1",function(d){ return or*(mT(d)? MS:mS)*Math.cos(a(d));})
				.attr("y1",function(d){ return or*(mT(d)? MS:mS)*Math.sin(a(d));})
				.attr("x2",function(d){ return or*(mT(d)? ME:mE)*Math.cos(a(d));})
				.attr("y2",function(d){ return or*(mT(d)? ME:mE)*Math.sin(a(d));});
  
			g.selectAll("text").data(ticks.filter(mT))
				.enter().append("text").attr("class","label")
				.attr("x",function(d){ return or*lL*Math.cos(a(d));})
				.attr("y",function(d){ return or*lL*Math.sin(a(d));})
				.attr("dy",3)
				.text(function(d){ return d;});
				
			var r = gg.outerRadius()/def.outerRadius;

			var rot=gg.scale()(gg.value())*180/π+90;
			
			g.append("g").attr("transform","translate(1,1)")
				.selectAll(".needleshadow").data([0]).enter().append("g")
				.attr("transform","rotate("+rot+")")
				.attr("class","needleshadow")
				.append("path")
				.attr("d",["m 0",-130*r, 5*r, 175*r, -10*r, "0,z"].join(","))
				.style("filter","url(#vizgg6"+dpg+")");
	
			g.selectAll(".needle").data([0]).enter().append("g")
				.attr("transform","rotate("+rot+")")
				.attr("class","needle")
				.append("polygon")
				.attr("points",[-0.5*r,-130*r, 0.5*r,-130*r, 5*r,45*r, -5*r,45*r].join(","))
				.style("fill","url(#vizgg4"+dpg+")");			
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
	  gg.labelLocation = function(_){
		if(!arguments.length) return typeof labelLocation !== "undefined" ? labelLocation : def.labelLocation;
		labelLocation = _;
		return gg;
	  }
	  gg.ticks = function(_){
		if(!arguments.length) return typeof ticks !== "undefined" ? ticks : def.ticks;
		ticks = _;
		return gg;
	  }
	  gg.majorTicks = function(_){
		if(!arguments.length) return typeof majorTicks !== "undefined" ? majorTicks : def.majorTicks;
		majorTicks = _;
		return gg;
	  }
	  gg.minorTickStart = function(_){
		if(!arguments.length) return typeof minorTickStart !== "undefined" ? minorTickStart : def.minorTickStart;
		minorTickStart = _;
		return gg;
	  }
	  gg.minorTickEnd = function(_){
		if(!arguments.length) return typeof minorTickEnd !== "undefined" ? minorTickEnd : def.minorTickEnd;
		minorTickEnd = _;
		return gg;
	  }
	  gg.majorTickStart = function(_){
		if(!arguments.length) return typeof majorTickStart !== "undefined" ? majorTickStart : def.majorTickStart;
		majorTickStart = _;
		return gg;
	  }
	  gg.majorTickEnd = function(_){
		if(!arguments.length) return typeof majorTickEnd !== "undefined" ? majorTickEnd : def.majorTickEnd;
		majorTickEnd = _;
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
	  gg.defs = function(svg, dg){

		var defs=svg.append("defs");
		dpg=dg;
		var nc = gg.needleColor();
		var fc =gg.innerFaceColor();
		var fbc =gg.faceColor();
		
		var lg1 =viz.defs(defs).lG().id("vizgg1"+dg).sel();		
		viz.defs(lg1).stop().offset("0").stopColor(nc);
		viz.defs(lg1).stop().offset("1").stopColor(d3.rgb(nc).darker(1));
		
		var rg1 =viz.defs(defs).rG().id("vizgg2"+dg)
			.fx("35%").fy("65%").r("65%").spreadMethod("pad").sel();
		viz.defs(rg1).stop().offset("0").stopColor(fc);
		viz.defs(rg1).stop().offset("1").stopColor(d3.rgb(fc).darker(2));
		
		var rg2 =viz.defs(defs).rG().id("vizgg3"+dg)
			.fx("35%").fy("65%").r("65%").spreadMethod("pad").sel();
		viz.defs(rg2).stop().offset("0").stopColor(fbc);
		viz.defs(rg2).stop().offset("1").stopColor(d3.rgb(fbc).darker(2));
		
		viz.defs(defs).lG().id("vizgg4"+dg).gradientUnits("userSpaceOnUse")
			.y1("80").x1("-10").y2("80").x2("10").xlink("#vizgg1"+dg)
			
		var fl1 = viz.defs(defs).filter().id("vizgg5"+dg).sel();
		viz.defs(fl1).feFlood().result("flood").floodColor("rgb(0,0,0)").floodOpacity("0.6");
		viz.defs(fl1).feComposite().result("composite1").operator("in").in2("SourceGraphic").in("flood");
		viz.defs(fl1).feGaussianBlur().result("blur").stdDeviation("2").in("composite1");
		viz.defs(fl1).feOffset().result("offset").dy("2").dx("2");
		viz.defs(fl1).feComposite().result("composite2").operator("over").in2("offset").in("SourceGraphic");
			
		var fl2 =viz.defs(defs).filter().x("-0.3").y("-0.3").height("1.8").width("1.8").id("vizgg6"+dg).sel();
		viz.defs(fl2).feGaussianBlur().stdDeviation("2");
	  }
	  
	  gg.setNeedle =function(a){
		var newAngle=gg.scale()(a)*180/π+90
			,oldAngle=gg.scale()(gg.value())*180/π+90
			,d3ease = gg.ease()
			;
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
  
  viz.ch=function(){
    var g, data, fill, source, target, value, sort, padding, groups, chords, startAngle
        ,innerRadius, outerRadius, chordOpacity, defid, labelPadding, labelOrientThreshold
		,valueFormat
    ;
	
  function ch(_){
    g=_;
	var arc=d3.svg.arc().innerRadius(ch.innerRadius()).outerRadius(ch.outerRadius());
	var target = function(d){ 
	  return d.source==d.target 
	          ? {startAngle:d.startAngle,endAngle:d.endAngle}
			  : {startAngle:d.targetAngle,endAngle:d.targetAngle};
	}
	var chord =d3.svg.chord().radius(ch.innerRadius())
	            .source(function(d){ return d;})
	            .target(target);
	
    if (!chords) relayout();
	var fill = ch.fill();
	
    _.each(function() {
      var g = d3.select(this);
	  
	  var grps = g.selectAll(".groups")
	             .data(groups)
                 .enter().append("g").attr("class","groups")
          .on("mouseover", ch.mouseover)
          .on("mouseout", ch.mouseout);
				 
	  grps.append("path")
          .style("fill", function(d){ return fill(d.source)})
          .style("stroke", function(d){ return fill(d.source)})
          .attr("d", arc);
				 
	  var r=(1+ch.labelPadding())*ch.outerRadius();
	  var labels = grps.append("text").attr("class","label");
	  var lot = ch.labelOrientThreshold();
	  var vl=.85*ch.innerRadius(), vf=ch.valueFormat();

	  labels.filter(function(d){ return d.endAngle-d.startAngle > lot})
	    .append("textPath").attr("xlink:href",function(d){ return "#vizch1"+defid+"_"+d.index;})
		.attr("startOffset","50%")
		.text(function(d){ return d.source+" ("+vf(d.value)+")"});
		
	  function transform(d){
		  return "rotate("+(angle(d)*180/π-(angle(d) < π ? 90:270))+")";
	  }	  
	  
	  labels.filter(function(d){ return d.endAngle-d.startAngle <= lot})
	    .attr("x",function(d){ return angle(d) < π ? r : -r ;})
	    .attr("y",0)
		.text(function(d){ return d.source+" ("+vf(d.value)+")"})
		.style("text-anchor",function(d){return angle(d) < π ? "start" : "end";})
		.style("alignment-baseline","central")
		.attr("transform",transform);
	  
      g.append("g").attr("class", "chords")
	        .selectAll(".chord")
            .data(ch.chords())
            .enter().append("g").attr("class","chord")
			.append("path")
            .attr("d", chord)
            .style("fill", function(d){ return fill(d.target)})
            .style("opacity", ch.chordOpacity())
            .style("stroke", function(d){ return fill(d.target)})
            .on("mouseover", ch.mouseover)
            .on("mouseout", ch.mouseout)
		;
		
	  g.append("g").attr("class", "values")
	        .selectAll("text")
            .data(ch.chords())
            .enter().append("text")
	        .attr("x",function(d){ return vl*Math.cos(d.targetAngle-π2)})
	        .attr("y",function(d){ return vl*Math.sin(d.targetAngle-π2)})
	        .text(function(d){ return vf(d.value);})
			.style("opacity",0);
    });
  }
  ch.data = function(_){
    if(!arguments.length) return data;
    data = _;
	chords = groups=null;
    return ch;
  }
  ch.fill = function(_){
    if(!arguments.length) return fill;
    fill = _;
    return ch;
  }
  ch.chordOpacity = function(_){
    if(!arguments.length) return typeof chordOpacity !== "undefined" ? chordOpacity : .7;
    chordOpacity = _;
    return ch;
  }
  ch.innerRadius = function(_){
    if(!arguments.length) return typeof innerRadius !== "undefined" ? innerRadius : 180;
    innerRadius = _;
	chords = groups=null;
    return ch;
  }
  ch.outerRadius = function(_){
    if(!arguments.length) return typeof outerRadius !== "undefined" ? outerRadius : 200;
    outerRadius = _;
	chords = groups=null;
    return ch;
  }
  ch.source = function(_){ 
    if(!arguments.length) return typeof source !== "undefined" ? source : function(d){ return d[0];} ;
    source = _;
	chords = groups=null;
    return ch;    
  }
  ch.target = function(_){ 
    if(!arguments.length) return typeof target !== "undefined" ? target : function(d){ return d[1];} ;
    target = _;
	chords = groups=null;
    return ch;    
  }
  ch.value = function(_){ 
    if(!arguments.length) return typeof value !== "undefined" ? value : function(d){ return d[2];} ;
    value = _;
	chords = groups=null;
    return ch;    
  }
  ch.padding = function(_){ 
    if(!arguments.length) return typeof padding !== "undefined" ? padding : 0.03 ;
    padding = _;
	chords = groups=null;
    return ch;    
  }
  ch.labelPadding = function(_){ 
    if(!arguments.length) return typeof labelPadding !== "undefined" ? labelPadding : .05 ;
    labelPadding = _;
    return ch;    
  }
  ch.labelOrientThreshold = function(_){ 
    if(!arguments.length) return typeof labelOrientThreshold !== "undefined" ? labelOrientThreshold : .1 ;
    labelOrientThreshold = _;
    return ch;    
  }
  ch.sort = function(_){ 
    if(!arguments.length) return typeof sort !== "undefined" ? sort : d3.ascending ;
    sort = _;
	chords = groups=null;
    return ch;    
  }
  ch.startAngle = function(_){ 
    if(!arguments.length) return typeof startAngle !== "undefined" ? startAngle : 0;
    startAngle = _;
	chords = groups=null;
    return ch;    
  }
  ch.chords = function(){
      if (!chords) relayout();
      return chords;
  }
  ch.groups = function(){
      if (!groups) relayout();
      return groups;
  }
  ch.valueFormat = function(_){
    if(!arguments.length) return typeof valueFormat !== "undefined" ? valueFormat : function(d){ return d;};
    valueFormat = _;
    return ch;    
  }
  ch.mouseover = function(d){	
    g.select(".chords").selectAll(".chord")
	      .filter(function(t) { return selectChords(t,d); })
		  .select("path").transition().style("opacity", 0);
		  
    g.select(".values").selectAll("text")
	      .filter(function(t) { return !selectChords(t,d); })
		  .transition().style("opacity", 1);
  }
  ch.mouseout = function(d){
    var opacity=ch.chordOpacity();
    g.select(".chords").selectAll(".chord")
	      .filter(function(t) { return selectChords(t,d); })
		  .select("path").transition().style("opacity", opacity);
		  
    g.select(".values").selectAll("text")
	      .filter(function(t) { return !selectChords(t,d); })
		  .transition().style("opacity", 0);		  
  }
  ch.defs = function(svg, did){
	var defs=svg.append("defs");
	defid=did;
	
    if (!groups) relayout();
	
	groups.forEach(function(d){
	  var or = (1+ch.labelPadding())*ch.outerRadius()+(isBottom(d)? 12:0);
	  var s=viz_polar(or,d.startAngle-π2), e=viz_polar(or,d.endAngle-π2);
	  var lgArc = d.endAngle-d.startAngle >=π? 1: 0;
	  var pd =isBottom(d) 
			? ["M",e.x,e.y,"A",or,or,0,lgArc,0,s.x,s.y].join(" ")
			: ["M",s.x,s.y,"A",or,or,0,lgArc,1,e.x,e.y].join(" ");
	  viz.defs(defs).path().id("vizch1"+defid+"_"+d.index).d(pd);
	});	  
  }
  function angle(d){
    return viz_reduceAngle((d.startAngle+d.endAngle)/2);
  }
  function isBottom(d){
    return angle(d) < 1.5*π && angle(d) >= .5*π ? 1: 0;
  }
  function relayout(){
    var src = ch.source(), tgt= ch.target(), vlu =ch.value(), dat=ch.data(), n, pad=ch.padding()
	  ,stAngle=ch.startAngle()
	;
	
	var keys =[];
	dat.forEach(function(d){ 
	  if(keys.indexOf(src(d))==-1) keys.push(src(d));
	  if(keys.indexOf(tgt(d))==-1) keys.push(tgt(d));
	});
	n=keys.length;
	keys =keys.sort(ch.sort());
	
	var subgrp = {};
	keys.forEach(function(k){ subgrp[k]={}; return keys.forEach(function(l){ subgrp[k][l]=0;})});
	
	dat.forEach(function(d){ subgrp[src(d)][tgt(d)]+=vlu(d);});
	
	var grp={};
	keys.forEach(function(k){ grp[k] = d3.sum(keys, function(d){ return subgrp[k][d]});});
	
	var total =d3.sum(keys,  function(d){ return grp[d]});

	var ratio = (τ-n*pad)/total;
	var x=stAngle, endAngles={};
	groups=[];
	chords=[];
	keys.forEach(function(k,i){ 
	  groups.push({ startAngle:x
	              , endAngle:x+grp[k]*ratio
				  , value:grp[k]
				  , source: k
				  , type:"g"
				  , index:i
				  });
	  endAngles[k]={};
	  keys.forEach(function(l,j){ 
	    var x1=x+subgrp[k][l]*ratio;
		
	    if(subgrp[k][l] >0) 
		chords.push({startAngle:x
	               , endAngle:x1
				   , value:subgrp[k][l]
				   , source:k
				   , target:l
				   , type:"c"
				   , index:i
				   , subindex:j
		           });
		
        endAngles[k][l]=x1;
	    x=x1;
	  });
	  x+=pad;
	});
	
	chords.forEach(function(c){ c.targetAngle = endAngles[c.target][c.source];	});
  }
  function selectChords(t,d){
	  return d.type=="g" ? t.source != d.source 
              : !(d.source == t.source && d.target ==t.target
                  ||d.source == t.target && d.target ==t.source);
  }
  return ch;
}
 
  viz.defs = function(_){
	  var defs ={}, sel=_;
	  defs.sel =function(){ return sel;}
	  defs.lG= function(){ sel=sel.append("linearGradient"); return defs; }
	  defs.rG= function(){ sel=sel.append("radialGradient"); return defs; }
	  defs.stop= function(){ sel=sel.append("stop"); return defs; }
	  defs.filter= function(){ sel=sel.append("filter"); return defs; }
	  defs.feFlood= function(){ sel=sel.append("feFlood"); return defs; }
	  defs.feComposite= function(){ sel=sel.append("feComposite"); return defs; }
	  defs.feOffset= function(){ sel=sel.append("feOffset"); return defs; }
	  defs.feGaussianBlur= function(){ sel=sel.append("feGaussianBlur"); return defs; }
	  defs.result= function(_){ sel=sel.attr("result",_); return defs; }
	  defs.floodColor= function(_){ sel=sel.attr("flood-color",_); return defs; }
	  defs.floodOpacity= function(_){ sel=sel.attr("flood-opacity",_); return defs; }
	  defs.stdDeviation= function(_){ sel=sel.attr("stdDeviation",_); return defs; }
	  defs.operator= function(_){ sel=sel.attr("operator",_); return defs; }
	  defs.height= function(_){ sel=sel.attr("height",_); return defs; }
	  defs.width= function(_){ sel=sel.attr("width",_); return defs; }
	  defs.in= function(_){ sel=sel.attr("in",_); return defs; }
	  defs.in2= function(_){ sel=sel.attr("in2",_); return defs; }
	  defs.id= function(_){ sel=sel.attr("id",_); return defs; }
	  defs.fx= function(_){ sel=sel.attr("fx",_); return defs; }
	  defs.fy= function(_){ sel=sel.attr("fy",_); return defs; }
	  defs.dx= function(_){ sel=sel.attr("dx",_); return defs; }
	  defs.dy= function(_){ sel=sel.attr("dy",_); return defs; }
	  defs.x1= function(_){ sel=sel.attr("x1",_); return defs; }
	  defs.y1= function(_){ sel=sel.attr("y1",_); return defs; }
	  defs.x2= function(_){ sel=sel.attr("x2",_); return defs; }
	  defs.y2= function(_){ sel=sel.attr("y2",_); return defs; }
  	  defs.x= function(_){ sel=sel.attr("x",_); return defs; }
  	  defs.y= function(_){ sel=sel.attr("y",_); return defs; }
  	  defs.r= function(_){ sel=sel.attr("r",_); return defs; }
	  defs.spreadMethod= function(_){ sel=sel.attr("spreadMethod",_); return defs; }
  	  defs.gradientUnits= function(_){ sel=sel.attr("gradientUnits",_); return defs; }
	  defs.xlink= function(_){ sel=sel.attr("xlink:href",_); return defs; }
	  defs.offset= function(_){ sel=sel.attr("offset",_); return defs; }
	  defs.stopColor= function(_){ sel=sel.attr("stop-color",_); return defs; }
	  defs.path= function(){ sel=sel.append("path"); return defs; }
	  defs.d= function(_){ sel=sel.attr("d",_); return defs; }
	  return defs;
  }

  function viz_reduceAngle(a){
    while(a>τ) a-=τ;
    while(a<0) a+=τ;
    return a;
  }
  function viz_polar(r, a){  return {x:r*Math.cos(a), y:r*Math.sin(a)};  }
  this.viz=viz;
}();

