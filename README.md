# Apex Computers — GitHub / Vercel package v2.4.4

Updated 11 October 2026 from the original offers, photographs and completed artwork in **LAPTOP FLYER DESIGN**. This package keeps the existing multipage design and the newer customer-facing About page.

## Contact and information-card alignment

Contact cards align their title and detail to the same text column. Icons and arrows have separate fixed columns, so long email addresses and Kiswahili labels wrap without moving other content. Contact cards use three columns on larger screens, two on tablets and one at widths of 680px or less. Labels have consistent typography in English and Kiswahili, and the cards show a visible keyboard focus ring. Email and Instagram use matching icons.

The buying-guide and About card grids use shrinkable columns. Related information boxes and the phone highlight also allow long text to wrap. Asset versions are updated across all nine pages to load the new styling.

## Monitor and product-type fix

Monitor cards show display size, known connections and stand/camera features. They have no RAM, processor or disk placeholders. Accessories, drives and printers use their own supplied details. Product tables, catalogue search, search metadata, the static catalogue and enquiry/order notifications use the matching product type. Empty summaries no longer fall back to laptop fields. Computer orders still include the chosen processor, RAM and storage.

Monitor labels and badges translate into Kiswahili with the same shared font sizes. Relevant stock prices, original photos and flyers are preserved. Browser asset versions are updated to v2.4.4 across all pages so an earlier script is not reused.

## Latest stock update

Five new product families added; four existing listings updated in place. The update includes 42 distinct new stock photographs, their small WebP thumbnails, and eight matching flyers. The HP 820 G3 flyer’s display label was corrected to 12.5 inches; its price and remaining offer details were preserved. The EliteDesk flyer’s unsupported quantity badge was changed to “Confirm Stock”; both supplied prices were preserved.

- HP EliteBook x360 1040 G8: Core i7-1185G7, 16GB / 512GB SSD, 14-inch FHD touch — TSh 1,450,000.
- Dell Latitude 5310 2-in-1: Core i5 10th Gen, 8GB / 256GB SSD, 13.3-inch touch — TSh 770,000.
- HP EliteBook x360 830 G6: Core i5-8265U, 8GB / 256GB SSD — TSh 890,000. The earlier Core i7 offer remains a separate configuration at TSh 1,100,000.
- Dell Latitude 7480: Core i5-7300U, 8GB / 256GB SSD, 14-inch touch — TSh 650,000.
- HP EliteBook 820 G3: Core i5 6th Gen, 8GB DDR4 / 256GB SSD — TSh 580,000.
- HP ProDesk 600 G6 MT: Core i5 10th Gen, 16GB / 1TB HDD — TSh 930,000.
- HP EliteDesk 800 G5 SFF: Core i7, 8GB / 500GB HDD — 9th Gen TSh 580,000; 8th Gen TSh 630,000, exactly as supplied.
- Dell P2422H: latest supplied price TSh 370,000.
- Lenovo 27-inch Frameless Monitor: supplied black monitor photographs — TSh 680,000. Exact model code, resolution and connections were not supplied and are not invented.

## QA and behaviour

Run `npm test` with Node 24. The tests cover data consistency, public media ownership, price locks, all public product configurations, English/Kiswahili render contracts, product/flyer links, metadata, selection totals and mocked order notifications. Real email delivery and live browser/device layout remain deployment checks.

Selecting a configuration updates its processor, memory, storage, display, gallery, price, contact links and search metadata. The selection retains that configuration. Three older flyers with conflicting printed prices/configurations are archived from public browsing. Kiswahili uses the same typography as English, and the translated tagline remains in the footer.

The catalogue has 71 public product families and 32 held records. Original stock photography and model-reference photography are labelled separately; a photo cannot prove a fitted CPU, RAM amount or battery condition.

## Upload to the existing repository

Upload the loose root files and these five folders: `api`, `media-01`, `media-02`, `media-03`, `media-04`. Replace obsolete files from the earlier release instead of combining two releases. Keep `api/catalog.json` and `catalog.js` together.

Vercel framework preset: **Other**. No build command; no output directory. API functions are deployed by Vercel. The preview has not been deployed by this update.

WhatsApp / phone: +255746584214 / 0746 584 214. Notification email: scbernard004@gmail.com. Configure SMTP only through Vercel environment variables; credentials never belong in the repository.

After deployment, open `/sitemap.xml`, `/robots.txt`, product configuration links and the order fallback in the live environment. See `SEARCH-ENGINE-SETUP.txt` for search-engine registration.
