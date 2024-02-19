// src/Dashboard.js
import React, { useCallback, useState, useEffect,useMemo, useRef } from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const originalDataRef = useRef([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    end_year: null,
    topics: [],
    sector: null,
    region: null,
    pestle: null,
    source: null,
    swot: null,
    country: null,
    city: null,
  });

  const resetFilters = () => {
    setFilters({
      endYear: null,
      topics: [],
      sector: null,
      region: null,
      pestle: null,
      source: null,
      swot: null,
      country: null,
      city: null,
    });
  };

  const memoizedRenderChart = useMemo(() => {
    return () => {
      d3.select('#chart-container svg').remove();

      const margin = { top: 20, right: 30, bottom: 30, left: 40 };
      const width = 800 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      const svg = d3
        .select('#chart-container')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const xScale = d3
        .scaleBand()
        .domain(data.map((item) => item.published))
        .range([0, width])
        .padding(0.1);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, (item) => item.intensity)])
        .range([height, 0]);

      svg
        .selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => xScale(d.published))
        .attr('y', (d) => yScale(d.intensity))
        .attr('width', xScale.bandwidth())
        .attr('height', (d) => height - yScale(d.intensity))
        .attr('fill', 'rgba(75,192,192,0.4)');

      svg
        .append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

      svg.append('g').call(d3.axisLeft(yScale));
    };
  }, [data, filters]);

  useEffect(() => {
    const fetchDataAndRenderChart = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/data', {
          params: filters,
        });
        if (originalDataRef.current.length === 0) {
          originalDataRef.current = response.data;
        }
        
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDataAndRenderChart();
  }, [filters]);

  useEffect(() => {
    memoizedRenderChart();
  }, [data, filters, memoizedRenderChart]);

  const handleFilterChange = (filter, value) => {

    setFilters({ ...filters, [filter]: value });
  };

  return (
    <div className={styles.page}>
      <h1>Data Visualization Dashboard</h1>

      <div className={styles.container}>
        <div className={styles.filterSection}>
          <button className={styles.resetBtn} onClick={resetFilters}>Reset Filters</button>

          <div className={styles.filters}>
            <div>
              <label>End Year:</label>
              <DatePicker
                selected={filters.end_year}
                onChange={(date) => handleFilterChange('end_year', date)}
                dateFormat="yyyy"
                showYearPicker
              />
            </div>

            <div>
              <label>Topics:</label>
              <Select
                options={Array.from(new Set(originalDataRef.current.map((item) => item.topic))).map(topic => ({ value: topic, label: topic }))}
                value={filters.topic}
                onChange={(selected) => handleFilterChange('topic', selected)}
              />
            </div>

            <div>
              <label>Sector:</label>
              <Select
                options={Array.from(new Set(originalDataRef.current.map((item) => item.sector))).map(sector => ({ value: sector, label: sector }))}
                value={filters.sector}
                onChange={(selected) => handleFilterChange('sector', selected)}
              />
            </div>

            <div>
              <label>Region:</label>
              <Select
                options={Array.from(new Set(originalDataRef.current.map((item) => item.region))).map(region => ({ value: region, label: region }))}
                value={filters.region}
                onChange={(selected) => handleFilterChange('region', selected)}
              />
            </div>

            <div>
              <label>PESTLE:</label>
              <Select
                options={Array.from(new Set(originalDataRef.current.map((item) => item.pestle))).map(pestle => ({ value: pestle, label: pestle }))}
                value={filters.pestle}
                onChange={(selected) => handleFilterChange('pestle', selected)}
              />
            </div>

            <div>
              <label>Source:</label>
              <Select
                options={Array.from(new Set(originalDataRef.current.map((item) => item.source))).map(source => ({ value: source, label: source }))}
                value={filters.source}
                onChange={(selected) => handleFilterChange('source', selected)}
              />
            </div>

            <div>
              <label>Country:</label>
              <Select
                options={Array.from(new Set(originalDataRef.current.map((item) => item.country))).map(country => ({ value: country, label: country }))}
                value={filters.country}
                onChange={(selected) => handleFilterChange('country', selected)}
              />
            </div>
          </div>
        </div>
        <div className={styles.chartSection}>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div id="chart-container"></div>
          )}
        </div>
      </div>

      <div id="chart-container"></div>
    </div>
  );
};

export default Dashboard;
