function App() {
    this.currentUrl = "https://script.google.com/macros/s/AKfycbxy5-UvXO5X_TphIsqoMr2MUijpSVrF38hJm7OoKzpIGWWuNOXy/exec";
    this.dataUrl_pre = this.currentUrl + '?type=timedyarr';
    this.dataUrl = '';
    this.dyGraphColumn = ['x', 'm', 'p'];

    this.graphConfig = {
        // legend
        legend: 'always',
        // series
        series: {
            'p': {
                axis: 'y2',
                stepPlot: true,
                strokeWidth: 1,
                color: '#EA814D'
            },
            'm': {
                axis: 'y1',
                strokeWidth: 2,
                color: '#559E3C'
            }
        },
        // axes
        axes: {
            y2: {
                independentTicks: true,
                valueRange: [0, 7000]
            }
        },
        // axis
        axisLineWidth: 2,
        axisLineColor: '#555',
        axisLabelColor: '#555',
        // data line display
        drawGapEdgePoints: false,
        colorValue: 0.71,
        colorSaturation: 0.5,
        connectSeparatedPoints: true,
        // grid
        gridLineColor: '#ddd',
        gridLineWidth: 0.5,
        // Interactive Elements
        animatedZooms: true,
        hideOverlayOnMouseOut: false,
        highlightCircleSize: 4,
        labelsSeparateLines: true,
        // dataformat
        labels: this.dyGraphColumn
    };

    this.dyg = null;
    this.dyColumns = null;
    this.dyData = null;

    this.paramChange = function() {
        var mpkwh = Number(document.getElementById('mpkwh').value);
        var minduration = Number(document.getElementById('minduration').value) * 1000;

        if (isNaN(mpkwh) || isNaN(minduration) || mpkwh <= 0 || minduration <= 0)
            return;

        var pIndex = this.dyGraphColumn.indexOf('p');
        if (pIndex == -1) {
            this.dyGraphColumn.push('p');
            pIndex = this.dyGraphColumn.indexOf('p');
        }

        for (var i = 1; i < this.dyData.length; i++) {
            for (var t = i - 1; t >= 0; t--) {
                if (this.dyData[i][0] - this.dyData[t][0] >= minduration) {
                    this.dyData[i - 1][pIndex] = (this.dyData[i][1] - this.dyData[t][1]) / mpkwh / ((this.dyData[t][0] - this.dyData[i][0]) / 3600 / 1000) * 1000;
                    break;
                }
            }
            if (t < 0) {
                this.dyData[i - 1][pIndex] = 0;
            }
        }
        this.dyData[i - 1][pIndex] = this.dyData[i - 2][pIndex];

        this.dyg.updateOptions({
            labels: this.dyGraphColumn,
            file: this.dyData
        });
    };

    this.urlChange = function() {
        var datestr = document.getElementById('date').value;

        var today = new Date(datestr);
        today.setTime(today.getTime() + today.getTimezoneOffset() * 60 * 1000);

        var tomorrow = new Date(datestr);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setTime(tomorrow.getTime() + tomorrow.getTimezoneOffset() * 60 * 1000);

        this.dataUrl = this.dataUrl_pre + "&from=" + today.valueOf() + "&to=" + tomorrow.valueOf();
    };

    this.showDyg = function() {
        var xmlhttp = new XMLHttpRequest();
        var appObj = this;
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var responseArr = JSON.parse(xmlhttp.responseText, function(k, v) {
                    return (k == '0' && !(v instanceof Object)) && new Date(v) || v;
                });
                appObj.dyColumns = responseArr[0];
                appObj.dyData = responseArr[1];
                var graphDiv = document.getElementById('graph-div');
                console.log("[showDyg]showing dyGraphs with " + appObj.dyData.length + " data");
                appObj.dyg = new Dygraph(graphDiv, appObj.dyData, appObj.graphConfig);
                appObj.paramChange();
            } else {
                console.log("[xmlhttp]network status:" + xmlhttp.readyState + ',' + xmlhttp.status);
            }
        };
        xmlhttp.open("GET", this.dataUrl, true);
        xmlhttp.send();
    };

    this.regInputListener = function() {
        var inputs = document.querySelectorAll('#param-form input');
        var context = this;
        document.getElementById('mpkwh').oninput = function() {
            context.paramChange();
        };
        document.getElementById('minduration').oninput = function() {
            context.paramChange();
        };
        document.getElementById('date').onchange = function() {
            context.urlChange();
            context.showDyg();
        };
    };
}

var firejs = function() {
    console.log('[ready]');
    window.app = new App();
    app.regInputListener();
    app.urlChange();
    app.showDyg();
};
