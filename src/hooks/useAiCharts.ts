
import $_ from 'lodash'
export function useAiCharts() {


    const preParseData = (header, body, option) => {
        const data = body.map(row => row.reduce((acc, val, index) => {

            acc[header[index].name] = val;
            return acc;
        }, {}));
        // console.log(data)
        return data;
    }

    const generateBarChart = (header, body, option) => {
        const data = preParseData(header, body, option);
        const { chart_type, x_axis, y_axis, color_scale } = option;
        const config = {
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c}'
            },
            dataZoom: {
                type: 'inside',
                start: 0,
                end: 100
            },
            xAxis: {
                type: 'category',
                data: data.map(item => item[x_axis])
            },
            yAxis: {
                type: 'value'
            },
            
            series: [{
                visualMap: false,
                data: data.map(item => item[y_axis]),
                type: chart_type.toLowerCase(),
            }]
        };


        return config;
    }

    const generateLineChart = (header, body, option) => {
        const data = preParseData(header, body, option);
        const { chart_type, x_axis, y_axis, color_scale } = option;
        const config = {
            tooltip: {
                // trigger: 'axis',
                trigger: 'item',
                // formatter: '{a} <br/>{b}: {c} ({d}%)'
                formatter: '{b}: {c}'
            },
            dataZoom: {
                type: 'inside',
                start: 0,
                end: 100
            },

            xAxis: {
                type: 'category',
                data: data.map(item => item[x_axis])
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                visualMap: false,
                data: data.map(item => item[y_axis]),
                type: chart_type.toLowerCase(),
            }]
        };

        return config;
    }


    const generatePieChart = (header, body, option) => {
        const { chart_type, x_axis, y_axis, categories = [], color_scale, series = [] } = option;
        const data = preParseData(header, body, option);
        const config = {
            tooltip: {
                trigger: 'item',
                // formatter: '{a} <br/>{b}: {c} ({d}%)'
                formatter: '{b}: {c} ({d}%)'
            },

            legend: {
                orient: 'vertical',
                left: 'left'
            },
            series: [{
                type: 'pie',
                radius: '50%',
                visualMap: false,
                data: data.map(item => ({
                    name: item[x_axis],
                    value: item[y_axis]
                })),
                label: {
                    formatter: '{b} ({d}%)'
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        };

        return config;

    }

    const generateScatterChart = (header, body, option) => {
        const { chart_type, x_axis, y_axis, categories = [], color_scale, series = [] } = option;
        const data = preParseData(header, body, option);
        const config = {
            tooltip: {
                trigger: 'item',
                formatter: function (params, ticket, callback) {
                    return params.value[0] + ' : ' + params.value[1];

                }
            },

            xAxis: {
                type: 'value',
                name: x_axis
            },
            yAxis: {
                type: 'value',
                name: y_axis
            },
            series: [{
                type: 'scatter',
                visualMap: false,
                data: data.map(item => [item[x_axis], item[y_axis]])
            }]
        };
        return config;
    }

    const generateRadarChart = (header, body, option) => {
        const { chart_type, x_axis, y_axis, categories = [], color_scale, series = [] } = option;
        const data = preParseData(header, body, option);

        if (!x_axis) {
            const config = {
                tooltip: {
                    trigger: 'item',
                },

                radar: {
                    indicator: categories.map(cat => ({ name: cat })),
                    shape: 'polygon'
                },
                series: [{
                    type: 'radar',
                    data: series.map(({ name, data }) => ({ name, value: data })),
                    lineStyle: {
                        width: 2
                    },
                    visualMap: false,
                    areaStyle: {}
                }]
            };
            return config;

        }
        else {
            const xIndex = header.findIndex((h) => h.name === x_axis);
            const xData = body.map(row => row[xIndex]);
            const valueArray = header.filter(h => h.name !== x_axis && h.dataType === 'NUMERIC');
            const valueIndexArr = valueArray.map(h => header.findIndex(h2 => h2.name === h.name));



            const config = {
                tooltip: {
                    trigger: 'item',
                },

                radar: {
                    indicator: valueArray,
                    shape: 'polygon'
                },
                // dataset:{
                //     dimensions: header.map(h => h.name),
                //     source: body
                // },
                series: [{
                    type: 'radar',
                    data: body.map(b => {
                        const arr = [];
                        for (let i = 0; i < valueIndexArr.length; i++) {
                            arr.push(b[valueIndexArr[i]])
                        }
                        return {
                            name: b[xIndex],
                            value: arr
                        }
                    })
                }]
            }
            return config;
        }
    }

    const parseFillData = (header: any[], body: any[], option) => {
        const { x_axis, y_axis, color_scale } = option;

        const data = [];

        const length = body.length;

        return data;
    }
    const generateHeatmapChart = (header, body, option) => {
        const { chart_type, x_axis, y_axis, categories = [], color_scale, series = [] } = option;
        const data = preParseData(header, body, option);

        const valueArr = data.map(item => $_.toNumber(item[color_scale]));

        // const min = $_.min(valueArr);
        const max = $_.max(valueArr);

        const min = 0;
        // const max = 1000;
        const config = {
            tooltip: {
                trigger: 'item',
            },
            xAxis: {
                type: 'category',
                data: data.map(item => item[x_axis])
            },
            yAxis: {
                type: 'category',
                // data: data.map(item => item[color_scale])
                data: data.map(item => item[y_axis])
            },
            visualMap: {
                min: min,
                max: $_.isNumber(max) ? max / 2 : 100,
                calculable: true,
                orient: 'horizontal',
                left: 'center',
                // inRange: {
                //     color: [
                //         '#313695',
                //         '#4575b4',
                //         '#74add1',
                //         '#abd9e9',
                //         '#e0f3f8',
                //         '#ffffbf',
                //         '#fee090',
                //         '#fdae61',
                //         '#f46d43',
                //         '#d73027',
                //         '#a50026'
                //     ]
                // }
                // type: 'piecewise',
            },
            series: [{
                type: 'heatmap',
                data: data.map((item, index) => ([item[x_axis], item[y_axis], valueArr[index]])),
                label: {
                    show: false
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        };

        return config;
    }
    const generateBoxPlotChart = (header: any[], body: any[], option) => {
        const { chart_type, x_axis, y_axis, categories = [], color_scale, series = [] } = option;

        if (!y_axis) {
            const xIndex = header.indexOf(x_axis);
            const yIndices = series.map(({ y }) => header.indexOf(y));
            const groupedData = body.reduce((acc, row) => {
                const xValue = row[xIndex];
                yIndices.forEach((yIndex, i) => {
                    const seriesName = series[i].name;
                    const yValues = acc[seriesName] || [];
                    yValues.push(row[yIndex]);
                    acc[seriesName] = yValues;
                });
                return acc;
            }, {});

            const config = {
                xAxis: {
                    type: 'category',
                    data: Object.keys(groupedData)
                },
                yAxis: {
                    type: 'value'
                },
                tooltip: {
                    trigger: 'item'
                },
                series: Object.entries(groupedData).map(([name, values]) => ({
                    name,
                    type: 'boxplot',
                    data: values,
                    visualMap: false,
                    tooltip: {
                        formatter: (params) => {
                            const seriesName = params.seriesName;
                            const data = params.data;
                            const boxData = [
                                ['min', data[1]],
                                ['Q1', data[2]],
                                ['median', data[3]],
                                ['Q3', data[4]],
                                ['max', data[5]]
                            ];
                            return boxData.map(([key, value]) => `${seriesName} - ${key}: ${value}`).join('<br/>');
                        }
                    }
                }))
            };

            return config;
        } else {
            const xIndex = header.findIndex((h) => h.name === x_axis);
            const xData = body.map(row => row[xIndex]);
            const yIndex = header.findIndex((h) => h.name === y_axis);
            const yData = body.map(row => row[yIndex]);

            // 将数据按 xData 分组
            const groupedData: any[] = xData.reduce((acc, xValue, index) => {
                const yValue = yData[index];
                if (!acc[xValue]) {
                    acc[xValue] = [];
                }
                acc[xValue].push(yValue);
                return acc;
            }, {});



            // 计算每个分组的五数概括
            const boxPlotData = Object.entries(groupedData).map(([xValue, values]) => {
                const sortedValues = values.sort((a, b) => a - b);
                const min = sortedValues[0];
                const max = sortedValues[sortedValues.length - 1];
                const q1 = sortedValues[Math.floor(sortedValues.length * 0.25)];
                const median = sortedValues[Math.floor(sortedValues.length * 0.5)];
                const q3 = sortedValues[Math.floor(sortedValues.length * 0.75)];

                return [xValue, min, q1, median, q3, max];
            });

            const config = {
                xAxis: {
                    type: 'category',
                    data: Object.keys(groupedData)
                },
                yAxis: {
                    type: 'value'
                },
                tooltip: {
                    trigger: 'item'
                },
                series: [{
                    type: 'boxplot',
                    data: boxPlotData.map(([xValue, ...values]) => values),
                    visualMap: false,
                    tooltip: {
                        formatter: (params) => {
                            const xValue = params.name;
                            const data = params.data;
                            const boxData = [
                                ['min', data[1]],
                                ['Q1', data[2]],
                                ['median', data[3]],
                                ['Q3', data[4]],
                                ['max', data[5]]
                            ];
                            return boxData.map(([key, value]) => `${xValue} - ${key}: ${value}`).join('<br/>');
                        }
                    }
                }]
            };

            return config;
        }
    }
    const generateEChartsConfig = (header, body, option) => {
        const { chart_type, x_axis, y_axis, categories = [], color_scale, series = [] } = option;

        const data = body.map(row => row.reduce((acc, val, index) => {
            acc[header[index]] = val;
            return acc;
        }, {}));

        let config;

        switch (chart_type) {
            case 'Bar':
                config = generateBarChart(header, body, option);
                break;
            case 'Line':
                config = generateLineChart(header, body, option);
                break;
            case 'Pie':
                config = generatePieChart(header, body, option);
                break;
            case 'Scatter':
                config = generateScatterChart(header, body, option);
                break;
            case 'Heatmap':
                config = generateHeatmapChart(header, body, option);
                break;
            case 'Radar':
                config = generateRadarChart(header, body, option);
                break;
            case 'BoxPlot':
                config = generateBoxPlotChart(header, body, option);
                break;
            default:
                console.warn(`Unsupported chart type: ${chart_type}`);
                return null;
        }

        return config;
    }

    return {
        generateEChartsConfig,
        preParseData,
        generateBarChart,
        generateLineChart,
        generatePieChart,
        generateScatterChart,
        generateRadarChart,
        generateHeatmapChart,
        generateBoxPlotChart
    };
}

// Given a dataset resulting from an SQL query, determine the most suitable type of front-end visualization chart. Provide a JSON object describing the chart type and the key elements necessary for its construction, such as axes information.

// Your Task:
// User question: 'Help me query all student basic information'
// SQL query executed: 'SELECT * FROM student;'

// Resulting dataset details (with the first row indicating field names and types, followed by sample data rows):
// sId (INT), student_name (VARCHAR), class_name (VARCHAR), score (INT), teacher_id (INT)
// 1, Tom, A, 80, 3
// 2, Jerry, B, 70, 2
// ..., ..., ..., ..., ...
// Provide the ideal visualization suggestion as a JSON object, focusing on datasets with multiple entries to enhance data comprehension.

// Example 1: Bar Chart
// User question: 'Show the distribution of employee salaries in different departments.'
// SQL query: 'SELECT department_id, department_name, AVG(salary) FROM employees GROUP BY department_id, department_name;'
// Dataset: department_id(INT), department_name (VARCHAR), avg_salary (INT)
// department_id	department_name	avg_salary
// 1 	Engineering	75000
// 2 	Marketing	65000
// 3 	Sales	55000
// Recommended Visualization:
// ```{"chart_type": "Bar", "x_axis": "department", "y_axis": "avg_salary"}```

// Example 2: Line Chart
// User question: 'Display the monthly sales trend for last year.'
// SQL query: 'SELECT month, total_sales FROM sales WHERE year = "Last Year";'
// Dataset: month (VARCHAR), total_sales (INT)
// month	total_sales
// January	200
// February	150
// ...	...
// Recommended Visualization:
// ```{"chart_type": "Line", "x_axis": "month", "y_axis": "total_sales"}```

// Example 3: Pie Chart
// User question: 'What is the market share of each product category?'
// SQL query: 'SELECT category, percentage FROM market_share;'
// Dataset: category (VARCHAR), percentage (INT)
// category	percentage
// Electronics	30
// Apparel	25
// ...	...
// Recommended Visualization:```{"chart_type": "Pie","x_axis": "category","y_axis": "percentage"}```

// Example 4: Scatter Plot Chart
// User question: 'Analyze the relationship between advertising budget and sales.'
// SQL query: 'SELECT advertising_budget, sales FROM company_data;'
// Dataset: advertising_budget (INT), sales (INT)
// advertising_budget	sales
// 1000	300
// 1500	400
// ...	...
// Recommended Visualization:```{"chart_type": "Scatter","x_axis": "advertising_budget","y_axis": "sales"}```

// Example 5: Heatmap Chart
// User question: 'Show the usage frequency of our app by hour and day.'
// SQL query: 'SELECT day, hour, frequency FROM app_usage;'
// Dataset: day (VARCHAR), hour (INT), frequency (INT)
// day	hour	frequency
// Monday	1	20
// Monday	2	25
// ...	...	...
// Recommended Visualization:```{"chart_type": "Heatmap","x_axis": "hour","y_axis": "day","color_scale": "frequency"}```

// Example 5: Radar Chart
// User question: 'Evaluate the overall performance of different departments.'
// SQL query: 'SELECT department, quality, efficiency, innovation, teamwork FROM performance_evaluation;'
// Dataset: department (VARCHAR), quality (INT), efficiency (INT), innovation (INT), teamwork (INT)
// department	quality	efficiency	innovation	teamwork
// HR	8	7	6	9
// IT	7	9	8	6
// Sales	6	5	7	8
// Recommended Visualization:
// ```{
//   "chart_type": "Radar",
//   "categories": ["quality", "efficiency", "innovation", "teamwork"],
//   "series": [
//     {"name": "HR", "data": [8, 7, 6, 9]},
//     {"name": "IT", "data": [7, 9, 8, 6]},
//     {"name": "Sales", "data": [6, 5, 7, 8]}
//   ]
// }```

// Example 6: Box Plot
// User question: 'Show the salary distribution across different positions.'
// SQL query: 'SELECT position, salary FROM employees_salary;'
// Dataset: position (VARCHAR), salary (INT)
// position	salary
// Manager	70000
// Manager	72000
// Developer	50000
// Developer	55000
// ...	...
// Recommended Visualization:
// ```{
//   "chart_type": "BoxPlot",
//   "categories": ["Manager", "Developer"],
//   "data": [
//     {"category": "Manager", "values": [70000, 72000, ..., ...]},
//     {"category": "Developer", "values": [50000, 55000, ..., ...]}
//   ]
// }```

// Generate the recommended visualization JSON object for the above task using the provided few-shot examples as guidance. Provide the JSON code without any explanations, just the code.