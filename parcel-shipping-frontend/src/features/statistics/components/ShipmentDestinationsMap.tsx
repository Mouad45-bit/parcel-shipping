"use client";

import {
  type PointerEvent as ReactPointerEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  LocateFixed,
  MapPinned,
  Minus,
  Plus,
} from "lucide-react";
import {
  geoMercator,
  geoPath,
} from "d3-geo";
import { merge } from "topojson-client";
import worldCountries from "world-atlas/countries-110m.json";
import type {
  GeometryCollection,
  Topology,
} from "topojson-specification";
import { StatisticsChartCard } from "@/features/statistics/components/StatisticsChartCard";
import type {
  StatisticsDestinationItem,
  StatisticsShipment,
} from "@/features/statistics/types/statistics";
import { buildDestinationDistribution } from "@/features/statistics/utils/statistics-utils";

type ShipmentDestinationsMapProps = {
  shipments:
    readonly StatisticsShipment[];
};

type CountryProperties = {
  name?: string;
};

type WorldAtlasTopology = Topology<{
  countries:
    GeometryCollection<CountryProperties>;
}>;

type AreaGeometry = Extract<
  GeometryCollection<CountryProperties>["geometries"][number],
  {
    type:
      | "Polygon"
      | "MultiPolygon";
  }
>;

type MapPosition = {
  x: number;
  y: number;
};

type DragState = {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startPan: MapPosition;
};

const MAP_WIDTH = 640;
const MAP_HEIGHT = 310;

const MAP_CENTER_X =
  MAP_WIDTH / 2;

const MAP_CENTER_Y =
  MAP_HEIGHT / 2;

const MIN_ZOOM = 1;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.25;

const INITIAL_PAN: MapPosition = {
  x: 0,
  y: 0,
};

const moroccoDisplayIds =
  new Set([
    "504",
    "732",
  ]);

const worldTopology =
  worldCountries as unknown as WorldAtlasTopology;

const moroccoGeometries =
  worldTopology.objects.countries.geometries.filter(
    (
      country,
    ): country is AreaGeometry =>
      (
        country.type === "Polygon" ||
        country.type === "MultiPolygon"
      ) &&
      country.id !== undefined &&
      moroccoDisplayIds.has(
        String(country.id),
      ),
  );

const moroccoGeometry = merge(
  worldTopology,
  moroccoGeometries,
);

const projection = geoMercator()
  .fitExtent(
    [
      [105, 14],
      [
        MAP_WIDTH - 105,
        MAP_HEIGHT - 14,
      ],
    ],
    moroccoGeometry,
  );

const mapPath =
  geoPath(projection)(
    moroccoGeometry,
  ) ?? "";

function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.min(
    maximum,
    Math.max(minimum, value),
  );
}

function clampZoom(
  value: number,
): number {
  return clamp(
    value,
    MIN_ZOOM,
    MAX_ZOOM,
  );
}

function clampPan(
  position: MapPosition,
  zoom: number,
): MapPosition {
  const horizontalLimit =
    MAP_WIDTH *
    (
      0.15 +
      (zoom - MIN_ZOOM) * 0.25
    );

  const verticalLimit =
    MAP_HEIGHT *
    (
      0.15 +
      (zoom - MIN_ZOOM) * 0.25
    );

  return {
    x: clamp(
      position.x,
      -horizontalLimit,
      horizontalLimit,
    ),
    y: clamp(
      position.y,
      -verticalLimit,
      verticalLimit,
    ),
  };
}

function calculateMarkerRadius(
  count: number,
  maximumCount: number,
): number {
  if (maximumCount <= 1) {
    return 13;
  }

  return (
    9 +
    (count / maximumCount) * 7
  );
}

function projectDestination(
  destination:
    StatisticsDestinationItem,
  zoom: number,
  pan: MapPosition,
): MapPosition | null {
  const projectedPoint = projection([
    destination.longitude,
    destination.latitude,
  ]);

  if (!projectedPoint) {
    return null;
  }

  return {
    x:
      MAP_CENTER_X +
      (
        projectedPoint[0] -
        MAP_CENTER_X
      ) *
        zoom +
      pan.x,
    y:
      MAP_CENTER_Y +
      (
        projectedPoint[1] -
        MAP_CENTER_Y
      ) *
        zoom +
      pan.y,
  };
}

