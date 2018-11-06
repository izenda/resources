import 'izenda-external-libs';
import izendaDashboardModule from 'dashboard/module-definition';
import DashboardBackgroundService from 'dashboard/services/background-service';
import DashboardQueryService from 'dashboard/services/dashboard-query-service';
import DashboardGalleryService from 'dashboard/services/gallery-service';
import DashboardStorageService from 'dashboard/services/dashboard-storage-service';

// register services
DashboardBackgroundService.register(izendaDashboardModule);
DashboardQueryService.register(izendaDashboardModule);
DashboardGalleryService.register(izendaDashboardModule);
DashboardStorageService.register(izendaDashboardModule);

// register components and directives
import 'dashboard/directives/dashboard-background';
import 'dashboard/directives/tile-top-slider';
import 'dashboard/directives/toolbar-folder-menu-accordion';
import 'dashboard/directives/toolbar-links-panel';
import 'dashboard/components/tile/tile-draggable-directive';
import 'dashboard/components/tile/tile-flip-directive';
import 'dashboard/components/tile/tile-hover-directive';
import 'dashboard/components/tile/tile-resizable-directive';
import 'dashboard/components/tile-back/tile-back-component';
import 'dashboard/components/tile/tile-component';
import 'dashboard/components/filter/filter-component';
import 'dashboard/components/gallery/gallery-component';
import 'dashboard/components/dashboard/dashboard-component';
import 'dashboard/components/toolbar/toolbar-component';

