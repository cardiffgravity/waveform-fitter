
class WaveData{
    constructor(datain){
        if (Array.isArray(datain)){
            if ((datain.length>0)&(datain[0].length>=2)){
                this.t=datain.map(function(value,index){return value[0]})
                this.h=datain.map(function(value,index){return value[1]})
            }else{
                console.log("datain needs to be 2D array with dimension Nx2 for N datapoints",datain.length,datain[0].length)
                return(null);
            }
        }else{
            if (datain.hasOwnProperty('t')&datain.hasOwnProperty('t')){
                this.t=datain.t;
                this.h=datain.h
            }else{
                console.log("datain needs to be 2D array or object with data in properties t and h")
                return(null);
            }
        }
        this.linedata();
    }
    linedata(){
        this.lineData=[];
        for (var i=0;i<this.t.length;i++){
            this.lineData.push({'t':this.t[i],'h':this.h[i]})
        }
        this.tint=d3.scaleLinear().range([0,this.t.length])
        this.tint.domain([this.t[0],this.t.slice(-1)])
    }
    getH(t){
        if (Array.isArray(t)){
            var h0=[];
            for (var i=0;i<t.length;i++){
                h0.push(this.getH(t[i]));
            }
        }else{
            var idx=this.tint(t);
            // console.log('getH',t,idx);
            var h0;
            if (idx<0){
                h0=NaN;
            }else if(idx>this.t.length-1){
                h0=0;
            }else{
                let i0=Math.floor(idx), i1=Math.ceil(idx),di=idx%1;
                var h0=(1-di)*this.h[i0] + di*this.h[i1];
                // console.log(i0,i1,di,h0);
            };
        }
        return h0;
    }
    shiftt(t0){
        for (let i=0;i<this.t.length;i++){
            this.t[i]+=t0;
        }
        this.linedata();
    }
}

// WaveData.prototype.getH = function(t){
//     var idx=this.tint(t);
//     console.log('getH',t,idx);
//     var h0;
//     if (idx<0|idx>this.t.length-1){
//         h0=NaN;
//     }else{
//         let i0=Math.floor(idx), i1=Math.ceil(idx),di=idx%1;
//         var h0=(1-di)*this.h[i0] + di*this.h[i1];
//         console.log(i0,i1,di,h0);
//     };
//     return h0;
// }
class ScaleableWaveData extends WaveData{
    constructor(datain,mass=65,dist=420){
        super(datain);
        this.t0=0.423;
        this.M0=65;
        this.D0=420;
        this.mass=(mass)?mass:65;
        this.dist=(dist)?dist:420;
        this.scale(mass,dist);
    }
    scale(m,d,tout){
        // var tScale=(tout-this.t0)*this.M0/m + this.t0;
        // console.log('scaling from',this.M0,'to',m,'and from',this.D0,'to',d)
        this.mass=m;
        this.dist=d;
        if (!tout){
            tout=this.t;
        }
        var dout=[];
        for (var i=0;i<tout.length;i++){
            let tScale=(tout[i]-this.t0)*this.M0/m + this.t0;
            let hout=this.getH(tScale)*(this.D0/d);
            if (i%100==0){
                // console.log(tout[i],this.t0,tout[i]-this.t0,m,this.M0,tScale,hout);
            }
            if (!Number.isNaN(hout)){dout.push([tout[i],hout]);}
            
            
            // console.log([tout[i],this.getH(tScale)]);
        }
        return(new WaveData(dout));
    }
}

// ScaleableWaveData.prototype.scale=function(
function WaveFitter(params){
    var _wf=this;
    this.initData();
    this.holders={
        'param':((params.paramholder)?params.paramholder:'param-holder'),
        'graph':((params.graphholder)?params.graphholder:'graph-holder')
    }
    this.addSliders();
    this.initGraph();
    window.addEventListener("resize",function(){
        _wf.initGraph();
    });
    return this;
}

