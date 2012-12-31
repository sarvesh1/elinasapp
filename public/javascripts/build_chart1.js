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

			//assume data is in sorted order
			 for (var item in data) {
				options.xAxis.categories.push(new Date(item).toString("d-MMM-yyyy"));
				eat.push((data[item].eat > 0) ? data[item].eat : 0);
				poop.push((data[item].poop > 0) ? data[item].poop : 0);
				pee.push((data[item].pee > 0) ? data[item].pee : 0);
				other.push((data[item].other > 0) ? data[item].other: 0);
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
