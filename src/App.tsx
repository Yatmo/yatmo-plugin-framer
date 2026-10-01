import { framer, useIsAllowedTo, type CodeFile } from "@framer/plugin"
import { useEffect, useState } from "react"
import { YATMO_CODE, YATMO_CODE_VERSION } from "./yatmoCode"
import "./App.css"

framer.showUI({ position: "top right", width: 300, height: 560, resizable: true })

const FILE_NAME = "Yatmo.tsx"
const COUNTRIES = ["BE", "FR", "NL", "LU", "CH", "DE", "IT", "ES", "PT", "IE", "UK", "AT", "CA", "GR", "MA", "AU", "HR", "MT", "SI", "RS", "CY", "BA", "ME", "BG", "AL"]
const LANGUAGES: Record<string, string> = { EN: "English", FR: "Français", NL: "Nederlands", DE: "Deutsch", IT: "Italiano", ES: "Español", PT: "Português", EL: "Ελληνικά", HR: "Hrvatski", SL: "Slovenščina", SR: "Srpski", BS: "Bosanski", SQ: "Shqip", MT: "Malti", TR: "Türkçe", BG: "Български", AR: "العربية", JA: "日本語" }
const STORAGE = "yatmo-plugin-settings"

type Settings = { licenseKey: string; country: string; language: string; address: string; latitude: string; longitude: string; marker: "pin" | "circle"; isochrone: "off" | "right" | "left"; mode: string }

const defaults: Settings = { licenseKey: "", country: "BE", language: "EN", address: "Rue de la Loi 16, 1000 Bruxelles", latitude: "", longitude: "", marker: "pin", isochrone: "right", mode: "overlay" }

function load(): Settings {
    try { return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE) ?? "{}") } } catch { return defaults }
}

/** The Yatmo code file of the project, created (or refreshed to the plugin's version) when needed. */
async function ensureCodeFile(): Promise<CodeFile> {
    const files = await framer.getCodeFiles()
    let file = files.find((f) => f.name === FILE_NAME)
    if (!file) {
        file = await framer.createCodeFile(FILE_NAME, YATMO_CODE)
    } else if (!file.content.includes(`version ${YATMO_CODE_VERSION}.`) && file.content.startsWith("// Yatmo for Framer")) {
        file = await file.setFileContent(YATMO_CODE)
    }
    // Exports appear once the file is compiled: wait a little for them.
    for (let i = 0; i < 20 && file.exports.length === 0; i++) {
        await new Promise((r) => setTimeout(r, 250))
        file = (await framer.getCodeFile(file.id)) ?? file
    }
    return file
}

export function App() {
    const [s, setS] = useState<Settings>(load)
    const [busy, setBusy] = useState<string | null>(null)
    const allowed = useIsAllowedTo("createCodeFile", "addComponentInstance")
    useEffect(() => { try { localStorage.setItem(STORAGE, JSON.stringify(s)) } catch { /* private mode */ } }, [s])

    const set = (key: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setS({ ...s, [key]: e.target.value })

    async function insert(component: "YatmoMap" | "YatmoPlaces" | "YatmoText") {
        setBusy(component)
        try {
            const file = await ensureCodeFile()
            const exp = file.exports.find((e) => e.type === "component" && e.name === component)
            if (!exp || exp.type !== "component") throw new Error(`${component} is not exported by ${FILE_NAME} yet, try again in a moment.`)
            const common = { licenseKey: s.licenseKey, country: s.country, language: s.language, address: s.address, latitude: s.latitude, longitude: s.longitude }
            const controls = component === "YatmoMap"
                ? { ...common, mode: s.mode, marker: s.marker, circleRadius: 300, isochrone: s.isochrone }
                : component === "YatmoPlaces" ? { ...common, categories: "education,transport,shopping" } : { ...common, titles: s.marker === "circle" ? "city" : "street-city" }
            await framer.addComponentInstance({ url: exp.insertURL, attributes: { controls } })
            framer.notify(`${component} added. Change its options in the properties panel.`, { variant: "success" })
        } catch (error) {
            framer.notify(error instanceof Error ? error.message : String(error), { variant: "error" })
        } finally {
            setBusy(null)
        }
    }

    return (
        <main>
            <p className="hint">Real estate map, nearest places and neighbourhood text for a property page. Needs a Yatmo key: <a href="https://yatmo.com" target="_blank" rel="noopener">yatmo.com</a>.</p>
            <label>Yatmo frontend key<input type="text" value={s.licenseKey} onChange={set("licenseKey")} placeholder="Add *.framercanvas.com and your domain to its allowed domains" /></label>
            <div className="row">
                <label>Country<select value={s.country} onChange={set("country")}>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select></label>
                <label>Language<select value={s.language} onChange={set("language")}>{Object.keys(LANGUAGES).map((l) => <option key={l} value={l}>{l} {LANGUAGES[l]}</option>)}</select></label>
            </div>
            <label>Property address<input type="text" value={s.address} onChange={set("address")} placeholder="Street, postcode, city" /></label>
            <div className="row">
                <label>Latitude<input type="text" value={s.latitude} onChange={set("latitude")} placeholder="optional" /></label>
                <label>Longitude<input type="text" value={s.longitude} onChange={set("longitude")} placeholder="optional" /></label>
            </div>
            <div className="row">
                <label>Marker<select value={s.marker} onChange={set("marker")}><option value="pin">Pin</option><option value="circle">Circle (discreet)</option></select></label>
                <label>Isochrones<select value={s.isochrone} onChange={set("isochrone")}><option value="off">Off</option><option value="right">Panel right</option><option value="left">Panel left</option></select></label>
            </div>
            <label>Layout<select value={s.mode} onChange={set("mode")}><option value="overlay">Map + summary</option><option value="overlay-scores">Map + scores</option><option value="map-top">Map above summary</option><option value="map">Map only</option><option value="summary">Summary only</option><option value="summary-tabs">Summary tabs</option></select></label>
            <div className="buttons">
                <button className="framer-button-primary" disabled={!allowed || busy !== null} onClick={() => insert("YatmoMap")}>{busy === "YatmoMap" ? "Adding…" : "Insert map"}</button>
                <button disabled={!allowed || busy !== null} onClick={() => insert("YatmoPlaces")}>{busy === "YatmoPlaces" ? "Adding…" : "Insert nearest places"}</button>
                <button disabled={!allowed || busy !== null} onClick={() => insert("YatmoText")}>{busy === "YatmoText" ? "Adding…" : "Insert neighbourhood text"}</button>
            </div>
            <p className="hint">The components live in <code>Yatmo.tsx</code> (Code panel). On a CMS page, bind <em>Address</em> to the collection field. Every option is in the properties panel. <a href="https://documentation.yatmo.com/plugins/framer" target="_blank" rel="noopener">Docs</a></p>
        </main>
    )
}
