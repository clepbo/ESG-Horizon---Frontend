// import Highcharts from 'highcharts';
// import HighchartsReact from 'highcharts-react-official';

// // No need for HighchartsMore!

// interface GaugeChartProps {
//   baselineEmission: number;
//   currentEmission: number;
//   targetEmission: number;
// }

// function GaugeChart({ baselineEmission, currentEmission, targetEmission }: GaugeChartProps) {
//   const percentage = Math.round((currentEmission / baselineEmission) * 100);
//   const maxValue = Math.ceil(baselineEmission * 1.1);
  
//   const chartOptions = {
//     chart: {
//       type: 'solidgauge',
//       height: 300
//     },

//     title: {
//       text: 'Emissions Reduction Progress',
//       style: {
//         fontSize: '16px',
//         fontWeight: 'bold'
//       }
//     },

//     pane: {
//       center: ['50%', '85%'],
//       size: '140%',
//       startAngle: -90,
//       endAngle: 90,
//       background: {
//         backgroundColor: '#EEE',
//         innerRadius: '60%',
//         outerRadius: '100%',
//         shape: 'arc'
//       }
//     },

//     yAxis: {
//       min: 0,
//       max: maxValue,
//       lineWidth: 0,
//       tickWidth: 0,
//       minorTickInterval: null,
//       tickAmount: 2,
//       title: {
//         y: -70
//       },
//       labels: {
//         y: 16,
//         formatter: function() {
//           return this.value.toLocaleString() + ' tCO₂e';
//         }
//       }
//     },

//     plotOptions: {
//       solidgauge: {
//         dataLabels: {
//           y: 5,
//           borderWidth: 0,
//           useHTML: true
//         }
//       }
//     },

//     series: [{
//       name: 'Emissions',
//       data: [currentEmission],
//       dataLabels: {
//         format: `
//           <div style="text-align: center;">
//             <div style="font-size: 24px; font-weight: bold; color: #1F2937;">{y}</div>
//             <div style="font-size: 16px; color: #6B7280;">tCO₂e</div>
//             <div style="font-size: 14px; color: #3B82F6; margin-top: 8px;">${percentage}% of baseline</div>
//           </div>
//         `
//       },
//       tooltip: {
//         valueSuffix: ' tCO₂e'
//       }
//     }],

//     credits: {
//       enabled: false
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg p-6 shadow-sm">
//       <HighchartsReact
//         highcharts={Highcharts}
//         options={chartOptions}
//       />
      
//       {/* Data summary cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
//         <div className="text-center p-4 bg-gray-50 rounded-lg">
//           <div className="text-lg font-semibold text-gray-900">
//             {baselineEmission.toLocaleString()} tCO₂e
//           </div>
//           <div className="text-sm text-gray-600">Baseline Year Emission</div>
//         </div>
        
//         <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
//           <div className="text-lg font-semibold text-blue-700">
//             {currentEmission.toLocaleString()} tCO₂e ({percentage}%)
//           </div>
//           <div className="text-sm text-blue-600">Current Emission</div>
//         </div>
        
//         <div className="text-center p-4 bg-green-50 rounded-lg">
//           <div className="text-lg font-semibold text-gray-900">
//             {targetEmission.toLocaleString()} tCO₂e
//           </div>
//           <div className="text-sm text-gray-600">Target Year Emission</div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Usage example:
// export function EmissionsDashboard() {
//   return (
//     <GaugeChart 
//       baselineEmission={26830}
//       currentEmission={17425}
//       targetEmission={11537}
//     />
//   );
// }



// Highcharts.chart('container', {

//     chart: {
//         type: 'gauge',
//         plotBackgroundColor: null,
//         plotBackgroundImage: null,
//         plotBorderWidth: 0,
//         plotShadow: false,
//         height: '80%'
//     },

//     title: {
//         text: 'Speedometer'
//     },

//     pane: {
//         startAngle: -90,
//         endAngle: 89.9,
//         background: null,
//         center: ['50%', '75%'],
//         size: '110%'
//     },

//     // the value axis
//     yAxis: {
//         min: 0,
//         max: 200,
//         tickPixelInterval: 72,
//         tickPosition: 'inside',
//         tickColor: 'var(--highcharts-background-color, #FFFFFF)',
//         tickLength: 20,
//         tickWidth: 2,
//         minorTickInterval: null,
//         labels: {
//             distance: 20,
//             style: {
//                 fontSize: '14px'
//             }
//         },
//         lineWidth: 0,
//         plotBands: [ {
//             from: 0,
//             to: 150,
//             color: '#DDDF0D', // yellow
//             thickness: 20,
//             borderRadius: '50%'
//         }, {
//             from: 150,
//             to: 200,
//             color: '#DF5353', // red
//             thickness: 20,
//             borderRadius: '50%'
//         }]
//     },

//     series: [{
//         name: 'Speed',
//         data: [80],
//         tooltip: {
//             valueSuffix: ' km/h'
//         },
//         dataLabels: {
//             format: '{y} km/h',
//             borderWidth: 0,
//             color: (
//                 Highcharts.defaultOptions.title &&
//                 Highcharts.defaultOptions.title.style &&
//                 Highcharts.defaultOptions.title.style.color
//             ) || '#333333',
//             style: {
//                 fontSize: '16px'
//             }
//         },
//         dial: {
//             radius: '80%',
//             backgroundColor: 'gray',
//             baseWidth: 12,
//             baseLength: '0%',
//             rearLength: '0%'
//         },
//         pivot: {
//             backgroundColor: 'gray',
//             radius: 6
//         }

//     }]

// });

// // Add some life
// setInterval(() => {
//     const chart = Highcharts.charts[0];
//     if (chart && !chart.renderer.forExport) {
//         const point = chart.series[0].points[0],
//             inc = Math.round((Math.random() - 0.5) * 20);

//         let newVal = point.y + inc;
//         if (newVal < 0 || newVal > 200) {
//             newVal = point.y - inc;
//         }

//         point.update(newVal);
//     }

// }, 3000);