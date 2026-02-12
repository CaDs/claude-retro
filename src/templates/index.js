/**
 * Template auto-registration — imports all template modules and registers them
 * with the TemplateRegistry. Import this module once at startup.
 */
import { TemplateRegistry } from '../engine/TemplateRegistry.js';

// Fantasy templates
import * as fantasyTavern from './fantasy/tavern.js';
import * as fantasyVillageSquare from './fantasy/village_square.js';
import * as fantasyForestPath from './fantasy/forest_path.js';
import * as fantasyTempleRuins from './fantasy/temple_ruins.js';
import * as fantasyCastleHall from './fantasy/castle_hall.js';
import * as fantasyDungeonCell from './fantasy/dungeon_cell.js';
import * as fantasyMarketSquare from './fantasy/market_square.js';
import * as fantasyCaveEntrance from './fantasy/cave_entrance.js';

// Sci-Fi templates
import * as scifiShipBridge from './scifi/ship_bridge.js';
import * as scifiColonyHub from './scifi/colony_hub.js';
import * as scifiCorridor from './scifi/corridor.js';
import * as scifiCargoBay from './scifi/cargo_bay.js';
import * as scifiLabInterior from './scifi/lab_interior.js';
import * as scifiAlienPlanet from './scifi/alien_planet.js';
import * as scifiCantina from './scifi/cantina.js';
import * as scifiEngineRoom from './scifi/engine_room.js';

// Contemporary templates
import * as contemporaryApartment from './contemporary/apartment.js';
import * as contemporaryCityStreet from './contemporary/city_street.js';
import * as contemporaryOffice from './contemporary/office.js';
import * as contemporaryPark from './contemporary/park.js';
import * as contemporaryCafe from './contemporary/cafe.js';
import * as contemporarySubwayStation from './contemporary/subway_station.js';
import * as contemporaryWarehouse from './contemporary/warehouse.js';
import * as contemporaryParkingLot from './contemporary/parking_lot.js';

// 80s templates
import * as eightiesArcade from './eighties/arcade.js';
import * as eightiesMallInterior from './eighties/mall_interior.js';
import * as eightiesSuburbanStreet from './eighties/suburban_street.js';
import * as eightiesRecordStore from './eighties/record_store.js';
import * as eightiesDiner from './eighties/diner.js';
import * as eightiesVideoStore from './eighties/video_store.js';
import * as eightiesHighSchool from './eighties/high_school.js';
import * as eightiesBasement from './eighties/basement.js';

const allTemplates = [
  // Fantasy
  fantasyTavern,
  fantasyVillageSquare,
  fantasyForestPath,
  fantasyTempleRuins,
  fantasyCastleHall,
  fantasyDungeonCell,
  fantasyMarketSquare,
  fantasyCaveEntrance,
  // Sci-Fi
  scifiShipBridge,
  scifiColonyHub,
  scifiCorridor,
  scifiCargoBay,
  scifiLabInterior,
  scifiAlienPlanet,
  scifiCantina,
  scifiEngineRoom,
  // Contemporary
  contemporaryApartment,
  contemporaryCityStreet,
  contemporaryOffice,
  contemporaryPark,
  contemporaryCafe,
  contemporarySubwayStation,
  contemporaryWarehouse,
  contemporaryParkingLot,
  // 80s
  eightiesArcade,
  eightiesMallInterior,
  eightiesSuburbanStreet,
  eightiesRecordStore,
  eightiesDiner,
  eightiesVideoStore,
  eightiesHighSchool,
  eightiesBasement,
];

export function registerAllTemplates() {
  for (const mod of allTemplates) {
    if (mod.metadata && mod.generate) {
      TemplateRegistry.register(mod.metadata.id, {
        metadata: mod.metadata,
        generate: mod.generate,
      });
    }
  }
}
