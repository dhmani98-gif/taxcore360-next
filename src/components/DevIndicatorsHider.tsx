'use client';

import { useEffect } from 'react';

/**
 * Component to aggressively hide all Next.js development indicators
 * including the "N" badge and Turbopack indicators
 */
export default function DevIndicatorsHider() {
  useEffect(() => {
    // Function to hide all dev indicators
    const hideDevIndicators = () => {
      // List of selectors for all known Next.js dev indicators
      const selectors = [
        // Next.js official selectors
        '[data-nextjs-badge]',
        '[data-nextjs-indicator]',
        '[data-nextjs-dialog-overlay]',
        '[data-nextjs-dialog-content]',
        '[data-nextjs-toast]',
        '[data-njs-click-to-component]',
        // Common class names
        '.nextjs-indicator',
        '.nextjs-toast',
        '.nextjs-dev-overlay',
        '.nextjs-error-feedback',
        // IDs
        '#nextjs-indicator',
        '#__next-build-watcher',
        '#__next-prerender-indicator',
        '#__next-error-feedback',
        // Turbopack specific
        '[data-turbopack]',
        '.turbopack-indicator',
        '#turbopack-indicator',
        // Generic patterns
        'div[style*="position: fixed"]',
        'div[style*="position:fixed"]',
      ];

      // Try to find and hide elements
      selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            if (el instanceof HTMLElement) {
              el.style.display = 'none';
              el.style.opacity = '0';
              el.style.visibility = 'hidden';
              el.style.pointerEvents = 'none';
              el.style.zIndex = '-9999';
              el.remove();
            }
          });
        } catch (e) {
          // Ignore errors for invalid selectors
        }
      });

      // Additional: Look for elements in shadow DOM
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        const shadow = (el as HTMLElement).shadowRoot;
        if (shadow) {
          const shadowSelectors = [
            '[data-nextjs-badge]',
            '[data-nextjs-indicator]',
            '.nextjs-indicator',
            '#nextjs-indicator'
          ];
          shadowSelectors.forEach(selector => {
            try {
              const shadowElements = shadow.querySelectorAll(selector);
              shadowElements.forEach(shadowEl => {
                if (shadowEl instanceof HTMLElement) {
                  shadowEl.style.display = 'none';
                  shadowEl.remove();
                }
              });
            } catch (e) {
              // Ignore errors
            }
          });
        }
      });
    };

    // Run immediately
    hideDevIndicators();

    // Run after a short delay to catch dynamically added elements
    const timeout1 = setTimeout(hideDevIndicators, 100);
    const timeout2 = setTimeout(hideDevIndicators, 500);
    const timeout3 = setTimeout(hideDevIndicators, 1000);
    const timeout4 = setTimeout(hideDevIndicators, 2000);

    // Set up mutation observer to catch dynamically added indicators
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            // Check if the added node is an indicator
            if (
              node.hasAttribute?.('data-nextjs-badge') ||
              node.hasAttribute?.('data-nextjs-indicator') ||
              node.classList?.contains('nextjs-indicator') ||
              node.id === 'nextjs-indicator' ||
              node.hasAttribute?.('data-turbopack') ||
              node.classList?.contains('turbopack-indicator')
            ) {
              node.style.display = 'none';
              node.style.opacity = '0';
              node.style.visibility = 'hidden';
              node.remove();
            }
          }
        });
      });
      
      // Also run full hide function on any mutation
      hideDevIndicators();
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Cleanup
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      clearTimeout(timeout4);
      observer.disconnect();
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}
