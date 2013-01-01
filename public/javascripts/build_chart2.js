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
                                chart2_options.xAxis.categories.push(new Date(dates_sorted[i]).toString("ddd MMM dd yyyy"));

                                occurances.push(data[index].total_activity > 0 ? data[index].total_activity : 0);
                                amount.push(data[index].total_amount > 0 ? data[index].total_amount : 0);

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
