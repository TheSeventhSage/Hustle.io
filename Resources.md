- Data consumed by card.
  Endpoint => https://api-v2.hustleapp.info/api/v1/services/primary

Response Obj => {
"success": true,
"message": "Primary provider services loaded.",
"data": {
"items": [
{
"artisan_account_id": 126,
"artisan_name": "Mitchel Bechei",
"artisan_first_name": "Mitchel",
"artisan_last_name": "Bechei",
"artisan_bio": null,
"artisan_role": "artisan",
"services_count": 2,
"category_names": "Cleaning & Housekeeping, Lawn, Garden & Outdoor",
"city_names": "Accra, Adenta",
"country_names": "Ghana",
"average_rating": "5.0",
"review_count": 1,
"primary_service_id": 35,
"primary_service": {
"id": 35,
"category_id": 21,
"category_name": "Cleaning & Housekeeping",
"title": "Cleaner",
"short_description": "Book me all your cleaning services",
"experience_level": "expert",
"pricing_model_default": "full_amount",
"pricing_display_type": "starting_from",
"default_rate_amount": "400.00",
"rate_min_amount": "400.00",
"rate_max_amount": null,
"price_note": null,
"currency_code": "GHS",
"image_url": "https://api-v2.hustleapp.info/api/v1/media/110/file",
"latitude": null,
"longitude": null,
"location_text": null,
"has_coordinates": false,
"details_endpoint": "/services/35"
},
"services_endpoint": "/artisans/126/services"
},
{
"artisan_account_id": 120,
"artisan_name": "Jhulz A",
"artisan_first_name": "Jhulz",
"artisan_last_name": "A",
"artisan_bio": null,
"artisan_role": "artisan",
"services_count": 4,
"category_names": "Beauty, Event Staffing",
"city_names": "Accra",
"country_names": "Ghana",
"average_rating": "5.0",
"review_count": 1,
"primary_service_id": 23,
"primary_service": {
"id": 23,
"category_id": 2,
"category_name": "Beauty",
"title": "Makeup Artist",
"short_description": "I fix lashes, nails, makeup",
"experience_level": "expert",
"pricing_model_default": "per_service",
"pricing_display_type": "starting_from",
"default_rate_amount": "450.00",
"rate_min_amount": "450.00",
"rate_max_amount": null,
"price_note": null,
"currency_code": "GHS",
"image_url": null,
"latitude": null,
"longitude": null,
"location_text": null,
"has_coordinates": false,
"details_endpoint": "/services/23"
},
"services_endpoint": "/artisans/120/services"
}
]
},
"meta": {
"count": 6,
"total": 6,
"page": 1,
"per_page": 20,
"total_pages": 1,
"has_next_page": false,
"has_previous_page": false
}
}

- Data consumed by service details page => To become the serice provider's detail page.

Endpoint => https://api-v2.hustleapp.info/api/v1/artisans/126/services?per_page=12

Response Data => {
"success": true,
"message": "Artisan services loaded.",
"data": {
"artisan": {
"artisan_account_id": 126,
"account_type": "artisan",
"artisan_name": "Mitchel Bechei",
"first_name": "Mitchel",
"last_name": "Bechei",
"bio": null,
"average_rating": "5.0",
"review_count": 1,
"services_count": 2
},
"items": [
{
"id": 36,
"artisan_account_id": 126,
"category_id": 22,
"title": "Gardening",
"short_description": "Best gardener",
"experience_level": "expert",
"pricing_model_default": "per_service",
"pricing_display_type": "starting_from",
"default_rate_amount": "300.00",
"rate_min_amount": "300.00",
"rate_max_amount": null,
"price_note": null,
"currency_code": "GHS",
"primary_image_asset_id": 113,
"latitude": null,
"longitude": null,
"location_text": null,
"posted_at": "2026-07-09 23:19:59",
"image_storage_url": "uploads/listings/2026/07/be1963a1cd8285f2a765c186f693d096df03e17e.jpg",
"category_name": "Lawn, Garden & Outdoor",
"city_name": "Accra, Adenta",
"country_name": "Ghana",
"image_url": "https://api-v2.hustleapp.info/api/v1/media/113/file",
"has_coordinates": false
},
{
"id": 35,
"artisan_account_id": 126,
"category_id": 21,
"title": "Cleaner",
"short_description": "Book me all your cleaning services",
"experience_level": "expert",
"pricing_model_default": "full_amount",
"pricing_display_type": "starting_from",
"default_rate_amount": "400.00",
"rate_min_amount": "400.00",
"rate_max_amount": null,
"price_note": null,
"currency_code": "GHS",
"primary_image_asset_id": 110,
"latitude": null,
"longitude": null,
"location_text": null,
"posted_at": "2026-07-09 19:33:53",
"image_storage_url": "uploads/listings/2026/07/289f376bd440aaa75a034b882a3399381793c41c.jpg",
"category_name": "Cleaning & Housekeeping",
"city_name": "Accra, Adenta",
"country_name": "Ghana",
"image_url": "https://api-v2.hustleapp.info/api/v1/media/110/file",
"has_coordinates": false
}
]
},
"meta": {
"count": 2,
"total": 2,
"page": 1,
"per_page": 12,
"total_pages": 1,
"has_next_page": false,
"has_previous_page": false
}
}

Endpoint => https://api-v2.hustleapp.info/api/v1/services/35

Response Object => {
"success": true,
"message": "Provider service loaded.",
"data": {
"item": {
"id": 35,
"artisan_account_id": 126,
"category_id": 21,
"title": "Cleaner",
"short_description": "Book me all your cleaning services",
"experience_level": "expert",
"pricing_model_default": "full_amount",
"pricing_display_type": "starting_from",
"default_rate_amount": "400.00",
"rate_min_amount": "400.00",
"rate_max_amount": null,
"price_note": null,
"currency_code": "GHS",
"primary_image_asset_id": 110,
"latitude": null,
"longitude": null,
"location_text": null,
"posted_at": "2026-07-09 19:33:53",
"is_active": 1,
"created_at": "2026-07-09 19:33:53",
"updated_at": "2026-07-09 19:33:53",
"image_storage_url": "uploads/listings/2026/07/289f376bd440aaa75a034b882a3399381793c41c.jpg",
"category_name": "Cleaning & Housekeeping",
"first_name": "Mitchel",
"last_name": "Bechei",
"bio": null,
"city_name": null,
"average_rating": "5.0",
"review_count": 1,
"image_url": "https://api-v2.hustleapp.info/api/v1/media/110/file",
"has_coordinates": false
},
"skills": [],
"reviews": [
{
"id": 11,
"rating": 5,
"feedback_text": "She was great had my space looking amazing",
"created_at": "2026-07-09 19:46:44"
}
]
},
"meta": []
}
