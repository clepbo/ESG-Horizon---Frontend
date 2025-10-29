// import React from 'react';
// import Highcharts from 'highcharts';
// import HighchartsReact from 'highcharts-react-official';
// import 'highcharts/highcharts-more';

// interface GuageProps {
//   score: number
// }
// const SpeedometerGauge: React.FC<GuageProps> = ({score}) => {
//   const options: Highcharts.Options = {
//     chart: {
//       type: 'gauge',
//       plotBackgroundColor: "",
//       plotBackgroundImage: "",
//       plotBorderWidth: 0,
//       plotShadow: false,
//       height: '80%'
//     },
//     title: {
//       text: 'Overall ESG Performance'
//     },
//     pane: {
//   startAngle: -90,
//   endAngle: 89.9,
//   background: undefined,
//   center: ['50%', '75%'],
//   size: '110%'
// },
// credits: {
//     enabled: false
//   },
//     yAxis: {
//       min: 0,
//       max: 200,
//       tickPixelInterval: 72,
//       tickPosition: 'inside',
//       tickColor: '#FFFFFF',
//       tickLength: 20,
//       tickWidth: 2,
//       minorTickInterval: undefined,
//       labels: {
//         enabled: false,
//         distance: 20,
//         style: {
//           fontSize: '14px'
//         }
//       },
//       lineWidth: 0,
//       plotBands: [{
//         from: 0,
//         to: score,
//         color: '#119B95',
//         thickness: 20
//       }, {
//         from: score,
//         to: 200,
//         color: '#CDFAF3',
//         thickness: 20
//       }]
//     },
//     series: [{
//       type: 'gauge',
//       name: 'Speed',
//       data: [score],
//       tooltip: {
//         valueSuffix: ' km/h'
//       },
//       dataLabels: {
//         format: '{y} km/h',
//         borderWidth: 0,
//         color: '#333333',
//         style: {
//           fontSize: '16px'
//         }
//       },
//       dial: {
//         radius: '80%',
//         backgroundColor: '#119B95',
//         baseWidth: 12,
//         baseLength: '0%',
//         rearLength: '0%'
//       },
//       pivot: {
//         backgroundColor: '#119B95',
//         radius: 6
//       }
//     }]
//   };

//   return (
//     <div className="highcharts-figure" style={{ minWidth: '310px', maxWidth: '500px', margin: '1em auto' }}>
//       <HighchartsReact
//         highcharts={Highcharts}
//         options={options}
//       />
//     </div>
//   );
// };

// export default SpeedometerGauge;


import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import 'highcharts/highcharts-more';

interface GuageProps {
  score: number;
  initialEmission: string
}

const SpeedometerGauge: React.FC<GuageProps> = ({ score, initialEmission }) => {
 const options: Highcharts.Options = {
    chart: {
      type: 'gauge',
      plotBackgroundColor: "",
      plotBackgroundImage: "",
      plotBorderWidth: 0,
      plotShadow: false,
      height: '80%'
    },
    title: {
      text: 'Overall ESG Performance'
    },
    pane: {
  startAngle: -90,
  endAngle: 89.9,
  background: undefined,
  center: ['50%', '75%'],
  size: '110%'
},
credits: {
    enabled: false
  },
    yAxis: {
      min: 0,
      max: 200,
      tickPixelInterval: 72,
      tickPosition: 'inside',
      tickColor: '#FFFFFF',
      tickLength: 20,
      tickWidth: 2,
      minorTickInterval: undefined,
      labels: {
        enabled: false,
        distance: 20,
        style: {
          fontSize: '14px'
        }
      },
      lineWidth: 0,
      plotBands: [{
        from: 0,
        to: score,
        color: '#119B95',
        thickness: 20
      }, {
        from: score,
        to: 200,
        color: '#CDFAF3',
        thickness: 20
      }]
    },
    series: [{
      type: 'gauge',
      name: 'Speed',
      data: [score],
      tooltip: {
        valueSuffix: ' km/h'
      },
      dataLabels: {
        format: '{y} km/h',
        borderWidth: 0,
        color: '#333333',
        style: {
          fontSize: '16px'
        }
      },
      dial: {
        radius: '80%',
        backgroundColor: '#119B95',
        baseWidth: 12,
        baseLength: '0%',
        rearLength: '0%'
      },
      pivot: {
        backgroundColor: '#119B95',
        radius: 6
      }
    }]
  };

  return (
    <div className="highcharts-figure" style={{ minWidth: '310px', maxWidth: '800px', margin: '1em auto' }}>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginTop: '3px',
        padding: '0 5px',
        position: 'relative'
      }}>
        {/* Label 1 - Left (Start) */}
        <div style={{ 
          textAlign: 'center',
          fontSize: "8px",
          transform: 'translateX(-10px)'
        }}>
          <div style={{ 
            fontWeight: '',
            color: 'red',
            fontSize: '8px'
          }}>
            {initialEmission}
          </div>
          <div style={{ 
            color: '#666',
            fontSize: '8px',
            marginTop: '4px',
            fontWeight: "bold"
          }}>
            Baseline year emission
          </div>
        </div>

        {/* Label 2 - Center (Middle) */}
        <div style={{ 
          textAlign: 'center',
          fontSize: "8px",
          transform: 'translateX(-10px)'
        }}>
          <div style={{ 
            fontWeight: '',
            color: 'red',
            fontSize: '8px'
          }}>
            {initialEmission}
          </div>
          <div style={{ 
            color: '#666',
            fontSize: '8px',
            marginTop: '4px',
            fontWeight: "bold"
          }}>
            Current emission
          </div>
        </div>

        {/* Label 3 - Right (End) */}
        <div style={{ 
          textAlign: 'center',
          fontSize: "8px",
          transform: 'translateX(-10px)'
        }}>
          <div style={{ 
            fontWeight: '',
            color: 'red',
            fontSize: '8px'
          }}>
            {initialEmission}
          </div>
          <div style={{ 
            color: '#666',
            fontSize: '8px',
            marginTop: '4px',
            fontWeight: "bold"
          }}>
            Target year emission
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeedometerGauge;