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
  let cursorGraphicFrame = null;
  let pendingCursorGraphicCoords = null;
  let pendingCursorGraphicVisible = false;
  let destroyed = false;

  const CURSOR_GRAPHIC_ID = 'cursor-point-marker';

  function normalizeOption(nextOption) {
    return nextOption;
  }

  function optionHasCursorGraphic(nextOption) {
    return Boolean(
      nextOption &&
        typeof nextOption === 'object' &&
        Array.isArray(nextOption.graphic) &&
        nextOption.graphic.some((element) => String(element?.id ?? '') === CURSOR_GRAPHIC_ID)
    );
  }

  function buildCursorGraphicUpdate(coords, visible) {
    if (!option || !Array.isArray(option.graphic)) return null;
    if (!Array.isArray(coords)) return null;

    const [x, y] = chart.convertToPixel({ xAxisIndex: 0, yAxisIndex: 0 }, coords);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

    let changed = false;
    const nextGraphic = option.graphic.map((element) => {
      if (String(element?.id ?? '') !== CURSOR_GRAPHIC_ID) return element;
      changed = true;
      return {
        ...element,
        x,
        y: y + 1,
        invisible: !visible
      };
    });

    return changed ? { graphic: nextGraphic } : null;
  }

  function scheduleCursorGraphicUpdate(coords, visible) {
    if (!chart || !optionHasCursorGraphic(option)) return;
    pendingCursorGraphicCoords = coords;
    pendingCursorGraphicVisible = visible;
    if (cursorGraphicFrame !== null) return;

    cursorGraphicFrame = window.requestAnimationFrame(() => {
      cursorGraphicFrame = null;
      if (!chart) return;
      const update = buildCursorGraphicUpdate(pendingCursorGraphicCoords, pendingCursorGraphicVisible);
      if (update) {
        chart.setOption(normalizeOption(update), { notMerge: false, lazyUpdate: true });
      }
    });
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
        scheduleCursorGraphicUpdate([coords[0], coords[1]], true);
      } else if (coords && typeof coords === 'object') {
        const hoverCoords = { x: coords.x ?? coords[0], y: coords.y ?? coords[1] };
        window.__ECHARTS_HOVER_COORDS__ = hoverCoords;
        scheduleCursorGraphicUpdate([hoverCoords.x, hoverCoords.y], true);
      }
    };

    zrLeaveHandler = () => {
      window.__ECHARTS_HOVER_COORDS__ = null;
      scheduleCursorGraphicUpdate(null, false);
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
    if (pendingCursorGraphicVisible && pendingCursorGraphicCoords && optionHasCursorGraphic(option)) {
      const update = buildCursorGraphicUpdate(pendingCursorGraphicCoords, true);
      if (update) {
        chart.setOption(update, { notMerge: false, lazyUpdate: true });
      }
    }
  }
</script>

<div bind:this={container} class="chart-container echart-host" style="height: {height};"></div>
