<?php
// Exit if accessed directly
if (!defined('ABSPATH')) exit;

// Save settings
if (isset($_POST['booking_saas_save_settings'])) {
    check_admin_referer('booking_saas_settings');

    update_option('booking_saas_api_url', sanitize_text_field($_POST['booking_saas_api_url']));
    update_option('booking_saas_api_key', sanitize_text_field($_POST['booking_saas_api_key']));

    echo '<div class="notice notice-success"><p>Einstellungen gespeichert!</p></div>';
}

$api_url = get_option('booking_saas_api_url', 'https://booking-saas-production-c352.up.railway.app');
$api_key = get_option('booking_saas_api_key', '');
?>

<div class="wrap">
    <h1>Booking SaaS - Einstellungen</h1>

    <form method="post" action="">
        <?php wp_nonce_field('booking_saas_settings'); ?>

        <table class="form-table">
            <tr>
                <th scope="row">
                    <label for="booking_saas_api_url">API URL</label>
                </th>
                <td>
                    <input
                        type="url"
                        id="booking_saas_api_url"
                        name="booking_saas_api_url"
                        value="<?php echo esc_attr($api_url); ?>"
                        class="regular-text"
                        required
                    >
                    <p class="description">
                        Die URL deiner Booking SaaS Installation (z.B. https://booking-saas-production-c352.up.railway.app)
                    </p>
                </td>
            </tr>
            <tr>
                <th scope="row">
                    <label for="booking_saas_api_key">API Key (Optional)</label>
                </th>
                <td>
                    <input
                        type="text"
                        id="booking_saas_api_key"
                        name="booking_saas_api_key"
                        value="<?php echo esc_attr($api_key); ?>"
                        class="regular-text"
                        placeholder="Dein API Key"
                    >
                    <p class="description">
                        API Key für geschützte Event Types (falls erforderlich)
                    </p>
                </td>
            </tr>
        </table>

        <p class="submit">
            <button type="submit" name="booking_saas_save_settings" class="button button-primary">
                Einstellungen speichern
            </button>
        </p>
    </form>

    <hr>

    <h2>Dokumentation & Support</h2>

    <div class="booking-saas-docs">
        <h3>📚 Verwendung</h3>
        <p>Verwende den Shortcode in deinen Posts und Seiten:</p>
        <pre><code>[booking_widget event_slug="dein-event" template="modern-card"]</code></pre>

        <h3>🎨 Verfügbare Templates</h3>
        <ul>
            <li><strong>calendly</strong> - Klassisches Calendly Layout</li>
            <li><strong>modern-card</strong> - Moderne Karten mit Gradienten</li>
            <li><strong>split-screen</strong> - 50/50 Split-Screen Design</li>
            <li><strong>dark-mode</strong> - Dunkles Theme</li>
            <li><strong>minimalist</strong> - Minimalistisches Design</li>
            <li><strong>corporate</strong> - Business-Stil</li>
            <li><strong>vibrant</strong> - Buntes Design</li>
            <li><strong>gradient</strong> - Gradienten-Flow</li>
            <li><strong>playful</strong> - Verspieltes Design</li>
            <li><strong>tech</strong> - Terminal/Tech-Style</li>
        </ul>

        <h3>⚙️ Shortcode Parameter</h3>
        <ul>
            <li><code>event_slug</code> - Der Slug deines Event Types (erforderlich)</li>
            <li><code>template</code> - Template Name (Standard: calendly)</li>
            <li><code>width</code> - Breite des Widgets (Standard: 100%)</li>
            <li><code>height</code> - Höhe des Widgets (Standard: 800px)</li>
        </ul>

        <h3>📊 Google Ads Tracking</h3>
        <p>
            Das Widget unterstützt automatisches GCLID-Tracking für Google Ads.
            Alle Tracking-Parameter werden automatisch weitergegeben:
        </p>
        <ul>
            <li>GCLID (Google Click ID)</li>
            <li>GBRAID / WBRAID (iOS/Android Tracking)</li>
            <li>UTM Parameters (Source, Medium, Campaign, Term, Content)</li>
        </ul>

        <h3>🔗 Nützliche Links</h3>
        <ul>
            <li><a href="https://booking-saas.com/docs" target="_blank">Vollständige Dokumentation</a></li>
            <li><a href="https://booking-saas.com/support" target="_blank">Support</a></li>
            <li><a href="https://booking-saas.com/templates" target="_blank">Template Galerie</a></li>
        </ul>
    </div>
</div>

<style>
.booking-saas-docs {
    max-width: 800px;
}

.booking-saas-docs h3 {
    margin-top: 30px;
    color: #2271b1;
}

.booking-saas-docs ul {
    list-style: disc;
    margin-left: 20px;
}

.booking-saas-docs pre {
    background: #f5f5f5;
    padding: 15px;
    border-radius: 4px;
    overflow-x: auto;
}

.booking-saas-docs code {
    background: #f5f5f5;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: monospace;
}
</style>
