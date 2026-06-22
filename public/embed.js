/**
 * MyBooking Embed JavaScript Loader
 * This script can be included on any website to embed booking widgets
 *
 * Usage:
 * <script src="https://yourdomain.com/embed.js"></script>
 * <div id="mybooking-widget"></div>
 * <script>
 *   new MyBookingEmbed({
 *     containerId: 'mybooking-widget',
 *     apiUrl: 'https://yourdomain.com',
 *     apiKey: 'your-api-key',
 *     eventId: 'event-id'
 *   });
 * </script>
 */

(function (window) {
  'use strict';

  /**
   * MyBooking Embed Constructor
   */
  function MyBookingEmbed(config) {
    this.config = {
      containerId: config.containerId || 'mybooking-widget',
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      eventId: config.eventId,
      trackingParams: config.trackingParams || {},
      width: config.width || '100%',
      height: config.height || '600px',
    };

    this.container = document.getElementById(this.config.containerId);

    if (!this.container) {
      console.error('MyBooking: Container element not found:', this.config.containerId);
      return;
    }

    if (!this.config.apiUrl || !this.config.apiKey || !this.config.eventId) {
      this.showError('Configuration error: apiUrl, apiKey, and eventId are required');
      return;
    }

    this.init();
  }

  /**
   * Initialize the embed widget
   */
  MyBookingEmbed.prototype.init = function () {
    // Show loading state
    this.showLoading();

    // Load React and dependencies from CDN
    this.loadDependencies()
      .then(() => {
        this.loadWidget();
      })
      .catch((error) => {
        console.error('MyBooking: Failed to load dependencies', error);
        this.showError('Failed to load booking widget');
      });
  };

  /**
   * Load required dependencies (React, ReactDOM)
   */
  MyBookingEmbed.prototype.loadDependencies = function () {
    return new Promise((resolve, reject) => {
      // Check if React is already loaded
      if (window.React && window.ReactDOM) {
        resolve();
        return;
      }

      // Load React and ReactDOM from CDN
      const reactScript = document.createElement('script');
      reactScript.src = 'https://unpkg.com/react@18/umd/react.production.min.js';
      reactScript.crossOrigin = 'anonymous';

      reactScript.onload = () => {
        const reactDOMScript = document.createElement('script');
        reactDOMScript.src = 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js';
        reactDOMScript.crossOrigin = 'anonymous';

        reactDOMScript.onload = () => resolve();
        reactDOMScript.onerror = () => reject(new Error('Failed to load ReactDOM'));

        document.head.appendChild(reactDOMScript);
      };

      reactScript.onerror = () => reject(new Error('Failed to load React'));

      document.head.appendChild(reactScript);
    });
  };

  /**
   * Load the widget
   */
  MyBookingEmbed.prototype.loadWidget = function () {
    const self = this;

    // Fetch widget bundle from your server
    // In production, you would build a React component bundle
    // For now, we'll create an iframe pointing to the public booking page

    this.createIframe();
  };

  /**
   * Create iframe embed
   */
  MyBookingEmbed.prototype.createIframe = function () {
    const iframe = document.createElement('iframe');

    // Build URL with tracking parameters
    const trackingQuery = new URLSearchParams(this.config.trackingParams).toString();
    const separator = this.config.apiUrl.includes('?') ? '&' : '?';
    const url = `${this.config.apiUrl}/book/${this.config.eventId}${trackingQuery ? separator + trackingQuery : ''}`;

    iframe.src = url;
    iframe.style.width = this.config.width;
    iframe.style.height = this.config.height;
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('loading', 'lazy');

    // Clear container and append iframe
    this.container.innerHTML = '';
    this.container.appendChild(iframe);

    // Listen for messages from iframe (for height adjustment, etc.)
    window.addEventListener('message', (event) => {
      if (event.origin !== new URL(this.config.apiUrl).origin) {
        return;
      }

      if (event.data.type === 'mybooking:resize') {
        iframe.style.height = event.data.height + 'px';
      }

      if (event.data.type === 'mybooking:booking-confirmed') {
        // Dispatch custom event for parent page to listen to
        const customEvent = new CustomEvent('mybooking:booking-confirmed', {
          detail: event.data.booking,
        });
        window.dispatchEvent(customEvent);
      }
    });
  };

  /**
   * Show loading state
   */
  MyBookingEmbed.prototype.showLoading = function () {
    this.container.innerHTML = '<div class="mybooking-loading">Loading booking widget...</div>';
    this.container.style.minHeight = '400px';
    this.container.style.display = 'flex';
    this.container.style.alignItems = 'center';
    this.container.style.justifyContent = 'center';
  };

  /**
   * Show error message
   */
  MyBookingEmbed.prototype.showError = function (message) {
    this.container.innerHTML = '<div class="mybooking-error">' + message + '</div>';
    this.container.style.padding = '20px';
    this.container.style.backgroundColor = '#fee';
    this.container.style.border = '2px solid #c33';
    this.container.style.borderRadius = '4px';
    this.container.style.color = '#c33';
    this.container.style.fontWeight = 'bold';
    this.container.style.textAlign = 'center';
  };

  // Expose to global scope
  window.MyBookingEmbed = MyBookingEmbed;

  // Auto-initialize if data attributes are present
  document.addEventListener('DOMContentLoaded', function () {
    const autoWidgets = document.querySelectorAll('[data-mybooking-widget]');

    autoWidgets.forEach(function (element) {
      new MyBookingEmbed({
        containerId: element.id,
        apiUrl: element.getAttribute('data-api-url'),
        apiKey: element.getAttribute('data-api-key'),
        eventId: element.getAttribute('data-event-id'),
        width: element.getAttribute('data-width') || '100%',
        height: element.getAttribute('data-height') || '600px',
      });
    });
  });
})(window);
