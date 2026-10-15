# Prompt 25 source and citation record

**Assessed:** 2026-10-13  
**Authority:** repository-owner selection of the existing `data/` inputs  
**Authoritative state:** `docs/build/PRODUCTION_DATA_ACQUISITION.json`

## Administrative boundaries

Selected artifact: `data/african_map.json`, SHA-256 `8ef3de3e1bcb846c405915fad33c03f1b38376d83e66ba6d8900681202da3c27`.

The artifact identifies its basemap as Natural Earth 1:10m, public domain. This build uses only its five-country admin-1 feature layer, with 97 deterministic zone IDs derived from ISO3 and the source name. The artifact was built on 2026-09-23, so it is not backdated as a historical 2025 boundary edition.

Citation and terms:

- Natural Earth, “Terms of Use”: <https://www.naturalearthdata.com/about/terms-of-use/>

The topology audit records two expected capital-region enclaves: Bamako/Koulikoro and Niamey/Tillabéri. The allocation policy selects the smallest enclosing zone for these overlaps and retains unmatched points at country level.

## Conflict evidence

Selected artifacts:

- ACLED event CSV, SHA-256 `acce392bb35cfcf7ee1f24c9fc4c6025be4480335e46c6a4acc3912ad51bf65b`, through 2025-09-26;
- ACLED Conflict Index workbook, SHA-256 `15b00d940213fa0c86e9894f225b6c09ce783b76b8003acdd7f88c7275723314`, through 2025-11-28.

The event CSV is the only conflict artifact admitted to the historical baseline. Its repeated `event_id_cnty` rows are deduplicated. Chad has no row and remains unknown. The workbook supplies five-country reference coverage only; it is not backdated.

Citations and terms:

- ACLED API endpoint documentation: <https://acleddata.com/api-documentation/acled-endpoint>
- ACLED EULA: <https://acleddata.com/eula>
- ACLED Content Usage Terms: <https://acleddata.com/contentusage>
- ACLED Attribution Policy: <https://acleddata.com/attributionpolicy>

The build does not expose raw ACLED rows. Any externally published result must be transformative/non-reversible and visibly attribute ACLED.

## Displacement

Selected evidence artifact: `data/IDMC_GIDD_Conflict_Internal_Displacement_Disaggregated.geojson`, SHA-256 `634c40803007f2f4779d6fd00f72f885ad02a7f0bc77b2b4c4d044dfb6dfc0ed`.

It contains zero features and is explicitly omitted. The absence of records is not converted to a displacement value.

Citation:

- IDMC Global Internal Displacement Database: <https://www.internal-displacement.org/database/>

## Finance and project status

Selected artifact: the finance layer inside `data/african_map.json`. It contains 2,874 rows and 265 rows for Mali, Burkina Faso, Niger, Chad, and Mauritania. Embedded metadata identifies AfDB and World Bank IATI 2.03 publishers and records freshness through 2026-09-18.

Citations:

- AfDB IATI publisher record: <https://iatiregistry.org/publisher/afdb>
- World Bank IATI publisher record: <https://iatiregistry.org/publisher/worldbank>
- IATI licensing guidance: <https://reference.iatistandard.org/en/guidance/publishing-data/what-data-to-publish/how-to-license-your-data/>

The artifact is admitted with limitations. Source IDs, publisher labels, status values, dates, units, nulls, and row grain must be preserved. The build does not sum incompatible commitment/disbursement measures or redistribute source rows.

## Explicit non-decisions

- No source is backdated.
- No missing event or displacement observation becomes zero.
- No ACLED raw row is republished.
- No current Natural Earth feature is described as an official historical administrative boundary.
- No licence statement grants rights beyond the cited source terms.
- No production baseline is claimed to exist merely because source compilation is now permitted.
