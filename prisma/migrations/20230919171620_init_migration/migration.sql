-- CreateEnum
CREATE TYPE "ViolationType" AS ENUM ('SPEED', 'CATEGORY', 'NUMBER', 'LOCO_COUNT');

-- CreateTable
CREATE TABLE "applogs" (
    "id" SERIAL NOT NULL,
    "context" TEXT NOT NULL,
    "logarray" TEXT[],

    CONSTRAINT "applogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispatchers" (
    "id" SERIAL NOT NULL,
    "currentDuration" DOUBLE PRECISION NOT NULL,
    "dispatcherId" INTEGER NOT NULL,
    "dispatcherName" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL,
    "lastOnlineTimestamp" DOUBLE PRECISION NOT NULL,
    "region" TEXT NOT NULL,
    "stationHash" TEXT NOT NULL,
    "stationName" TEXT NOT NULL,
    "timestampFrom" DOUBLE PRECISION NOT NULL,
    "timestampTo" DOUBLE PRECISION,
    "dispatcherLevel" INTEGER,
    "dispatcherIsSupporter" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "dispatcherStatus" DOUBLE PRECISION NOT NULL DEFAULT -1,
    "dispatcherRate" INTEGER NOT NULL DEFAULT 0,
    "statusHistory" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hidden" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "dispatchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sceneries" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "SUP" BOOLEAN NOT NULL,
    "authors" TEXT,
    "availability" TEXT NOT NULL,
    "backupJSON" TEXT,
    "checkpoints" TEXT,
    "controlType" TEXT NOT NULL,
    "lines" TEXT,
    "project" TEXT,
    "reqLevel" INTEGER NOT NULL,
    "routes" TEXT,
    "routesInfo" JSONB[],
    "signalType" TEXT NOT NULL,
    "supportersOnly" BOOLEAN DEFAULT false,
    "url" TEXT,
    "projectUrl" TEXT,
    "hash" TEXT,
    "abbr" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "sceneries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetables" (
    "id" SERIAL NOT NULL,
    "allStopsCount" INTEGER NOT NULL,
    "authorId" INTEGER,
    "authorName" TEXT,
    "beginDate" TIMESTAMP(6) NOT NULL,
    "confirmedStopsCount" INTEGER NOT NULL,
    "currentDistance" DOUBLE PRECISION NOT NULL,
    "driverId" INTEGER NOT NULL,
    "driverName" TEXT NOT NULL,
    "endDate" TIMESTAMP(6) NOT NULL,
    "fulfilled" BOOLEAN NOT NULL,
    "route" TEXT NOT NULL,
    "routeDistance" DOUBLE PRECISION NOT NULL,
    "sceneriesString" TEXT NOT NULL,
    "scheduledBeginDate" TIMESTAMP(6) NOT NULL,
    "scheduledEndDate" TIMESTAMP(6) NOT NULL,
    "terminated" BOOLEAN NOT NULL,
    "timetableId" INTEGER NOT NULL,
    "trainCategoryCode" TEXT NOT NULL,
    "trainNo" INTEGER NOT NULL,
    "twr" BOOLEAN DEFAULT false,
    "skr" BOOLEAN DEFAULT false,
    "stockString" TEXT,
    "stockMass" INTEGER,
    "stockLength" INTEGER,
    "maxSpeed" INTEGER,
    "hashesString" TEXT,
    "currentSceneryName" TEXT,
    "currentSceneryHash" TEXT,
    "driverIsSupporter" BOOLEAN NOT NULL DEFAULT false,
    "driverLevel" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "stopsString" TEXT,
    "stockHistory" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "routeSceneries" TEXT,
    "checkpointArrivals" TIMESTAMP(3)[] DEFAULT (ARRAY[]::timestamp without time zone[])::timestamp(3) without time zone[],
    "checkpointDepartures" TIMESTAMP(3)[] DEFAULT (ARRAY[]::timestamp without time zone[])::timestamp(3) without time zone[],
    "checkpointArrivalsScheduled" TIMESTAMP(3)[] DEFAULT (ARRAY[]::timestamp without time zone[])::timestamp(3) without time zone[],
    "checkpointDeparturesScheduled" TIMESTAMP(3)[] DEFAULT (ARRAY[]::timestamp without time zone[])::timestamp(3) without time zone[],
    "checkpointStopTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "currentLocation" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "timetables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userlogs" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "changesBackup" JSONB NOT NULL,

    CONSTRAINT "userlogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roles" TEXT[],
    "profileUrl" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "violations" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "ViolationType" NOT NULL DEFAULT 'SPEED',
    "value" TEXT NOT NULL,
    "stationName" TEXT NOT NULL,
    "stationHash" TEXT NOT NULL,
    "timetableUID" INTEGER NOT NULL,

    CONSTRAINT "violations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td2dailystats" (
    "id" SERIAL NOT NULL,
    "datetime" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "driversMax" INTEGER NOT NULL,
    "dispatchersMax" INTEGER NOT NULL,
    "timetablesMax" INTEGER NOT NULL,
    "maxTimetable" TEXT,
    "mostActiveDispatchers" TEXT,
    "mostActiveDrivers" TEXT,
    "longestDuties" TEXT,
    "distanceAvg" INTEGER NOT NULL,
    "distanceSum" INTEGER NOT NULL,
    "totalTimetables" INTEGER NOT NULL,

    CONSTRAINT "td2dailystats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td2globalstats" (
    "id" SERIAL NOT NULL,
    "datetime" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avgSpeed" INTEGER NOT NULL,
    "rippedSwitches" INTEGER NOT NULL,
    "derailments" INTEGER NOT NULL,
    "skippedStopSignals" INTEGER NOT NULL,
    "radioStops" INTEGER NOT NULL,
    "kills" INTEGER NOT NULL,
    "drivenKilometers" INTEGER NOT NULL,
    "routedTrains" INTEGER NOT NULL,
    "dispatchers" INTEGER NOT NULL,
    "drivers" INTEGER NOT NULL,
    "timetables" INTEGER NOT NULL,

    CONSTRAINT "td2globalstats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td2players" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "whitelisted" BOOLEAN NOT NULL DEFAULT false,
    "blacklisted" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "td2players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stacjobotUsers" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "kofolaCount" INTEGER NOT NULL DEFAULT 1,
    "nextKofolaTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kofolaMotoracek" TEXT NOT NULL DEFAULT 'motosraczek3',

    CONSTRAINT "stacjobotUsers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "applogs_context_key" ON "applogs"("context");

-- CreateIndex
CREATE UNIQUE INDEX "dispatchers_id_key" ON "dispatchers"("id");

-- CreateIndex
CREATE UNIQUE INDEX "sceneries_id_key" ON "sceneries"("id");

-- CreateIndex
CREATE UNIQUE INDEX "sceneries_name_key" ON "sceneries"("name");

-- CreateIndex
CREATE UNIQUE INDEX "timetables_id_key" ON "timetables"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_name_key" ON "users"("name");

-- CreateIndex
CREATE UNIQUE INDEX "violations_id_key" ON "violations"("id");

-- CreateIndex
CREATE UNIQUE INDEX "td2dailystats_id_key" ON "td2dailystats"("id");

-- CreateIndex
CREATE UNIQUE INDEX "td2globalstats_id_key" ON "td2globalstats"("id");

-- CreateIndex
CREATE UNIQUE INDEX "td2players_id_key" ON "td2players"("id");

-- CreateIndex
CREATE UNIQUE INDEX "td2players_playerId_key" ON "td2players"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "stacjobotUsers_id_key" ON "stacjobotUsers"("id");

-- CreateIndex
CREATE UNIQUE INDEX "stacjobotUsers_userId_key" ON "stacjobotUsers"("userId");

-- AddForeignKey
ALTER TABLE "violations" ADD CONSTRAINT "violations_timetableUID_fkey" FOREIGN KEY ("timetableUID") REFERENCES "timetables"("id") ON DELETE CASCADE ON UPDATE CASCADE;
