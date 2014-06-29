function createChart(monthName, monthDays, monthRx, monthTx, totalRx, totalTx){
	$(function() {
		var categories = [
		            '1st', 
					'2nd', 
					'3rd', 
					'4th', 
					'5th', 
					'6th', 
					'7th', 
					'8th', 
					'9th', 
					'10th',
					'11th',
					'12th',
					'13th',
					'14th',
					'15th',
					'16th',
					'17th',
					'18th',
					'19th',
					'20th',
					'21st',
					'22nd',
					'23rd',
					'24th',
					'25th',
					'26th',
					'27th',
					'28th',
					'29th',
					'30th',
					'31st'
		        ];
		categories = categories.slice(0, monthDays);

		$('.chartContainer').highcharts({
		    chart: {
		        type: 'column'
		    },
		    title: {
		        text: 'Monthly data usage for ' + monthName
		    },
		    subtitle: {
		        text: '<b>Total Rx:</b> '+totalRx+'GB<br><b>Total Tx:</b> '+totalTx+'GB',
		        useHTML: true
		    },
		    xAxis: {
		        categories: categories
		    },
		    yAxis: {
		        min: 0,
		        title: {
		            text: 'Data usage(GB)'
		        }
		    },
		    tooltip: {
		        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
		        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
		            '<td style="padding:0"><b>{point.y:.1f} GB</b></td></tr>',
		        footerFormat: '</table>',
		        shared: true,
		        useHTML: true
		    },
		    plotOptions: {
		        column: {
		            pointPadding: 0.2,
		            borderWidth: 0
		        }
		    },
		    series: [{
		        name: 'Rx',
		        data: monthRx

		    }, {
		        name: 'Tx',
		        data: monthTx

		    }]
		});
	});
}