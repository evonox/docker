// TODO: ADD CREDITS

import * as React from "react"
import { createRoot } from "react-dom/client"
import { IPanelAPI } from "../../src/common/panel-api";
import { Chart } from 'primereact/chart';

const CHART_DATA  = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
        {
            label: 'Sales',
            data: [540, 325, 702, 620],
            backgroundColor: [
                'rgba(255, 159, 64, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(153, 102, 255, 0.2)'
              ],
              borderColor: [
                'rgb(255, 159, 64)',
                'rgb(75, 192, 192)',
                'rgb(54, 162, 235)',
                'rgb(153, 102, 255)'
              ],
              borderWidth: 1
        }
    ]
};

const documentStyle = getComputedStyle(document.documentElement);
const textColor = documentStyle.getPropertyValue('--text-color');
const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

const LINE_CHART_DATA = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
        {
            label: 'First Dataset',
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: false,
            borderColor: documentStyle.getPropertyValue('--blue-500'),
            tension: 0.4
        },
        {
            label: 'Second Dataset',
            data: [28, 48, 40, 19, 86, 27, 90],
            fill: false,
            borderColor: documentStyle.getPropertyValue('--pink-500'),
            tension: 0.4
        }
    ]
};
const LINE_CHART_OPTIONS = {
    maintainAspectRatio: false,
    aspectRatio: 0.6,
    plugins: {
        legend: {
            labels: {
                color: textColor
            }
        }
    },
    scales: {
        x: {
            ticks: {
                color: textColorSecondary
            },
            grid: {
                color: surfaceBorder
            }
        },
        y: {
            ticks: {
                color: textColorSecondary
            },
            grid: {
                color: surfaceBorder
            }
        }
    }
};


function BarChart() {

    return (
            <Chart 
                type="bar" data={CHART_DATA} 
                style={{display: "grid", justifyContent: "center", alignItems: "center"}} 
            />
    );
}

function PieChart() {
    return <Chart 
                type="pie" data={CHART_DATA} 
                style={{display: "grid", justifyContent: "center", alignItems: "center"}} 
            />
}

function DoughnutChart() {
    return <Chart 
                type="doughnut" data={CHART_DATA} 
                style={{display: "grid", justifyContent: "center", alignItems: "center"}} 
            />
}

function StackedChart() {
    return <Chart 
                type="polarArea" data={CHART_DATA} 
                options={{scales: {x: {stacked: true}, y: {stacked: true}}}}  
                style={{display: "grid", justifyContent: "center", alignItems: "center"}} 
            />
}

function LineChart() {
    return <Chart 
                type="line" data={LINE_CHART_DATA} options={LINE_CHART_OPTIONS} 
                style={{display: "grid", justifyContent: "center", alignItems: "center"}} 
            />
}

const ChartFactoryFn = (title: string, icon: string, component: React.ReactElement): IPanelAPI => {

    let domRoot: HTMLElement;

    return {
        initialize: async (api) => {
            // Set the settings
            api.setPanelTitle(title);
            api.setPanelFAIcon(icon);

            // Render React Component
            domRoot = document.createElement("div");
            domRoot.style.height = "100%";
            domRoot.style.display = "grid";
            domRoot.style.gridTemplateRows = "100%";
            domRoot.style.gridTemplateColumns = "100%";
            const root = createRoot(domRoot);
            root.render(component);
            return domRoot;
        },
        getMinWidth: () => 400,
        getMinHeight: () => 180,
        onResize: (width: number, height: number) => {
            domRoot.style.width = width + "px";
            domRoot.style.height = height + "px";
        }
    }
}

export const BarChartFactoryFn = () => ChartFactoryFn("Bar Chart", "fa-solid fa-chart-bar", <BarChart/>)

export const PieChartFactoryFn = () => ChartFactoryFn("Pie Chart", "fa-solid fa-chart-pie", <PieChart/>)

export const DoughnutChartFactoryFn = () => ChartFactoryFn("Doughnut Chart", "fa-solid fa-chart-pie", <DoughnutChart/>)

export const StackedChartFactoryFn = () => ChartFactoryFn("Polar Area Chart", "fa-solid fa-square-poll-vertical", <StackedChart/>)

export const LineChartFactoryFn = () => ChartFactoryFn("Line Chart", "fa-solid fa-chart-line", <LineChart/>)
