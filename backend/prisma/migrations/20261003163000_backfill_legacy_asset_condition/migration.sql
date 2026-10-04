-- Preserve the known damage state when upgrading records that predate condition storage.
UPDATE "Asset" SET "condition" = 'DAMAGED' WHERE "status" = 'damaged' AND "condition" = 'GOOD';
