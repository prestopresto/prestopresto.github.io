// adapted with lot of kudos from: http://tympanus.net/codrops/2014/09/23/animated-background-headers/
// changes:
// - add pixel density support
// TODO:
// - improve code,
// - code cleaning,
// - try a faster implementation of delaunay

var FILL_COLORS = [
    '51, 236, 195',
]

function Header() {
    // var EDGE_STROKE_COLOR = 'rgba(150,150,150,.4)'
    // var CIRCLE_FILL_COLOR = 'rgba(150,150,150,.4)'
    var EDGE_STROKE_COLOR = 'rgba(0, 0, 0, .65)'
    var CIRCLE_FILL_COLOR = 'rgb(255, 0, 200)'

    var width, height, largeHeader, canvas, ctx, points, target, triangles, animateHeader = true;
    var pointDistanceRatio = window.innerWidth / 280
    var triangleIdx = 0

    var devicePixelRatio = window.devicePixelRatio || 1

    // Main
    initHeader();
    initAnimation();
    addListeners();

    function setCanvasSize(canvas) {
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      canvas.style.width = width + "px"
      canvas.style.height = height + "px"
      ctx = canvas.getContext('2d');
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    function initHeader() {
        width = window.innerWidth;
        height = window.innerHeight;
        target = {x: 100, y: 100};

        // largeHeader = document.getElementById('hero');
        // largeHeader.style.height = height+'px';

        canvas = document.getElementById('canvas');
        setCanvasSize(canvas)

        // create points
        points = []

        for(var x = -200; x < width + 200; x = x + width/pointDistanceRatio) {
            for(var y = -200; y < height + 200; y = y + height/pointDistanceRatio) {
                var px = x + Math.random()*width/pointDistanceRatio;
                var py = y + Math.random()*height/pointDistanceRatio;
                var p = {0: x, 1: y, x: px, originX: px, y: py, originY: py };
                points.push(p);
            }
        }

        // add logo points
        var logoPoints = {
            topShape: [
                {x: 152, y: 169},
                {x: 114, y: 169},
                {x: 5, y: 5},
                {x: 5, y: 5},
                {x: 184, y: 169}
            ],
            bottomShape: [
                {x: 5, y: 87},
                {x: 5, y: 5},
                {x: 126, y: 5},
                {x: 126, y: 5}
            ]
        }

        triangles = triangulate(points);

        // assign a circle to each point
        for(var i in triangles) {
            ['v0','v1','v2'].forEach(function(k) {
                var vertex = triangles[i][k]
                var c = new Circle(vertex, 2+Math.random()*2, CIRCLE_FILL_COLOR);
                vertex.circle = c;
            })
        }
    }

    // Event handling
    function addListeners() {
        if(!('ontouchstart' in window)) {
            window.addEventListener('mousemove', mouseMove);
            window.addEventListener('scroll', onScroll);
        }
        // window.addEventListener('scroll', scrollCheck);
        // window.addEventListener('resize', resize);
    }

    function onScroll(e) {
        // var posx = posy = 0;

        // posx = window.scrollX;
        // posy = window.scrollY + window.innerHeight;

        // target.x = posx;
        // target.y = posy;
    }

    function mouseMove(e) {
        var posx = posy = 0;

        if (e.pageX || e.pageY) {
            posx = e.pageX - window.scrollX;
            posy = e.pageY - window.scrollY;
        }

        else if (e.clientX || e.clientY)    {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        target.x = posx;
        target.y = posy;
    }

    function scrollCheck() {
        if(document.body.scrollTop > height) animateHeader = false;
        else animateHeader = true;
    }

    function resize() {
        setCanvasSize(canvas);
    }

    // animation
    function initAnimation() {
        animate();
        for(var i in triangles) {
            shiftPoint(triangles[i]);
        }
    }


    function animate() {
      var currentPoint, currentPointDistance, ratio
        if(animateHeader) {
            // clear the context
            ctx.clearRect(0,0,width,height);
            // // rotation first
            //ctx.translate(100,100);
            //ctx.rotate(target.x);
            //ctx.translate(-100,-100);

            // than scale
            //ctx.translate(0,200 * (1/3) / 2) // move by half of the 1/3 space to center it
            //ctx.scale(1, 2/3); // squish it to 2/3 vertical size
            for(var i in triangles) {
                // if(i % 9 !== 0) {
                //     continue;
                // }
                // detect points in range
                currentPoint = triangles[i]
                currentPoint.x = currentPoint.v0.x
                currentPoint.y = currentPoint.v0.y
                currentPointDistance = Math.abs(getDistance(target, currentPoint))
                currentPoint.active = ((currentPointDistance / (480 * 1000)) * 100) / (1.0 * 100)
                //currentPoint.fillColorIdx = Math.pow(2, ((currentPointDistance / 2000000) * 100) / (10 * 100))
                // newValue = (((oldValue - oldMin) * (newMax - newMin)) / (oldMax - oldMin))  + newMin
                currentPoint.fillColorIdx = Math.round((((currentPointDistance - 1000) * (FILL_COLORS.length - 1)) / (2000000 - 1)) + 1)
                //currentPoint.active = (currentPointDistance / 20000000)
                currentPoint['v0'].circle.active = currentPointDistance / 100
                currentPoint['v0'].circle.radiusRatio = (currentPointDistance / 2000000)
                ctx.beginPath();
                drawLines(currentPoint);
                ctx.closePath();
                currentPoint['v0'].circle.draw();
            }
            //requestAnimationFrame(animate);
        }
        
    }

    function shiftPoint(triangle) {
        p = triangle
        TweenLite
          .to(p.v0, 6+1*Math.random(), {
              x: p.originX-70+Math.random()*120,
              y: p.originY-70+Math.random()*120, ease:Power4.easeInOut,
              onComplete: function() {
                  shiftPoint(p);
              }
          });
    }

    // Canvas manipulation
    function drawLines(p) {
        var op = 0
        if(!p.active) return;
          var triangle = p//triangles[i]
          ctx.lineWidth = 1
          ctx.moveTo(triangle.v0.x, triangle.v0.y);
          ctx.lineTo(triangle.v1.x, triangle.v1.y);
          ctx.lineTo(triangle.v2.x, triangle.v2.y);
          op = 0.5 - p.active
          ctx.fillStyle = 'rgba('+FILL_COLORS[p.fillColorIdx-1]+', '+op+')';
          //ctx.fillStyle = 'rgba(0, 0, 10,'+0+')';
          //ctx.strokeStyle = 'rgba(200, 10, 50, '+0.1+')';
          //ctx.strokeStyle = 'rgba(255, 255, 255, .009)';
          //ctx.stroke();
          ctx.fill();
    }

    function Circle(pos,rad,color) {
        var _this = this;

        // constructor
        (function() {
            _this.pos = pos || null;
            _this.radius = rad || null;
            _this.color = color || null;
        })();

        this.draw = function() {
            if(!_this.active) return;
            ctx.beginPath();
            ctx.arc(_this.pos.x, _this.pos.y, _this.radius * _this.radiusRatio, 0, 2 * Math.PI, false);
            //ctx.fillStyle = 'rgba(255,0,75,'+ _this.active+')';
            // ctx.fillStyle = 'rgba(90,90,250,'+ _this.active+')';
            //ctx.fill();
        };
    }

    // Util
    function getDistance(p1, p2) {
        return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }

};

setTimeout(function() {
  var head = new Header()
}, 0)
