/* Generated from contracts/mcp.json by scripts/sync-contracts.mjs. Do not edit. */
export const toolDefinitions = [
  {
    "name": "geo_data",
    "description": "Service status, dataset freshness, basemap catalog, elevation, contours, usage, and metrics. Operations: status, metrics, basemaps, elevation, terrain, contours, usage. Responses may include inline data or a result handle with summary metadata. Retrieve the payload separately when required.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "operation": {
          "type": "string",
          "enum": [
            "status",
            "metrics",
            "basemaps",
            "elevation",
            "terrain",
            "contours",
            "usage"
          ],
          "description": "status: Monitor service availability, dataset freshness, payment settlement readiness, and the engine and dataset versions behind each answer. metrics: Monitor performance and identify slow operations or stale datasets. basemaps: Configure tile sources and supported zoom levels before initializing a map. elevation: Retrieve terrain height and the raw model elevation at one coordinate. terrain: Display hillshading or 3D terrain using the catalog's tile template and zoom range. contours: Display elevation contours or analyze terrain relief around a coordinate. usage: Monitor consumption and remaining allowance before additional requests."
        },
        "window": {
          "type": "integer",
          "minimum": 1,
          "maximum": 1440,
          "default": 60,
          "description": "Minutes to measure over. (metrics)"
        },
        "lat": {
          "type": "number",
          "minimum": -85.05112878,
          "maximum": 85.05112878,
          "description": "Latitude in decimal degrees. (elevation)"
        },
        "lon": {
          "type": "number",
          "minimum": -180,
          "maximum": 180,
          "description": "Longitude in decimal degrees. (elevation)"
        },
        "z": {
          "type": "integer",
          "description": "Zoom, 0 to 15. (terrain)"
        },
        "x": {
          "type": "integer",
          "description": "Tile column. (terrain)"
        },
        "y": {
          "type": "integer",
          "description": "Tile row, with the .png suffix. (terrain)"
        },
        "zoom": {
          "type": "integer",
          "minimum": 6,
          "maximum": 13,
          "default": 9,
          "description": "Resolution. (contours)"
        },
        "bands": {
          "type": "integer",
          "minimum": 4,
          "maximum": 24,
          "default": 14,
          "description": "Requested band count. (contours)"
        }
      },
      "required": [
        "operation"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "openWorldHint": true
    },
    "_meta": {
      "mapsource/operations": {
        "status": {
          "id": "readServiceStatus",
          "method": "GET",
          "path": "https://api.mapsource.io/status",
          "quotaWeight": 0,
          "latencyClass": "instant",
          "deterministic": false
        },
        "metrics": {
          "id": "readMetrics",
          "method": "GET",
          "path": "https://api.mapsource.io/metrics",
          "quotaWeight": 0,
          "latencyClass": "fast",
          "deterministic": false
        },
        "basemaps": {
          "id": "readBasemapCatalog",
          "method": "GET",
          "path": "https://api.mapsource.io/tiles/catalog",
          "quotaWeight": 0,
          "latencyClass": "instant",
          "deterministic": true
        },
        "elevation": {
          "id": "sampleElevation",
          "method": "GET",
          "path": "https://api.mapsource.io/elevation",
          "quotaWeight": 1,
          "latencyClass": "fast",
          "deterministic": true
        },
        "terrain": {
          "id": "getTerrainTile",
          "method": "GET",
          "path": "https://api.mapsource.io/terrain/{z}/{x}/{y}.png",
          "quotaWeight": 1,
          "latencyClass": "fast",
          "deterministic": true
        },
        "contours": {
          "id": "generateContours",
          "method": "GET",
          "path": "https://api.mapsource.io/contours",
          "quotaWeight": 4,
          "latencyClass": "slow",
          "deterministic": true
        },
        "usage": {
          "id": "readUsage",
          "method": "GET",
          "path": "https://api.mapsource.io/usage",
          "quotaWeight": 0,
          "latencyClass": "instant",
          "deterministic": false
        }
      }
    }
  },
  {
    "name": "geo_style",
    "description": "Semantic basemap properties, style compilation, saved profiles, and revision management. Operations: explain, list, preview, save, intent, schema, revisions, diff, delete, fonts, upload_font. Responses may include inline data or a result handle with summary metadata. Retrieve the payload separately when required.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "operation": {
          "type": "string",
          "enum": [
            "explain",
            "list",
            "preview",
            "save",
            "intent",
            "schema",
            "revisions",
            "diff",
            "delete",
            "fonts",
            "upload_font"
          ],
          "description": "explain: Look up layer identifiers and properties when creating or editing a style. list: Select a preset or retrieve saved basemap profiles. preview: Validate and preview style changes before saving a profile. save: Store a style for subsequent retrieval, editing, and rendering. intent: Create an initial basemap style from a description, then review the proposed manifest. schema: Validate manifests locally or generate editor controls from the schema. revisions: Select a fixed revision for rendering or retrieve an earlier manifest. diff: Review property changes before applying a style revision. delete: Remove an unused profile or release capacity for a new profile. fonts: Check available font names before configuring label typography. upload_font: Add a custom label font and inspect its supported Unicode ranges."
        },
        "manifest": {
          "type": "object",
          "description": "A complete style manifest. (preview)"
        },
        "base": {
          "type": "string",
          "enum": [
            "light",
            "dark",
            "operations",
            "solarized-light",
            "solarized-dark",
            "mapsource"
          ],
          "description": "Preset to patch instead, which adds a diff to the response. (preview)"
        },
        "patch": {
          "type": "object",
          "description": "Semantic overrides merged onto the base. (preview)"
        },
        "include": {
          "type": "string",
          "enum": [
            "style",
            "summary"
          ],
          "description": "summary omits the compiled style. (preview)"
        },
        "name": {
          "type": "string",
          "maxLength": 120,
          "description": "Human name. (save)"
        },
        "slug": {
          "type": "string",
          "maxLength": 48,
          "description": "Stable URL id. Defaults to a slug of the name. (save)"
        },
        "description": {
          "type": "string",
          "maxLength": 400,
          "description": "Profile description. (save)"
        },
        "intent": {
          "type": "string",
          "minLength": 3,
          "maxLength": 2000,
          "description": "Text description of the desired basemap style. (intent)"
        },
        "save": {
          "type": "boolean",
          "default": false,
          "description": "Save the result as a profile revision on this key. (intent)"
        },
        "id": {
          "type": "string",
          "description": "Profile id or slug. (revisions)"
        },
        "from": {
          "type": "integer",
          "description": "Earlier revision. Defaults to the one before `to`. (diff)"
        },
        "to": {
          "type": "integer",
          "description": "Later revision. Defaults to the current one. (diff)"
        },
        "data": {
          "type": "string",
          "description": "The font file, base64-encoded. (upload_font)"
        },
        "license": {
          "type": "string",
          "maxLength": 200,
          "description": "Recorded with the font; not verified. (upload_font)"
        }
      },
      "required": [
        "operation"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "openWorldHint": true
    },
    "_meta": {
      "mapsource/operations": {
        "explain": {
          "id": "readBasemapContract",
          "method": "GET",
          "path": "https://api.mapsource.io/basemap/contract",
          "quotaWeight": 0,
          "latencyClass": "instant",
          "deterministic": true
        },
        "list": {
          "id": "listStyles",
          "method": "GET",
          "path": "https://api.mapsource.io/styles",
          "quotaWeight": 0,
          "latencyClass": "instant",
          "deterministic": true
        },
        "preview": {
          "id": "compileStyle",
          "method": "POST",
          "path": "https://api.mapsource.io/styles/compile",
          "quotaWeight": 2,
          "latencyClass": "fast",
          "deterministic": true
        },
        "save": {
          "id": "saveStyleProfile",
          "method": "POST",
          "path": "https://api.mapsource.io/styles/profiles",
          "quotaWeight": 2,
          "latencyClass": "fast",
          "deterministic": true
        },
        "intent": {
          "id": "generateStyleFromIntent",
          "method": "POST",
          "path": "https://api.mapsource.io/styles/intent",
          "quotaWeight": 2,
          "latencyClass": "fast",
          "deterministic": true
        },
        "schema": {
          "id": "readStyleSchema",
          "method": "GET",
          "path": "https://api.mapsource.io/styles/schema.json",
          "quotaWeight": 0,
          "latencyClass": "instant",
          "deterministic": true
        },
        "revisions": {
          "id": "listStyleRevisions",
          "method": "GET",
          "path": "https://api.mapsource.io/styles/{id}/revisions",
          "quotaWeight": 0,
          "latencyClass": "instant",
          "deterministic": true
        },
        "diff": {
          "id": "diffStyleRevisions",
          "method": "GET",
          "path": "https://api.mapsource.io/styles/{id}/diff",
          "quotaWeight": 0,
          "latencyClass": "instant",
          "deterministic": true
        },
        "delete": {
          "id": "deleteStyleProfile",
          "method": "DELETE",
          "path": "https://api.mapsource.io/styles/profiles/{id}",
          "quotaWeight": 1,
          "latencyClass": "instant",
          "deterministic": true
        },
        "fonts": {
          "id": "listFontstacks",
          "method": "GET",
          "path": "https://api.mapsource.io/glyphs",
          "quotaWeight": 0,
          "latencyClass": "instant",
          "deterministic": true
        },
        "upload_font": {
          "id": "uploadFont",
          "method": "POST",
          "path": "https://api.mapsource.io/fonts",
          "quotaWeight": 6,
          "latencyClass": "batch",
          "deterministic": true
        }
      }
    }
  },
  {
    "name": "geo_search",
    "description": "Local address, business and place lookup with map-focus bias; business discovery in viewports, polygons and isochrones with optional travel-time ranking; nearby and reverse lookup; OSM objects and entity resolution. Operations: overpass, resolve, entity, search, lookup, discover, autocomplete, nearby, reverse, details, geocode. Supported result handles: isochrone, analysis, feature_collection. Responses may include inline data or a result handle with summary metadata. Retrieve the payload separately when required.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "operation": {
          "type": "string",
          "enum": [
            "overpass",
            "resolve",
            "entity",
            "search",
            "lookup",
            "discover",
            "autocomplete",
            "nearby",
            "reverse",
            "details",
            "geocode"
          ],
          "description": "overpass: Query arbitrary OSM tags, spatial relationships, or topology using Overpass QL. resolve: Resolve a place once and reference its entity ID in subsequent operations. entity: Retrieve the name, center, and bounding box associated with an entity ID. search: Look up a populated place by name and retrieve its coordinates. lookup: Find an address, business, brand, landmark, street or populated place. Use a location qualifier such as Starbucks in Portland to search away from the map focus. discover: Find coffee within a 15-minute drive, list businesses in a map viewport, or filter POIs by an existing isochrone. Paginate bounded results; narrow the area when coverage.truncated is true. autocomplete: Provide place-name suggestions as a user types. nearby: Find nearby amenities, infrastructure, or named features around a coordinate. reverse: Retrieve a complete locally indexed postal address or place identity associated with a coordinate. details: Retrieve details for an OSM object identified by type and ID. geocode: Maintain an existing integration that requires the compatibility geocoder's response format."
        },
        "data": {
          "type": "string",
          "maxLength": 131072,
          "description": "A complete bounded QL program. (overpass)"
        },
        "q": {
          "type": "string",
          "minLength": 1,
          "maxLength": 120,
          "description": "The place name. (resolve)"
        },
        "lat": {
          "type": "number",
          "minimum": -85.05112878,
          "maximum": 85.05112878,
          "description": "Bias toward this latitude without hiding distant matches. (resolve)"
        },
        "lon": {
          "type": "number",
          "minimum": -180,
          "maximum": 180,
          "description": "Bias toward this longitude. (resolve)"
        },
        "limit": {
          "type": "integer",
          "minimum": 1,
          "maximum": 50,
          "default": 10,
          "description": "Maximum number of candidates. (resolve)"
        },
        "entityId": {
          "type": "string",
          "description": "An id from resolveEntity, beginning geo_. (entity)"
        },
        "class": {
          "type": "string",
          "enum": [
            "city",
            "town",
            "village",
            "suburb",
            "neighbourhood",
            "hamlet"
          ],
          "description": "Restrict to one class of populated place. (search)"
        },
        "language": {
          "type": "string",
          "default": "en",
          "description": "Preferred language code. Unavailable translations fall back to source names with a warning. (lookup)"
        },
        "types": {
          "type": "string",
          "description": "Comma-separated address,business,landmark,street,place filters. (lookup)"
        },
        "category": {
          "type": "string",
          "description": "Business/POI category or alias, such as coffee, pharmacy, restaurants, groceries, hotels, shops or parks. (lookup)"
        },
        "countrycodes": {
          "type": "string",
          "description": "Comma-separated two-letter country codes. Records without a source country code do not satisfy this filter. (lookup)"
        },
        "bbox": {
          "type": "string",
          "description": "west,south,east,north. A focus hint unless bounded=true; no dateline crossing. (lookup)"
        },
        "bounded": {
          "type": "boolean",
          "default": false,
          "description": "Restrict results to bbox. A bias point alone never requests this restriction. (lookup)"
        },
        "region": {
          "anyOf": [
            {
              "type": "string",
              "maxLength": 200
            },
            {
              "type": "object"
            }
          ],
          "description": "GeoJSON Polygon, MultiPolygon, polygon Feature/FeatureCollection, or an owned result-handle ID. Closed rings required; holes excluded. Maximum encoded coordinates: 100 KB. (discover)"
        },
        "minutes": {
          "type": "integer",
          "minimum": 1,
          "maximum": 30,
          "description": "Generate a reachable region from lat/lon. (discover)"
        },
        "costing": {
          "type": "string",
          "enum": [
            "auto",
            "bicycle",
            "pedestrian",
            "truck"
          ],
          "default": "auto",
          "description": "Travel mode for isochrone and matrix requests. (discover)"
        },
        "rankBy": {
          "type": "string",
          "enum": [
            "distance",
            "travel_time"
          ],
          "default": "distance",
          "description": "distance sorts from lat/lon or the region center. travel_time requires lat/lon, limit <=25 and offset=0; unreachable times remain null. (discover)"
        },
        "offset": {
          "type": "integer",
          "minimum": 0,
          "maximum": 2000,
          "default": 0,
          "description": "Offset into the bounded candidate results; re-query after dataset updates may change ordering. (discover)"
        },
        "radius": {
          "type": "integer",
          "minimum": 10,
          "maximum": 5000,
          "default": 500,
          "description": "Metres. (nearby)"
        },
        "osmType": {
          "type": "string",
          "enum": [
            "node",
            "way",
            "relation"
          ],
          "description": "node, way or relation. (details)"
        },
        "osmId": {
          "type": "integer",
          "minimum": 1,
          "description": "Positive OSM id. (details)"
        }
      },
      "required": [
        "operation"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "openWorldHint": true
    },
    "_meta": {
      "mapsource/operations": {
        "overpass": {
          "id": "queryOverpass",
          "method": "POST",
          "path": "https://api.mapsource.io/interpreter",
          "quotaWeight": 5,
          "latencyClass": "slow",
          "deterministic": false
        },
        "resolve": {
          "id": "resolveEntity",
          "method": "GET",
          "path": "https://api.mapsource.io/entities/resolve",
          "quotaWeight": 1,
          "latencyClass": "fast",
          "deterministic": true
        },
        "entity": {
          "id": "readEntity",
          "method": "GET",
          "path": "https://api.mapsource.io/entities/{entityId}",
          "quotaWeight": 1,
          "latencyClass": "fast",
          "deterministic": true
        },
        "search": {
          "id": "searchPlaces",
          "method": "GET",
          "path": "https://api.mapsource.io/places/search",
          "quotaWeight": 1,
          "latencyClass": "fast",
          "deterministic": true
        },
        "lookup": {
          "id": "lookupPlaces",
          "method": "GET",
          "path": "https://api.mapsource.io/places/lookup",
          "quotaWeight": 1,
          "latencyClass": "fast",
          "deterministic": false
        },
        "discover": {
          "id": "discoverPlaces",
          "method": "POST",
          "path": "https://api.mapsource.io/places/discover",
          "quotaWeight": 0,
          "latencyClass": "slow",
          "deterministic": false
        },
        "autocomplete": {
          "id": "autocompletePlaces",
          "method": "GET",
          "path": "https://api.mapsource.io/places/autocomplete",
          "quotaWeight": 1,
          "latencyClass": "fast",
          "deterministic": true
        },
        "nearby": {
          "id": "findNearby",
          "method": "GET",
          "path": "https://api.mapsource.io/places/nearby",
          "quotaWeight": 2,
          "latencyClass": "fast",
          "deterministic": false
        },
        "reverse": {
          "id": "reverseGeocode",
          "method": "GET",
          "path": "https://api.mapsource.io/places/reverse",
          "quotaWeight": 2,
          "latencyClass": "fast",
          "deterministic": false
        },
        "details": {
          "id": "readPlace",
          "method": "GET",
          "path": "https://api.mapsource.io/places/{osmType}/{osmId}",
          "quotaWeight": 1,
          "latencyClass": "fast",
          "deterministic": false
        },
        "geocode": {
          "id": "forwardGeocode",
          "method": "GET",
          "path": "https://api.mapsource.io/geocode",
          "quotaWeight": 2,
          "latencyClass": "slow",
          "deterministic": false
        }
      }
    }
  },
  {
    "name": "geo_navigate",
    "description": "Routing, travel-time matrices, isochrones, GPS trace matching, road-network snapping, and stop-order optimization. Operations: route, matrix, isochrone, map_match, snap, optimize. Supported result handles: place_collection, feature_collection. Responses may include inline data or a result handle with summary metadata. Retrieve the payload separately when required.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "operation": {
          "type": "string",
          "enum": [
            "route",
            "matrix",
            "isochrone",
            "map_match",
            "snap",
            "optimize"
          ],
          "description": "route: Retrieve route geometry, directions, distance, and travel time between waypoints. matrix: Compare destinations or build a travel-time matrix for analysis. isochrone: Calculate service areas, catchments, or accessibility within a travel-time limit. map_match: Match recorded travel coordinates to the road network. snap: Associate coordinates with road segments before routing or analysis. optimize: Plan stop sequences for delivery, fieldwork, or multi-stop travel."
        },
        "locations": {
          "type": "array",
          "minItems": 2,
          "maxItems": 10,
          "description": "Ordered waypoints; first is origin, last is destination. (route)"
        },
        "costing": {
          "type": "string",
          "enum": [
            "auto",
            "bicycle",
            "pedestrian",
            "truck",
            "motor_scooter",
            "bus"
          ],
          "default": "auto",
          "description": "Travel mode. (route)"
        },
        "elevation": {
          "type": "boolean",
          "default": false,
          "description": "Also return a terrain profile with gain and loss. (route)"
        },
        "sources": {
          "type": "array",
          "minItems": 1,
          "maxItems": 25,
          "description": "Origins. (matrix)"
        },
        "targets": {
          "type": "array",
          "maxItems": 25,
          "description": "Destinations. Omit for the square matrix of sources against themselves. (matrix)"
        },
        "entity": {
          "type": "string",
          "description": "An entity id to centre on, instead of lat and lon. (isochrone)"
        },
        "lat": {
          "type": "number",
          "minimum": -85.05112878,
          "maximum": 85.05112878,
          "description": "Latitude in decimal degrees. (isochrone)"
        },
        "lon": {
          "type": "number",
          "minimum": -180,
          "maximum": 180,
          "description": "Longitude in decimal degrees. (isochrone)"
        },
        "contours": {
          "type": "array",
          "minItems": 1,
          "maxItems": 4,
          "description": "Travel-time bands in minutes. (isochrone)"
        },
        "shape": {
          "type": "array",
          "minItems": 2,
          "maxItems": 1000,
          "description": "The trace, in order. (map_match)"
        },
        "shapeMatch": {
          "type": "string",
          "enum": [
            "map_snap",
            "edge_walk"
          ],
          "default": "map_snap",
          "description": "map_snap tolerates noise; edge_walk assumes the trace already follows the network. (map_match)"
        }
      },
      "required": [
        "operation"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "openWorldHint": true
    },
    "_meta": {
      "mapsource/operations": {
        "route": {
          "id": "computeRoute",
          "method": "POST",
          "path": "https://api.mapsource.io/route",
          "quotaWeight": 3,
          "latencyClass": "fast",
          "deterministic": false
        },
        "matrix": {
          "id": "computeMatrix",
          "method": "POST",
          "path": "https://api.mapsource.io/matrix",
          "quotaWeight": 8,
          "latencyClass": "slow",
          "deterministic": false
        },
        "isochrone": {
          "id": "computeIsochrone",
          "method": "POST",
          "path": "https://api.mapsource.io/isochrone",
          "quotaWeight": 6,
          "latencyClass": "slow",
          "deterministic": false
        },
        "map_match": {
          "id": "matchTrace",
          "method": "POST",
          "path": "https://api.mapsource.io/map-match",
          "quotaWeight": 5,
          "latencyClass": "slow",
          "deterministic": false
        },
        "snap": {
          "id": "snapPoints",
          "method": "POST",
          "path": "https://api.mapsource.io/snap",
          "quotaWeight": 2,
          "latencyClass": "fast",
          "deterministic": false
        },
        "optimize": {
          "id": "optimizeOrder",
          "method": "POST",
          "path": "https://api.mapsource.io/optimize",
          "quotaWeight": 8,
          "latencyClass": "slow",
          "deterministic": false
        }
      }
    }
  },
  {
    "name": "geo_analyze",
    "description": "Spatial measurements, geometry transformations, and multi-step processing pipelines. Operations: analyze, pipeline, result. Supported result handles: feature_collection, route, isochrone, analysis, place_collection, matrix. Responses may include inline data or a result handle with summary metadata. Retrieve the payload separately when required.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "operation": {
          "type": "string",
          "enum": [
            "analyze",
            "pipeline",
            "result"
          ],
          "description": "analyze: Measure or transform GeoJSON, coordinates, query results, and result handles. pipeline: Run dependent search, navigation, and analysis without downloading intermediate results. result: Download a result payload or inspect its metadata before further processing."
        },
        "a": {
          "type": "object",
          "description": "GeoJSON, a [lon, lat] pair, a query or places result, or a result handle. (analyze)"
        },
        "b": {
          "type": "object",
          "description": "Second operand, in the same forms as a. (analyze)"
        },
        "distance": {
          "type": "number",
          "minimum": 0,
          "maximum": 500000,
          "description": "Buffer radius or simplify tolerance. (analyze)"
        },
        "units": {
          "type": "string",
          "enum": [
            "meters",
            "kilometers",
            "miles"
          ],
          "default": "meters",
          "description": "Units for distance. (analyze)"
        },
        "pipeline": {
          "type": "array",
          "minItems": 1,
          "maxItems": 12,
          "description": "Ordered steps of {id, op, args}. (pipeline)"
        },
        "return": {
          "type": "string",
          "description": "Which step to return, as $stepId. Defaults to the last. (pipeline)"
        },
        "estimateOnly": {
          "type": "boolean",
          "default": false,
          "description": "Report the cost without executing. (pipeline)"
        },
        "id": {
          "type": "string",
          "description": "The handle id, rh_ followed by 32 hex characters. (result)"
        },
        "mode": {
          "type": "string",
          "enum": [
            "summary"
          ],
          "description": "summary returns the envelope without the payload. (result)"
        }
      },
      "required": [
        "operation"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "openWorldHint": true
    },
    "_meta": {
      "mapsource/operations": {
        "analyze": {
          "id": "analyzeGeometry",
          "method": "POST",
          "path": "https://api.mapsource.io/analyze",
          "quotaWeight": 2,
          "latencyClass": "fast",
          "deterministic": true
        },
        "pipeline": {
          "id": "runPipeline",
          "method": "POST",
          "path": "https://api.mapsource.io/compute",
          "quotaWeight": 10,
          "latencyClass": "batch",
          "deterministic": false
        },
        "result": {
          "id": "readResult",
          "method": "GET",
          "path": "https://api.mapsource.io/results/{id}",
          "quotaWeight": 1,
          "latencyClass": "instant",
          "deterministic": true
        }
      }
    }
  },
  {
    "name": "geo_render",
    "description": "Static PNG map rendering with styles, geometry overlays, and result handles. Operations: static. Supported result handles: feature_collection, route, isochrone, analysis, place_collection. Responses may include inline data or a result handle with summary metadata. Retrieve the payload separately when required.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "operation": {
          "type": "string",
          "enum": [
            "static"
          ],
          "description": "static: Generate static maps for reports, previews, and geographic visualizations."
        },
        "lat": {
          "type": "number",
          "minimum": -85.05112878,
          "maximum": 85.05112878,
          "description": "Viewport centre latitude. (static)"
        },
        "lon": {
          "type": "number",
          "minimum": -180,
          "maximum": 180,
          "description": "Viewport centre longitude. (static)"
        },
        "zoom": {
          "type": "number",
          "minimum": 0,
          "maximum": 19,
          "description": "Zoom level. (static)"
        },
        "bbox": {
          "type": "array",
          "description": "[west, south, east, north]; fits the viewport to it. (static)"
        },
        "width": {
          "type": "integer",
          "minimum": 64,
          "maximum": 2048,
          "default": 800,
          "description": "Image width. (static)"
        },
        "height": {
          "type": "integer",
          "minimum": 64,
          "maximum": 2048,
          "default": 600,
          "description": "Image height. (static)"
        },
        "style": {
          "type": "string",
          "default": "dark",
          "description": "dark or light composite raster; any other name is a preset or saved profile rendered as vector. (static)"
        },
        "styleRevision": {
          "type": "integer",
          "minimum": 1,
          "description": "Saved profile revision to use for rendering. (static)"
        },
        "bearing": {
          "type": "number",
          "minimum": -180,
          "maximum": 180,
          "default": 0,
          "description": "Vector renders only. (static)"
        },
        "pitch": {
          "type": "number",
          "minimum": 0,
          "maximum": 60,
          "default": 0,
          "description": "Vector renders only. (static)"
        },
        "geojson": {
          "type": "object",
          "description": "GeoJSON to draw, or a result handle. (static)"
        },
        "markers": {
          "type": "array",
          "maxItems": 50,
          "description": "Up to fifty markers with optional labels. (static)"
        }
      },
      "required": [
        "operation"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "openWorldHint": true
    },
    "_meta": {
      "mapsource/operations": {
        "static": {
          "id": "renderStaticMap",
          "method": "POST",
          "path": "https://api.mapsource.io/render/static",
          "quotaWeight": 8,
          "latencyClass": "batch",
          "deterministic": true
        }
      }
    }
  },
  {
    "name": "service_status",
    "description": "Read Overpass engine readiness, dataset timestamp, billing and payment mode. Free; use geo_data with operation status for the full subsystem report.",
    "inputSchema": {
      "type": "object",
      "properties": {},
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "openWorldHint": true
    },
    "_meta": {
      "mapsource/operation": "readServiceStatus"
    }
  },
  {
    "name": "basemap_catalog",
    "description": "Read raster and vector tile templates, source zoom ranges and attribution. The catalog is free; tile requests require a subscription key.",
    "inputSchema": {
      "type": "object",
      "properties": {},
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "openWorldHint": true
    },
    "_meta": {
      "mapsource/operation": "readBasemapCatalog"
    }
  },
  {
    "name": "elevation",
    "description": "Sample surface elevation at latitude and longitude, including the raw elevation reading and bathymetry tile reference. Requires a subscription key.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "lat": {
          "type": "number",
          "minimum": -85.05112878,
          "maximum": 85.05112878,
          "description": "Latitude in decimal degrees."
        },
        "lon": {
          "type": "number",
          "minimum": -180,
          "maximum": 180,
          "description": "Longitude in decimal degrees."
        }
      },
      "required": [
        "lat",
        "lon"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "openWorldHint": true
    },
    "_meta": {
      "mapsource/operation": "sampleElevation"
    }
  },
  {
    "name": "find_features",
    "description": "Find mapped features by category within an ordered bounding box at most 0.5 degrees per axis. Returns OSM geometry and tags, with a limit of 1 to 500 objects. Requires a subscription key or approved x402 payment.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "category": {
          "type": "string",
          "enum": [
            "cafes",
            "restaurants",
            "buildings",
            "parks",
            "schools",
            "hospitals",
            "transit_stops",
            "drinking_water",
            "trails"
          ],
          "description": "Mapped feature category."
        },
        "south": {
          "type": "number",
          "minimum": -85,
          "maximum": 85,
          "description": "Southern latitude."
        },
        "west": {
          "type": "number",
          "minimum": -180,
          "maximum": 180,
          "description": "Western longitude."
        },
        "north": {
          "type": "number",
          "minimum": -85,
          "maximum": 85,
          "description": "Northern latitude, greater than south by at most 0.5 degrees."
        },
        "east": {
          "type": "number",
          "minimum": -180,
          "maximum": 180,
          "description": "Eastern longitude, greater than west by at most 0.5 degrees."
        },
        "limit": {
          "type": "integer",
          "minimum": 1,
          "maximum": 500,
          "default": 100,
          "description": "Maximum returned OSM objects."
        },
        "responseMode": {
          "type": "string",
          "enum": [
            "compact",
            "handle",
            "raw"
          ],
          "default": "compact",
          "description": "compact returns small results inline and large results as a handle; handle requests a handle for authenticated callers; raw returns the full payload."
        }
      },
      "required": [
        "category",
        "south",
        "west",
        "north",
        "east"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "openWorldHint": true
    },
    "_meta": {
      "mapsource/operation": "queryOverpass"
    }
  },
  {
    "name": "route",
    "description": "Compute a route between 2 to 10 waypoints, with maneuver instructions and an optional terrain elevation profile. Requires a subscription key.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "locations": {
          "type": "array",
          "minItems": 2,
          "maxItems": 10,
          "description": "Ordered waypoints; first is origin, last is destination."
        },
        "costing": {
          "type": "string",
          "enum": [
            "auto",
            "bicycle",
            "pedestrian",
            "truck",
            "motor_scooter",
            "bus"
          ],
          "default": "auto",
          "description": "Travel mode."
        },
        "elevation": {
          "type": "boolean",
          "default": false,
          "description": "Also return a terrain profile with gain and loss."
        }
      },
      "required": [
        "locations"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "openWorldHint": true
    },
    "_meta": {
      "mapsource/operation": "computeRoute"
    }
  },
  {
    "name": "isochrone",
    "description": "Compute reachable-area polygons from one coordinate for up to four travel-time bands. Requires a subscription key.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "lat": {
          "type": "number",
          "minimum": -85.05112878,
          "maximum": 85.05112878,
          "description": "Latitude in decimal degrees."
        },
        "lon": {
          "type": "number",
          "minimum": -180,
          "maximum": 180,
          "description": "Longitude in decimal degrees."
        },
        "costing": {
          "type": "string",
          "enum": [
            "auto",
            "bicycle",
            "pedestrian",
            "truck",
            "motor_scooter",
            "bus"
          ],
          "default": "auto",
          "description": "Travel mode."
        },
        "contours": {
          "type": "array",
          "minItems": 1,
          "maxItems": 4,
          "description": "Travel-time bands in minutes."
        }
      },
      "required": [
        "lat",
        "lon"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "openWorldHint": true
    },
    "_meta": {
      "mapsource/operation": "computeIsochrone"
    }
  },
  {
    "name": "overpass_query",
    "description": "Execute a bounded Overpass QL query over OSM nodes, ways, relations, tags and geometry. Requires a subscription key or approved x402 payment; historical attic queries are not supported.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "minLength": 1,
          "maxLength": 131072,
          "description": "A complete bounded Overpass QL query."
        },
        "responseMode": {
          "type": "string",
          "enum": [
            "compact",
            "handle",
            "raw"
          ],
          "default": "compact",
          "description": "compact returns small results inline and large results as a handle; handle requests a handle for authenticated callers; raw returns the full payload."
        }
      },
      "required": [
        "query"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "openWorldHint": true
    },
    "_meta": {
      "mapsource/operation": "queryOverpass"
    }
  }
] as const;

export const toolNames = Object.freeze(toolDefinitions.map(tool => tool.name));
export type MapsourceToolName = (typeof toolNames)[number];
export type MapsourceToolDefinition = (typeof toolDefinitions)[number];