export function ShipmentDestinationsMap({
  shipments,
}: ShipmentDestinationsMapProps) {
  const [zoom, setZoom] =
    useState(MIN_ZOOM);

  const [pan, setPan] =
    useState<MapPosition>(
      INITIAL_PAN,
    );

  const [
    activeDestinationKey,
    setActiveDestinationKey,
  ] = useState<string | null>(
    null,
  );

  const dragStateRef =
    useRef<DragState | null>(
      null,
    );

  const destinations = useMemo(
    () =>
      buildDestinationDistribution(
        shipments,
      ),
    [shipments],
  );

  const maximumCount = useMemo(
    () =>
      destinations.reduce(
        (maximum, destination) =>
          Math.max(
            maximum,
            destination.count,
          ),
        0,
      ),
    [destinations],
  );

  const activeDestination =
    destinations.find(
      (destination) =>
        destination.key ===
        activeDestinationKey,
    ) ?? null;

  function zoomIn() {
    const nextZoom =
      clampZoom(
        zoom + ZOOM_STEP,
      );

    setZoom(nextZoom);

    setPan((currentPan) =>
      clampPan(
        currentPan,
        nextZoom,
      ),
    );
  }

  function zoomOut() {
    const nextZoom =
      clampZoom(
        zoom - ZOOM_STEP,
      );

    setZoom(nextZoom);

    setPan((currentPan) =>
      clampPan(
        currentPan,
        nextZoom,
      ),
    );
  }

  function resetMap() {
    setZoom(MIN_ZOOM);

    setPan({
      ...INITIAL_PAN,
    });
  }

  function handlePointerDown(
    event:
      ReactPointerEvent<SVGSVGElement>,
  ) {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();

    event.currentTarget.setPointerCapture(
      event.pointerId,
    );

    dragStateRef.current = {
      pointerId:
        event.pointerId,
      startClientX:
        event.clientX,
      startClientY:
        event.clientY,
      startPan: pan,
    };
  }

  function handlePointerMove(
    event:
      ReactPointerEvent<SVGSVGElement>,
  ) {
    const dragState =
      dragStateRef.current;

    if (
      !dragState ||
      dragState.pointerId !==
        event.pointerId
    ) {
      return;
    }

    const bounds =
      event.currentTarget
        .getBoundingClientRect();

    if (
      bounds.width === 0 ||
      bounds.height === 0
    ) {
      return;
    }

    const horizontalRatio =
      MAP_WIDTH / bounds.width;

    const verticalRatio =
      MAP_HEIGHT / bounds.height;

    const nextPan = {
      x:
        dragState.startPan.x +
        (
          event.clientX -
          dragState.startClientX
        ) *
          horizontalRatio,
      y:
        dragState.startPan.y +
        (
          event.clientY -
          dragState.startClientY
        ) *
          verticalRatio,
    };

    setPan(
      clampPan(
        nextPan,
        zoom,
      ),
    );
  }

  function finishDragging(
    event:
      ReactPointerEvent<SVGSVGElement>,
  ) {
    if (
      event.currentTarget
        .hasPointerCapture(
          event.pointerId,
        )
    ) {
      event.currentTarget
        .releasePointerCapture(
          event.pointerId,
        );
    }

    dragStateRef.current = null;
  }

  function renderMap(
    heightClassName: string,
  ) {
    const mapTransform = [
      `translate(${pan.x} ${pan.y})`,
      `translate(${MAP_CENTER_X} ${MAP_CENTER_Y})`,
      `scale(${zoom})`,
      `translate(${-MAP_CENTER_X} ${-MAP_CENTER_Y})`,
    ].join(" ");

    return (
      <div
        className={[
          "relative overflow-hidden rounded-lg border border-border bg-secondary/10",
          heightClassName,
        ].join(" ")}
      >
        <div
          aria-label="Map zoom controls"
          className="absolute left-3 top-3 z-10 flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm"
        >
          <button
            type="button"
            onClick={zoomIn}
            disabled={
              zoom >= MAX_ZOOM
            }
            aria-label="Zoom in"
            className="inline-flex size-9 cursor-pointer items-center justify-center border-b border-border text-primary transition hover:bg-secondary/35 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/20 disabled:pointer-events-none disabled:opacity-40"
          >
            <Plus size={17} />
          </button>

          <button
            type="button"
            onClick={zoomOut}
            disabled={
              zoom <= MIN_ZOOM
            }
            aria-label="Zoom out"
            className="inline-flex size-9 cursor-pointer items-center justify-center border-b border-border text-primary transition hover:bg-secondary/35 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/20 disabled:pointer-events-none disabled:opacity-40"
          >
            <Minus size={17} />
          </button>

          <button
            type="button"
            onClick={resetMap}
            disabled={
              zoom === MIN_ZOOM &&
              pan.x === 0 &&
              pan.y === 0
            }
            aria-label="Reset map position"
            className="inline-flex size-9 cursor-pointer items-center justify-center text-primary transition hover:bg-secondary/35 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/20 disabled:pointer-events-none disabled:opacity-40"
          >
            <LocateFixed size={16} />
          </button>
        </div>

        {activeDestination ? (
          <div
            role="status"
            className="pointer-events-none absolute right-3 top-3 z-10 rounded-lg border border-border bg-surface px-3 py-2 shadow-sm"
          >
            <p className="text-xs font-bold text-ink">
              {
                activeDestination.label
              }
            </p>

            <p className="mt-0.5 text-xs font-semibold text-primary">
              {
                activeDestination.count
              }{" "}
              {activeDestination.count ===
              1
                ? "shipment"
                : "shipments"}
            </p>
          </div>
        ) : null}

        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          role="img"
          aria-label="Interactive map showing shipment destinations. Drag to move the map."
          onPointerDown={
            handlePointerDown
          }
          onPointerMove={
            handlePointerMove
          }
          onPointerUp={
            finishDragging
          }
          onPointerCancel={
            finishDragging
          }
          onLostPointerCapture={() => {
            dragStateRef.current =
              null;
          }}
          className="h-full w-full touch-none cursor-grab select-none active:cursor-grabbing"
        >
          <g
            transform={mapTransform}
          >
            <path
              d={mapPath}
              fill="#f2e8e1"
              stroke="#5c3317"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
          </g>

          {destinations.map(
            (destination) => {
              const point =
                projectDestination(
                  destination,
                  zoom,
                  pan,
                );

              if (!point) {
                return null;
              }

              const radius =
                calculateMarkerRadius(
                  destination.count,
                  maximumCount,
                );

              const isActive =
                destination.key ===
                activeDestinationKey;

              return (
                <g
                  key={
                    destination.key
                  }
                  transform={`translate(${point.x} ${point.y})`}
                  tabIndex={0}
                  role="img"
                  aria-label={`${destination.label}: ${destination.count} ${
                    destination.count === 1
                      ? "shipment"
                      : "shipments"
                  }`}
                  onMouseEnter={() =>
                    setActiveDestinationKey(
                      destination.key,
                    )
                  }
                  onMouseLeave={() =>
                    setActiveDestinationKey(
                      null,
                    )
                  }
                  onFocus={() =>
                    setActiveDestinationKey(
                      destination.key,
                    )
                  }
                  onBlur={() =>
                    setActiveDestinationKey(
                      null,
                    )
                  }
                  className="cursor-pointer outline-none"
                >
                  {isActive ? (
                    <circle
                      r={radius + 5}
                      fill="none"
                      stroke="#5c3317"
                      strokeWidth={2}
                      opacity={0.35}
                    />
                  ) : null}

                  <circle
                    r={radius}
                    fill="#5c3317"
                    stroke="#ffffff"
                    strokeWidth={3}
                    className="transition-opacity hover:opacity-90"
                  />

                  <text
                    y={4}
                    textAnchor="middle"
                    fill="#ffdab9"
                    fontSize={11}
                    fontWeight={700}
                    pointerEvents="none"
                  >
                    {
                      destination.count
                    }
                  </text>
                </g>
              );
            },
          )}
        </svg>
      </div>
    );
  }

  return (
    <StatisticsChartCard
      icon={MapPinned}
      title="Shipment destinations"
      description="Geographical distribution of shipment destinations."
      isEmpty={
        destinations.length === 0
      }
      emptyMessage="No mapped destination matches the current filters."
      expandedContent={renderMap(
        "h-[min(68vh,620px)]",
      )}
    >
      {renderMap("h-[310px]")}

      <ul className="sr-only">
        {destinations.map(
          (destination) => (
            <li
              key={
                destination.key
              }
            >
              {destination.label}:{" "}
              {destination.count}{" "}
              {destination.count === 1
                ? "shipment"
                : "shipments"}
            </li>
          ),
        )}
      </ul>
    </StatisticsChartCard>
  );
}