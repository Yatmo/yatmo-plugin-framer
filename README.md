# Yatmo for Framer

Add real estate maps, points of interest and neighbourhood data to Framer websites.
This Framer plugin puts three code components in your project: **Yatmo Map** (an interactive map of the
surroundings of a property with schools, shops, public transport, real travel times on foot, by bike, by car
and by transit, isochrones), **Yatmo Places** (the nearest places by category with travel times) and
**Yatmo Text** (a written description of the neighbourhood). Give them an address, or bind the address to a
CMS field on a CMS page, and every property page gets its neighbourhood. 25 countries, 23 languages,
powered by [Yatmo](https://yatmo.com).

## Install in 5 minutes

1. Get a Yatmo licence key at [yatmo.com](https://yatmo.com) and add your Framer domains to the key's
   allowed domains: `*.framercanvas.com` (the canvas), `*.framer.app` or `*.framer.website` (free sites)
   and your custom domain ([keys explained](https://documentation.yatmo.com/license)).
2. Open the plugin (Plugins > Yatmo), paste the key, pick the country and the language, type a property
   address, and click **Insert map**, **Insert nearest places** or **Insert neighbourhood text**.
3. The plugin writes `Yatmo.tsx` in the Code panel once and adds instances of its components to the canvas.
   Every option (layout, zoom, map style, colour, pin or circle for discreet listings, isochrones, routes,
   categories, paragraphs, headings) is in the properties panel of each instance.
4. On a CMS page template, bind **Address** to the address field of the collection (or Latitude and
   Longitude to two number fields): one page, every property.

## Development

```bash
npm install
npm run dev      # then Framer > Plugins > Open development plugin
npm run build
npm run pack     # plugin.zip for the Marketplace submission
```

The components source is in `src/yatmoCode.ts`; bump `YATMO_CODE_VERSION` when it changes, the plugin
refreshes the project's `Yatmo.tsx` on the next insert.

## Links

- [Documentation](https://documentation.yatmo.com/plugins/framer), [Yatmo](https://yatmo.com)
- Other builders: [Webflow tutorial](https://documentation.yatmo.com/plugins/webflow), [WordPress](https://wordpress.org/plugins/yatmo-map/), [Odoo](https://apps.odoo.com/apps/modules/20.0/yatmo_map), [Drupal](https://github.com/Yatmo/yatmo-plugin-drupal)

MIT licence. Yatmo is a paid service for real estate portals, agency networks and developers; a licence key is required.
