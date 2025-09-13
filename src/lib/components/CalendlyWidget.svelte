<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { buildCalendlyUrlWithPrefill } from '$lib/utils/calendlyHelper';

  export let url: string;
  export let prefill: any = {};
  export let utm: any = {};

  let container: HTMLDivElement | null = null;
  let lastSignature = '';
  let signature = '';
  let attempts = 0;
  const maxAttempts = 5;
  let verifyTimer: number | null = null;

  function ensureStyle() {
    const href = 'https://assets.calendly.com/assets/external/widget.css';
    if (!document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
  }

  function ensureScript(): Promise<void> {
    return new Promise((resolve) => {
      const existing = document.querySelector('script[src*="calendly.com/assets/external/widget.js"]') as HTMLScriptElement | null;
      if (existing) {
        if ((window as any).Calendly) return resolve();
        existing.addEventListener('load', () => resolve(), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  }

  function isVisible(el: HTMLElement | null): boolean {
    if (!el) return false;
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function waitForVisible(el: HTMLElement, timeoutMs = 8000): Promise<boolean> {
    return new Promise((resolve) => {
      const start = performance.now();
      function tick() {
        if (isVisible(el)) return resolve(true);
        if (performance.now() - start > timeoutMs) return resolve(false);
        requestAnimationFrame(tick);
      }
      tick();
    });
  }

  function normalizeUrl(raw: string): string | null {
    if (!raw) return null;
    let u = raw.trim();
    if (!/^https?:\/\//i.test(u)) {
      u = 'https://' + u.replace(/^\/*/, '');
    }
    try {
      const parsed = new URL(u);
      if (!/calendly\.com$/i.test(parsed.hostname) && !/\.calendly\.com$/i.test(parsed.hostname)) {
        console.warn('CalendlyWidget: URL host is not calendly.com', parsed.hostname);
      }
      return parsed.toString();
    } catch (e) {
      console.error('CalendlyWidget: invalid URL', raw, e);
      return null;
    }
  }

  function hasKeys(obj: any): boolean {
    return !!obj && typeof obj === 'object' && Object.keys(obj).length > 0;
  }

  async function init(force = false) {
    if (!container || !url) return;

    const normalized = normalizeUrl(url);
    if (!normalized) return;

    ensureStyle();
    await ensureScript();
    const Calendly = (window as any).Calendly;
    if (!Calendly) return;

    const current = JSON.stringify({ url: normalized, prefill, utm });
    if (!force && current === lastSignature && container.children.length > 0) {
      return; // nothing to do
    }
    lastSignature = current;

    // Clear previous embed before re-initializing
    try {
      container.innerHTML = '';
    } catch {}

    // Wait until the container is actually visible (important when inside modals/tabs)
    const visible = await waitForVisible(container, 8000);
    if (!visible) {
      console.warn('CalendlyWidget: container not visible within timeout, proceeding anyway');
    }

    attempts = 0; // reset attempts for this init cycle

    try {
      // Build URL with prefill query params (more reliable than options.prefill)
      const hasPrefill = prefill && (prefill.name || prefill.email || hasKeys(prefill.customAnswers));
      const urlToUse = hasPrefill ? buildCalendlyUrlWithPrefill(normalized, prefill) : normalized;
      const options: any = { url: urlToUse, parentElement: container };
      if (hasKeys(utm)) options.utm = utm;
      Calendly.initInlineWidget(options);
    } catch (e) {
      console.error('CalendlyWidget: initInlineWidget threw', e);
    }

    scheduleVerify();
  }

  function scheduleVerify() {
    // Verify an iframe was injected; if not, retry a few times.
    clearVerify();
    verifyTimer = window.setTimeout(() => {
      const hasIframe = !!container?.querySelector('iframe');
      if (!hasIframe && attempts < maxAttempts) {
        attempts += 1;
        console.warn(`CalendlyWidget: iframe not detected, retrying init (${attempts}/${maxAttempts})`);
        init(true);
      }
    }, 700);
  }

  function clearVerify() {
    if (verifyTimer) {
      clearTimeout(verifyTimer);
      verifyTimer = null;
    }
  }

  onMount(() => {
    init(true);
  });

  onDestroy(() => {
    clearVerify();
  });

  // Update signature whenever inputs change
  $: signature = JSON.stringify({ url, prefill, utm });

  // Re-initialize when inputs change (url/prefill/utm) and container is ready
  $: if (container && url && signature) {
    // signature referenced to trigger on prefill/utm changes as well
    init();
  }
</script>

<div bind:this={container} class="calendly-container" style="min-width:320px;height:700px;"></div>
