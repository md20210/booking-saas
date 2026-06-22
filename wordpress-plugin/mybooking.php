<?php
/**
 * Plugin Name: MyBooking - Booking Widget
 * Plugin URI: https://mybooking.com
 * Description: Embed booking widgets from MyBooking into your WordPress site
 * Version: 1.0.0
 * Author: MyBooking Team
 * Author URI: https://mybooking.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: mybooking
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Plugin constants
define('MYBOOKING_VERSION', '1.0.0');
define('MYBOOKING_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('MYBOOKING_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Main MyBooking Plugin Class
 */
class MyBooking_Plugin {

    /**
     * Constructor
     */
    public function __construct() {
        // Admin hooks
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));

        // Shortcode
        add_shortcode('mybooking', array($this, 'booking_shortcode'));

        // Gutenberg block
        add_action('init', array($this, 'register_block'));

        // Enqueue scripts
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
    }

    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_menu_page(
            'MyBooking Settings',
            'MyBooking',
            'manage_options',
            'mybooking-settings',
            array($this, 'settings_page'),
            'dashicons-calendar-alt',
            30
        );
    }

    /**
     * Register plugin settings
     */
    public function register_settings() {
        register_setting('mybooking_settings', 'mybooking_api_url');
        register_setting('mybooking_settings', 'mybooking_api_key');
        register_setting('mybooking_settings', 'mybooking_default_event_id');
    }

    /**
     * Settings page HTML
     */
    public function settings_page() {
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>

            <form method="post" action="options.php">
                <?php
                settings_fields('mybooking_settings');
                do_settings_sections('mybooking_settings');
                ?>

                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="mybooking_api_url">API URL</label>
                        </th>
                        <td>
                            <input
                                type="url"
                                id="mybooking_api_url"
                                name="mybooking_api_url"
                                value="<?php echo esc_attr(get_option('mybooking_api_url', 'https://yourdomain.com')); ?>"
                                class="regular-text"
                                placeholder="https://yourdomain.com"
                            />
                            <p class="description">Your MyBooking installation URL</p>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row">
                            <label for="mybooking_api_key">API Key</label>
                        </th>
                        <td>
                            <input
                                type="text"
                                id="mybooking_api_key"
                                name="mybooking_api_key"
                                value="<?php echo esc_attr(get_option('mybooking_api_key')); ?>"
                                class="regular-text"
                                placeholder="your-api-key-here"
                            />
                            <p class="description">Your MyBooking API key (find it in your dashboard)</p>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row">
                            <label for="mybooking_default_event_id">Default Event ID</label>
                        </th>
                        <td>
                            <input
                                type="text"
                                id="mybooking_default_event_id"
                                name="mybooking_default_event_id"
                                value="<?php echo esc_attr(get_option('mybooking_default_event_id')); ?>"
                                class="regular-text"
                                placeholder="event-id"
                            />
                            <p class="description">Default event type ID for shortcodes without an event_id parameter</p>
                        </td>
                    </tr>
                </table>

                <?php submit_button(); ?>
            </form>

            <hr>

            <h2>How to Use</h2>

            <h3>Shortcode</h3>
            <p>Use this shortcode to embed a booking widget:</p>
            <pre><code>[mybooking event_id="your-event-id"]</code></pre>

            <h3>Parameters</h3>
            <ul>
                <li><code>event_id</code> - The event type ID (optional if you set a default above)</li>
                <li><code>width</code> - Widget width (default: 100%)</li>
                <li><code>height</code> - Widget height (default: 600px)</li>
            </ul>

            <h3>Examples</h3>
            <pre><code>[mybooking event_id="abc123"]
[mybooking event_id="abc123" width="800px" height="700px"]
[mybooking]  &lt;!-- Uses default event ID --&gt;</code></pre>
        </div>
        <?php
    }

    /**
     * Booking shortcode handler
     */
    public function booking_shortcode($atts) {
        $atts = shortcode_atts(array(
            'event_id' => get_option('mybooking_default_event_id'),
            'width' => '100%',
            'height' => '600px',
        ), $atts);

        $api_url = get_option('mybooking_api_url');
        $api_key = get_option('mybooking_api_key');
        $event_id = $atts['event_id'];

        // Validate settings
        if (empty($api_url) || empty($api_key) || empty($event_id)) {
            return '<div class="mybooking-error">MyBooking widget not configured. Please set your API URL, API Key, and Event ID in the plugin settings.</div>';
        }

        // Capture UTM parameters and GCLID from URL
        $utm_params = array(
            'utm_source' => isset($_GET['utm_source']) ? sanitize_text_field($_GET['utm_source']) : '',
            'utm_medium' => isset($_GET['utm_medium']) ? sanitize_text_field($_GET['utm_medium']) : '',
            'utm_campaign' => isset($_GET['utm_campaign']) ? sanitize_text_field($_GET['utm_campaign']) : '',
            'utm_term' => isset($_GET['utm_term']) ? sanitize_text_field($_GET['utm_term']) : '',
            'utm_content' => isset($_GET['utm_content']) ? sanitize_text_field($_GET['utm_content']) : '',
        );

        $gclid = isset($_GET['gclid']) ? sanitize_text_field($_GET['gclid']) : '';
        $gbraid = isset($_GET['gbraid']) ? sanitize_text_field($_GET['gbraid']) : '';
        $wbraid = isset($_GET['wbraid']) ? sanitize_text_field($_GET['wbraid']) : '';

        // Build tracking URL parameters
        $tracking_params = array_filter(array_merge($utm_params, array(
            'gclid' => $gclid,
            'gbraid' => $gbraid,
            'wbraid' => $wbraid,
        )));

        $tracking_query = !empty($tracking_params) ? '&' . http_build_query($tracking_params) : '';

        // Generate unique ID for this widget instance
        $widget_id = 'mybooking-widget-' . uniqid();

        // Output widget container
        $output = '<div id="' . esc_attr($widget_id) . '" class="mybooking-widget-container" style="width: ' . esc_attr($atts['width']) . '; height: ' . esc_attr($atts['height']) . ';"></div>';

        // Initialize widget with JavaScript
        $output .= '<script>
            (function() {
                if (typeof MyBookingEmbed === "undefined") {
                    console.error("MyBooking embed script not loaded");
                    return;
                }

                new MyBookingEmbed({
                    containerId: "' . esc_js($widget_id) . '",
                    apiUrl: "' . esc_js($api_url) . '",
                    apiKey: "' . esc_js($api_key) . '",
                    eventId: "' . esc_js($event_id) . '",
                    trackingParams: ' . json_encode($tracking_params) . '
                });
            })();
        </script>';

        return $output;
    }

    /**
     * Register Gutenberg block
     */
    public function register_block() {
        if (!function_exists('register_block_type')) {
            return;
        }

        // Register block script
        wp_register_script(
            'mybooking-block',
            MYBOOKING_PLUGIN_URL . 'assets/block.js',
            array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components'),
            MYBOOKING_VERSION,
            true
        );

        // Pass settings to JavaScript
        wp_localize_script('mybooking-block', 'mybookingSettings', array(
            'apiUrl' => get_option('mybooking_api_url'),
            'apiKey' => get_option('mybooking_api_key'),
            'defaultEventId' => get_option('mybooking_default_event_id'),
        ));

        register_block_type('mybooking/widget', array(
            'editor_script' => 'mybooking-block',
            'render_callback' => array($this, 'booking_shortcode'),
            'attributes' => array(
                'event_id' => array(
                    'type' => 'string',
                    'default' => get_option('mybooking_default_event_id'),
                ),
                'width' => array(
                    'type' => 'string',
                    'default' => '100%',
                ),
                'height' => array(
                    'type' => 'string',
                    'default' => '600px',
                ),
            ),
        ));
    }

    /**
     * Enqueue frontend scripts
     */
    public function enqueue_scripts() {
        $api_url = get_option('mybooking_api_url');

        if (empty($api_url)) {
            return;
        }

        // Enqueue MyBooking embed script from your installation
        wp_enqueue_script(
            'mybooking-embed',
            trailingslashit($api_url) . 'embed.js',
            array(),
            MYBOOKING_VERSION,
            true
        );

        // Enqueue plugin styles
        wp_enqueue_style(
            'mybooking-plugin',
            MYBOOKING_PLUGIN_URL . 'assets/style.css',
            array(),
            MYBOOKING_VERSION
        );
    }
}

// Initialize plugin
new MyBooking_Plugin();
