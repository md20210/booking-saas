/**
 * Gutenberg Block for Booking SaaS Widget
 */

(function(blocks, element, components, editor) {
    const el = element.createElement;
    const { registerBlockType } = blocks;
    const { TextControl, SelectControl, PanelBody } = components;
    const { InspectorControls } = editor;

    registerBlockType('booking-saas/widget', {
        title: 'Booking Widget',
        icon: 'calendar-alt',
        category: 'widgets',
        attributes: {
            event_slug: {
                type: 'string',
                default: ''
            },
            template: {
                type: 'string',
                default: 'calendly'
            },
            width: {
                type: 'string',
                default: '100%'
            },
            height: {
                type: 'string',
                default: '800px'
            }
        },

        edit: function(props) {
            const { attributes, setAttributes } = props;

            const templates = [
                { label: 'Calendly Classic', value: 'calendly' },
                { label: 'Modern Card', value: 'modern-card' },
                { label: 'Split Screen', value: 'split-screen' },
                { label: 'Dark Mode Pro', value: 'dark-mode' },
                { label: 'Minimalist Zen', value: 'minimalist' },
                { label: 'Corporate Clean', value: 'corporate' },
                { label: 'Vibrant Pop', value: 'vibrant' },
                { label: 'Gradient Flow', value: 'gradient' },
                { label: 'Playful Rounded', value: 'playful' },
                { label: 'Tech Stack', value: 'tech' }
            ];

            return [
                el(
                    InspectorControls,
                    { key: 'inspector' },
                    el(
                        PanelBody,
                        { title: 'Widget Einstellungen', initialOpen: true },
                        el(TextControl, {
                            label: 'Event Slug',
                            value: attributes.event_slug,
                            onChange: function(value) {
                                setAttributes({ event_slug: value });
                            },
                            help: 'Der Slug deines Event Types'
                        }),
                        el(SelectControl, {
                            label: 'Template',
                            value: attributes.template,
                            options: templates,
                            onChange: function(value) {
                                setAttributes({ template: value });
                            }
                        }),
                        el(TextControl, {
                            label: 'Breite',
                            value: attributes.width,
                            onChange: function(value) {
                                setAttributes({ width: value });
                            },
                            help: 'z.B. 100%, 800px'
                        }),
                        el(TextControl, {
                            label: 'Höhe',
                            value: attributes.height,
                            onChange: function(value) {
                                setAttributes({ height: value });
                            },
                            help: 'z.B. 800px, 90vh'
                        })
                    )
                ),
                el(
                    'div',
                    { className: 'booking-saas-block-editor', key: 'editor' },
                    el(
                        'div',
                        {
                            style: {
                                padding: '20px',
                                background: '#f5f5f5',
                                border: '1px dashed #ddd',
                                borderRadius: '4px',
                                textAlign: 'center'
                            }
                        },
                        el('span', { className: 'dashicons dashicons-calendar-alt', style: { fontSize: '48px', color: '#2271b1' } }),
                        el('h3', {}, 'Booking Widget'),
                        el('p', {}, 'Template: ' + attributes.template),
                        attributes.event_slug ?
                            el('p', {}, 'Event: ' + attributes.event_slug) :
                            el('p', { style: { color: '#d63638' } }, 'Bitte Event Slug angeben →')
                    )
                )
            ];
        },

        save: function(props) {
            // Return null because we render via PHP shortcode
            return null;
        }
    });

})(
    window.wp.blocks,
    window.wp.element,
    window.wp.components,
    window.wp.blockEditor || window.wp.editor
);
