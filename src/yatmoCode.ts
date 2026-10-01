/*
 * The code component the plugin writes into the project as `Yatmo.tsx`: three Framer components
 * (YatmoMap, YatmoPlaces, YatmoText) that render the Yatmo web components from their property
 * controls. The version line lets the plugin refresh the file when it ships a newer one.
 */
export const YATMO_CODE_VERSION = "1.0.0"

export const YATMO_CODE = `// Yatmo for Framer, version ${YATMO_CODE_VERSION}. Written by the Yatmo plugin; edit freely, the plugin only
// rewrites it when you ask. Docs: https://documentation.yatmo.com/plugins/framer
import { useEffect, useRef } from "react"
import { addPropertyControls, ControlType, type PropertyControls } from "framer"

const SCRIPT = "https://cdn.jsdelivr.net/npm/@yatmo/elements@1/dist/yatmo-elements.js"
const COUNTRIES = ["BE", "FR", "NL", "LU", "CH", "DE", "IT", "ES", "PT", "IE", "UK", "AT", "CA", "GR", "MA", "AU", "HR", "MT", "SI", "RS", "CY", "BA", "ME", "BG", "AL"]
const LANGUAGES = ["EN", "FR", "NL", "DE", "IT", "ES", "PT", "EL", "HR", "SL", "SR", "BS", "SQ", "MT", "TR", "BG", "AR", "JA"]

function loadElements() {
    if (typeof document === "undefined") return
    if (document.querySelector('script[data-yatmo-elements]')) return
    const script = document.createElement("script")
    script.type = "module"
    script.src = SCRIPT
    script.setAttribute("data-yatmo-elements", "")
    document.head.appendChild(script)
}

type Common = {
    licenseKey: string
    country: string
    language: string
    address: string
    latitude: string
    longitude: string
    style?: React.CSSProperties
}

function useYatmoElement(tag: string, attributes: Record<string, string | number | undefined>) {
    const ref = useRef<HTMLDivElement>(null)
    const serialized = JSON.stringify(attributes)
    useEffect(() => {
        loadElements()
        const host = ref.current
        if (!host) return
        const el = document.createElement(tag)
        for (const [name, value] of Object.entries(attributes)) {
            if (value !== undefined && value !== "" && value !== "off") el.setAttribute(name, String(value))
        }
        el.style.display = "block"
        el.style.height = "100%"
        host.replaceChildren(el)
    }, [tag, serialized])
    return ref
}

function location(p: Common) {
    const lat = p.latitude?.trim(), lng = p.longitude?.trim()
    return lat && lng ? { latitude: lat, longitude: lng } : { address: p.address?.trim() }
}

const commonControls: PropertyControls = {
    licenseKey: { type: ControlType.String, title: "Yatmo key", description: "Your frontend key, locked to your domains: https://documentation.yatmo.com/license", defaultValue: "" },
    country: { type: ControlType.Enum, title: "Country", options: COUNTRIES, defaultValue: "BE" },
    language: { type: ControlType.Enum, title: "Language", options: LANGUAGES, defaultValue: "EN" },
    address: { type: ControlType.String, title: "Address", description: "Located by Yatmo in the country. Bind it to a CMS field on a CMS page.", defaultValue: "Rue de la Loi 16, 1000 Bruxelles" },
    latitude: { type: ControlType.String, title: "Latitude", description: "With longitude, replaces the address", defaultValue: "" },
    longitude: { type: ControlType.String, title: "Longitude", defaultValue: "" },
}

/**
 * The interactive neighbourhood map of a property: points of interest, travel times, isochrones.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 800
 * @framerIntrinsicHeight 520
 */
export function YatmoMap(props: Common & { mode: string; zoom: number; mapStyle: string; accentColor: string; marker: string; circleRadius: number; rounded: number; isochrone: string; routeFrom: string }) {
    const ref = useYatmoElement("yatmo-map", {
        key: props.licenseKey, country: props.country, language: props.language, ...location(props),
        mode: props.mode, zoom: props.zoom, "map-style": props.mapStyle, "accent-color": props.accentColor,
        marker: props.marker, "circle-radius": props.marker === "circle" ? props.circleRadius : undefined,
        rounded: props.rounded || undefined, isochrone: props.isochrone, "route-from": props.routeFrom, height: "100%",
    })
    return <div ref={ref} style={{ width: "100%", height: "100%", ...props.style }} />
}

addPropertyControls(YatmoMap, {
    ...commonControls,
    mode: { type: ControlType.Enum, title: "Layout", options: ["overlay", "overlay-scores", "map-top", "map", "summary", "summary-tabs"], optionTitles: ["Map + summary", "Map + scores", "Map above summary", "Map only", "Summary only", "Summary tabs"], defaultValue: "overlay" },
    zoom: { type: ControlType.Number, title: "Zoom", min: 7, max: 20, step: 1, defaultValue: 15 },
    mapStyle: { type: ControlType.Enum, title: "Map style", options: ["1", "2", "3", "4", "5", "6", "7"], optionTitles: ["Liberty", "Basic", "Bright", "3D", "Positron", "Dark", "Liberty Stonehedge"], defaultValue: "1" },
    accentColor: { type: ControlType.Color, title: "Accent", defaultValue: "#428BFF" },
    marker: { type: ControlType.Enum, title: "Marker", options: ["pin", "circle"], optionTitles: ["Pin", "Circle (discreet)"], defaultValue: "pin" },
    circleRadius: { type: ControlType.Number, title: "Circle radius", min: 50, max: 2000, step: 50, defaultValue: 300, unit: "m", hidden: (p) => p.marker !== "circle" },
    rounded: { type: ControlType.Number, title: "Rounded", min: 0, max: 15, step: 1, defaultValue: 0, unit: "px" },
    isochrone: { type: ControlType.Enum, title: "Isochrones", options: ["off", "right", "left"], optionTitles: ["Off", "Panel right", "Panel left"], defaultValue: "off" },
    routeFrom: { type: ControlType.Enum, title: "Routes", options: ["off", "right", "left", "popup"], optionTitles: ["Off", "Panel right", "Panel left", "Popup only"], defaultValue: "off" },
})

/**
 * The nearest places by category with travel times, as headings and lists styled by your page.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 800
 */
export function YatmoPlaces(props: Common & { categories: string; travelMode: string; limit: number; heading: string }) {
    const ref = useYatmoElement("yatmo-pois", {
        key: props.licenseKey, country: props.country, language: props.language, ...location(props),
        categories: props.categories, mode: props.travelMode, limit: props.limit, heading: props.heading,
    })
    return <div ref={ref} style={{ width: "100%", ...props.style }} />
}

addPropertyControls(YatmoPlaces, {
    ...commonControls,
    categories: { type: ControlType.String, title: "Categories", description: "education, transport, shopping, tourism", defaultValue: "education,transport,shopping" },
    travelMode: { type: ControlType.Enum, title: "Travel time", options: ["walking", "bicycling", "driving", "transit"], optionTitles: ["Walking", "Bicycling", "Driving", "Public transport"], defaultValue: "walking" },
    limit: { type: ControlType.Number, title: "Per category", min: 1, max: 5, step: 1, defaultValue: 1 },
    heading: { type: ControlType.Enum, title: "Heading", options: ["h2", "h3", "h4"], defaultValue: "h3" },
})

/**
 * The written description of the neighbourhood: headings and paragraphs, key places in bold.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 800
 */
export function YatmoText(props: Common & { paragraphs: string; heading: string; titles: string }) {
    const ref = useYatmoElement("yatmo-text", {
        key: props.licenseKey, country: props.country, language: props.language, ...location(props),
        paragraphs: props.paragraphs, heading: props.heading, titles: props.titles,
    })
    return <div ref={ref} style={{ width: "100%", ...props.style }} />
}

addPropertyControls(YatmoText, {
    ...commonControls,
    paragraphs: { type: ControlType.String, title: "Paragraphs", description: "Empty = all. Among education, shopping, publictransports, transports, tourism, cities", defaultValue: "" },
    heading: { type: ControlType.Enum, title: "Heading", options: ["h2", "h3", "h4"], defaultValue: "h3" },
    titles: { type: ControlType.Enum, title: "Headings name", options: ["street-city", "city", "generic"], optionTitles: ["Street, then city", "City only (discreet)", "Neither"], defaultValue: "street-city" },
})
`
