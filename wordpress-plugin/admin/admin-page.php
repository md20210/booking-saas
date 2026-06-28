<?php
// Exit if accessed directly
if (!defined('ABSPATH')) exit;
?>

<div class="wrap booking-saas-admin">
    <h1>Booking SaaS Widget</h1>
    <p>Wähle ein Template und erstelle deinen Shortcode für WordPress.</p>

    <div class="booking-saas-templates">
        <h2>Verfügbare Templates</h2>

        <div class="templates-grid">
            <?php
            $templates = [
                'calendly' => [
                    'name' => 'Calendly Classic',
                    'description' => 'Klassisches Sidebar-Layout wie Calendly',
                    'colors' => 'Blau/Weiß',
                    'preview' => 'calendly-preview.png'
                ],
                'modern-card' => [
                    'name' => 'Modern Card',
                    'description' => 'Moderne Karten mit Glassmorphism',
                    'colors' => 'Purple/Pink/Blue',
                    'preview' => 'modern-card-preview.png'
                ],
                'split-screen' => [
                    'name' => 'Split Screen',
                    'description' => 'Geteilter Bildschirm 50/50',
                    'colors' => 'Cyan/Teal',
                    'preview' => 'split-screen-preview.png'
                ],
                'dark-mode' => [
                    'name' => 'Dark Mode Pro',
                    'description' => 'Dunkles professionelles Design',
                    'colors' => 'Grau/Blau Dark',
                    'preview' => 'dark-mode-preview.png'
                ],
                'minimalist' => [
                    'name' => 'Minimalist Zen',
                    'description' => 'Ultra-clean minimalistisch',
                    'colors' => 'Schwarz/Weiß',
                    'preview' => 'minimalist-preview.png'
                ],
                'corporate' => [
                    'name' => 'Corporate Clean',
                    'description' => 'Formeller Business-Stil',
                    'colors' => 'Dunkelblau',
                    'preview' => 'corporate-preview.png'
                ],
                'vibrant' => [
                    'name' => 'Vibrant Pop',
                    'description' => 'Bunt und energetisch',
                    'colors' => 'Pink/Purple/Orange',
                    'preview' => 'vibrant-preview.png'
                ],
                'gradient' => [
                    'name' => 'Gradient Flow',
                    'description' => 'Fließende Gradienten',
                    'colors' => 'Emerald/Teal/Cyan',
                    'preview' => 'gradient-preview.png'
                ],
                'playful' => [
                    'name' => 'Playful Rounded',
                    'description' => 'Verspielt mit runden Ecken',
                    'colors' => 'Gelb/Orange',
                    'preview' => 'playful-preview.png'
                ],
                'tech' => [
                    'name' => 'Tech Stack',
                    'description' => 'Developer Terminal-Style',
                    'colors' => 'Grün/Schwarz',
                    'preview' => 'tech-preview.png'
                ],
            ];

            foreach ($templates as $slug => $template) :
            ?>
                <div class="template-card" data-template="<?php echo esc_attr($slug); ?>">
                    <div class="template-preview">
                        <div class="template-placeholder" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <span class="template-icon">📅</span>
                        </div>
                    </div>
                    <div class="template-info">
                        <h3><?php echo esc_html($template['name']); ?></h3>
                        <p class="template-description"><?php echo esc_html($template['description']); ?></p>
                        <p class="template-colors"><strong>Farben:</strong> <?php echo esc_html($template['colors']); ?></p>
                        <div class="template-actions">
                            <button class="button button-primary preview-template" data-template="<?php echo esc_attr($slug); ?>">
                                Vorschau
                            </button>
                            <button class="button select-template" data-template="<?php echo esc_attr($slug); ?>">
                                Auswählen
                            </button>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>

    <!-- Shortcode Generator -->
    <div class="booking-saas-generator">
        <h2>Shortcode Generator</h2>

        <div class="generator-form">
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="event_slug">Event Slug</label>
                    </th>
                    <td>
                        <input type="text" id="event_slug" name="event_slug" class="regular-text" placeholder="z.B. demo-calendly">
                        <p class="description">Der Slug deines Event Types (aus dem Booking SaaS Dashboard)</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="template">Template</label>
                    </th>
                    <td>
                        <select id="template" name="template" class="regular-text">
                            <?php foreach ($templates as $slug => $template) : ?>
                                <option value="<?php echo esc_attr($slug); ?>">
                                    <?php echo esc_html($template['name']); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                        <p class="description">Wähle das Design-Template</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="width">Breite</label>
                    </th>
                    <td>
                        <input type="text" id="width" name="width" class="regular-text" value="100%">
                        <p class="description">z.B. 100%, 800px, 80vw</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="height">Höhe</label>
                    </th>
                    <td>
                        <input type="text" id="height" name="height" class="regular-text" value="800px">
                        <p class="description">z.B. 800px, 90vh</p>
                    </td>
                </tr>
            </table>

            <div class="shortcode-output">
                <h3>Dein Shortcode:</h3>
                <div class="shortcode-box">
                    <code id="generated-shortcode">[booking_widget event_slug="" template="calendly" width="100%" height="800px"]</code>
                    <button class="button copy-shortcode" title="Kopieren">
                        <span class="dashicons dashicons-clipboard"></span>
                    </button>
                </div>
                <p class="description">Kopiere diesen Shortcode und füge ihn in deinen WordPress-Beitrag oder deine Seite ein.</p>
            </div>
        </div>
    </div>

    <!-- Live Preview -->
    <div class="booking-saas-preview">
        <h2>Live Vorschau</h2>
        <div id="widget-preview" class="preview-container">
            <iframe
                id="preview-iframe"
                src="<?php echo esc_url(get_option('booking_saas_api_url', 'https://booking-saas-production-c352.up.railway.app') . '/demo/calendly'); ?>"
                style="width: 100%; height: 800px; border: 1px solid #ddd; border-radius: 8px;"
            ></iframe>
        </div>
    </div>
