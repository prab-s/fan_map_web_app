<script>
  import { onMount } from 'svelte';

  /** @type {import('echarts').EChartsOption} */
  export let option = {};
  export let height = '400px';
  export let on = {}; // { eventName: handler }
  export let onChartReady = null; // (chart) => void

  let container;
  let chart;
  let echartsModule = null;
  let handlerEntries = [];
  let zrHoverHandler = null;
  let zrLeaveHandler = null;
  let resizeFrame = null;
  let hasDataCoordGraphic = false;
  let destroyed = false;

  function normalizeGraphicElements(graphic) {
    if (!chart || !Array.isArray(graphic)) return graphic;

    return graphic.map((element) => {
      if (!element || !Array.isArray(element.dataCoord)) return element;

      const [x, y] = chart.convertToPixel({ xAxisIndex: 0, yAxisIndex: 0 }, element.dataCoord);
      const nextElement = { ...element };
      delete nextElement.dataCoord;
      nextElement.x = x + (element.offsetX ?? 0);
      nextElement.y = y + (element.offsetY ?? 0);
      delete nextElement.offsetX;
      delete nextElement.offsetY;
      return nextElement;
    });
  }

  function normalizeOption(nextOption) {
    if (!nextOption || typeof nextOption !== 'object') return nextOption;
    if (!Array.isArray(nextOption.graphic)) return nextOption;
    return {
      ...nextOption,
      graphic: normalizeGraphicElements(nextOption.graphic)
    };
  }

  function optionHasDataCoordGraphic(nextOption) {
    return Boolean(
      nextOption &&
        typeof nextOption === 'object' &&
        Array.isArray(nextOption.graphic) &&
        nextOption.graphic.some((element) => Array.isArray(element?.dataCoord))
    );
  }

  function attachHandlers() {
    if (!chart) return;
    // Remove old handlers first
    for (const [eventName, handler] of handlerEntries) {
      chart.off(eventName, handler);
    }
    handlerEntries = [];

    if (on && typeof on === 'object') {
      for (const [eventName, handler] of Object.entries(on)) {
        if (typeof handler === 'function') {
          chart.on(eventName, handler);
          handlerEntries.push([eventName, handler]);
        }
      }
    }
  }

  $: if (chart && option && Object.keys(option).length) {
    try {
      hasDataCoordGraphic = optionHasDataCoordGraphic(option);
      chart.setOption(normalizeOption(option), { notMerge: true });
      attachHandlers();
      attachHoverTracking();
    } catch (e) {
      console.error('ECharts error:', e);
    }
  }

  function attachHoverTracking() {
    if (!chart) return;
    const zr = chart.getZr?.();
    if (!zr) return;

    if (zrHoverHandler) zr.off('mousemove', zrHoverHandler);
    if (zrLeaveHandler) zr.off('globalout', zrLeaveHandler);

    zrHoverHandler = (event) => {
      const x = Number(event?.offsetX);
      const y = Number(event?.offsetY);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      const coords = chart.convertFromPixel({ xAxisIndex: 0, yAxisIndex: 0 }, [x, y]);
      if (Array.isArray(coords)) {
        window.__ECHARTS_HOVER_COORDS__ = { x: coords[0], y: coords[1] };
      } else if (coords && typeof coords === 'object') {
        window.__ECHARTS_HOVER_COORDS__ = { x: coords.x ?? coords[0], y: coords.y ?? coords[1] };
      }
    };

    zrLeaveHandler = () => {
      window.__ECHARTS_HOVER_COORDS__ = null;
    };

    zr.on('mousemove', zrHoverHandler);
    zr.on('globalout', zrLeaveHandler);
  }

  onMount(() => {
    destroyed = false;
    void initializeChart().catch((error) => {
      console.error('ECharts load error:', error);
    });
    window.addEventListener('resize', scheduleResize);

    return () => {
      destroyed = true;
      window.removeEventListener('resize', scheduleResize);
      if (resizeFrame !== null) {
        window.cancelAnimationFrame(resizeFrame);
        resizeFrame = null;
      }
      window.__ECHARTS_HOVER_COORDS__ = null;
      if (chart) chart.dispose();
      chart = null;
    };
  });

  async function initializeChart() {
    if (!container || chart) return;

    if (!echartsModule) {
      echartsModule = await import('echarts');
    }

    if (destroyed || !container || chart) return;

    chart = echartsModule.init(container);
    if (option && Object.keys(option).length) {
      hasDataCoordGraphic = optionHasDataCoordGraphic(option);
      chart.setOption(normalizeOption(option), { notMerge: true });
    }

    if (typeof onChartReady === 'function') {
      onChartReady(chart);
    }
    attachHoverTracking();
  }

  function scheduleResize() {
    if (resizeFrame !== null) return;
    resizeFrame = window.requestAnimationFrame(() => {
      resizeFrame = null;
      resize();
    });
  }

  function resize() {
    if (!chart) return;
    chart.resize();
    if (hasDataCoordGraphic && option && Object.keys(option).length) {
      chart.setOption(normalizeOption(option), { notMerge: true, lazyUpdate: true });
    }
  }
</script>

<div bind:this={container} class="chart-container echart-host" style="height: {height};"></div>