WaveFitter.prototype.initData = function(){
    this.data={dataH:new WaveData(dataH),simNR:new ScaleableWaveData(simNR)};
    // this.data.dataH.shiftt(-0.423);
    // this.data.dataSim=new ScaleableWaveData({'t':this.data.dataH.t,'h':this.data.simNR.getH(this.data.dataH.t)})
    this.ranges={mass:[20,100],dist:[100,800]}
    this.mass=this.ranges.mass[0] + Math.random()*(this.ranges.mass[1]-this.ranges.mass[0]);
    this.dist=this.ranges.dist[0] + Math.random()*(this.ranges.dist[1]-this.ranges.dist[0]);
    this.data.trange=[this.data.dataH.t[0],this.data.dataH.t.slice(-1)];
    // this.data.trange=[-0.2,0.8];
    this.data.hrange=[-2,2];
    
}

WaveFitter.prototype.setScales = function(){
    this.scales={}
    // this.scales.winFullWidth=window.outerWidth-50;
    // this.scales.winFullHeight=window.outerHeight-document.getElementById('title').clientHeight-
    // document.getElementById(this.holders.param).clientHeight-100;
    // this.scales.winAspect = this.scales.winFullWidth/this.scales.winFullHeight;
    // 
    // if (this.scales.winAspect>2){
    //     this.scales.svgHeight=this.scales.winFullHeight;
    //     this.scales.svgWidth=this.scales.svgHeight*2;
    // 
    // }else{
    //     this.scales.svgWidth=this.scales.winFullWidth;
    //     this.scales.svgHeight=this.scales.svgWidth*0.5;
    // }
    // 
    this.scales.svgWidth=Math.floor(0.8*window.outerWidth-50);
    this.scales.svgHeight=Math.floor(this.scales.svgWidth/2);
    d3.select('#about').append('p').html(window.outerWidth+' x '+window.outerHeight+'=> '+this.scales.svgWidth+' x '+this.scales.svgHeight);
    this.scales.svgMargin={'left':80,'right':10,'top':10,'bottom':80}
    this.scales.graphWidth=this.scales.svgWidth-this.scales.svgMargin.left-this.scales.svgMargin.right;
    this.scales.graphHeight=this.scales.svgHeight-this.scales.svgMargin.top-this.scales.svgMargin.bottom;
    
    // set axis scales
    this.scales.xScale = d3.scaleLinear().range([0, this.scales.graphWidth])
    this.scales.xScale.domain(this.data.trange)
    this.scales.xAxis = d3.axisBottom(this.scales.xScale)
        .tickSize(-this.scales.graphHeight)
    // this.scales.xAxis = d3.svg.axis()
    //     .scale(this.scales.xScale)
    //     .orient("bottom")
    //     .innerTickSize(-this.scales.graphHeight);
    this.scales.yScale = d3.scaleLinear().range([this.scales.graphHeight,0]);
    this.scales.yScale.domain(this.data.hrange);
    this.scales.yAxis = d3.axisLeft(this.scales.yScale)
        .tickSize(-this.scales.graphWidth)
    // this.scales.yAxis = d3.svg.axis()
    //             .scale(this.scales.yScale)
    //             .orient("left")
    //             .innerTickSize(-this.scales.graphWidth);
}
WaveFitter.prototype.initGraph = function(){
    var _wf=this;
    _wf.setScales();
    d3.select('body').style('width',this.scales.svgWidth);
    // d3.select('#about').style('width',this.scales.svgWidth);
    d3.select('#about-button').on('click',function(){showAbout();});
    d3.select('#about-close').on('click',function(){hideAbout();});
    
    var hid=d3.select('#'+this.holders.graph);
    hid.selectAll('*').remove();
    _wf.svg=hid.append('svg')
        .attr("class","graph")
        .attr("width", (_wf.scales.svgWidth)+'px')
        .attr("height", (_wf.scales.svgHeight)+'px');
    var clip = _wf.svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", _wf.scales.graphWidth )
        .attr("height", _wf.scales.graphHeight )
        .attr("x", 0)
        .attr("y", 0);
    
    // make x-axis
    // console.log(_wf.scales.svgMargin.left+"," +
        // (_wf.scales.graphHeight + _wf.scales.svgMargin.top))
    _wf.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("id","x-axis-g")
        .attr("transform", "translate("+_wf.scales.svgMargin.left+"," +
            (_wf.scales.graphHeight + _wf.scales.svgMargin.top) + ")");
    _wf.svg.select(".x-axis.axis").call(_wf.scales.xAxis)
    _wf.svg.select(".x-axis.axis").append('text')
        .attr("x", _wf.scales.graphWidth/2)
        .attr("y", (_wf.scales.svgMargin.bottom/2)+"px")
        .style("font-size",(_wf.scales.svgMargin.bottom/4)+"px")
        .attr("text-anchor","middle")
        .text('Time (s)')
        
    // make y-axis
    _wf.svg.append("g")
        .attr("class", "y-axis axis")
        .attr("id","y-axis-g")
        .attr("transform", "translate("+_wf.scales.svgMargin.left+"," +
            _wf.scales.svgMargin.top + ")");
    
    _wf.svg.select(".y-axis.axis").call(_wf.scales.yAxis)
    _wf.svg.select(".y-axis.axis").append("text")
        .attr("class", "y-axis axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("x",-_wf.scales.graphHeight/2)
        .attr("dy", (-_wf.scales.svgMargin.left/2)+"px")
        .style("font-size",(_wf.scales.svgMargin.left/4)+"px")
        .attr("text-anchor","middle")
        .text('Strain x 10^21');
    
    _wf.svg.append("g")
        .attr("id","data-g")
        .attr("transform", "translate("+_wf.scales.svgMargin.left+"," +
            (_wf.scales.svgMargin.top) + ")")
        .attr('clip-path','url(#clip)');
    
    _wf.drawData();
    _wf.addLegend();
}

WaveFitter.prototype.drawData = function(){
    var _wf=this;
    this.lineFn = d3.line()
        .x(function(d) { return _wf.scales.xScale(d.t); })
        .y(function(d) { return _wf.scales.yScale(d.h); })
    d3.select('#data-g').append('path')
        .data([_wf.data.dataH.lineData])
        .attr('class','line data')
        .attr('id','line-data')
        .attr('d',_wf.lineFn)
        .attr('stroke-width',2)
        .attr('fill','none')
    
    // console.log('draw data',this.mass,this.dist);
    _wf.data.plotSim=_wf.data.simNR.scale(_wf.mass,_wf.dist,_wf.data.dataH.t);    
    d3.select('#data-g').append('path')
        .data([_wf.data.plotSim.lineData])
        .attr('class','line sim')
        .attr('id','line-sim')
        .attr('d',_wf.lineFn)
        .attr('stroke-width',2)
        .attr('fill','none')
}
WaveFitter.prototype.addLegend = function(){
    var legg=this.svg.append('g')
        .attr('class','legend')
        .attr("transform", "translate("+(_wf.scales.svgMargin.left+_wf.scales.svgWidth*0.05)+"," +
            (_wf.scales.svgMargin.top+_wf.scales.svgHeight*0.05) + ")")
    legg.append('line')
        .attr('class','line data')
        .attr('x1',0)
        .attr('y1',0)
        .attr('x2',_wf.scales.svgWidth*0.05)
        .attr('y2',0)
    legg.append('text')
        .attr('class','leg-text data')
        .attr('x',_wf.scales.svgWidth*0.07)
        .attr('y',0)
        .text('Data')
    
    legg.append('line')
        .attr('class','line sim')
        .attr('x1',0)
        .attr('y1',30)
        .attr('x2',_wf.scales.svgWidth*0.05)
        .attr('y2',30)
    legg.append('text')
        .attr('class','leg-text sim')
        .attr('x',_wf.scales.svgWidth*0.07)
        .attr('y',30)
        .text('Simulation')
    
}
WaveFitter.prototype.updatePlot = function(dur=0){
    _wf=this;
    _wf.data.plotSim=_wf.data.simNR.scale(_wf.mass,_wf.dist,_wf.data.dataH.t);
    var path=d3.selectAll('#line-sim')
        .data([_wf.data.plotSim.lineData])
    path.transition()
        .duration(dur)
        .ease(d3.easeLinear)
        .attr('d',_wf.lineFn);
}
WaveFitter.prototype.addSliders = function(){
    var _wf=this;
    // d3.select('#'+this.holders.param).append('div')
    //     .attr('class','param-outer')
    //     .attr('id','param-title')
    // .append('h2')
    //     .html('Simulation parameters')
    let massdiv=d3.select('#'+this.holders.param).append('div')
        .attr('class','param-outer')
        .attr('id','param-mass')
    massdiv.append('div')
        .attr('class','param-title')
        .attr('id','mass-title')
        .append('h2').html('<span class="label">Total Mass<br>(M<sub>☉</sub>)</span><span class="value"></span>')
    massdiv.append('div')
        .attr('class','param-slider-outer')
    .append('div')
        .attr('class','param-slider')
        .attr('id','mass-slider')
    var mass_slider=document.getElementById('mass-slider')
    var massrange=[];
    for (var v=_wf.ranges.mass[0];v<=_wf.ranges.mass[1];v+=10){massrange.push(v);}
    var pipFormats={'0':'a','1':'b'};
    noUiSlider.create(mass_slider, {
        start: [_wf.mass],
        connect: true,
        range: {
            'min': _wf.ranges.mass[0],
            'max': _wf.ranges.mass[1]
        },
        tooltips:[true],
        pips: {mode: 'positions', values: [0,100],density:100,},
    } );
    mass_slider.noUiSlider.on('update',function(values,handle){
        var value = values[handle];
        // d3.select('#mass-title').select('span.value').html(value);
        _wf.mass=value;
        _wf.updatePlot(0);
    })
    d3.select(mass_slider).selectAll('.noUi-value').on('click',function(){
        mass_slider.noUiSlider.set(Number(this.getAttribute('data-value')))
    });
    
    let distdiv=d3.select('#'+this.holders.param).append('div')
        .attr('class','param-outer')
        .attr('id','param-dist')
    distdiv.append('div')
        .attr('class','param-title')
        .attr('id','dist-title')
        .append('h2').html('<span class="label">Distance<br>(Mpc)</span><span class="value"></span>')
    distdiv.append('div')
        .attr('class','param-slider-outer')
    .append('div')
        .attr('class','param-slider')
        .attr('id','dist-slider')
    var dist_slider=document.getElementById('dist-slider');
    var distrange=[];
    for (var v=_wf.ranges.dist[0];v<=_wf.ranges.dist[1];v+=100){distrange.push(v);}
    noUiSlider.create(dist_slider, {
        start: [_wf.dist],
        connect: true,
        range: {
            'min': _wf.ranges.dist[0],
            'max': _wf.ranges.dist[1]
        },
        tooltips:[true],
        pips: {mode: 'positions', values: [0,100],density:100}
    });
    dist_slider.noUiSlider.on('update',function(values,handle){
        var value = values[handle];
        // d3.select('#dist-title').select('span.value').html(value);
        _wf.dist=value;
        _wf.updatePlot(100);
    })
    d3.select(dist_slider).selectAll('.noUi-value').on('click',function(){
        dist_slider.noUiSlider.set(Number(this.getAttribute('data-value')))
    });
}

function showAbout(){
    console.log('showing About');
    d3.select('#about')
        .classed('on',true)
        .transition()
        .duration(500)
        .style('height','75%')
}
function hideAbout(){
    console.log('hiding About');
    d3.select('#about')
        .classed('on',false)
        .transition()
        .duration(500)
        .style('height',0)
}