</div>

<style>
.booking-saas-admin {
    max-width: 1400px;
}

.templates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin: 20px 0;
}

.template-card {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    transition: all 0.3s;
}

.template-card:hover {
    border-color: #2271b1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.template-card.selected {
    border-color: #2271b1;
    box-shadow: 0 0 0 2px #2271b1;
}

.template-preview {
    margin-bottom: 15px;
}

.template-placeholder {
    width: 100%;
    height: 200px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.template-icon {
    font-size: 64px;
}

.template-info h3 {
    margin: 0 0 10px 0;
    font-size: 18px;
}

.template-description {
    color: #666;
    font-size: 14px;
    margin: 5px 0;
}

.template-colors {
    font-size: 13px;
    color: #999;
    margin: 10px 0;
}

.template-actions {
    display: flex;
    gap: 10px;
    margin-top: 15px;
}

.template-actions button {
    flex: 1;
}

.booking-saas-generator {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    margin: 30px 0;
}

.shortcode-output {
    margin-top: 30px;
    padding: 20px;
    background: #f5f5f5;
    border-radius: 6px;
}

.shortcode-box {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #fff;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin: 10px 0;
}

.shortcode-box code {
    flex: 1;
    font-size: 14px;
    word-break: break-all;
}

.copy-shortcode {
    flex-shrink: 0;
}

.booking-saas-preview {
    margin: 30px 0;
}

.preview-container {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
}
</style>

<script>
jQuery(document).ready(function($) {
    const apiUrl = '<?php echo esc_js(get_option('booking_saas_api_url', 'https://booking-saas-production-c352.up.railway.app')); ?>';

    // Update shortcode on input change
    function updateShortcode() {
        const eventSlug = $('#event_slug').val();
        const template = $('#template').val();
        const width = $('#width').val();
        const height = $('#height').val();

        let shortcode = '[booking_widget';

        if (eventSlug) {
            shortcode += ' event_slug="' + eventSlug + '"';
        }

        shortcode += ' template="' + template + '"';
        shortcode += ' width="' + width + '"';
        shortcode += ' height="' + height + '"';
        shortcode += ']';

        $('#generated-shortcode').text(shortcode);
    }

    // Input change handlers
    $('#event_slug, #template, #width, #height').on('input change', updateShortcode);

    // Template selection
    $('.select-template').on('click', function() {
        const template = $(this).data('template');
        $('#template').val(template).trigger('change');

        // Visual feedback
        $('.template-card').removeClass('selected');
        $(this).closest('.template-card').addClass('selected');

        // Update preview
        updatePreview(template);
    });

    // Preview template
    $('.preview-template').on('click', function() {
        const template = $(this).data('template');
        updatePreview(template);

        // Scroll to preview
        $('html, body').animate({
            scrollTop: $('#widget-preview').offset().top - 100
        }, 500);
    });

    // Update preview iframe
    function updatePreview(template) {
        const eventSlug = $('#event_slug').val();
        let previewUrl = apiUrl + '/demo/' + template;

        if (eventSlug) {
            previewUrl = apiUrl + '/book/' + eventSlug + '?template=' + template;
        }

        $('#preview-iframe').attr('src', previewUrl);
    }

    // Copy shortcode to clipboard
    $('.copy-shortcode').on('click', function() {
        const shortcode = $('#generated-shortcode').text();
        navigator.clipboard.writeText(shortcode).then(function() {
            // Visual feedback
            const btn = $('.copy-shortcode');
            const originalHTML = btn.html();

            btn.html('<span class="dashicons dashicons-yes"></span>');

            setTimeout(function() {
                btn.html(originalHTML);
            }, 2000);
        });
    });

    // Initialize
    updateShortcode();
});
</script>
