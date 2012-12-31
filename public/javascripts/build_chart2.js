var chart2; // globally available
$(document).ready(function() {

      chart2_options = {
         chart: {
            renderTo: 'chart2_container',
            type: 'line',
         },
         title: {
            text: 'Feedings Amounts'
         },
         xAxis: {
            categories: []
         },
         yAxis: {
            title: {
               text: 'Number of mL'
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
		url: '/activity/feedings',
		success: function(data) {
			occurances = [];
			amount = [];

			//assume data is in sorted order
			 for (var item in data) {
				chart2_options.xAxis.categories.push(new Date(item).toString("d-MMM-yyyy"));
				occurances.push((data[item].total_activity > 0) ? data[item].total_activity : 0);
				amount.push((data[item].total_amount > 0) ? data[item].total_amount : 0);
			 }
			 chart2_options.series.push({"name":"Occurances","data":occurances});
			 chart2_options.series.push({"name":"Amount","data":amount});

      			chart = new Highcharts.Chart(chart2_options);

		},
		cache: false
	    });
	}

	requestData(chart2);

});
