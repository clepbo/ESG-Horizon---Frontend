import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "highcharts/highcharts-more";
import { formatNumberFigures } from "./FormatNumberFigures";

interface GuageProps {
  score: number;
  initialEmission: number | string;
  currentEmission: number | string;
  targetEmission: number | string;
}

function toEmissionFigure(value: number | string): string {
  const num = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  return formatNumberFigures(Number.isNaN(num) ? 0 : num);
}

const SpeedometerGauge: React.FC<GuageProps> = ({
  score,
  initialEmission,
  currentEmission,
  targetEmission,
}) => {
  const initial = toEmissionFigure(initialEmission);
  const current = toEmissionFigure(currentEmission);
  const target = toEmissionFigure(targetEmission);
  const options: Highcharts.Options = {
    chart: {
      type: "gauge",
      plotBackgroundColor: "",
      plotBackgroundImage: "",
      plotBorderWidth: 0,
      plotShadow: false,
      height: "85%",
    },
    title: {
      text: "Overall ESG Performance",
      style: { fontSize: "18px" },
    },
    pane: {
      startAngle: -90,
      endAngle: 89.9,
      background: undefined,
      center: ["50%", "75%"],
      size: "125%",
    },
    credits: {
      enabled: false,
    },
    yAxis: {
      min: 0,
      max: 200,
      tickPixelInterval: 72,
      tickPosition: "inside",
      tickColor: "#FFFFFF",
      tickLength: 26,
      tickWidth: 2,
      minorTickInterval: undefined,
      labels: {
        enabled: false,
        distance: 20,
        style: {
          fontSize: "16px",
        },
      },
      lineWidth: 0,
      plotBands: [
        {
          from: 0,
          to: score,
          color: "#119B95",
          thickness: 26,
        },
        {
          from: score,
          to: 200,
          color: "#CDFAF3",
          thickness: 26,
        },
      ],
    },
    series: [
      {
        type: "gauge",
        name: "Speed",
        data: [score],
        tooltip: {
          valueSuffix: "",
        },
        dataLabels: {
          format: `tCO<sub>2</sub>e`,
          useHTML: true,
          borderWidth: 0,
          color: "#333333",
          style: {
            fontSize: "20px",
          },
        },
        dial: {
          radius: "85%",
          backgroundColor: "#119B95",
          baseWidth: 16,
          baseLength: "0%",
          rearLength: "0%",
        },
        pivot: {
          backgroundColor: "#119B95",
          radius: 8,
        },
      },
    ],
  };

  return (
    <div
      className="highcharts-figure"
      style={{
        minWidth: "380px",
        maxWidth: "900px",
        minHeight: "320px",
        margin: "1em auto",
      }}
    >
      <HighchartsReact highcharts={Highcharts} options={options} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "8px",
          padding: "0 8px",
          position: "relative",
        }}
      >
        {/* Label 1 - Left (Start) */}
        <div
          style={{
            textAlign: "center",
            flex: 1,
            transform: "translateX(-10px)",
          }}
        >
          <div
            style={{
              color: "red",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {initial}
          </div>
          <div
            style={{
              color: "#666",
              fontSize: "12px",
              marginTop: "6px",
              fontWeight: "bold",
            }}
          >
            Baseline year emission
          </div>
        </div>

        {/* Label 2 - Center (Middle) */}
        <div
          style={{
            textAlign: "center",
            flex: 1,
            transform: "translateX(-10px)",
          }}
        >
          <div
            style={{
              color: "red",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {current}
          </div>
          <div
            style={{
              color: "#666",
              fontSize: "12px",
              marginTop: "6px",
              fontWeight: "bold",
            }}
          >
            Current emission
          </div>
        </div>

        {/* Label 3 - Right (End) */}
        <div
          style={{
            textAlign: "center",
            flex: 1,
            transform: "translateX(-10px)",
          }}
        >
          <div
            style={{
              color: "red",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {target}
          </div>
          <div
            style={{
              color: "#666",
              fontSize: "12px",
              marginTop: "6px",
              fontWeight: "bold",
            }}
          >
            Target year emission
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeedometerGauge;
