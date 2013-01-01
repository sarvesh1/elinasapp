var chart1; // globally available
$(document).ready(function() {

      options = {
         chart: {
            renderTo: 'chart1_container',
            type: 'line',
         },
         title: {
            text: 'Activity Count'
         },
         xAxis: {
            categories: []
         },
         yAxis: {
            title: {
               text: 'Number of times'
            },
	    plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
            }]
         },
        series: []
      };


	function requestData(chart) {
	    $.ajax({
		url: '/activity/bydate',
		success: function(data) {
		        var eat = [];
        		var poop = [];
        		var pee = [];
        		var other = [];

			//sort dates so the chart makes sense
			var dates_sorted = [];
			for (var item in data) {
				dates_sorted.push(new Date(item));
			}

			//reverse sort
			dates_sorted.sort(function(a,b){
				var ad = new Date(a);
				var bd = new Date(b);
			
				if(ad > bd) return -1;
				if(ad < bd) return 1;
				return 0;
			});

			 for (var i=0; i<dates_sorted.length && i<7; i++) {
				var index = new Date(dates_sorted[i]).toString("ddd MMM dd yyyy");
				options.xAxis.categories.push(new Date(dates_sorted[i]).toString("ddd MMM dd yyyy"));
		
				eat.push(data[index].eat > 0 ? data[index].eat : 0);
				poop.push(data[index].poop > 0 ? data[index].poop : 0);
				pee.push(data[index].pee > 0 ? data[index].pee : 0);
				other.push(data[index].other > 0 ? data[index].other : 0);

			 }
			 options.series.push({"name":"Eat","data":eat});
			 options.series.push({"name":"Poop","data":poop});
			 options.series.push({"name":"Pee","data":pee});
			 options.series.push({"name":"Other","data":other});

      			chart = new Highcharts.Chart(options);

		},
		cache: false
	    });
	}

	requestData(chart1);

});
