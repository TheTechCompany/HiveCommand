-- This is an empty migration.
ALTER TABLE "DeviceValue" SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = '"deviceId", placeholder, key',
    timescaledb.compress_orderby = 'id, "lastUpdated" DESC'
);

SELECT add_compression_policy('"DeviceValue"', INTERVAL '1 month');