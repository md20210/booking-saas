<?php
/**
 * Plugin Name: Booking SaaS Widget
 * Plugin URI: https://booking-saas.com
 * Description: Embed beautiful booking widgets with 10 different design templates. Includes server-side Google Ads conversion tracking and calendar integrations.
 * Version: 1.0.0
 * Author: Booking SaaS
 * Author URI: https://booking-saas.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: booking-saas
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('BOOKING_SAAS_VERSION', '1.0.0');
define('BOOKING_SAAS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('BOOKING_SAAS_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Main Plugin Class
 */
class BookingSaaSWidget {

    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Initialize plugin
        add_action('init', [$this, 'init']);
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_scripts']);

        // Register shortcode
        add_shortcode('booking_widget', [$this, 'render_shortcode']);

        // Gutenberg block support
        add_action('enqueue_block_editor_assets', [$this, 'enqueue_block_editor_assets']);
    }

    public function init() {
        // Register settings
        register_setting('booking_saas_settings', 'booking_saas_api_url');
        register_setting('booking_saas_settings', 'booking_saas_api_key');
    }

    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_menu_page(
            'Booking SaaS',
            'Booking SaaS',
            'manage_options',
            'booking-saas',
            [$this, 'render_admin_page'],
            'dashicons-calendar-alt',
            30
        );

        add_submenu_page(
            'booking-saas',
            'Settings',
            'Settings',
            'manage_options',
            'booking-saas-settings',
            [$this, 'render_settings_page']
        );
    }

    /**
     * Render admin page
     */
    public function render_admin_page() {
        include BOOKING_SAAS_PLUGIN_DIR . 'admin/admin-page.php';
    }

    /**
     * Render settings page
     */
    public function render_settings_page() {
        include BOOKING_SAAS_PLUGIN_DIR . 'admin/settings-page.php';
    }

    /**
     * Enqueue admin scripts
     */
    public function enqueue_admin_scripts($hook) {
        if (strpos($hook, 'booking-saas') === false) {
            return;
        }

        wp_enqueue_style(
            'booking-saas-admin',
            BOOKING_SAAS_PLUGIN_URL . 'admin/css/admin.css',
            [],
            BOOKING_SAAS_VERSION
        );

        wp_enqueue_script(
            'booking-saas-admin',
            BOOKING_SAAS_PLUGIN_URL . 'admin/js/admin.js',
            ['jquery'],
            BOOKING_SAAS_VERSION,
            true
        );
    }

    /**
     * Enqueue block editor assets for Gutenberg
     */
    public function enqueue_block_editor_assets() {
        wp_enqueue_script(
            'booking-saas-block',
            BOOKING_SAAS_PLUGIN_URL . 'blocks/booking-widget.js',
            ['wp-blocks', 'wp-element', 'wp-editor'],
            BOOKING_SAAS_VERSION,
            true
        );
    }

    /**
     * Render shortcode
     *
     * Usage:
     * [booking_widget event_slug="demo-calendly" template="modern-card" width="100%" height="800px"]
     *
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_shortcode($atts) {
        $atts = shortcode_atts([
            'event_slug' => '',
            'template' => 'calendly', // Default template
            'width' => '100%',
            'height' => '800px',
            'api_url' => get_option('booking_saas_api_url', 'https://booking-saas-production-c352.up.railway.app'),
        ], $atts, 'booking_widget');

        // Validate template
        $available_templates = [
            'calendly',
            'modern-card',
            'split-screen',
            'dark-mode',
            'minimalist',
            'corporate',
            'vibrant',
            'gradient',
            'playful',
            'tech'
        ];

        if (!in_array($atts['template'], $available_templates)) {
            $atts['template'] = 'calendly';
        }

        // Build iframe URL
        $iframe_url = trailingslashit($atts['api_url']) . 'demo/' . $atts['template'];

        // If event_slug is provided, use actual booking URL
        if (!empty($atts['event_slug'])) {
            $iframe_url = trailingslashit($atts['api_url']) . 'book/' . $atts['event_slug'] . '?template=' . $atts['template'];
        }

        // Add UTM parameters from current page URL if present
        $utm_params = [];
        foreach (['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid'] as $param) {
            if (isset($_GET[$param])) {
                $utm_params[$param] = sanitize_text_field($_GET[$param]);
            }
        }

        if (!empty($utm_params)) {
            $iframe_url = add_query_arg($utm_params, $iframe_url);
        }

        // Generate unique ID for this widget
        $widget_id = 'booking-widget-' . uniqid();

        ob_start();
        ?>
        <div id="<?php echo esc_attr($widget_id); ?>" class="booking-saas-widget-container" style="width: <?php echo esc_attr($atts['width']); ?>; max-width: 100%;">
            <iframe
                src="<?php echo esc_url($iframe_url); ?>"
                style="width: 100%; height: <?php echo esc_attr($atts['height']); ?>; border: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"
                title="Booking Widget"
                loading="lazy"
            ></iframe>
        </div>

        <script>
        // Auto-adjust iframe height based on content
        (function() {
            const iframe = document.querySelector('#<?php echo esc_js($widget_id); ?> iframe');

            window.addEventListener('message', function(event) {
                // Security: Check origin
                if (event.origin !== '<?php echo esc_js(rtrim($atts['api_url'], '/')); ?>') {
                    return;
                }

                // Handle height adjustment messages
                if (event.data && event.data.type === 'booking-widget-resize' && event.data.height) {
                    iframe.style.height = event.data.height + 'px';
                }

                // Handle booking completion (optional analytics)
                if (event.data && event.data.type === 'booking-completed') {
                    // Fire custom event for analytics
                    if (typeof window.dataLayer !== 'undefined') {
                        window.dataLayer.push({
                            'event': 'booking_completed',
                            'booking_id': event.data.bookingId,
                            'event_type': event.data.eventType
                        });
                    }
                }
            });
        })();
        </script>
        <?php

        return ob_get_clean();
    }
}

// Initialize plugin
function booking_saas_widget_init() {
    return BookingSaaSWidget::get_instance();
}
add_action('plugins_loaded', 'booking_saas_widget_init');

/**
 * Activation hook
 */
function booking_saas_activate() {
    // Set default options
    if (!get_option('booking_saas_api_url')) {
        update_option('booking_saas_api_url', 'https://booking-saas-production-c352.up.railway.app');
    }
}
register_activation_hook(__FILE__, 'booking_saas_activate');

/**
 * Deactivation hook
 */
function booking_saas_deactivate() {
    // Clean up if needed
}
register_deactivation_hook(__FILE__, 'booking_saas_deactivate');
