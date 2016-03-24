function rand(max){
    return Math.round(Math.random() * max);
}

function Point(x,y,radius)
{
    this.X = x;
    this.Y = y;
    this.VectorRadius = radius;
    this.Speed = rand(80);
    this.Existance = Date.now();
}

function Distance(p1,p2)
{
    this.aq = Math.pow(Math.abs(p1.X-p2.X),2);
    this.bq = Math.pow(Math.abs(p1.Y-p2.Y),2);
    this.cq = aq + bq;
    return Math.sqrt(cq);
}

function toRadians (angle) {
    return angle * (Math.PI / 180);
}

function Polar(x,y,radius,length){
    var p = new Point(x,y,radius);
    p.X = Math.cos(toRadians(radius))*length+x;
    p.Y = Math.sin(toRadians(radius))*length+y;
    return p;
}

var PolyMatrix = {
    tick: 0,
    canvas: null,
    context: null,

    height: 0,
    width: 0,

    points: [],
    maxPoints: 32,

    lastTick: Date.now(),
    maxFPS: 144,

    /*
     0 left
     1 top
     2 right
     3 bottom
     */
    getRandomPointOnSide: function() {
        var site = rand(3);

        var point;

        switch(site)
        {
            case 0: point = new Point(0,rand(this.height),rand(180)-90); break;
            case 1: point = new Point(rand(this.width),0,rand(180)); break;
            case 2: point = new Point(this.width,rand(this.height),90+rand(180)); break;
            case 3: point = new Point(rand(this.width),this.height,180+rand(180)); break;
        }

        return point;
    },

    getRandomPoint: function() {
        var site = rand(3);

        var point;

        point = new Point(rand(this.width),rand(this.height),rand(360));

        return point;
    },

    // Result := Point(Round(cos(Angle)*Length+X), Round(sin(Angle)*Length+Y));
    update: function(delta) {
        for(var c = 0; c < PolyMatrix.points.length; c++){
            this.points[c] = Polar(this.points[c].X, this.points[c].Y,this.points[c].VectorRadius,delta*this.points[c].Speed);

            if ((this.points[c].X < -150) || (this.points[c].X > this.width + 150) ||
                (this.points[c].Y < -150) || (this.points[c].Y > this.height + 150))
            {
                this.points[c] = this.getRandomPoint();
            }
        }
    },

    draw: function() {

        this.context.clearRect(0,0,this.width,this.height);

        for(var c = 0; c < PolyMatrix.points.length; c++){
            var p = PolyMatrix.points[c];
            var connections = 0;

            for(var cc = 0; cc < PolyMatrix.points.length; cc++){
                var pc = this.points[cc];

                if (cc != c)
                {
                    var d = Distance(pc,p);
                    if (d < 150 && p.X >= pc.X)
                    {
                        var opacity = ((1/150)*d-1)*-1/7;
                        this.context.beginPath();
                        this.context.moveTo(p.X, p.Y);
                        this.context.lineTo(pc.X,pc.Y);
                        this.context.closePath();
                        connections += 1;
                        this.context.strokeStyle = 'rgba(255,255,255,'+opacity+')';
                        this.context.stroke();
                    }
                }
            }

            var op = connections*0.1/5;
            this.context.beginPath();
            this.context.arc(p.X, p.Y, connections * 0.2 + 0.4, 0, 2 * Math.PI, true);
            this.context.closePath();
            this.context.strokeStyle = 'rgba(255,255,255,'+op+')';
            this.context.fillStyle = 'rgba(255,255,255,'+op+')';

            this.context.fill();
            this.context.stroke();
        }
    },

    initialize: function(CanvasDOM) {
        this.width = $('#polycanvas').width();
        this.height = $('#polycanvas').height();

        console.log(this.width);

        this.canvas = document.getElementById(CanvasDOM);
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = this.canvas.getContext('2d');
        this.lastTick = Date.now();
    },

    balancePoints: function(){
        do
        {
            if (this.points.length < this.maxPoints)
                PolyMatrix.points[PolyMatrix.points.length] = PolyMatrix.getRandomPoint();
            else if (this.points.length > this.maxPoints)
                this.points.splice(0, 1);
        } while(this.points.length != this.maxPoints);
    },

    _step: function() {
        window.requestAnimationFrame(PolyMatrix._step);

        var interval = 1000 / PolyMatrix.maxFPS;
        var now = Date.now();
        var delta = now - PolyMatrix.lastTick;

        if (delta > interval)
        {
            PolyMatrix.balancePoints();
            PolyMatrix.update(delta/1000);
            PolyMatrix.draw();

            PolyMatrix.lastTick = now - (delta % interval);

        }
    }
};


$(document).ready(function(){
    $('*').resize(function(){
        PolyMatrix.initialize('polycanvas');
        PolyMatrix.maxPoints = Math.round(PolyMatrix.width/10);
    });
    PolyMatrix.maxPoints = Math.round($('#polycanvas').width()/10);
    PolyMatrix.initialize('polycanvas');

    PolyMatrix.draw();
    window.requestAnimationFrame(PolyMatrix._step);
});