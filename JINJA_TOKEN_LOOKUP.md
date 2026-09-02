# Jinja Token Lookup

This file is a quick reference for the template tokens used across the customer-facing PDFs and the template builder.

If you meant a different token system by "Ginger", this repo currently uses Jinja-style tokens and backend replacement maps.

## Token Syntax

- `{{ ... }}` for output
- `{% ... %}` for control flow
- `{# ... #}` for comments

## Product Tokens

These are replaced in product PDF templates.

| Token | Meaning |
| --- | --- |
| `{{product.model}}` | Product model name |
| `{{product.product_type_label}}` | Product type label |
| `{{product.series_name}}` | Series name |
| `{{product.description1_html}}` | First rich-text description block |
| `{{product.description2_html}}` | Second rich-text description block |
| `{{product.description3_html}}` | Third rich-text description block |
| `{{product.description4_html}}` | Fourth rich-text description block |
| `{{product.description5_html}}` | Fifth rich-text description block |
| `{{product.description6_html}}` | Sixth rich-text description block |
| `{{product.description7_html}}` | Seventh rich-text description block |
| `{{product.description8_html}}` | Eighth rich-text description block |
| `{{product.description9_html}}` | Ninth rich-text description block |
| `{{product.description10_html}}` | Tenth rich-text description block |
| `{{product.description_sections_html}}` | All non-empty product description blocks, in numeric order |
| `{{product.description_html}}` | Alias for description 1 |
| `{{product.features_html}}` | Alias for description 2 |
| `{{product.specifications_html}}` | Alias for description 3 |
| `{{product.comments_html}}` | Comments rich-text block |
| `{{product.summary_stats_html}}` | Compact headline specification statistics HTML |
| `{{product.final_heading_html}}` | Product Final 1 heading metadata HTML |
| `{{product.grouped_specs_table}}` | Full grouped specification table HTML |
| `{{product.grouped_specs_cards}}` | Full grouped specification card HTML |
| `{{product.grouped_specs_main_table}}` | Main grouped specification table HTML |
| `{{product.grouped_specs_impeller_html}}` | Grouped spec rows for `impeller` |
| `{{product.grouped_specs_motor_html}}` | Grouped spec rows for `motor` |
| `{{product.grouped_specs_fan_html}}` | Grouped spec rows for `fan` |
| `{{product.grouped_specs_main_html}}` | Grouped spec rows for `main` |
| `{{product.fan_acoustic_table}}` | Fan acoustic table HTML |
| `{{product.image_gallery}}` | Full image gallery HTML |
| `{{product.image_gallery_from_third}}` | Image gallery starting from the third image |
| `{{product.secondary_product_image_html}}` | Secondary product image HTML block |
| `{{product.company_logo_url}}` | Company logo URL |
| `{{product.footer_logo_url}}` | Footer logo URL for Product Final 1 |
| `{{product.primary_product_image_url}}` | Primary product image URL |
| `{{product.graph_image_url}}` | Product graph image URL |

## Series Tokens

These are replaced in series PDF templates.

| Token | Meaning |
| --- | --- |
| `{{series.name}}` | Series name |
| `{{series.product_type_label}}` | Product type label for the series |
| `{{series.series_tab_color}}` | Series tab color |
| `{{series.cover_image_html}}` | Primary series image HTML block with fallback |
| `{{series.primary_series_image_html}}` | Primary series image HTML block |
| `{{series.secondary_series_image_html}}` | Secondary series image HTML block |
| `{{series.description1_html}}` | First series description block |
| `{{series.description2_html}}` | Second series description block |
| `{{series.description3_html}}` | Third series description block |
| `{{series.description4_html}}` | Fourth series description block |
| `{{series.description5_html}}` | Fifth series description block |
| `{{series.description6_html}}` | Sixth series description block |
| `{{series.description7_html}}` | Seventh series description block |
| `{{series.description8_html}}` | Eighth series description block |
| `{{series.description9_html}}` | Ninth series description block |
| `{{series.description10_html}}` | Tenth series description block |
| `{{series.description_sections_html}}` | All non-empty series description blocks, in numeric order |
| `{{series.comments_html}}` | Alias for description 4 |
| `{{series.template_label}}` | Template label |
| `{{series.product_count}}` | Number of products in the series |
| `{{series.graph_rule_label}}` | Graph rule label |
| `{{series.graph_image_url}}` | Series graph image URL |
| `{{series.graph_payload_json}}` | Graph payload JSON for the renderer |
| `{{series.performance_column_1_label}}` | First performance column label |
| `{{series.performance_column_2_label}}` | Second performance column label |
| `{{series.performance_column_3_label}}` | Third performance column label |
| `{{series.performance_table_rows}}` | Performance table rows HTML |
| `{{series.company_logo_url}}` | Company logo URL |
| `{{series.footer_logo_url}}` | Footer logo URL for Series Final-1 |
| `{{series.final_panels_html}}` | Description/testing panels for Series Final-1 |
| `{{series.performance_table_html}}` | Customer-facing series performance table HTML |

## Product Type Tokens

These are replaced in product type PDF templates.

| Token | Meaning |
| --- | --- |
| `{{product_type.key}}` | Product type key |
| `{{product_type.label}}` | Product type label |
| `{{product_type.contents_icon_url}}` | Product type contents icon URL |
| `{{product_type.cover_image_url}}` | Cover image URL from the template assets |
| `{{product_type.intermediate_image_url}}` | Intermediate image URL from the template assets |
| `{{product_type.series_names}}` | Comma-separated series names |
| `{{product_type.series_names_html}}` | Rendered series names HTML |
| `{{product_type.series_legend_html}}` | Rendered series legend HTML |
| `{{product_type.series_groups_html}}` | Rendered series groups HTML |
| `{{product_type.contents_html}}` | Alias for `series_groups_html` |

## Spec Token Pattern

Specific grouped specification values use this pattern:

```text
{{spec.group_slug.parameter_slug}}
```

Examples:

- `{{spec.impeller.size}}`
- `{{spec.motor.power_supply}}`
- `{{spec.fan.max_temp}}`

Slug rules:

- lower-case
- spaces and punctuation become underscores

## Notes

- Product type pages in the customer-facing site use shared Jinja templates, but they are not token-driven in the same way as the PDF templates.
- Series images can be referenced through `series.primary_series_image_url` in the public site templates.
- If a token is not listed here, it may still exist in an older template or in a specific template file under `templates/`.
